import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: 4,
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          Arrow3 Aerospace
        </Typography>
        <Typography variant="h4" component="h2" sx={{ mb: 4, color: 'text.secondary' }}>
          Take Flight Now
        </Typography>
        <Typography variant="body1" sx={{ mb: 6, maxWidth: 600 }}>
          Premium drone technology for professionals and enthusiasts. 
          Experience the future of aerial innovation with our cutting-edge drones.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/order')}
            sx={{ minWidth: 200 }}
          >
            Take Flight Now
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/drones')}
            sx={{ minWidth: 200 }}
          >
            Show Me the Drone in Action
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
          🚧 Landing page components will be implemented in later tasks
        </Typography>
      </Box>
    </Container>
  );
};

export default LandingPage;