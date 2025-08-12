import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin');
    } else if (isAuthenticated && user?.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          setError('Access denied. Admin privileges required.');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/setup-admin', formData);
      
      if (response.data.success) {
        setSuccess('Admin user created successfully! You can now log in.');
        setIsSetupMode(false);
        setFormData({
          email: formData.email,
          password: '',
          firstName: '',
          lastName: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: 2
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AdminIcon sx={{ fontSize: 48, color: '#00ff88', mb: 2 }} />
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                color: 'white'
              }}
            >
              {isSetupMode ? 'Admin Setup' : 'Admin Login'}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#aaa'
              }}
            >
              {isSetupMode 
                ? 'Create your admin account (development only)'
                : 'Access the Arrow3 Aerospace admin panel'
              }
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                color: '#f44336'
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                color: '#4caf50'
              }}
            >
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={isSetupMode ? handleAdminSetup : handleLogin}>
            {isSetupMode && (
              <>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#2a2a2a',
                      '& fieldset': { borderColor: '#333' },
                      '&:hover fieldset': { borderColor: '#00ff88' },
                      '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                    },
                    '& .MuiInputLabel-root': { color: '#aaa' },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#2a2a2a',
                      '& fieldset': { borderColor: '#333' },
                      '&:hover fieldset': { borderColor: '#00ff88' },
                      '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                    },
                    '& .MuiInputLabel-root': { color: '#aaa' },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
              </>
            )}

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#2a2a2a',
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#00ff88' },
                  '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                },
                '& .MuiInputLabel-root': { color: '#aaa' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#2a2a2a',
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#00ff88' },
                  '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                },
                '& .MuiInputLabel-root': { color: '#aaa' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{
                py: 1.5,
                backgroundColor: '#00ff88',
                color: '#000',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#00cc6a'
                },
                '&:disabled': {
                  backgroundColor: '#333',
                  color: '#666'
                }
              }}
            >
              {loading 
                ? (isSetupMode ? 'Creating Admin...' : 'Signing In...') 
                : (isSetupMode ? 'Create Admin Account' : 'Sign In')
              }
            </Button>
          </Box>

          <Divider sx={{ my: 3, backgroundColor: '#333' }} />

          <Box sx={{ textAlign: 'center' }}>
            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="text"
                onClick={() => {
                  setIsSetupMode(!isSetupMode);
                  setError('');
                  setSuccess('');
                }}
                sx={{ 
                  textTransform: 'none',
                  color: '#00ff88'
                }}
              >
                {isSetupMode ? 'Back to Login' : 'Need to create admin account?'}
              </Button>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="text"
                onClick={() => navigate('/')}
                sx={{ 
                  textTransform: 'none',
                  color: '#aaa'
                }}
              >
                ← Back to Main Site
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin;