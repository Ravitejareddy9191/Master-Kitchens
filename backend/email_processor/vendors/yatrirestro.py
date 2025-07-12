import re
import logging
from ..order_parsers import BaseOrderParser
from typing import Dict, Optional, Any

logger = logging.getLogger(__name__)
class YatriRestroOrderParser(BaseOrderParser):
    """Parser for Yatri Restro platform orders"""
    
    def __init__(self):
        super().__init__()
        self.Vendor = "Yatri Restro"
    
    def parse(self, email_body: str, email_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse Yatri Restro order from email body"""
        if not email_body or "ORDER No" not in email_body or "Grand Total" not in email_body:
            return None
        
        try:
            order_data = {
                'Vendor': self.Vendor,
                'BookingDate': email_data.get('date'),
                'OrderID': self.extract(r'ORDER No\s+(\S+)', email_body),
                'Customer_Details': f"{self.extract(r'CUSTOMER NAME\s+(.+?)(?:TRAIN No /NAME|\n|$)', email_body)} - {self.extract(r'MOBILE NO\s+(\d+)', email_body)}",
                'TrainStation': f"{self.extract(r'Train.*?:\s*(.+)', email_body)} ({self.extract_train_number(email_body)})\n Coach: {self.extract(r'Coach/ Seat\s*\*:\s*\*([^\n\r]+)', email_body)}",
                'DeliveryDate': self.extract(r'DELIVERY DATE\s+(.+?)(?:\n|$)', email_body, True),
                'Station': self.extract(r'Station Code/Name\s+(.+?)(?:\n|$)', email_body, True),
                'Paymenttype': self.extract(r'PAYMENT STATUS\s+(.+?)(?:Station Code/Name|\n|$)', email_body, True),
            }
            
            # Extract financial info
            sub_total = self.float_or_none(self.extract(r'Sub Total\s+₹\s*([\d.]+)', email_body))
            gst = self.float_or_none(self.extract(r'GST\s+₹\s*([\d.]+)', email_body))
            grand_total = self.float_or_none(self.extract(r'Grand Total \(Inclusive of all taxes\)\s+₹\s*(\d+)', email_body))
            
            order_data.update({
                'Sub_Total': sub_total,
                'GST': gst,
                'Delivery_Charges': 0,  # Usually included in total
                'Grand_Total': grand_total,
            })
            
            # Extract items from table
            item_lines = []
            item_description_lines = []
            
            item_section = self.extract(
                r'Order Item Details:\s*Item\s+Description\s+Price\s+Quantity\s+Amount\s*(.*?)\s*Sub Total',
                email_body, 
                multiline=True
            )
            
            if item_section:
                for line in item_section.strip().splitlines():
                    match = re.match(
                        r'^([A-Za-z0-9 \-]+)\s+([\d\w]+)\s+₹\s*([\d.]+)\s+(\d+)\s+₹\s*([\d.]+)',
                        line.strip()
                    )
                    if match:
                        item_name = match.group(1).strip()
                        description = match.group(2).strip()
                        quantity = match.group(4).strip()
                        item_lines.append(f"{item_name} × {quantity}")
                        item_description_lines.append(f"{item_name} ({description})")
            
            order_data['Item_Details'] = "\n".join(item_lines) if item_lines else None
            order_data['Item_Description'] = "\n".join(item_description_lines) if item_description_lines else None
            
            logger.info(f"Successfully parsed Yatri Restro order: {order_data.get('OrderID')}")
            return order_data
            
        except Exception as e:
            logger.error(f"Error parsing Yatri Restro order: {e}")
            return None