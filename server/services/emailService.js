const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
    }
  }

  /**
   * Generate a secure password reset token
   * @returns {string} Reset token
   */
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash the reset token for database storage
   * @param {string} token - Plain text token
   * @returns {string} Hashed token
   */
  hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Send password reset email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.firstName - Recipient first name
   * @param {string} options.resetToken - Password reset token
   * @returns {Promise<Object>} Email send result
   */
  async sendPasswordResetEmail({ to, firstName, resetToken }) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: {
          name: 'Arrow3 Aerospace',
          address: process.env.EMAIL_USER
        },
        to: to,
        subject: 'Password Reset Request - Arrow3 Aerospace',
        html: this.getPasswordResetTemplate(firstName, resetUrl),
        text: this.getPasswordResetTextTemplate(firstName, resetUrl)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send password reset confirmation email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.firstName - Recipient first name
   * @returns {Promise<Object>} Email send result
   */
  async sendPasswordResetConfirmationEmail({ to, firstName }) {
    try {
      const mailOptions = {
        from: {
          name: 'Arrow3 Aerospace',
          address: process.env.EMAIL_USER
        },
        to: to,
        subject: 'Password Reset Successful - Arrow3 Aerospace',
        html: this.getPasswordResetConfirmationTemplate(firstName),
        text: this.getPasswordResetConfirmationTextTemplate(firstName)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset confirmation email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('❌ Failed to send password reset confirmation email:', error);
      throw new Error('Failed to send password reset confirmation email');
    }
  }

  /**
   * HTML template for password reset email
   * @param {string} firstName - User's first name
   * @param {string} resetUrl - Password reset URL
   * @returns {string} HTML template
   */
  getPasswordResetTemplate(firstName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Arrow3 Aerospace</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #00ff88;
            margin-bottom: 10px;
          }
          .content {
            margin-bottom: 30px;
          }
          .reset-button {
            display: inline-block;
            background-color: #00ff88;
            color: #1a1a1a;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .reset-button:hover {
            background-color: #00cc6a;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #333;
            font-size: 14px;
            color: #888;
            text-align: center;
          }
          .warning {
            background-color: #2d2d2d;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ff6b6b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Arrow3 Aerospace</div>
            <h2>Password Reset Request</h2>
          </div>
          
          <div class="content">
            <p>Hello ${firstName},</p>
            
            <p>We received a request to reset your password for your Arrow3 Aerospace account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">Reset Your Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #00ff88;">${resetUrl}</p>
            
            <div class="warning">
              <p><strong>Important:</strong></p>
              <ul>
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>This email was sent from Arrow3 Aerospace. If you have any questions, please contact our support team.</p>
            <p>&copy; ${new Date().getFullYear()} Arrow3 Aerospace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Plain text template for password reset email
   * @param {string} firstName - User's first name
   * @param {string} resetUrl - Password reset URL
   * @returns {string} Plain text template
   */
  getPasswordResetTextTemplate(firstName, resetUrl) {
    return `
Arrow3 Aerospace - Password Reset Request

Hello ${firstName},

We received a request to reset your password for your Arrow3 Aerospace account.

To reset your password, please visit the following link:
${resetUrl}

IMPORTANT:
- This link will expire in 1 hour for security reasons
- If you didn't request this password reset, please ignore this email
- Your password will remain unchanged until you create a new one

If you have any questions, please contact our support team.

© ${new Date().getFullYear()} Arrow3 Aerospace. All rights reserved.
    `;
  }

  /**
   * HTML template for password reset confirmation email
   * @param {string} firstName - User's first name
   * @returns {string} HTML template
   */
  getPasswordResetConfirmationTemplate(firstName) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful - Arrow3 Aerospace</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #00ff88;
            margin-bottom: 10px;
          }
          .success-icon {
            font-size: 48px;
            color: #00ff88;
            margin: 20px 0;
          }
          .content {
            margin-bottom: 30px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #333;
            font-size: 14px;
            color: #888;
            text-align: center;
          }
          .security-tips {
            background-color: #2d2d2d;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #00ff88;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Arrow3 Aerospace</div>
            <div class="success-icon">✅</div>
            <h2>Password Reset Successful</h2>
          </div>
          
          <div class="content">
            <p>Hello ${firstName},</p>
            
            <p>Your password has been successfully reset for your Arrow3 Aerospace account. You can now log in with your new password.</p>
            
            <div class="security-tips">
              <p><strong>Security Tips:</strong></p>
              <ul>
                <li>Keep your password secure and don't share it with anyone</li>
                <li>Use a unique password that you don't use for other accounts</li>
                <li>Consider enabling two-factor authentication for added security</li>
                <li>If you notice any suspicious activity, contact us immediately</li>
              </ul>
            </div>
            
            <p>If you didn't make this change or have any concerns about your account security, please contact our support team immediately.</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from Arrow3 Aerospace. If you have any questions, please contact our support team.</p>
            <p>&copy; ${new Date().getFullYear()} Arrow3 Aerospace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Plain text template for password reset confirmation email
   * @param {string} firstName - User's first name
   * @returns {string} Plain text template
   */
  getPasswordResetConfirmationTextTemplate(firstName) {
    return `
Arrow3 Aerospace - Password Reset Successful

Hello ${firstName},

Your password has been successfully reset for your Arrow3 Aerospace account. You can now log in with your new password.

SECURITY TIPS:
- Keep your password secure and don't share it with anyone
- Use a unique password that you don't use for other accounts
- Consider enabling two-factor authentication for added security
- If you notice any suspicious activity, contact us immediately

If you didn't make this change or have any concerns about your account security, please contact our support team immediately.

© ${new Date().getFullYear()} Arrow3 Aerospace. All rights reserved.
    `;
  }
}

module.exports = new EmailService();