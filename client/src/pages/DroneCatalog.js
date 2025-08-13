import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Skeleton,
  Alert,
  Fab,
  Badge,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
} from '@mui/icons-material';
import { useDrones } from '../hooks/queries/useDroneQueries';
import DroneCard from '../components/DroneCard';
import DroneFilters from '../components/DroneFilters';
import DronePagination from '../components/DronePagination';
import { useDebounce } from '../hooks/useDebounce';

const DroneCatalog = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    categories: [],
    cameraResolutions: [],
    aiModes: [],
    minPrice: 0,
    maxPrice: 10000,
    minFlightTime: 0,
    inStockOnly: false,
    sortBy: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filters.search, 300);
  
  // Prepare API filters
  const apiFilters = useMemo(() => {
    const apiParams = {
      page: currentPage,
      limit: itemsPerPage,
      sortBy: filters.sortBy,
    };
    
    // Add search
    if (debouncedSearch) {
      apiParams.search = debouncedSearch;
    }
    
    // Add category filter
    if (filters.categories?.length > 0) {
      apiParams.category = filters.categories.join(',');
    }
    
    // Add price range
    if (filters.minPrice > 0) {
      apiParams.minPrice = filters.minPrice;
    }
    if (filters.maxPrice < 10000) {
      apiParams.maxPrice = filters.maxPrice;
    }
    
    // Add camera resolution filter
    if (filters.cameraResolutions?.length > 0) {
      apiParams.cameraResolution = filters.cameraResolutions.join(',');
    }
    
    // Add flight time filter
    if (filters.minFlightTime > 0) {
      apiParams.minFlightTime = filters.minFlightTime;
    }
    
    // Add stock filter
    if (filters.inStockOnly) {
      apiParams.inStock = true;
    }
    
    return apiParams;
  }, [filters, debouncedSearch, currentPage, itemsPerPage]);
  
  // Fetch drones
  const {
    data: dronesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useDrones(apiFilters);
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);
  
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  const handleClearFilters = () => {
    setFilters({
      search: '',
      categories: [],
      cameraResolutions: [],
      aiModes: [],
      minPrice: 0,
      maxPrice: 10000,
      minFlightTime: 0,
      inStockOnly: false,
      sortBy: '',
    });
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories?.length) count += filters.categories.length;
    if (filters.cameraResolutions?.length) count += filters.cameraResolutions.length;
    if (filters.aiModes?.length) count += filters.aiModes.length;
    if (filters.minPrice > 0 || filters.maxPrice < 10000) count += 1;
    if (filters.minFlightTime > 0) count += 1;
    if (filters.inStockOnly) count += 1;
    if (filters.search) count += 1;
    return count;
  };
  
  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: itemsPerPage }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Paper sx={{ p: 2 }}>
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={24} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Skeleton variant="text" width={60} height={20} />
              <Skeleton variant="text" width={60} height={20} />
            </Box>
            <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={40} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
  
  // Error state
  if (isError) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert 
            severity="error" 
            action={
              <IconButton color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </IconButton>
            }
          >
            {error?.message || 'Failed to load drones. Please try again.'}
          </Alert>
        </Box>
      </Container>
    );
  }
  
  const drones = dronesData?.drones || [];
  const totalItems = dronesData?.pagination?.totalCount || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Drone Catalog
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover our complete collection of professional drones with advanced features
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {/* Desktop Filters Sidebar */}
          {!isMobile && (
            <Grid item md={3}>
              <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
                <DroneFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
              </Paper>
            </Grid>
          )}
          
          {/* Main Content */}
          <Grid item xs={12} md={isMobile ? 12 : 9}>
            {/* Results Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                {isLoading ? 'Loading...' : `${totalItems} drones found`}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* View mode toggle */}
                <IconButton
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                >
                  {viewMode === 'grid' ? <GridViewIcon /> : <ListViewIcon />}
                </IconButton>
              </Box>
            </Box>
            
            {/* Drones Grid */}
            {isLoading ? (
              renderLoadingSkeleton()
            ) : drones.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 2,
                }}
              >
                <Typography variant="h5" gutterBottom>
                  No drones found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your filters or search terms
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <IconButton onClick={handleClearFilters} color="primary">
                    Clear Filters
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  {drones.map((drone) => (
                    <Grid
                      item
                      xs={12}
                      sm={viewMode === 'grid' ? 6 : 12}
                      md={viewMode === 'grid' ? 4 : 12}
                      lg={viewMode === 'grid' ? 3 : 12}
                      key={drone._id}
                    >
                      <DroneCard drone={drone} />
                    </Grid>
                  ))}
                </Grid>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <DronePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                )}
              </>
            )}
          </Grid>
        </Grid>
        
        {/* Mobile Filter FAB */}
        {isMobile && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
            onClick={() => setMobileFiltersOpen(true)}
          >
            <Badge badgeContent={getActiveFiltersCount()} color="secondary">
              <FilterIcon />
            </Badge>
          </Fab>
        )}
        
        {/* Mobile Filters Drawer */}
        <Drawer
          anchor="right"
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          PaperProps={{
            sx: { width: '100%', maxWidth: 400 },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6">Filters</Typography>
              <IconButton onClick={() => setMobileFiltersOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <DroneFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </Box>
        </Drawer>
      </Box>
    </Container>
  );
};

export default DroneCatalog;