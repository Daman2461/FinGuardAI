import streamlit as st
import requests
import json
import pandas as pd
from datetime import datetime
import os
import tempfile
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Backend URL configuration
BACKEND_URL = "http://127.0.0.1:5001"  # Updated port to avoid AirPlay conflict

# Configure the page
st.set_page_config(
    page_title="FinGuard AI - Smart Invoice Validator",
    page_icon="💸",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .main {
        background-color: #f5f5f5;
    }
    .stButton>button {
        background-color: #4CAF50;
        color: white;
        border-radius: 5px;
        padding: 10px 20px;
    }
    .risk-high {
        color: #ff4444;
    }
    .risk-medium {
        color: #ffbb33;
    }
    .risk-low {
        color: #00C851;
    }
</style>
""", unsafe_allow_html=True)

# Title and description
st.title("💸 FinGuard AI - Smart Invoice Validator")
st.markdown("""
> **Secure | Transparent | Fast**  
> End-to-end AI-powered invoice extraction, risk assessment, and logging using Mistral-7B.
""")

# File uploader
uploaded_file = st.file_uploader("Upload Invoice (PDF/Image)", type=['pdf', 'png', 'jpg', 'jpeg'])

if uploaded_file is not None:
    logger.info(f"File uploaded: {uploaded_file.name}")
    # Create a temporary directory
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = os.path.join(temp_dir, uploaded_file.name)
        
        # Save the uploaded file
        with open(temp_path, "wb") as f:
            f.write(uploaded_file.getvalue())
        logger.info(f"Saved uploaded file to: {temp_path}")

        # Process button
        if st.button("Process Invoice"):
            with st.spinner("Processing invoice..."):
                try:
                    # Send to backend
                    logger.info(f"Sending file to backend at {BACKEND_URL}...")
                    files = {'invoice': open(temp_path, 'rb')}
                    response = requests.post(
                        f"{BACKEND_URL}/api/process-invoice",
                        files=files,
                        timeout=120  # Increased timeout to 2 minutes
                    )
                    logger.info(f"Backend response status: {response.status_code}")
                    logger.info(f"Backend response headers: {dict(response.headers)}")
                    
                    if response.status_code == 200:
                        result = response.json()
                        logger.info("Successfully processed invoice")
                        
                        if result["success"]:
                            data = result["data"]
                            
                            # Display invoice data
                            st.subheader("📄 Invoice Data")
                            col1, col2 = st.columns(2)
                            
                            with col1:
                                st.write("**Vendor:**", data["invoice_data"]["vendor"])
                                st.write("**Date:**", data["invoice_data"]["date"])
                                st.write("**Invoice Number:**", data["invoice_data"]["invoice_number"])
                                st.write("**Total Amount:**", f"${data['invoice_data']['total_amount']:.2f}")
                            
                            with col2:
                                st.write("**Action Hash:**", data["action_hash"])
                                st.write("**Processed At:**", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
                            
                            # Display line items
                            st.subheader("📋 Line Items")
                            df = pd.DataFrame(data["invoice_data"]["line_items"])
                            st.dataframe(df)
                            
                            # Display risk assessment
                            st.subheader("🔍 Risk Assessment")
                            risk_data = data["risk_assessment"]
                            
                            # Determine risk level color
                            risk_level = risk_data.get("risk_level", "low").lower()
                            risk_color = {
                                "high": "risk-high",
                                "medium": "risk-medium",
                                "low": "risk-low"
                            }.get(risk_level, "risk-low")
                            
                            st.markdown(f"""
                            <div class="{risk_color}">
                                <h3>Risk Level: {risk_level.upper()}</h3>
                                <p>Confidence Score: {risk_data.get('confidence_score', 0):.2%}</p>
                            </div>
                            """, unsafe_allow_html=True)
                            
                            # Display risk findings
                            if "findings" in risk_data:
                                st.write("**Findings:**")
                                for finding in risk_data["findings"]:
                                    st.write(f"- {finding}")
                        else:
                            st.error(f"Error: {result['error']}")
                            logger.error(f"Backend error: {result['error']}")
                    else:
                        error_msg = f"Failed to process invoice. Server returned status code {response.status_code}"
                        st.error(error_msg)
                        logger.error(error_msg)
                        if response.text:
                            st.error(f"Server response: {response.text}")
                            logger.error(f"Server response: {response.text}")
                        
                except requests.exceptions.ConnectionError:
                    error_msg = f"Could not connect to the server at {BACKEND_URL}. Please make sure the backend server is running."
                    st.error(error_msg)
                    logger.error(error_msg)
                except requests.exceptions.Timeout:
                    error_msg = "Request timed out. The server took too long to respond."
                    st.error(error_msg)
                    logger.error(error_msg)
                except Exception as e:
                    error_msg = f"An error occurred: {str(e)}"
                    st.error(error_msg)
                    logger.error(error_msg, exc_info=True)

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center'>
    <p>Built with ❤️ using Mistral AI and Streamlit</p>
</div>
""", unsafe_allow_html=True) 