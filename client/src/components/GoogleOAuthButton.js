import React from 'react';
import { Button, Box } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const GoogleOAuthButton = ({ 
  variant = 'outlined', 
  fullWidth = true, 
  size = 'large',
  text = 'Continue with Google',
  disabled = false 
}) => {
  const { loginWithGoogle, loading } = useAuth();

  const handleGoogleLogin = () => {
    // Store current location for redirect after login
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== '/login' && currentPath !== '/register') {
      localStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    loginWithGoogle();
  };

  return (
    <Button
      variant={variant}
      fullWidth={fullWidth}
      size={size}
      onClick={handleGoogleLogin}
      disabled={disabled || loading}
      startIcon={
        <Box
          component="img"
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          sx={{ 
            width: 20, 
            height: 20,
            mr: 0.5
          }}
        />
      }
      sx={{
        textTransform: 'none',
        borderColor: 'divider',
        color: 'text.primary',
        backgroundColor: 'background.paper',
        '&:hover': {
          backgroundColor: 'action.hover',
          borderColor: 'primary.main',
        },
        '&:disabled': {
          opacity: 0.6,
        },
        py: 1.5,
        fontSize: '1rem',
        fontWeight: 500,
      }}
    >
      {text}
    </Button>
  );
};

export default GoogleOAuthButton;