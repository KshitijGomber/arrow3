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
  PhotoLibrary as MediaIcon,
  ExitToApp as LogoutIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
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
    },
    { 
      label: 'Media', 
      path: '/admin/media', 
      icon: <MediaIcon />,
      active: location.pathname.startsWith('/admin/media')
    }
  ];

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid #333',
        boxShadow: 'none'
      }}
    >
      <Toolbar>
        {/* Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              color: '#00ff88',
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
              backgroundColor: '#00ff88',
              color: '#000',
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
                color: item.active ? '#00ff88' : 'white',
                backgroundColor: item.active ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                border: item.active ? '1px solid #00ff88' : '1px solid transparent',
                borderRadius: 2,
                px: 2,
                py: 1,
                textTransform: 'none',
                fontWeight: item.active ? 'bold' : 'normal',
                '&:hover': {
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid #00ff88'
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              color: 'white',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            View Site
          </Button>

          <IconButton
            onClick={handleUserMenuOpen}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                backgroundColor: '#00ff88',
                color: '#000',
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
                backgroundColor: '#2a2a2a',
                border: '1px solid #333',
                color: 'white',
                mt: 1
              }
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#aaa' }}>
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ backgroundColor: '#333' }} />
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