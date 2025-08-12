import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import OAuthCallback from '../OAuthCallback';
import theme from '../../../theme/theme';

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

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams('token=test-token&refresh=test-refresh&user=%7B%22id%22%3A%22123%22%2C%22email%22%3A%22test%40example.com%22%7D')]
}));

// Mock the auth context
const mockHandleOAuthCallback = jest.fn();
const mockAuthContext = {
  handleOAuthCallback: mockHandleOAuthCallback,
  loading: false,
  isAuthenticated: false,
  user: null,
  error: null
};

jest.mock('../../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuthContext
}));

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
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

describe('OAuthCallback', () => {
  test('shows processing state initially', () => {
    renderWithProviders(<OAuthCallback />);
    
    expect(screen.getByText(/completing your login/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('processes successful OAuth callback', async () => {
    mockHandleOAuthCallback.mockReturnValue({ success: true });
    
    renderWithProviders(<OAuthCallback />);
    
    await waitFor(() => {
      expect(mockHandleOAuthCallback).toHaveBeenCalledWith(
        'test-token',
        'test-refresh',
        expect.stringContaining('test@example.com')
      );
    });
  });

  test('handles OAuth callback failure', async () => {
    mockHandleOAuthCallback.mockReturnValue({ success: false });
    
    renderWithProviders(<OAuthCallback />);
    
    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });
  });

  test('handles OAuth error from URL params', async () => {
    // Mock useSearchParams to return error
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
      useSearchParams: () => [new URLSearchParams('error=oauth_failed')]
    }));
    
    renderWithProviders(<OAuthCallback />);
    
    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });
  });

  test('redirects to intended page after successful login', async () => {
    localStorage.setItem('redirectAfterLogin', '/drones');
    mockHandleOAuthCallback.mockReturnValue({ success: true });
    
    renderWithProviders(<OAuthCallback />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/drones');
    }, { timeout: 2000 });
  });

  test('redirects to home page if no redirect path stored', async () => {
    mockHandleOAuthCallback.mockReturnValue({ success: true });
    
    renderWithProviders(<OAuthCallback />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 2000 });
  });
});