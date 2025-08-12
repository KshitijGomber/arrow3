import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Divider, 
  Alert,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Grid
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import GoogleOAuthButton from '../../components/GoogleOAuthButton';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const error = searchParams.get('error');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Use auth form hook
  const {
    formData,
    formErrors,
    showPassword,
    loading,
    handleChange,
    handleSubmit,
    togglePasswordVisibility,
    isValid
  } = useAuthForm('register');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Check for redirect path
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, navigate]);

  // Handle form submission
  const onSubmit = async (event) => {
    setSubmitError('');
    setSubmitSuccess('');
    
    const result = await handleSubmit(event);
    
    if (result.success) {
      setSubmitSuccess('Registration successful! Welcome to Arrow3 Aerospace!');
      // Navigation will be handled by the useEffect above
    } else {
      setSubmitError(result.error);
    }
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
            Join Arrow3 Aerospace
          </Typography>
          
          <Typography 
            variant="body1" 
            align="center"
            sx={{ 
              color: 'text.secondary',
              mb: 4
            }}
          >
            Create your account to start exploring our drone collection
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
            <GoogleOAuthButton text="Sign up with Google" />
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Display submit errors/success */}
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}
          
          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {submitSuccess}
            </Alert>
          )}

          {/* Email/Password Registration Form */}
          <Box component="form" onSubmit={onSubmit} sx={{ mb: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              error={!!formErrors.password}
              helperText={formErrors.password || 'Password must be at least 8 characters with uppercase, lowercase, and number'}
              disabled={loading}
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
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={loading}
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
              disabled={!isValid || loading}
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
                'Create Account'
              )}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'primary.main'
                }}
              >
                Sign in
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;