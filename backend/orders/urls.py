from django.urls import path
from . import views
from .views import get_notifications

urlpatterns = [
    path('orders/', views.OrderListView.as_view(), name='order-list'),
    path('gmail/auth-url/', views.get_gmail_auth_url, name='gmail-auth-url'),
    path('gmail/callback/', views.gmail_oauth_callback, name='gmail-callback'),
    path('gmail/process-emails/', views.process_emails, name='process-emails'),
    path('gmail/accounts/', views.get_email_accounts, name='email-accounts'),
    path('gmail/accounts/<int:email_id>/disconnect/', views.disconnect_email_account, name='disconnect-email'),
    path('stats/', views.get_order_stats, name='order-stats'),
    path('notifications/', get_notifications, name='get_notifications'),
]
