import React from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Brightness4 as Brightness4Icon,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ variant = 'icon', size = 'medium', showLabel = false }) => {
  const { mode, toggleTheme, isDark } = useTheme();
  const muiTheme = useMuiTheme();

  const getIcon = () => {
    if (variant === 'auto') {
      return <Brightness4Icon />;
    }
    return isDark ? <LightModeIcon /> : <DarkModeIcon />;
  };

  const getTooltip = () => {
    if (variant === 'auto') {
      return 'Toggle theme';
    }
    return isDark ? 'Switch to light mode' : 'Switch to dark mode';
  };

  const getLabel = () => {
    if (variant === 'auto') {
      return 'Theme';
    }
    return isDark ? 'Light Mode' : 'Dark Mode';
  };

  if (showLabel) {
    return (
      <Box
        onClick={toggleTheme}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: muiTheme.palette.action.hover,
          },
        }}
      >
        {getIcon()}
        <Box sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
          {getLabel()}
        </Box>
      </Box>
    );
  }

  return (
    <Tooltip title={getTooltip()} arrow>
      <IconButton
        onClick={toggleTheme}
        size={size}
        sx={{
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: muiTheme.palette.action.hover,
            transform: 'scale(1.1)',
          },
          '& .MuiSvgIcon-root': {
            transition: 'all 0.3s ease',
            color: muiTheme.palette.primary.main,
          },
        }}
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;