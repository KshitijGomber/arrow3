import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const DroneCatalog = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Drone Catalog
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          🚧 Drone catalog will be implemented in later tasks
        </Typography>
      </Box>
    </Container>
  );
};

export default DroneCatalog;