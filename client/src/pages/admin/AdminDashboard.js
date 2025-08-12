import React, { useState, useEffect } from 'react';
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
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  TrendingUp as TrendingIcon,
  People as UsersIcon,
  AttachMoney as RevenueIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // In a real app, these would be API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalProducts: 12,
          totalOrders: 45,
          totalUsers: 128,
          totalRevenue: 89750,
          recentOrders: [
            { id: 'ORD-001', customer: 'John Doe', amount: 1299, status: 'pending' },
            { id: 'ORD-002', customer: 'Jane Smith', amount: 899, status: 'confirmed' },
            { id: 'ORD-003', customer: 'Mike Johnson', amount: 1599, status: 'shipped' }
          ],
          lowStockProducts: [
            { name: 'Arrow3 Pro', stock: 2 },
            { name: 'Arrow3 Mini', stock: 1 }
          ]
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <ProductsIcon sx={{ fontSize: 40, color: '#00ff88' }} />,
      action: () => navigate('/admin/products'),
      color: '#00ff88'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <OrdersIcon sx={{ fontSize: 40, color: '#ff6b35' }} />,
      action: () => navigate('/admin/orders'),
      color: '#ff6b35'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <UsersIcon sx={{ fontSize: 40, color: '#4fc3f7' }} />,
      action: () => {},
      color: '#4fc3f7'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
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

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
          Loading Dashboard...
        </Typography>
        <LinearProgress sx={{ mt: 2, backgroundColor: '#333' }} />
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
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <DashboardIcon sx={{ color: '#00ff88' }} />
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#aaa' }}>
          Welcome back, {user?.firstName}! Here's what's happening with your drone store.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                backgroundColor: '#2a2a2a',
                border: '1px solid #333',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: card.color,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 20px rgba(${card.color === '#00ff88' ? '0, 255, 136' : card.color === '#ff6b35' ? '255, 107, 53' : card.color === '#4fc3f7' ? '79, 195, 247' : '255, 213, 79'}, 0.3)`
                }
              }}
              onClick={card.action}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#aaa' }}>
                      {card.title}
                    </Typography>
                  </Box>
                  {card.icon}
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
          <Card sx={{ backgroundColor: '#2a2a2a', border: '1px solid #333' }}>
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
              
              {stats.recentOrders.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {stats.recentOrders.map((order) => (
                    <Box 
                      key={order.id}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        backgroundColor: '#1a1a1a',
                        borderRadius: 1,
                        border: '1px solid #333'
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'white' }}>
                          {order.id}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#aaa' }}>
                          {order.customer}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#00ff88' }}>
                          ${order.amount}
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
          <Card sx={{ backgroundColor: '#2a2a2a', border: '1px solid #333' }}>
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
                {stats.lowStockProducts.length > 0 && (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      border: '1px solid rgba(255, 193, 7, 0.3)',
                      color: '#ffc107'
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Low Stock Alert
                    </Typography>
                    {stats.lowStockProducts.map((product, index) => (
                      <Typography key={index} variant="body2">
                        {product.name}: {product.stock} left
                      </Typography>
                    ))}
                  </Alert>
                )}
                
                <Alert 
                  severity="info"
                  sx={{ 
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    color: '#2196f3'
                  }}
                >
                  <Typography variant="body2">
                    System running smoothly. All services operational.
                  </Typography>
                </Alert>
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