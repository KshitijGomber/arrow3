import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  Button,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { 
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { usePasswordReset } from '../../hooks/usePasswordReset';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    success,
    requestData,
    handleRequestChange,
    handleForgotPassword
  } = usePasswordReset();

  const [localError, setLocalError] = useState('');

  const onSubmit = async (event) => {
    setLocalError('');
    await handleForgotPassword(event);
  };

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
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/login')}
              sx={{ 
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'primary.main'
                }
              }}
            >
              Back to Login
            </Button>
          </Box>

          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            Reset Your Password
          </Typography>
          
          <Typography 
            variant="body1" 
            align="center"
            sx={{ 
              color: 'text.secondary',
              mb: 4
            }}
          >
            Enter your email address and we'll send you a link to reset your password.
          </Typography>

          {/* Display errors */}
          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || localError}
            </Alert>
          )}
          
          {/* Display success message */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {!success && (
            <Box component="form" onSubmit={onSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={requestData.email}
                onChange={handleRequestChange('email')}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !requestData.email}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '&:disabled': {
                    backgroundColor: 'action.disabledBackground',
                    color: 'action.disabled',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </Box>
          )}

          {success && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Didn't receive the email? Check your spam folder or try again.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{ 
                  textTransform: 'none',
                  mr: 2
                }}
              >
                Try Again
              </Button>
              <Button
                component={Link}
                to="/login"
                variant="text"
                sx={{ 
                  textTransform: 'none',
                  color: 'primary.main'
                }}
              >
                Back to Login
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;