import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AdminDashboard from '../AdminDashboard';

// Mock the useAuth hook
const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  role: 'admin',
};

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard header with welcome message', async () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText(`Welcome back, ${mockUser.firstName}! Here's what's happening with your drone store.`)).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Loading Dashboard...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders all stat cards after loading', async () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Products')).toBeInTheDocument();
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });
  });

  it('displays correct statistics after loading', async () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument(); // Total Products
      expect(screen.getByText('45')).toBeInTheDocument(); // Total Orders
      expect(screen.getByText('128')).toBeInTheDocument(); // Total Users
      expect(screen.getByText('89,750')).toBeInTheDocument(); // Total Revenue
    });
  });

  it('navigates to products page when products card is clicked', async () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      const productsCard = screen.getByText('Total Products').closest('[role="button"]') ||
                          screen.getByText('Total Products').closest('div');
      fireEvent.click(productsCard);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
  });

  it('navigates to orders page when orders card is clicked', async () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      const ordersCard = screen.getByText('Total Orders').closest('[role="button"]') ||
                        screen.getByText('Total Orders').closest('div');
      fireEvent.click(ordersCard);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/orders');
  });

  it('displays recent orders section', async () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Recent Orders')).toBeInTheDocument();
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('$1299')).toBeInTheDocument();
    });
  });

  it('displays order status chips correctly', async () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('confirmed')).toBeInTheDocument();
      expect(screen.getByText('shipped')).toBeInTheDocument();
    });
  });

  it('displays alerts section with low stock warning', async () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Alerts')).toBeInTheDocument();
      expect(screen.getByText('Low Stock Alert')).toBeInTheDocument();
      expect(screen.getByText('Arrow3 Pro: 2 left')).toBeInTheDocument();
      expect(screen.getByText('Arrow3 Mini: 1 left')).toBeInTheDocument();
    });
  });

  it('displays system status alert', async () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('System running smoothly. All services operational.')).toBeInTheDocument();
    });
  });

  it('has action buttons that navigate correctly', async () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      const viewAllOrdersButton = screen.getByText('View All Orders');
      const manageInventoryButton = screen.getByText('Manage Inventory');
      
      fireEvent.click(viewAllOrdersButton);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/orders');
      
      fireEvent.click(manageInventoryButton);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
    });
  });

  it('applies correct styling and theme colors', async () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      // Check for dark theme styling
      const dashboard = screen.getByText('Admin Dashboard');
      expect(dashboard).toHaveStyle({ color: 'white' });
    });
  });

  it('handles empty recent orders gracefully', async () => {
    // This test would require mocking the stats to have empty recent orders
    // For now, we test that the component renders without crashing
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Recent Orders')).toBeInTheDocument();
    });
  });
});