import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

// Admin components
import AdminDashboard from './AdminDashboard';
import AdminNavigation from './AdminNavigation';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import MediaManagement from './MediaManagement';

const AdminPanel = () => {
  const { user } = useAuth();

  // Double-check admin role (should already be handled by ProtectedRoute)
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(180deg, 
        rgba(10, 10, 10, 1) 0%, 
        rgba(18, 18, 18, 1) 50%, 
        rgba(10, 10, 10, 1) 100%
      )`,
      color: 'white',
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
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(46, 164, 165, 0.03) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(46, 164, 165, 0.03) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <AdminNavigation />
        
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Paper 
            elevation={3}
            sx={{ 
              background: `linear-gradient(135deg, 
                rgba(26, 26, 26, 0.8) 0%, 
                rgba(42, 42, 42, 0.6) 100%
              )`,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              overflow: 'hidden',
              backdropFilter: 'blur(10px)'
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