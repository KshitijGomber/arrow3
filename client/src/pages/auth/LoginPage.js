import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Divider, 
  Alert,
  Button
} from '@mui/material';
import GoogleOAuthButton from '../../components/GoogleOAuthButton';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const error = searchParams.get('error');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            backgroundColor: 'background.paper',
            borderRadius: 2
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              mb: 3
            }}
          >
            Welcome Back
          </Typography>
          
          <Typography 
            variant="body1" 
            align="center"
            sx={{ 
              color: 'text.secondary',
              mb: 4
            }}
          >
            Sign in to your Arrow3 Aerospace account
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => {
                // Remove error from URL
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete('error');
                navigate({ search: newSearchParams.toString() }, { replace: true });
              }}
            >
              {decodeURIComponent(error)}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <GoogleOAuthButton text="Sign in with Google" />
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              🚧 Email/password login will be implemented in later tasks
            </Typography>
            
            <Button
              variant="outlined"
              fullWidth
              disabled
              sx={{ mb: 2 }}
            >
              Sign in with Email
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/register')}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'primary.main'
                }}
              >
                Sign up
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;