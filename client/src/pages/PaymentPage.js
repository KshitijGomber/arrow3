import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const PaymentPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Payment Page
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          🚧 Payment page will be implemented in later tasks
        </Typography>
      </Box>
    </Container>
  );
};

export default PaymentPage;