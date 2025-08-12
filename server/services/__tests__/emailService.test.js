const nodemailer = require('nodemailer');

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let mockTransporter;
  let emailService;

  beforeAll(() => {
    // Set up environment variables for testing
    process.env.EMAIL_HOST = 'smtp.gmail.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'test@arrow3.com';
    process.env.EMAIL_PASS = 'test-password';
    process.env.CLIENT_URL = 'http://localhost:3000';

    // Mock transporter
    mockTransporter = {
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
    };

    nodemailer.createTransport = jest.fn().mockReturnValue(mockTransporter);

    // Require emailService after mocking
    emailService = require('../emailService');
  });

  beforeEach(() => {
    // Reset mock call history but keep the mock implementations
    jest.clearAllMocks();
    mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
  });

  describe('Password Reset Email', () => {
    test('should send password reset email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id'
      });

      const result = await emailService.sendPasswordResetEmail({
        to: 'test@arrow3.com',
        firstName: 'Test',
        resetToken: 'test-reset-token'
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: {
            name: 'Arrow3 Aerospace',
            address: process.env.EMAIL_USER
          },
          to: 'test@arrow3.com',
          subject: 'Password Reset Request - Arrow3 Aerospace',
          html: expect.stringContaining('Test'),
          text: expect.stringContaining('Test')
        })
      );
    });

    test('should handle email sending failure', async () => {
      // Mock all retry attempts to fail
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(emailService.sendPasswordResetEmail({
        to: 'test@arrow3.com',
        firstName: 'Test',
        resetToken: 'test-reset-token'
      })).rejects.toThrow('Failed to send password reset email');
    });

    test('should include reset URL in email content', async () => {
      await emailService.sendPasswordResetEmail({
        to: 'test@arrow3.com',
        firstName: 'Test',
        resetToken: 'test-reset-token'
      });

      expect(mockTransporter.sendMail).toHaveBeenCalled();
      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      const expectedUrl = `${process.env.CLIENT_URL}/reset-password?token=test-reset-token`;
      
      expect(emailCall.html).toContain(expectedUrl);
      expect(emailCall.text).toContain(expectedUrl);
    });
  });

  describe('Password Reset Confirmation Email', () => {
    test('should send password reset confirmation email successfully', async () => {
      const result = await emailService.sendPasswordResetConfirmationEmail({
        to: 'test@arrow3.com',
        firstName: 'Test'
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: {
            name: 'Arrow3 Aerospace',
            address: process.env.EMAIL_USER
          },
          to: 'test@arrow3.com',
          subject: 'Password Reset Successful - Arrow3 Aerospace',
          html: expect.stringContaining('Test'),
          text: expect.stringContaining('Test')
        })
      );
    });

    test('should handle email sending failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(emailService.sendPasswordResetConfirmationEmail({
        to: 'test@arrow3.com',
        firstName: 'Test'
      })).rejects.toThrow('Failed to send password reset confirmation email');
    });
  });

  describe('Token Generation and Hashing', () => {
    test('should generate secure reset token', () => {
      const token = emailService.generateResetToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
    });

    test('should hash reset token consistently', () => {
      const token = 'test-token';
      const hash1 = emailService.hashResetToken(token);
      const hash2 = emailService.hashResetToken(token);
      
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(token);
      expect(hash1.length).toBe(64); // SHA256 = 64 hex characters
    });

    test('should generate different hashes for different tokens', () => {
      const token1 = 'test-token-1';
      const token2 = 'test-token-2';
      const hash1 = emailService.hashResetToken(token1);
      const hash2 = emailService.hashResetToken(token2);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Email Templates', () => {
    test('should generate HTML password reset template with user name', () => {
      const html = emailService.getPasswordResetTemplate('John', 'http://example.com/reset');
      
      expect(html).toContain('John');
      expect(html).toContain('http://example.com/reset');
      expect(html).toContain('Arrow3 Aerospace');
      expect(html).toContain('Reset Your Password');
      expect(html).toContain('1 hour');
    });

    test('should generate text password reset template with user name', () => {
      const text = emailService.getPasswordResetTextTemplate('John', 'http://example.com/reset');
      
      expect(text).toContain('John');
      expect(text).toContain('http://example.com/reset');
      expect(text).toContain('Arrow3 Aerospace');
      expect(text).toContain('1 hour');
    });

    test('should generate HTML password reset confirmation template', () => {
      const html = emailService.getPasswordResetConfirmationTemplate('John');
      
      expect(html).toContain('John');
      expect(html).toContain('Arrow3 Aerospace');
      expect(html).toContain('Password Reset Successful');
      expect(html).toContain('Security Tips');
    });

    test('should generate text password reset confirmation template', () => {
      const text = emailService.getPasswordResetConfirmationTextTemplate('John');
      
      expect(text).toContain('John');
      expect(text).toContain('Arrow3 Aerospace');
      expect(text).toContain('Password Reset Successful');
      expect(text).toContain('SECURITY TIPS');
    });
  });

  describe('Order Confirmation Email', () => {
    test('should send order confirmation email successfully', async () => {
      const mockOrder = {
        _id: '507f1f77bcf86cd799439011',
        orderDate: new Date(),
        status: 'confirmed',
        paymentStatus: 'completed',
        quantity: 1,
        totalAmount: 1299,
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'USA'
        }
      };

      const mockDrone = {
        name: 'Arrow3 Pro',
        description: 'Professional drone',
        specifications: {
          weight: 400,
          flightTime: 30,
          maxSpeed: 60,
          cameraResolution: '4K'
        }
      };

      const result = await emailService.sendOrderConfirmationEmail({
        to: 'test@arrow3.com',
        firstName: 'Test',
        order: mockOrder,
        drone: mockDrone
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: {
            name: 'Arrow3 Aerospace',
            address: process.env.EMAIL_USER
          },
          to: 'test@arrow3.com',
          subject: `Order Confirmation #${mockOrder._id} - Arrow3 Aerospace`,
          html: expect.stringContaining('Test'),
          text: expect.stringContaining('Test')
        })
      );
    });

    test('should handle order confirmation email sending failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      const mockOrder = { _id: '507f1f77bcf86cd799439011', orderDate: new Date(), status: 'confirmed', paymentStatus: 'completed', quantity: 1, totalAmount: 1299, shippingAddress: { street: '123 Test St', city: 'Test City', state: 'TS', zipCode: '12345', country: 'USA' } };
      const mockDrone = { name: 'Arrow3 Pro', specifications: {} };

      await expect(emailService.sendOrderConfirmationEmail({
        to: 'test@arrow3.com',
        firstName: 'Test',
        order: mockOrder,
        drone: mockDrone
      })).rejects.toThrow('Failed to send order confirmation email');
    });
  });

  describe('Order Status Update Email', () => {
    test('should send order status update email successfully', async () => {
      const mockOrder = {
        _id: '507f1f77bcf86cd799439011',
        status: 'shipped',
        quantity: 1,
        totalAmount: 1299,
        trackingNumber: 'TRK123456789'
      };

      const mockDrone = {
        name: 'Arrow3 Pro'
      };

      const result = await emailService.sendOrderStatusUpdateEmail({
        to: 'test@arrow3.com',
        firstName: 'Test',
        order: mockOrder,
        drone: mockDrone,
        previousStatus: 'processing'
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: {
            name: 'Arrow3 Aerospace',
            address: process.env.EMAIL_USER
          },
          to: 'test@arrow3.com',
          subject: `Order Update #${mockOrder._id} - Shipped - Arrow3 Aerospace`,
          html: expect.stringContaining('Test'),
          text: expect.stringContaining('Test')
        })
      );
    });
  });

  describe('Retry Logic', () => {
    test('should retry failed operations with exponential backoff', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('Success');

      const result = await emailService.retryOperation(mockOperation, 3);

      expect(result).toBe('Success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    test('should throw error after max retries exceeded', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValue(new Error('Persistent failure'));

      await expect(emailService.retryOperation(mockOperation, 2))
        .rejects.toThrow('Persistent failure');
      
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });
  });

  describe('Status Display Names', () => {
    test('should return correct display names for order statuses', () => {
      expect(emailService.getStatusDisplayName('pending')).toBe('Order Pending');
      expect(emailService.getStatusDisplayName('confirmed')).toBe('Order Confirmed');
      expect(emailService.getStatusDisplayName('processing')).toBe('Processing');
      expect(emailService.getStatusDisplayName('shipped')).toBe('Shipped');
      expect(emailService.getStatusDisplayName('delivered')).toBe('Delivered');
      expect(emailService.getStatusDisplayName('cancelled')).toBe('Cancelled');
      expect(emailService.getStatusDisplayName('unknown')).toBe('unknown');
    });
  });

  describe('Connection Verification', () => {
    test('should initialize email service successfully', () => {
      expect(emailService).toBeDefined();
      expect(typeof emailService.sendPasswordResetEmail).toBe('function');
      expect(typeof emailService.sendOrderConfirmationEmail).toBe('function');
      expect(typeof emailService.sendOrderStatusUpdateEmail).toBe('function');
    });
  });
});