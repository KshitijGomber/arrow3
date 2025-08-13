import React from 'react';
import { Grid, useTheme, useMediaQuery } from '@mui/material';

const ResponsiveGrid = ({ 
  children, 
  spacing = 3,
  itemProps = {},
  containerProps = {},
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Responsive spacing
  const responsiveSpacing = isMobile ? 2 : isTablet ? 2.5 : spacing;

  // Default responsive item props for drone cards
  const defaultItemProps = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3,
    ...itemProps,
  };

  return (
    <Grid 
      container 
      spacing={responsiveSpacing} 
      {...containerProps}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <Grid item {...defaultItemProps} key={index}>
          {child}
        </Grid>
      ))}
    </Grid>
  );
};

export default ResponsiveGrid;