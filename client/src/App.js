import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

// Import components
import LandingPage from './pages/LandingPage';
import DroneCatalog from './pages/DroneCatalog';
import DroneDetailsPage from './pages/DroneDetailsPage';
import OrderPage from './pages/OrderPage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OAuthCallback from './pages/auth/OAuthCallback';
import AdminPanel from './pages/admin/AdminPanel';
import AdminLogin from './pages/admin/AdminLogin';

// Common components
import { ErrorBoundary, ProtectedRoute } from './components/common';

// Context providers
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/drones" element={<DroneCatalog />} />
            <Route path="/drones/:droneId" element={<DroneDetailsPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/order/:droneId" element={<OrderPage />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            
            {/* Protected routes */}
            <Route 
              path="/payment" 
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 fallback */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Box>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;