import React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  useTheme
} from '@mui/material';
import {
  Clear as ClearIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const CATEGORIES = ['camera', 'handheld', 'power', 'specialized'];
const CAMERA_RESOLUTIONS = ['720p', '1080p', '4K', '6K', '8K', 'No Camera'];
const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'price_asc', label: 'Price (Low to High)' },
  { value: 'price_desc', label: 'Price (High to Low)' },
  { value: 'newest', label: 'Newest First' },
];

const DroneFilters = ({ filters, onFiltersChange }) => {
  const theme = useTheme();
  
  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...filters,
      [field]: value === '' ? undefined : value
    };
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const formatCategory = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      color: theme.palette.text.primary,
      '& fieldset': { borderColor: theme.palette.divider },
      '&:hover fieldset': { borderColor: theme.palette.primary.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }
    },
    '& .MuiInputLabel-root': { color: theme.palette.text.secondary }
  };

  const selectStyles = {
    color: theme.palette.text.primary,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        {/* Search */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Search Drones"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyles}
          />
        </Grid>

        {/* Category */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: theme.palette.text.secondary }}>Category</InputLabel>
            <Select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              label="Category"
              sx={selectStyles}
            >
              <MenuItem value="">All Categories</MenuItem>
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {formatCategory(category)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Price Range */}
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Min Price"
            type="number"
            value={filters.minPrice || ''}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={inputStyles}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Max Price"
            type="number"
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={inputStyles}
          />
        </Grid>

        {/* Sort By */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: theme.palette.text.secondary }}>Sort By</InputLabel>
            <Select
              value={filters.sortBy || ''}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              label="Sort By"
              sx={selectStyles}
            >
              <MenuItem value="">Default</MenuItem>
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Clear Filters */}
        <Grid item xs={12} md={1}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            sx={{
              color: theme.palette.text.secondary,
              borderColor: theme.palette.divider,
              '&:hover': {
                borderColor: theme.palette.text.secondary,
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            Clear
          </Button>
        </Grid>
      </Grid>

      {/* Additional Filters Row */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Camera Resolution */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: theme.palette.text.secondary }}>Camera Resolution</InputLabel>
            <Select
              value={filters.cameraResolution || ''}
              onChange={(e) => handleFilterChange('cameraResolution', e.target.value)}
              label="Camera Resolution"
              sx={selectStyles}
            >
              <MenuItem value="">All Resolutions</MenuItem>
              {CAMERA_RESOLUTIONS.map((resolution) => (
                <MenuItem key={resolution} value={resolution}>
                  {resolution}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Min Flight Time */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Min Flight Time"
            type="number"
            value={filters.minFlightTime || ''}
            onChange={(e) => handleFilterChange('minFlightTime', e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">min</InputAdornment>,
            }}
            sx={inputStyles}
          />
        </Grid>

        {/* Stock Status */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: theme.palette.text.secondary }}>Stock Status</InputLabel>
            <Select
              value={filters.stockStatus || ''}
              onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
              label="Stock Status"
              sx={selectStyles}
            >
              <MenuItem value="">All Stock</MenuItem>
              <MenuItem value="inStock">In Stock</MenuItem>
              <MenuItem value="lowStock">Low Stock</MenuItem>
              <MenuItem value="outOfStock">Out of Stock</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Featured Status */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: theme.palette.text.secondary }}>Featured</InputLabel>
            <Select
              value={filters.featured || ''}
              onChange={(e) => handleFilterChange('featured', e.target.value)}
              label="Featured"
              sx={selectStyles}
            >
              <MenuItem value="">All Drones</MenuItem>
              <MenuItem value="true">Featured Only</MenuItem>
              <MenuItem value="false">Non-Featured</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DroneFilters;