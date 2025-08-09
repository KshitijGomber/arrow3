// Mock environment variables BEFORE importing modules
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.CLIENT_URL = 'http://localhost:3000';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/User');

describe('Google OAuth Integration', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('OAuth Flow Integration', () => {
    test('should initiate Google OAuth flow', async () => {
      const response = await request(app)
        .get('/api/auth/google')
        .expect(302);

      // Should redirect to Google OAuth
      expect(response.headers.location).toContain('accounts.google.com');
      expect(response.headers.location).toContain('oauth2');
      expect(response.headers.location).toContain('client_id=test-google-client-id');
      expect(response.headers.location).toContain('scope=profile%20email');
    });

    test('should handle OAuth callback with new user creation', async () => {
      // Mock Google profile data
      const mockGoogleProfile = {
        id: 'google-test-id-123',
        emails: [{ value: 'newuser@gmail.com' }],
        name: {
          givenName: 'John',
          familyName: 'Doe'
        }
      };

      // Create user using the same logic as OAuth callback
      const user = await User.findOrCreateGoogleUser(mockGoogleProfile);

      expect(user).toBeTruthy();
      expect(user.email).toBe('newuser@gmail.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.googleId).toBe('google-test-id-123');
      expect(user.isEmailVerified).toBe(true);
      expect(user.role).toBe('customer');
    });

    test('should handle OAuth callback with existing user linking', async () => {
      // Create existing user
      const existingUser = await User.create({
        email: 'existing@gmail.com',
        password: 'Password123',
        firstName: 'Jane',
        lastName: 'Smith'
      });

      // Mock Google profile with same email
      const mockGoogleProfile = {
        id: 'google-test-id-456',
        emails: [{ value: 'existing@gmail.com' }],
        name: {
          givenName: 'Jane',
          familyName: 'Smith'
        }
      };

      // Link existing user with Google
      const linkedUser = await User.findOrCreateGoogleUser(mockGoogleProfile);

      expect(linkedUser._id.toString()).toBe(existingUser._id.toString());
      expect(linkedUser.googleId).toBe('google-test-id-456');
      expect(linkedUser.isEmailVerified).toBe(true);
    });

    test('should handle OAuth callback with existing Google user', async () => {
      // Create user with Google ID
      const existingGoogleUser = await User.create({
        email: 'google@gmail.com',
        password: 'RandomPassword123',
        firstName: 'Google',
        lastName: 'User',
        googleId: 'google-test-id-789',
        isEmailVerified: true
      });

      // Mock Google profile with same Google ID
      const mockGoogleProfile = {
        id: 'google-test-id-789',
        emails: [{ value: 'google@gmail.com' }],
        name: {
          givenName: 'Google',
          familyName: 'User'
        }
      };

      // Should return existing user
      const user = await User.findOrCreateGoogleUser(mockGoogleProfile);

      expect(user._id.toString()).toBe(existingGoogleUser._id.toString());
      expect(user.googleId).toBe('google-test-id-789');
    });

    test('should validate OAuth callback URL format', async () => {
      // Test that callback URL is properly formatted
      const response = await request(app)
        .get('/api/auth/google')
        .expect(302);

      const redirectUrl = response.headers.location;
      expect(redirectUrl).toContain('redirect_uri=');
      expect(redirectUrl).toContain('callback');
    });
  });

  describe('OAuth Error Handling', () => {
    test('should handle OAuth profile creation errors', async () => {
      // Mock invalid profile (missing required fields)
      const invalidProfile = {
        id: 'google-test-id-invalid',
        emails: [], // No email
        name: {
          givenName: 'Invalid',
          familyName: 'User'
        }
      };

      // Should throw error for invalid profile
      await expect(User.findOrCreateGoogleUser(invalidProfile))
        .rejects.toThrow();
    });

    test('should handle database errors during OAuth user creation', async () => {
      // Mock profile with invalid email format
      const profileWithInvalidEmail = {
        id: 'google-test-id-invalid-email',
        emails: [{ value: 'invalid-email-format' }],
        name: {
          givenName: 'Invalid',
          familyName: 'Email'
        }
      };

      // Should handle validation errors gracefully
      await expect(User.findOrCreateGoogleUser(profileWithInvalidEmail))
        .rejects.toThrow();
    });
  });

  describe('OAuth Security', () => {
    test('should generate secure random password for OAuth users', async () => {
      const mockGoogleProfile = {
        id: 'google-security-test',
        emails: [{ value: 'security@gmail.com' }],
        name: {
          givenName: 'Security',
          familyName: 'Test'
        }
      };

      const user = await User.findOrCreateGoogleUser(mockGoogleProfile);
      
      // Password should exist and be hashed
      const userWithPassword = await User.findById(user._id).select('+password');
      expect(userWithPassword.password).toBeTruthy();
      expect(userWithPassword.password.length).toBeGreaterThan(10); // Should be hashed
    });

    test('should prevent duplicate Google ID linking', async () => {
      // Create first user with Google ID
      await User.create({
        email: 'first@gmail.com',
        password: 'Password123',
        firstName: 'First',
        lastName: 'User',
        googleId: 'duplicate-google-id'
      });

      // Try to create second user with same Google ID
      const duplicateProfile = {
        id: 'duplicate-google-id',
        emails: [{ value: 'second@gmail.com' }],
        name: {
          givenName: 'Second',
          familyName: 'User'
        }
      };

      // Should return the first user, not create a new one
      const user = await User.findOrCreateGoogleUser(duplicateProfile);
      expect(user.email).toBe('first@gmail.com');
      expect(user.firstName).toBe('First');
    });
  });
});