const mongoose = require('mongoose');

// Shipping address sub-schema
const shippingAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
    maxlength: [200, 'Street address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters']
  },
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true,
    match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [100, 'Country cannot exceed 100 characters'],
    default: 'United States'
  }
}, { _id: false });

// Customer info sub-schema
const customerInfoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number']
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  droneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone',
    required: [true, 'Drone ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Quantity cannot exceed 10 per order'],
    default: 1
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      message: 'Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled'
    },
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'completed', 'failed', 'refunded'],
      message: 'Payment status must be one of: pending, completed, failed, refunded'
    },
    default: 'pending'
  },
  paymentIntentId: {
    type: String,
    trim: true,
    sparse: true // Allows multiple null values but unique non-null values
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['credit_card', 'debit_card', 'paypal', 'mock_payment'],
      message: 'Payment method must be one of: credit_card, debit_card, paypal, mock_payment'
    },
    default: 'mock_payment'
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: [true, 'Shipping address is required']
  },
  customerInfo: {
    type: customerInfoSchema,
    required: [true, 'Customer information is required']
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  estimatedDelivery: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date > this.orderDate;
      },
      message: 'Estimated delivery date must be after order date'
    }
  },
  actualDelivery: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date >= this.orderDate;
      },
      message: 'Actual delivery date must be after order date'
    }
  },
  trackingNumber: {
    type: String,
    trim: true,
    sparse: true,
    match: [/^[A-Z0-9]{8,20}$/, 'Tracking number must be 8-20 alphanumeric characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  // Audit fields
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative'],
    max: [function() { return this.totalAmount; }, 'Refund amount cannot exceed total amount']
  },
  refundReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Refund reason cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      return ret;
    }
  }
});

// Indexes for efficient queries
orderSchema.index({ userId: 1 });
orderSchema.index({ droneId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ trackingNumber: 1 }, { sparse: true });
orderSchema.index({ paymentIntentId: 1 }, { sparse: true });

// Compound indexes for common queries
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ userId: 1, orderDate: -1 });
orderSchema.index({ status: 1, orderDate: -1 });

// Virtual for formatted total amount
orderSchema.virtual('formattedTotal').get(function() {
  return `$${this.totalAmount.toLocaleString()}`;
});

// Virtual for customer full name
orderSchema.virtual('customerFullName').get(function() {
  return `${this.customerInfo.firstName} ${this.customerInfo.lastName}`;
});

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.orderDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for delivery status
orderSchema.virtual('deliveryStatus').get(function() {
  if (this.actualDelivery) return 'delivered';
  if (this.status === 'shipped' && this.estimatedDelivery) {
    const now = new Date();
    if (now > this.estimatedDelivery) return 'overdue';
    return 'in_transit';
  }
  return 'not_shipped';
});

// Instance method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status) && 
         this.paymentStatus !== 'completed';
};

// Instance method to check if order can be refunded
orderSchema.methods.canBeRefunded = function() {
  return this.paymentStatus === 'completed' && 
         ['confirmed', 'processing', 'shipped'].includes(this.status);
};

// Instance method to calculate estimated delivery
orderSchema.methods.calculateEstimatedDelivery = function() {
  const businessDays = 5; // Default 5 business days
  const estimatedDate = new Date(this.orderDate);
  estimatedDate.setDate(estimatedDate.getDate() + businessDays);
  return estimatedDate;
};

// Instance method to update status with history tracking
orderSchema.methods.updateStatus = async function(newStatus, updatedBy, notes = '') {
  // Validate status transition
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered'],
    'delivered': [],
    'cancelled': []
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }

  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy,
    notes
  });

  // Update current status
  this.status = newStatus;

  // Set estimated delivery when confirmed
  if (newStatus === 'confirmed' && !this.estimatedDelivery) {
    this.estimatedDelivery = this.calculateEstimatedDelivery();
  }

  // Set actual delivery when delivered
  if (newStatus === 'delivered') {
    this.actualDelivery = new Date();
  }

  return await this.save();
};

// Static method to create order with validation
orderSchema.statics.createOrder = async function(orderData) {
  const { userId, droneId, quantity = 1, shippingAddress, customerInfo } = orderData;
  
  // Validate user exists
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Validate drone exists and is available
  const Drone = mongoose.model('Drone');
  const drone = await Drone.findById(droneId);
  if (!drone) {
    throw new Error('Drone not found');
  }
  
  if (!drone.isAvailable()) {
    throw new Error('Drone is not available for purchase');
  }

  if (drone.stockQuantity < quantity) {
    throw new Error(`Only ${drone.stockQuantity} units available`);
  }

  // Calculate total amount
  const totalAmount = drone.price * quantity;

  // Create order
  const order = new this({
    userId,
    droneId,
    quantity,
    totalAmount,
    shippingAddress,
    customerInfo
  });

  // Initialize status history
  order.statusHistory.push({
    status: 'pending',
    timestamp: new Date(),
    updatedBy: userId,
    notes: 'Order created'
  });

  return await order.save();
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ userId })
    .populate('droneId', 'name model price images')
    .sort({ orderDate: -1 });

  if (options.status) {
    query.where({ status: options.status });
  }

  if (options.limit) {
    query.limit(options.limit);
  }

  return query;
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status, options = {}) {
  const query = this.find({ status })
    .populate('userId', 'firstName lastName email')
    .populate('droneId', 'name model price')
    .sort({ orderDate: -1 });

  if (options.limit) {
    query.limit(options.limit);
  }

  return query;
};

// Static method for admin order search
orderSchema.statics.searchOrders = function(filters = {}) {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }

  if (filters.startDate || filters.endDate) {
    query.orderDate = {};
    if (filters.startDate) query.orderDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.orderDate.$lte = new Date(filters.endDate);
  }

  if (filters.customerEmail) {
    query['customerInfo.email'] = new RegExp(filters.customerEmail, 'i');
  }

  if (filters.trackingNumber) {
    query.trackingNumber = filters.trackingNumber;
  }

  return this.find(query)
    .populate('userId', 'firstName lastName email')
    .populate('droneId', 'name model price images')
    .sort({ orderDate: -1 });
};

// Pre-save middleware for business logic
orderSchema.pre('save', function(next) {
  // Auto-set estimated delivery if not set and status is confirmed
  if (this.status === 'confirmed' && !this.estimatedDelivery) {
    this.estimatedDelivery = this.calculateEstimatedDelivery();
  }

  // Validate payment status consistency
  if (this.status === 'delivered' && this.paymentStatus !== 'completed') {
    return next(new Error('Cannot deliver order without completed payment'));
  }

  next();
});

// Post-save middleware for notifications
orderSchema.post('save', async function(doc) {
  // Here you could trigger email notifications, webhook calls, etc.
  // For now, just log the status change
  if (doc.isModified('status')) {
    console.log(`Order ${doc._id} status changed to: ${doc.status}`);
  }
});

module.exports = mongoose.model('Order', orderSchema);