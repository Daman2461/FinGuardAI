import React, { useState } from 'react';
import { Box, Container, Typography, Paper, CircularProgress, Alert, Fade } from '@mui/material';
import FileUpload from './FileUpload';
import InvoiceResults from './InvoiceResults';
import RiskAssessment from './RiskAssessment';

// Match the exact backend URL from the Streamlit app
const BACKEND_URL = 'http://127.0.0.1:5001';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3}>
          <Alert severity="error">
            Something went wrong: {this.state.error?.message}
          </Alert>
        </Box>
      );
    }
    return this.props.children;
  }
}

const InvoiceProcessor = () => {
  console.log('InvoiceProcessor rendering'); // Basic render log

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleFileUpload = async (file) => {
    console.log('File upload started:', file.name); // Log file upload start
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('invoice', file);

      console.log('Sending request to backend'); // Log request
      const response = await fetch(`${BACKEND_URL}/api/process-invoice`, {
        method: 'POST',
        body: formData,
      });

      console.log('Got response:', response.status); // Log response status
      const result = await response.json();
      console.log('Parsed response:', result); // Log parsed response

      if (response.status === 200 && result.success) {
        const data = result.data;
        if (data && data.invoice_data) {
          console.log('Setting results:', data); // Log successful results
          setResults(data);
        } else {
          throw new Error('Invalid response: missing invoice data');
        }
      } else {
        throw new Error(result.error || 'Failed to process invoice');
      }
    } catch (err) {
      console.error('Error in handleFileUpload:', err); // Log errors
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Wrap the entire render in try-catch
  try {
    return (
      <ErrorBoundary>
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
            py: { xs: 4, md: 8 },
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                textAlign: 'center',
                mb: { xs: 6, md: 8 },
              }}
            >
              <Typography
                variant="h1"
                component="h1"
                gutterBottom
                sx={{
                  background: 'linear-gradient(90deg, #000000 0%, #333333 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                FinGuard AI
              </Typography>
              
              <Typography
                variant="h2"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                  mb: 2,
                }}
              >
                Smart Invoice Validator
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{
                  color: 'text.secondary',
                  maxWidth: '600px',
                  mx: 'auto',
                }}
              >
                Upload your invoice and let our AI analyze it for potential risks and anomalies
              </Typography>
            </Box>

            <Fade in={true} timeout={1000}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 3, md: 6 },
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <FileUpload onUpload={handleFileUpload} disabled={loading} />
                
                {loading && (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    my={6}
                    gap={2}
                  >
                    <CircularProgress size={40} />
                    <Typography variant="subtitle1" color="text.secondary">
                      Analyzing your invoice...
                    </Typography>
                  </Box>
                )}

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                    }}
                  >
                    {error}
                  </Alert>
                )}

                {results && (
                  <Fade in={true} timeout={1000}>
                    <Box mt={6}>
                      <ErrorBoundary>
                        <InvoiceResults data={results.invoice_data} />
                      </ErrorBoundary>
                      <ErrorBoundary>
                        <RiskAssessment assessment={results.risk_assessment} />
                      </ErrorBoundary>
                    </Box>
                  </Fade>
                )}
              </Paper>
            </Fade>
          </Container>
        </Box>
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('Render error:', err);
    return (
      <Box p={3}>
        <Alert severity="error">
          Something went wrong while rendering: {err.message}
        </Alert>
      </Box>
    );
  }
};

export default InvoiceProcessor; 