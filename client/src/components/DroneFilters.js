import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  TextField,
  Select,
  MenuItem,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DRONE_CATEGORIES } from '../utils/constants';

const DroneFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const handleFilterChange = (filterType, value) => {
    onFiltersChange({
      ...filters,
      [filterType]: value,
    });
  };

  const handlePriceRangeChange = (event, newValue) => {
    onFiltersChange({
      ...filters,
      minPrice: newValue[0],
      maxPrice: newValue[1],
    });
  };

  const handleCategoryChange = (category) => {
    const currentCategories = filters.categories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    handleFilterChange('categories', updatedCategories);
  };

  const handleCameraResolutionChange = (resolution) => {
    const currentResolutions = filters.cameraResolutions || [];
    const updatedResolutions = currentResolutions.includes(resolution)
      ? currentResolutions.filter(r => r !== resolution)
      : [...currentResolutions, resolution];
    
    handleFilterChange('cameraResolutions', updatedResolutions);
  };

  const handleAIModeChange = (mode) => {
    const currentModes = filters.aiModes || [];
    const updatedModes = currentModes.includes(mode)
      ? currentModes.filter(m => m !== mode)
      : [...currentModes, mode];
    
    handleFilterChange('aiModes', updatedModes);
  };

  const categories = [
    { value: DRONE_CATEGORIES.CAMERA, label: 'Camera Drones' },
    { value: DRONE_CATEGORIES.HANDHELD, label: 'Handheld' },
    { value: DRONE_CATEGORIES.POWER, label: 'Power' },
    { value: DRONE_CATEGORIES.SPECIALIZED, label: 'Specialized' },
  ];

  const cameraResolutions = ['720p', '1080p', '4K', '6K', '8K', 'No Camera'];

  const aiModes = [
    'Follow Me',
    'Orbit Mode',
    'Waypoint Navigation',
    'Gesture Control',
    'ActiveTrack',
    'QuickShot',
    'Sport Mode',
    'Cinematic Mode',
    'Portrait Mode',
    'Night Mode',
  ];

  const sortOptions = [
    { value: '', label: 'Featured First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' },
    { value: 'newest', label: 'Newest First' },
  ];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories?.length) count += filters.categories.length;
    if (filters.cameraResolutions?.length) count += filters.cameraResolutions.length;
    if (filters.aiModes?.length) count += filters.aiModes.length;
    if (filters.minPrice > 0 || filters.maxPrice < 10000) count += 1;
    if (filters.minFlightTime > 0) count += 1;
    if (filters.inStockOnly) count += 1;
    return count;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Filters
          {getActiveFiltersCount() > 0 && (
            <Chip
              label={getActiveFiltersCount()}
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <Button
          size="small"
          startIcon={<ClearIcon />}
          onClick={onClearFilters}
          disabled={getActiveFiltersCount() === 0}
        >
          Clear All
        </Button>
      </Box>

      {/* Sort */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <FormLabel sx={{ mb: 1, color: 'text.primary' }}>Sort By</FormLabel>
        <Select
          value={filters.sortBy || ''}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          size="small"
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      {/* Search */}
      <TextField
        fullWidth
        label="Search drones..."
        variant="outlined"
        size="small"
        value={filters.search || ''}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        sx={{ mb: 2 }}
      />

      <Divider sx={{ my: 2 }} />

      {/* Categories */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Categories</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {categories.map((category) => (
              <FormControlLabel
                key={category.value}
                control={
                  <Checkbox
                    checked={filters.categories?.includes(category.value) || false}
                    onChange={() => handleCategoryChange(category.value)}
                    size="small"
                  />
                }
                label={category.label}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Price Range */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <Slider
              value={[filters.minPrice || 0, filters.maxPrice || 10000]}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={10000}
              step={100}
              valueLabelFormat={(value) => `$${value.toLocaleString()}`}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                ${(filters.minPrice || 0).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${(filters.maxPrice || 10000).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Camera Resolution */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Camera Resolution</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {cameraResolutions.map((resolution) => (
              <FormControlLabel
                key={resolution}
                control={
                  <Checkbox
                    checked={filters.cameraResolutions?.includes(resolution) || false}
                    onChange={() => handleCameraResolutionChange(resolution)}
                    size="small"
                  />
                }
                label={resolution}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Flight Time */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Minimum Flight Time</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <Slider
              value={filters.minFlightTime || 0}
              onChange={(e, value) => handleFilterChange('minFlightTime', value)}
              valueLabelDisplay="auto"
              min={0}
              max={180}
              step={5}
              valueLabelFormat={(value) => `${value} min`}
              marks={[
                { value: 0, label: '0 min' },
                { value: 30, label: '30 min' },
                { value: 60, label: '60 min' },
                { value: 120, label: '120 min' },
                { value: 180, label: '180 min' },
              ]}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* AI Modes */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">AI Features</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {aiModes.map((mode) => (
              <FormControlLabel
                key={mode}
                control={
                  <Checkbox
                    checked={filters.aiModes?.includes(mode) || false}
                    onChange={() => handleAIModeChange(mode)}
                    size="small"
                  />
                }
                label={mode}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Stock Status */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Availability</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.inStockOnly || false}
                  onChange={(e) => handleFilterChange('inStockOnly', e.target.checked)}
                  size="small"
                />
              }
              label="In Stock Only"
            />
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default DroneFilters;