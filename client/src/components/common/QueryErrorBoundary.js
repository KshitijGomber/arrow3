import React from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';
import ErrorBoundary from './ErrorBoundary';

const QueryErrorFallback = ({ error, resetErrorBoundary }) => {
  const isNetworkError = !error?.response;
  const isServerError = error?.response?.status >= 500;
  
  let title = 'Something went wrong';
  let message = 'An unexpected error occurred while loading data.';
  
  if (isNetworkError) {
    title = 'Connection Error';
    message = 'Unable to connect to the server. Please check your internet connection and try again.';
  } else if (isServerError) {
    title = 'Server Error';
    message = 'The server is experiencing issues. Please try again in a few moments.';
  } else if (error?.response?.status === 404) {
    title = 'Not Found';
    message = 'The requested data could not be found.';
  } else if (error?.response?.status === 403) {
    title = 'Access Denied';
    message = 'You do not have permission to access this data.';
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      p={3}
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          maxWidth: 400,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'error.main',
        }}
      >
        <ErrorOutline 
          sx={{ 
            fontSize: 48, 
            color: 'error.main', 
            mb: 2 
          }} 
        />
        
        <Typography variant="h6" gutterBottom color="error">
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {message}
        </Typography>
        
        {process.env.NODE_ENV === 'development' && error?.message && (
          <Typography 
            variant="caption" 
            color="error" 
            sx={{ 
              display: 'block', 
              mt: 2, 
              p: 1, 
              bgcolor: 'grey.900', 
              borderRadius: 1,
              fontFamily: 'monospace'
            }}
          >
            {error.message}
          </Typography>
        )}
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Refresh />}
          onClick={resetErrorBoundary}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Paper>
    </Box>
  );
};

const QueryErrorBoundary = ({ children, fallback }) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={fallback || QueryErrorFallback}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export default QueryErrorBoundary;