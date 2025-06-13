import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import InvoiceProcessor from './components/InvoiceProcessor';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
    },
    secondary: {
      main: '#0066CC',
      light: '#0077ED',
      dark: '#004999',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F7',
    },
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '48px',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '40px',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '32px',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontSize: '24px',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontSize: '20px',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontSize: '18px',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    subtitle1: {
      fontSize: '17px',
      fontWeight: 400,
      letterSpacing: '-0.01em',
    },
    subtitle2: {
      fontSize: '15px',
      fontWeight: 400,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '17px',
      letterSpacing: '-0.01em',
    },
    body2: {
      fontSize: '15px',
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20,
          padding: '8px 16px',
          fontSize: '17px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        },
        elevation3: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <InvoiceProcessor />
    </ThemeProvider>
  );
}

export default App;
