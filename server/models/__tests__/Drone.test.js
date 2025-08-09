const mongoose = require('mongoose');
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
  await Drone.deleteMany({});
});

describe('Drone Model', () => {
  const validDroneData = {
    name: 'Arrow3 Pro',
    model: 'A3P-2024',
    price: 1299,
    description: 'Professional drone with 4K camera and advanced AI features',
    images: ['https://example.com/drone1.jpg', 'https://example.com/drone2.png'],
    videos: ['https://example.com/demo.mp4', 'https://youtube.com/watch?v=abc123'],
    specifications: {
      weight: 899,
      dimensions: {
        length: 35.5,
        width: 35.5,
        height: 12.8
      },
      batteryCapacity: 3850,
      flightTime: 34,
      maxSpeed: 68,
      cameraResolution: '4K',
      stabilization: '3-Axis Gimbal',
      controlRange: 7000,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 7,
      appCompatibility: ['iOS', 'Android'],
      aiModes: ['Follow Me', 'ActiveTrack', 'QuickShot']
    },
    category: 'camera',
    stockQuantity: 10
  };

  describe('Drone Creation', () => {
    test('should create a drone with valid data', async () => {
      const drone = new Drone(validDroneData);
      const savedDrone = await drone.save();

      expect(savedDrone._id).toBeDefined();
      expect(savedDrone.name).toBe(validDroneData.name);
      expect(savedDrone.model).toBe(validDroneData.model);
      expect(savedDrone.price).toBe(validDroneData.price);
      expect(savedDrone.category).toBe(validDroneData.category);
      expect(savedDrone.inStock).toBe(true); // default value
      expect(savedDrone.featured).toBe(false); // default value
      expect(savedDrone.createdAt).toBeDefined();
      expect(savedDrone.updatedAt).toBeDefined();
    });

    test('should require all mandatory fields', async () => {
      const drone = new Drone({});
      await expect(drone.save()).rejects.toThrow();
    });

    test('should validate price is not negative', async () => {
      const invalidDrone = new Drone({
        ...validDroneData,
        price: -100
      });
      await expect(invalidDrone.save()).rejects.toThrow();
    });

    test('should validate category enum', async () => {
      const invalidDrone = new Drone({
        ...validDroneData,
        category: 'invalid-category'
      });
      await expect(invalidDrone.save()).rejects.toThrow();
    });

    test('should validate image URLs', async () => {
      const invalidDrone = new Drone({
        ...validDroneData,
        images: ['not-a-valid-url', 'https://example.com/image.txt']
      });
      await expect(invalidDrone.save()).rejects.toThrow();
    });

    test('should require at least one image', async () => {
      const invalidDrone = new Drone({
        ...validDroneData,
        images: []
      });
      await expect(invalidDrone.save()).rejects.toThrow();
    });

    test('should enforce unique drone names', async () => {
      const drone1 = new Drone(validDroneData);
      await drone1.save();

      const drone2 = new Drone(validDroneData);
      await expect(drone2.save()).rejects.toThrow();
    });
  });

  describe('Specifications Validation', () => {
    test('should validate weight range', async () => {
      const invalidDrone = new Drone({
        ...validDroneData,
        specifications: {
          ...validDroneData.specifications,
          weight: 0
        }
      });
      await expect(invalidDrone.save()).rejects.toThrow();
    });

    test('should validate camera resolution enum', async () => {
      const invalidDrone = new Drone({
        ...validDroneData,
        specifications: {
          ...validDroneData.specifications,
          cameraResolution: 'Invalid Resolution'
        }
      });
      await expect(invalidDrone.save()).rejects.toThrow();
    });

    test('should validate wind resistance level range', async () => {
      const invalidDrone = new Drone({
        ...validDroneData,
        specifications: {
          ...validDroneData.specifications,
          windResistanceLevel: 15
        }
      });
      await expect(invalidDrone.save()).rejects.toThrow();
    });

    test('should validate app compatibility enum values', async () => {
      const invalidDrone = new Drone({
        ...validDroneData,
        specifications: {
          ...validDroneData.specifications,
          appCompatibility: ['InvalidOS']
        }
      });
      await expect(invalidDrone.save()).rejects.toThrow();
    });

    test('should set default app compatibility if not provided', async () => {
      const droneData = {
        ...validDroneData,
        specifications: {
          ...validDroneData.specifications,
          appCompatibility: []
        }
      };
      
      const drone = new Drone(droneData);
      const savedDrone = await drone.save();
      
      expect(savedDrone.specifications.appCompatibility).toEqual(['iOS', 'Android']);
    });
  });

  describe('Instance Methods', () => {
    let drone;

    beforeEach(async () => {
      drone = new Drone(validDroneData);
      await drone.save();
    });

    test('isAvailable should return true when in stock', () => {
      expect(drone.isAvailable()).toBe(true);
    });

    test('isAvailable should return false when out of stock', async () => {
      drone.inStock = false;
      expect(drone.isAvailable()).toBe(false);
    });

    test('isAvailable should return false when stock quantity is 0', async () => {
      drone.stockQuantity = 0;
      expect(drone.isAvailable()).toBe(false);
    });

    test('getPrimaryImage should return first image', () => {
      const primaryImage = drone.getPrimaryImage();
      expect(primaryImage).toBe(validDroneData.images[0]);
    });

    test('getPrimaryImage should return null when no images', async () => {
      drone.images = [];
      expect(drone.getPrimaryImage()).toBeNull();
    });

    test('getSpecsSummary should return formatted specifications', () => {
      const summary = drone.getSpecsSummary();
      expect(summary).toEqual({
        weight: '899g',
        flightTime: '34 min',
        maxSpeed: '68 km/h',
        camera: '4K',
        range: '7000m'
      });
    });
  });

  describe('Virtual Properties', () => {
    let drone;

    beforeEach(async () => {
      drone = new Drone(validDroneData);
      await drone.save();
    });

    test('formattedPrice should return formatted price string', () => {
      expect(drone.formattedPrice).toBe('$1,299');
    });

    test('availabilityStatus should return correct status', () => {
      expect(drone.availabilityStatus).toBe('In Stock');
      
      drone.stockQuantity = 3;
      expect(drone.availabilityStatus).toBe('Low Stock');
      
      drone.stockQuantity = 0;
      expect(drone.availabilityStatus).toBe('Out of Stock');
      
      drone.inStock = false;
      expect(drone.availabilityStatus).toBe('Out of Stock');
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test drones
      const drone1 = new Drone({
        ...validDroneData,
        name: 'Featured Drone',
        featured: true,
        price: 999
      });
      
      const drone2 = new Drone({
        ...validDroneData,
        name: 'Regular Drone',
        featured: false,
        price: 1499,
        category: 'handheld'
      });
      
      const drone3 = new Drone({
        ...validDroneData,
        name: 'Out of Stock Drone',
        inStock: false,
        price: 799
      });

      await Promise.all([drone1.save(), drone2.save(), drone3.save()]);
    });

    test('findFeatured should return only featured and in-stock drones', async () => {
      const featuredDrones = await Drone.findFeatured();
      expect(featuredDrones).toHaveLength(1);
      expect(featuredDrones[0].name).toBe('Featured Drone');
      expect(featuredDrones[0].featured).toBe(true);
    });

    test('findByCategory should return drones in specific category', async () => {
      const cameraDrones = await Drone.findByCategory('camera');
      expect(cameraDrones).toHaveLength(1);
      expect(cameraDrones[0].category).toBe('camera');

      const handheldDrones = await Drone.findByCategory('handheld');
      expect(handheldDrones).toHaveLength(1);
      expect(handheldDrones[0].category).toBe('handheld');
    });

    test('searchDrones should filter by category', async () => {
      const results = await Drone.searchDrones({ category: 'camera' });
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('camera');
    });

    test('searchDrones should filter by price range', async () => {
      const results = await Drone.searchDrones({ 
        minPrice: 900, 
        maxPrice: 1500 
      });
      expect(results).toHaveLength(2);
      expect(results.every(drone => drone.price >= 900 && drone.price <= 1500)).toBe(true);
    });

    test('searchDrones should sort by price ascending', async () => {
      const results = await Drone.searchDrones({ sortBy: 'price_asc' });
      expect(results[0].price).toBeLessThanOrEqual(results[1].price);
    });

    test('updateStock should decrease stock quantity', async () => {
      const drone = await Drone.findOne({ name: 'Featured Drone' });
      const originalStock = drone.stockQuantity;
      
      const updatedDrone = await Drone.updateStock(drone._id, 2);
      expect(updatedDrone.stockQuantity).toBe(originalStock - 2);
    });

    test('updateStock should throw error for insufficient stock', async () => {
      const drone = await Drone.findOne({ name: 'Featured Drone' });
      
      await expect(
        Drone.updateStock(drone._id, drone.stockQuantity + 1)
      ).rejects.toThrow('Insufficient stock');
    });

    test('updateStock should set inStock to false when quantity reaches 0', async () => {
      const drone = await Drone.findOne({ name: 'Featured Drone' });
      
      const updatedDrone = await Drone.updateStock(drone._id, drone.stockQuantity);
      expect(updatedDrone.stockQuantity).toBe(0);
      expect(updatedDrone.inStock).toBe(false);
    });
  });
});