require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
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

// Static file serving removed - using Cloudinary for media storage

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/drones', require('./routes/drones'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/media', require('./routes/media'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check endpoint with detailed server info
app.get('/api/health', (req, res) => {
  const dbHealth = checkDBHealth();
  res.status(200).json({ 
    success: true, 
    message: 'Arrow3 Aerospace API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: dbHealth,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  });
});

// Ping endpoint specifically for keep-alive (lighter response)
app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    success: true, 
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime())
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
  
  // Self-ping mechanism to keep Render free tier alive
  if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
    const pingInterval = 14 * 60 * 1000; // 14 minutes (before 15-minute timeout)
    
    setInterval(() => {
      try {
        const url = new URL(`${process.env.RENDER_EXTERNAL_URL}/api/ping`);
        const client = url.protocol === 'https:' ? https : http;
        
        const req = client.request({
          hostname: url.hostname,
          port: url.port,
          path: url.pathname,
          method: 'GET'
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                const result = JSON.parse(data);
                console.log(`🏓 Self-ping successful - server alive for ${result.uptime}s`);
              } catch (e) {
                console.log('🏓 Self-ping successful - server responded');
              }
            } else {
              console.warn('⚠️ Self-ping failed with status:', res.statusCode);
            }
          });
        });
        
        req.on('error', (error) => {
          console.error('❌ Self-ping error:', error.message);
        });
        
        req.setTimeout(5000, () => {
          req.destroy();
          console.warn('⚠️ Self-ping timeout');
        });
        
        req.end();
      } catch (error) {
        console.error('❌ Self-ping setup error:', error.message);
      }
    }, pingInterval);
    
    console.log('⏰ Self-ping enabled - will ping every 14 minutes to prevent sleep');
    console.log(`📡 Will ping: ${process.env.RENDER_EXTERNAL_URL}/api/ping`);
  } else {
    console.log('💤 Self-ping disabled (not in production or RENDER_EXTERNAL_URL not set)');
  }
});

module.exports = app;