# Arrow3 Aerospace Platform

A comprehensive, full-stack e-commerce web application for drone sales and management built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Live Demo

- **Frontend**: https://arrow3.vercel.app
- **Backend API**: https://arrow3.onrender.com
- **API Documentation**: Available via endpoints below

## ✨ Features

### 🎨 Frontend Features
- **Modern UI/UX**: Dark and light theme support with Material-UI v5
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Authentication**: Email/password + Google OAuth 2.0 integration
- **Drone Catalog**: Advanced filtering, sorting, and search functionality
- **Shopping Cart**: Complete e-commerce workflow with order management
- **Admin Panel**: Comprehensive product and order management dashboard
- **Profile Management**: User profile editing and order history
- **Real-time Updates**: React Query for optimal caching and state management

### 🔧 Backend Features
- **RESTful API**: Well-structured endpoints with proper HTTP status codes
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Database**: MongoDB with Mongoose ODM for data modeling
- **File Uploads**: Cloudinary integration for media management
- **Email Service**: Automated notifications for orders and password reset
- **Mock Payments**: Demonstration payment system (no real transactions)
- **Comprehensive Testing**: Unit and integration tests with Jest
- **Security**: Helmet, CORS, rate limiting, and input validation

### 💡 Technical Highlights
- **Performance**: Optimized React Query caching strategies
- **Type Safety**: PropTypes validation and consistent error handling
- **Accessibility**: WCAG-compliant components and keyboard navigation
- **SEO**: Meta tags and structured data for better search visibility
- **CI/CD**: Automated deployment pipeline with GitHub Actions

## 🏗️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | Core UI framework with hooks and functional components |
| **Material-UI** | 5.14.5 | Component library with custom dark/light themes |
| **React Router** | 6.15.0 | Client-side routing and navigation |
| **React Query** | 4.32.6 | Server state management and caching |
| **Axios** | 1.5.0 | HTTP client with interceptors |
| **Framer Motion** | 10.16.1 | Animations and transitions |
| **React Hook Form** | 7.62.0 | Form handling and validation |
| **React Hot Toast** | 2.4.1 | Notification system |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 4.18.2 | Web framework and API server |
| **MongoDB** | 7.5.0 | NoSQL database with Atlas cloud hosting |
| **Mongoose** | 7.5.0 | ODM for MongoDB with schema validation |
| **JWT** | 9.0.2 | Authentication tokens |
| **bcryptjs** | 2.4.3 | Password hashing |
| **Cloudinary** | 2.7.0 | Image and video storage |
| **Nodemailer** | 6.9.4 | Email service integration |
| **Passport** | 0.6.0 | Google OAuth authentication |

### DevOps & Deployment
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting and deployment |
| **Render** | Backend API hosting |
| **MongoDB Atlas** | Database hosting (cloud) |
| **Cloudinary** | Media file storage and CDN |
| **Gmail SMTP** | Email delivery service |

## 📁 Project Structure

```
arrow3/
├── 📁 client/                          # React Frontend Application
│   ├── 📁 public/                      # Static assets
│   │   ├── index.html                  # Main HTML template
│   │   ├── manifest.json               # PWA configuration
│   │   └── sw.js                       # Service worker
│   ├── 📁 src/
│   │   ├── 📁 components/              # Reusable React components
│   │   │   ├── DroneCard.js            # Product display card
│   │   │   ├── DroneFilters.js         # Search and filter controls
│   │   │   ├── DronePagination.js      # Pagination component
│   │   │   ├── GoogleOAuthButton.js    # OAuth login button
│   │   │   ├── MockPaymentForm.js      # Payment form component
│   │   │   ├── 📁 common/              # Shared UI components
│   │   │   └── 📁 landing/             # Landing page components
│   │   ├── 📁 pages/                   # Page-level components
│   │   │   ├── DroneCatalog.js         # Product listing page
│   │   │   ├── DroneDetailsPage.js     # Product detail page
│   │   │   ├── LandingPage.js          # Homepage
│   │   │   ├── OrderPage.js            # Order creation page
│   │   │   ├── PaymentPage.js          # Payment processing page
│   │   │   ├── ProfilePage.js          # User profile management
│   │   │   ├── 📁 admin/               # Admin dashboard pages
│   │   │   │   ├── AdminDashboard.js   # Main admin dashboard
│   │   │   │   ├── ProductManagement.js # Product CRUD operations
│   │   │   │   └── OrderManagement.js  # Order management
│   │   │   └── 📁 auth/                # Authentication pages
│   │   │       ├── LoginPage.js        # User login
│   │   │       └── RegisterPage.js     # User registration
│   │   ├── 📁 hooks/                   # Custom React hooks
│   │   │   ├── 📁 queries/             # React Query hooks
│   │   │   │   ├── useDroneQueries.js  # Drone API operations
│   │   │   │   ├── useOrderQueries.js  # Order API operations
│   │   │   │   ├── usePaymentQueries.js # Payment API operations
│   │   │   │   ├── useMediaQueries.js  # Media upload operations
│   │   │   │   └── useDashboardQueries.js # Dashboard statistics
│   │   │   ├── useAuthForm.js          # Form handling for auth
│   │   │   ├── useDebounce.js          # Input debouncing
│   │   │   ├── useLocalStorage.js      # Local storage management
│   │   │   ├── useOptimizedQuery.js    # Query optimization
│   │   │   └── useOptimisticUpdate.js  # Optimistic UI updates
│   │   ├── 📁 context/                 # React Context providers
│   │   │   ├── AuthContext.js          # Authentication state
│   │   │   └── ThemeContext.js         # Theme management
│   │   ├── 📁 utils/                   # Utility functions
│   │   │   ├── api.js                  # Axios configuration
│   │   │   ├── constants.js            # API endpoints and constants
│   │   │   ├── helpers.js              # Helper functions
│   │   │   └── bundleOptimization.js   # Performance optimizations
│   │   ├── 📁 theme/                   # Material-UI theming
│   │   │   └── theme.js                # Custom theme configuration
│   │   ├── 📁 services/                # External service integrations
│   │   │   └── cloudinaryService.js    # Cloudinary configuration
│   │   ├── App.js                      # Main App component
│   │   ├── index.js                    # Application entry point
│   │   └── index.css                   # Global styles
│   ├── 📁 cypress/                     # E2E testing
│   │   ├── 📁 e2e/                     # Test specifications
│   │   ├── 📁 fixtures/                # Test data
│   │   └── 📁 support/                 # Test utilities
│   ├── package.json                    # Frontend dependencies
│   └── cypress.config.js               # Cypress configuration
├── 📁 server/                          # Express Backend Application
│   ├── 📁 config/                      # Configuration files
│   │   ├── database.js                 # MongoDB connection setup
│   │   └── passport.js                 # Passport.js OAuth configuration
│   ├── 📁 models/                      # Mongoose data models
│   │   ├── User.js                     # User schema and methods
│   │   ├── Drone.js                    # Drone product schema
│   │   └── Order.js                    # Order transaction schema
│   ├── 📁 routes/                      # API route definitions
│   │   ├── auth.js                     # Authentication endpoints
│   │   ├── drones.js                   # Drone CRUD endpoints
│   │   ├── orders.js                   # Order management endpoints
│   │   ├── payments.js                 # Payment processing endpoints
│   │   ├── media.js                    # File upload endpoints
│   │   └── dashboard.js                # Admin dashboard endpoints
│   ├── 📁 middleware/                  # Express middleware
│   │   ├── auth.js                     # JWT authentication
│   │   └── errorHandler.js             # Error handling
│   ├── 📁 services/                    # Business logic services
│   │   ├── emailService.js             # Email notifications
│   │   └── mockPayment.js              # Mock payment processing
│   ├── 📁 tests/                       # Test suites
│   │   ├── 📁 integration/             # Integration tests
│   │   └── setup.js                    # Test configuration
│   ├── 📁 uploads/                     # File upload directory
│   │   ├── 📁 images/                  # Image uploads
│   │   └── 📁 videos/                  # Video uploads
│   ├── server.js                       # Express server entry point
│   ├── package.json                    # Backend dependencies
│   └── jest.config.js                  # Jest testing configuration
├── 📁 docs/                            # Documentation
├── package.json                        # Root package.json for scripts
├── render.yaml                         # Render deployment configuration
├── deploy.sh                           # Deployment script
├── DEPLOYMENT.md                       # Deployment guide
└── README.md                           # This file
```

## 🔌 API Architecture & Endpoints

### Base URL
- **Development**: `http://localhost:5001/api`
- **Production**: `https://arrow3.onrender.com/api`

### API Response Format
All API responses follow a consistent structure:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {
    // Response data object
  },
  "pagination": {
    // Pagination info (when applicable)
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  },
  "errors": [
    // Validation errors (when applicable)
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 🔐 Authentication Endpoints

#### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "password": "Password123!",
  "role": "customer" // Optional, defaults to "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "jwt-token-here",
    "refreshToken": "refresh-token-here",
    "user": {
      "id": "user-id",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer",
      "isEmailVerified": false
    }
  }
}
```

#### `POST /api/auth/login`
Authenticate user credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

#### `GET /api/auth/google`
Initiate Google OAuth authentication flow.

#### `GET /api/auth/google/callback`
Handle Google OAuth callback.

#### `POST /api/auth/forgot-password`
Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### `POST /api/auth/reset-password`
Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "NewPassword123!"
}
```

#### `GET /api/auth/verify-token`
Verify JWT token validity.
**Headers:** `Authorization: Bearer <token>`

#### `GET /api/auth/profile`
Get user profile information.
**Headers:** `Authorization: Bearer <token>`

#### `PUT /api/auth/profile`
Update user profile.
**Headers:** `Authorization: Bearer <token>`

### 🚁 Drone Management Endpoints

#### `GET /api/drones`
Get all drones with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `category` (string): Filter by category
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `search` (string): Search in name and description
- `sortBy` (string): Sort field (price, name, createdAt)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "message": "Drones retrieved successfully",
  "data": {
    "drones": [
      {
        "_id": "drone-id",
        "name": "DJI Phantom 4 Pro",
        "model": "Phantom 4 Pro",
        "category": "Photography",
        "price": 1299,
        "description": "Professional drone...",
        "specifications": {
          "weight": 1375,
          "flightTime": 30,
          "maxSpeed": 72,
          "cameraResolution": "4K",
          "controlRange": 7000
        },
        "images": ["url1", "url2"],
        "videos": ["video-url"],
        "inStock": true,
        "stockQuantity": 15
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 12
    }
  }
}
```

#### `GET /api/drones/:id`
Get single drone details.

#### `POST /api/drones` **(Admin Only)**
Create a new drone.
**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "name": "DJI Air 3",
  "model": "Air 3",
  "category": "Photography",
  "price": 1099,
  "description": "Dual-camera drone...",
  "specifications": {
    "weight": 720,
    "dimensions": {
      "length": 207,
      "width": 100,
      "height": 95
    },
    "batteryCapacity": 4242,
    "flightTime": 46,
    "maxSpeed": 75,
    "cameraResolution": "4K",
    "stabilization": "3-Axis Gimbal",
    "controlRange": 18000,
    "gpsSupport": true,
    "obstacleAvoidance": true,
    "returnToHome": true,
    "windResistanceLevel": 6,
    "appCompatibility": ["iOS", "Android"],
    "aiModes": ["Follow Me", "Orbit Mode", "Waypoint Navigation"]
  },
  "images": [],
  "videos": [],
  "stockQuantity": 10
}
```

#### `PUT /api/drones/:id` **(Admin Only)**
Update drone information.
**Headers:** `Authorization: Bearer <admin-token>`

#### `DELETE /api/drones/:id` **(Admin Only)**
Delete a drone.
**Headers:** `Authorization: Bearer <admin-token>`

### 📦 Order Management Endpoints

#### `POST /api/orders`
Create a new order.
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "droneId": "drone-id",
  "quantity": 1,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States"
  },
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "order-id",
      "userId": "user-id",
      "droneId": "drone-id",
      "quantity": 1,
      "totalAmount": 1299,
      "status": "pending",
      "paymentStatus": "pending",
      "trackingNumber": "TRK123456789",
      "shippingAddress": { /* address object */ },
      "customerInfo": { /* customer object */ },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### `GET /api/orders/user/:userId`
Get orders for a specific user.
**Headers:** `Authorization: Bearer <token>`
**Access:** Users can only access their own orders, admins can access any user's orders

#### `GET /api/orders/:id`
Get specific order details.
**Headers:** `Authorization: Bearer <token>`

#### `GET /api/orders` **(Admin Only)**
Get all orders with filtering.
**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `status`: Filter by order status (pending, confirmed, shipped, delivered, cancelled)
- `paymentStatus`: Filter by payment status (pending, completed, failed)
- `customerEmail`: Filter by customer email
- `startDate`: Filter orders from date (YYYY-MM-DD)
- `endDate`: Filter orders to date (YYYY-MM-DD)
- `page`, `limit`: Pagination

#### `PUT /api/orders/:id/status` **(Admin Only)**
Update order status.
**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "status": "shipped",
  "notes": "Order has been shipped via FedEx"
}
```

### 💳 Payment Endpoints (Mock System)

#### `POST /api/payments/create-intent`
Create a payment intent for an order.
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "orderId": "order-id",
  "amount": 1299
}
```

#### `POST /api/payments/confirm`
Confirm payment for an order.
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "orderId": "order-id",
  "paymentMethod": {
    "type": "card",
    "card": {
      "brand": "visa",
      "last4": "4242"
    }
  },
  "mockPayment": true
}
```

#### `GET /api/payments/:orderId/status`
Get payment status for an order.
**Headers:** `Authorization: Bearer <token>`

### 📊 Dashboard Endpoints (Admin Only)

#### `GET /api/dashboard/stats`
Get dashboard statistics.
**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 25,
    "totalOrders": 150,
    "totalUsers": 1250,
    "totalRevenue": 187500,
    "recentOrders": [
      {
        "_id": "order-id",
        "customerName": "John Doe",
        "totalAmount": 1299,
        "status": "confirmed",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "lowStockProducts": [
      {
        "_id": "drone-id",
        "name": "DJI Mini 3",
        "stockQuantity": 3
      }
    ]
  }
}
```

### 📁 Media Upload Endpoints

#### `POST /api/media/drones/:id/upload` **(Admin Only)**
Upload images/videos for a drone.
**Headers:** 
- `Authorization: Bearer <admin-token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `images`: Image files (multiple)
- `videos`: Video files (multiple)

#### `DELETE /api/media/drones/:id/media` **(Admin Only)**
Delete specific media files from a drone.
**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "imageUrls": ["url1", "url2"],
  "videoUrls": ["video-url1"]
}
```

## 🛠️ Environment Configuration

### Server Environment Variables (.env)

```bash
# Server Configuration
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arrow3?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Email Service (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Mock Payment System
MOCK_PAYMENT_ENABLED=true
PAYMENT_SUCCESS_RATE=100

# Production URLs (for deployment)
RENDER_EXTERNAL_URL=https://your-app.onrender.com
```

### Client Environment Variables (.env)

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_APP_NAME=Arrow3 Aerospace Platform
REACT_APP_VERSION=1.0.0

# Google OAuth (Client-side)
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id

# Cloudinary (Client-side uploads)
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Feature Flags
REACT_APP_MOCK_PAYMENT=true
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **MongoDB Atlas** account ([Free Tier](https://www.mongodb.com/cloud/atlas))
- **Google Cloud Console** account (for OAuth)
- **Cloudinary** account (for media storage)

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/arrow3.git
cd arrow3
```

2. **Install all dependencies:**
```bash
npm run install-all
```

3. **Set up environment variables:**
```bash
# Copy example files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit the .env files with your configuration
```

4. **Start development servers:**
```bash
npm run dev
```

This starts:
- 🚀 **Backend**: http://localhost:5001
- 🌐 **Frontend**: http://localhost:3000
- 📊 **React Query DevTools**: Available in browser

### Individual Services

```bash
# Backend only
npm run server

# Frontend only  
npm run client

# Build for production
npm run build

# Run tests
npm test
```

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
npm run test:integration   # Integration tests only
```

### Frontend Testing
```bash
cd client
npm test                   # Run unit tests
npm run test:coverage      # Coverage report
npm run cypress:open       # E2E tests (GUI)
npm run cypress:run        # E2E tests (headless)
```

### Test Coverage
- **Backend**: Unit tests for models, routes, middleware
- **Frontend**: Component tests, hook tests, integration tests
- **E2E**: Complete user workflows with Cypress

## 📈 Performance Optimizations

### Frontend
- **React Query**: Intelligent caching and background updates
- **Code Splitting**: Lazy loading of route components
- **Image Optimization**: WebP format with fallbacks
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Service Worker**: Caching of static assets

### Backend
- **Database Indexing**: Optimized MongoDB indexes
- **Connection Pooling**: Efficient database connections
- **Response Compression**: Gzip compression middleware
- **Caching Headers**: Proper HTTP caching strategies
- **Rate Limiting**: Protection against abuse

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Password Security**: bcrypt hashing with salt
- **Input Validation**: express-validator middleware
- **CORS**: Configured for production domains
- **Rate Limiting**: API endpoint protection
- **Helmet**: Security headers middleware
- **Environment Variables**: Sensitive data protection

## 🚀 Deployment

### Quick Deploy Links
- **Frontend (Vercel)**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/arrow3)
- **Backend (Render)**: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Deployment Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │    Render       │    │ MongoDB Atlas   │
│   (Frontend)    │────│   (Backend)     │────│   (Database)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Cloudinary    │
                       │ (Media Storage) │
                       └─────────────────┘
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Material-UI** for the comprehensive component library
- **React Query** for excellent state management
- **MongoDB Atlas** for database hosting
- **Vercel** and **Render** for hosting services
- **Cloudinary** for media management

## 📞 Support

For support, email support@arrow3aerospace.com or create an issue in the GitHub repository.

---

**Built with ❤️ by the Arrow3 Aerospace Team**
- ✅ Accepts any card details for demonstration
- ✅ Simulates real payment processing delays
- ✅ Provides realistic success/failure responses
- ✅ Includes a "Fill Test Data" button for quick testing
- ❌ Does NOT process real payments or charge real cards

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@arrow3aerospace.com or create an issue in this repository.

---

**Note**: This project is currently in development. Some features may not be fully implemented yet. Check the tasks.md file in the specs folder for implementation progress.