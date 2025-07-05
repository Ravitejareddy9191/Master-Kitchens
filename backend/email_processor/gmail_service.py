import os
import logging
from datetime import datetime, timedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings
from django.utils import timezone
from accounts.models import EmailAccount
from accounts.gmail_oauth import GmailOAuthHandler

logger = logging.getLogger(__name__)

class EnhancedGmailService:
    def __init__(self, email_account=None):
        self.email_account = email_account
        self.service = None
        self.oauth_handler = GmailOAuthHandler()
        
    def authenticate(self):
        """Authenticate and build Gmail service for specific email account"""
        if not self.email_account:
            raise ValueError("EmailAccount instance required for authentication")
        
        # Check if we have required tokens
        if not self.email_account.access_token:
            logger.error(f"No access token for {self.email_account.email}")
            self.email_account.is_connected = False
            self.email_account.save()
            raise Exception(f"No access token available for {self.email_account.email}. Please reconnect.")
        
        # Check if token needs refresh
        if self._needs_refresh():
            if not self._refresh_token():
                raise Exception(f"Failed to refresh token for {self.email_account.email}. Please reconnect.")
        
        # Build credentials with proper scopes
        creds = Credentials(
            token=self.email_account.access_token,
            refresh_token=self.email_account.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GMAIL_CLIENT_ID,
            client_secret=settings.GMAIL_CLIENT_SECRET,
            scopes=[
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.modify'
            ]
        )
        
        # Validate credentials before building service
        if not creds.valid:
            if creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                    # Update stored tokens
                    self.email_account.access_token = creds.token
                    if creds.expiry:
                        self.email_account.token_expiry = creds.expiry
                    self.email_account.save()
                    logger.info(f"Credentials refreshed for {self.email_account.email}")
                except Exception as e:
                    logger.error(f"Failed to refresh credentials: {e}")
                    self.email_account.is_connected = False
                    self.email_account.save()
                    raise Exception(f"Authentication failed for {self.email_account.email}. Please reconnect.")
            else:
                logger.error(f"Invalid credentials for {self.email_account.email}")
                self.email_account.is_connected = False
                self.email_account.save()
                raise Exception(f"Invalid credentials for {self.email_account.email}. Please reconnect.")
        
        try:
            self.service = build('gmail', 'v1', credentials=creds)
            
            # Test the connection with a simple API call
            try:
                profile = self.service.users().getProfile(userId='me').execute()
                logger.info(f"Gmail service authenticated for {self.email_account.email} (Profile: {profile.get('emailAddress')})")
            except HttpError as test_error:
                if test_error.resp.status == 403:
                    logger.error(f"Gmail API access denied for {self.email_account.email}. Check OAuth consent and scopes.")
                    raise Exception(f"Gmail API access denied. Please ensure the OAuth app has proper Gmail scopes and user consent.")
                elif test_error.resp.status == 401:
                    logger.error(f"Gmail API unauthorized for {self.email_account.email}")
                    self.email_account.is_connected = False
                    self.email_account.save()
                    raise Exception(f"Gmail API unauthorized. Please reconnect your account.")
                else:
                    raise Exception(f"Gmail API test failed: {test_error}")
            
            return self.service
            
        except Exception as e:
            logger.error(f"Error building Gmail service: {e}")
            # Mark account as disconnected if authentication fails
            self.email_account.is_connected = False
            self.email_account.save()
            raise
    
    def _needs_refresh(self):
        """Check if token needs refresh"""
        if not self.email_account.token_expiry:
            return True
        
        # Add 5 minutes buffer for token refresh
        buffer_time = timedelta(minutes=5)
        return timezone.now() >= (self.email_account.token_expiry - buffer_time)
    
    def _refresh_token(self):
        """Refresh the access token"""
        if not self.email_account.refresh_token:
            logger.error(f"No refresh token available for {self.email_account.email}")
            self.email_account.is_connected = False
            self.email_account.save()
            return False
        
        try:
            new_tokens = self.oauth_handler.refresh_access_token(
                self.email_account.refresh_token
            )
            
            if new_tokens and 'access_token' in new_tokens:
                self.email_account.access_token = new_tokens['access_token']
                self.email_account.token_expiry = timezone.now() + timedelta(
                    seconds=new_tokens.get('expires_in', 3600)
                )
                self.email_account.save()
                logger.info(f"Token refreshed for {self.email_account.email}")
                return True
            else:
                logger.error(f"Failed to refresh token for {self.email_account.email}")
                self.email_account.is_connected = False
                self.email_account.save()
                return False
                
        except Exception as e:
            logger.error(f"Error refreshing token: {e}")
            self.email_account.is_connected = False
            self.email_account.save()
            return False
    
    def get_messages(self, query='', max_results=100, since_date=None):
        """Get messages from Gmail with optional query and date filter"""
        if not self.service:
            self.authenticate()
        
        try:
            # Build query with platform preferences
            platform_queries = []
            if hasattr(self.email_account, 'platform_preferences') and self.email_account.platform_preferences:
                for platform in self.email_account.platform_preferences:
                    if platform == 'zoop':
                        platform_queries.append('(from:zoop.com OR subject:zoop)')
                    elif platform == 'spicy_wagon':
                        platform_queries.append('(from:spicywagon.in OR subject:"New Spicywagon order")')
                    elif platform == 'yatri_restro':
                        platform_queries.append('(from:yatrirestro.com OR subject:"yatri restro")')
                    elif platform == 'rajbhog_khana':
                        platform_queries.append('(from:rajbhogkhana.com OR subject:"RBK Order Confirmation")')
            
            if platform_queries:
                platform_query = ' OR '.join(platform_queries)
                if query:
                    query = f"({query}) AND ({platform_query})"
                else:
                    query = platform_query
            
            # If no platform preferences, use default food delivery query
            if not query:
                query = '(from:zoop.com OR from:spicywagon.in OR from:yatrirestro.com OR from:rajbhogkhana.com OR subject:order OR subject:invoice)'
            
            # Add date filter if specified
            if since_date:
                date_str = since_date.strftime('%Y/%m/%d')
                query = f"{query} after:{date_str}" if query else f"after:{date_str}"
            
            logger.info(f"Gmail query for {self.email_account.email}: {query}")
            
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            logger.info(f"Retrieved {len(messages)} messages for {self.email_account.email}")
            return messages
            
        except HttpError as error:
            logger.error(f"Gmail API error for {self.email_account.email}: {error}")
            if error.resp.status == 401:  # Unauthorized
                self.email_account.is_connected = False
                self.email_account.save()
                raise Exception(f"Authentication failed for {self.email_account.email}. Please reconnect.")
            elif error.resp.status == 403:  # Forbidden
                # Check if it's a quota/rate limit issue or permissions issue
                error_details = error.error_details if hasattr(error, 'error_details') else []
                error_reason = None
                for detail in error_details:
                    if 'reason' in detail:
                        error_reason = detail['reason']
                        break
                
                if error_reason == 'rateLimitExceeded' or error_reason == 'quotaExceeded':
                    raise Exception(f"Gmail API quota exceeded for {self.email_account.email}. Please try again later.")
                else:
                    self.email_account.is_connected = False
                    self.email_account.save()
                    raise Exception(f"Access denied for {self.email_account.email}. Please check OAuth consent and Gmail API permissions.")
            elif error.resp.status == 400:  # Bad Request
                raise Exception(f"Invalid Gmail API request for {self.email_account.email}. Check query syntax.")
            else:
                raise Exception(f"Gmail API error: {error}")
        except Exception as e:
            logger.error(f"Error retrieving messages for {self.email_account.email}: {e}")
            raise
    
    def get_message_details(self, message_id):
        """Get detailed message content"""
        if not self.service:
            self.authenticate()
        
        try:
            message = self.service.users().messages().get(
                userId='me',
                id=message_id,
                format='full'
            ).execute()
            
            return message
            
        except HttpError as error:
            logger.error(f"Gmail API error retrieving message {message_id}: {error}")
            if error.resp.status == 401:
                self.email_account.is_connected = False
                self.email_account.save()
            raise
        except Exception as e:
            logger.error(f"Error retrieving message details: {e}")
            raise
    
    def extract_message_data(self, message):
        """Extract relevant data from message"""
        try:
            payload = message['payload']
            headers = payload.get('headers', [])
            
            # Extract headers
            email_data = {
                'message_id': message['id'],
                'thread_id': message['threadId'],
                'date': None,
                'sender': None,
                'subject': None,
                'body': None,
                'account_email': self.email_account.email
            }
            
            for header in headers:
                name = header['name'].lower()
                if name == 'date':
                    email_data['date'] = header['value']
                elif name == 'from':
                    email_data['sender'] = header['value']
                elif name == 'subject':
                    email_data['subject'] = header['value']
            
            # Extract body
            email_data['body'] = self._extract_body(payload)
            
            return email_data
            
        except Exception as e:
            logger.error(f"Error extracting message data: {e}")
            return None
    
    def _extract_body(self, payload):
        """Extract body text from message payload"""
        try:
            body = ""
            
            def decode_data(data):
                if data:
                    import base64
                    return base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                return ""
            
            def extract_text_from_parts(parts):
                text = ""
                for part in parts:
                    mime_type = part.get('mimeType', '')
                    
                    if mime_type == 'text/plain':
                        data = part.get('body', {}).get('data')
                        if data:
                            return decode_data(data)
                    elif mime_type == 'text/html' and not text:
                        # Use HTML as fallback if no plain text
                        data = part.get('body', {}).get('data')
                        if data:
                            text = decode_data(data)
                    elif mime_type.startswith('multipart/'):
                        # Recursively handle nested multipart
                        sub_parts = part.get('parts', [])
                        if sub_parts:
                            nested_text = extract_text_from_parts(sub_parts)
                            if nested_text:
                                return nested_text
                
                return text
            
            if 'parts' in payload:
                body = extract_text_from_parts(payload['parts'])
            else:
                # Single part message
                mime_type = payload.get('mimeType', '')
                if mime_type == 'text/plain':
                    data = payload.get('body', {}).get('data')
                    if data:
                        body = decode_data(data)
                elif mime_type == 'text/html':
                    data = payload.get('body', {}).get('data')
                    if data:
                        body = decode_data(data)
            
            return body.strip() if body else ""
            
        except Exception as e:
            logger.error(f"Error extracting body: {e}")
            return ""
    
    def mark_as_processed(self, message_id):
        """Mark email as processed (add label)"""
        try:
            if not self.service:
                return
                
            # Try to add a processed label (this might fail if label doesn't exist)
            try:
                self.service.users().messages().modify(
                    userId='me',
                    id=message_id,
                    body={'addLabelIds': ['PROCESSED']}
                ).execute()
            except:
                # Label might not exist, just log and continue
                logger.debug(f"Could not add PROCESSED label to message {message_id}")
            
        except Exception as e:
            logger.warning(f"Could not mark message as processed: {e}")
    
    def update_last_sync(self):
        """Update the last sync timestamp"""
        self.email_account.last_sync = timezone.now()
        self.email_account.save()
        logger.info(f"Updated last sync for {self.email_account.email}")