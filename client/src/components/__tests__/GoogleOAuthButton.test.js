import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import GoogleOAuthButton from '../GoogleOAuthButton';
import theme from '../../theme/theme';

// Mock axios
jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })
}));

// Mock the auth context
const mockLoginWithGoogle = jest.fn();
const mockAuthContext = {
  loginWithGoogle: mockLoginWithGoogle,
  loading: false,
  isAuthenticated: false,
  user: null,
  error: null
};

jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuthContext
}));

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetAllMocks();
  process.env = {
    ...originalEnv,
    REACT_APP_GOOGLE_CLIENT_ID: '1026079299000-r5dhctegovc941jflg2ckf9dnger1dgt.apps.googleusercontent.com'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('GoogleOAuthButton', () => {
  test('renders Google OAuth button correctly', () => {
    renderWithProviders(<GoogleOAuthButton />);
    
    const button = screen.getByRole('button', { name: /continue with google/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  test('calls loginWithGoogle when clicked', async () => {
    renderWithProviders(<GoogleOAuthButton />);
    
    const button = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
    });
  });

  test('shows error when Google OAuth is not configured', async () => {
    process.env.REACT_APP_GOOGLE_CLIENT_ID = 'your-google-client-id';
    
    renderWithProviders(<GoogleOAuthButton />);
    
    const button = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/google oauth is not properly configured/i)).toBeInTheDocument();
    });
  });

  test('disables button when loading', () => {
    mockAuthContext.loading = true;
    
    renderWithProviders(<GoogleOAuthButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('shows custom text when provided', () => {
    renderWithProviders(<GoogleOAuthButton text="Sign in with Google" />);
    
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  test('calls onError callback when error occurs', async () => {
    const mockOnError = jest.fn();
    process.env.REACT_APP_GOOGLE_CLIENT_ID = '';
    
    renderWithProviders(<GoogleOAuthButton onError={mockOnError} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('not properly configured'));
    });
  });
});