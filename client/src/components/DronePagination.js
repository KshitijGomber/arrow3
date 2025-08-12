import React from 'react';
import {
  Box,
  Pagination,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const DronePagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const itemsPerPageOptions = [12, 24, 48, 96];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mt: 4,
        mb: 2,
      }}
    >
      {/* Results info */}
      <Typography variant="body2" color="text.secondary">
        Showing {startItem}-{endItem} of {totalItems} drones
      </Typography>

      {/* Pagination controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Items per page selector */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Per page</InputLabel>
          <Select
            value={itemsPerPage}
            label="Per page"
            onChange={(e) => onItemsPerPageChange(e.target.value)}
          >
            {itemsPerPageOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Page navigation */}
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => onPageChange(page)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'text.primary',
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default DronePagination;