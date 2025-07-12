import re
import logging
from ..order_parsers import BaseOrderParser
from typing import Dict, Optional, Any

logger = logging.getLogger(__name__)

class SpicyWagonOrderParser(BaseOrderParser):
    """Parser for Spicy Wagon platform orders"""
    
    def __init__(self):
        super().__init__()
        self.Vendor = "Spicy Wagon"
    
    def parse(self, email_body: str, email_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse Spicy Wagon order from email body"""
        if not email_body or "ORDER NO:" not in email_body or "NET TOTAL" not in email_body:
            return None
        
        try:
            order_data = {
                'Vendor': self.Vendor,
                'BookingDate': email_data.get('date'),
                'OrderID': self.extract(r'ORDER NO:\s+(\S+)', email_body),
                'Customer_Details': f"{self.extract(r'NAME:\s+(.+?)(?:TRAIN No /NAME|\n|$)', email_body)} \n {self.extract(r'MOB:\s+(\d+)', email_body)}",
                'TrainStation': f"{self.extract(r'Train.*?:\s*(.+)', email_body)} ({self.extract_train_number(email_body)})\nCoach: {self.extract(r'Coach/ Seat\s*\*:\s*\*([^\n\r]+)', email_body)}",
                'DeliveryDate': self.extract(r'DELIVERY:\s*(.+)', email_body),
                'Payment_type': self.extract(r'PAYMODE:\s+(.+?)(?:Station Code/Name|\n|$)', email_body, True),
                'Station': self.extract(r'STATION:\s+(.+?)(?:\n|$)', email_body, True),
            }
            
            # Extract financial info
            delivery_charges = self.float_or_none(self.extract(r'DELIVERY CHARGE:\s*Rs\.?\s*(\d+(?:\.\d+)?)', email_body))
            net_total = self.float_or_none(self.extract(r'NET TOTAL:\s*Rs\.?\s*(\d+(?:\.\d+)?)', email_body))
            
            order_data.update({
                'Delivery_Charges': delivery_charges,
                'Sub_Total': net_total,
                'Grand_Total': net_total,
                'GST': None,  # GST info not clearly available in Spicy Wagon format
            })
            
            # Extract items
            item_details = self.extract(
                r'ITEM DETAILS\s*\*+\s*(.*?)\s*DELIVERY CHARGE:', 
                email_body, 
                multiline=True
            )
            order_data['Item_Details'] = item_details
            order_data['Item_Description'] = item_details
            
            logger.info(f"Successfully parsed Spicy Wagon order: {order_data.get('OrderID')}")
            return order_data
            
        except Exception as e:
            logger.error(f"Error parsing Spicy Wagon order: {e}")
            return None
