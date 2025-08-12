import React, { useState } from 'react';
import { Button, Box, Alert, Snackbar, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const GoogleOAuthButton = ({ 
  variant = 'outlined', 
  fullWidth = true, 
  size = 'large',
  text = 'Continue with Google',
  disabled = false,
  onError = null
}) => {
  const { loginWithGoogle, loading } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Store current location for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.setItem('redirectAfterLogin', currentPath);
      }
      
      // Check if Google OAuth is properly configured
      const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      if (!googleClientId || googleClientId === 'your-google-client-id') {
        throw new Error('Google OAuth is not properly configured');
      }
      
      loginWithGoogle();
    } catch (error) {
      console.error('Google OAuth initiation error:', error);
      const errorMessage = error.message || 'Failed to initiate Google login. Please try again.';
      setError(errorMessage);
      
      // Call onError callback if provided
      if (onError) {
        onError(errorMessage);
      }
      
      setIsLoading(false);
    }
  };

  const handleCloseError = () => {
    setError('');
  };

  const isButtonDisabled = disabled || loading || isLoading;

  return (
    <>
      <Button
        variant={variant}
        fullWidth={fullWidth}
        size={size}
        onClick={handleGoogleLogin}
        disabled={isButtonDisabled}
        startIcon={
          isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <Box
              component="img"
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              sx={{ 
                width: 20, 
                height: 20,
                mr: 0.5
              }}
              onError={(e) => {
                // Fallback to text if image fails to load
                e.target.style.display = 'none';
              }}
            />
          )
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
        {isLoading ? 'Connecting to Google...' : (loading ? 'Redirecting...' : text)}
      </Button>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GoogleOAuthButton;