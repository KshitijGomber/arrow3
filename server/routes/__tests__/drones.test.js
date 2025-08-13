const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Drone = require('../../models/Drone');
const droneRoutes = require('../drones');
const { authenticate, authorize } = require('../../middleware/auth');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/drones', droneRoutes);

describe('Drone Routes', () => {
  let adminUser;
  let customerUser;
  let adminToken;
  let customerToken;
  let testDrone;

  beforeEach(async () => {
    // Create admin user
    const hashedPassword = await bcrypt.hash('Password123!', 4);
    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Create customer user
    customerUser = await User.create({
      firstName: 'Customer',
      lastName: 'User',
      email: 'customer@example.com',
      password: hashedPassword,
      role: 'customer'
    });

    // Generate tokens
    const { generateToken } = require('../../middleware/auth');
    adminToken = generateToken(adminUser._id, adminUser.role);
    customerToken = generateToken(customerUser._id, customerUser.role);

    // Create test drone
    testDrone = await Drone.create({
      name: 'Test Drone Pro',
      model: 'TDP-2024',
      price: 1299,
      description: 'A test drone for testing purposes',
      category: 'camera',
      images: ['https://example.com/drone1.jpg'],
      specifications: {
        weight: 900,
        dimensions: {
          length: 35,
          width: 35,
          height: 12
        },
        batteryCapacity: 5000,
        flightTime: 30,
        maxSpeed: 65,
        cameraResolution: '4K',
        stabilization: '3-Axis Gimbal',
        controlRange: 7000,
        gpsSupport: true,
        obstacleAvoidance: true,
        returnToHome: true,
        windResistanceLevel: 6,
        appCompatibility: ['iOS', 'Android'],
        aiModes: ['Follow Me', 'Orbit Mode']
      },
      stockQuantity: 10,
      inStock: true,
      featured: true
    });
  });

  describe('GET /api/drones', () => {
    it('should get all drones without authentication', async () => {
      const response = await request(app)
        .get('/api/drones')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Drones retrieved successfully');
      expect(response.body.data.drones).toHaveLength(1);
      expect(response.body.data.drones[0].name).toBe('Test Drone Pro');
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter drones by category', async () => {
      // Create another drone with different category
      await Drone.create({
        name: 'Handheld Drone',
        model: 'HD-2024',
        price: 899,
        description: 'A handheld drone',
        category: 'handheld',
        images: ['https://example.com/drone2.jpg'],
        specifications: {
          weight: 500,
          dimensions: { length: 20, width: 20, height: 8 },
          batteryCapacity: 3000,
          flightTime: 20,
          maxSpeed: 45,
          cameraResolution: '1080p',
          stabilization: 'Electronic',
          controlRange: 3000,
          windResistanceLevel: 4,
          appCompatibility: ['iOS', 'Android']
        },
        stockQuantity: 5,
        inStock: true
      });

      const response = await request(app)
        .get('/api/drones?category=camera')
        .expect(200);

      expect(response.body.data.drones).toHaveLength(1);
      expect(response.body.data.drones[0].category).toBe('camera');
    });

    it('should filter drones by price range', async () => {
      const response = await request(app)
        .get('/api/drones?minPrice=1000&maxPrice=1500')
        .expect(200);

      expect(response.body.data.drones).toHaveLength(1);
      expect(response.body.data.drones[0].price).toBeGreaterThanOrEqual(1000);
      expect(response.body.data.drones[0].price).toBeLessThanOrEqual(1500);
    });

    it('should search drones by text', async () => {
      const response = await request(app)
        .get('/api/drones?search=Test Drone')
        .expect(200);

      expect(response.body.data.drones).toHaveLength(1);
      expect(response.body.data.drones[0].name).toContain('Test Drone');
    });

    it('should sort drones by price ascending', async () => {
      // Create another drone with different price
      await Drone.create({
        name: 'Cheap Drone',
        model: 'CD-2024',
        price: 599,
        description: 'An affordable drone',
        category: 'handheld',
        images: ['https://example.com/drone3.jpg'],
        specifications: {
          weight: 300,
          dimensions: { length: 15, width: 15, height: 6 },
          batteryCapacity: 2000,
          flightTime: 15,
          maxSpeed: 30,
          cameraResolution: '720p',
          stabilization: 'None',
          controlRange: 1000,
          windResistanceLevel: 2,
          appCompatibility: ['iOS', 'Android']
        },
        stockQuantity: 20,
        inStock: true
      });

      const response = await request(app)
        .get('/api/drones?sortBy=price_asc')
        .expect(200);

      expect(response.body.data.drones).toHaveLength(2);
      expect(response.body.data.drones[0].price).toBeLessThan(response.body.data.drones[1].price);
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/drones?page=1&limit=1')
        .expect(200);

      expect(response.body.data.drones).toHaveLength(1);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });
  });

  describe('GET /api/drones/featured', () => {
    it('should get featured drones', async () => {
      const response = await request(app)
        .get('/api/drones/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.drones).toHaveLength(1);
      expect(response.body.data.drones[0].featured).toBe(true);
    });
  });

  describe('GET /api/drones/:id', () => {
    it('should get specific drone by ID', async () => {
      const response = await request(app)
        .get(`/api/drones/${testDrone._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.drone.name).toBe('Test Drone Pro');
      expect(response.body.data.drone.specifications).toBeDefined();
    });

    it('should return 404 for non-existent drone', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/drones/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Drone not found');
    });

    it('should return 400 for invalid drone ID format', async () => {
      const response = await request(app)
        .get('/api/drones/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid drone ID format');
    });
  });

  describe('POST /api/drones', () => {
    const validDroneData = {
      name: 'New Drone Pro',
      model: 'NDP-2024',
      price: 1599,
      description: 'A new professional drone',
      category: 'camera',
      specifications: {
        weight: 1200,
        dimensions: {
          length: 40,
          width: 40,
          height: 15
        },
        batteryCapacity: 6000,
        flightTime: 35,
        maxSpeed: 70,
        cameraResolution: '6K',
        stabilization: '3-Axis Gimbal',
        controlRange: 10000,
        gpsSupport: true,
        obstacleAvoidance: true,
        returnToHome: true,
        windResistanceLevel: 8,
        appCompatibility: ['iOS', 'Android'],
        aiModes: ['Follow Me', 'ActiveTrack']
      },
      stockQuantity: 5,
      inStock: true,
      featured: false
    };

    it('should create new drone with admin authentication', async () => {
      const response = await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validDroneData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Drone created successfully');
      expect(response.body.data.drone.name).toBe(validDroneData.name);

      // Verify drone was created in database
      const drone = await Drone.findOne({ name: validDroneData.name });
      expect(drone).toBeTruthy();
    });

    it('should not create drone without authentication', async () => {
      const response = await request(app)
        .post('/api/drones')
        .send(validDroneData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    it('should not create drone with customer role', async () => {
      const response = await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validDroneData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Required role: admin');
    });

    it('should not create drone with duplicate name', async () => {
      const duplicateData = { ...validDroneData, name: 'Test Drone Pro' };

      const response = await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('A drone with this name already exists');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        price: -100,
        category: 'invalid-category'
      };

      const response = await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should validate specifications', async () => {
      const invalidSpecsData = {
        ...validDroneData,
        specifications: {
          weight: -100, // Invalid negative weight
          dimensions: {
            length: 0, // Invalid zero dimension
            width: 20,
            height: 10
          },
          batteryCapacity: 50, // Too low
          flightTime: 200, // Too high
          maxSpeed: 300, // Too high
          cameraResolution: 'InvalidResolution',
          stabilization: 'InvalidStabilization',
          controlRange: 5,
          windResistanceLevel: 15 // Too high
        }
      };

      const response = await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidSpecsData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/drones/:id', () => {
    const updateData = {
      name: 'Updated Drone Pro',
      price: 1399,
      description: 'Updated description',
      stockQuantity: 15
    };

    it('should update drone with admin authentication', async () => {
      const response = await request(app)
        .put(`/api/drones/${testDrone._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Drone updated successfully');
      expect(response.body.data.drone.name).toBe(updateData.name);
      expect(response.body.data.drone.price).toBe(updateData.price);

      // Verify update in database
      const updatedDrone = await Drone.findById(testDrone._id);
      expect(updatedDrone.name).toBe(updateData.name);
    });

    it('should not update drone without authentication', async () => {
      const response = await request(app)
        .put(`/api/drones/${testDrone._id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not update drone with customer role', async () => {
      const response = await request(app)
        .put(`/api/drones/${testDrone._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent drone', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/drones/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Drone not found');
    });
  });

  describe('DELETE /api/drones/:id', () => {
    it('should delete drone with admin authentication', async () => {
      const response = await request(app)
        .delete(`/api/drones/${testDrone._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Drone deleted successfully');

      // Verify deletion in database
      const deletedDrone = await Drone.findById(testDrone._id);
      expect(deletedDrone).toBeNull();
    });

    it('should not delete drone without authentication', async () => {
      const response = await request(app)
        .delete(`/api/drones/${testDrone._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not delete drone with customer role', async () => {
      const response = await request(app)
        .delete(`/api/drones/${testDrone._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent drone', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/drones/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Drone not found');
    });
  });

  describe('PATCH /api/drones/:id/stock', () => {
    it('should update drone stock with admin authentication', async () => {
      const stockUpdate = {
        stockQuantity: 25,
        inStock: true
      };

      const response = await request(app)
        .patch(`/api/drones/${testDrone._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(stockUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Stock updated successfully');
      expect(response.body.data.drone.stockQuantity).toBe(25);

      // Verify update in database
      const updatedDrone = await Drone.findById(testDrone._id);
      expect(updatedDrone.stockQuantity).toBe(25);
    });

    it('should auto-set inStock to false when quantity is 0', async () => {
      const stockUpdate = {
        stockQuantity: 0
      };

      const response = await request(app)
        .patch(`/api/drones/${testDrone._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(stockUpdate)
        .expect(200);

      expect(response.body.data.drone.inStock).toBe(false);
    });

    it('should validate stock quantity is non-negative', async () => {
      const stockUpdate = {
        stockQuantity: -5
      };

      const response = await request(app)
        .patch(`/api/drones/${testDrone._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(stockUpdate)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});