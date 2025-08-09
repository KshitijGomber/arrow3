import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const OrderPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Order Page
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          🚧 Order page will be implemented in later tasks
        </Typography>
      </Box>
    </Container>
  );
};

export default OrderPage;