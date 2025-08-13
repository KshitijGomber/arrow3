const mongoose = require('mongoose');
const Drone = require('../models/Drone');
require('dotenv').config();

// Camera drones data from the table
const cameraDrones = [
  {
    name: "Arrow3 Vision Pro",
    model: "VP-4821",
    price: 2799,
    description: "Professional 4K camera drone with cinematic AI tracking.",
    category: "camera",
    stockQuantity: 120,
    inStock: true,
    featured: true,
    images: [
      "https://via.placeholder.com/800x600/1a1a1a/00ff88?text=Arrow3+Vision+Pro.jpg",
      "https://via.placeholder.com/800x600/2a2a2a/00ff88?text=VP-4821+Camera.jpg",
      "https://via.placeholder.com/800x600/3a3a3a/00ff88?text=Professional+Drone.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=sample1",
      "https://www.youtube.com/watch?v=sample2"
    ],
    specifications: {
      weight: 1450,
      dimensions: {
        length: 42,
        width: 38,
        height: 18
      },
      batteryCapacity: 6000,
      flightTime: 40,
      maxSpeed: 72,
      cameraResolution: "4K",
      stabilization: "3-Axis Gimbal",
      controlRange: 8000,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 8,
      appCompatibility: ["iOS", "Android", "Windows", "macOS"],
      aiModes: ["Follow Me", "ActiveTrack", "Waypoint Navigation"]
    }
  },
  {
    name: "Arrow3 SkyFilm X",
    model: "SF-9032",
    price: 3499,
    description: "Ultra-stable aerial filming with 6K HDR lens.",
    category: "camera",
    stockQuantity: 85,
    inStock: true,
    featured: true,
    images: [
      "https://via.placeholder.com/800x600/1a1a1a/ff6600?text=Arrow3+SkyFilm+X.jpg",
      "https://via.placeholder.com/800x600/2a2a2a/ff6600?text=SF-9032+6K.jpg",
      "https://via.placeholder.com/800x600/3a3a3a/ff6600?text=Ultra+Stable.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=sample3",
      "https://www.youtube.com/watch?v=sample4"
    ],
    specifications: {
      weight: 1800,
      dimensions: {
        length: 45,
        width: 42,
        height: 20
      },
      batteryCapacity: 7500,
      flightTime: 50,
      maxSpeed: 80,
      cameraResolution: "6K",
      stabilization: "3-Axis Gimbal",
      controlRange: 10000,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 9,
      appCompatibility: ["iOS", "Android", "Windows", "macOS", "Web"],
      aiModes: ["Orbit Mode", "Cinematic Mode", "ActiveTrack"]
    }
  },
  {
    name: "Arrow3 CineAir Lite",
    model: "CA-7210",
    price: 1599,
    description: "Lightweight 4K drone for travel videography.",
    category: "camera",
    stockQuantity: 210,
    inStock: true,
    featured: false,
    images: [
      "https://via.placeholder.com/800x600/1a1a1a/0066ff?text=Arrow3+CineAir+Lite.jpg",
      "https://via.placeholder.com/800x600/2a2a2a/0066ff?text=CA-7210+Lightweight.jpg",
      "https://via.placeholder.com/800x600/3a3a3a/0066ff?text=Travel+Drone.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=sample5"
    ],
    specifications: {
      weight: 950,
      dimensions: {
        length: 36,
        width: 34,
        height: 16
      },
      batteryCapacity: 5200,
      flightTime: 32,
      maxSpeed: 65,
      cameraResolution: "4K",
      stabilization: "2-Axis Gimbal",
      controlRange: 6500,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 7,
      appCompatibility: ["iOS", "Android"],
      aiModes: ["Waypoint Navigation", "QuickShot"]
    }
  },
  {
    name: "Arrow3 Horizon Max",
    model: "HM-6401",
    price: 4899,
    description: "Long-range 8K drone for high-end production.",
    category: "camera",
    stockQuantity: 40,
    inStock: true,
    featured: true,
    images: [
      "https://via.placeholder.com/800x600/1a1a1a/ff0066?text=Arrow3+Horizon+Max.jpg",
      "https://via.placeholder.com/800x600/2a2a2a/ff0066?text=HM-6401+8K.jpg",
      "https://via.placeholder.com/800x600/3a3a3a/ff0066?text=High+End+Production.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=sample6",
      "https://www.youtube.com/watch?v=sample7",
      "https://www.youtube.com/watch?v=sample8"
    ],
    specifications: {
      weight: 2100,
      dimensions: {
        length: 50,
        width: 46,
        height: 22
      },
      batteryCapacity: 8200,
      flightTime: 55,
      maxSpeed: 95,
      cameraResolution: "8K",
      stabilization: "3-Axis Gimbal",
      controlRange: 12000,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 9,
      appCompatibility: ["iOS", "Android", "Windows", "macOS", "Web"],
      aiModes: ["ActiveTrack", "Cinematic Mode", "Orbit Mode"]
    }
  }
];

async function addCameraDrones() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/arrow3-aerospace';
    await mongoose.connect(mongoUri);
    console.log('📦 Connected to MongoDB');

    // Check if drones already exist (to avoid duplicates)
    const existingDrones = await Drone.find({
      name: { $in: cameraDrones.map(d => d.name) }
    });

    if (existingDrones.length > 0) {
      console.log('⚠️  Some camera drones already exist in the database:');
      existingDrones.forEach(drone => {
        console.log(`   - ${drone.name} (${drone.model})`);
      });
      
      // Ask if user wants to continue (in a real scenario, you'd prompt for input)
      console.log('🔄 Skipping existing drones and adding new ones...');
      
      const existingNames = existingDrones.map(d => d.name);
      const newDrones = cameraDrones.filter(d => !existingNames.includes(d.name));
      
      if (newDrones.length === 0) {
        console.log('✅ All camera drones already exist in the database');
        return;
      }
      
      console.log(`📝 Adding ${newDrones.length} new camera drones...`);
      await Drone.insertMany(newDrones);
    } else {
      // Add all drones
      console.log('📝 Adding all 4 camera drones to the database...');
      await Drone.insertMany(cameraDrones);
    }

    console.log('✅ Camera drones added successfully!');
    
    // Display summary
    console.log('\n📊 Camera Drones Summary:');
    const allCameraDrones = await Drone.find({ category: 'camera' }).sort({ price: 1 });
    allCameraDrones.forEach((drone, index) => {
      console.log(`${index + 1}. ${drone.name} (${drone.model}) - $${drone.price.toLocaleString()}`);
      console.log(`   Stock: ${drone.stockQuantity} units | Featured: ${drone.featured ? 'Yes' : 'No'}`);
      console.log(`   Camera: ${drone.specifications.cameraResolution} | Flight Time: ${drone.specifications.flightTime}min`);
      console.log('');
    });

    // Show total counts
    const totalDrones = await Drone.countDocuments();
    const totalCameraDrones = await Drone.countDocuments({ category: 'camera' });
    const featuredDrones = await Drone.countDocuments({ featured: true });
    
    console.log(`📈 Database Statistics:`);
    console.log(`   Total drones: ${totalDrones}`);
    console.log(`   Camera drones: ${totalCameraDrones}`);
    console.log(`   Featured drones: ${featuredDrones}`);

  } catch (error) {
    console.error('❌ Error adding camera drones:', error);
    if (error.code === 11000) {
      console.error('   Duplicate key error - some drones may already exist');
    }
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  addCameraDrones()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { addCameraDrones, cameraDrones };
