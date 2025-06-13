import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Divider,
  Fade
} from '@mui/material';

const InvoiceResults = ({ data }) => {
  console.log('InvoiceResults received data:', data);

  // Defensive check for data
  if (!data) {
    console.error('InvoiceResults: No data provided');
    return (
      <Box p={3}>
        <Typography color="error">No invoice data available</Typography>
      </Box>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Ensure line_items is an array
  const lineItems = Array.isArray(data.line_items) ? data.line_items : [];

  return (
    <Fade in={true} timeout={1000}>
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 4,
            color: 'text.primary',
          }}
        >
          Invoice Details
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                Invoice Number
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                }}
              >
                {data.invoice_number || 'N/A'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                Date
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                }}
              >
                {data.date || 'N/A'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                Vendor
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                }}
              >
                {data.vendor || 'N/A'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                Total Amount
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                }}
              >
                {formatCurrency(data.total_amount)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 3,
            color: 'text.primary',
          }}
        >
          Line Items
        </Typography>
        
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  Description
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  Quantity
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  Unit Price
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lineItems.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                >
                  <TableCell>{item.name || 'Unknown Item'}</TableCell>
                  <TableCell align="right">{item.quantity || 1}</TableCell>
                  <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                  <TableCell align="right">{formatCurrency((item.price || 0) * (item.quantity || 1))}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="right"
                  sx={{
                    borderTop: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Total
                  </Typography>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    borderTop: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: 'primary.main',
                    }}
                  >
                    {formatCurrency(data.total_amount)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Fade>
  );
};

export default InvoiceResults; 