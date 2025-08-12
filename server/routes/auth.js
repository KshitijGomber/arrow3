const express = require('express');
const { body, validationResult } = require('express-validator');
const passport = require('../config/passport');
const User = require('../models/User');
const { generateToken, generateRefreshToken, authenticate, refreshToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'customer' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.createUser({
      email,
      password,
      firstName,
      lastName,
      role: role === 'admin' ? 'customer' : role // Prevent admin registration via API
    });

    // Generate tokens
    const accessToken = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', refreshToken);

// @route   GET /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Private
router.get('/verify-token', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified
      }
    }
  });
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    }
  });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
], handleValidationErrors, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const userId = req.user._id;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    // Update user
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) {
      updateData.email = email;
      updateData.isEmailVerified = false; // Reset email verification if email changes
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          isEmailVerified: updatedUser.isEmailVerified,
          updatedAt: updatedUser.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], handleValidationErrors, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed. Please try again.'
    });
  }
});

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth authentication
// @access  Public
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
      }

      // Generate tokens
      const accessToken = generateToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?` +
        `token=${accessToken}&refresh=${refreshToken}&` +
        `user=${encodeURIComponent(JSON.stringify({
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }))}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_error`);
    }
  }
);

// @route   POST /api/auth/google/link
// @desc    Link existing account with Google OAuth
// @access  Private
router.post('/google/link', authenticate, async (req, res) => {
  try {
    const { googleId } = req.body;
    
    if (!googleId) {
      return res.status(400).json({
        success: false,
        message: 'Google ID is required'
      });
    }

    // Check if Google ID is already linked to another account
    const existingGoogleUser = await User.findOne({ googleId, _id: { $ne: req.user._id } });
    if (existingGoogleUser) {
      return res.status(409).json({
        success: false,
        message: 'This Google account is already linked to another user'
      });
    }

    // Link Google ID to current user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        googleId,
        isEmailVerified: true // Google accounts are pre-verified
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Google account linked successfully',
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          isEmailVerified: updatedUser.isEmailVerified,
          googleId: updatedUser.googleId
        }
      }
    });
  } catch (error) {
    console.error('Google account linking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link Google account. Please try again.'
    });
  }
});

// @route   DELETE /api/auth/google/unlink
// @desc    Unlink Google OAuth from account
// @access  Private
router.delete('/google/unlink', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user has a password (can't unlink if it's the only auth method)
    const userWithPassword = await User.findById(user._id).select('+password');
    if (!userWithPassword.password || userWithPassword.password.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unlink Google account. Please set a password first.'
      });
    }

    // Remove Google ID
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $unset: { googleId: 1 } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Google account unlinked successfully',
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          isEmailVerified: updatedUser.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Google account unlinking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlink Google account. Please try again.'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
], handleValidationErrors, async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send reset email
    try {
      const emailService = require('../services/emailService');
      await emailService.sendPasswordResetEmail({
        to: user.email,
        firstName: user.firstName,
        resetToken
      });

      res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email address.'
      });
    } catch (emailError) {
      // If email fails, remove the reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Password reset email error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], handleValidationErrors, async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find user by valid reset token
    const user = await User.findByValidResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      const emailService = require('../services/emailService');
      await emailService.sendPasswordResetConfirmationEmail({
        to: user.email,
        firstName: user.firstName
      });
    } catch (emailError) {
      // Log error but don't fail the password reset
      console.error('Password reset confirmation email error:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/setup-admin
// @desc    Create admin user (development only)
// @access  Public (development only)
router.post('/setup-admin', async (req, res) => {
  // Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Admin setup not available in production'
    });
  }

  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: email, password, firstName, lastName'
      });
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create admin user directly (bypassing the API restriction)
    const adminUser = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
      isEmailVerified: true // Auto-verify admin users
    });

    await adminUser.save();

    // Generate tokens
    const accessToken = generateToken(adminUser._id, adminUser.role);
    const refreshToken = generateRefreshToken(adminUser._id);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: adminUser._id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role,
          isEmailVerified: adminUser.isEmailVerified
        }
      }
    });

  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user'
    });
  }
});

module.exports = router;