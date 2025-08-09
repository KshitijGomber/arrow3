import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

// Import components (placeholders for now)
import LandingPage from './pages/LandingPage';
import DroneCatalog from './pages/DroneCatalog';
import OrderPage from './pages/OrderPage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OAuthCallback from './pages/auth/OAuthCallback';
import AdminPanel from './pages/admin/AdminPanel';

// Context providers
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/drones" element={<DroneCatalog />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/order/:droneId" element={<OrderPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          
          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminPanel />} />
          
          {/* 404 fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Box>
    </AuthProvider>
  );
}

export default App;