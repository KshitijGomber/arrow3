import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const RegisterPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Register
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          🚧 Registration page will be implemented in later tasks
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage;