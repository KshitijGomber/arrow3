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

    // Email retry configuration
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second base delay

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
   * Retry utility function with exponential backoff
   * @param {Function} operation - The operation to retry
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise<any>} Result of the operation
   */
  async retryOperation(operation, maxRetries = this.maxRetries) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`❌ Email operation failed (attempt ${attempt}/${maxRetries}):`, error.message);
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff: delay increases with each attempt
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
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

      const result = await this.retryOperation(async () => {
        return await this.transporter.sendMail(mailOptions);
      });

      console.log('✅ Password reset email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('❌ Failed to send password reset email after retries:', error);
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

      const result = await this.retryOperation(async () => {
        return await this.transporter.sendMail(mailOptions);
      });

      console.log('✅ Password reset confirmation email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('❌ Failed to send password reset confirmation email after retries:', error);
      throw new Error('Failed to send password reset confirmation email');
    }
  }

  /**
   * Send order confirmation email (simplified interface for order object)
   * @param {Object} order - Order object with populated droneId and customerInfo
   * @returns {Promise<Object>} Email send result
   */
  async sendOrderConfirmation(order) {
    const to = order.customerInfo.email;
    const firstName = order.customerInfo.firstName;
    const drone = order.droneId;
    
    return await this.sendOrderConfirmationEmail({ to, firstName, order, drone });
  }

  /**
   * Send order confirmation email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.firstName - Recipient first name
   * @param {Object} options.order - Order details
   * @param {Object} options.drone - Drone details
   * @returns {Promise<Object>} Email send result
   */
  async sendOrderConfirmationEmail({ to, firstName, order, drone }) {
    try {
      const mailOptions = {
        from: {
          name: 'Arrow3 Aerospace',
          address: process.env.EMAIL_USER
        },
        to: to,
        subject: `Order Confirmation #${order._id} - Arrow3 Aerospace`,
        html: this.getOrderConfirmationTemplate(firstName, order, drone),
        text: this.getOrderConfirmationTextTemplate(firstName, order, drone)
      };

      const result = await this.retryOperation(async () => {
        return await this.transporter.sendMail(mailOptions);
      });

      console.log('✅ Order confirmation email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('❌ Failed to send order confirmation email after retries:', error);
      throw new Error('Failed to send order confirmation email');
    }
  }

  /**
   * Send order status update email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.firstName - Recipient first name
   * @param {Object} options.order - Order details
   * @param {Object} options.drone - Drone details
   * @param {string} options.previousStatus - Previous order status
   * @returns {Promise<Object>} Email send result
   */
  async sendOrderStatusUpdateEmail({ to, firstName, order, drone, previousStatus }) {
    try {
      const mailOptions = {
        from: {
          name: 'Arrow3 Aerospace',
          address: process.env.EMAIL_USER
        },
        to: to,
        subject: `Order Update #${order._id} - ${this.getStatusDisplayName(order.status)} - Arrow3 Aerospace`,
        html: this.getOrderStatusUpdateTemplate(firstName, order, drone, previousStatus),
        text: this.getOrderStatusUpdateTextTemplate(firstName, order, drone, previousStatus)
      };

      const result = await this.retryOperation(async () => {
        return await this.transporter.sendMail(mailOptions);
      });

      console.log('✅ Order status update email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('❌ Failed to send order status update email after retries:', error);
      throw new Error('Failed to send order status update email');
    }
  }

  /**
   * Get display name for order status
   * @param {string} status - Order status
   * @returns {string} Display name
   */
  getStatusDisplayName(status) {
    const statusMap = {
      'pending': 'Order Pending',
      'confirmed': 'Order Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
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

  /**
   * HTML template for order confirmation email
   * @param {string} firstName - User's first name
   * @param {Object} order - Order details
   * @param {Object} drone - Drone details
   * @returns {string} HTML template
   */
  getOrderConfirmationTemplate(firstName, order, drone) {
    const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Arrow3 Aerospace</title>
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
          .order-details {
            background-color: #2d2d2d;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #00ff88;
          }
          .drone-info {
            background-color: #2d2d2d;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .price {
            font-size: 24px;
            font-weight: bold;
            color: #00ff88;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #333;
            font-size: 14px;
            color: #888;
            text-align: center;
          }
          .specs-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin: 15px 0;
          }
          .spec-item {
            background-color: #1a1a1a;
            padding: 10px;
            border-radius: 3px;
          }
          .spec-label {
            font-weight: bold;
            color: #00ff88;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Arrow3 Aerospace</div>
            <div class="success-icon">🚁</div>
            <h2>Order Confirmation</h2>
          </div>
          
          <div class="content">
            <p>Hello ${firstName},</p>
            
            <p>Thank you for your order! We're excited to get your new drone ready for takeoff. Here are your order details:</p>
            
            <div class="order-details">
              <h3>Order Information</h3>
              <p><strong>Order Number:</strong> #${order._id}</p>
              <p><strong>Order Date:</strong> ${orderDate}</p>
              <p><strong>Status:</strong> ${this.getStatusDisplayName(order.status)}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</p>
              <p><strong>Quantity:</strong> ${order.quantity}</p>
              <p class="price"><strong>Total:</strong> $${order.totalAmount.toLocaleString()}</p>
            </div>
            
            <div class="drone-info">
              <h3>Drone Details</h3>
              <h4>${drone.name}</h4>
              <p>${drone.description || 'Professional-grade drone with advanced features'}</p>
              
              <div class="specs-grid">
                <div class="spec-item">
                  <div class="spec-label">Weight</div>
                  <div>${drone.specifications?.weight || 'N/A'}g</div>
                </div>
                <div class="spec-item">
                  <div class="spec-label">Flight Time</div>
                  <div>${drone.specifications?.flightTime || 'N/A'} min</div>
                </div>
                <div class="spec-item">
                  <div class="spec-label">Max Speed</div>
                  <div>${drone.specifications?.maxSpeed || 'N/A'} km/h</div>
                </div>
                <div class="spec-item">
                  <div class="spec-label">Camera</div>
                  <div>${drone.specifications?.cameraResolution || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div class="order-details">
              <h3>Shipping Address</h3>
              <p>${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}</p>
            </div>
            
            <p>We'll send you another email when your order ships with tracking information. If you have any questions about your order, please don't hesitate to contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing Arrow3 Aerospace!</p>
            <p>&copy; ${new Date().getFullYear()} Arrow3 Aerospace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Plain text template for order confirmation email
   * @param {string} firstName - User's first name
   * @param {Object} order - Order details
   * @param {Object} drone - Drone details
   * @returns {string} Plain text template
   */
  getOrderConfirmationTextTemplate(firstName, order, drone) {
    const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
Arrow3 Aerospace - Order Confirmation

Hello ${firstName},

Thank you for your order! We're excited to get your new drone ready for takeoff.

ORDER INFORMATION:
- Order Number: #${order._id}
- Order Date: ${orderDate}
- Status: ${this.getStatusDisplayName(order.status)}
- Payment Status: ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
- Quantity: ${order.quantity}
- Total: $${order.totalAmount.toLocaleString()}

DRONE DETAILS:
- Model: ${drone.name}
- Description: ${drone.description || 'Professional-grade drone with advanced features'}
- Weight: ${drone.specifications?.weight || 'N/A'}g
- Flight Time: ${drone.specifications?.flightTime || 'N/A'} minutes
- Max Speed: ${drone.specifications?.maxSpeed || 'N/A'} km/h
- Camera: ${drone.specifications?.cameraResolution || 'N/A'}

SHIPPING ADDRESS:
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
${order.shippingAddress.country}

We'll send you another email when your order ships with tracking information. If you have any questions about your order, please don't hesitate to contact our support team.

Thank you for choosing Arrow3 Aerospace!

© ${new Date().getFullYear()} Arrow3 Aerospace. All rights reserved.
    `;
  }

  /**
   * HTML template for order status update email
   * @param {string} firstName - User's first name
   * @param {Object} order - Order details
   * @param {Object} drone - Drone details
   * @param {string} previousStatus - Previous order status
   * @returns {string} HTML template
   */
  getOrderStatusUpdateTemplate(firstName, order, drone, previousStatus) {
    const statusIcons = {
      'pending': '⏳',
      'confirmed': '✅',
      'processing': '🔄',
      'shipped': '📦',
      'delivered': '🎉',
      'cancelled': '❌'
    };

    const statusColors = {
      'pending': '#ffa500',
      'confirmed': '#00ff88',
      'processing': '#00bfff',
      'shipped': '#9370db',
      'delivered': '#00ff88',
      'cancelled': '#ff6b6b'
    };

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update - Arrow3 Aerospace</title>
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
          .status-icon {
            font-size: 48px;
            margin: 20px 0;
          }
          .status-update {
            background-color: #2d2d2d;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid ${statusColors[order.status] || '#00ff88'};
          }
          .order-summary {
            background-color: #2d2d2d;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #333;
            font-size: 14px;
            color: #888;
            text-align: center;
          }
          .tracking-info {
            background-color: #2d2d2d;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #00ff88;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Arrow3 Aerospace</div>
            <div class="status-icon">${statusIcons[order.status] || '📋'}</div>
            <h2>Order Status Update</h2>
          </div>
          
          <div class="content">
            <p>Hello ${firstName},</p>
            
            <p>We have an update on your order #${order._id}:</p>
            
            <div class="status-update">
              <h3>Status Changed</h3>
              <p><strong>From:</strong> ${this.getStatusDisplayName(previousStatus)}</p>
              <p><strong>To:</strong> <span style="color: ${statusColors[order.status] || '#00ff88'}">${this.getStatusDisplayName(order.status)}</span></p>
            </div>
            
            ${order.trackingNumber ? `
            <div class="tracking-info">
              <h3>Tracking Information</h3>
              <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
              <p>You can track your package using this number on our shipping partner's website.</p>
            </div>
            ` : ''}
            
            <div class="order-summary">
              <h3>Order Summary</h3>
              <p><strong>Drone:</strong> ${drone.name}</p>
              <p><strong>Quantity:</strong> ${order.quantity}</p>
              <p><strong>Total:</strong> $${order.totalAmount.toLocaleString()}</p>
              ${order.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>` : ''}
            </div>
            
            <p>If you have any questions about your order, please don't hesitate to contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing Arrow3 Aerospace!</p>
            <p>&copy; ${new Date().getFullYear()} Arrow3 Aerospace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Plain text template for order status update email
   * @param {string} firstName - User's first name
   * @param {Object} order - Order details
   * @param {Object} drone - Drone details
   * @param {string} previousStatus - Previous order status
   * @returns {string} Plain text template
   */
  getOrderStatusUpdateTextTemplate(firstName, order, drone, previousStatus) {
    return `
Arrow3 Aerospace - Order Status Update

Hello ${firstName},

We have an update on your order #${order._id}:

STATUS CHANGED:
From: ${this.getStatusDisplayName(previousStatus)}
To: ${this.getStatusDisplayName(order.status)}

${order.trackingNumber ? `
TRACKING INFORMATION:
Tracking Number: ${order.trackingNumber}
You can track your package using this number on our shipping partner's website.
` : ''}

ORDER SUMMARY:
- Drone: ${drone.name}
- Quantity: ${order.quantity}
- Total: $${order.totalAmount.toLocaleString()}
${order.estimatedDelivery ? `- Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}` : ''}

If you have any questions about your order, please don't hesitate to contact our support team.

Thank you for choosing Arrow3 Aerospace!

© ${new Date().getFullYear()} Arrow3 Aerospace. All rights reserved.
    `;
  }
}

module.exports = new EmailService();