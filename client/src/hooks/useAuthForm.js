import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, validatePassword } from '../utils/helpers';

/**
 * Custom hook for authentication forms (login/register)
 * @param {string} type - 'login' or 'register'
 * @returns {object} Form state and handlers
 */
export const useAuthForm = (type = 'login') => {
  const { login, register, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: type === 'register' ? '' : undefined,
    lastName: type === 'register' ? '' : undefined,
    confirmPassword: type === 'register' ? '' : undefined,
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (type === 'register') {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors[0];
      }
    }

    // Register-specific validations
    if (type === 'register') {
      if (!formData.firstName?.trim()) {
        errors.firstName = 'First name is required';
      }
      
      if (!formData.lastName?.trim()) {
        errors.lastName = 'Last name is required';
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return { success: false, error: 'Please fix the form errors' };
    }

    try {
      let result;
      if (type === 'login') {
        result = await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        result = await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim()
        });
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: type === 'register' ? '' : undefined,
      lastName: type === 'register' ? '' : undefined,
      confirmPassword: type === 'register' ? '' : undefined,
    });
    setFormErrors({});
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return {
    formData,
    formErrors,
    showPassword,
    loading,
    error,
    handleChange,
    handleSubmit,
    resetForm,
    togglePasswordVisibility,
    isValid: Object.keys(formErrors).length === 0 && 
             formData.email && 
             formData.password &&
             (type === 'login' || (formData.firstName && formData.lastName && formData.confirmPassword))
  };
};