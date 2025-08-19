import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Menu, 
  MenuItem,
  IconButton,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  ExitToApp as LogoutIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCustomTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../../components/common';

const AdminNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    handleUserMenuClose();
  };

  const navigationItems = [
    { 
      label: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: <DashboardIcon />,
      active: location.pathname === '/admin' || location.pathname === '/admin/dashboard'
    },
    { 
      label: 'Products', 
      path: '/admin/products', 
      icon: <ProductsIcon />,
      active: location.pathname.startsWith('/admin/products')
    },
    { 
      label: 'Orders', 
      path: '/admin/orders', 
      icon: <OrdersIcon />,
      active: location.pathname.startsWith('/admin/orders')
    }
  ];

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: `linear-gradient(135deg, 
          ${theme.palette.background.paper} 0%, 
          ${theme.palette.background.elevated} 100%
        )`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.palette.primary.main}30`,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar>
        {/* Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(135deg, 
                #ffffff 0%, 
                #2ea4a5 50%, 
                #ffffff 100%
              )`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            Arrow3 Admin
          </Typography>
          <Chip 
            label="ADMIN" 
            size="small" 
            sx={{ 
              ml: 2,
              backgroundColor: '#2ea4a5',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '0.7rem'
            }} 
          />
        </Box>

        {/* Navigation Items */}
        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                color: item.active ? theme.palette.primary.main : theme.palette.text.primary,
                backgroundColor: item.active ? `${theme.palette.primary.main}20` : 'transparent',
                border: item.active ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
                borderRadius: 2,
                px: 2,
                py: 1,
                textTransform: 'none',
                fontWeight: item.active ? 'bold' : 'normal',
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}20`,
                  border: `1px solid ${theme.palette.primary.main}`
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ThemeToggle size="small" />
          <Button
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              color: theme.palette.text.primary,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            View Site
          </Button>

          <IconButton
            onClick={handleUserMenuOpen}
            sx={{ 
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                backgroundColor: '#2ea4a5',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            PaperProps={{
              sx: {
                background: `linear-gradient(135deg, 
                  ${theme.palette.background.paper} 0%, 
                  ${theme.palette.background.elevated} 100%
                )`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.palette.primary.main}30`,
                color: theme.palette.text.primary,
                mt: 1
              }
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ backgroundColor: theme.palette.divider }} />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavigation;