import re
import logging
from ..order_parsers import BaseOrderParser
from typing import Dict, Optional, Any

logger = logging.getLogger(__name__)
class ZoopOrderParser(BaseOrderParser):
    """Parser for Zoop platform orders"""
    
    def __init__(self):
        super().__init__()
        self.Vendor = "Zoop"
    
    def parse(self, email_body: str, email_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse Zoop order from email body"""
        if not email_body or "Order Number" not in email_body or "Order Total" not in email_body:
            return None
        
        try:
            # Extract basic order info
            order_data = {
                'Vendor': self.Vendor,
                'BookingDate': email_data.get('date'),
                'OrderID': self.extract(r'Order Number\s*(ZO\d+)', email_body),
                'Customer_Details': f"{self.extract(r'Customer Name\s*\*:\s*\*(.+?)(?=\s*Phone\s*\*:)', email_body)} - {self.extract(r'Phone\s*\*:\s*\*(\d+)', email_body)}",
                'TrainStation': f"{self.extract(r'Train.*?:\s*(.+)', email_body)} ({self.extract_train_number(email_body)})\nCoach: {self.extract(r'Coach/ Seat\s*\*:\s*\*([^\n\r]+)', email_body)}",
                'DeliveryDate': self.extract(r'Delivery Date\s*\*:\s*\*([^\n\r]+)', email_body),
                'Station': self.extract(r'At\s*\*:\s*\*([^\n\r]+?/\s*\w{2,5})', email_body),
                'Paymenttype': self.extract(r'(Paid Online|Cash on Delivery)', email_body),
            }
            
            # Extract financial information
            sub_total = self.float_or_none(self.extract(r'Base Price Total\s*₹\s*(\d+\.?\d*)', email_body))
            gst_food = self.float_or_none(self.extract(r'\(\+\) GST on food\s*₹\s*(\d+\.?\d*)', email_body))
            gst_delivery = self.float_or_none(self.extract(r'\(\+\) GST on Delivery Charge\s*₹\s*(\d+\.?\d*)', email_body))
            delivery_charge = self.float_or_none(self.extract(r'\(\+\) Delivery Charge\s*₹\s*(\d+\.?\d*)', email_body))
            grand_total = self.float_or_none(self.extract(r'Order Total\s*₹\s*(\d+\.?\d*)', email_body))
            
            # Combine GST
            gst_total = None
            if gst_food is not None or gst_delivery is not None:
                gst_total = (gst_food or 0) + (gst_delivery or 0)
            
            order_data.update({
                'Sub_Total': sub_total,
                'GST': gst_total,
                'Delivery_Charges': delivery_charge,
                'Grand_Total': grand_total,
            })
            
            # Extract items
            items = re.findall(r'([A-Za-z0-9 \-]+?)\s+\d+\s+(\d+)\s+\d+', email_body)
            if items:
                item_lines = [f"{name.strip()} × {qty}" for name, qty in items]
                order_data['Item_Details'] = "\n".join(item_lines)
            
            # Extract item descriptions
            item_description = self.extract(
                r'\*Item Description:\*\s*Item Name Description\s*(.+?)\*Restaurant Details:', 
                email_body, 
                multiline=True
            )
            order_data['Item_Description'] = item_description
            
            logger.info(f"Successfully parsed Zoop order: {order_data.get('OrderID')}")
            return order_data
            
        except Exception as e:
            logger.error(f"Error parsing Zoop order: {e}")
            return None
