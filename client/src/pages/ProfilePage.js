import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  ShoppingBag as OrderIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon,
  Pending as PendingIcon,
  Assignment as ProcessingIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate, formatPrice } from '../utils/helpers';
import NavigationBar from '../components/common/NavigationBar';

// Status color mapping
const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'primary',
    shipped: 'secondary',
    delivered: 'success',
    cancelled: 'error',
  };
  return colors[status] || 'default';
};

// Status icon mapping
const getStatusIcon = (status) => {
  const icons = {
    pending: <PendingIcon />,
    confirmed: <OrderIcon />,
    processing: <ProcessingIcon />,
    shipped: <ShippingIcon />,
    delivered: <DeliveredIcon />,
    cancelled: <CancelledIcon />,
  };
  return icons[status] || <OrderIcon />;
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load user profile and orders
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load user profile (if needed)
        if (user) {
          setEditForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
          });
        }
        
        // Load user orders
        if (user?.id) {
          setOrdersLoading(true);
          const response = await api.get(`/orders/user/${user.id}`);
          
          if (response.data.success) {
            setOrders(response.data.data.orders || []);
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
        setOrdersLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle edit profile
  const handleEditProfile = () => {
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
    });
    setEditDialogOpen(true);
    setError('');
    setSuccess('');
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      setUpdateLoading(true);
      setError('');
      
      const response = await api.put('/auth/profile', {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
      });

      if (response.data.success) {
        // Update user context
        updateUser({
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
        });
        
        setSuccess('Profile updated successfully!');
        setEditDialogOpen(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" sx={{ color: '#00ff88' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <NavigationBar />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#0a0a0a',
          py: 4,
        }}
      >
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: '#00ff88',
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 2,
            }}
          >
            My Profile
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#cccccc',
              textAlign: 'center',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Manage your account information and view your order history
          </Typography>
        </Box>

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mb: 3, backgroundColor: 'rgba(0, 255, 136, 0.1)' }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper
          sx={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: '1px solid #333',
              '& .MuiTab-root': {
                color: '#cccccc',
                '&.Mui-selected': {
                  color: '#00ff88',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#00ff88',
              },
            }}
          >
            <Tab icon={<PersonIcon />} label="Profile Information" />
            <Tab icon={<OrderIcon />} label="Order History" />
          </Tabs>

          {/* Profile Information Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #444',
                      textAlign: 'center',
                    }}
                  >
                    <CardContent>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 2,
                          backgroundColor: '#00ff88',
                          fontSize: '2rem',
                        }}
                      >
                        {user?.firstName?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                      <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                        {user?.firstName} {user?.lastName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#cccccc', mb: 2 }}>
                        {user?.email}
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={handleEditProfile}
                        sx={{
                          borderColor: '#00ff88',
                          color: '#00ff88',
                          '&:hover': {
                            borderColor: '#00ff88',
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                          },
                        }}
                      >
                        Edit Profile
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Card
                    sx={{
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #444',
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                        Account Information
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
                            First Name
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#fff' }}>
                            {user?.firstName || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
                            Last Name
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#fff' }}>
                            {user?.lastName || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
                            Email Address
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#fff' }}>
                            {user?.email}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
                            Account Status
                          </Typography>
                          <Chip
                            label={user?.isEmailVerified ? 'Verified' : 'Unverified'}
                            color={user?.isEmailVerified ? 'success' : 'warning'}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
                            Member Since
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#fff' }}>
                            {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Order History Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                Order History
              </Typography>
              
              {ordersLoading ? (
                <Box>
                  {[...Array(3)].map((_, index) => (
                    <Skeleton
                      key={index}
                      variant="rectangular"
                      height={80}
                      sx={{ mb: 2, backgroundColor: '#333' }}
                    />
                  ))}
                </Box>
              ) : orders.length === 0 ? (
                <Card
                  sx={{
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    textAlign: 'center',
                    py: 6,
                  }}
                >
                  <CardContent>
                    <OrderIcon sx={{ fontSize: 64, color: '#666', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                      No Orders Yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
                      You haven't placed any orders yet. Start exploring our drone collection!
                    </Typography>
                    <Button
                      variant="contained"
                      href="/drones"
                      sx={{
                        backgroundColor: '#00ff88',
                        color: '#000',
                        '&:hover': {
                          backgroundColor: '#00cc6a',
                        },
                      }}
                    >
                      Browse Drones
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <TableContainer
                  component={Paper}
                  sx={{
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ '& th': { borderBottom: '1px solid #444' } }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                          Order ID
                        </TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                          Drone
                        </TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                          Date
                        </TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                          Total
                        </TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                          Payment
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow
                          key={order._id}
                          sx={{
                            '& td': {
                              borderBottom: '1px solid #444',
                              color: '#fff',
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 136, 0.05)',
                            },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              #{order._id.slice(-8).toUpperCase()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {order.droneId?.name || 'Unknown Drone'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#999' }}>
                                Qty: {order.quantity}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(order.orderDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {formatPrice(order.totalAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(order.status)}
                              label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              color={getStatusColor(order.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                              color={order.paymentStatus === 'completed' ? 'success' : 'default'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Paper>

        {/* Edit Profile Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
            },
          }}
        >
          <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid #333' }}>
            Edit Profile
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  value={editForm.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor: '#444',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00ff88',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff88',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#999',
                      '&.Mui-focused': {
                        color: '#00ff88',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  value={editForm.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor: '#444',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00ff88',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff88',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#999',
                      '&.Mui-focused': {
                        color: '#00ff88',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
            <Button
              onClick={() => setEditDialogOpen(false)}
              sx={{ color: '#999' }}
              disabled={updateLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              variant="contained"
              disabled={updateLoading || !editForm.firstName.trim() || !editForm.lastName.trim()}
              sx={{
                backgroundColor: '#00ff88',
                color: '#000',
                '&:hover': {
                  backgroundColor: '#00cc6a',
                },
                '&:disabled': {
                  backgroundColor: '#333',
                  color: '#666',
                },
              }}
            >
              {updateLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
    </>
  );
};

export default ProfilePage;
