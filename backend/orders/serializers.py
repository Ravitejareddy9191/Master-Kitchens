from rest_framework import serializers
from .models import Order, EmailAccount, OrderProcessingLog
from .models import Notification

class EmailAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailAccount
        fields = [
            'id', 'email', 'is_connected', 'last_sync', 
            'platform_preferences', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    formatted_customer_details = serializers.ReadOnlyField()
    formatted_train_station = serializers.ReadOnlyField()
    vendor_display = serializers.CharField(source='get_vendor_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'vendor', 'vendor_display', 'order_id', 'booking_date', 
            'delivery_date', 'customer_name', 'customer_phone', 
            'formatted_customer_details', 'train_number', 'train_name', 
            'coach', 'seat', 'pnr', 'formatted_train_station', 'station',
            'sub_total', 'gst', 'delivery_charges', 'grand_total', 
            'payment_type', 'payment_type_display', 'item_details', 
            'item_description', 'status', 'status_display', 'remarks', 
            'booked_from', 'updated_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'formatted_customer_details',
            'formatted_train_station', 'vendor_display', 'status_display',
            'payment_type_display'
        ]

class OrderProcessingLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderProcessingLog
        fields = [
            'id', 'message_id', 'log_type', 'message', 'details', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all_'

