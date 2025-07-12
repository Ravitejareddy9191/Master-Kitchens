import logging
import base64
from datetime import timedelta, datetime
from django.utils import timezone
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials
from .gmail_oauth import GmailOAuthHandler

logger = logging.getLogger(__name__)

class GmailService:
    def __init__(self, email_account):
        self.email_account = email_account
        self.oauth_handler = GmailOAuthHandler()
        self.service = None

    def authenticate(self):
        if not self.email_account:
            raise ValueError("EmailAccount required")
        if not self.email_account.access_token:
            logger.error(f"No access token for {self.email_account.email}")
            return None

        if self._needs_refresh():
            logger.info(f"Refreshing token for {self.email_account.email}")
            if not self._refresh_token():
                logger.error("Token refresh failed")
                return None

        creds = Credentials(
            token=self.email_account.access_token,
            refresh_token=self.email_account.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=self.oauth_handler.client_id,
            client_secret=self.oauth_handler.client_secret,
        )

        try:
            self.service = build("gmail", "v1", credentials=creds)
            return self.service
        except HttpError as e:
            logger.error(f"Gmail service build failed: {e}")
            self.service = None
            return None

    def _needs_refresh(self):
        if not self.email_account.token_expiry:
            return True
        return timezone.now() >= (self.email_account.token_expiry - timedelta(minutes=2))

    def _refresh_token(self):
        if not self.email_account.refresh_token:
            self.email_account.is_connected = False
            self.email_account.save()
            return False
        try:
            new_tokens = self.oauth_handler.refresh_access_token(self.email_account.refresh_token)
            if new_tokens and 'access_token' in new_tokens:
                self.email_account.access_token = new_tokens['access_token']
                self.email_account.token_expiry = timezone.now() + timedelta(seconds=new_tokens.get('expires_in', 3600))
                self.email_account.save()
                logger.info(f"Token refreshed for {self.email_account.email}")
                return True
        except Exception as e:
            logger.error(f"Error refreshing token: {e}")
        self.email_account.is_connected = False
        self.email_account.save()
        return False

    def get_messages(self, query='', max_results=50, since_date=None):
        if not self.service:
            self.authenticate()
        try:
            full_query = query or (
                '(from:zoop.com OR subject:zoop) '
                'OR (from:spicywagon.in OR subject:"New Spicywagon order") '
                'OR (from:yatrirestro.com OR subject:"yatri restro") '
                'OR (from:rajbhogkhana.com OR subject:"RBK Order Confirmation")'
            )
            if since_date:
                date_str = since_date.strftime('%Y/%m/%d')
                full_query += f' after:{date_str}'

            results = self.service.users().messages().list(
                userId='me', q=full_query, maxResults=max_results
            ).execute()
            return results.get('messages', [])
        except Exception as e:
            logger.error(f"Failed to fetch messages: {e}")
            return []

    def get_message_details(self, message_id):
        try:
            return self.service.users().messages().get(
                userId='me', id=message_id, format='full'
            ).execute()
        except Exception as e:
            logger.error(f"Failed to get message {message_id}: {e}")
            return None

    def extract_message_data(self, message):
        try:
            payload = message.get('payload', {})
            headers = payload.get('headers', [])
            parts = payload.get('parts', [])
            data = ""

            for part in parts:
                if part.get('mimeType') == 'text/plain':
                    data = part.get('body', {}).get('data', '')
                    break

            if not data and 'body' in payload:
                data = payload.get('body', {}).get('data', '')

            decoded_body = base64.urlsafe_b64decode(data.encode('utf-8')).decode('utf-8', errors='ignore')

            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), '')
            date_header = next((h['value'] for h in headers if h['name'] == 'Date'), '')
            email_date = self.parse_email_date(date_header)

            return {
                'message_id': message.get('id'),
                'thread_id': message.get('threadId'),
                'subject': subject,
                'sender': sender,
                'date': email_date.isoformat() if email_date else None,
                'body': decoded_body,
            }

        except Exception as e:
            logger.error(f"Error extracting message: {e}")
            return None

    def parse_email_date(self, date_string):
        try:
            return datetime.strptime(date_string, "%a, %d %b %Y %H:%M:%S %z")
        except Exception:
            try:
                return datetime.strptime(date_string, "%d %b %Y %H:%M:%S %z")
            except Exception:
                return timezone.now()

    def mark_as_processed(self, message_id):
        try:
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
        except Exception as e:
            logger.error(f"Failed to mark message {message_id} as processed: {e}")
