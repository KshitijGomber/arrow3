import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoginPage from '../LoginPage';
import { AuthProvider } from '../../../context/AuthContext';

// Mock the useAuth hook
const mockLogin = jest.fn();
const mockAuthContextValue = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  login: mockLogin,
};

jest.mock('../../../context/AuthContext', () => ({
  ...jest.requireActual('../../../context/AuthContext'),
  useAuth: () => mockAuthContextValue,
}));

// Mock the useAuthForm hook
const mockHandleSubmit = jest.fn();
const mockAuthFormValue = {
  formData: { email: '', password: '' },
  formErrors: {},
  showPassword: false,
  loading: false,
  handleChange: (field) => jest.fn(),
  handleSubmit: mockHandleSubmit,
  togglePasswordVisibility: jest.fn(),
  isValid: true,
};

jest.mock('../../../hooks/useAuthForm', () => ({
  useAuthForm: () => mockAuthFormValue,
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
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
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form with all required elements', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your Arrow3 Aerospace account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays Google OAuth button', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('shows forgot password link', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
  });

  it('shows sign up link', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('calls handleSubmit when form is submitted', async () => {
    mockHandleSubmit.mockResolvedValue({ success: true });
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  it('displays success message on successful login', async () => {
    mockHandleSubmit.mockResolvedValue({ success: true });
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
  });

  it('displays error message on failed login', async () => {
    const errorMessage = 'Invalid credentials';
    mockHandleSubmit.mockResolvedValue({ success: false, error: errorMessage });
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('navigates to register page when sign up is clicked', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpButton);

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('redirects authenticated users', () => {
    // Mock authenticated state
    mockAuthContextValue.isAuthenticated = true;
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('handles redirect after login', () => {
    // Mock localStorage
    const mockRedirectPath = '/admin/products';
    Storage.prototype.getItem = jest.fn(() => mockRedirectPath);
    Storage.prototype.removeItem = jest.fn();
    
    mockAuthContextValue.isAuthenticated = true;
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(localStorage.getItem).toHaveBeenCalledWith('redirectAfterLogin');
    expect(localStorage.removeItem).toHaveBeenCalledWith('redirectAfterLogin');
    expect(mockNavigate).toHaveBeenCalledWith(mockRedirectPath);
  });

  it('displays error from URL params', () => {
    // Mock URL search params with error
    const mockSearchParams = new URLSearchParams('?error=OAuth%20failed');
    jest.mocked(require('react-router-dom').useSearchParams).mockReturnValue([
      mockSearchParams,
      jest.fn()
    ]);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('OAuth failed')).toBeInTheDocument();
  });

  it('disables submit button when form is invalid', () => {
    mockAuthFormValue.isValid = false;
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state during form submission', () => {
    mockAuthFormValue.loading = true;
    
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});