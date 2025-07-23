import { createTheme } from '@mui/material/styles';

// IBM Carbon color palette
const carbonColors = {
  gray10: '#f4f4f4',
  gray20: '#e0e0e0',
  gray30: '#c6c6c6',
  gray40: '#a8a8a8',
  gray50: '#8d8d8d',
  gray60: '#6f6f6f',
  gray70: '#525252',
  gray80: '#393939',
  gray90: '#262626',
  gray100: '#161616',
  blue40: '#4589ff',
  blue60: '#0f62fe',
  blue70: '#0043ce',
  blue80: '#002d9c',
  red60: '#da1e28',
  green60: '#198038',
  yellow30: '#f1c21b'
};

// Create a theme instance
const ibmTheme = createTheme({
  palette: {
    primary: {
      light: carbonColors.blue40,
      main: carbonColors.blue60,
      dark: carbonColors.blue80,
      contrastText: '#ffffff',
    },
    secondary: {
      light: carbonColors.gray60,
      main: carbonColors.gray70,
      dark: carbonColors.gray80,
      contrastText: '#ffffff',
    },
    error: {
      main: carbonColors.red60,
    },
    success: {
      main: carbonColors.green60,
    },
    warning: {
      main: carbonColors.yellow30,
    },
    background: {
      default: carbonColors.gray10,
      paper: '#ffffff',
    },
    text: {
      primary: carbonColors.gray100,
      secondary: carbonColors.gray70,
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.625rem',
      fontWeight: 300,
      letterSpacing: '-0.016rem',
      lineHeight: 1.199,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 400,
      letterSpacing: 0,
      lineHeight: 1.25,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 400,
      letterSpacing: 0,
      lineHeight: 1.28,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 400,
      letterSpacing: 0,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 1.375,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.016rem',
      lineHeight: 1.28,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: 0,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.016rem',
      lineHeight: 1.42,
    },
    button: {
      textTransform: 'none',
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 0, // IBM Carbon uses square corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          padding: '0.625rem 1rem',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: carbonColors.blue70,
          },
        },
        outlined: {
          borderWidth: '1px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: `1px solid ${carbonColors.gray20}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: carbonColors.gray10,
        },
      },
    },
  },
});

export default ibmTheme;