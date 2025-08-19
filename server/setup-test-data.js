const mongoose = require('mongoose');
require('dotenv').config();

const Drone = require('./models/Drone');
const User = require('./models/User');

async function setupTestData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Check if test user exists
    let testUser = await User.findOne({ email: 'test@stockmanagement.com' });
    if (!testUser) {
      testUser = new User({
        email: 'test@stockmanagement.com',
        password: 'password123',
        firstName: 'Stock',
        lastName: 'Tester',
        role: 'admin'
      });
      await testUser.save();
      console.log('✅ Created test user');
    } else {
      console.log('✅ Test user already exists');
    }

    // Check if test drone exists
    let testDrone = await Drone.findOne({ name: 'Test Stock Drone' });
    if (!testDrone) {
      testDrone = new Drone({
        name: 'Test Stock Drone',
        model: 'TSD-2024',
        price: 999,
        description: 'Test drone for stock management',
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
        stockQuantity: 20,
        inStock: true
      });
      await testDrone.save();
      console.log('✅ Created test drone with 20 units in stock');
    } else {
      console.log(`✅ Test drone already exists with ${testDrone.stockQuantity} units in stock`);
    }

    console.log('🎯 Test data setup complete!');
    console.log(`User ID: ${testUser._id}`);
    console.log(`Drone ID: ${testDrone._id}`);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

setupTestData();
