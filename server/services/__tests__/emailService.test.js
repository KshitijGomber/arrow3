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
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock transporter
    mockTransporter = {
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest.fn()
    };

    nodemailer.createTransport = jest.fn().mockReturnValue(mockTransporter);

    // Require emailService after mocking
    delete require.cache[require.resolve('../emailService')];
    emailService = require('../emailService');
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
      // Clear previous mock calls
      mockTransporter.sendMail.mockClear();
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(emailService.sendPasswordResetEmail({
        to: 'test@arrow3.com',
        firstName: 'Test',
        resetToken: 'test-reset-token'
      })).rejects.toThrow('Failed to send password reset email');
    });

    test('should include reset URL in email content', async () => {
      mockTransporter.sendMail.mockClear();
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id'
      });

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
      mockTransporter.sendMail.mockClear();
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id'
      });

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
      mockTransporter.sendMail.mockClear();
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

  describe('Connection Verification', () => {
    test('should verify email connection on initialization', () => {
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    test('should handle connection verification failure', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));
      
      // Mock console.error to avoid test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Re-require emailService to trigger verification with error
      delete require.cache[require.resolve('../emailService')];
      require('../emailService');
      
      // Wait for async verification
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Email service connection failed:',
        'Connection failed'
      );
      
      consoleSpy.mockRestore();
    });
  });
});