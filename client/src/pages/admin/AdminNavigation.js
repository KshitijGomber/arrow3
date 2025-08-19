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
        background: `linear-gradient(135deg, 
          rgba(26, 26, 26, 0.95) 0%, 
          rgba(42, 42, 42, 0.95) 100%
        )`,
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(46, 164, 165, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
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
                color: item.active ? '#2ea4a5' : 'white',
                backgroundColor: item.active ? 'rgba(46, 164, 165, 0.1)' : 'transparent',
                border: item.active ? '1px solid #2ea4a5' : '1px solid transparent',
                borderRadius: 2,
                px: 2,
                py: 1,
                textTransform: 'none',
                fontWeight: item.active ? 'bold' : 'normal',
                '&:hover': {
                  backgroundColor: 'rgba(46, 164, 165, 0.1)',
                  border: '1px solid #2ea4a5'
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
                  rgba(26, 26, 26, 0.95) 0%, 
                  rgba(42, 42, 42, 0.95) 100%
                )`,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(46, 164, 165, 0.2)',
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
            <Divider sx={{ backgroundColor: 'rgba(46, 164, 165, 0.2)' }} />
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