from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .models import Order, EmailAccount, OrderProcessingLog
from .serializers import OrderSerializer, EmailAccountSerializer
from email_processor.gmail_oauth import GmailOAuthHandler
from email_processor.tasks import process_user_emails_task
import logging
from .models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)

class OrderListView(generics.ListAPIView):
    """List orders for the authenticated user"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.filter(user=user)
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by vendor if provided
        vendor_filter = self.request.query_params.get('vendor')
        if vendor_filter:
            queryset = queryset.filter(vendor=vendor_filter)
        
        # Filter by date range if provided
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(booking_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(booking_date__lte=date_to)
        
        return queryset.order_by('-created_at')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_gmail_auth_url(request):
    """Get Gmail OAuth authorization URL"""
    try:
        oauth_handler = GmailOAuthHandler()
        
        # Use user ID as state parameter for security
        state = str(request.user.id)
        auth_url = oauth_handler.get_authorization_url(state=state)
        
        return Response({
            'auth_url': auth_url,
            'state': state
        })
        
    except Exception as e:
        logger.error(f"Error generating Gmail auth URL: {e}")
        return Response(
            {'error': 'Failed to generate authorization URL'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def gmail_oauth_callback(request):
    """Handle Gmail OAuth callback"""
    try:
        code = request.data.get('code')
        state = request.data.get('state')
        
        if not code:
            return Response(
                {'error': 'Authorization code is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify state matches user ID for security
        if state != str(request.user.id):
            return Response(
                {'error': 'Invalid state parameter'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        oauth_handler = GmailOAuthHandler()
        
        # Exchange code for tokens
        tokens = oauth_handler.exchange_code_for_tokens(code)
        
        # Get user email
        access_token = tokens.get('access_token')
        user_email = oauth_handler.get_user_info(access_token)
        
        if not user_email:
            return Response(
                {'error': 'Failed to get user email'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate token expiry
        expires_in = tokens.get('expires_in', 3600)
        token_expiry = timezone.now() + timedelta(seconds=expires_in)
        
        # Save or update email account
        email_account, created = EmailAccount.objects.update_or_create(
            user=request.user,
            email=user_email,
            defaults={
                'access_token': access_token,
                'refresh_token': tokens.get('refresh_token'),
                'token_expiry': token_expiry,
                'is_connected': True,
                'platform_preferences': ['zoop', 'spicy_wagon', 'yatri_restro', 'rajbhog_khana']
            }
        )
        
        action = 'connected' if created else 'updated'
        logger.info(f"Gmail account {action} for user {request.user.username}: {user_email}")
        
        return Response({
            'message': f'Gmail account {action} successfully',
            'email': user_email,
            'created': created
        })
        
    except Exception as e:
        logger.error(f"Error in Gmail OAuth callback: {e}")
        return Response(
            {'error': 'Failed to connect Gmail account'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_emails(request):
    """Manually trigger email processing"""
    try:
        # Check if user has connected email accounts
        email_accounts = EmailAccount.objects.filter(
            user=request.user, 
            is_connected=True
        )
        
        if not email_accounts.exists():
            return Response(
                {'error': 'No connected Gmail accounts found. Please connect your Gmail account first.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process emails
        result = process_user_emails_task(request.user.id)
        
        if 'error' in result:
            return Response(
                {'error': result['error']}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'message': 'Email processing completed successfully',
            'total_processed': result.get('total_processed', 0),
            'total_errors': result.get('total_errors', 0),
            'accounts_processed': result.get('accounts_processed', 0)
        })
        
    except Exception as e:
        logger.error(f"Error processing emails: {e}")
        return Response(
            {'error': 'Failed to process emails'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_email_accounts(request):
    """Get user's connected email accounts"""
    try:
        email_accounts = EmailAccount.objects.filter(user=request.user)
        serializer = EmailAccountSerializer(email_accounts, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error getting email accounts: {e}")
        return Response(
            {'error': 'Failed to get email accounts'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def disconnect_email_account(request, email_id):
    """Disconnect an email account"""
    try:
        email_account = EmailAccount.objects.get(
            id=email_id, 
            user=request.user
        )
        
        email_account.is_connected = False
        email_account.access_token = None
        email_account.refresh_token = None
        email_account.save()
        
        return Response({'message': 'Email account disconnected successfully'})
        
    except EmailAccount.DoesNotExist:
        return Response(
            {'error': 'Email account not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error disconnecting email account: {e}")
        return Response(
            {'error': 'Failed to disconnect email account'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_stats(request):
    """Get order statistics for dashboard"""
    try:
        user_orders = Order.objects.filter(user=request.user)
        
        stats = {
            'total_orders': user_orders.count(),
            'pending_orders': user_orders.filter(status='pending').count(),
            'completed_orders': user_orders.filter(status__in=['completed', 'delivered']).count(),
            'cancelled_orders': user_orders.filter(status='cancelled').count(),
            'total_revenue': sum(order.grand_total or 0 for order in user_orders),
            'vendors': list(user_orders.values_list('vendor', flat=True).distinct()),
        }
        
        return Response(stats)
        
    except Exception as e:
        logger.error(f"Error getting order stats: {e}")
        return Response(
            {'error': 'Failed to get order statistics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)