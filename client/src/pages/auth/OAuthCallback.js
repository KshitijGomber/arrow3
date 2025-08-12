import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Container, 
  Alert,
  Button 
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh');
        const user = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          setMessage(getErrorMessage(error));
          
          // Auto-redirect after showing error
          setTimeout(() => {
            navigate('/login?error=' + encodeURIComponent(getErrorMessage(error)));
          }, 3000);
          return;
        }

        if (!token || !refreshToken || !user) {
          setStatus('error');
          setMessage('Invalid authentication response. Missing required parameters.');
          
          setTimeout(() => {
            navigate('/login?error=' + encodeURIComponent('Invalid callback parameters'));
          }, 3000);
          return;
        }

        // Process the OAuth callback
        const result = handleOAuthCallback(token, refreshToken, user);
        
        if (result.success) {
          setStatus('success');
          setMessage('Login successful! Redirecting...');
          
          // Redirect to intended page
          setTimeout(() => {
            const redirectTo = localStorage.getItem('redirectAfterLogin') || '/';
            localStorage.removeItem('redirectAfterLogin');
            navigate(redirectTo);
          }, 1500);
        } else {
          setStatus('error');
          setMessage('Failed to process login. Please try again.');
          
          setTimeout(() => {
            navigate('/login?error=' + encodeURIComponent('Failed to process login'));
          }, 3000);
        }
      } catch (callbackError) {
        console.error('OAuth callback processing error:', callbackError);
        setStatus('error');
        setMessage('An unexpected error occurred during authentication.');
        
        setTimeout(() => {
          navigate('/login?error=' + encodeURIComponent('Failed to process authentication'));
        }, 3000);
      }
    };

    // Small delay to ensure the component is mounted
    const timer = setTimeout(processCallback, 500);
    return () => clearTimeout(timer);
  }, [searchParams, handleOAuthCallback, navigate]);

  const getErrorMessage = (error) => {
    switch (error) {
      case 'oauth_failed':
        return 'Google authentication failed. Please try again.';
      case 'oauth_error':
        return 'An error occurred during Google authentication.';
      case 'access_denied':
        return 'Google authentication was cancelled. Please try again.';
      case 'invalid_request':
        return 'Invalid authentication request. Please try again.';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  const handleRetry = () => {
    navigate('/login');
  };

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
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
          </>
        );
      
      case 'success':
        return (
          <>
            <CheckCircle 
              sx={{ 
                fontSize: 60,
                color: 'success.main',
                mb: 3
              }} 
            />
            <Typography variant="h5" gutterBottom color="success.main">
              Login Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {message}
            </Typography>
          </>
        );
      
      case 'error':
        return (
          <>
            <Error 
              sx={{ 
                fontSize: 60,
                color: 'error.main',
                mb: 3
              }} 
            />
            <Typography variant="h5" gutterBottom color="error.main">
              Authentication Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 3, maxWidth: 400 }}>
              {message}
            </Alert>
            <Button 
              variant="contained" 
              onClick={handleRetry}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          </>
        );
      
      default:
        return null;
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
          minHeight: '60vh',
          textAlign: 'center',
          py: 4
        }}
      >
        {renderContent()}
      </Box>
    </Container>
  );
};

export default OAuthCallback;