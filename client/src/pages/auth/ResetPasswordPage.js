import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { usePasswordReset } from '../../hooks/usePasswordReset';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const {
    step,
    loading,
    error,
    resetData,
    handleResetChange,
    handleResetPassword,
    setTokenFromUrl
  } = usePasswordReset();

  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Set token from URL on mount
  useEffect(() => {
    if (token) {
      setTokenFromUrl(token);
    } else {
      setLocalError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token, setTokenFromUrl]);

  const onSubmit = async (event) => {
    setLocalError('');
    await handleResetPassword(event);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // If no token, show error
  if (!token) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              backgroundColor: 'background.paper',
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <Alert severity="error" sx={{ mb: 3 }}>
              Invalid or missing reset token. Please request a new password reset.
            </Alert>
            <Button
              component={Link}
              to="/forgot-password"
              variant="contained"
              sx={{ mr: 2 }}
            >
              Request New Reset
            </Button>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
            >
              Back to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

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
          {step === 'success' ? (
            // Success state
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircleIcon 
                sx={{ 
                  fontSize: 64, 
                  color: 'success.main', 
                  mb: 2 
                }} 
              />
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2
                }}
              >
                Password Reset Successful!
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 4
                }}
              >
                Your password has been successfully reset. You can now login with your new password.
              </Typography>

              <Button
                component={Link}
                to="/login"
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Go to Login
              </Button>
            </Box>
          ) : (
            // Reset form
            <>
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
                Set New Password
              </Typography>
              
              <Typography 
                variant="body1" 
                align="center"
                sx={{ 
                  color: 'text.secondary',
                  mb: 4
                }}
              >
                Enter your new password below. Make sure it's strong and secure.
              </Typography>

              {/* Display errors */}
              {(error || localError) && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error || localError}
                </Alert>
              )}

              <Box component="form" onSubmit={onSubmit}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={resetData.password}
                  onChange={handleResetChange('password')}
                  disabled={loading}
                  required
                  helperText="Password must be at least 8 characters with uppercase, lowercase, and number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={resetData.confirmPassword}
                  onChange={handleResetChange('confirmPassword')}
                  disabled={loading}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
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
                  disabled={loading || !resetData.password || !resetData.confirmPassword}
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
                    'Reset Password'
                  )}
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
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
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;