import re
import logging
from typing import Dict, Optional, Any

logger = logging.getLogger(__name__)

class BaseOrderParser:
    """Base class for order parsers"""
    
    def __init__(self):
        self.Vendor = "Unknown"
    
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
            return "yatri_restro"
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

from .vendors import (
    ZoopOrderParser,
    SpicyWagonOrderParser,
    YatriRestroOrderParser,
    RajBhogKhanaOrderParser,
)

# Singleton instance
order_parser_factory = OrderParserFactory()
