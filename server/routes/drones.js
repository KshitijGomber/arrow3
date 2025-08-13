const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const Drone = require('../models/Drone');

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

// Validation middleware for drone creation/update
const droneValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Drone name is required and must be less than 100 characters'),
  body('model')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Model is required and must be less than 50 characters'),
  body('price')
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        throw new Error('Price is required');
      }
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 100000) {
        throw new Error('Price must be a number between 0 and 100,000');
      }
      return true;
    }),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description is required and must be less than 2000 characters'),
  body('category')
    .isIn(['camera', 'handheld', 'power', 'specialized'])
    .withMessage('Category must be one of: camera, handheld, power, specialized'),
  body('specifications.weight')
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        throw new Error('Weight is required');
      }
      const num = parseFloat(value);
      if (isNaN(num) || num < 1 || num > 50000) {
        throw new Error('Weight must be between 1 and 50,000 grams');
      }
      return true;
    }),
  body('specifications.dimensions.length')
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        throw new Error('Length is required');
      }
      const num = parseFloat(value);
      if (isNaN(num) || num < 1) {
        throw new Error('Length must be a positive number');
      }
      return true;
    }),
  body('specifications.dimensions.width')
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        throw new Error('Width is required');
      }
      const num = parseFloat(value);
      if (isNaN(num) || num < 1) {
        throw new Error('Width must be a positive number');
      }
      return true;
    }),
  body('specifications.dimensions.height')
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        throw new Error('Height is required');
      }
      const num = parseFloat(value);
      if (isNaN(num) || num < 1) {
        throw new Error('Height must be a positive number');
      }
      return true;
    }),
  body('specifications.batteryCapacity')
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        throw new Error('Battery capacity is required');
      }
      const num = parseFloat(value);
      if (isNaN(num) || num < 100 || num > 50000) {
        throw new Error('Battery capacity must be between 100 and 50,000 mAh');
      }
      return true;
    }),
  body('specifications.flightTime')
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        throw new Error('Flight time is required');
      }
      const num = parseFloat(value);
      if (isNaN(num) || num < 1 || num > 180) {
        throw new Error('Flight time must be between 1 and 180 minutes');
      }
      return true;
    }),
  body('specifications.maxSpeed')
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        throw new Error('Max speed is required');
      }
      const num = parseFloat(value);
      if (isNaN(num) || num < 1 || num > 200) {
        throw new Error('Max speed must be between 1 and 200 km/h');
      }
      return true;
    }),
  body('specifications.cameraResolution')
    .isIn(['720p', '1080p', '4K', '6K', '8K', 'No Camera'])
    .withMessage('Camera resolution must be one of: 720p, 1080p, 4K, 6K, 8K, No Camera'),
  body('specifications.stabilization')
    .isIn(['None', 'Electronic', '2-Axis Gimbal', '3-Axis Gimbal', 'AI Stabilization'])
    .withMessage('Stabilization must be one of: None, Electronic, 2-Axis Gimbal, 3-Axis Gimbal, AI Stabilization'),
  body('specifications.controlRange')
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        throw new Error('Control range is required');
      }
      const num = parseFloat(value);
      if (isNaN(num) || num < 10 || num > 15000) {
        throw new Error('Control range must be between 10 and 15,000 meters');
      }
      return true;
    }),
  body('specifications.windResistanceLevel')
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        throw new Error('Wind resistance level is required');
      }
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > 10) {
        throw new Error('Wind resistance level must be between 1 and 10');
      }
      return true;
    }),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .custom((value) => {
      // Allow empty string or valid URL
      if (value === '' || value === null || value === undefined) {
        return true;
      }
      const urlRegex = /^https?:\/\/.+/;
      return urlRegex.test(value);
    })
    .withMessage('Each image must be a valid URL or empty'),
  body('videos')
    .optional()
    .isArray()
    .withMessage('Videos must be an array'),
  body('videos.*')
    .optional()
    .isURL()
    .withMessage('Each video must be a valid URL'),
  body('stockQuantity')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Optional field
      }
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Stock quantity must be a non-negative integer');
      }
      return true;
    }),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),
  body('inStock')
    .optional()
    .isBoolean()
    .withMessage('In stock must be a boolean value'),
  body('specifications.gpsSupport')
    .optional()
    .isBoolean()
    .withMessage('GPS support must be a boolean value'),
  body('specifications.obstacleAvoidance')
    .optional()
    .isBoolean()
    .withMessage('Obstacle avoidance must be a boolean value'),
  body('specifications.returnToHome')
    .optional()
    .isBoolean()
    .withMessage('Return to home must be a boolean value'),
  body('specifications.appCompatibility')
    .optional()
    .isArray()
    .withMessage('App compatibility must be an array'),
  body('specifications.aiModes')
    .optional()
    .isArray()
    .withMessage('AI modes must be an array')
];

// Query validation for drone listing
const listingValidation = [
  query('category')
    .optional()
    .isIn(['camera', 'handheld', 'power', 'specialized'])
    .withMessage('Category must be one of: camera, handheld, power, specialized'),
  query('minPrice')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number'),
  query('maxPrice')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a non-negative number'),
  query('cameraResolution')
    .optional()
    .isIn(['720p', '1080p', '4K', '6K', '8K', 'No Camera'])
    .withMessage('Camera resolution must be valid'),
  query('minFlightTime')
    .optional()
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Minimum flight time must be a positive number'),
  query('sortBy')
    .optional()
    .isIn(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest'])
    .withMessage('Sort by must be one of: price_asc, price_desc, name_asc, name_desc, newest'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must be less than 100 characters')
];

// @route   GET /api/drones
// @desc    Get all drones with filtering and pagination
// @access  Public
router.get('/', listingValidation, handleValidationErrors, async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      cameraResolution,
      minFlightTime,
      sortBy,
      search,
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filters = {};
    if (category) filters.category = category;
    if (minPrice || maxPrice) {
      filters.minPrice = minPrice ? parseFloat(minPrice) : undefined;
      filters.maxPrice = maxPrice ? parseFloat(maxPrice) : undefined;
    }
    if (cameraResolution) filters.cameraResolution = cameraResolution;
    if (minFlightTime) filters.minFlightTime = parseFloat(minFlightTime);
    if (search) filters.search = search;
    if (sortBy) filters.sortBy = sortBy;

    // Get drones with filters
    const dronesQuery = Drone.searchDrones(filters);
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [drones, totalCount] = await Promise.all([
      dronesQuery.skip(skip).limit(limitNum),
      Drone.countDocuments(dronesQuery.getQuery())
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      message: 'Drones retrieved successfully',
      data: {
        drones,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        },
        filters: {
          category,
          minPrice,
          maxPrice,
          cameraResolution,
          minFlightTime,
          sortBy,
          search
        }
      }
    });
  } catch (error) {
    console.error('Get drones error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drones. Please try again.'
    });
  }
});

// @route   GET /api/drones/featured
// @desc    Get featured drones
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const featuredDrones = await Drone.findFeatured().limit(6);

    res.json({
      success: true,
      message: 'Featured drones retrieved successfully',
      data: {
        drones: featuredDrones
      }
    });
  } catch (error) {
    console.error('Get featured drones error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured drones. Please try again.'
    });
  }
});

// @route   GET /api/drones/:id
// @desc    Get specific drone details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid drone ID format'
      });
    }

    const drone = await Drone.findById(id);
    
    if (!drone) {
      return res.status(404).json({
        success: false,
        message: 'Drone not found'
      });
    }

    res.json({
      success: true,
      message: 'Drone details retrieved successfully',
      data: {
        drone
      }
    });
  } catch (error) {
    console.error('Get drone details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drone details. Please try again.'
    });
  }
});

// @route   POST /api/drones
// @desc    Create new drone (admin only)
// @access  Private (Admin)
router.post('/', authenticate, authorize('admin'), droneValidation, handleValidationErrors, async (req, res) => {
  try {
    const droneData = req.body;

    // Debug logging
    console.log('Received drone data:', JSON.stringify(droneData, null, 2));

    // Check if drone with same name already exists
    const existingDrone = await Drone.findOne({ name: droneData.name });
    if (existingDrone) {
      return res.status(409).json({
        success: false,
        message: 'A drone with this name already exists'
      });
    }

    // Create new drone
    const drone = new Drone(droneData);
    await drone.save();

    res.status(201).json({
      success: true,
      message: 'Drone created successfully',
      data: {
        drone
      }
    });
  } catch (error) {
    console.error('Create drone error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      errors: error.errors
    });
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      console.error('Validation errors:', validationErrors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create drone. Please try again.'
    });
  }
});

// @route   PUT /api/drones/:id
// @desc    Update drone (admin only)
// @access  Private (Admin)
router.put('/:id', authenticate, authorize('admin'), droneValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid drone ID format'
      });
    }

    // Check if drone exists
    const existingDrone = await Drone.findById(id);
    if (!existingDrone) {
      return res.status(404).json({
        success: false,
        message: 'Drone not found'
      });
    }

    // Check if name is being changed and if new name already exists
    if (updateData.name && updateData.name !== existingDrone.name) {
      const nameExists = await Drone.findOne({ 
        name: updateData.name, 
        _id: { $ne: id } 
      });
      if (nameExists) {
        return res.status(409).json({
          success: false,
          message: 'A drone with this name already exists'
        });
      }
    }

    // Update drone
    const updatedDrone = await Drone.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    res.json({
      success: true,
      message: 'Drone updated successfully',
      data: {
        drone: updatedDrone
      }
    });
  } catch (error) {
    console.error('Update drone error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update drone. Please try again.'
    });
  }
});

// @route   DELETE /api/drones/:id
// @desc    Delete drone (admin only)
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid drone ID format'
      });
    }

    // Check if drone exists
    const drone = await Drone.findById(id);
    if (!drone) {
      return res.status(404).json({
        success: false,
        message: 'Drone not found'
      });
    }

    // Check if drone has any pending orders
    const Order = require('../models/Order');
    const pendingOrders = await Order.countDocuments({
      droneId: id,
      status: { $in: ['pending', 'confirmed', 'processing'] }
    });

    if (pendingOrders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete drone with pending orders. Please complete or cancel all orders first.'
      });
    }

    // Delete drone
    await Drone.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Drone deleted successfully',
      data: {
        deletedDrone: {
          id: drone._id,
          name: drone.name,
          model: drone.model
        }
      }
    });
  } catch (error) {
    console.error('Delete drone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete drone. Please try again.'
    });
  }
});

// @route   PATCH /api/drones/:id/stock
// @desc    Update drone stock quantity (admin only)
// @access  Private (Admin)
router.patch('/:id/stock', authenticate, authorize('admin'), [
  body('stockQuantity')
    .isNumeric()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('inStock')
    .optional()
    .isBoolean()
    .withMessage('In stock must be a boolean value')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity, inStock } = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid drone ID format'
      });
    }

    // Update stock
    const updateData = { stockQuantity };
    if (inStock !== undefined) {
      updateData.inStock = inStock;
    } else {
      // Auto-set inStock based on quantity
      updateData.inStock = stockQuantity > 0;
    }

    const updatedDrone = await Drone.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDrone) {
      return res.status(404).json({
        success: false,
        message: 'Drone not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        drone: {
          id: updatedDrone._id,
          name: updatedDrone.name,
          stockQuantity: updatedDrone.stockQuantity,
          inStock: updatedDrone.inStock,
          availabilityStatus: updatedDrone.availabilityStatus
        }
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock. Please try again.'
    });
  }
});

// @route   POST /api/drones/:id/media
// @desc    Upload media files for a specific drone (redirect to media service)
// @access  Private (Admin)
router.post('/:id/media', authenticate, authorize('admin'), (req, res) => {
  // Redirect to the dedicated media upload endpoint
  const droneId = req.params.id;
  res.redirect(307, `/api/media/drones/${droneId}/upload`);
});

// @route   GET /api/drones/categories/stats
// @desc    Get drone statistics by category (admin only)
// @access  Private (Admin)
router.get('/categories/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const stats = await Drone.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalStock: { $sum: '$stockQuantity' },
          inStockCount: {
            $sum: { $cond: [{ $eq: ['$inStock', true] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalDrones = await Drone.countDocuments();
    const featuredCount = await Drone.countDocuments({ featured: true });

    res.json({
      success: true,
      message: 'Drone statistics retrieved successfully',
      data: {
        categoryStats: stats,
        totalDrones,
        featuredCount
      }
    });
  } catch (error) {
    console.error('Get drone stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drone statistics. Please try again.'
    });
  }
});

module.exports = router;