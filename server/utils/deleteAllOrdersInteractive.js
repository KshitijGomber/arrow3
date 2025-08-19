require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const Order = require('../models/Order');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function deleteAllOrdersWithConfirmation() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Count existing orders before deletion
    const orderCount = await Order.countDocuments();
    console.log(`\n📊 Found ${orderCount} orders in the database`);

    if (orderCount === 0) {
      console.log('📝 No orders to delete');
      rl.close();
      return;
    }

    // Show some sample orders
    const sampleOrders = await Order.find({}).limit(3).select('orderNumber totalAmount status createdAt');
    console.log('\n📋 Sample orders:');
    sampleOrders.forEach(order => {
      console.log(`  - Order #${order.orderNumber}: $${order.totalAmount} (${order.status}) - ${order.createdAt.toLocaleDateString()}`);
    });

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This action will PERMANENTLY delete ALL orders from the database!');
    console.log('⚠️  This action CANNOT be undone!');
    
    const confirmation1 = await askQuestion('\n❓ Are you sure you want to delete all orders? (yes/no): ');
    
    if (confirmation1.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      rl.close();
      return;
    }

    const confirmation2 = await askQuestion(`\n❓ Type "DELETE ALL ${orderCount} ORDERS" to confirm: `);
    
    if (confirmation2 !== `DELETE ALL ${orderCount} ORDERS`) {
      console.log('❌ Confirmation text did not match. Operation cancelled');
      rl.close();
      return;
    }

    console.log('\n🗑️  Proceeding with deletion...');

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
    // Close the database connection and readline interface
    rl.close();
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the deletion with confirmation
console.log('🚀 Starting interactive order deletion process...');
deleteAllOrdersWithConfirmation();
