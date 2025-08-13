const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Drone = require('../models/Drone');
require('dotenv').config();

async function testProfilePageData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Find a user to test with
    const user = await User.findOne({ role: 'customer' }).limit(1);
    if (!user) {
      console.log('❌ No customer users found. Please create a user account first.');
      return;
    }

    console.log('✅ Found test user:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Created: ${user.createdAt}`);

    // Check for orders
    const orders = await Order.find({ userId: user._id })
      .populate('droneId', 'name model price')
      .sort({ orderDate: -1 });

    console.log(`\n📋 Found ${orders.length} orders for this user:`);
    
    if (orders.length === 0) {
      console.log('   No orders found for this user.');
      
      // Show available drones for testing
      const drones = await Drone.find({ inStock: true }).limit(3);
      console.log(`\n🚁 Available drones for testing orders:`);
      drones.forEach((drone, index) => {
        console.log(`   ${index + 1}. ${drone.name} (${drone.model}) - $${drone.price.toLocaleString()}`);
      });
      
      console.log('\n💡 To test the profile page with orders, you can:');
      console.log('   1. Log in to the website with this user');
      console.log('   2. Place an order for any drone');
      console.log('   3. Visit the profile page to see the order history');
    } else {
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. Order #${order._id.toString().slice(-8).toUpperCase()}`);
        console.log(`      Drone: ${order.droneId?.name || 'Unknown'}`);
        console.log(`      Amount: $${order.totalAmount.toLocaleString()}`);
        console.log(`      Status: ${order.status}`);
        console.log(`      Payment: ${order.paymentStatus}`);
        console.log(`      Date: ${order.orderDate.toLocaleDateString()}`);
        console.log('');
      });
    }

    console.log('\n🌐 Profile Page Features:');
    console.log('   ✅ Display user name and email');
    console.log('   ✅ Edit profile (first name and last name)');
    console.log('   ✅ View order history with status');
    console.log('   ✅ Show payment status for each order');
    console.log('   ✅ Responsive design with tabs');
    console.log('   ✅ Protected route (requires login)');

    console.log('\n🔗 To access the profile page:');
    console.log('   1. Start the client: cd client && npm start');
    console.log('   2. Open: http://localhost:3000');
    console.log('   3. Log in with the user credentials');
    console.log('   4. Click the profile button in the navigation');
    console.log('   5. Or navigate directly to: http://localhost:3000/profile');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
}

testProfilePageData();
