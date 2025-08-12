import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, API_ENDPOINTS } from '../utils/constants';
import api from '../utils/api';

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem(STORAGE_KEYS.TOKEN),
  loading: true, // Start with loading true to check existing token
  error: null,
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Token refresh function
  const refreshToken = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: refreshTokenValue
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      return accessToken;
    } catch (error) {
      // Refresh failed, logout user
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  }, []);

  // Check for existing token on mount and verify it
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        try {
          const response = await api.get(API_ENDPOINTS.VERIFY_TOKEN);
          
          if (response.data.success) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: response.data.data.user,
                token
              }
            });
          } else {
            // Token is invalid, try to refresh
            try {
              await refreshToken();
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
        } catch (error) {
          // If token verification fails, try to refresh
          if (error.response?.status === 401) {
            try {
              await refreshToken();
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          } else {
            console.error('Token verification failed:', error);
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem('refreshToken');
          }
        }
      }
      
      // Set loading to false after token check
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    verifyToken();
  }, [refreshToken]);

  // Auth actions
  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
      const { user, accessToken, refreshToken: newRefreshToken } = response.data.data;

      localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          token: accessToken
        }
      });

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, userData);
      const { user, accessToken, refreshToken: newRefreshToken } = response.data.data;

      localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          token: accessToken
        }
      });

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Google OAuth login
  const loginWithGoogle = () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      
      // Check if Google OAuth is configured
      if (!googleClientId || googleClientId === 'your-google-client-id') {
        throw new Error('Google OAuth is not configured');
      }
      
      // Set loading state
      dispatch({ type: 'LOGIN_START' });
      
      // Redirect to Google OAuth
      window.location.href = `${apiUrl}${API_ENDPOINTS.GOOGLE_AUTH}`;
    } catch (error) {
      console.error('Google OAuth initiation error:', error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message || 'Failed to initiate Google login'
      });
      throw error;
    }
  };

  // Handle OAuth callback
  const handleOAuthCallback = (token, refreshTokenValue, user) => {
    try {
      if (!token || !refreshTokenValue || !user) {
        throw new Error('Missing required OAuth callback parameters');
      }

      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem('refreshToken', refreshTokenValue);
      
      const userData = typeof user === 'string' ? JSON.parse(user) : user;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: userData,
          token
        }
      });
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('OAuth callback error:', error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: 'Failed to process OAuth login'
      });
      return { success: false, error: 'Failed to process OAuth login' };
    }
  };

  // Link Google account to existing user
  const linkGoogleAccount = async (googleId) => {
    try {
      const response = await api.post('/auth/google/link', { googleId });
      
      if (response.data.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.data.user
        });
        return { success: true, message: 'Google account linked successfully' };
      }
      
      return { success: false, error: 'Failed to link Google account' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to link Google account';
      return { success: false, error: errorMessage };
    }
  };

  // Unlink Google account
  const unlinkGoogleAccount = async () => {
    try {
      const response = await api.delete('/auth/google/unlink');
      
      if (response.data.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.data.user
        });
        return { success: true, message: 'Google account unlinked successfully' };
      }
      
      return { success: false, error: 'Failed to unlink Google account' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to unlink Google account';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Optionally call logout endpoint to invalidate tokens on server
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if server call fails
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Update user profile
  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await api.post(API_ENDPOINTS.RESET_PASSWORD, {
        token,
        password: newPassword
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    loginWithGoogle,
    handleOAuthCallback,
    linkGoogleAccount,
    unlinkGoogleAccount,
    updateUser,
    forgotPassword,
    resetPassword,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;