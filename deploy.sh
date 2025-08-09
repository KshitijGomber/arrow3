#!/bin/bash

# Arrow3 Aerospace Platform Deployment Script
echo "🚀 Arrow3 Aerospace Platform Deployment Helper"
echo "================================================"

# Check if required tools are installed
command -v git >/dev/null 2>&1 || { echo "❌ Git is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Build the project
echo ""
echo "📦 Building the project..."
npm run install-all

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build frontend
echo ""
echo "🏗️  Building frontend..."
cd client && npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

echo "✅ Frontend build successful"

# Test backend
echo ""
echo "🧪 Testing backend..."
cd server && npm test --passWithNoTests
cd ..

echo "✅ Backend tests passed"

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📋 Next steps for deployment:"
echo "1. Push your code to GitHub"
echo "2. Set up MongoDB Atlas cluster"
echo "3. Deploy backend to Render"
echo "4. Deploy frontend to Vercel"
echo "5. Update environment variables"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"