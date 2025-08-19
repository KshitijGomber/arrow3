import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  Skeleton,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  TrendingUp as TrendingIcon,
  People as UsersIcon,
  AttachMoney as RevenueIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStats, useDashboardAlerts } from '../../hooks/queries/useDashboardQueries';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch real-time dashboard data
  const { 
    data: dashboardData, 
    isLoading: statsLoading, 
    isError: statsError,
    refetch: refetchStats 
  } = useDashboardStats();
  
  const { 
    data: alertsData, 
    isLoading: alertsLoading,
    isError: alertsError 
  } = useDashboardAlerts();

  const stats = dashboardData?.overview || {};
  const recentOrders = dashboardData?.recentOrders || [];
  const lowStockProducts = dashboardData?.lowStockProducts || [];
  const alerts = alertsData?.alerts || [];

  // Debug logging
  console.log('Dashboard data:', { dashboardData, stats, statsLoading, statsError });

  // Add loading state check
  if (statsLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
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
            mb: 4,
            textAlign: 'center'
          }}
        >
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card sx={{ 
                background: `linear-gradient(135deg, 
                  rgba(26, 26, 26, 0.8) 0%, 
                  rgba(42, 42, 42, 0.6) 100%
                )`,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={32} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Add error state check
  if (statsError) {
    console.error('Dashboard stats error:', statsError);
    return (
      <Box sx={{ p: 3 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
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
            mb: 4,
            textAlign: 'center'
          }}
        >
          Dashboard
        </Typography>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid rgba(255, 68, 68, 0.2)',
            color: '#ffffff'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Failed to load dashboard data
          </Typography>
          <Typography variant="body2" gutterBottom>
            {statsError.response?.status === 401 
              ? 'Access denied. Please ensure you have admin privileges.'
              : statsError.response?.data?.message || 'Please try refreshing the page or contact support if the problem persists.'
            }
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button onClick={refetchStats} variant="contained" sx={{ mr: 2 }}>
              Retry
            </Button>
            {statsError.response?.status === 401 && (
              <Button onClick={() => navigate('/login')} variant="outlined">
                Login Again
              </Button>
            )}
          </Box>
        </Alert>
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: <ProductsIcon sx={{ fontSize: 40, color: '#2ea4a5' }} />,
      action: () => navigate('/admin/products'),
      color: '#2ea4a5'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: <OrdersIcon sx={{ fontSize: 40, color: '#ff6b35' }} />,
      action: () => navigate('/admin/orders'),
      color: '#ff6b35'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: <UsersIcon sx={{ fontSize: 40, color: '#4fc3f7' }} />,
      action: () => {},
      color: '#4fc3f7'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: <RevenueIcon sx={{ fontSize: 40, color: '#ffd54f' }} />,
      action: () => {},
      color: '#ffd54f'
    }
  ];

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'shipped': return 'success';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (statsLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
          Loading Dashboard...
        </Typography>
        <LinearProgress sx={{ mt: 2, backgroundColor: '#333' }} />
      </Box>
    );
  }

  if (statsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load dashboard data. 
          <Button onClick={() => refetchStats()} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
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
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            textAlign: 'center',
            justifyContent: 'center'
          }}
        >
          <DashboardIcon sx={{ color: '#2ea4a5' }} />
          Admin Dashboard
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center'
          }}
        >
          Welcome back, {user?.firstName}! Here's what's happening with your drone store.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                background: `linear-gradient(135deg, 
                  rgba(26, 26, 26, 0.8) 0%, 
                  rgba(42, 42, 42, 0.6) 100%
                )`,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: 2,
                '&:hover': {
                  borderColor: 'rgba(46, 164, 165, 0.3)',
                  transform: 'translateY(-2px)',
                  backgroundColor: 'rgba(46, 164, 165, 0.05)',
                  boxShadow: '0 8px 25px rgba(46, 164, 165, 0.2)'
                }
              }}
              onClick={card.action}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        color: '#2ea4a5', 
                        fontWeight: 700,
                        mb: 1
                      }}
                    >
                      {card.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.85rem',
                        fontWeight: 500
                      }}
                    >
                      {card.title}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      backgroundColor: 'rgba(46, 164, 165, 0.1)',
                      borderRadius: '50%',
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            background: `linear-gradient(135deg, 
              rgba(26, 26, 26, 0.8) 0%, 
              rgba(42, 42, 42, 0.6) 100%
            )`,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2
          }}>
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <TrendingIcon sx={{ color: '#00ff88' }} />
                Recent Orders
              </Typography>
              <Divider sx={{ backgroundColor: '#333', mb: 2 }} />
              
              {recentOrders.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentOrders.map((order) => (
                    <Box 
                      key={order.id}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        backgroundColor: 'rgba(26, 26, 26, 0.5)',
                        borderRadius: 1,
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'white' }}>
                          {order.orderId || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#aaa' }}>
                          {order.customer || 'Unknown Customer'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {order.drone || 'Unknown Drone'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#00ff88' }}>
                          ${(order.amount || 0).toFixed(2)}
                        </Typography>
                        <Chip 
                          label={order.status} 
                          size="small"
                          color={getOrderStatusColor(order.status)}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#aaa' }}>
                  No recent orders
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                onClick={() => navigate('/admin/orders')}
                sx={{ color: '#00ff88' }}
              >
                View All Orders
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Alerts & Notifications */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: `linear-gradient(135deg, 
              rgba(26, 26, 26, 0.8) 0%, 
              rgba(42, 42, 42, 0.6) 100%
            )`,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2
          }}>
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <NotificationsIcon sx={{ color: '#ff6b35' }} />
                Alerts
              </Typography>
              <Divider sx={{ backgroundColor: '#333', mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {alertsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} sx={{ color: '#00ff88' }} />
                  </Box>
                ) : alerts.length > 0 ? (
                  alerts.map((alert, index) => {
                    const getAlertIcon = (type) => {
                      switch (type) {
                        case 'warning': return <WarningIcon />;
                        case 'info': return <InfoIcon />;
                        case 'success': return <CheckCircleIcon />;
                        default: return <InfoIcon />;
                      }
                    };

                    const getAlertColor = (type) => {
                      switch (type) {
                        case 'warning': return { bg: 'rgba(255, 193, 7, 0.1)', border: 'rgba(255, 193, 7, 0.3)', color: '#ffc107' };
                        case 'info': return { bg: 'rgba(33, 150, 243, 0.1)', border: 'rgba(33, 150, 243, 0.3)', color: '#2196f3' };
                        case 'success': return { bg: 'rgba(76, 175, 80, 0.1)', border: 'rgba(76, 175, 80, 0.3)', color: '#4caf50' };
                        default: return { bg: 'rgba(33, 150, 243, 0.1)', border: 'rgba(33, 150, 243, 0.3)', color: '#2196f3' };
                      }
                    };

                    const colors = getAlertColor(alert.type);

                    return (
                      <Alert 
                        key={index}
                        severity={alert.type}
                        icon={getAlertIcon(alert.type)}
                        sx={{ 
                          backgroundColor: colors.bg,
                          border: `1px solid ${colors.border}`,
                          color: colors.color
                        }}
                        action={alert.action && (
                          <Button 
                            size="small" 
                            onClick={() => alert.actionUrl && navigate(alert.actionUrl)}
                            sx={{ color: colors.color }}
                          >
                            {alert.action}
                          </Button>
                        )}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          {alert.title}
                        </Typography>
                        <Typography variant="body2">
                          {alert.message}
                        </Typography>
                      </Alert>
                    );
                  })
                ) : (
                  <Typography variant="body2" sx={{ color: '#aaa' }}>
                    No alerts at this time
                  </Typography>
                )}
              </Box>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                onClick={() => navigate('/admin/products')}
                sx={{ color: '#00ff88' }}
              >
                Manage Inventory
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;