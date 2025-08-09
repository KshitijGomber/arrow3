const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
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
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  googleId: {
    type: String,
    sparse: true // Allows multiple null values but unique non-null values
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      return ret;
    }
  }
});

// Index for email lookups
userSchema.index({ email: 1 });

// Index for Google OAuth users
userSchema.index({ googleId: 1 }, { sparse: true });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Static method to find user by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

// Static method to create user with validation
userSchema.statics.createUser = async function(userData) {
  const { email, password, firstName, lastName, role = 'customer' } = userData;
  
  // Check if user already exists
  const existingUser = await this.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Create new user
  const user = new this({
    email,
    password,
    firstName,
    lastName,
    role
  });
  
  return await user.save();
};

// Static method for OAuth user creation/update
userSchema.statics.findOrCreateGoogleUser = async function(profile) {
  try {
    // First, try to find user by Google ID
    let user = await this.findOne({ googleId: profile.id });
    
    if (user) {
      return user;
    }
    
    // If not found by Google ID, check by email
    user = await this.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link existing account with Google
      user.googleId = profile.id;
      user.isEmailVerified = true; // Google accounts are pre-verified
      return await user.save();
    }
    
    // Create new user from Google profile
    user = new this({
      googleId: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      isEmailVerified: true,
      // No password needed for OAuth users
      password: Math.random().toString(36).slice(-8) // Random password as fallback
    });
    
    return await user.save();
  } catch (error) {
    throw new Error(`OAuth user creation failed: ${error.message}`);
  }
};

// Virtual for user's full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);