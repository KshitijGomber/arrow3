const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./models/Order');
const Drone = require('./models/Drone');
const User = require('./models/User');

async function testStockManagement() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Find an existing drone with stock
    const drone = await Drone.findOne({ stockQuantity: { $gt: 0 } });
    if (!drone) {
      console.log('❌ No drones with stock found');
      return;
    }

    console.log(`📦 Found drone: ${drone.name} with stock: ${drone.stockQuantity}`);
    const initialStock = drone.stockQuantity;

    // Find an existing user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found');
      return;
    }

    // Create an order
    console.log('🛒 Creating order...');
    const orderData = {
      userId: user._id,
      droneId: drone._id,
      quantity: 2,
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'United States'
      },
      customerInfo: {
        firstName: 'Test',
        lastName: 'Customer',
        email: 'test@example.com',
        phone: '+1-555-123-4567'
      }
    };

    const order = await Order.createOrder(orderData);
    console.log(`✅ Order created with ID: ${order._id}, Status: ${order.status}`);

    // Check stock hasn't changed yet
    const droneAfterOrder = await Drone.findById(drone._id);
    console.log(`📦 Stock after order creation: ${droneAfterOrder.stockQuantity} (should be unchanged)`);

    // Confirm the order (this should decrease stock)
    console.log('✅ Confirming order...');
    await order.updateStatus('confirmed', user._id, 'Payment confirmed - testing stock');

    // Check stock has decreased
    const droneAfterConfirmation = await Drone.findById(drone._id);
    console.log(`📦 Stock after confirmation: ${droneAfterConfirmation.stockQuantity} (should be ${initialStock - 2})`);

    // Cancel the order (this should restore stock)
    console.log('❌ Cancelling order...');
    await order.updateStatus('cancelled', user._id, 'Testing stock restoration');

    // Check stock has been restored
    const droneAfterCancellation = await Drone.findById(drone._id);
    console.log(`📦 Stock after cancellation: ${droneAfterCancellation.stockQuantity} (should be ${initialStock})`);

    console.log('🎉 Stock management test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testStockManagement();
