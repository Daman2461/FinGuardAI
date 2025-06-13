import os
import base64
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from dotenv import load_dotenv
import json
import logging
from typing import Dict, Any
import PyPDF2

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class MistralInvoiceProcessor:
    def __init__(self):
        self.api_key = os.environ.get("MISTRAL_API_KEY")
        if not self.api_key:
            logger.error("MISTRAL_API_KEY not found in environment variables")
            raise ValueError("MISTRAL_API_KEY not found in environment variables")
        
        logger.info(f"Initializing Mistral client with API key: {self.api_key[:8]}...")
        self.model = "mistral-large-latest"
        self.client = MistralClient(api_key=self.api_key)

    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file."""
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                logger.info(f"Extracted text from PDF: {text[:200]}...")  # Log first 200 chars
                return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise

    def extract_invoice_data(self, image_path: str) -> Dict[str, Any]:
        """Extract invoice data from an image using Mistral AI."""
        try:
            logger.info(f"Processing file: {image_path}")
            
            # Extract text from PDF
            invoice_text = self._extract_text_from_pdf(image_path)
            logger.info("Successfully extracted text from PDF")
            
            # Create a more specific prompt for invoice extraction
            prompt = f"""You are a precise invoice data extractor. Your task is to extract EXACT values from this invoice text:

{invoice_text}

CRITICAL INSTRUCTIONS:
1. Extract EXACT values from the invoice text - do not modify or guess any values
2. For dates: Convert to YYYY-MM-DD format (e.g., "13 June 2025" → "2025-06-13")
3. For amounts: Convert Rs. values to decimal numbers (e.g., "Rs. 18000" → 18000.00)
4. For line items: Extract EXACT names and quantities as shown
5. Do not add or remove any line items
6. Do not modify any values
7. Each line item must have a name, quantity, and price
8. The total amount must match the sum of all line items

Return a JSON object with this structure:
{{
    "vendor": "string (exact vendor name from invoice)",
    "date": "YYYY-MM-DD (converted date)",
    "invoice_number": "string (exact invoice number)",
    "total_amount": decimal_number (converted total amount),
    "line_items": [
        {{
            "name": "string (exact item name)",
            "quantity": number (exact quantity),
            "price": decimal_number (converted price)
        }}
    ]
}}

Return ONLY the JSON object with EXACT values from the invoice. Do not add, remove, or modify any values."""

            logger.info("Sending request to Mistral API...")
            response = self.client.chat(
                model="mistral-large-latest",
                messages=[
                    ChatMessage(role="user", content=prompt)
                ],
                temperature=0.0  # Set temperature to 0 for most deterministic output
            )
            
            logger.info("Received response from Mistral API")
            logger.info(f"Raw response: {response.choices[0].message.content}")
            
            # Extract JSON from the response
            content = response.choices[0].message.content
            json_str = content.strip('`').strip()
            if json_str.startswith('json'):
                json_str = json_str[4:].strip()
            
            # Parse the JSON response
            invoice_data = json.loads(json_str)
            
            # Validate required fields
            required_fields = ['vendor', 'date', 'invoice_number', 'total_amount', 'line_items']
            for field in required_fields:
                if field not in invoice_data:
                    raise ValueError(f"Missing required field: {field}")
            
            # Validate line items
            if not isinstance(invoice_data['line_items'], list):
                raise ValueError("line_items must be a list")
            
            if len(invoice_data['line_items']) == 0:
                raise ValueError("No line items found in invoice")
            
            # Validate each line item
            total = 0
            for item in invoice_data['line_items']:
                if not all(k in item for k in ['name', 'quantity', 'price']):
                    raise ValueError("Each line item must have name, quantity, and price")
                if not isinstance(item['quantity'], (int, float)) or item['quantity'] <= 0:
                    raise ValueError(f"Invalid quantity for item {item['name']}")
                if not isinstance(item['price'], (int, float)) or item['price'] <= 0:
                    raise ValueError(f"Invalid price for item {item['name']}")
                total += item['price'] * item['quantity']
            
            # Validate total amount
            if abs(total - invoice_data['total_amount']) > 0.01:  # Allow for small floating point differences
                raise ValueError(f"Total amount {invoice_data['total_amount']} does not match sum of line items {total}")
            
            return invoice_data
            
        except Exception as e:
            logger.error(f"Failed to extract invoice data: {str(e)}")
            return {"error": str(e)}

    def assess_risk(self, invoice_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess potential risks in the invoice data using Mistral AI."""
        try:
            # Calculate average price and standard deviation
            prices = [item['price'] for item in invoice_data['line_items']]
            avg_price = sum(prices) / len(prices)
            
            # Check for unusual amounts
            unusual_items = []
            for item in invoice_data['line_items']:
                # Flag items that are more than 5x the average price
                if item['price'] > avg_price * 5:
                    unusual_items.append({
                        'item': item['name'],
                        'price': item['price'],
                        'average': avg_price,
                        'reason': f"Price is {item['price']/avg_price:.1f}x higher than average"
                    })
            
            # Only add total amount check if it's over $100,000
            if invoice_data['total_amount'] > 100000:
                unusual_items.append({
                    'item': 'Total Amount',
                    'price': invoice_data['total_amount'],
                    'reason': "Total amount exceeds $100,000"
                })
            
            # Create a detailed prompt for risk assessment
            prompt = f"""Analyze this invoice data for potential risks or fraud indicators:

Invoice Data:
{json.dumps(invoice_data, indent=2)}

Unusual Items Found:
{json.dumps(unusual_items, indent=2)}

Consider the following risk factors:
1. Unusual amounts:
   - Items significantly above average price (only flag if >5x average)
   - Total amount unusually high (only flag if >$100,000)
   - Round numbers or suspicious patterns
2. Missing or suspicious information:
   - Missing vendor details
   - Missing invoice number
   - Missing dates
3. Inconsistencies:
   - Mismatched totals
   - Unusual quantities
   - Suspicious item names
4. High-risk indicators:
   - Executive or license fees
   - Round number amounts
   - Unusually high individual items

Return a JSON object with this structure:
{{
    "risk_level": "high|medium|low",
    "confidence_score": number between 0 and 1,
    "findings": [
        "string describing each risk found"
    ],
    "unusual_items": [
        {{
            "item": "item name",
            "price": number,
            "reason": "string explaining why it's unusual"
        }}
    ]
}}

Note: Be conservative in flagging risks. Only mark as medium or high risk if there are clear and significant concerns. Most invoices should be marked as low risk unless there are obvious red flags.

IMPORTANT: Return ONLY the JSON object, no additional text or explanation."""

            response = self.client.chat(
                model="mistral-large-latest",
                messages=[
                    ChatMessage(role="user", content=prompt)
                ],
                temperature=0.0
            )
            
            # Parse the response
            content = response.choices[0].message.content.strip()
            
            # Clean up the response to ensure it's valid JSON
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            content = content.strip()
            
            try:
                risk_assessment = json.loads(content)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse risk assessment JSON: {str(e)}")
                logger.error(f"Raw content: {content}")
                # Return a low risk assessment instead of high risk on error
                return {
                    "risk_level": "low",
                    "confidence_score": 0.6,
                    "findings": [
                        "Unable to perform detailed risk assessment. Defaulting to low risk."
                    ],
                    "unusual_items": []
                }
            
            # Validate risk assessment structure
            required_fields = ['risk_level', 'confidence_score', 'findings']
            for field in required_fields:
                if field not in risk_assessment:
                    raise ValueError(f"Missing required field in risk assessment: {field}")
            
            return risk_assessment
            
        except Exception as e:
            logger.error(f"Failed to assess invoice risks: {str(e)}")
            # Return a low risk assessment instead of high risk on error
            return {
                "risk_level": "low",
                "confidence_score": 0.6,
                "findings": [
                    f"Error in risk assessment: {str(e)}",
                    "Defaulting to low risk due to assessment failure"
                ],
                "unusual_items": []
            }
