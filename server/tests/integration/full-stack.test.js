const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Drone = require('../../models/Drone');
const Order = require('../../models/Order');

// Import all routes
const authRoutes = require('../../routes/auth');
const droneRoutes = require('../../routes/drones');
const orderRoutes = require('../../routes/orders');
const paymentRoutes = require('../../routes/payments');

// Create full test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/drones', droneRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

describe('Full Stack Integration Tests', () => {
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
      email: 'admin@integration.test',
      password: hashedPassword,
      role: 'admin'
    });

    customerUser = await User.create({
      firstName: 'Customer',
      lastName: 'User',
      email: 'customer@integration.test',
      password: hashedPassword,
      role: 'customer'
    });

    // Login users to get tokens
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@integration.test',
        password: 'Password123!'
      });
    adminToken = adminLoginResponse.body.data.accessToken;

    const customerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer@integration.test',
        password: 'Password123!'
      });
    customerToken = customerLoginResponse.body.data.accessToken;

    // Create test drone
    testDrone = await Drone.create({
      name: 'Integration Test Drone',
      model: 'ITD-2024',
      price: 1499,
      description: 'A drone for integration testing',
      category: 'camera',
      images: ['https://example.com/drone.jpg'],
      specifications: {
        weight: 800,
        dimensions: { length: 30, width: 30, height: 10 },
        batteryCapacity: 4500,
        flightTime: 25,
        maxSpeed: 60,
        cameraResolution: '4K',
        stabilization: '3-Axis Gimbal',
        controlRange: 6000,
        windResistanceLevel: 5,
        appCompatibility: ['iOS', 'Android']
      },
      stockQuantity: 10,
      inStock: true
    });
  });

  describe('Complete User Registration and Authentication Flow', () => {
    it('should register new user, login, and access protected routes', async () => {
      const newUserData = {
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@integration.test',
        password: 'NewPassword123!'
      };

      // Register new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(newUserData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.user.email).toBe(newUserData.email);
      expect(registerResponse.body.data.accessToken).toBeDefined();

      const newUserToken = registerResponse.body.data.accessToken;

      // Verify token works for protected routes
      const verifyResponse = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200);

      expect(verifyResponse.body.success).toBe(true);
      expect(verifyResponse.body.data.user.email).toBe(newUserData.email);

      // Test that user can create orders
      const orderData = {
        droneId: testDrone._id,
        quantity: 1,
        shippingAddress: {
          street: '123 New St',
          city: 'New City',
          state: 'NC',
          zipCode: '12345',
          country: 'United States'
        },
        customerInfo: {
          firstName: 'New',
          lastName: 'User',
          email: 'newuser@integration.test',
          phone: '+1234567890'
        }
      };

      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send(orderData)
        .expect(201);

      expect(orderResponse.body.success).toBe(true);
      expect(orderResponse.body.data.order.userId.toString()).toBe(registerResponse.body.data.user.id);
    });
  });

  describe('Complete Drone Management Flow', () => {
    it('should create, read, update, and delete drone through API', async () => {
      const droneData = {
        name: 'CRUD Test Drone',
        model: 'CTD-2024',
        price: 1799,
        description: 'A drone for CRUD testing',
        category: 'specialized',
        specifications: {
          weight: 1000,
          dimensions: { length: 35, width: 35, height: 12 },
          batteryCapacity: 5500,
          flightTime: 30,
          maxSpeed: 65,
          cameraResolution: '6K',
          stabilization: '3-Axis Gimbal',
          controlRange: 7500,
          windResistanceLevel: 7,
          appCompatibility: ['iOS', 'Android', 'Windows']
        },
        stockQuantity: 5,
        inStock: true,
        featured: true
      };

      // CREATE - Admin creates drone
      const createResponse = await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(droneData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      const createdDrone = createResponse.body.data.drone;
      expect(createdDrone.name).toBe(droneData.name);

      // READ - Public can view drone
      const readResponse = await request(app)
        .get(`/api/drones/${createdDrone._id}`)
        .expect(200);

      expect(readResponse.body.success).toBe(true);
      expect(readResponse.body.data.drone.name).toBe(droneData.name);

      // READ - Drone appears in public listing
      const listResponse = await request(app)
        .get('/api/drones')
        .expect(200);

      expect(listResponse.body.success).toBe(true);
      const droneInList = listResponse.body.data.drones.find(d => d._id === createdDrone._id);
      expect(droneInList).toBeDefined();

      // UPDATE - Admin updates drone
      const updateData = {
        ...droneData,
        name: 'Updated CRUD Test Drone',
        price: 1899,
        stockQuantity: 8
      };

      const updateResponse = await request(app)
        .put(`/api/drones/${createdDrone._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.drone.name).toBe('Updated CRUD Test Drone');
      expect(updateResponse.body.data.drone.price).toBe(1899);

      // Verify update persisted
      const verifyUpdateResponse = await request(app)
        .get(`/api/drones/${createdDrone._id}`)
        .expect(200);

      expect(verifyUpdateResponse.body.data.drone.name).toBe('Updated CRUD Test Drone');

      // DELETE - Admin deletes drone
      const deleteResponse = await request(app)
        .delete(`/api/drones/${createdDrone._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // Verify deletion
      await request(app)
        .get(`/api/drones/${createdDrone._id}`)
        .expect(404);
    });

    it('should enforce proper authorization for drone management', async () => {
      const droneData = {
        name: 'Auth Test Drone',
        model: 'ATD-2024',
        price: 999,
        description: 'Testing authorization',
        category: 'handheld',
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
        stockQuantity: 3,
        inStock: true
      };

      // Customer cannot create drone
      await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(droneData)
        .expect(403);

      // Unauthenticated user cannot create drone
      await request(app)
        .post('/api/drones')
        .send(droneData)
        .expect(401);

      // Admin can create drone
      const createResponse = await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(droneData)
        .expect(201);

      const createdDrone = createResponse.body.data.drone;

      // Customer cannot update drone
      await request(app)
        .put(`/api/drones/${createdDrone._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Hacked Name' })
        .expect(403);

      // Customer cannot delete drone
      await request(app)
        .delete(`/api/drones/${createdDrone._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      // Admin can delete drone
      await request(app)
        .delete(`/api/drones/${createdDrone._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Complete Order and Payment Flow', () => {
    it('should create order, process payment, and update order status', async () => {
      // Customer creates order
      const orderData = {
        droneId: testDrone._id,
        quantity: 2,
        shippingAddress: {
          street: '456 Order St',
          city: 'Order City',
          state: 'OC',
          zipCode: '54321',
          country: 'United States'
        },
        customerInfo: {
          firstName: 'Order',
          lastName: 'Customer',
          email: 'order@integration.test',
          phone: '+1987654321'
        }
      };

      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderData)
        .expect(201);

      expect(orderResponse.body.success).toBe(true);
      const order = orderResponse.body.data.order;
      expect(order.totalAmount).toBe(2998); // 1499 * 2
      expect(order.status).toBe('pending');
      expect(order.paymentStatus).toBe('pending');

      // Verify stock was reduced
      const droneAfterOrder = await Drone.findById(testDrone._id);
      expect(droneAfterOrder.stockQuantity).toBe(8); // 10 - 2

      // Customer creates payment intent
      const paymentIntentData = {
        amount: order.totalAmount,
        currency: 'USD',
        orderId: order._id,
        customerInfo: orderData.customerInfo
      };

      const paymentIntentResponse = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(paymentIntentData)
        .expect(201);

      expect(paymentIntentResponse.body.success).toBe(true);
      const paymentIntent = paymentIntentResponse.body.data.paymentIntent;
      expect(paymentIntent.amount).toBe(299800); // Amount in cents

      // Customer confirms payment
      const confirmPaymentData = {
        paymentIntentId: paymentIntent.id,
        paymentMethod: {
          card: {
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2028,
            cvc: '123'
          },
          billing_details: {
            name: 'Order Customer',
            address: orderData.shippingAddress
          },
          amount: paymentIntent.amount
        }
      };

      const confirmPaymentResponse = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(confirmPaymentData)
        .expect(200);

      expect(confirmPaymentResponse.body.success).toBe(true);
      expect(confirmPaymentResponse.body.data.paymentIntent.status).toBe('succeeded');

      // Verify order was updated
      const updatedOrder = await Order.findById(order._id);
      expect(updatedOrder.paymentStatus).toBe('completed');
      expect(updatedOrder.paymentIntentId).toBe(paymentIntent.id);

      // Admin can view and update order status
      const adminOrderResponse = await request(app)
        .get(`/api/orders/${order._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminOrderResponse.body.success).toBe(true);
      expect(adminOrderResponse.body.data.order.paymentStatus).toBe('completed');

      // Admin updates order status
      const statusUpdateResponse = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'confirmed',
          notes: 'Order confirmed and ready for processing'
        })
        .expect(200);

      expect(statusUpdateResponse.body.success).toBe(true);
      expect(statusUpdateResponse.body.data.order.status).toBe('confirmed');

      // Customer can view their order
      const customerOrderResponse = await request(app)
        .get(`/api/orders/${order._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(customerOrderResponse.body.success).toBe(true);
      expect(customerOrderResponse.body.data.order.status).toBe('confirmed');

      // Customer can view their order history
      const orderHistoryResponse = await request(app)
        .get(`/api/orders/user/${customerUser._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(orderHistoryResponse.body.success).toBe(true);
      expect(orderHistoryResponse.body.data.orders).toHaveLength(1);
      expect(orderHistoryResponse.body.data.orders[0]._id.toString()).toBe(order._id.toString());
    });

    it('should handle payment failures correctly', async () => {
      // Create order
      const orderData = {
        droneId: testDrone._id,
        quantity: 1,
        shippingAddress: {
          street: '789 Fail St',
          city: 'Fail City',
          state: 'FC',
          zipCode: '99999',
          country: 'United States'
        },
        customerInfo: {
          firstName: 'Fail',
          lastName: 'Customer',
          email: 'fail@integration.test',
          phone: '+1111111111'
        }
      };

      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderData)
        .expect(201);

      const order = orderResponse.body.data.order;

      // Create payment intent
      const paymentIntentResponse = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          amount: order.totalAmount,
          currency: 'USD',
          orderId: order._id,
          customerInfo: orderData.customerInfo
        })
        .expect(201);

      const paymentIntent = paymentIntentResponse.body.data.paymentIntent;

      // Attempt payment with declined card
      const confirmPaymentResponse = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          paymentIntentId: paymentIntent.id,
          paymentMethod: {
            card: {
              number: '4000000000000002', // Declined card
              exp_month: 12,
              exp_year: 2028,
              cvc: '123'
            },
            billing_details: {
              name: 'Fail Customer',
              address: orderData.shippingAddress
            },
            amount: paymentIntent.amount
          }
        })
        .expect(400);

      expect(confirmPaymentResponse.body.success).toBe(false);
      expect(confirmPaymentResponse.body.message).toContain('Payment failed');

      // Verify order payment status remains pending
      const orderAfterFailure = await Order.findById(order._id);
      expect(orderAfterFailure.paymentStatus).toBe('pending');
    });
  });

  describe('Data Consistency and Validation', () => {
    it('should maintain data consistency across operations', async () => {
      // Create drone with specific stock
      const droneData = {
        name: 'Consistency Test Drone',
        model: 'CTD-2024',
        price: 1200,
        description: 'Testing data consistency',
        category: 'camera',
        specifications: {
          weight: 700,
          dimensions: { length: 25, width: 25, height: 9 },
          batteryCapacity: 4000,
          flightTime: 22,
          maxSpeed: 55,
          cameraResolution: '4K',
          stabilization: '2-Axis Gimbal',
          controlRange: 5000,
          windResistanceLevel: 5,
          appCompatibility: ['iOS', 'Android']
        },
        stockQuantity: 3,
        inStock: true
      };

      const droneResponse = await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(droneData)
        .expect(201);

      const drone = droneResponse.body.data.drone;

      // Create order for 2 units
      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          droneId: drone._id,
          quantity: 2,
          shippingAddress: {
            street: '123 Consistency St',
            city: 'Consistency City',
            state: 'CC',
            zipCode: '11111',
            country: 'United States'
          },
          customerInfo: {
            firstName: 'Consistency',
            lastName: 'Customer',
            email: 'consistency@integration.test',
            phone: '+1222222222'
          }
        })
        .expect(201);

      // Verify stock was reduced to 1
      const droneAfterOrder = await Drone.findById(drone._id);
      expect(droneAfterOrder.stockQuantity).toBe(1);

      // Try to create another order for 2 units (should fail due to insufficient stock)
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          droneId: drone._id,
          quantity: 2,
          shippingAddress: {
            street: '456 Fail St',
            city: 'Fail City',
            state: 'FC',
            zipCode: '22222',
            country: 'United States'
          },
          customerInfo: {
            firstName: 'Should',
            lastName: 'Fail',
            email: 'fail@integration.test',
            phone: '+1333333333'
          }
        })
        .expect(400);

      // Verify stock remains at 1
      const droneAfterFailedOrder = await Drone.findById(drone._id);
      expect(droneAfterFailedOrder.stockQuantity).toBe(1);

      // Clean up
      await request(app)
        .delete(`/api/drones/${drone._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should validate all input data properly', async () => {
      // Test drone validation
      const invalidDroneData = {
        name: '', // Empty name
        price: -100, // Negative price
        category: 'invalid-category',
        specifications: {
          weight: -50, // Negative weight
          dimensions: { length: 0, width: 20, height: 10 }, // Zero dimension
          batteryCapacity: 50, // Too low
          flightTime: 200, // Too high
          maxSpeed: 300, // Too high
          cameraResolution: 'InvalidResolution',
          stabilization: 'InvalidStabilization',
          controlRange: 5, // Too low
          windResistanceLevel: 15, // Too high
          appCompatibility: []
        }
      };

      const droneValidationResponse = await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDroneData)
        .expect(400);

      expect(droneValidationResponse.body.success).toBe(false);
      expect(droneValidationResponse.body.errors).toBeDefined();
      expect(droneValidationResponse.body.errors.length).toBeGreaterThan(0);

      // Test order validation
      const invalidOrderData = {
        droneId: 'invalid-id',
        quantity: 0, // Invalid quantity
        shippingAddress: {
          street: '', // Empty street
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          country: 'United States'
        },
        customerInfo: {
          firstName: '',
          lastName: 'Customer',
          email: 'invalid-email', // Invalid email
          phone: '123' // Too short
        }
      };

      const orderValidationResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidOrderData)
        .expect(400);

      expect(orderValidationResponse.body.success).toBe(false);
      expect(orderValidationResponse.body.errors).toBeDefined();
      expect(orderValidationResponse.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database connection issues gracefully', async () => {
      // This test would require mocking database failures
      // For now, we'll test that the API handles non-existent resources properly
      
      // Test non-existent drone
      await request(app)
        .get('/api/drones/507f1f77bcf86cd799439011')
        .expect(404);

      // Test non-existent order
      await request(app)
        .get('/api/orders/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);

      // Test invalid ObjectId format
      await request(app)
        .get('/api/drones/invalid-id')
        .expect(400);
    });

    it('should handle concurrent operations correctly', async () => {
      // Create drone with limited stock
      const droneResponse = await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Concurrent Test Drone',
          model: 'CTD-2024',
          price: 1000,
          description: 'Testing concurrent operations',
          category: 'handheld',
          specifications: {
            weight: 400,
            dimensions: { length: 20, width: 20, height: 8 },
            batteryCapacity: 3000,
            flightTime: 18,
            maxSpeed: 40,
            cameraResolution: '1080p',
            stabilization: 'Electronic',
            controlRange: 2500,
            windResistanceLevel: 3,
            appCompatibility: ['iOS', 'Android']
          },
          stockQuantity: 1, // Only 1 in stock
          inStock: true
        })
        .expect(201);

      const drone = droneResponse.body.data.drone;

      // Simulate concurrent order attempts
      const orderPromises = [
        request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            droneId: drone._id,
            quantity: 1,
            shippingAddress: {
              street: '111 Concurrent St',
              city: 'Concurrent City',
              state: 'CC',
              zipCode: '11111',
              country: 'United States'
            },
            customerInfo: {
              firstName: 'First',
              lastName: 'Customer',
              email: 'first@integration.test',
              phone: '+1111111111'
            }
          }),
        request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            droneId: drone._id,
            quantity: 1,
            shippingAddress: {
              street: '222 Concurrent St',
              city: 'Concurrent City',
              state: 'CC',
              zipCode: '22222',
              country: 'United States'
            },
            customerInfo: {
              firstName: 'Second',
              lastName: 'Customer',
              email: 'second@integration.test',
              phone: '+2222222222'
            }
          })
      ];

      const results = await Promise.allSettled(orderPromises);
      
      // One should succeed, one should fail
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.status === 201).length;
      const failCount = results.filter(r => r.status === 'fulfilled' && r.value.status === 400).length;
      
      expect(successCount).toBe(1);
      expect(failCount).toBe(1);

      // Clean up
      await request(app)
        .delete(`/api/drones/${drone._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});