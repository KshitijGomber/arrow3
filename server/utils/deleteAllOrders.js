require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');

async function deleteAllOrders() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Count existing orders before deletion
    const orderCount = await Order.countDocuments();
    console.log(`📊 Found ${orderCount} orders in the database`);

    if (orderCount === 0) {
      console.log('📝 No orders to delete');
      return;
    }

    // Confirm deletion
    console.log('⚠️  WARNING: This will delete ALL orders from the database!');
    console.log('🗑️  Proceeding with deletion...');

    // Delete all orders
    const result = await Order.deleteMany({});
    console.log(`🧹 Successfully deleted ${result.deletedCount} orders`);

    // Verify deletion
    const remainingCount = await Order.countDocuments();
    console.log(`📊 Remaining orders: ${remainingCount}`);

    if (remainingCount === 0) {
      console.log('✅ All orders have been successfully deleted');
    } else {
      console.log('⚠️  Some orders may not have been deleted');
    }

  } catch (error) {
    console.error('❌ Error deleting orders:', error.message);
    console.error(error.stack);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the deletion
console.log('🚀 Starting order deletion process...');
deleteAllOrders();
