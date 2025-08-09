const mongoose = require('mongoose');
const Order = require('../Order');
const User = require('../User');
const Drone = require('../Drone');

// Mock MongoDB connection for testing
beforeAll(async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongod = new MongoMemoryServer();
  await mongod.start();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Order.deleteMany({});
  await User.deleteMany({});
  await Drone.deleteMany({});
});

describe('Order Model', () => {
  let testUser, testDrone;

  const validOrderData = {
    quantity: 2,
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'United States'
    },
    customerInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567'
    }
  };

  beforeEach(async () => {
    // Create test user
    testUser = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    await testUser.save();

    // Create test drone
    testDrone = new Drone({
      name: 'Test Drone',
      model: 'TD-2024',
      price: 999,
      description: 'Test drone for orders',
      images: ['https://example.com/drone.jpg'],
      specifications: {
        weight: 500,
        dimensions: { length: 30, width: 30, height: 10 },
        batteryCapacity: 3000,
        flightTime: 25,
        maxSpeed: 50,
        cameraResolution: '4K',
        stabilization: '3-Axis Gimbal',
        controlRange: 5000,
        windResistanceLevel: 5,
        appCompatibility: ['iOS', 'Android'],
        aiModes: ['Follow Me']
      },
      category: 'camera',
      stockQuantity: 10
    });
    await testDrone.save();
  });

  describe('Order Creation', () => {
    test('should create an order with valid data', async () => {
      const orderData = {
        ...validOrderData,
        userId: testUser._id,
        droneId: testDrone._id,
        totalAmount: testDrone.price * validOrderData.quantity
      };

      const order = new Order(orderData);
      const savedOrder = await order.save();

      expect(savedOrder._id).toBeDefined();
      expect(savedOrder.userId.toString()).toBe(testUser._id.toString());
      expect(savedOrder.droneId.toString()).toBe(testDrone._id.toString());
      expect(savedOrder.quantity).toBe(validOrderData.quantity);
      expect(savedOrder.totalAmount).toBe(testDrone.price * validOrderData.quantity);
      expect(savedOrder.status).toBe('pending'); // default status
      expect(savedOrder.paymentStatus).toBe('pending'); // default payment status
      expect(savedOrder.orderDate).toBeDefined();
    });

    test('should require all mandatory fields', async () => {
      const order = new Order({});
      await expect(order.save()).rejects.toThrow();
    });

    test('should validate quantity range', async () => {
      const invalidOrder = new Order({
        ...validOrderData,
        userId: testUser._id,
        droneId: testDrone._id,
        totalAmount: 999,
        quantity: 0
      });
      await expect(invalidOrder.save()).rejects.toThrow();
    });

    test('should validate ZIP code format', async () => {
      const invalidOrder = new Order({
        ...validOrderData,
        userId: testUser._id,
        droneId: testDrone._id,
        totalAmount: 999,
        shippingAddress: {
          ...validOrderData.shippingAddress,
          zipCode: 'invalid-zip'
        }
      });
      await expect(invalidOrder.save()).rejects.toThrow();
    });

    test('should validate email format in customer info', async () => {
      const invalidOrder = new Order({
        ...validOrderData,
        userId: testUser._id,
        droneId: testDrone._id,
        totalAmount: 999,
        customerInfo: {
          ...validOrderData.customerInfo,
          email: 'invalid-email'
        }
      });
      await expect(invalidOrder.save()).rejects.toThrow();
    });

    test('should validate status enum', async () => {
      const invalidOrder = new Order({
        ...validOrderData,
        userId: testUser._id,
        droneId: testDrone._id,
        totalAmount: 999,
        status: 'invalid-status'
      });
      await expect(invalidOrder.save()).rejects.toThrow();
    });

    test('should validate payment status enum', async () => {
      const invalidOrder = new Order({
        ...validOrderData,
        userId: testUser._id,
        droneId: testDrone._id,
        totalAmount: 999,
        paymentStatus: 'invalid-payment-status'
      });
      await expect(invalidOrder.save()).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let order;

    beforeEach(async () => {
      order = new Order({
        ...validOrderData,
        userId: testUser._id,
        droneId: testDrone._id,
        totalAmount: testDrone.price * validOrderData.quantity
      });
      await order.save();
    });

    test('canBeCancelled should return true for pending orders', () => {
      expect(order.canBeCancelled()).toBe(true);
    });

    test('canBeCancelled should return false for shipped orders', async () => {
      order.status = 'shipped';
      expect(order.canBeCancelled()).toBe(false);
    });

    test('canBeRefunded should return true for completed payment orders', async () => {
      order.paymentStatus = 'completed';
      order.status = 'processing';
      expect(order.canBeRefunded()).toBe(true);
    });

    test('canBeRefunded should return false for pending payment orders', () => {
      expect(order.canBeRefunded()).toBe(false);
    });

    test('calculateEstimatedDelivery should return date 5 days from order date', () => {
      const estimated = order.calculateEstimatedDelivery();
      const expectedDate = new Date(order.orderDate);
      expectedDate.setDate(expectedDate.getDate() + 5);
      
      expect(estimated.toDateString()).toBe(expectedDate.toDateString());
    });

    test('updateStatus should update status and add to history', async () => {
      await order.updateStatus('confirmed', testUser._id, 'Payment confirmed');
      
      expect(order.status).toBe('confirmed');
      expect(order.statusHistory).toHaveLength(1); // Only the new status (initial status not added in regular constructor)
      expect(order.statusHistory[0].status).toBe('confirmed');
      expect(order.statusHistory[0].notes).toBe('Payment confirmed');
      expect(order.estimatedDelivery).toBeDefined();
    });

    test('updateStatus should throw error for invalid transitions', async () => {
      await expect(
        order.updateStatus('delivered', testUser._id)
      ).rejects.toThrow('Cannot transition from pending to delivered');
    });

    test('updateStatus should set actual delivery date when delivered', async () => {
      // Set payment status to completed first
      order.paymentStatus = 'completed';
      await order.save();
      
      await order.updateStatus('confirmed', testUser._id);
      await order.updateStatus('processing', testUser._id);
      await order.updateStatus('shipped', testUser._id);
      await order.updateStatus('delivered', testUser._id);
      
      expect(order.actualDelivery).toBeDefined();
      expect(order.actualDelivery).toBeInstanceOf(Date);
    });
  });

  describe('Virtual Properties', () => {
    let order;

    beforeEach(async () => {
      order = new Order({
        ...validOrderData,
        userId: testUser._id,
        droneId: testDrone._id,
        totalAmount: testDrone.price * validOrderData.quantity
      });
      await order.save();
    });

    test('formattedTotal should return formatted price string', () => {
      expect(order.formattedTotal).toBe('$1,998');
    });

    test('customerFullName should return concatenated customer name', () => {
      expect(order.customerFullName).toBe('John Doe');
    });

    test('orderAge should return age in days', () => {
      const age = order.orderAge;
      expect(age).toBeGreaterThanOrEqual(0);
      expect(typeof age).toBe('number');
    });

    test('deliveryStatus should return correct status', () => {
      expect(order.deliveryStatus).toBe('not_shipped');
      
      order.status = 'shipped';
      order.estimatedDelivery = new Date(Date.now() + 86400000); // tomorrow
      expect(order.deliveryStatus).toBe('in_transit');
      
      order.actualDelivery = new Date();
      expect(order.deliveryStatus).toBe('delivered');
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create multiple test orders
      const order1 = new Order({
        ...validOrderData,
        userId: testUser._id,
        droneId: testDrone._id,
        totalAmount: 999,
        status: 'pending'
      });

      const order2 = new Order({
        ...validOrderData,
        userId: testUser._id,
        droneId: testDrone._id,
        totalAmount: 1998,
        status: 'confirmed',
        customerInfo: {
          ...validOrderData.customerInfo,
          email: 'different@example.com'
        }
      });

      await Promise.all([order1.save(), order2.save()]);
    });

    test('createOrder should create order with validation', async () => {
      const orderData = {
        userId: testUser._id,
        droneId: testDrone._id,
        quantity: 1,
        shippingAddress: validOrderData.shippingAddress,
        customerInfo: validOrderData.customerInfo
      };

      const order = await Order.createOrder(orderData);
      expect(order.totalAmount).toBe(testDrone.price);
      expect(order.statusHistory).toHaveLength(1);
      expect(order.statusHistory[0].status).toBe('pending');
    });

    test('createOrder should throw error for non-existent user', async () => {
      const orderData = {
        userId: new mongoose.Types.ObjectId(),
        droneId: testDrone._id,
        quantity: 1,
        shippingAddress: validOrderData.shippingAddress,
        customerInfo: validOrderData.customerInfo
      };

      await expect(Order.createOrder(orderData)).rejects.toThrow('User not found');
    });

    test('createOrder should throw error for non-existent drone', async () => {
      const orderData = {
        userId: testUser._id,
        droneId: new mongoose.Types.ObjectId(),
        quantity: 1,
        shippingAddress: validOrderData.shippingAddress,
        customerInfo: validOrderData.customerInfo
      };

      await expect(Order.createOrder(orderData)).rejects.toThrow('Drone not found');
    });

    test('createOrder should throw error for insufficient stock', async () => {
      const orderData = {
        userId: testUser._id,
        droneId: testDrone._id,
        quantity: 15, // More than available stock
        shippingAddress: validOrderData.shippingAddress,
        customerInfo: validOrderData.customerInfo
      };

      await expect(Order.createOrder(orderData)).rejects.toThrow('Only 10 units available');
    });

    test('findByUser should return user orders', async () => {
      const orders = await Order.findByUser(testUser._id);
      expect(orders).toHaveLength(2);
      expect(orders[0].userId.toString()).toBe(testUser._id.toString());
    });

    test('findByUser should filter by status', async () => {
      const pendingOrders = await Order.findByUser(testUser._id, { status: 'pending' });
      expect(pendingOrders).toHaveLength(1);
      expect(pendingOrders[0].status).toBe('pending');
    });

    test('findByStatus should return orders with specific status', async () => {
      const confirmedOrders = await Order.findByStatus('confirmed');
      expect(confirmedOrders).toHaveLength(1);
      expect(confirmedOrders[0].status).toBe('confirmed');
    });

    test('searchOrders should filter by multiple criteria', async () => {
      const results = await Order.searchOrders({
        status: 'confirmed',
        customerEmail: 'different'
      });
      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('confirmed');
      expect(results[0].customerInfo.email).toBe('different@example.com');
    });
  });

  describe('Business Logic Validation', () => {
    test('should prevent delivery without completed payment', async () => {
      const order = new Order({
        ...validOrderData,
        userId: testUser._id,
        droneId: testDrone._id,
        totalAmount: 999,
        status: 'delivered',
        paymentStatus: 'pending'
      });

      await expect(order.save()).rejects.toThrow('Cannot deliver order without completed payment');
    });

    test('should validate estimated delivery is after order date', async () => {
      const order = new Order({
        ...validOrderData,
        userId: testUser._id,
        droneId: testDrone._id,
        totalAmount: 999,
        estimatedDelivery: new Date(Date.now() - 86400000) // yesterday
      });

      await expect(order.save()).rejects.toThrow('Estimated delivery date must be after order date');
    });

    test('should validate refund amount does not exceed total', async () => {
      const order = new Order({
        ...validOrderData,
        userId: testUser._id,
        droneId: testDrone._id,
        totalAmount: 999,
        refundAmount: 1500 // More than total amount
      });

      await expect(order.save()).rejects.toThrow();
    });
  });
});