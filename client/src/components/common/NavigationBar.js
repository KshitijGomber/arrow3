import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountCircle,
  Login,
  PersonAdd,
  Logout,
  Dashboard,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './index';

const NavigationBar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user, logout } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const menuItems = [
    { label: 'Camera Drones', path: '/drones?category=camera' },
    { label: 'Handheld', path: '/drones?category=handheld' },
    { label: 'Power', path: '/drones?category=power' },
    { label: 'Specialized', path: '/drones?category=specialized' },
    { label: 'Explore', path: '/drones' },
    { label: 'Support', path: '/support' },
    { label: 'Where to Buy', path: '/where-to-buy' },
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    handleUserMenuClose();
    navigate('/');
  };

  const renderDesktopMenu = () => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
      {menuItems.map((item) => (
        <Button
          key={item.label}
          color="inherit"
          onClick={() => handleNavigation(item.path)}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: 'primary.main',
            },
          }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );

  const renderAuthButtons = () => {
    if (isAuthenticated && user) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={handleUserMenuOpen}
            sx={{
              p: 0,
              border: '2px solid transparent',
              '&:hover': {
                border: '2px solid',
                borderColor: 'primary.main',
              },
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                width: 40,
                height: 40,
              }}
            >
              {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2">
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            {user.role === 'admin' && (
              <MenuItem onClick={() => { handleNavigation('/admin'); handleUserMenuClose(); }}>
                <Dashboard sx={{ mr: 1 }} />
                Admin Panel
              </MenuItem>
            )}
            <MenuItem onClick={() => { handleNavigation('/profile'); handleUserMenuClose(); }}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      );
    }

    return (
      <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<Login />}
          onClick={() => navigate('/login')}
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.light',
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          Login
        </Button>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => navigate('/register')}
          sx={{
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          Sign Up
        </Button>
      </Box>
    );
  };

  const renderMobileDrawer = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      PaperProps={{
        sx: {
          width: 280,
          backgroundColor: 'background.paper',
          borderLeft: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="primary.main">
          Menu
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ThemeToggle size="small" />
          <IconButton onClick={handleMobileMenuToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.label}
            button
            onClick={() => handleNavigation(item.path)}
            sx={{
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: 500,
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        {isAuthenticated && user ? (
          <Box>
            <Box sx={{ mb: 2, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            {user.role === 'admin' && (
              <Button
                fullWidth
                startIcon={<Dashboard />}
                onClick={() => handleNavigation('/admin')}
                sx={{ mb: 1, justifyContent: 'flex-start' }}
              >
                Admin Panel
              </Button>
            )}
            <Button
              fullWidth
              startIcon={<AccountCircle />}
              onClick={() => handleNavigation('/profile')}
              sx={{ mb: 1, justifyContent: 'flex-start' }}
            >
              Profile
            </Button>
            <Button
              fullWidth
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{ justifyContent: 'flex-start' }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Login />}
              onClick={() => handleNavigation('/login')}
            >
              Login
            </Button>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PersonAdd />}
              onClick={() => handleNavigation('/register')}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(10, 10, 10, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Logo */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              flexGrow: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              mr: 4,
              '&:hover': {
                '& .logo-text': {
                  color: 'primary.light',
                },
              },
            }}
          >
            <img
              src="/logoarrow3.png"
              alt="Arrow3 Logo"
              style={{
                height: 32,
                width: 'auto',
                filter: `drop-shadow(0 0 4px ${theme.palette.primary.main})`,
              }}
            />
            <Typography
              variant="h5"
              component="div"
              className="logo-text"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                transition: 'color 0.2s ease',
              }}
            >
              Arrow3
            </Typography>
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1 }}>
            {renderDesktopMenu()}
          </Box>

          {/* Auth Buttons */}
          {renderAuthButtons()}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile Menu Button */}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleMobileMenuToggle}
            sx={{
              display: { xs: 'flex', md: 'none' },
              ml: 1,
              color: 'primary.main',
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      {renderMobileDrawer()}
    </>
  );
};

export default NavigationBar;