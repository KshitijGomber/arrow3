import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, validatePassword } from '../utils/helpers';

/**
 * Custom hook for password reset functionality
 * @returns {object} Password reset state and handlers
 */
export const usePasswordReset = () => {
  const { forgotPassword, resetPassword } = useAuth();
  
  const [step, setStep] = useState('request'); // 'request' | 'reset' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [requestData, setRequestData] = useState({
    email: ''
  });
  
  const [resetData, setResetData] = useState({
    token: '',
    password: '',
    confirmPassword: ''
  });

  // Handle request form changes
  const handleRequestChange = (field) => (event) => {
    setRequestData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

  // Handle reset form changes
  const handleResetChange = (field) => (event) => {
    setResetData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

  // Request password reset
  const handleForgotPassword = async (event) => {
    event.preventDefault();
    
    if (!requestData.email) {
      setError('Email is required');
      return;
    }
    
    if (!isValidEmail(requestData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await forgotPassword(requestData.email);
      
      if (result.success) {
        setSuccess('Password reset link sent to your email');
        setStep('success');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async (event) => {
    event.preventDefault();
    
    // Validate form
    if (!resetData.token) {
      setError('Reset token is required');
      return;
    }
    
    if (!resetData.password) {
      setError('New password is required');
      return;
    }
    
    const passwordValidation = validatePassword(resetData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      return;
    }
    
    if (resetData.password !== resetData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await resetPassword(resetData.token, resetData.password);
      
      if (result.success) {
        setSuccess('Password reset successfully! You can now login with your new password.');
        setStep('success');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Set token from URL params (for reset page)
  const setTokenFromUrl = (token) => {
    setResetData(prev => ({
      ...prev,
      token
    }));
    setStep('reset');
  };

  // Reset to initial state
  const reset = () => {
    setStep('request');
    setLoading(false);
    setError('');
    setSuccess('');
    setRequestData({ email: '' });
    setResetData({ token: '', password: '', confirmPassword: '' });
  };

  return {
    step,
    loading,
    error,
    success,
    requestData,
    resetData,
    handleRequestChange,
    handleResetChange,
    handleForgotPassword,
    handleResetPassword,
    setTokenFromUrl,
    reset,
    setStep
  };
};