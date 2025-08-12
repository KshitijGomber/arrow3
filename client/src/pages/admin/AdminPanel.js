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
      backgroundColor: '#0a0a0a',
      color: 'white'
    }}>
      <AdminNavigation />
      
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper 
          elevation={3}
          sx={{ 
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: 2,
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
  );
};

export default AdminPanel;