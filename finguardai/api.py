from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import hashlib
from .mistral import MistralInvoiceProcessor
import json
import logging
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Update CORS configuration to be more permissive
CORS(app, resources={
    r"/*": {
        "origins": "*",  # Allow all origins in development
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Origin", "Accept"],
        "max_age": 3600
    }
})

@app.before_request
def log_request_info():
    logger.info('=== Incoming Request ===')
    logger.info('URL: %s', request.url)
    logger.info('Method: %s', request.method)
    logger.info('Headers: %s', dict(request.headers))
    logger.info('Files: %s', dict(request.files))
    logger.info('Form: %s', dict(request.form))
    logger.info('=====================')

@app.after_request
def after_request(response):
    logger.info('=== Outgoing Response ===')
    logger.info('Status: %s', response.status)
    logger.info('Headers: %s', dict(response.headers))
    logger.info('=====================')
    return response

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Initialize Mistral processor
try:
    processor = MistralInvoiceProcessor()
    logger.info("Successfully initialized Mistral processor")
except Exception as e:
    logger.error(f"Failed to initialize Mistral processor: {str(e)}")
    raise

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_action_hash(data):
    """Generate a SHA-256 hash of the invoice data for logging."""
    data_str = json.dumps(data, sort_keys=True)
    return hashlib.sha256(data_str.encode()).hexdigest()

@app.route('/api/process-invoice', methods=['POST', 'OPTIONS'])
def process_invoice():
    logger.info("=== Starting invoice processing request ===")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    if request.method == 'OPTIONS':
        logger.info("Handling OPTIONS request")
        return jsonify({'success': True})

    if 'invoice' not in request.files:
        logger.error("No invoice file in request")
        return jsonify({
            "success": False,
            "error": "No invoice file provided"
        }), 400

    file = request.files['invoice']
    logger.info(f"Received file: {file.filename}")
    
    if file.filename == '':
        logger.error("Empty filename")
        return jsonify({
            "success": False,
            "error": "No selected file"
        }), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        logger.info(f"Saving file to: {filepath}")
        
        try:
            file.save(filepath)
            logger.info("File saved successfully")

            # Extract invoice data
            logger.info("Starting invoice data extraction...")
            invoice_data = processor.extract_invoice_data(filepath)
            
            if "error" in invoice_data:
                logger.error(f"Error extracting invoice data: {invoice_data['error']}")
                return jsonify({
                    "success": False,
                    "error": invoice_data["error"]
                }), 400

            # Assess risks
            logger.info("Starting risk assessment...")
            risk_assessment = processor.assess_risk(invoice_data)
            
            # Generate action hash
            action_hash = generate_action_hash(invoice_data)
            logger.info(f"Generated action hash: {action_hash}")

            result = {
                "success": True,
                "data": {
                    "invoice_data": invoice_data,
                    "risk_assessment": risk_assessment,
                    "action_hash": action_hash
                }
            }

            # Clean up uploaded file
            os.remove(filepath)
            logger.info("Successfully processed invoice")
            
            return jsonify(result)

        except Exception as e:
            logger.error(f"Error processing invoice: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            # Clean up uploaded file in case of error
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500

    logger.error(f"Invalid file type: {file.filename}")
    return jsonify({
        "success": False,
        "error": "Invalid file type"
    }), 400

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5001)

# python api.py
