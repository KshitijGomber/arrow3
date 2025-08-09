const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../../models/User');
const {
  generateToken,
  generateRefreshToken,
  verifyToken,
  authenticate,
  authorize,
  optionalAuth,
  refreshToken
} = require('../auth');

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.JWT_EXPIRES_IN = '7d';

describe('JWT Authentication Middleware', () => {
  let mongoServer;
  let testUser;

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
    testUser = await User.create({
      email: 'test@arrow3.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer'
    });
  });

  describe('generateToken', () => {
    test('should generate a valid JWT token', () => {
      const token = generateToken(testUser._id, testUser.role);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(testUser._id.toString());
      expect(decoded.role).toBe('customer');
      expect(decoded.iss).toBe('arrow3-aerospace');
      expect(decoded.aud).toBe('arrow3-users');
    });
  });

  describe('generateRefreshToken', () => {
    test('should generate a valid refresh token', () => {
      const refreshToken = generateRefreshToken(testUser._id);
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      expect(decoded.userId).toBe(testUser._id.toString());
      expect(decoded.type).toBe('refresh');
    });
  });

  describe('verifyToken', () => {
    test('should verify a valid access token', () => {
      const token = generateToken(testUser._id, testUser.role);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(testUser._id.toString());
      expect(decoded.role).toBe('customer');
    });

    test('should verify a valid refresh token', () => {
      const refreshToken = generateRefreshToken(testUser._id);
      const decoded = verifyToken(refreshToken, true);
      
      expect(decoded.userId).toBe(testUser._id.toString());
      expect(decoded.type).toBe('refresh');
    });

    test('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });
  });

  describe('authenticate middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {},
        cookies: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    test('should authenticate user with valid Bearer token', async () => {
      const token = generateToken(testUser._id, testUser.role);
      req.headers.authorization = `Bearer ${token}`;

      await authenticate(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('test@arrow3.com');
      expect(req.userId).toEqual(testUser._id);
      expect(req.userRole).toBe('customer');
      expect(next).toHaveBeenCalled();
    });

    test('should authenticate user with valid cookie token', async () => {
      const token = generateToken(testUser._id, testUser.role);
      req.cookies.token = token;

      await authenticate(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('test@arrow3.com');
      expect(next).toHaveBeenCalled();
    });

    test('should reject request with no token', async () => {
      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with refresh token', async () => {
      const refreshToken = generateRefreshToken(testUser._id);
      req.headers.authorization = `Bearer ${refreshToken}`;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token type. Please use access token.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request when user no longer exists', async () => {
      const token = generateToken(testUser._id, testUser.role);
      await User.findByIdAndDelete(testUser._id);
      req.headers.authorization = `Bearer ${token}`;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token is valid but user no longer exists.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: testUser
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    test('should allow access for authorized role', () => {
      const authorizeCustomer = authorize('customer');
      authorizeCustomer(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow access for multiple authorized roles', () => {
      const authorizeMultiple = authorize('customer', 'admin');
      authorizeMultiple(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should deny access for unauthorized role', () => {
      const authorizeAdmin = authorize('admin');
      authorizeAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Required role: admin'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should deny access when no user in request', () => {
      req.user = null;
      const authorizeCustomer = authorize('customer');
      authorizeCustomer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {},
        cookies: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    test('should authenticate user with valid token', async () => {
      const token = generateToken(testUser._id, testUser.role);
      req.headers.authorization = `Bearer ${token}`;

      await optionalAuth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('test@arrow3.com');
      expect(next).toHaveBeenCalled();
    });

    test('should continue without authentication when no token', async () => {
      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    test('should continue without authentication when token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('refreshToken middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        body: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    test('should refresh tokens with valid refresh token', async () => {
      const refreshTokenValue = generateRefreshToken(testUser._id);
      req.body.refreshToken = refreshTokenValue;

      await refreshToken(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tokens refreshed successfully',
        data: expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          user: expect.objectContaining({
            id: testUser._id,
            email: 'test@arrow3.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'customer'
          })
        })
      });
    });

    test('should reject request with no refresh token', async () => {
      await refreshToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Refresh token is required.'
      });
    });

    test('should reject request with invalid refresh token', async () => {
      req.body.refreshToken = 'invalid-refresh-token';

      await refreshToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid refresh token.'
      });
    });

    test('should reject request with access token instead of refresh token', async () => {
      const accessToken = generateToken(testUser._id, testUser.role);
      req.body.refreshToken = accessToken;

      await refreshToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid refresh token type.'
      });
    });
  });
});