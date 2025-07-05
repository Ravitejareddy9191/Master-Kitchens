import re
import logging
from typing import Dict, Optional, Any

logger = logging.getLogger(__name__)

class BaseOrderParser:
    """Base class for order parsers"""
    
    def __init__(self):
        self.platform_name = "Unknown"
    
    def extract(self, pattern: str, text: str, multiline: bool = False) -> Optional[str]:
        """Extract text using regex pattern"""
        try:
            flags = re.DOTALL if multiline else 0
            match = re.search(pattern, text, flags)
            return match.group(1).strip() if match else None
        except Exception as e:
            logger.error(f"Error extracting pattern '{pattern}': {e}")
            return None
    
    def float_or_none(self, val: Optional[str]) -> Optional[float]:
        """Convert string to float or return None"""
        try:
            if val is None:
                return None
            # Remove commas and extra spaces
            cleaned_val = val.replace(',', '').strip()
            return float(cleaned_val) if cleaned_val else None
        except (ValueError, AttributeError):
            return None
    
    def extract_train_number(self, text: str) -> Optional[str]:
        """Extract train number (4-5 digits)"""
        match = re.search(r'\b\d{4,5}\b', text)
        return match.group(0) if match else None
    
    def parse(self, email_body: str, email_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse order from email body - to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement parse method")


class ZoopOrderParser(BaseOrderParser):
    """Parser for Zoop platform orders"""
    
    def __init__(self):
        super().__init__()
        self.platform_name = "Zoop"
    
    def parse(self, email_body: str, email_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse Zoop order from email body"""
        if not email_body or "Order Number" not in email_body or "Order Total" not in email_body:
            return None
        
        try:
            # Extract basic order info
            order_data = {
                'platform': self.platform_name,
                'email_date': email_data.get('date'),
                'sender': email_data.get('sender'),
                'subject': email_data.get('subject'),
                'Order ID': self.extract(r'Order Number\s*(ZO\d+)', email_body),
                'Customer_Name': self.extract(r'Customer Name\s*\*:\s*\*(.+?)(?=\s*Phone\s*\*:)', email_body),
                'Mobile_No': self.extract(r'Phone\s*\*:\s*\*(\d+)', email_body),
                'Train_Details': f"{self.extract(r'Train.*?:\s*(.+)', email_body)} ({self.extract_train_number(email_body)})\nCoach: {self.extract(r'Coach/ Seat\s*\*:\s*\*([^\n\r]+)', email_body)}"
                'Delivery_Date': self.extract(r'Delivery Date\s*\*:\s*\*([^\n\r]+)', email_body),
                'Station': self.extract(r'At\s*\*:\s*\*([^\n\r]+?/\s*\w{2,5})', email_body),
                'Pay_Mode': self.extract(r'(Paid Online|Cash on Delivery)', email_body),
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
            
            logger.info(f"Successfully parsed Zoop order: {order_data.get('Order_No')}")
            return order_data
            
        except Exception as e:
            logger.error(f"Error parsing Zoop order: {e}")
            return None


class SpicyWagonOrderParser(BaseOrderParser):
    """Parser for Spicy Wagon platform orders"""
    
    def __init__(self):
        super().__init__()
        self.platform_name = "Spicy Wagon"
    
    def parse(self, email_body: str, email_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse Spicy Wagon order from email body"""
        if not email_body or "ORDER NO:" not in email_body or "NET TOTAL" not in email_body:
            return None
        
        try:
            order_data = {
                'platform': self.platform_name,
                'email_date': email_data.get('date'),
                'sender': email_data.get('sender'),
                'subject': email_data.get('subject'),
                'Order_No': self.extract(r'ORDER NO:\s+(\S+)', email_body),
                'Customer_Name': self.extract(r'NAME:\s+(.+?)(?:TRAIN No /NAME|\n|$)', email_body, True),
                'Mobile_No': self.extract(r'MOB:\s+(\d+)', email_body),
                'Train_No_Name': self.extract(r'TRAIN:\s+(.+?)(?:\n|$)', email_body, True),
                'Train_No': self.extract_train_number(email_body),
                'Delivery_Date': self.extract(r'DELIVERY:\s*(.+)', email_body),
                'Coach': self.extract(r'COACH:\s+(.+?)(?:\n|$)', email_body, True),
                'Pay_Mode': self.extract(r'PAYMODE:\s+(.+?)(?:Station Code/Name|\n|$)', email_body, True),
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
            
            logger.info(f"Successfully parsed Spicy Wagon order: {order_data.get('Order_No')}")
            return order_data
            
        except Exception as e:
            logger.error(f"Error parsing Spicy Wagon order: {e}")
            return None


class YatriRestroOrderParser(BaseOrderParser):
    """Parser for Yatri Restro platform orders"""
    
    def __init__(self):
        super().__init__()
        self.platform_name = "Yatri Restro"
    
    def parse(self, email_body: str, email_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse Yatri Restro order from email body"""
        if not email_body or "ORDER No" not in email_body or "Grand Total" not in email_body:
            return None
        
        try:
            order_data = {
                'platform': self.platform_name,
                'email_date': email_data.get('date'),
                'sender': email_data.get('sender'),
                'subject': email_data.get('subject'),
                'Order_No': self.extract(r'ORDER No\s+(\S+)', email_body),
                'Customer_Name': self.extract(r'CUSTOMER NAME\s+(.+?)(?:TRAIN No /NAME|\n|$)', email_body, True),
                'Mobile_No': self.extract(r'MOBILE NO\s+(\d+)', email_body),
                'Train_No_Name': self.extract(r'TRAIN No /NAME\s+(.+?)(?:\n|$)', email_body, True),
                'Train_No': self.extract_train_number(email_body),
                'Delivery_Date': self.extract(r'DELIVERY DATE\s+(.+?)(?:\n|$)', email_body, True),
                'Coach': self.extract(r'COACH/BERTH\s+(.+?)(?:\n|$)', email_body, True),
                'Station': self.extract(r'Station Code/Name\s+(.+?)(?:\n|$)', email_body, True),
                'Pay_Mode': self.extract(r'PAYMENT STATUS\s+(.+?)(?:Station Code/Name|\n|$)', email_body, True),
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
            
            logger.info(f"Successfully parsed Yatri Restro order: {order_data.get('Order_No')}")
            return order_data
            
        except Exception as e:
            logger.error(f"Error parsing Yatri Restro order: {e}")
            return None


class RajBhogKhanaOrderParser(BaseOrderParser):
    """Parser for RajBhog Khana platform orders"""
    
    def __init__(self):
        super().__init__()
        self.platform_name = "RajBhog Khana"
    
    def parse(self, email_body: str, email_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse RajBhog Khana order from email body"""
        if not email_body or "Invoice" not in email_body or "Customer Name" not in email_body:
            return None
        
        try:
            order_data = {
                'platform': self.platform_name,
                'email_date': email_data.get('date'),
                'sender': email_data.get('sender'),
                'subject': email_data.get('subject'),
                'Order_No': self.extract(r'Invoice\s+(\S+ / \d+)', email_body),
                'Customer_Name': self.extract(r'Customer Name\s*:\s*(.+)', email_body),
                'Mobile_No': self.extract(r'Customer Contact\s*:\s*(\d+)', email_body),
                'Train_No_Name': self.extract(r'Train\s*:\s*(.+)', email_body),
                'Train_No': self.extract_train_number(email_body),
                'Delivery_Date': self.extract(r'Delivery Date\s*:\s*(.+)', email_body),
                'Coach': self.extract(r'Coach / Berth:\s*(.+)', email_body),
                'Station': self.extract(r'Delivery Station:\s*(.+)', email_body),
                'Pay_Mode': self.extract(r'Payment:\s*(\S+)', email_body),
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
            
            logger.info(f"Successfully parsed RajBhog Khana order: {order_data.get('Order_No')}")
            return order_data
            
        except Exception as e:
            logger.error(f"Error parsing RajBhog Khana order: {e}")
            return None


class OrderParserFactory:
    """Factory class to get appropriate parser based on email content"""
    
    def __init__(self):
        self.parsers = [
            ZoopOrderParser(),
            SpicyWagonOrderParser(),
            YatriRestroOrderParser(),
            RajBhogKhanaOrderParser(),
        ]
    
    def identify_platform(self, email_body: str, sender: str = None) -> Optional[str]:
        """Identify platform based on email content and sender"""
        if not email_body:
            return None
        
        body_lower = email_body.lower()
        sender_lower = (sender or '').lower()
        
        # Check by content patterns
        if "order number" in body_lower and "zo" in email_body:
            return "zoop"
        elif "order no:" in body_lower and "net total" in body_lower:
            return "spicy_wagon"
        elif "order no" in body_lower and "mobile no" in body_lower and "grand total" in body_lower:
            return "yatri"
        elif "invoice" in body_lower and "customer name" in body_lower:
            return "rajbhog_khana"
        
        # Check by sender
        if "zoop" in sender_lower:
            return "zoop"
        elif "spicy" in sender_lower:
            return "spicy"
        elif "yatri" in sender_lower:
            return "yatri"
        elif "rajbhog" in sender_lower:
            return "rajbhog"
        
        return None
    
    def get_parser(self, platform: str) -> Optional[BaseOrderParser]:
        """Get parser for specific platform"""
        platform_map = {
            "zoop": ZoopOrderParser,
            "spicy_wagon": SpicyWagonOrderParser,
            "yatri": YatriRestroOrderParser,
            "rajbhog_khana": RajBhogKhanaOrderParser,
        }
        
        parser_class = platform_map.get(platform.lower())
        return parser_class() if parser_class else None
    
    def parse_order(self, email_body: str, email_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse order using appropriate parser"""
        platform = self.identify_platform(email_body, email_data.get('sender'))
        
        if not platform:
            logger.warning("Could not identify platform for email")
            return None
        
        parser = self.get_parser(platform)
        if not parser:
            logger.error(f"No parser available for platform: {platform}")
            return None
        
        return parser.parse(email_body, email_data)

# Singleton instance
order_parser_factory = OrderParserFactory()