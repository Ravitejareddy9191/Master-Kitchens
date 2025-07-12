from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class EmailAccount(models.Model):
    """Model to store user's email account details for Gmail integration"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_accounts')
    email = models.EmailField()
    access_token = models.TextField(null=True, blank=True)
    refresh_token = models.TextField(null=True, blank=True)
    token_expiry = models.DateTimeField(null=True, blank=True)
    is_connected = models.BooleanField(default=False)
    last_sync = models.DateTimeField(null=True, blank=True)
    platform_preferences = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'email_accounts'
        unique_together = ['user', 'email']

    def __str__(self):
        return f"{self.user.username} - {self.email}"

class Order(models.Model):
    """Model to store parsed order details from emails"""
    
    PAYMENT_TYPE_CHOICES = [
        ('online', 'Online'),
        ('cod', 'Cash on Delivery'),
        ('paid_online', 'Paid Online'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('active', 'Active'),
        ('undelivered', 'Undelivered'),
    ]
    
    VENDOR_CHOICES = [
        ('zoop', 'Zoop'),
        ('spicy_wagon', 'Spicy Wagon'),
        ('yatri_restro', 'Yatri Restro'),
        ('rajbhog_khana', 'RajBhog Khana'),
    ]

    # Basic Order Information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    email_account = models.ForeignKey(EmailAccount, on_delete=models.CASCADE, related_name='orders')
    
    # Order Details
    vendor = models.CharField(max_length=50, choices=VENDOR_CHOICES)
    order_id = models.CharField(max_length=100)
    booking_date = models.DateTimeField(null=True, blank=True)
    delivery_date = models.DateTimeField(null=True, blank=True)
    
    # Customer Information
    customer_name = models.CharField(max_length=255, null=True, blank=True)
    customer_phone = models.CharField(max_length=20, null=True, blank=True)
    customer_details = models.TextField(max_length=100, null=True, blank=True)  # Combined details
    
    # Train/Travel Information
    train_number = models.CharField(max_length=20, null=True, blank=True)
    train_name = models.CharField(max_length=255, null=True, blank=True)
    coach = models.CharField(max_length=50, null=True, blank=True)
    seat = models.CharField(max_length=50, null=True, blank=True)
    pnr = models.CharField(max_length=20, null=True, blank=True)
    train_station = models.TextField(null=True, blank=True)  # Combined train/stateion info
    station = models.CharField(max_length=255, null=True, blank=True)
    
    # Financial Information
    sub_total = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    gst = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    delivery_charges = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, null=True, blank=True)
    
    # Item Information
    item_details = models.TextField(null=True, blank=True)
    item_description = models.TextField(null=True, blank=True)
    
    # Order Status and Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    remarks = models.TextField(null=True, blank=True)
    booked_from = models.CharField(max_length=100, null=True, blank=True)
    updated_by = models.CharField(max_length=100, default='System')
    
    # Email Information
    email_message_id = models.CharField(max_length=255, unique=True)
    email_thread_id = models.CharField(max_length=255, null=True, blank=True)
    email_subject = models.TextField(null=True, blank=True)
    email_sender = models.EmailField(null=True, blank=True)
    email_date = models.DateTimeField(null=True, blank=True)
    raw_email_body = models.TextField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_processed = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'vendor']),
            models.Index(fields=['status']),
            models.Index(fields=['booking_date']),
            models.Index(fields=['order_id']),
            models.Index(fields=['email_message_id']),
        ]

    def __str__(self):
        return f"{self.vendor} - {self.order_id} - {self.customer_name}"

    @property
    def formatted_customer_details(self):
        """Return formatted customer details"""
        if self.customer_name and self.customer_phone:
            return f"{self.customer_name} - {self.customer_phone}"
        return self.customer_details or "N/A"
    
    @property
    def formatted_train_station(self):
        """Return formatted train and station information"""
        parts = []
        if self.train_number and self.train_name:
            parts.append(f"{self.train_number}/{self.train_name}")
        if self.coach:
            parts.append(f"Coach: {self.coach}")
        if self.station:
            parts.append(f"Station: {self.station}")
        return "\n".join(parts) if parts else self.train_station or "N/A"

class OrderProcessingLog(models.Model):
    """Model to log email processing activities"""
    
    LOG_TYPE_CHOICES = [
        ('success', 'Success'),
        ('error', 'Error'),
        ('warning', 'Warning'),
        ('info', 'Info'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='processing_logs')
    email_account = models.ForeignKey(EmailAccount, on_delete=models.CASCADE, related_name='processing_logs')
    message_id = models.CharField(max_length=255, null=True, blank=True)
    log_type = models.CharField(max_length=20, choices=LOG_TYPE_CHOICES)
    message = models.TextField()
    details = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'order_processing_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.log_type}: {self.message[:50]}..."
    


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('order', 'Order'),
        ('complaint', 'Complaint'),
        ('stock', 'Stock'),
        ('info', 'Info'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.user.username}] {self.title}"
