const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const Order = require('../models/Order');
const Drone = require('../models/Drone');
const User = require('../models/User');

const router = express.Router();

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

// Validation middleware for order creation
const orderValidation = [
  body('droneId')
    .isMongoId()
    .withMessage('Valid drone ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
  body('shippingAddress.street')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Street address is required and must be less than 200 characters'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City is required and must be less than 100 characters'),
  body('shippingAddress.state')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('State is required and must be less than 100 characters'),
  body('shippingAddress.zipCode')
    .matches(/^[A-Za-z0-9\s\-]{3,10}$/)
    .withMessage('Please enter a valid postal/ZIP code (3-10 characters)'),
  body('shippingAddress.country')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country must be less than 100 characters'),
  body('customerInfo.firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('customerInfo.lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('customerInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('customerInfo.phone')
    .matches(/^\+?[\d\s\-\(\)]{8,}$/)
    .withMessage('Please enter a valid phone number (at least 8 digits)'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Validation for order status updates
const statusUpdateValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('trackingNumber')
    .optional()
    .matches(/^[A-Z0-9]{8,20}$/)
    .withMessage('Tracking number must be 8-20 alphanumeric characters')
];

// Query validation for order listing
const listingValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be valid'),
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded'])
    .withMessage('Payment status must be valid'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date')
];

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', authenticate, orderValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      droneId,
      quantity = 1,
      shippingAddress,
      customerInfo,
      notes
    } = req.body;

    // Validate drone exists and is available
    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({
        success: false,
        message: 'Drone not found'
      });
    }

    if (!drone.isAvailable()) {
      return res.status(400).json({
        success: false,
        message: 'Drone is not available for purchase'
      });
    }

    if (drone.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${drone.stockQuantity} units available`
      });
    }

    // Create order using static method
    const order = await Order.createOrder({
      userId,
      droneId,
      quantity,
      shippingAddress,
      customerInfo
    });

    // Add notes if provided
    if (notes) {
      order.notes = notes;
      await order.save();
    }

    // Populate drone details for response
    await order.populate('droneId', 'name model price images');

    console.log('Order created successfully:', {
      orderId: order._id,
      totalAmount: order.totalAmount,
      hasCustomerInfo: !!order.customerInfo,
      droneId: order.droneId._id
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    
    if (error.message.includes('not found') || error.message.includes('not available') || error.message.includes('units available')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create order. Please try again.'
    });
  }
});

// @route   GET /api/orders/user/:userId
// @desc    Get user order history
// @access  Private (User can only access their own orders, Admin can access any)
router.get('/user/:userId', authenticate, listingValidation, handleValidationErrors, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user._id.toString();
    const userRole = req.user.role;

    // Validate ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Check authorization - users can only access their own orders, admins can access any
    if (userRole !== 'admin' && userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    const {
      status,
      page = 1,
      limit = 10
    } = req.query;

    // Build query options
    const options = {};
    if (status) options.status = status;
    if (limit) options.limit = parseInt(limit);

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get orders with pagination
    const ordersQuery = Order.findByUser(userId, options);
    const [orders, totalCount] = await Promise.all([
      ordersQuery.skip(skip).limit(limitNum),
      Order.countDocuments({ userId, ...(status && { status }) })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      message: 'User orders retrieved successfully',
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders. Please try again.'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get specific order details
// @access  Private (User can only access their own orders, Admin can access any)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user._id.toString();
    const userRole = req.user.role;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    // Find order with populated data
    const order = await Order.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('droneId', 'name model price images specifications');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization - users can only access their own orders, admins can access any
    if (userRole !== 'admin' && order.userId._id.toString() !== requestingUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    res.json({
      success: true,
      message: 'Order details retrieved successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details. Please try again.'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Private (Admin)
router.put('/:id/status', authenticate, authorize('admin'), statusUpdateValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, trackingNumber } = req.body;
    const adminUserId = req.user._id;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    // Find order
    const order = await Order.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('droneId', 'name model price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status using the model method (includes validation)
    await order.updateStatus(status, adminUserId, notes);

    // Add tracking number if provided and status is shipped
    if (trackingNumber && status === 'shipped') {
      order.trackingNumber = trackingNumber;
      await order.save();
    }

    // Send email notification for status changes
    try {
      const emailService = require('../services/emailService');
      console.log('📧 Attempting to send order status update email for order:', order._id);
      
      await emailService.sendOrderStatusUpdateEmail({
        to: order.customerInfo.email,
        firstName: order.customerInfo.firstName,
        order: order, // Pass the full order object
        drone: order.droneId, // Pass the full drone object
        previousStatus: previousStatus
      });
      
      console.log('✅ Order status update email sent for order:', order._id);
    } catch (emailError) {
      // Log error but don't fail the status update
      console.error('❌ Order status email error:', emailError);
      console.error('❌ Email error details:', {
        message: emailError.message,
        stack: emailError.stack
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    
    if (error.message.includes('Cannot transition')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update order status. Please try again.'
    });
  }
});

// @route   GET /api/orders
// @desc    Get all orders with filtering (admin only)
// @access  Private (Admin)
router.get('/', authenticate, authorize('admin'), listingValidation, handleValidationErrors, async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      startDate,
      endDate,
      customerEmail,
      trackingNumber,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filters = {};
    if (status) filters.status = status;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
    }
    if (customerEmail) filters.customerEmail = customerEmail;
    if (trackingNumber) filters.trackingNumber = trackingNumber;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get orders with filters and pagination
    const ordersQuery = Order.searchOrders(filters);
    const [orders, totalCount] = await Promise.all([
      ordersQuery.skip(skip).limit(limitNum),
      Order.countDocuments(ordersQuery.getQuery())
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        },
        filters
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders. Please try again.'
    });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Cancel order (user can cancel their own pending orders, admin can cancel any)
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user._id.toString();
    const userRole = req.user.role;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    // Find order
    const order = await Order.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('droneId', 'name model price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization - users can only cancel their own orders, admins can cancel any
    if (userRole !== 'admin' && order.userId._id.toString() !== requestingUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own orders.'
      });
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled. Only pending or confirmed orders can be cancelled.'
      });
    }

    // Update status to cancelled
    await order.updateStatus('cancelled', requestingUserId, 'Order cancelled by user request');

    // Restore drone stock
    await Drone.findByIdAndUpdate(
      order.droneId._id,
      { 
        $inc: { stockQuantity: order.quantity },
        inStock: true
      }
    );

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        order: {
          id: order._id,
          status: order.status,
          cancelledAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order. Please try again.'
    });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics summary (admin only)
// @access  Private (Admin)
router.get('/stats/summary', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.find()
        .populate('userId', 'firstName lastName')
        .populate('droneId', 'name model')
        .sort({ orderDate: -1 })
        .limit(5)
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.json({
      success: true,
      message: 'Order statistics retrieved successfully',
      data: {
        summary: {
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          totalRevenue: revenue
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order statistics. Please try again.'
    });
  }
});

// @route   GET /api/orders/debug/recent
// @desc    Debug recent orders to check payment status (temporary debug endpoint)
// @access  Private (Admin)
router.get('/debug/recent', authenticate, authorize('admin'), async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .populate('droneId', 'name model price')
      .sort({ orderDate: -1 })
      .limit(10);

    const debugInfo = recentOrders.map(order => ({
      _id: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentIntentId: order.paymentIntentId,
      totalAmount: order.totalAmount,
      orderDate: order.orderDate,
      customerEmail: order.customerInfo?.email,
      droneName: order.droneId?.name
    }));

    res.json({
      success: true,
      message: 'Recent orders debug info',
      data: debugInfo
    });
  } catch (error) {
    console.error('Debug recent orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve debug info'
    });
  }
});

module.exports = router;