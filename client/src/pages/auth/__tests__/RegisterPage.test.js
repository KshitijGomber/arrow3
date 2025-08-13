import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RegisterPage from '../RegisterPage';
import { AuthProvider } from '../../../context/AuthContext';

// Mock the useAuth hook
const mockRegister = jest.fn();
const mockAuthContextValue = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  register: mockRegister,
};

jest.mock('../../../context/AuthContext', () => ({
  ...jest.requireActual('../../../context/AuthContext'),
  useAuth: () => mockAuthContextValue,
}));

// Mock the useAuthForm hook
const mockHandleSubmit = jest.fn();
const mockAuthFormValue = {
  formData: { 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  },
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

describe('RegisterPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form with all required elements', () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    expect(screen.getByText('Join Arrow3 Aerospace')).toBeInTheDocument();
    expect(screen.getByText('Create your account to start exploring our drone collection')).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('displays Google OAuth button', () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    expect(screen.getByText('Sign up with Google')).toBeInTheDocument();
  });

  it('shows sign in link', () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays password requirements helper text', () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('calls handleSubmit when form is submitted', async () => {
    mockHandleSubmit.mockResolvedValue({ success: true });
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  it('displays success message on successful registration', async () => {
    mockHandleSubmit.mockResolvedValue({ success: true });
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });

  it('displays error message on failed registration', async () => {
    const errorMessage = 'Email already exists';
    mockHandleSubmit.mockResolvedValue({ success: false, error: errorMessage });
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('navigates to login page when sign in is clicked', () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('redirects authenticated users', () => {
    // Mock authenticated state
    mockAuthContextValue.isAuthenticated = true;
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('handles redirect after registration', () => {
    // Mock localStorage
    const mockRedirectPath = '/drones';
    Storage.prototype.getItem = jest.fn(() => mockRedirectPath);
    Storage.prototype.removeItem = jest.fn();
    
    mockAuthContextValue.isAuthenticated = true;
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    expect(localStorage.getItem).toHaveBeenCalledWith('redirectAfterLogin');
    expect(localStorage.removeItem).toHaveBeenCalledWith('redirectAfterLogin');
    expect(mockNavigate).toHaveBeenCalledWith(mockRedirectPath);
  });

  it('displays error from URL params', () => {
    // Mock URL search params with error
    const mockSearchParams = new URLSearchParams('?error=Registration%20failed');
    jest.mocked(require('react-router-dom').useSearchParams).mockReturnValue([
      mockSearchParams,
      jest.fn()
    ]);

    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    expect(screen.getByText('Registration failed')).toBeInTheDocument();
  });

  it('disables submit button when form is invalid', () => {
    mockAuthFormValue.isValid = false;
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /create account/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state during form submission', () => {
    mockAuthFormValue.loading = true;
    
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('has proper form structure with name fields in grid', () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const firstNameField = screen.getByLabelText(/first name/i);
    const lastNameField = screen.getByLabelText(/last name/i);
    
    expect(firstNameField).toBeInTheDocument();
    expect(lastNameField).toBeInTheDocument();
    
    // Check that they are in the same row (grid structure)
    const firstNameContainer = firstNameField.closest('.MuiGrid-item');
    const lastNameContainer = lastNameField.closest('.MuiGrid-item');
    
    expect(firstNameContainer).toBeInTheDocument();
    expect(lastNameContainer).toBeInTheDocument();
  });
});