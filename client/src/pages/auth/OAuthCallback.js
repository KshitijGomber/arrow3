import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Container } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const processCallback = () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refresh');
      const user = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/login?error=' + encodeURIComponent(getErrorMessage(error)));
        return;
      }

      if (token && refreshToken && user) {
        const success = handleOAuthCallback(token, refreshToken, user);
        if (success) {
          // Redirect to dashboard or intended page
          const redirectTo = localStorage.getItem('redirectAfterLogin') || '/';
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectTo);
        } else {
          navigate('/login?error=' + encodeURIComponent('Failed to process login'));
        }
      } else {
        navigate('/login?error=' + encodeURIComponent('Invalid callback parameters'));
      }
    };

    // Small delay to ensure the component is mounted
    const timer = setTimeout(processCallback, 100);
    return () => clearTimeout(timer);
  }, [searchParams, handleOAuthCallback, navigate]);

  const getErrorMessage = (error) => {
    switch (error) {
      case 'oauth_failed':
        return 'Google authentication failed. Please try again.';
      case 'oauth_error':
        return 'An error occurred during Google authentication.';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '50vh',
          textAlign: 'center'
        }}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: 'primary.main',
            mb: 3
          }} 
        />
        <Typography variant="h5" gutterBottom>
          Completing your login...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please wait while we process your Google authentication.
        </Typography>
      </Box>
    </Container>
  );
};

export default OAuthCallback;