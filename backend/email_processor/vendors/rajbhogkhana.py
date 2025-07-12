import re
import logging
from ..order_parsers import BaseOrderParser
from typing import Dict, Optional, Any

logger = logging.getLogger(__name__)
class RajBhogKhanaOrderParser(BaseOrderParser):
    """Parser for RajBhog Khana platform orders"""
    
    def __init__(self):
        super().__init__()
        self.Vendor = "RajBhog Khana"
    
    def parse(self, email_body: str, email_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse RajBhog Khana order from email body"""
        if not email_body or "Invoice" not in email_body or "Customer Name" not in email_body:
            return None
        
        try:
            order_data = {
                'Vendor': self.Vendor,
                'BookingDate': email_data.get('date'),
                'OrderID': self.extract(r'Invoice\s+(\S+ / \d+)', email_body),
                'Customer_Details': f"{self.extract(r'Customer Name\s*:\s*(.+)', email_body)} \n {self.extract(r'Customer Contact\s*:\s*(\d+)', email_body)}",
                'TrainStation': f"{self.extract(r'Train.*?:\s*(.+)', email_body)} ({self.extract_train_number(email_body)})\nCoach: {self.extract(r'Coach/ Seat\s*\*:\s*\*([^\n\r]+)', email_body)}",
                'Delivery_Date': self.extract(r'Delivery Date\s*:\s*(.+)', email_body),
                'Coach': self.extract(r'Coach / Berth:\s*(.+)', email_body),
                'Station': self.extract(r'Delivery Station:\s*(.+)', email_body),
                'Payment_type': self.extract(r'Payment:\s*(\S+)', email_body),
            }
            
            # Extract financial info
            sub_total = self.float_or_none(self.extract(r'Subtotal:\s*([\d.]+)', email_body))
            gst = self.float_or_none(self.extract(r'GST\s*\(5%\)\s*([\d.]+)', email_body))
            grand_total = self.float_or_none(self.extract(r'Total:\s*([\d.]+)', email_body))
            
            order_data.update({
                'Sub_Total': sub_total,
                'GST': gst,
                'Delivery_Charges': 0.0,
                'Grand_Total': grand_total,
            })
            
            # Extract items
            item_lines = []
            item_description_lines = []
            
            # Look for item line with pattern: quantity, item_name, description, price, etc.
            item_match = re.search(
                r'1\s+(.+?)\s+(.+?)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)',
                email_body
            )
            
            if item_match:
                item_name = item_match.group(1).strip()
                description = item_match.group(2).strip()
                qty = item_match.group(3).strip()
                item_lines.append(f"{item_name} × {qty}")
                item_description_lines.append(f"{item_name} ({description})")
            
            order_data['Item_Details'] = "\n".join(item_lines) if item_lines else None
            order_data['Item_Description'] = "\n".join(item_description_lines) if item_description_lines else None
            
            logger.info(f"Successfully parsed RajBhog Khana order: {order_data.get('OrderID')}")
            return order_data
            
        except Exception as e:
            logger.error(f"Error parsing RajBhog Khana order: {e}")
            return None