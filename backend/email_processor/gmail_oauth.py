import os
import json
import logging
from urllib.parse import urlencode
import requests
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


class GmailOAuthHandler:
    """Handle Gmail OAuth 2.0 authentication"""

    def __init__(self):
        self.client_id = getattr(settings, 'GMAIL_CLIENT_ID', '')
        self.client_secret = getattr(settings, 'GMAIL_CLIENT_SECRET', '')
        self.redirect_uri = getattr(settings, 'GMAIL_REDIRECT_URI', 'http://localhost:3000/gmail/callback')
        self.scope = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'openid',
            'email',
            'profile',
        ]

    def get_authorization_url(self, state=None):
        """Generate OAuth authorization URL"""
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': ' '.join(self.scope),
            'response_type': 'code',
            'access_type': 'offline',
            'prompt': 'consent',
        }

        if state:
            params['state'] = state

        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

    def exchange_code_for_tokens(self, code):
        """Exchange authorization code for access and refresh tokens"""
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': self.redirect_uri,
        }

        response = requests.post(token_url, data=data)
        response.raise_for_status()
        return response.json()  

    def refresh_access_token(self, refresh_token):
        """Refresh the Gmail access token using the refresh_token."""
        try:
            token_url = "https://oauth2.googleapis.com/token"
            data = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            }

            response = requests.post(token_url, data=data)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to refresh access token: {response.text}")
                return None

        except Exception as e:
            logger.error(f"Error refreshing access token: {e}")
            return None

    def get_user_info(self, access_token):
        """Get user email from access token"""
        try:
            url = "https://openidconnect.googleapis.com/v1/userinfo"
            headers = {'Authorization': f'Bearer {access_token}'}
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            user_info = response.json()
            return user_info.get('email')
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting user info: {e}")
            raise Exception(f"Failed to get user info: {e}")
