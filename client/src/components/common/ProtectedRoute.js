import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  redirectTo 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />;
  }

  // Determine redirect destination
  const getRedirectPath = () => {
    if (redirectTo) return redirectTo;
    return requireAdmin ? '/admin/login' : '/login';
  };

  // Redirect to appropriate login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={getRedirectPath()} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check admin requirement
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <Navigate 
        to="/admin/login" 
        replace 
      />
    );
  }

  return children;
};

export default ProtectedRoute;