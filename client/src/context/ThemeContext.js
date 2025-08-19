import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useCustomTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within a ThemeProvider');
  }
  return context;
};

// Define color palettes
const lightPalette = {
  primary: {
    main: '#2ea4a5',
    light: '#5cbbc0',
    dark: '#1f7374',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff6b35',
    light: '#ff8a5c',
    dark: '#cc5529',
    contrastText: '#ffffff',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    elevated: '#ffffff',
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
    disabled: '#999999',
  },
  divider: '#e0e0e0',
  action: {
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(46, 164, 165, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
  },
};

const darkPalette = {
  primary: {
    main: '#2ea4a5',
    light: '#5cbbc0',
    dark: '#1f7374',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff6b35',
    light: '#ff8a5c',
    dark: '#cc5529',
    contrastText: '#ffffff',
  },
  background: {
    default: '#0a0a0a',
    paper: '#1a1a1a',
    elevated: '#2a2a2a',
  },
  text: {
    primary: '#ffffff',
    secondary: '#aaaaaa',
    disabled: '#666666',
  },
  divider: '#333333',
  action: {
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(46, 164, 165, 0.12)',
    disabled: 'rgba(255, 255, 255, 0.26)',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  warning: {
    main: '#ffc107',
    light: '#ffecb3',
    dark: '#ff8f00',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  info: {
    main: '#4fc3f7',
    light: '#81d4fa',
    dark: '#0288d1',
  },
};

// Create theme function
const createAppTheme = (mode) => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  
  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease, color 0.3s ease',
            scrollbarWidth: 'thin',
            scrollbarColor: mode === 'dark' ? '#333 #1a1a1a' : '#ccc #f0f0f0',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'dark' ? '#1a1a1a' : '#f0f0f0',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'dark' ? '#333' : '#ccc',
              borderRadius: '4px',
              '&:hover': {
                background: mode === 'dark' ? '#444' : '#bbb',
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 24px',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: mode === 'dark' 
                ? '0 4px 20px rgba(0, 255, 136, 0.3)' 
                : '0 4px 20px rgba(0, 0, 0, 0.1)',
            },
          },
          contained: {
            boxShadow: mode === 'dark' 
              ? '0 2px 10px rgba(0, 255, 136, 0.2)' 
              : '0 2px 10px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
            border: `1px solid ${palette.divider}`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'dark' 
                ? '0 8px 25px rgba(0, 255, 136, 0.15)' 
                : '0 8px 25px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
            border: `1px solid ${palette.divider}`,
          },
          elevation1: {
            boxShadow: mode === 'dark' 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              transition: 'all 0.3s ease',
              '& fieldset': {
                borderColor: palette.divider,
              },
              '&:hover fieldset': {
                borderColor: palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: palette.primary.main,
              },
            },
            '& .MuiInputLabel-root': {
              color: palette.text.secondary,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
            borderBottom: `1px solid ${palette.divider}`,
            boxShadow: mode === 'dark' 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: palette.background.paper,
            borderRight: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
          },
        },
      },
    },
  });
};

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Check localStorage first, then system preference
    const savedMode = localStorage.getItem('arrow3-theme-mode');
    if (savedMode) {
      return savedMode;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'dark'; // Default to dark mode for Arrow3 Aerospace
  });

  const theme = createAppTheme(mode);

  const toggleTheme = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('arrow3-theme-mode', newMode);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('arrow3-theme-mode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const contextValue = {
    mode,
    toggleTheme,
    theme,
    isDark: mode === 'dark',
    isLight: mode === 'light',
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default CustomThemeProvider;