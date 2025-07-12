import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from orders.models import EmailAccount, Order, OrderProcessingLog
from .gmail_service import GmailService
from .order_parsers import order_parser_factory

User = get_user_model()
logger = logging.getLogger(__name__)

def process_user_emails_task(user_id):
    """Process emails for a specific user"""
    try:
        user = User.objects.get(id=user_id)
        email_accounts = EmailAccount.objects.filter(user=user, is_connected=True)

        if not email_accounts.exists():
            logger.warning(f"No connected email accounts for user {user.username}")
            return {'error': 'No connected email accounts found'}

        total_processed = 0
        total_errors = 0
        accounts_processed = 0

        for email_account in email_accounts:
            try:
                result = process_email_account(email_account)
                total_processed += result.get('processed', 0)
                total_errors += result.get('errors', 0)
                accounts_processed += 1

            except Exception as e:
                logger.error(f"Error processing email account {email_account.email}: {e}")
                total_errors += 1

                OrderProcessingLog.objects.create(
                    user=user,
                    email_account=email_account,
                    log_type='error',
                    message=f"Failed to process email account: {str(e)}"
                )

        return {
            'total_processed': total_processed,
            'total_errors': total_errors,
            'accounts_processed': accounts_processed
        }

    except User.DoesNotExist:
        logger.error(f"User {user_id} not found")
        return {'error': 'User not found'}
    except Exception as e:
        logger.error(f"Error in process_user_emails_task: {e}")
        return {'error': str(e)}


def process_email_account(email_account):
    """Process emails for a specific email account"""
    processed_count = 0
    error_count = 0

    try:
        gmail_service = GmailService(email_account)
        gmail_service.authenticate()

        since_date = datetime(2025, 5, 20)

        messages = gmail_service.get_messages(max_results=50, since_date=since_date)
        messages.reverse()
        logger.info(f"Found {len(messages)} messages for {email_account.email}")

        for message_info in messages:
            try:
                if Order.objects.filter(email_message_id=message_info['id']).exists():
                    continue

                message = gmail_service.get_message_details(message_info['id'])
                email_data = gmail_service.extract_message_data(message)

                if not email_data:
                    continue

                # Identify platform and log it
                platform = order_parser_factory.identify_platform(email_data['body'], email_data.get('sender'))
                logger.info(f"Identified platform: {platform} for message {message_info['id']}")

                order_data = order_parser_factory.parse_order(email_data['body'], email_data)

                if order_data:
                    order = save_order_to_database(email_account, order_data, email_data)

                    if order:
                        processed_count += 1
                        gmail_service.mark_as_processed(message_info['id'])

                        OrderProcessingLog.objects.create(
                            user=email_account.user,
                            email_account=email_account,
                            message_id=message_info['id'],
                            log_type='success',
                            message=f"Successfully processed order {order.order_id}",
                            details={'order_id': order.order_id, 'vendor': order.vendor}
                        )
                else:
                    logger.warning(f"Could not parse order for message ID: {message_info['id']} | Subject: {email_data.get('subject')}")
                    OrderProcessingLog.objects.create(
                        user=email_account.user,
                        email_account=email_account,
                        message_id=message_info['id'],
                        log_type='warning',
                        message="Could not parse order from email",
                        details={'subject': email_data.get('subject', 'N/A')}
                    )

            except Exception as e:
                error_count += 1
                logger.error(f"Error processing message {message_info['id']}: {e}")

                OrderProcessingLog.objects.create(
                    user=email_account.user,
                    email_account=email_account,
                    message_id=message_info.get('id'),
                    log_type='error',
                    message=f"Error processing message: {str(e)}"
                )

        logger.info(f"Processed {processed_count} orders, {error_count} errors for {email_account.email}")

        return {
            'processed': processed_count,
            'errors': error_count
        }

    except Exception as e:
        logger.error(f"Error processing email account {email_account.email}: {e}")
        raise


def save_order_to_database(email_account, order_data, email_data):
    """Save parsed order data to database"""
    try:
        booking_date = None
        delivery_date = None
        email_date = None

        if order_data.get('BookingDate'):
            try:
                booking_date = datetime.fromisoformat(order_data['BookingDate'])
            except:
                pass

        if order_data.get('DeliveryDate') or order_data.get('Delivery_Date'):
            try:
                delivery_date = datetime.fromisoformat(
                    order_data.get('DeliveryDate') or order_data.get('Delivery_Date')
                )
            except:
                pass

        if email_data.get('date'):
            try:
                email_date = datetime.fromisoformat(email_data['date'])
            except:
                pass

        customer_name = None
        customer_phone = None
        customer_details = order_data.get('Customer_Details', '')

        if customer_details and ' - ' in customer_details:
            parts = customer_details.split(' - ')
            if len(parts) >= 2:
                customer_name = parts[0].strip()
                customer_phone = parts[1].strip()

        train_number = None
        train_name = None
        train_station = order_data.get('TrainStation', '')

        if '/' in train_station:
            train_parts = train_station.split('/')
            if len(train_parts) >= 2:
                train_number = train_parts[0].strip()
                train_name = train_parts[1].split('\n')[0].strip()

        vendor_mapping = {
            'Zoop': 'zoop',
            'Spicy Wagon': 'spicy_wagon',
            'Yatri Restro': 'yatri_restro',
            'RajBhog Khana': 'rajbhog_khana',
        }

        vendor = vendor_mapping.get(order_data.get('Vendor'), 'unknown')

        payment_type_mapping = {
            'Paid Online': 'online',
            'Online': 'online',
            'Cash on Delivery': 'cod',
            'COD': 'cod',
        }

        payment_type = payment_type_mapping.get(
            order_data.get('Paymenttype') or
            order_data.get('Payment type') or
            order_data.get('Payment_type'),
            'online'
        )

        order = Order.objects.create(
            user=email_account.user,
            email_account=email_account,
            vendor=vendor,
            order_id=order_data.get('OrderID', ''),
            booking_date=booking_date,
            delivery_date=delivery_date,
            customer_name=customer_name,
            customer_phone=customer_phone,
            customer_details=customer_details,
            train_number=train_number,
            train_name=train_name,
            train_station=train_station,
            station=order_data.get('Station', ''),
            sub_total=order_data.get('Sub_Total'),
            gst=order_data.get('GST'),
            delivery_charges=order_data.get('Delivery_Charges'),
            grand_total=order_data.get('Grand_Total'),
            payment_type=payment_type,
            item_details=order_data.get('Item_Details', ''),
            item_description=order_data.get('Item_Description', ''),
            booked_from=order_data.get('Booked_From', ''),
            email_message_id=email_data['message_id'],
            email_thread_id=email_data.get('thread_id'),
            email_subject=email_data.get('subject'),
            email_sender=email_data.get('sender'),
            email_date=email_date,
            raw_email_body=email_data.get('body', ''),
        )

        logger.info(f"Created order {order.order_id} for user {email_account.user.username}")
        return order

    except Exception as e:
        logger.error(f"Error saving order to database: {e}")
        raise