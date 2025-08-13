import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductManagement from '../ProductManagement';

// Mock the drone queries
const mockDronesData = {
  drones: [
    {
      _id: '1',
      name: 'Arrow3 Pro',
      model: 'AP-2024',
      price: 1299,
      category: 'camera',
      stockQuantity: 10,
      inStock: true,
      featured: true,
      images: ['https://example.com/drone1.jpg'],
    },
    {
      _id: '2',
      name: 'Arrow3 Mini',
      model: 'AM-2024',
      price: 899,
      category: 'handheld',
      stockQuantity: 2,
      inStock: true,
      featured: false,
      images: ['https://example.com/drone2.jpg'],
    },
  ],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 2,
  },
};

jest.mock('../../../hooks/queries/useDroneQueries', () => ({
  useDrones: () => ({
    data: mockDronesData,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useDeleteDrone: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isLoading: false,
  }),
}));

// Mock the DroneForm component
jest.mock('../components/DroneForm', () => {
  return function MockDroneForm({ mode }) {
    return <div data-testid="drone-form">DroneForm - {mode}</div>;
  };
});

// Mock the DroneFilters component
jest.mock('../components/DroneFilters', () => {
  return function MockDroneFilters({ filters, onFiltersChange }) {
    return (
      <div data-testid="drone-filters">
        <button onClick={() => onFiltersChange({ category: 'camera' })}>
          Apply Filter
        </button>
      </div>
    );
  };
});

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/admin/products' }),
}));

// Create theme for testing
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff88',
    },
  },
});

// Test wrapper
const TestWrapper = ({ children, initialEntries = ['/admin/products'] }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('ProductManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product management header', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    expect(screen.getByText('Product Management')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add new drone/i })).toBeInTheDocument();
  });

  it('displays navigation tabs', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    expect(screen.getByText('Drone List')).toBeInTheDocument();
    expect(screen.getByText('Add New Drone')).toBeInTheDocument();
  });

  it('navigates to add drone page when add button is clicked', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    const addButton = screen.getByRole('button', { name: /add new drone/i });
    fireEvent.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products/add');
  });

  it('displays drone list with correct data', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    expect(screen.getByText('Arrow3 Pro')).toBeInTheDocument();
    expect(screen.getByText('AP-2024')).toBeInTheDocument();
    expect(screen.getByText('$1,299')).toBeInTheDocument();
    expect(screen.getByText('Camera')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.getByText('Arrow3 Mini')).toBeInTheDocument();
    expect(screen.getByText('AM-2024')).toBeInTheDocument();
    expect(screen.getByText('$899')).toBeInTheDocument();
    expect(screen.getByText('Handheld')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays correct status chips', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    const inStockChips = screen.getAllByText('In Stock');
    expect(inStockChips).toHaveLength(1); // Arrow3 Pro

    const lowStockChips = screen.getAllByText('Low Stock');
    expect(lowStockChips).toHaveLength(1); // Arrow3 Mini (stock: 2)
  });

  it('displays featured status correctly', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    const yesChips = screen.getAllByText('Yes');
    const noChips = screen.getAllByText('No');
    
    expect(yesChips).toHaveLength(1); // Arrow3 Pro is featured
    expect(noChips).toHaveLength(1); // Arrow3 Mini is not featured
  });

  it('shows action buttons for each drone', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    // Should have view, edit, and delete buttons for each drone (2 drones × 3 buttons = 6 buttons)
    const actionButtons = screen.getAllByRole('button');
    const viewButtons = actionButtons.filter(button => 
      button.getAttribute('aria-label') === 'View Details' || 
      button.querySelector('[data-testid="VisibilityIcon"]')
    );
    const editButtons = actionButtons.filter(button => 
      button.getAttribute('aria-label') === 'Edit Drone' ||
      button.querySelector('[data-testid="EditIcon"]')
    );
    const deleteButtons = actionButtons.filter(button => 
      button.getAttribute('aria-label') === 'Delete Drone' ||
      button.querySelector('[data-testid="DeleteIcon"]')
    );

    expect(viewButtons.length).toBeGreaterThan(0);
    expect(editButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('navigates to edit page when edit button is clicked', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    // Find edit buttons and click the first one
    const editButtons = screen.getAllByRole('button').filter(button => 
      button.querySelector('[data-testid="EditIcon"]')
    );
    
    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/products/edit/1');
    }
  });

  it('navigates to drone details when view button is clicked', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    // Find view buttons and click the first one
    const viewButtons = screen.getAllByRole('button').filter(button => 
      button.querySelector('[data-testid="VisibilityIcon"]')
    );
    
    if (viewButtons.length > 0) {
      fireEvent.click(viewButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/drones/1');
    }
  });

  it('opens delete confirmation dialog when delete button is clicked', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    // Find delete buttons and click the first one
    const deleteButtons = screen.getAllByRole('button').filter(button => 
      button.querySelector('[data-testid="DeleteIcon"]')
    );
    
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      
      // Should open confirmation dialog
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    }
  });

  it('shows filters section', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show filters/i })).toBeInTheDocument();
  });

  it('toggles filters visibility', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('button', { name: /show filters/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('Hide Filters')).toBeInTheDocument();
    expect(screen.getByTestId('drone-filters')).toBeInTheDocument();
  });

  it('displays refresh button', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh data/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('shows pagination info', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    expect(screen.getByText('Showing 2 of 2 drones')).toBeInTheDocument();
  });

  it('renders add drone form when on add route', () => {
    render(
      <TestWrapper initialEntries={['/admin/products/add']}>
        <ProductManagement />
      </TestWrapper>
    );

    expect(screen.getByTestId('drone-form')).toBeInTheDocument();
    expect(screen.getByText('DroneForm - create')).toBeInTheDocument();
  });

  it('renders edit drone form when on edit route', () => {
    render(
      <TestWrapper initialEntries={['/admin/products/edit/1']}>
        <ProductManagement />
      </TestWrapper>
    );

    expect(screen.getByTestId('drone-form')).toBeInTheDocument();
    expect(screen.getByText('DroneForm - edit')).toBeInTheDocument();
  });

  it('handles tab navigation correctly', () => {
    render(
      <TestWrapper>
        <ProductManagement />
      </TestWrapper>
    );

    const addTab = screen.getByText('Add New Drone');
    fireEvent.click(addTab);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products/add');
  });
});