import React from 'react';
import { Container, useTheme, useMediaQuery } from '@mui/material';

const ResponsiveContainer = ({ 
  children, 
  maxWidth = 'lg', 
  disableGutters = false,
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const responsiveSx = {
    px: {
      xs: isMobile ? 2 : 3,
      sm: isTablet ? 3 : 4,
      md: 4,
      lg: 5,
    },
    ...sx,
  };

  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={responsiveSx}
      {...props}
    >
      {children}
    </Container>
  );
};

export default ResponsiveContainer;