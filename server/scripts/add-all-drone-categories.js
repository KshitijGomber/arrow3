const mongoose = require('mongoose');
const Drone = require('../models/Drone');
require('dotenv').config();

// Handheld drones data
const handheldDrones = [
  {
    name: "Arrow3 Pocket Air",
    model: "PA-2104",
    price: 499,
    description: "Foldable pocket-sized drone for casual shooting.",
    category: "handheld",
    stockQuantity: 500,
    inStock: true,
    featured: false,
    images: [
      "https://via.placeholder.com/800x600/4a90e2/ffffff?text=Arrow3+Pocket+Air.jpg",
      "https://via.placeholder.com/800x600/5ba1f3/ffffff?text=PA-2104+Foldable.jpg",
      "https://via.placeholder.com/800x600/6cb2ff/ffffff?text=Pocket+Drone.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=handheld1",
      "https://www.youtube.com/watch?v=handheld2"
    ],
    specifications: {
      weight: 320,
      dimensions: {
        length: 14,
        width: 13,
        height: 5
      },
      batteryCapacity: 1800,
      flightTime: 15,
      maxSpeed: 28,
      cameraResolution: "1080p",
      stabilization: "Electronic",
      controlRange: 1500,
      gpsSupport: true,
      obstacleAvoidance: false,
      returnToHome: true,
      windResistanceLevel: 5,
      appCompatibility: ["iOS", "Android"],
      aiModes: ["QuickShot"]
    }
  },
  {
    name: "Arrow3 Snap Mini",
    model: "SM-5120",
    price: 699,
    description: "Compact drone for vloggers with 2.7K video.",
    category: "handheld",
    stockQuantity: 320,
    inStock: true,
    featured: false,
    images: [
      "https://via.placeholder.com/800x600/f39c12/ffffff?text=Arrow3+Snap+Mini.jpg",
      "https://via.placeholder.com/800x600/f4ad2d/ffffff?text=SM-5120+Compact.jpg",
      "https://via.placeholder.com/800x600/f5be48/ffffff?text=Vlogger+Drone.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=handheld3"
    ],
    specifications: {
      weight: 410,
      dimensions: {
        length: 16,
        width: 15,
        height: 6
      },
      batteryCapacity: 2500,
      flightTime: 18,
      maxSpeed: 32,
      cameraResolution: "4K", // Using 4K as closest to 2.7K in enum
      stabilization: "2-Axis Gimbal",
      controlRange: 2000,
      gpsSupport: true,
      obstacleAvoidance: false,
      returnToHome: true,
      windResistanceLevel: 6,
      appCompatibility: ["iOS", "Android"],
      aiModes: ["Orbit Mode"]
    }
  },
  {
    name: "Arrow3 Breeze X",
    model: "BX-1820",
    price: 899,
    description: "Portable drone with GPS and return-to-home safety.",
    category: "handheld",
    stockQuantity: 280,
    inStock: true,
    featured: true,
    images: [
      "https://via.placeholder.com/800x600/2ecc71/ffffff?text=Arrow3+Breeze+X.jpg",
      "https://via.placeholder.com/800x600/3fd882/ffffff?text=BX-1820+Portable.jpg",
      "https://via.placeholder.com/800x600/50e493/ffffff?text=GPS+Safety.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=handheld4",
      "https://www.youtube.com/watch?v=handheld5"
    ],
    specifications: {
      weight: 520,
      dimensions: {
        length: 18,
        width: 17,
        height: 6.5
      },
      batteryCapacity: 3000,
      flightTime: 22,
      maxSpeed: 38,
      cameraResolution: "4K",
      stabilization: "Electronic",
      controlRange: 2800,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 6,
      appCompatibility: ["iOS", "Android"],
      aiModes: ["Follow Me", "QuickShot"]
    }
  },
  {
    name: "Arrow3 GoCam S",
    model: "GC-4501",
    price: 1099,
    description: "Advanced handheld drone with strong stabilization.",
    category: "handheld",
    stockQuantity: 190,
    inStock: true,
    featured: false,
    images: [
      "https://via.placeholder.com/800x600/9b59b6/ffffff?text=Arrow3+GoCam+S.jpg",
      "https://via.placeholder.com/800x600/ac6bc7/ffffff?text=GC-4501+Advanced.jpg",
      "https://via.placeholder.com/800x600/bd7dd8/ffffff?text=Strong+Stabilization.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=handheld6"
    ],
    specifications: {
      weight: 600,
      dimensions: {
        length: 20,
        width: 19,
        height: 7
      },
      batteryCapacity: 3500,
      flightTime: 25,
      maxSpeed: 45,
      cameraResolution: "4K",
      stabilization: "2-Axis Gimbal",
      controlRange: 3500,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 7,
      appCompatibility: ["iOS", "Android"],
      aiModes: ["ActiveTrack", "Waypoint Navigation"]
    }
  }
];

// Power drones data
const powerDrones = [
  {
    name: "Arrow3 Storm X",
    model: "SX-9902",
    price: 6499,
    description: "Heavy-duty industrial drone for cargo and inspection.",
    category: "power",
    stockQuantity: 65,
    inStock: true,
    featured: true,
    images: [
      "https://via.placeholder.com/800x600/34495e/ffffff?text=Arrow3+Storm+X.jpg",
      "https://via.placeholder.com/800x600/455a6f/ffffff?text=SX-9902+Industrial.jpg",
      "https://via.placeholder.com/800x600/566f80/ffffff?text=Heavy+Duty.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=power1",
      "https://www.youtube.com/watch?v=power2"
    ],
    specifications: {
      weight: 4200,
      dimensions: {
        length: 58,
        width: 55,
        height: 28
      },
      batteryCapacity: 9500,
      flightTime: 50,
      maxSpeed: 120,
      cameraResolution: "4K",
      stabilization: "3-Axis Gimbal",
      controlRange: 15000,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 10,
      appCompatibility: ["iOS", "Android", "Windows", "macOS"],
      aiModes: ["Waypoint Navigation"]
    }
  },
  {
    name: "Arrow3 Titan Pro",
    model: "TP-8610",
    price: 7999,
    description: "High-power drone for long-range mapping and delivery.",
    category: "power",
    stockQuantity: 40,
    inStock: true,
    featured: true,
    images: [
      "https://via.placeholder.com/800x600/e74c3c/ffffff?text=Arrow3+Titan+Pro.jpg",
      "https://via.placeholder.com/800x600/f85d4d/ffffff?text=TP-8610+High+Power.jpg",
      "https://via.placeholder.com/800x600/ff6e5e/ffffff?text=Long+Range.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=power3",
      "https://www.youtube.com/watch?v=power4"
    ],
    specifications: {
      weight: 4500,
      dimensions: {
        length: 60,
        width: 58,
        height: 30
      },
      batteryCapacity: 10000,
      flightTime: 60,
      maxSpeed: 110,
      cameraResolution: "4K",
      stabilization: "3-Axis Gimbal",
      controlRange: 15000,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 10,
      appCompatibility: ["iOS", "Android", "Windows", "macOS"],
      aiModes: ["Follow Me", "Orbit Mode"]
    }
  },
  {
    name: "Arrow3 CargoLift",
    model: "CL-4705",
    price: 5299,
    description: "Mid-range load-carrying drone with GPS route planning.",
    category: "power",
    stockQuantity: 75,
    inStock: true,
    featured: false,
    images: [
      "https://via.placeholder.com/800x600/f39c12/ffffff?text=Arrow3+CargoLift.jpg",
      "https://via.placeholder.com/800x600/f4ad2d/ffffff?text=CL-4705+Cargo.jpg",
      "https://via.placeholder.com/800x600/f5be48/ffffff?text=Load+Carrying.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=power5"
    ],
    specifications: {
      weight: 3800,
      dimensions: {
        length: 55,
        width: 53,
        height: 27
      },
      batteryCapacity: 8500,
      flightTime: 45,
      maxSpeed: 95,
      cameraResolution: "1080p",
      stabilization: "2-Axis Gimbal",
      controlRange: 14000,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 9,
      appCompatibility: ["iOS", "Android", "Windows"],
      aiModes: ["Waypoint Navigation", "QuickShot"]
    }
  },
  {
    name: "Arrow3 Enduro X",
    model: "EX-3500",
    price: 4999,
    description: "Rugged power drone for extreme conditions.",
    category: "power",
    stockQuantity: 95,
    inStock: true,
    featured: false,
    images: [
      "https://via.placeholder.com/800x600/8e44ad/ffffff?text=Arrow3+Enduro+X.jpg",
      "https://via.placeholder.com/800x600/9f55be/ffffff?text=EX-3500+Rugged.jpg",
      "https://via.placeholder.com/800x600/b066cf/ffffff?text=Extreme+Conditions.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=power6"
    ],
    specifications: {
      weight: 3600,
      dimensions: {
        length: 54,
        width: 52,
        height: 26
      },
      batteryCapacity: 9000,
      flightTime: 48,
      maxSpeed: 100,
      cameraResolution: "4K", // Using 4K as closest to 2.7K in enum
      stabilization: "Electronic",
      controlRange: 15000,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 9,
      appCompatibility: ["iOS", "Android", "Windows"],
      aiModes: ["Cinematic Mode"]
    }
  }
];

// Specialized drones data
const specializedDrones = [
  {
    name: "Arrow3 AgriScan",
    model: "AS-7320",
    price: 3799,
    description: "Agricultural survey drone with multispectral sensors.",
    category: "specialized",
    stockQuantity: 60,
    inStock: true,
    featured: true,
    images: [
      "https://via.placeholder.com/800x600/27ae60/ffffff?text=Arrow3+AgriScan.jpg",
      "https://via.placeholder.com/800x600/38bf71/ffffff?text=AS-7320+Agricultural.jpg",
      "https://via.placeholder.com/800x600/49d082/ffffff?text=Multispectral.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=specialized1",
      "https://www.youtube.com/watch?v=specialized2"
    ],
    specifications: {
      weight: 2800,
      dimensions: {
        length: 48,
        width: 45,
        height: 21
      },
      batteryCapacity: 8000,
      flightTime: 40,
      maxSpeed: 70,
      cameraResolution: "4K",
      stabilization: "3-Axis Gimbal",
      controlRange: 8500,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 8,
      appCompatibility: ["iOS", "Android", "Windows", "macOS"],
      aiModes: ["Waypoint Navigation"]
    }
  },
  {
    name: "Arrow3 RescueEye",
    model: "RE-5521",
    price: 4299,
    description: "Search-and-rescue drone with infrared camera.",
    category: "specialized",
    stockQuantity: 55,
    inStock: true,
    featured: true,
    images: [
      "https://via.placeholder.com/800x600/e67e22/ffffff?text=Arrow3+RescueEye.jpg",
      "https://via.placeholder.com/800x600/f78f33/ffffff?text=RE-5521+Rescue.jpg",
      "https://via.placeholder.com/800x600/ffa044/ffffff?text=Infrared+Camera.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=specialized3"
    ],
    specifications: {
      weight: 3000,
      dimensions: {
        length: 50,
        width: 46,
        height: 22
      },
      batteryCapacity: 8200,
      flightTime: 42,
      maxSpeed: 80,
      cameraResolution: "4K",
      stabilization: "3-Axis Gimbal",
      controlRange: 9000,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 8,
      appCompatibility: ["iOS", "Android", "Windows", "macOS"],
      aiModes: ["Follow Me"]
    }
  },
  {
    name: "Arrow3 Survey Pro",
    model: "SP-4320",
    price: 3599,
    description: "Precision mapping drone for construction and mining.",
    category: "specialized",
    stockQuantity: 80,
    inStock: true,
    featured: false,
    images: [
      "https://via.placeholder.com/800x600/16a085/ffffff?text=Arrow3+Survey+Pro.jpg",
      "https://via.placeholder.com/800x600/27b196/ffffff?text=SP-4320+Mapping.jpg",
      "https://via.placeholder.com/800x600/38c2a7/ffffff?text=Precision+Survey.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=specialized4"
    ],
    specifications: {
      weight: 2900,
      dimensions: {
        length: 49,
        width: 44,
        height: 21
      },
      batteryCapacity: 7800,
      flightTime: 38,
      maxSpeed: 75,
      cameraResolution: "4K",
      stabilization: "2-Axis Gimbal",
      controlRange: 8200,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 8,
      appCompatibility: ["iOS", "Android", "Windows"],
      aiModes: ["Waypoint Navigation", "Orbit Mode"]
    }
  },
  {
    name: "Arrow3 AquaDrone",
    model: "AQ-1820",
    price: 2899,
    description: "Waterproof drone for marine research.",
    category: "specialized",
    stockQuantity: 90,
    inStock: true,
    featured: false,
    images: [
      "https://via.placeholder.com/800x600/3498db/ffffff?text=Arrow3+AquaDrone.jpg",
      "https://via.placeholder.com/800x600/45a9ec/ffffff?text=AQ-1820+Waterproof.jpg",
      "https://via.placeholder.com/800x600/56bafd/ffffff?text=Marine+Research.jpg"
    ],
    videos: [
      "https://www.youtube.com/watch?v=specialized5"
    ],
    specifications: {
      weight: 2500,
      dimensions: {
        length: 47,
        width: 43,
        height: 20
      },
      batteryCapacity: 7500,
      flightTime: 35,
      maxSpeed: 65,
      cameraResolution: "1080p",
      stabilization: "Electronic",
      controlRange: 7800,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 7,
      appCompatibility: ["iOS", "Android"],
      aiModes: ["ActiveTrack", "QuickShot"]
    }
  }
];

async function addAllDroneCategories() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/arrow3-aerospace';
    await mongoose.connect(mongoUri);
    console.log('📦 Connected to MongoDB');

    // Combine all drone arrays
    const allNewDrones = [...handheldDrones, ...powerDrones, ...specializedDrones];
    
    // Check if drones already exist (to avoid duplicates)
    const existingDrones = await Drone.find({
      name: { $in: allNewDrones.map(d => d.name) }
    });

    if (existingDrones.length > 0) {
      console.log('⚠️  Some drones already exist in the database:');
      existingDrones.forEach(drone => {
        console.log(`   - ${drone.name} (${drone.model}) - ${drone.category}`);
      });
      
      console.log('🔄 Skipping existing drones and adding new ones...');
      
      const existingNames = existingDrones.map(d => d.name);
      const newDrones = allNewDrones.filter(d => !existingNames.includes(d.name));
      
      if (newDrones.length === 0) {
        console.log('✅ All drones already exist in the database');
        return;
      }
      
      console.log(`📝 Adding ${newDrones.length} new drones...`);
      await Drone.insertMany(newDrones);
    } else {
      // Add all drones
      console.log(`📝 Adding all ${allNewDrones.length} drones to the database...`);
      await Drone.insertMany(allNewDrones);
    }

    console.log('✅ All drone categories added successfully!');
    
    // Display summary by category
    console.log('\n📊 Drone Categories Summary:');
    
    // Handheld drones
    console.log('\n🤏 Handheld Drones:');
    const handheldInDb = await Drone.find({ category: 'handheld' }).sort({ price: 1 });
    handheldInDb.forEach((drone, index) => {
      console.log(`${index + 1}. ${drone.name} (${drone.model}) - $${drone.price.toLocaleString()}`);
      console.log(`   Stock: ${drone.stockQuantity} units | Featured: ${drone.featured ? 'Yes' : 'No'}`);
      console.log(`   Camera: ${drone.specifications.cameraResolution} | Flight Time: ${drone.specifications.flightTime}min`);
      console.log('');
    });

    // Power drones
    console.log('\n💪 Power Drones:');
    const powerInDb = await Drone.find({ category: 'power' }).sort({ price: 1 });
    powerInDb.forEach((drone, index) => {
      console.log(`${index + 1}. ${drone.name} (${drone.model}) - $${drone.price.toLocaleString()}`);
      console.log(`   Stock: ${drone.stockQuantity} units | Featured: ${drone.featured ? 'Yes' : 'No'}`);
      console.log(`   Camera: ${drone.specifications.cameraResolution} | Flight Time: ${drone.specifications.flightTime}min`);
      console.log('');
    });

    // Specialized drones
    console.log('\n🎯 Specialized Drones:');
    const specializedInDb = await Drone.find({ category: 'specialized' }).sort({ price: 1 });
    specializedInDb.forEach((drone, index) => {
      console.log(`${index + 1}. ${drone.name} (${drone.model}) - $${drone.price.toLocaleString()}`);
      console.log(`   Stock: ${drone.stockQuantity} units | Featured: ${drone.featured ? 'Yes' : 'No'}`);
      console.log(`   Camera: ${drone.specifications.cameraResolution} | Flight Time: ${drone.specifications.flightTime}min`);
      console.log('');
    });

    // Show total counts
    const totalDrones = await Drone.countDocuments();
    const cameraDrones = await Drone.countDocuments({ category: 'camera' });
    const handheldCount = await Drone.countDocuments({ category: 'handheld' });
    const powerCount = await Drone.countDocuments({ category: 'power' });
    const specializedCount = await Drone.countDocuments({ category: 'specialized' });
    const featuredDrones = await Drone.countDocuments({ featured: true });
    
    console.log(`📈 Database Statistics:`);
    console.log(`   Total drones: ${totalDrones}`);
    console.log(`   Camera drones: ${cameraDrones}`);
    console.log(`   Handheld drones: ${handheldCount}`);
    console.log(`   Power drones: ${powerCount}`);
    console.log(`   Specialized drones: ${specializedCount}`);
    console.log(`   Featured drones: ${featuredDrones}`);

  } catch (error) {
    console.error('❌ Error adding drones:', error);
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
  addAllDroneCategories()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { 
  addAllDroneCategories, 
  handheldDrones, 
  powerDrones, 
  specializedDrones 
};
