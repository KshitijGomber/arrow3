# Deployment Guide

This guide will help you deploy the Arrow3 Aerospace Platform to production using MongoDB Atlas, Vercel (frontend), and Render (backend).

## Prerequisites

- MongoDB Atlas account
- Vercel account
- Render account
- GitHub repository with your code

## 1. MongoDB Atlas Setup

### Create Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new project called "Arrow3 Aerospace"
3. Build a database with these settings:
   - **Tier**: M0 (Free)
   - **Provider**: AWS
   - **Region**: Choose closest to your users
   - **Cluster Name**: `Arrow3`
   - **Tag**: `project:arrow3-aerospace` or `env:production`

### Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Add a new database user:
   - **Username**: `arrow3user`
   - **Password**: Generate a secure password
   - **Database User Privileges**: Read and write to any database

### Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - Note: For production, restrict to specific IPs

### Get Connection String
1. Go to "Database" and click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `arrow3-aerospace`

Example: `mongodb+srv://arrow3user:yourpassword@arrow3.xxxxx.mongodb.net/arrow3-aerospace?retryWrites=true&w=majority`

## 2. Backend Deployment (Render)

### Method 1: Using render.yaml (Recommended)
1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file
6. Update environment variables:
   - `MONGODB_URI`: Your Atlas connection string
   - `CLIENT_URL`: Your Vercel app URL (update after frontend deployment)

### Method 2: Manual Setup
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `arrow3-aerospace-backend`
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your-atlas-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   CLIENT_URL=https://your-frontend-app.vercel.app
   MOCK_PAYMENT_ENABLED=true
   PAYMENT_SUCCESS_RATE=100
   ```

## 3. Frontend Deployment (Vercel)

### Method 1: Using Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. In your project root: `vercel`
3. Follow the prompts:
   - Set up and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No
   - Project name: `arrow3-aerospace-frontend`
   - Directory: `./client`
   - Override settings: No

### Method 2: Using Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-app.onrender.com/api
   REACT_APP_MOCK_PAYMENT=true
   REACT_APP_APP_NAME=Arrow3 Aerospace Platform
   ```

## 4. Update Environment Variables

### Backend (.env on Render)
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://arrow3user:password@arrow3.xxxxx.mongodb.net/arrow3-aerospace?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
CLIENT_URL=https://your-frontend-app.vercel.app
MOCK_PAYMENT_ENABLED=true
PAYMENT_SUCCESS_RATE=100
```

### Frontend (.env on Vercel)
```env
REACT_APP_API_URL=https://your-backend-app.onrender.com/api
REACT_APP_MOCK_PAYMENT=true
REACT_APP_APP_NAME=Arrow3 Aerospace Platform
REACT_APP_VERSION=1.0.0
```

## 5. Post-Deployment Steps

### Update CORS Settings
After both deployments, update your backend's CORS configuration:

1. In `server/server.js`, update the CORS origin:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000', // Development
    'https://your-frontend-app.vercel.app' // Production
  ],
  credentials: true
}));
```

### Test the Deployment
1. Visit your Vercel frontend URL
2. Test the mock payment system
3. Check that API calls work correctly
4. Monitor logs in both Render and Vercel dashboards

## 6. Custom Domains (Optional)

### Frontend (Vercel)
1. Go to your project settings in Vercel
2. Add your custom domain
3. Configure DNS records as instructed

### Backend (Render)
1. Go to your service settings in Render
2. Add custom domain
3. Configure DNS records as instructed

## 7. Monitoring and Maintenance

### Logs
- **Render**: Check logs in the service dashboard
- **Vercel**: Check function logs in the project dashboard
- **MongoDB**: Monitor in Atlas dashboard

### Performance
- **Render**: Free tier has limitations (sleeps after 15 minutes of inactivity)
- **Vercel**: Excellent performance for static sites
- **MongoDB**: M0 tier has 512MB storage limit

### Scaling
- **Render**: Upgrade to paid plans for better performance
- **Vercel**: Automatic scaling
- **MongoDB**: Upgrade cluster tier as needed

## Troubleshooting

### Common Issues

1. **CORS Errors**: Update CLIENT_URL in backend environment variables
2. **Database Connection**: Check MongoDB Atlas network access and credentials
3. **Build Failures**: Check build logs and ensure all dependencies are installed
4. **API Not Found**: Verify API_URL in frontend environment variables

### Environment Variables Not Working
- Restart services after updating environment variables
- Check variable names match exactly (case-sensitive)
- Ensure no trailing spaces in values

### Mock Payment Issues
- Verify MOCK_PAYMENT_ENABLED is set to true
- Check API endpoints are accessible
- Monitor network requests in browser dev tools

## Security Notes

- Never commit real API keys or passwords to version control
- Use environment variables for all sensitive data
- Regularly rotate JWT secrets and database passwords
- Monitor access logs for suspicious activity
- Consider implementing rate limiting for production

## Support

If you encounter issues:
1. Check the logs in respective platforms
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check network connectivity and CORS settings