# Arrow3 Aerospace Platform

A comprehensive e-commerce web application for drone sales and management built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- 🎨 Dark-themed, modern UI inspired by DJI's design
- 🚁 Comprehensive drone catalog with detailed specifications
- 🛒 Complete order management system
- 💳 Mock payment processing system (no real transactions)
- 👤 User authentication (email/password + Google OAuth)
- 📧 Email notifications for orders and password reset
- 🔧 Admin panel for product and order management
- 📱 Responsive design for all devices
- ⚡ Performance optimized with React Query caching

## Tech Stack

### Frontend
- React 18 with functional components and hooks
- Material-UI v5 for component library with dark theme
- React Router v6 for client-side routing
- React Query for server state management
- Axios for HTTP clients
- Framer Motion for animations

### Backend
- Node.js with Express.js framework
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- Nodemailer for email services
- Mock payment system for demonstration
- Multer for file uploads

## Project Structure

```
arrow3-aerospace-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── theme/          # Material-UI theme
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Express backend
│   ├── config/             # Database and other configs
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── package.json
└── package.json           # Root package.json
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier available)
- npm or yarn package manager
- Vercel account (for frontend deployment)
- Render account (for backend deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd arrow3-aerospace-platform
```

2. Install dependencies for both frontend and backend:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
# Copy example files and fill in your values
cp server/.env.example server/.env
cp client/.env.example client/.env
```

4. Configure your environment variables in the `.env` files:
   - MongoDB Atlas connection string
   - JWT secret key
   - Email service credentials (Gmail SMTP)
   - Google OAuth credentials
   - Mock payment settings

### Development

Start both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5001
- Frontend development server on http://localhost:3000

### Individual Services

Start only the backend:
```bash
npm run server
```

Start only the frontend:
```bash
npm run client
```

### Testing

Run tests for both frontend and backend:
```bash
npm test
```

### Production Build

Build the frontend for production:
```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Drones
- `GET /api/drones` - Get all drones
- `GET /api/drones/:id` - Get drone details
- `POST /api/drones` - Create drone (admin)
- `PUT /api/drones/:id` - Update drone (admin)
- `DELETE /api/drones/:id` - Delete drone (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin)

### Payments (Mock)
- `POST /api/payments/create-intent` - Create mock payment intent
- `POST /api/payments/confirm` - Confirm mock payment
- `GET /api/payments/:paymentId` - Get payment details
- `POST /api/payments/webhook` - Mock webhook endpoint

## Environment Variables

### Server (.env)
```
PORT=5001
MONGODB_URI=mongodb+srv://username:password@arrow3.xxxxx.mongodb.net/arrow3-aerospace?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret
EMAIL_USER=your-gmail-address
EMAIL_PASS=your-gmail-app-password
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
MOCK_PAYMENT_ENABLED=true
PAYMENT_SUCCESS_RATE=100
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id
REACT_APP_MOCK_PAYMENT=true
```

## Deployment

This application is designed to be deployed on:
- **Frontend**: Vercel (recommended)
- **Backend**: Render (recommended)
- **Database**: MongoDB Atlas (free tier available)

### Quick Deployment Steps:

1. **MongoDB Atlas**: Create a free cluster and get connection string
2. **Backend (Render)**: Deploy using the included `render.yaml` file
3. **Frontend (Vercel)**: Deploy using the included `vercel.json` file

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Mock Payment System

This application uses a mock payment system that:
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