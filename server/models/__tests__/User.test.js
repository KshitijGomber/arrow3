const mongoose = require('mongoose');
const User = require('../User');

// Mock MongoDB connection for testing
beforeAll(async () => {
  // Use in-memory MongoDB for testing
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
  await User.deleteMany({});
});

describe('User Model', () => {
  const validUserData = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  };

  describe('User Creation', () => {
    test('should create a user with valid data', async () => {
      const user = new User(validUserData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(validUserData.email);
      expect(savedUser.firstName).toBe(validUserData.firstName);
      expect(savedUser.lastName).toBe(validUserData.lastName);
      expect(savedUser.role).toBe('customer'); // default role
      expect(savedUser.isEmailVerified).toBe(false); // default value
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    test('should hash password before saving', async () => {
      const user = new User(validUserData);
      const savedUser = await user.save();
      
      // Password should be hashed, not plain text
      expect(savedUser.password).not.toBe(validUserData.password);
      expect(savedUser.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    test('should not include password in JSON output', async () => {
      const user = new User(validUserData);
      const savedUser = await user.save();
      const userJSON = savedUser.toJSON();
      
      expect(userJSON.password).toBeUndefined();
    });

    test('should require email, password, firstName, and lastName', async () => {
      const user = new User({});
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const invalidUser = new User({
        ...validUserData,
        email: 'invalid-email'
      });
      
      await expect(invalidUser.save()).rejects.toThrow();
    });

    test('should enforce unique email constraint', async () => {
      const user1 = new User(validUserData);
      await user1.save();
      
      const user2 = new User(validUserData);
      await expect(user2.save()).rejects.toThrow();
    });

    test('should set role to admin when specified', async () => {
      const adminUser = new User({
        ...validUserData,
        email: 'admin@example.com',
        role: 'admin'
      });
      
      const savedUser = await adminUser.save();
      expect(savedUser.role).toBe('admin');
    });
  });

  describe('User Methods', () => {
    let user;

    beforeEach(async () => {
      user = new User(validUserData);
      await user.save();
    });

    test('comparePassword should return true for correct password', async () => {
      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);
    });

    test('comparePassword should return false for incorrect password', async () => {
      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });

    test('getFullName should return concatenated first and last name', () => {
      const fullName = user.getFullName();
      expect(fullName).toBe('John Doe');
    });

    test('fullName virtual should return concatenated name', () => {
      expect(user.fullName).toBe('John Doe');
    });
  });

  describe('Static Methods', () => {
    test('createUser should create user and check for duplicates', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith'
      };

      const user = await User.createUser(userData);
      expect(user.email).toBe(userData.email);

      // Should throw error for duplicate email
      await expect(User.createUser(userData)).rejects.toThrow('User with this email already exists');
    });

    test('findByEmailWithPassword should include password field', async () => {
      const user = new User(validUserData);
      await user.save();

      const foundUser = await User.findByEmailWithPassword(validUserData.email);
      expect(foundUser.password).toBeDefined();
      expect(foundUser.password).toMatch(/^\$2[aby]\$\d+\$/);
    });

    test('findOrCreateGoogleUser should create new user from Google profile', async () => {
      const googleProfile = {
        id: 'google123',
        emails: [{ value: 'google@example.com' }],
        name: {
          givenName: 'Google',
          familyName: 'User'
        }
      };

      const user = await User.findOrCreateGoogleUser(googleProfile);
      expect(user.googleId).toBe(googleProfile.id);
      expect(user.email).toBe(googleProfile.emails[0].value);
      expect(user.firstName).toBe(googleProfile.name.givenName);
      expect(user.lastName).toBe(googleProfile.name.familyName);
      expect(user.isEmailVerified).toBe(true);
    });

    test('findOrCreateGoogleUser should link existing user by email', async () => {
      // Create existing user
      const existingUser = new User({
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User'
      });
      await existingUser.save();

      const googleProfile = {
        id: 'google456',
        emails: [{ value: 'existing@example.com' }],
        name: {
          givenName: 'Google',
          familyName: 'User'
        }
      };

      const user = await User.findOrCreateGoogleUser(googleProfile);
      expect(user._id.toString()).toBe(existingUser._id.toString());
      expect(user.googleId).toBe(googleProfile.id);
      expect(user.isEmailVerified).toBe(true);
    });
  });
});