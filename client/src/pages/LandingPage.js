import React from 'react';
import { Box } from '@mui/material';
import { NavigationBar } from '../components/common';
import { HeroSection, FeatureHighlights, TestimonialsSection } from '../components/landing';

const LandingPage = () => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <NavigationBar />
      <HeroSection />
      <FeatureHighlights />
      <TestimonialsSection />
    </Box>
  );
};

export default LandingPage;