import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, Paper, useTheme } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { adminStyles } from '../../utils/adminTheme';

// Admin components
import AdminDashboard from './AdminDashboard';
import AdminNavigation from './AdminNavigation';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import MediaManagement from './MediaManagement';

const AdminPanel = () => {
  const theme = useTheme();
  const { user } = useAuth();

  // Double-check admin role (should already be handled by ProtectedRoute)
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Box sx={{ 
      ...adminStyles.gradientBackground(theme),
      position: 'relative'
    }}>
      {/* Background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 20%, ${theme.palette.primary.main}08 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, ${theme.palette.primary.main}08 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <AdminNavigation />
        
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Paper 
            elevation={3}
            sx={{ 
              ...adminStyles.glassPaper(theme),
              overflow: 'hidden'
            }}
          >
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products/*" element={<ProductManagement />} />
              <Route path="orders/*" element={<OrderManagement />} />
              <Route path="media/*" element={<MediaManagement />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminPanel;