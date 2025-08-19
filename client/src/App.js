import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

// Common components
import { ErrorBoundary, ProtectedRoute, LoadingSpinner, PerformanceMonitor } from './components/common';

// Context providers
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';


// Lazy load components for code splitting
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const DroneCatalog = React.lazy(() => import('./pages/DroneCatalog'));
const DroneDetailsPage = React.lazy(() => import('./pages/DroneDetailsPage'));
const OrderPage = React.lazy(() => import('./pages/OrderPage'));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'));
const SupportPage = React.lazy(() => import('./pages/SupportPage'));
const WhereToBuyPage = React.lazy(() => import('./pages/WhereToBuyPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/auth/ResetPasswordPage'));
const OAuthCallback = React.lazy(() => import('./pages/auth/OAuthCallback'));
const AdminPanel = React.lazy(() => import('./pages/admin/AdminPanel'));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));


function App() {
  return (
    <ErrorBoundary>
      <CustomThemeProvider>
        <AuthProvider>
          <PerformanceMonitor />
          <Box sx={{ minHeight: '100vh' }}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/drones" element={<DroneCatalog />} />
              <Route path="/drones/:droneId" element={<DroneDetailsPage />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/order/:droneId" element={<OrderPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/where-to-buy" element={<WhereToBuyPage />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              
              {/* Protected routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
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
          </Suspense>
        </Box>
      </AuthProvider>
      </CustomThemeProvider>
    </ErrorBoundary>
  );
}

export default App;