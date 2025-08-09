const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');

// Mock the email service
jest.mock('../../services/emailService', () => ({
  sendPasswordResetEmail: jest.fn(),
  sendPasswordResetConfirmationEmail: jest.fn()
}));

// Mock passport configuration to avoid OAuth setup issues
jest.mock('../../config/passport', () => ({
  initialize: () => (req, res, next) => next(),
  authenticate: () => (req, res, next) => next()
}));

const emailService = require('../../services/emailService');

describe('Password Reset Endpoints', () => {
  let mongoServer;
  let testUser;
  let app;

  beforeAll(async () => {
    // Set up environment variables for testing
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
    process.env.JWT_EXPIRES_IN = '7d';
    process.env.JWT_REFRESH_EXPIRES_IN = '30d';
    process.env.CLIENT_URL = 'http://localhost:3000';
    process.env.EMAIL_HOST = 'smtp.gmail.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'test@arrow3.com';
    process.env.EMAIL_PASS = 'test-password';
    
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
    
    // Require app after setting up environment
    app = require('../../server');
  });

  afterAll(async () => {
    // Clean up
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database and create test user
    await User.deleteMany({});
    
    testUser = await User.create({
      email: 'test@arrow3.com',
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer'
    });

    // Clear mock calls
    jest.clearAllMocks();
  });

  describe('POST /api/auth/forgot-password', () => {
    test('should send password reset email for valid user', async () => {
      emailService.sendPasswordResetEmail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id'
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@arrow3.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password reset link has been sent to your email address.');

      // Verify email service was called
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith({
        to: 'test@arrow3.com',
        firstName: 'Test',
        resetToken: expect.any(String)
      });

      // Verify user has reset token and expiry
      const updatedUser = await User.findById(testUser._id).select('+resetPasswordToken +resetPasswordExpires');
      expect(updatedUser.resetPasswordToken).toBeDefined();
      expect(updatedUser.resetPasswordExpires).toBeDefined();
      expect(updatedUser.resetPasswordExpires.getTime()).toBeGreaterThan(Date.now());
    });

    test('should return success message even for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@arrow3.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('If an account with that email exists, a password reset link has been sent.');

      // Verify email service was not called
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    test('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContainEqual({
        field: 'email',
        message: 'Please provide a valid email address'
      });
    });

    test('should handle email service failure', async () => {
      emailService.sendPasswordResetEmail.mockRejectedValue(new Error('Email service error'));

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@arrow3.com' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to send password reset email. Please try again later.');

      // Verify reset token was removed after email failure
      const updatedUser = await User.findById(testUser._id).select('+resetPasswordToken +resetPasswordExpires');
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpires).toBeUndefined();
    });

    test('should require email field', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;

    beforeEach(async () => {
      // Generate reset token for test user
      resetToken = testUser.createPasswordResetToken();
      await testUser.save({ validateBeforeSave: false });
    });

    test('should reset password with valid token', async () => {
      emailService.sendPasswordResetConfirmationEmail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id'
      });

      const newPassword = 'NewPassword123';
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password has been reset successfully. You can now log in with your new password.');

      // Verify password was changed
      const updatedUser = await User.findById(testUser._id).select('+password +resetPasswordToken +resetPasswordExpires');
      const isNewPasswordValid = await updatedUser.comparePassword(newPassword);
      expect(isNewPasswordValid).toBe(true);

      // Verify reset token was cleared
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpires).toBeUndefined();

      // Verify confirmation email was sent
      expect(emailService.sendPasswordResetConfirmationEmail).toHaveBeenCalledWith({
        to: 'test@arrow3.com',
        firstName: 'Test'
      });
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'NewPassword123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired password reset token.');
    });

    test('should reject expired token', async () => {
      // Manually set token expiry to past
      testUser.resetPasswordExpires = Date.now() - 1000; // 1 second ago
      await testUser.save({ validateBeforeSave: false });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewPassword123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired password reset token.');
    });

    test('should validate password requirements', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'weak'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: expect.stringContaining('Password must be at least 6 characters long')
          })
        ])
      );
    });

    test('should require token field', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          password: 'NewPassword123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContainEqual({
        field: 'token',
        message: 'Reset token is required'
      });
    });

    test('should require password field', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    test('should continue even if confirmation email fails', async () => {
      emailService.sendPasswordResetConfirmationEmail.mockRejectedValue(new Error('Email service error'));

      const newPassword = 'NewPassword123';
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password has been reset successfully. You can now log in with your new password.');

      // Verify password was still changed despite email failure
      const updatedUser = await User.findById(testUser._id).select('+password');
      const isNewPasswordValid = await updatedUser.comparePassword(newPassword);
      expect(isNewPasswordValid).toBe(true);
    });

    test('should allow login with new password after reset', async () => {
      const newPassword = 'NewPassword123';
      
      // Reset password
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword
        })
        .expect(200);

      // Try to login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@arrow3.com',
          password: newPassword
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data).toHaveProperty('accessToken');
      expect(loginResponse.body.data.user.email).toBe('test@arrow3.com');
    });

    test('should not allow login with old password after reset', async () => {
      const newPassword = 'NewPassword123';
      const oldPassword = 'Password123';
      
      // Reset password
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword
        })
        .expect(200);

      // Try to login with old password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@arrow3.com',
          password: oldPassword
        })
        .expect(401);

      expect(loginResponse.body.success).toBe(false);
      expect(loginResponse.body.message).toBe('Invalid email or password');
    });
  });

  describe('User Model Password Reset Methods', () => {
    test('createPasswordResetToken should generate valid token', () => {
      const token = testUser.createPasswordResetToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
      expect(testUser.resetPasswordToken).toBeDefined();
      expect(testUser.resetPasswordExpires).toBeDefined();
      expect(testUser.resetPasswordExpires.getTime()).toBeGreaterThan(Date.now());
    });

    test('verifyPasswordResetToken should validate correct token', () => {
      const token = testUser.createPasswordResetToken();
      const isValid = testUser.verifyPasswordResetToken(token);
      
      expect(isValid).toBe(true);
    });

    test('verifyPasswordResetToken should reject incorrect token', () => {
      testUser.createPasswordResetToken();
      const isValid = testUser.verifyPasswordResetToken('wrong-token');
      
      expect(isValid).toBe(false);
    });

    test('verifyPasswordResetToken should reject expired token', () => {
      const token = testUser.createPasswordResetToken();
      testUser.resetPasswordExpires = Date.now() - 1000; // 1 second ago
      
      const isValid = testUser.verifyPasswordResetToken(token);
      expect(isValid).toBe(false);
    });

    test('findByValidResetToken should find user with valid token', async () => {
      const token = testUser.createPasswordResetToken();
      await testUser.save({ validateBeforeSave: false });
      
      const foundUser = await User.findByValidResetToken(token);
      expect(foundUser).toBeDefined();
      expect(foundUser._id.toString()).toBe(testUser._id.toString());
    });

    test('findByValidResetToken should not find user with invalid token', async () => {
      testUser.createPasswordResetToken();
      await testUser.save({ validateBeforeSave: false });
      
      const foundUser = await User.findByValidResetToken('invalid-token');
      expect(foundUser).toBeNull();
    });

    test('findByValidResetToken should not find user with expired token', async () => {
      const token = testUser.createPasswordResetToken();
      testUser.resetPasswordExpires = Date.now() - 1000; // 1 second ago
      await testUser.save({ validateBeforeSave: false });
      
      const foundUser = await User.findByValidResetToken(token);
      expect(foundUser).toBeNull();
    });
  });
});