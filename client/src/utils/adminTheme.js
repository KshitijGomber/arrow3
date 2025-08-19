// Utility for consistent admin theme colors
export const getAdminThemeColors = (theme) => ({
  primary: theme.palette.primary.main, // #2ea4a5
  primaryLight: theme.palette.primary.light,
  primaryDark: theme.palette.primary.dark,
  background: theme.palette.background.default,
  paper: theme.palette.background.paper,
  text: theme.palette.text.primary,
  textSecondary: theme.palette.text.secondary,
  border: theme.palette.divider,
  success: theme.palette.success.main,
  warning: theme.palette.warning.main,
  error: theme.palette.error.main,
  info: theme.palette.info.main,
});

// Admin-specific styled components
export const adminStyles = {
  gradientBackground: (theme) => ({
    background: theme.palette.mode === 'dark' 
      ? `linear-gradient(180deg, 
          ${theme.palette.background.default} 0%, 
          ${theme.palette.background.paper} 50%, 
          ${theme.palette.background.default} 100%
        )`
      : `linear-gradient(180deg, 
          ${theme.palette.background.default} 0%, 
          ${theme.palette.background.paper} 50%, 
          ${theme.palette.background.default} 100%
        )`,
    minHeight: '100vh',
    color: theme.palette.text.primary,
  }),
  
  glassPaper: (theme) => ({
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, 
          rgba(26, 26, 26, 0.8) 0%, 
          rgba(42, 42, 42, 0.6) 100%
        )`
      : `linear-gradient(135deg, 
          rgba(248, 249, 250, 0.8) 0%, 
          rgba(255, 255, 255, 0.6) 100%
        )`,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 2,
    backdropFilter: 'blur(10px)',
  }),
  
  appBarGradient: (theme) => ({
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, 
          rgba(26, 26, 26, 0.95) 0%, 
          rgba(42, 42, 42, 0.95) 100%
        )`
      : `linear-gradient(135deg, 
          rgba(248, 249, 250, 0.95) 0%, 
          rgba(255, 255, 255, 0.95) 100%
        )`,
    backdropFilter: 'blur(10px)',
    borderBottom: `1px solid ${theme.palette.primary.main}20`,
  }),
  
  inputStyles: (theme) => ({
    color: theme.palette.text.primary,
    '& .MuiOutlinedInput-notchedOutline': { 
      borderColor: theme.palette.divider 
    },
    '&:hover .MuiOutlinedInput-notchedOutline': { 
      borderColor: theme.palette.primary.main 
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
      borderColor: theme.palette.primary.main 
    },
  }),
  
  primaryButton: (theme) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
};