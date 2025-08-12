const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');

// Mock authentication middleware before requiring routes
const mockAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const mockAuthorize = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

jest.mock('../../middleware/auth', () => ({
  authenticate: mockAuth,
  authorize: mockAuthorize
}));

const mediaRoutes = require('../media');
const Drone = require('../../models/Drone');
const User = require('../../models/User');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/media', mediaRoutes);

// Test database setup
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/arrow3-test';

describe('Media Routes', () => {
  let adminUser;
  let adminToken;
  let testDrone;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
    
    // Create admin user
    adminUser = new User({
      email: 'admin@test.com',
      password: 'hashedpassword',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    await adminUser.save();

    // Generate admin token
    adminToken = jwt.sign(
      { _id: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test drone
    testDrone = new Drone({
      name: 'Test Drone',
      model: 'TD-001',
      price: 999,
      description: 'Test drone for media upload',
      category: 'camera',
      specifications: {
        weight: 400,
        dimensions: { length: 20, width: 15, height: 8 },
        batteryCapacity: 3000,
        flightTime: 25,
        maxSpeed: 50,
        cameraResolution: '4K',
        stabilization: '3-Axis Gimbal',
        controlRange: 1000,
        gpsSupport: true,
        obstacleAvoidance: true,
        returnToHome: true,
        windResistanceLevel: 5,
        appCompatibility: ['iOS', 'Android'],
        aiModes: ['Follow Me']
      },
      images: ['http://example.com/placeholder.jpg'],
      videos: [],
      stockQuantity: 10,
      inStock: true,
      featured: false
    });
    await testDrone.save();
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Drone.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/media/drones/:id', () => {
    it('should get drone media successfully', async () => {
      const response = await request(app)
        .get(`/api/media/drones/${testDrone._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.drone).toBeDefined();
      expect(response.body.data.drone.id).toBe(testDrone._id.toString());
      expect(response.body.data.drone.images).toEqual(['http://example.com/placeholder.jpg']);
      expect(response.body.data.drone.videos).toEqual([]);
    });

    it('should return 400 for invalid drone ID', async () => {
      const response = await request(app)
        .get('/api/media/drones/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid drone ID format');
    });

    it('should return 404 for non-existent drone', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/media/drones/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Drone not found');
    });
  });

  describe('POST /api/media/drones/:id/upload', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/media/drones/${testDrone._id}/upload`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should require admin role', async () => {
      // Create regular user token
      const regularUser = new User({
        email: 'user@test.com',
        password: 'hashedpassword',
        firstName: 'Regular',
        lastName: 'User',
        role: 'customer'
      });
      await regularUser.save();

      const userToken = jwt.sign(
        { _id: regularUser._id, role: regularUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post(`/api/media/drones/${testDrone._id}/upload`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      
      // Clean up
      await User.findByIdAndDelete(regularUser._id);
    });

    it('should return 400 when no files uploaded', async () => {
      const response = await request(app)
        .post(`/api/media/drones/${testDrone._id}/upload`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No files uploaded');
    });
  });

  describe('DELETE /api/media/drones/:id/media', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/media/drones/${testDrone._id}/media`)
        .send({ imageUrls: [], videoUrls: [] })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should require admin role', async () => {
      // Create regular user token
      const regularUser = new User({
        email: 'user2@test.com',
        password: 'hashedpassword',
        firstName: 'Regular',
        lastName: 'User',
        role: 'customer'
      });
      await regularUser.save();

      const userToken = jwt.sign(
        { _id: regularUser._id, role: regularUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .delete(`/api/media/drones/${testDrone._id}/media`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ imageUrls: [], videoUrls: [] })
        .expect(403);

      expect(response.body.success).toBe(false);
      
      // Clean up
      await User.findByIdAndDelete(regularUser._id);
    });

    it('should return 400 when no URLs provided', async () => {
      const response = await request(app)
        .delete(`/api/media/drones/${testDrone._id}/media`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ imageUrls: [], videoUrls: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No media URLs provided for deletion');
    });
  });

  describe('POST /api/media/drones/:id/reorder', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/media/drones/${testDrone._id}/reorder`)
        .send({ images: [], videos: [] })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should require admin role', async () => {
      // Create regular user token
      const regularUser = new User({
        email: 'user3@test.com',
        password: 'hashedpassword',
        firstName: 'Regular',
        lastName: 'User',
        role: 'customer'
      });
      await regularUser.save();

      const userToken = jwt.sign(
        { _id: regularUser._id, role: regularUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post(`/api/media/drones/${testDrone._id}/reorder`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ images: [], videos: [] })
        .expect(403);

      expect(response.body.success).toBe(false);
      
      // Clean up
      await User.findByIdAndDelete(regularUser._id);
    });

    it('should reorder media successfully', async () => {
      // First add some test URLs to the drone
      await Drone.findByIdAndUpdate(testDrone._id, {
        images: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
        videos: ['http://example.com/video1.mp4']
      });

      const response = await request(app)
        .post(`/api/media/drones/${testDrone._id}/reorder`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          images: ['http://example.com/image2.jpg', 'http://example.com/image1.jpg'],
          videos: ['http://example.com/video1.mp4']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.drone.images).toEqual([
        'http://example.com/image2.jpg',
        'http://example.com/image1.jpg'
      ]);
    });
  });
});