import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const LoginPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Login
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          🚧 Login page will be implemented in later tasks
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;