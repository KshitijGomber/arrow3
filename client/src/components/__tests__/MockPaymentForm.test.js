import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MockPaymentForm from '../MockPaymentForm';

// Mock the payment queries
jest.mock('../../hooks/queries/usePaymentQueries', () => ({
  useCreatePaymentIntent: () => ({
    mutateAsync: jest.fn().mockResolvedValue({ id: 'pi_test_123' }),
  }),
  useConfirmPayment: () => ({
    mutateAsync: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 129900,
    }),
  }),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
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
const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('MockPaymentForm Component', () => {
  const mockOrderData = {
    _id: 'order_123',
    totalAmount: 1299,
    customerInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
    },
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
    },
  };

  const mockOnPaymentSuccess = jest.fn();
  const mockOnPaymentError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment form with all required fields', () => {
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={mockOrderData}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Payment Information')).toBeInTheDocument();
    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expiry month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expiry year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cvc/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cardholder name/i)).toBeInTheDocument();
  });

  it('displays demo payment system alert', () => {
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={mockOrderData}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/demo payment system/i)).toBeInTheDocument();
    expect(screen.getByText(/no real charges will be made/i)).toBeInTheDocument();
  });

  it('fills test data when "Fill Test Data" button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={mockOrderData}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    const fillTestDataButton = screen.getByRole('button', { name: /fill test data/i });
    await user.click(fillTestDataButton);

    await waitFor(() => {
      const cardNumberInput = screen.getByLabelText(/card number/i);
      expect(cardNumberInput.value).toMatch(/\d{4} \d{4} \d{4} \d{4}/);
    });

    expect(screen.getByLabelText(/cardholder name/i)).toHaveValue('Test User');
  });

  it('formats card number with spaces', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={mockOrderData}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    const cardNumberInput = screen.getByLabelText(/card number/i);
    await user.type(cardNumberInput, '4242424242424242');

    expect(cardNumberInput.value).toBe('4242 4242 4242 4242');
  });

  it('detects card brand from card number', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={mockOrderData}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    const cardNumberInput = screen.getByLabelText(/card number/i);
    
    // Test Visa card
    await user.type(cardNumberInput, '4242424242424242');
    expect(screen.getByText('Visa')).toBeInTheDocument();

    // Clear and test Mastercard
    await user.clear(cardNumberInput);
    await user.type(cardNumberInput, '5555555555554444');
    expect(screen.getByText('Mastercard')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={mockOrderData}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /pay/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/card number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/expiry month is required/i)).toBeInTheDocument();
      expect(screen.getByText(/expiry year is required/i)).toBeInTheDocument();
      expect(screen.getByText(/cvc is required/i)).toBeInTheDocument();
      expect(screen.getByText(/cardholder name is required/i)).toBeInTheDocument();
    });
  });

  it('validates card expiry date', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={mockOrderData}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    const monthInput = screen.getByLabelText(/expiry month/i);
    const yearInput = screen.getByLabelText(/expiry year/i);

    // Test expired card
    await user.type(monthInput, '01');
    await user.type(yearInput, '2020');

    const submitButton = screen.getByRole('button', { name: /pay/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/card has expired/i)).toBeInTheDocument();
    });
  });

  it('validates CVC format', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={mockOrderData}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    const cvcInput = screen.getByLabelText(/cvc/i);
    await user.type(cvcInput, '12'); // Too short

    const submitButton = screen.getByRole('button', { name: /pay/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/cvc must be 3 or 4 digits/i)).toBeInTheDocument();
    });
  });

  it('pre-fills billing address from shipping address', () => {
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={mockOrderData}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New York')).toBeInTheDocument();
    expect(screen.getByDisplayValue('NY')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('United States')).toBeInTheDocument();
  });

  it('submits payment with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={mockOrderData}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    // Fill in valid payment data
    await user.type(screen.getByLabelText(/card number/i), '4242424242424242');
    await user.type(screen.getByLabelText(/expiry month/i), '12');
    await user.type(screen.getByLabelText(/expiry year/i), '2028');
    await user.type(screen.getByLabelText(/cvc/i), '123');
    await user.type(screen.getByLabelText(/cardholder name/i), 'John Doe');

    const submitButton = screen.getByRole('button', { name: /pay/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnPaymentSuccess).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('displays processing states during payment', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={mockOrderData}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    // Fill in valid payment data
    await user.type(screen.getByLabelText(/card number/i), '4242424242424242');
    await user.type(screen.getByLabelText(/expiry month/i), '12');
    await user.type(screen.getByLabelText(/expiry year/i), '2028');
    await user.type(screen.getByLabelText(/cvc/i), '123');
    await user.type(screen.getByLabelText(/cardholder name/i), 'John Doe');

    const submitButton = screen.getByRole('button', { name: /pay/i });
    await user.click(submitButton);

    // Should show processing state
    expect(screen.getByText(/processing payment/i)).toBeInTheDocument();
    expect(screen.getByText(/creating payment intent/i)).toBeInTheDocument();
  });

  it('disables form during processing', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={mockOrderData}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    // Fill in valid payment data
    await user.type(screen.getByLabelText(/card number/i), '4242424242424242');
    await user.type(screen.getByLabelText(/expiry month/i), '12');
    await user.type(screen.getByLabelText(/expiry year/i), '2028');
    await user.type(screen.getByLabelText(/cvc/i), '123');
    await user.type(screen.getByLabelText(/cardholder name/i), 'John Doe');

    const submitButton = screen.getByRole('button', { name: /pay/i });
    await user.click(submitButton);

    // Form fields should be disabled during processing
    expect(screen.getByLabelText(/card number/i)).toBeDisabled();
    expect(screen.getByLabelText(/cardholder name/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /fill test data/i })).toBeDisabled();
  });

  it('displays total amount in submit button', () => {
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={mockOrderData}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /pay 1299.00/i })).toBeInTheDocument();
  });

  it('handles missing order data gracefully', () => {
    render(
      <TestWrapper>
        <MockPaymentForm
          orderData={null}
          onPaymentSuccess={mockOnPaymentSuccess}
          onPaymentError={mockOnPaymentError}
        />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /pay 0.00/i })).toBeInTheDocument();
  });
});