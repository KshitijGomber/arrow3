import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Tooltip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  ShoppingCart as OrdersIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAllOrders, useUpdateOrderStatus } from '../../hooks/queries/useOrderQueries';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../utils/constants';

const OrderManagement = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsDialog, setOrderDetailsDialog] = useState(false);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    dateRange: ''
  });
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  });
  const [activeTab, setActiveTab] = useState('all');

  // Fetch orders with filters
  const { data: ordersData, isLoading, error, refetch } = useAllOrders(filters);
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderDetailsDialog(true);
  };

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setStatusUpdate({
      status: order.status,
      notes: ''
    });
    setStatusUpdateDialog(true);
  };

  const handleStatusUpdateSubmit = async () => {
    if (selectedOrder && statusUpdate.status) {
      try {
        await updateOrderStatusMutation.mutateAsync({
          orderId: selectedOrder._id,
          status: statusUpdate.status,
          notes: statusUpdate.notes
        });
        setStatusUpdateDialog(false);
        setStatusUpdate({ status: '', notes: '' });
        setSelectedOrder(null);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 'all') {
      setFilters({ ...filters, status: '' });
    } else {
      setFilters({ ...filters, status: newValue });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 'warning';
      case ORDER_STATUS.CONFIRMED:
        return 'info';
      case ORDER_STATUS.PROCESSING:
        return 'primary';
      case ORDER_STATUS.SHIPPED:
        return 'secondary';
      case ORDER_STATUS.DELIVERED:
        return 'success';
      case ORDER_STATUS.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case PAYMENT_STATUS.PENDING:
        return 'warning';
      case PAYMENT_STATUS.COMPLETED:
        return 'success';
      case PAYMENT_STATUS.FAILED:
        return 'error';
      case PAYMENT_STATUS.REFUNDED:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderCounts = () => {
    if (!ordersData?.orders) return {};
    
    return ordersData.orders.reduce((counts, order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
      counts.total = (counts.total || 0) + 1;
      return counts;
    }, {});
  };

  const orderCounts = getOrderCounts();

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
          Error loading orders: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <OrdersIcon sx={{ color: '#00ff88' }} />
          Order Management
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Tooltip title="Refresh Orders">
            <IconButton 
              onClick={() => refetch()}
              sx={{ color: '#00ff88' }}
              disabled={isLoading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Order Status Tabs */}
      <Paper sx={{ backgroundColor: '#2a2a2a', border: '1px solid #333', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              color: '#aaa',
              '&.Mui-selected': {
                color: '#00ff88',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#00ff88',
            },
          }}
        >
          <Tab 
            label={
              <Badge badgeContent={orderCounts.total || 0} color="primary">
                All Orders
              </Badge>
            } 
            value="all" 
          />
          <Tab 
            label={
              <Badge badgeContent={orderCounts[ORDER_STATUS.PENDING] || 0} color="warning">
                Pending
              </Badge>
            } 
            value={ORDER_STATUS.PENDING} 
          />
          <Tab 
            label={
              <Badge badgeContent={orderCounts[ORDER_STATUS.CONFIRMED] || 0} color="info">
                Confirmed
              </Badge>
            } 
            value={ORDER_STATUS.CONFIRMED} 
          />
          <Tab 
            label={
              <Badge badgeContent={orderCounts[ORDER_STATUS.PROCESSING] || 0} color="primary">
                Processing
              </Badge>
            } 
            value={ORDER_STATUS.PROCESSING} 
          />
          <Tab 
            label={
              <Badge badgeContent={orderCounts[ORDER_STATUS.SHIPPED] || 0} color="secondary">
                Shipped
              </Badge>
            } 
            value={ORDER_STATUS.SHIPPED} 
          />
          <Tab 
            label={
              <Badge badgeContent={orderCounts[ORDER_STATUS.DELIVERED] || 0} color="success">
                Delivered
              </Badge>
            } 
            value={ORDER_STATUS.DELIVERED} 
          />
          <Tab 
            label={
              <Badge badgeContent={orderCounts[ORDER_STATUS.CANCELLED] || 0} color="error">
                Cancelled
              </Badge>
            } 
            value={ORDER_STATUS.CANCELLED} 
          />
        </Tabs>
      </Paper>

      {/* Orders Table */}
      <TableContainer 
        component={Paper} 
        sx={{ backgroundColor: '#2a2a2a', border: '1px solid #333' }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1a1a1a' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Drone</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#00ff88' }} />
                  <Typography sx={{ color: '#aaa', mt: 2 }}>
                    Loading orders...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : ordersData?.orders?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: '#aaa' }}>
                    No orders found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              ordersData?.orders?.map((order) => (
                <TableRow 
                  key={order._id}
                  sx={{ 
                    '&:hover': { backgroundColor: '#333' },
                    borderBottom: '1px solid #333'
                  }}
                >
                  <TableCell>
                    <Typography sx={{ color: 'white', fontFamily: 'monospace' }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                        {order.customerInfo.firstName} {order.customerInfo.lastName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#aaa' }}>
                        {order.customerInfo.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                        {order.droneId?.name || 'Unknown Drone'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#aaa' }}>
                        Qty: {order.quantity}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: '#00ff88', fontWeight: 'bold' }}>
                      {formatCurrency(order.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      size="small"
                      color={getStatusColor(order.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      size="small"
                      color={getPaymentStatusColor(order.paymentStatus)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: '#aaa' }}>
                      {formatDate(order.orderDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewOrder(order)}
                          sx={{ color: '#4fc3f7' }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Update Status">
                        <IconButton
                          size="small"
                          onClick={() => handleStatusUpdate(order)}
                          sx={{ color: '#00ff88' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        open={orderDetailsDialog}
        order={selectedOrder}
        onClose={() => {
          setOrderDetailsDialog(false);
          setSelectedOrder(null);
        }}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
        getPaymentStatusColor={getPaymentStatusColor}
      />

      {/* Status Update Dialog */}
      <Dialog
        open={statusUpdateDialog}
        onClose={() => setStatusUpdateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#2a2a2a',
            border: '1px solid #333',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Update Order Status
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: '#aaa' }}>Status</InputLabel>
              <Select
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                label="Status"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' }
                }}
              >
                {Object.values(ORDER_STATUS).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={statusUpdate.notes}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#00ff88' },
                  '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                },
                '& .MuiInputLabel-root': { color: '#aaa' }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setStatusUpdateDialog(false)}
            sx={{ color: '#aaa' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdateSubmit}
            variant="contained"
            disabled={!statusUpdate.status || updateOrderStatusMutation.isLoading}
            sx={{
              backgroundColor: '#00ff88',
              color: '#000',
              '&:hover': {
                backgroundColor: '#00cc6a',
              },
            }}
          >
            {updateOrderStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Order Details Dialog Component
const OrderDetailsDialog = ({ 
  open, 
  order, 
  onClose, 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getPaymentStatusColor 
}) => {
  if (!order) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#2a2a2a',
          border: '1px solid #333',
        },
      }}
    >
      <DialogTitle sx={{ color: 'white' }}>
        Order Details - #{order._id.slice(-8).toUpperCase()}
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Order Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
                  Order Information
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#aaa' }}>Status:</Typography>
                    <Chip 
                      label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      size="small"
                      color={getStatusColor(order.status)}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#aaa' }}>Payment Status:</Typography>
                    <Chip 
                      label={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      size="small"
                      color={getPaymentStatusColor(order.paymentStatus)}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#aaa' }}>Order Date:</Typography>
                    <Typography sx={{ color: 'white' }}>
                      {formatDate(order.orderDate)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#aaa' }}>Total Amount:</Typography>
                    <Typography sx={{ color: '#00ff88', fontWeight: 'bold' }}>
                      {formatCurrency(order.totalAmount)}
                    </Typography>
                  </Box>
                  
                  {order.trackingNumber && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: '#aaa' }}>Tracking:</Typography>
                      <Typography sx={{ color: 'white', fontFamily: 'monospace' }}>
                        {order.trackingNumber}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Customer Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
                  Customer Information
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ color: '#aaa', fontSize: 16 }} />
                    <Typography sx={{ color: '#aaa' }}>
                      {order.customerInfo.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ color: '#aaa', fontSize: 16 }} />
                    <Typography sx={{ color: '#aaa' }}>
                      {order.customerInfo.phone}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocationIcon sx={{ color: '#aaa', fontSize: 16, mt: 0.5 }} />
                    <Box>
                      <Typography sx={{ color: '#aaa' }}>
                        {order.shippingAddress.street}
                      </Typography>
                      <Typography sx={{ color: '#aaa' }}>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </Typography>
                      <Typography sx={{ color: '#aaa' }}>
                        {order.shippingAddress.country}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Drone Information */}
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
                  Drone Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Stack spacing={1}>
                      <Typography variant="h6" sx={{ color: 'white' }}>
                        {order.droneId?.name || 'Unknown Drone'}
                      </Typography>
                      <Typography sx={{ color: '#aaa' }}>
                        Model: {order.droneId?.model || 'N/A'}
                      </Typography>
                      <Typography sx={{ color: '#aaa' }}>
                        Quantity: {order.quantity}
                      </Typography>
                      {order.droneId?.description && (
                        <Typography sx={{ color: '#aaa', mt: 1 }}>
                          {order.droneId.description}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                  
                  {order.droneId?.images?.[0] && (
                    <Grid item xs={12} md={4}>
                      <img
                        src={order.droneId.images[0]}
                        alt={order.droneId.name}
                        style={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 8
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Notes */}
          {order.notes && (
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
                    Notes
                  </Typography>
                  <Typography sx={{ color: '#aaa' }}>
                    {order.notes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#aaa' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderManagement;