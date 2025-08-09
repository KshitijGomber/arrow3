const mongoose = require('mongoose');

// MongoDB Atlas connection configuration with retry logic
const connectDB = async (retryCount = 0) => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds

  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MongoDB URI not provided, skipping database connection');
      return;
    }

    // MongoDB Atlas optimized connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    // Add authentication and database name validation
    if (!process.env.MONGODB_URI.includes('mongodb+srv://')) {
      throw new Error('Invalid MongoDB Atlas connection string format');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`📦 MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`🏷️  Database: ${conn.connection.name}`);
    
    // Set up connection event listeners
    setupConnectionListeners();
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error (attempt ${retryCount + 1}/${maxRetries}):`, error.message);
    
    if (retryCount < maxRetries - 1) {
      console.log(`🔄 Retrying connection in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return connectDB(retryCount + 1);
    } else {
      console.error('❌ Failed to connect to MongoDB after maximum retries');
      if (process.env.NODE_ENV === 'production') {
        process.exit(1); // Exit in production if database connection fails
      } else {
        console.log('⚠️  Continuing without database connection for development');
      }
    }
  }
};

// Set up MongoDB connection event listeners
const setupConnectionListeners = () => {
  const db = mongoose.connection;

  db.on('connected', () => {
    console.log('✅ MongoDB Atlas connection established');
  });

  db.on('error', (error) => {
    console.error('❌ MongoDB Atlas connection error:', error);
  });

  db.on('disconnected', () => {
    console.log('⚠️  MongoDB Atlas connection lost');
  });

  db.on('reconnected', () => {
    console.log('🔄 MongoDB Atlas reconnected');
  });

  // Handle application termination
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('📦 MongoDB Atlas connection closed through app termination');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
      process.exit(1);
    }
  });
};

// Health check function for database connection
const checkDBHealth = () => {
  return {
    status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    readyState: mongoose.connection.readyState
  };
};

module.exports = { connectDB, checkDBHealth };