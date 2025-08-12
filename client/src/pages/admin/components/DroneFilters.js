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
  InputAdornment
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
                  <SearchIcon sx={{ color: '#aaa' }} />
                </InputAdornment>
              ),
            }}
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
        </Grid>

        {/* Category */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#aaa' }}>Category</InputLabel>
            <Select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              label="Category"
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' }
              }}
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
        </Grid>

        {/* Sort By */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#aaa' }}>Sort By</InputLabel>
            <Select
              value={filters.sortBy || ''}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              label="Sort By"
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' }
              }}
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
              color: '#aaa',
              borderColor: '#333',
              '&:hover': {
                borderColor: '#aaa',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
            <InputLabel sx={{ color: '#aaa' }}>Camera Resolution</InputLabel>
            <Select
              value={filters.cameraResolution || ''}
              onChange={(e) => handleFilterChange('cameraResolution', e.target.value)}
              label="Camera Resolution"
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' }
              }}
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
        </Grid>

        {/* Stock Status */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#aaa' }}>Stock Status</InputLabel>
            <Select
              value={filters.stockStatus || ''}
              onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
              label="Stock Status"
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' }
              }}
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
            <InputLabel sx={{ color: '#aaa' }}>Featured</InputLabel>
            <Select
              value={filters.featured || ''}
              onChange={(e) => handleFilterChange('featured', e.target.value)}
              label="Featured"
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' }
              }}
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