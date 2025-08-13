import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DroneCard from '../DroneCard';

// Mock the LazyImage component
jest.mock('../common', () => ({
  LazyImage: ({ src, alt, height, sx }) => (
    <div data-testid="lazy-image" style={{ height }}>
      <img src={src} alt={alt} />
    </div>
  ),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Create a theme for testing
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff88',
    },
  },
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

describe('DroneCard Component', () => {
  const mockDrone = {
    _id: '1',
    name: 'Arrow3 Pro',
    model: 'AP-2024',
    price: 1299,
    images: ['https://example.com/drone1.jpg'],
    inStock: true,
    stockQuantity: 10,
    featured: true,
    specifications: {
      cameraResolution: '4K',
      maxSpeed: 65,
      flightTime: 30,
      batteryCapacity: 5000,
    },
  };

  const mockOnOrderClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders drone information correctly', () => {
    render(
      <TestWrapper>
        <DroneCard drone={mockDrone} onOrderClick={mockOnOrderClick} />
      </TestWrapper>
    );

    expect(screen.getByText('Arrow3 Pro')).toBeInTheDocument();
    expect(screen.getByText('AP-2024')).toBeInTheDocument();
    expect(screen.getByText('$1,299')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('displays specifications correctly', () => {
    render(
      <TestWrapper>
        <DroneCard drone={mockDrone} onOrderClick={mockOnOrderClick} />
      </TestWrapper>
    );

    expect(screen.getByText('4K')).toBeInTheDocument();
    expect(screen.getByText('65 km/h')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('5000 mAh')).toBeInTheDocument();
  });

  it('shows out of stock when stockQuantity is 0', () => {
    const outOfStockDrone = {
      ...mockDrone,
      stockQuantity: 0,
    };

    render(
      <TestWrapper>
        <DroneCard drone={outOfStockDrone} onOrderClick={mockOnOrderClick} />
      </TestWrapper>
    );

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled();
  });

  it('shows low stock warning when stockQuantity is less than 5', () => {
    const lowStockDrone = {
      ...mockDrone,
      stockQuantity: 3,
    };

    render(
      <TestWrapper>
        <DroneCard drone={lowStockDrone} onOrderClick={mockOnOrderClick} />
      </TestWrapper>
    );

    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('navigates to drone details when card is clicked', () => {
    render(
      <TestWrapper>
        <DroneCard drone={mockDrone} onOrderClick={mockOnOrderClick} />
      </TestWrapper>
    );

    const card = screen.getByRole('button', { name: /arrow3 pro/i }).closest('[role="button"]') || 
                 screen.getByText('Arrow3 Pro').closest('div[role="button"]') ||
                 screen.getByText('Arrow3 Pro').closest('div');
    
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/drones/1');
  });

  it('calls onOrderClick when order button is clicked', () => {
    render(
      <TestWrapper>
        <DroneCard drone={mockDrone} onOrderClick={mockOnOrderClick} />
      </TestWrapper>
    );

    const orderButton = screen.getByRole('button', { name: /order now/i });
    fireEvent.click(orderButton);

    expect(mockOnOrderClick).toHaveBeenCalledWith('1');
  });

  it('navigates to order page when order button is clicked without onOrderClick prop', () => {
    render(
      <TestWrapper>
        <DroneCard drone={mockDrone} />
      </TestWrapper>
    );

    const orderButton = screen.getByRole('button', { name: /order now/i });
    fireEvent.click(orderButton);

    expect(mockNavigate).toHaveBeenCalledWith('/order/1');
  });

  it('handles missing specifications gracefully', () => {
    const droneWithoutSpecs = {
      ...mockDrone,
      specifications: {},
    };

    render(
      <TestWrapper>
        <DroneCard drone={droneWithoutSpecs} onOrderClick={mockOnOrderClick} />
      </TestWrapper>
    );

    // Should show N/A for missing specifications
    const naElements = screen.getAllByText('N/A');
    expect(naElements).toHaveLength(4); // 4 specification fields
  });

  it('displays placeholder image when no images are provided', () => {
    const droneWithoutImages = {
      ...mockDrone,
      images: [],
    };

    render(
      <TestWrapper>
        <DroneCard drone={droneWithoutImages} onOrderClick={mockOnOrderClick} />
      </TestWrapper>
    );

    const lazyImage = screen.getByTestId('lazy-image');
    const img = lazyImage.querySelector('img');
    expect(img).toHaveAttribute('src', '/placeholder-drone.jpg');
  });

  it('formats price correctly', () => {
    const expensiveDrone = {
      ...mockDrone,
      price: 12999.99,
    };

    render(
      <TestWrapper>
        <DroneCard drone={expensiveDrone} onOrderClick={mockOnOrderClick} />
      </TestWrapper>
    );

    expect(screen.getByText('$13,000')).toBeInTheDocument();
  });

  it('does not show featured badge when drone is not featured', () => {
    const nonFeaturedDrone = {
      ...mockDrone,
      featured: false,
    };

    render(
      <TestWrapper>
        <DroneCard drone={nonFeaturedDrone} onOrderClick={mockOnOrderClick} />
      </TestWrapper>
    );

    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('stops event propagation when order button is clicked', () => {
    const mockCardClick = jest.fn();
    
    render(
      <TestWrapper>
        <div onClick={mockCardClick}>
          <DroneCard drone={mockDrone} onOrderClick={mockOnOrderClick} />
        </div>
      </TestWrapper>
    );

    const orderButton = screen.getByRole('button', { name: /order now/i });
    fireEvent.click(orderButton);

    expect(mockOnOrderClick).toHaveBeenCalledWith('1');
    expect(mockCardClick).not.toHaveBeenCalled();
  });

  it('stops event propagation when favorite button is clicked', () => {
    const mockCardClick = jest.fn();
    
    render(
      <TestWrapper>
        <div onClick={mockCardClick}>
          <DroneCard drone={mockDrone} onOrderClick={mockOnOrderClick} />
        </div>
      </TestWrapper>
    );

    const favoriteButton = screen.getByRole('button', { name: '' }); // Favorite button has no aria-label
    fireEvent.click(favoriteButton);

    expect(mockCardClick).not.toHaveBeenCalled();
  });
});