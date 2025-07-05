import logging
from datetime import datetime, timedelta
from celery import shared_task
from django.utils import timezone
from django.db import transaction
from django.conf import settings
from accounts.models import CustomUser, EmailAccount
from orders.models import Order
from .gmail_service import EnhancedGmailService
from .order_parsers import order_parser_factory

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def process_user_emails_task(self, user_id, specific_account_id=None):
    """
    Process emails for a specific user, optionally for a specific email account
    Enhanced to fetch last 100 emails as requested
    """
    try:
        user = CustomUser.objects.get(id=user_id)
        logger.info(f"Starting email processing for user: {user.username}")
        
        # Get email accounts to process
        email_accounts = EmailAccount.objects.filter(
            user=user,
            is_connected=True
        )
        
        if specific_account_id:
            email_accounts = email_accounts.filter(id=specific_account_id)
        
        if not email_accounts.exists():
            logger.warning(f"No connected email accounts found for user {user.id}")
            return {"status": "warning", "message": "No connected email accounts"}
        
        total_processed = 0
        total_errors = 0
        results = {}
        
        for email_account in email_accounts:
            try:
                result = process_email_account(email_account, user)
                results[email_account.email] = result
                total_processed += result.get('processed', 0)
                total_errors += result.get('errors', 0)
                
            except Exception as e:
                logger.error(f"Error processing account {email_account.email}: {e}")
                total_errors += 1
                results[email_account.email] = {
                    "status": "error",
                    "message": str(e),
                    "processed": 0,
                    "errors": 1
                }
        
        final_result = {
            "status": "success",
            "user_id": user_id,
            "total_processed": total_processed,
            "total_errors": total_errors,
            "accounts_processed": len(results),
            "results": results
        }
        
        logger.info(f"Email processing completed for user {user.id}: {final_result}")
        return final_result
        
    except CustomUser.DoesNotExist:
        logger.error(f"User {user_id} not found")
        return {"status": "error", "message": "User not found"}
    except Exception as e:
        logger.error(f"Email processing task failed for user {user_id}: {e}")
        # Retry the task with exponential backoff
        countdown = min(60 * (2 ** self.request.retries), 300)  # Max 5 minutes
        raise self.retry(countdown=countdown, exc=e)

def process_email_account(email_account, user):
    """
    Process emails for a specific email account
    Enhanced to fetch up to 100 emails as requested
    """
    try:
        logger.info(f"Processing emails for account: {email_account.email}")
        gmail_service = EnhancedGmailService(email_account)
        
        # Authenticate first
        try:
            gmail_service.authenticate()
        except Exception as auth_error:
            logger.error(f"Authentication failed for {email_account.email}: {auth_error}")
            email_account.is_connected = False
            email_account.save()
            raise Exception(f"Authentication failed: {auth_error}")
        
        # Determine the date range for fetching emails
        since_date = None
        if email_account.last_sync:
            # Get emails since last sync minus 2 hours for overlap
            since_date = email_account.last_sync - timedelta(hours=2)
        else:
            # First sync - get emails from last 30 days to catch previous orders
            since_date = timezone.now() - timedelta(days=30)
        
        # Get messages - fetch up to 100 as requested
        try:
            messages = gmail_service.get_messages(
                max_results=100,  # Fetch last 100 emails as requested
                since_date=since_date
            )
        except Exception as fetch_error:
            logger.error(f"Failed to fetch messages for {email_account.email}: {fetch_error}")
            raise Exception(f"Failed to fetch messages: {fetch_error}")
        
        if not messages:
            gmail_service.update_last_sync()
            logger.info(f"No new messages found for {email_account.email}")
            return {"status": "success", "processed": 0, "errors": 0, "total_messages": 0}
        
        processed_count = 0
        error_count = 0
        
        logger.info(f"Processing {len(messages)} messages for {email_account.email}")
        
        for message in messages:
            try:
                # Get message details
                message_data = gmail_service.get_message_details(message['id'])
                if not message_data:
                    continue
                    
                email_data = gmail_service.extract_message_data(message_data)
                
                if not email_data or not email_data.get('body'):
                    logger.debug(f"No email data or body for message {message['id']}")
                    continue
                
                # Check if order already exists based on message ID
                existing_order = Order.objects.filter(
                    user=user,
                    email_account=email_account,
                    message_id=message['id']
                ).first()
                
                if existing_order:
                    logger.debug(f"Order already exists for message {message['id']}")
                    continue
                
                # Parse order
                order_data = order_parser_factory.parse_order(
                    email_data['body'],
                    email_data
                )
                
                if not order_data:
                    logger.debug(f"Could not parse order from message {message['id']}")
                    continue
                
                # Validate required fields
                if not order_data.get('Order_No'):
                    logger.debug(f"No order number found in message {message['id']}")
                    continue
                
                # Save to database with user association
                with transaction.atomic():
                    order = Order.objects.create(
                        user=user,
                        email_account=email_account,
                        message_id=message['id'],
                        email_date=order_data.get('email_date'),
                        sender=order_data.get('sender'),
                        subject=order_data.get('subject'),
                        Order_No=order_data.get('Order_No'),
                        Customer_Name=order_data.get('Customer_Name'),
                        Mobile_No=order_data.get('Mobile_No'),
                        Item_Details=order_data.get('Item_Details'),
                        Item_Description=order_data.get('Item_Description'),
                        Sub_Total=order_data.get('Sub_Total'),
                        Delivery_Charges=order_data.get('Delivery_Charges'),
                        GST=order_data.get('GST'),
                        Grand_Total=order_data.get('Grand_Total'),
                        Pay_Mode=order_data.get('Pay_Mode'),
                        Delivery_Date=order_data.get('Delivery_Date'),
                        Station=order_data.get('Station'),
                        Train_No_Name=order_data.get('Train_No_Name'),
                        Train_No=order_data.get('Train_No'),
                        Coach=order_data.get('Coach'),
                        platform=order_data.get('platform'),
                    )
                
                # Mark email as processed
                gmail_service.mark_as_processed(message['id'])
                
                processed_count += 1
                logger.info(f"Successfully processed order: {order.Order_No} for user {user.id}")
                
            except Exception as e:
                error_count += 1
                logger.error(f"Error processing message {message.get('id', 'unknown')} for user {user.id}: {e}")
                continue
        
        # Update last sync time
        gmail_service.update_last_sync()
        
        result = {
            "status": "success",
            "processed": processed_count,
            "errors": error_count,
            "total_messages": len(messages),
            "account_email": email_account.email
        }
        
        logger.info(f"Email processing completed for {email_account.email}: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Error processing email account {email_account.email}: {e}")
        # Mark account as disconnected if authentication fails
        if "authentication" in str(e).lower() or "unauthorized" in str(e).lower():
            email_account.is_connected = False
            email_account.save()
        raise

@shared_task
def scheduled_email_processing():
    """
    Scheduled task to process emails for all users with auto-sync enabled
    Runs every minute to ensure continuous processing
    """
    logger.info("Starting scheduled email processing for all users")
    
    # Get all email accounts with auto-sync enabled and connected
    email_accounts = EmailAccount.objects.filter(
        is_connected=True,
        auto_sync_enabled=True
    ).select_related('user')
    
    processed_users = set()
    results = []
    
    for email_account in email_accounts:
        # Skip if we've already processed this user in this run
        if email_account.user.id in processed_users:
            continue
        
        try:
            # Check if it's time to sync based on frequency (default 1 minute)
            if email_account.last_sync:
                next_sync = email_account.last_sync + timedelta(minutes=email_account.sync_frequency)
                if timezone.now() < next_sync:
                    continue
            
            # Process user's emails asynchronously
            result = process_user_emails_task.delay(email_account.user.id)
            results.append({
                'user_id': email_account.user.id,
                'username': email_account.user.username,
                'task_id': result.id
            })
            processed_users.add(email_account.user.id)
            
        except Exception as e:
            logger.error(f"Error scheduling email processing for user {email_account.user.id}: {e}")
    
    logger.info(f"Scheduled email processing for {len(results)} users")
    return {
        "scheduled_users": len(results),
        "results": results
    }

@shared_task
def refresh_expired_tokens():
    """
    Task to refresh expired Gmail tokens to maintain connection
    """
    logger.info("Starting token refresh task")
    
    # Get accounts with tokens that will expire in the next hour
    one_hour_from_now = timezone.now() + timedelta(hours=1)
    accounts_to_refresh = EmailAccount.objects.filter(
        is_connected=True,
        token_expiry__lt=one_hour_from_now,
        refresh_token__isnull=False
    )
    
    refreshed_count = 0
    failed_count = 0
    
    for account in accounts_to_refresh:
        try:
            gmail_service = EnhancedGmailService(account)
            if gmail_service._refresh_token():
                refreshed_count += 1
                logger.info(f"Token refreshed for {account.email}")
            else:
                failed_count += 1
                logger.error(f"Failed to refresh token for {account.email}")
        except Exception as e:
            failed_count += 1
            logger.error(f"Error refreshing token for {account.email}: {e}")
    
    return {
        "refreshed": refreshed_count,
        "failed": failed_count,
        "total_checked": accounts_to_refresh.count()
    }

@shared_task
def cleanup_old_orders(days=90):
    """
    Clean up old orders to prevent database bloat
    """
    try:
        cutoff_date = timezone.now() - timedelta(days=days)
        deleted_count = Order.objects.filter(
            processed_at__lt=cutoff_date
        ).delete()[0]
        
        logger.info(f"Cleaned up {deleted_count} old orders")
        return {"status": "success", "deleted_count": deleted_count}
        
    except Exception as e:
        logger.error(f"Error cleaning up old orders: {e}")
        return {"status": "error", "message": str(e)}

# Backwards compatibility - alias for the old function name
process_emails_task = process_user_emails_task