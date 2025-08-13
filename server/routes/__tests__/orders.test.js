const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Drone = require('../../models/Drone');
const Order = require('../../models/Order');
const orderRoutes = require('../orders');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order Routes', () => {
  let adminUser;
  let customerUser;
  let adminToken;
  let customerToken;
  let testDrone;
  let testOrder;

  beforeEach(async () => {
    // Create users
    const hashedPassword = await bcrypt.hash('Password123!', 4);
    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });

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
        dimensions: { length: 35, width: 35, height: 12 },
        batteryCapacity: 5000,
        flightTime: 30,
        maxSpeed: 65,
        cameraResolution: '4K',
        stabilization: '3-Axis Gimbal',
        controlRange: 7000,
        windResistanceLevel: 6,
        appCompatibility: ['iOS', 'Android']
      },
      stockQuantity: 10,
      inStock: true
    });

    // Create test order
    testOrder = await Order.create({
      userId: customerUser._id,
      droneId: testDrone._id,
      quantity: 1,
      totalAmount: 1299,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      customerInfo: {
        firstName: 'Customer',
        lastName: 'User',
        email: 'customer@example.com',
        phone: '+1234567890'
      }
    });
  });

  describe('POST /api/orders', () => {
    const validOrderData = {
      droneId: null, // Will be set in test
      quantity: 2,
      shippingAddress: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'United States'
      },
      customerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1987654321'
      }
    };

    beforeEach(() => {
      validOrderData.droneId = testDrone._id.toString();
    });

    it('should create new order with customer authentication', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validOrderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order created successfully');
      expect(response.body.data.order.quantity).toBe(2);
      expect(response.body.data.order.totalAmount).toBe(2598); // 1299 * 2

      // Verify order was created in database
      const order = await Order.findById(response.body.data.order._id);
      expect(order).toBeTruthy();
      expect(order.userId.toString()).toBe(customerUser._id.toString());
    });

    it('should create order with admin authentication', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validOrderData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should not create order without authentication', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send(validOrderData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    it('should not create order for non-existent drone', async () => {
      const invalidOrderData = {
        ...validOrderData,
        droneId: '507f1f77bcf86cd799439011'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidOrderData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Drone not found');
    });

    it('should not create order when drone is out of stock', async () => {
      // Update drone to be out of stock
      await Drone.findByIdAndUpdate(testDrone._id, { 
        inStock: false, 
        stockQuantity: 0 
      });

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validOrderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Drone is out of stock');
    });

    it('should not create order when insufficient stock', async () => {
      // Update drone to have less stock than requested
      await Drone.findByIdAndUpdate(testDrone._id, { stockQuantity: 1 });

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validOrderData) // quantity: 2, but only 1 in stock
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient stock available');
    });

    it('should validate required fields', async () => {
      const invalidOrderData = {
        quantity: 0, // Invalid quantity
        // Missing droneId, shippingAddress, customerInfo
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidOrderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should validate shipping address fields', async () => {
      const invalidOrderData = {
        ...validOrderData,
        shippingAddress: {
          street: '', // Empty street
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'United States'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidOrderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'shippingAddress.street'
        })
      );
    });

    it('should validate customer info fields', async () => {
      const invalidOrderData = {
        ...validOrderData,
        customerInfo: {
          firstName: '',
          lastName: 'Doe',
          email: 'invalid-email',
          phone: '123' // Too short
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidOrderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/orders/user/:userId', () => {
    it('should get user orders with customer authentication', async () => {
      const response = await request(app)
        .get(`/api/orders/user/${customerUser._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.orders[0]._id.toString()).toBe(testOrder._id.toString());
    });

    it('should get user orders with admin authentication', async () => {
      const response = await request(app)
        .get(`/api/orders/user/${customerUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
    });

    it('should not allow customer to access other user orders', async () => {
      const response = await request(app)
        .get(`/api/orders/user/${adminUser._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. You can only view your own orders.');
    });

    it('should not get orders without authentication', async () => {
      const response = await request(app)
        .get(`/api/orders/user/${customerUser._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return empty array for user with no orders', async () => {
      const response = await request(app)
        .get(`/api/orders/user/${adminUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(0);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get specific order with customer authentication (own order)', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order._id.toString()).toBe(testOrder._id.toString());
      expect(response.body.data.order.droneDetails).toBeDefined();
    });

    it('should get specific order with admin authentication', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order._id.toString()).toBe(testOrder._id.toString());
    });

    it('should not allow customer to access other user order', async () => {
      // Create order for admin user
      const adminOrder = await Order.create({
        userId: adminUser._id,
        droneId: testDrone._id,
        quantity: 1,
        totalAmount: 1299,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: {
          street: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'United States'
        },
        customerInfo: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          phone: '+1555666777'
        }
      });

      const response = await request(app)
        .get(`/api/orders/${adminOrder._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. You can only view your own orders.');
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/orders/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    it('should update order status with admin authentication', async () => {
      const statusUpdate = {
        status: 'confirmed',
        notes: 'Order confirmed and processing'
      };

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order status updated successfully');
      expect(response.body.data.order.status).toBe('confirmed');

      // Verify update in database
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.status).toBe('confirmed');
    });

    it('should not update order status with customer authentication', async () => {
      const statusUpdate = {
        status: 'confirmed'
      };

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(statusUpdate)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Required role: admin');
    });

    it('should validate status values', async () => {
      const statusUpdate = {
        status: 'invalid-status'
      };

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusUpdate)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'status'
        })
      );
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const statusUpdate = {
        status: 'confirmed'
      };

      const response = await request(app)
        .put(`/api/orders/${fakeId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusUpdate)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });
  });

  describe('GET /api/orders (Admin only)', () => {
    beforeEach(async () => {
      // Create additional orders for testing
      await Order.create({
        userId: adminUser._id,
        droneId: testDrone._id,
        quantity: 1,
        totalAmount: 1299,
        status: 'confirmed',
        paymentStatus: 'completed',
        shippingAddress: {
          street: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'United States'
        },
        customerInfo: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          phone: '+1555666777'
        }
      });
    });

    it('should get all orders with admin authentication', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should not get all orders with customer authentication', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Required role: admin');
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders?status=confirmed')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.orders[0].status).toBe('confirmed');
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/orders?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });
  });
});