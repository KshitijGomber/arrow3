import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import ProfilePage from '../ProfilePage';

// Mock API
jest.mock('../../utils/api', () => ({
  get: jest.fn(),
  put: jest.fn(),
}));

// Mock user context
const mockUser = {
  id: 'test-user-id',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  isEmailVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
};

const mockAuthContextValue = {
  user: mockUser,
  isAuthenticated: true,
  updateUser: jest.fn(),
};

// Mock AuthProvider
jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuthContextValue,
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    // Mock successful API responses
    require('../../utils/api').get.mockResolvedValue({
      data: {
        success: true,
        data: {
          orders: [
            {
              _id: 'order-1',
              droneId: {
                name: 'Test Drone',
              },
              quantity: 1,
              totalAmount: 1000,
              status: 'delivered',
              paymentStatus: 'completed',
              orderDate: '2024-01-15T00:00:00Z',
            },
          ],
        },
      },
    });

    require('../../utils/api').put.mockResolvedValue({
      data: {
        success: true,
        data: {
          user: {
            ...mockUser,
            firstName: 'UpdatedName',
          },
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders profile page with user information', async () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    // Check if page elements are rendered
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    expect(screen.getByText('Order History')).toBeInTheDocument();
  });

  it('displays user information correctly', async () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    // Check user details
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  it('shows account information fields', async () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    // Check account information fields
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Account Status')).toBeInTheDocument();
    expect(screen.getByText('Member Since')).toBeInTheDocument();
  });
});
