const mongoose = require('mongoose');

// Specifications sub-schema for nested validation
const specificationsSchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [1, 'Weight must be at least 1 gram'],
    max: [50000, 'Weight cannot exceed 50kg']
  },
  dimensions: {
    length: {
      type: Number,
      required: [true, 'Length is required'],
      min: [1, 'Length must be positive']
    },
    width: {
      type: Number,
      required: [true, 'Width is required'],
      min: [1, 'Width must be positive']
    },
    height: {
      type: Number,
      required: [true, 'Height is required'],
      min: [1, 'Height must be positive']
    }
  },
  batteryCapacity: {
    type: Number,
    required: [true, 'Battery capacity is required'],
    min: [100, 'Battery capacity must be at least 100mAh'],
    max: [50000, 'Battery capacity cannot exceed 50000mAh']
  },
  flightTime: {
    type: Number,
    required: [true, 'Flight time is required'],
    min: [1, 'Flight time must be at least 1 minute'],
    max: [180, 'Flight time cannot exceed 180 minutes']
  },
  maxSpeed: {
    type: Number,
    required: [true, 'Max speed is required'],
    min: [1, 'Max speed must be at least 1 km/h'],
    max: [200, 'Max speed cannot exceed 200 km/h']
  },
  cameraResolution: {
    type: String,
    required: [true, 'Camera resolution is required'],
    enum: {
      values: ['720p', '1080p', '4K', '6K', '8K', 'No Camera'],
      message: 'Camera resolution must be one of: 720p, 1080p, 4K, 6K, 8K, No Camera'
    }
  },
  stabilization: {
    type: String,
    required: [true, 'Stabilization type is required'],
    enum: {
      values: ['None', 'Electronic', '2-Axis Gimbal', '3-Axis Gimbal', 'AI Stabilization'],
      message: 'Stabilization must be one of: None, Electronic, 2-Axis Gimbal, 3-Axis Gimbal, AI Stabilization'
    }
  },
  controlRange: {
    type: Number,
    required: [true, 'Control range is required'],
    min: [10, 'Control range must be at least 10 meters'],
    max: [15000, 'Control range cannot exceed 15km']
  },
  gpsSupport: {
    type: Boolean,
    default: true
  },
  obstacleAvoidance: {
    type: Boolean,
    default: false
  },
  returnToHome: {
    type: Boolean,
    default: true
  },
  windResistanceLevel: {
    type: Number,
    required: [true, 'Wind resistance level is required'],
    min: [1, 'Wind resistance level must be between 1-10'],
    max: [10, 'Wind resistance level must be between 1-10']
  },
  appCompatibility: [{
    type: String,
    enum: {
      values: ['iOS', 'Android', 'Windows', 'macOS', 'Web'],
      message: 'App compatibility must include valid platforms'
    }
  }],
  aiModes: [{
    type: String,
    enum: {
      values: [
        'Follow Me',
        'Orbit Mode',
        'Waypoint Navigation',
        'Gesture Control',
        'ActiveTrack',
        'QuickShot',
        'Sport Mode',
        'Cinematic Mode',
        'Portrait Mode',
        'Night Mode'
      ],
      message: 'AI mode not recognized'
    }
  }]
}, { _id: false }); // Don't create separate _id for sub-document

const droneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Drone name is required'],
    trim: true,
    maxlength: [100, 'Drone name cannot exceed 100 characters'],
    unique: true
  },
  model: {
    type: String,
    required: [true, 'Drone model is required'],
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [100000, 'Price cannot exceed $100,000']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(url) {
        // Basic URL validation for images
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(url);
      },
      message: 'Image URL must be a valid HTTP/HTTPS URL ending with jpg, jpeg, png, webp, or gif'
    }
  }],
  videos: [{
    type: String,
    validate: {
      validator: function(url) {
        // Basic URL validation for videos
        return /^https?:\/\/.+\.(mp4|webm|mov|avi)$/i.test(url) || 
               /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(url);
      },
      message: 'Video URL must be a valid HTTP/HTTPS URL for video files or YouTube/Vimeo links'
    }
  }],
  specifications: {
    type: specificationsSchema,
    required: [true, 'Specifications are required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['camera', 'handheld', 'power', 'specialized'],
      message: 'Category must be one of: camera, handheld, power, specialized'
    }
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Stock quantity cannot be negative']
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Add computed fields to JSON output
      ret.id = ret._id;
      return ret;
    }
  }
});

// Indexes for search and filtering
droneSchema.index({ name: 1 });
droneSchema.index({ category: 1 });
droneSchema.index({ price: 1 });
droneSchema.index({ featured: 1 });
droneSchema.index({ inStock: 1 });
droneSchema.index({ 'specifications.maxSpeed': 1 });
droneSchema.index({ 'specifications.flightTime': 1 });
droneSchema.index({ 'specifications.cameraResolution': 1 });

// Compound indexes for common queries
droneSchema.index({ category: 1, inStock: 1 });
droneSchema.index({ featured: 1, inStock: 1 });
droneSchema.index({ price: 1, category: 1 });

// Text index for search functionality
droneSchema.index({
  name: 'text',
  model: 'text',
  description: 'text',
  'specifications.aiModes': 'text'
});

// Virtual for formatted price
droneSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toLocaleString()}`;
});

// Virtual for availability status
droneSchema.virtual('availabilityStatus').get(function() {
  if (!this.inStock) return 'Out of Stock';
  if (this.stockQuantity === 0) return 'Out of Stock';
  if (this.stockQuantity < 5) return 'Low Stock';
  return 'In Stock';
});

// Instance method to check if drone is available
droneSchema.methods.isAvailable = function() {
  return this.inStock && this.stockQuantity > 0;
};

// Instance method to get primary image
droneSchema.methods.getPrimaryImage = function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
};

// Instance method to get specifications summary
droneSchema.methods.getSpecsSummary = function() {
  const specs = this.specifications;
  return {
    weight: `${specs.weight}g`,
    flightTime: `${specs.flightTime} min`,
    maxSpeed: `${specs.maxSpeed} km/h`,
    camera: specs.cameraResolution,
    range: `${specs.controlRange}m`
  };
};

// Static method to find featured drones
droneSchema.statics.findFeatured = function() {
  return this.find({ featured: true, inStock: true }).sort({ createdAt: -1 });
};

// Static method to find by category
droneSchema.statics.findByCategory = function(category) {
  return this.find({ category, inStock: true }).sort({ price: 1 });
};

// Static method for search with filters
droneSchema.statics.searchDrones = function(filters = {}) {
  const query = { inStock: true };
  
  // Category filter
  if (filters.category) {
    query.category = filters.category;
  }
  
  // Price range filter
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }
  
  // Camera resolution filter
  if (filters.cameraResolution) {
    query['specifications.cameraResolution'] = filters.cameraResolution;
  }
  
  // Flight time filter
  if (filters.minFlightTime) {
    query['specifications.flightTime'] = { $gte: filters.minFlightTime };
  }
  
  // Text search
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  // Build sort options
  let sortOptions = {};
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price_asc':
        sortOptions.price = 1;
        break;
      case 'price_desc':
        sortOptions.price = -1;
        break;
      case 'name_asc':
        sortOptions.name = 1;
        break;
      case 'name_desc':
        sortOptions.name = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      default:
        sortOptions.featured = -1; // Featured first by default
        sortOptions.createdAt = -1;
    }
  } else {
    sortOptions.featured = -1;
    sortOptions.createdAt = -1;
  }
  
  return this.find(query).sort(sortOptions);
};

// Static method to update stock
droneSchema.statics.updateStock = async function(droneId, quantity) {
  const drone = await this.findById(droneId);
  if (!drone) {
    throw new Error('Drone not found');
  }
  
  if (drone.stockQuantity < quantity) {
    throw new Error('Insufficient stock');
  }
  
  drone.stockQuantity -= quantity;
  if (drone.stockQuantity === 0) {
    drone.inStock = false;
  }
  
  return await drone.save();
};

// Pre-save middleware to validate specifications
droneSchema.pre('save', function(next) {
  // Ensure app compatibility includes at least iOS or Android
  const specs = this.specifications;
  if (!specs.appCompatibility || specs.appCompatibility.length === 0) {
    specs.appCompatibility = ['iOS', 'Android']; // Default compatibility
  }
  
  // Add placeholder image if no images provided (for admin creation)
  if (!this.images || this.images.length === 0) {
    this.images = ['https://via.placeholder.com/400x300/2a2a2a/00ff88?text=Drone+Image'];
  }
  
  next();
});

module.exports = mongoose.model('Drone', droneSchema);