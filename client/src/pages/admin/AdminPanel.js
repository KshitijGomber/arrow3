import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const AdminPanel = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Admin Panel
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          🚧 Admin panel will be implemented in later tasks
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminPanel;