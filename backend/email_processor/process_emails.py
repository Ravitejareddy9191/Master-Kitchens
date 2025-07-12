import logging
from django.core.management.base import BaseCommand
from email_processor.tasks import process_user_emails_task
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Process emails from Gmail and extract order information'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='Process emails for specific user ID'
        )
        parser.add_argument(
            '--query',
            type=str,
            default='',
            help='Gmail query to filter emails (e.g., "from:zoop.com")'
        )
        parser.add_argument(
            '--max-results',
            type=int,
            default=50,
            help='Maximum number of emails to process'
        )
        parser.add_argument(
            '--platform',
            type=str,
            choices=['zoop', 'spicy_wagon', 'yatri_restro', 'rajbhog_khana'],
            help='Process emails from specific platform only'
        )

    def handle(self, *args, **options):
        user_id = options.get('user_id')
        query = options['query']
        max_results = options['max_results']
        platform = options['platform']

        try:
            if user_id:
                # Verify user exists
                try:
                    user = User.objects.get(id=user_id)
                    self.stdout.write(f"Processing emails for user: {user.username}")
                except User.DoesNotExist:
                    self.stdout.write(
                        self.style.ERROR(f"User with ID {user_id} not found")
                    )
                    return
                
                # Run the task synchronously for management command
                result = process_user_emails_task(user_id)
            else:
                self.stdout.write("Processing emails for all connected users")
                # Process all users with connected email accounts
                from orders.models import EmailAccount
                users_with_emails = EmailAccount.objects.filter(
                    is_connected=True
                ).values_list('user_id', flat=True).distinct()
                
                if not users_with_emails:
                    self.stdout.write(
                        self.style.WARNING("No users with connected email accounts found")
                    )
                    return
                
                results = []
                for uid in users_with_emails:
                    try:
                        result = process_user_emails_task(uid)
                        results.append(result)
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f"Error processing user {uid}: {str(e)}")
                        )
                
                # Combine results
                total_processed = sum(r.get('total_processed', 0) for r in results)
                total_errors = sum(r.get('total_errors', 0) for r in results)
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Email processing completed!\n"
                        f"Users processed: {len(results)}\n"
                        f"Total orders processed: {total_processed}\n"
                        f"Total errors: {total_errors}"
                    )
                )
                return
            
            if isinstance(result, dict):
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Email processing completed successfully!\n"
                        f"Processed: {result.get('total_processed', 0)} orders\n"
                        f"Errors: {result.get('total_errors', 0)}\n"
                        f"Accounts processed: {result.get('accounts_processed', 0)}"
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS("Email processing task queued successfully")
                )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Email processing failed: {str(e)}")
            )
            logger.error(f"Email processing command failed: {e}")
            raise