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
const { generateToken, generateRefreshToken } = require('../../middleware/auth');

describe('Authentication Routes', () => {
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

  describe('POST /api/auth/register', () => {
    const validUserData = {
      email: 'test@arrow3.com',
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User'
    };

    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toMatchObject({
        email: 'test@arrow3.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
        isEmailVerified: false
      });

      // Verify user was created in database
      const user = await User.findOne({ email: 'test@arrow3.com' });
      expect(user).toBeTruthy();
      expect(user.firstName).toBe('Test');
    });

    test('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContainEqual({
        field: 'email',
        message: 'Please provide a valid email address'
      });
    });

    test('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, password: 'weak' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual({
        field: 'password',
        message: 'Password must be at least 6 characters long'
      });
    });

    test('should reject registration with password missing requirements', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, password: 'password123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual({
        field: 'password',
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      });
    });

    test('should reject registration with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@arrow3.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThanOrEqual(3); // password (2 errors), firstName, lastName
      
      // Check that required field errors are present
      const errorFields = response.body.errors.map(err => err.field);
      expect(errorFields).toContain('password');
      expect(errorFields).toContain('firstName');
      expect(errorFields).toContain('lastName');
    });

    test('should reject registration with duplicate email', async () => {
      // Create user first
      await User.create(validUserData);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });

    test('should prevent admin role registration via API', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, role: 'admin' })
        .expect(201);

      expect(response.body.data.user.role).toBe('customer');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'test@arrow3.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      });
    });

    test('should login user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@arrow3.com',
          password: 'Password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toMatchObject({
        email: 'test@arrow3.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer'
      });
    });

    test('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@arrow3.com',
          password: 'Password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    test('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@arrow3.com',
          password: 'WrongPassword123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    test('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    test('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@arrow3.com'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual({
        field: 'password',
        message: 'Password is required'
      });
    });
  });

  describe('POST /api/auth/refresh', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'test@arrow3.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      });
    });

    test('should refresh tokens with valid refresh token', async () => {
      const refreshToken = generateRefreshToken(testUser._id);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Tokens refreshed successfully');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe('test@arrow3.com');
    });

    test('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid refresh token.');
    });

    test('should reject refresh with access token', async () => {
      const accessToken = generateToken(testUser._id, testUser.role);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: accessToken })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid refresh token type.');
    });

    test('should reject refresh with no token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Refresh token is required.');
    });
  });

  describe('GET /api/auth/verify-token', () => {
    let testUser, accessToken;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'test@arrow3.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      });
      accessToken = generateToken(testUser._id, testUser.role);
    });

    test('should verify valid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token is valid');
      expect(response.body.data.user.email).toBe('test@arrow3.com');
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token.');
    });

    test('should reject request with no token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('GET /api/auth/profile', () => {
    let testUser, accessToken;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'test@arrow3.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      });
      accessToken = generateToken(testUser._id, testUser.role);
    });

    test('should get user profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile retrieved successfully');
      expect(response.body.data.user).toMatchObject({
        email: 'test@arrow3.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer'
      });
      expect(response.body.data.user).toHaveProperty('createdAt');
      expect(response.body.data.user).toHaveProperty('updatedAt');
    });

    test('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    let testUser, accessToken;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'test@arrow3.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      });
      accessToken = generateToken(testUser._id, testUser.role);
    });

    test('should update user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data.user.firstName).toBe('Updated');
      expect(response.body.data.user.lastName).toBe('Name');

      // Verify in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
    });

    test('should update email and reset verification', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'newemail@arrow3.com' })
        .expect(200);

      expect(response.body.data.user.email).toBe('newemail@arrow3.com');
      expect(response.body.data.user.isEmailVerified).toBe(false);
    });

    test('should reject duplicate email', async () => {
      // Create another user
      await User.create({
        email: 'existing@arrow3.com',
        password: 'Password123',
        firstName: 'Existing',
        lastName: 'User'
      });

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'existing@arrow3.com' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email is already taken by another user');
    });

    test('should reject invalid email format', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/change-password', () => {
    let testUser, accessToken;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'test@arrow3.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      });
      accessToken = generateToken(testUser._id, testUser.role);
    });

    test('should change password with valid current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'Password123',
          newPassword: 'NewPassword456'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully');

      // Verify password was changed by trying to login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@arrow3.com',
          password: 'NewPassword456'
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    test('should reject change with incorrect current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword456'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Current password is incorrect');
    });

    test('should reject weak new password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'Password123',
          newPassword: 'weak'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    test('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'Password123',
          newPassword: 'NewPassword456'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Google OAuth Routes', () => {
    let testUser, accessToken;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'test@arrow3.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      });
      accessToken = generateToken(testUser._id, testUser.role);
    });

    describe('GET /api/auth/google', () => {
      test('should redirect to Google OAuth', async () => {
        const response = await request(app)
          .get('/api/auth/google')
          .expect(302);

        expect(response.headers.location).toContain('accounts.google.com');
        expect(response.headers.location).toContain('oauth2');
      });
    });

    describe('POST /api/auth/google/link', () => {
      test('should link Google account to existing user', async () => {
        const googleId = 'google-test-id-123';

        const response = await request(app)
          .post('/api/auth/google/link')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ googleId })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Google account linked successfully');
        expect(response.body.data.user.googleId).toBe(googleId);
        expect(response.body.data.user.isEmailVerified).toBe(true);

        // Verify in database
        const updatedUser = await User.findById(testUser._id);
        expect(updatedUser.googleId).toBe(googleId);
        expect(updatedUser.isEmailVerified).toBe(true);
      });

      test('should reject linking Google ID already linked to another user', async () => {
        const googleId = 'google-test-id-123';

        // Create another user with this Google ID
        await User.create({
          email: 'other@arrow3.com',
          password: 'Password123',
          firstName: 'Other',
          lastName: 'User',
          googleId
        });

        const response = await request(app)
          .post('/api/auth/google/link')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ googleId })
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('This Google account is already linked to another user');
      });

      test('should reject linking without Google ID', async () => {
        const response = await request(app)
          .post('/api/auth/google/link')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Google ID is required');
      });

      test('should reject unauthenticated request', async () => {
        const response = await request(app)
          .post('/api/auth/google/link')
          .send({ googleId: 'google-test-id-123' })
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/auth/google/unlink', () => {
      beforeEach(async () => {
        // Add Google ID to test user
        await User.findByIdAndUpdate(testUser._id, { googleId: 'google-test-id-123' });
      });

      test('should unlink Google account from user', async () => {
        const response = await request(app)
          .delete('/api/auth/google/unlink')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Google account unlinked successfully');
        expect(response.body.data.user.googleId).toBeUndefined();

        // Verify in database
        const updatedUser = await User.findById(testUser._id);
        expect(updatedUser.googleId).toBeUndefined();
      });

      test('should reject unlinking if no password set (OAuth-only user)', async () => {
        // Create OAuth-only user and then remove password to simulate OAuth-only account
        const oauthUser = await User.create({
          email: 'oauth@arrow3.com',
          password: 'TempPassword123', // Temporary password
          firstName: 'OAuth',
          lastName: 'User',
          googleId: 'google-oauth-id-456',
          isEmailVerified: true
        });
        
        // Remove password to simulate OAuth-only user
        await User.findByIdAndUpdate(oauthUser._id, { password: '' });

        const oauthToken = generateToken(oauthUser._id, oauthUser.role);

        const response = await request(app)
          .delete('/api/auth/google/unlink')
          .set('Authorization', `Bearer ${oauthToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Cannot unlink Google account. Please set a password first.');
      });

      test('should reject unauthenticated request', async () => {
        const response = await request(app)
          .delete('/api/auth/google/unlink')
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });
  });
});