import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Inventory as ProductsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useCustomTheme } from '../../context/ThemeContext';
import { useDrones, useDeleteDrone } from '../../hooks/queries/useDroneQueries';
import DroneForm from './components/DroneForm';
import DroneFilters from './components/DroneFilters';

const ProductManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useCustomTheme();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, drone: null });
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Get current tab from URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/add')) return 'add';
    if (path.includes('/edit')) return 'edit';
    return 'list';
  };

  const currentTab = getCurrentTab();

  // Fetch drones with filters
  const { data: dronesData, isLoading, error, refetch } = useDrones(filters);
  const deleteDropeMutation = useDeleteDrone();

  const handleTabChange = (event, newValue) => {
    switch (newValue) {
      case 'list':
        navigate('/admin/products');
        break;
      case 'add':
        navigate('/admin/products/add');
        break;
      default:
        break;
    }
  };

  const handleEdit = (droneId) => {
    navigate(`/admin/products/edit/${droneId}`);
  };

  const handleView = (droneId) => {
    navigate(`/drones/${droneId}`);
  };

  const handleDeleteClick = (drone) => {
    setDeleteDialog({ open: true, drone });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.drone) {
      try {
        await deleteDropeMutation.mutateAsync(deleteDialog.drone._id);
        setDeleteDialog({ open: false, drone: null });
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, drone: null });
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const getStatusColor = (drone) => {
    if (!drone.inStock) return 'error';
    if (drone.stockQuantity === 0) return 'error';
    if (drone.stockQuantity < 5) return 'warning';
    return 'success';
  };

  const getStatusText = (drone) => {
    if (!drone.inStock) return 'Out of Stock';
    if (drone.stockQuantity === 0) return 'Out of Stock';
    if (drone.stockQuantity < 5) return 'Low Stock';
    return 'In Stock';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatCategory = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: theme.palette.text.primary,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <ProductsIcon sx={{ color: theme.palette.primary.main }} />
          Product Management
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={() => refetch()}
              sx={{ color: theme.palette.primary.main }}
              disabled={isLoading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/products/add')}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.common.white,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${theme.palette.primary.main}4D`,
              },
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Add New Drone
          </Button>
        </Stack>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ 
        backgroundColor: theme.palette.background.elevated,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        mb: 3
      }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          <Tab label="Drone List" value="list" />
          <Tab label="Add New Drone" value="add" />
          {currentTab === 'edit' && <Tab label="Edit Drone" value="edit" />}
        </Tabs>
      </Paper>

      {/* Content Routes */}
      <Routes>
        <Route path="/" element={
          <DroneListView 
            dronesData={dronesData}
            isLoading={isLoading}
            error={error}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDeleteClick}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            formatPrice={formatPrice}
            formatCategory={formatCategory}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />
        } />
        <Route path="/add" element={<DroneForm mode="create" />} />
        <Route path="/edit/:id" element={<DroneForm mode="edit" />} />
      </Routes>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary }}>
            Are you sure you want to delete "{deleteDialog.drone?.name}"? This action cannot be undone.
          </Typography>
          {deleteDialog.drone?.stockQuantity > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This drone has {deleteDialog.drone.stockQuantity} units in stock.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel}
            sx={{ color: theme.palette.text.secondary }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteDropeMutation.isLoading}
            startIcon={deleteDropeMutation.isLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Drone List View Component
const DroneListView = ({
  dronesData,
  isLoading,
  error,
  onEdit,
  onView,
  onDelete,
  filters,
  onFiltersChange,
  showFilters,
  onToggleFilters,
  formatPrice,
  formatCategory,
  getStatusColor,
  getStatusText
}) => {
  const { theme } = useCustomTheme();
  
  if (error) {
    return (
      <Alert severity="error" sx={{ backgroundColor: theme.palette.error.main + '1A' }}>
        Error loading drones: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            Filters
          </Typography>
          <Button
            startIcon={<FilterIcon />}
            onClick={onToggleFilters}
            sx={{ color: theme.palette.primary.main }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </Box>
        
        {showFilters && (
          <Box sx={{ p: 2, pt: 0 }}>
            <DroneFilters filters={filters} onFiltersChange={onFiltersChange} />
          </Box>
        )}
      </Paper>

      {/* Drones Table */}
      <TableContainer 
        component={Paper} 
        sx={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.background.elevated }}>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Image</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Stock</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Featured</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: theme.palette.primary.main }} />
                  <Typography sx={{ color: theme.palette.text.secondary, mt: 2 }}>
                    Loading drones...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : dronesData?.drones?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: theme.palette.text.secondary }}>
                    No drones found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              dronesData?.drones?.map((drone) => (
                <TableRow 
                  key={drone._id}
                  sx={{ 
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <TableCell>
                    <Avatar
                      src={drone.images?.[0]}
                      alt={drone.name}
                      sx={{ width: 50, height: 50 }}
                    >
                      {drone.name.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                      {drone.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {drone.model}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={formatCategory(drone.category)}
                      size="small"
                      sx={{ 
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.black,
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                      {formatPrice(drone.price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      {drone.stockQuantity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(drone)}
                      size="small"
                      color={getStatusColor(drone)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={drone.featured ? 'Yes' : 'No'}
                      size="small"
                      color={drone.featured ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => onView(drone._id)}
                          sx={{ color: theme.palette.info.main }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Drone">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(drone._id)}
                          sx={{ color: theme.palette.primary.main }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Drone">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(drone)}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <DeleteIcon />
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

      {/* Pagination Info */}
      {dronesData?.pagination && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Typography sx={{ color: theme.palette.text.secondary }}>
            Showing {dronesData.drones.length} of {dronesData.pagination.totalCount} drones
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProductManagement;