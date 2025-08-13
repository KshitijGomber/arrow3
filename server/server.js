require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');
const { connectDB, checkDBHealth } = require('./config/database');

const app = express();
app.set('trust proxy', 1);

// Connect to MongoDB Atlas
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000' || 'https://arrow3.vercel.app/',
//   credentials: true
// }));

const allowedOrigins = [
  'http://localhost:3000',
  'https://arrow3.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


// This helps with OPTIONS preflight for all routes
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true
}));



// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Note: Static file serving removed - using Cloudinary for media storage

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/drones', require('./routes/drones'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/media', require('./routes/media'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbHealth = checkDBHealth();
  res.status(200).json({ 
    success: true, 
    message: 'Arrow3 Aerospace API is running',
    timestamp: new Date().toISOString(),
    database: dbHealth 
  });
});

// Email test endpoint (for debugging)
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const emailService = require('./services/emailService');
    const result = await emailService.sendTestEmail(email);
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});// Error handling middleware
app.use(require('./middleware/errorHandler'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Arrow3 Aerospace Server running on port ${PORT}`);
});

module.exports = app;