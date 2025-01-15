const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Role = require('../../src/models/Role');
const Group = require('../../src/models/Group');
const setupDefaultsService = require('../../src/services/setupService');

describe('User Registration Flow', () => {
  let defaultRole;
  let defaultGroup;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/user-management-test');
    
    // Initialize default roles and groups
    await setupDefaultsService.initializeDefaults();
    
    // Get default role and group
    defaultRole = await Role.findOne({ name: 'USER' });
    defaultGroup = await Group.findOne({ name: 'GENERAL' });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should create a new user with default role and group', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      // Check response structure
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.token).toBeDefined();

      // Verify user in database
      const user = await User.findById(response.body.data.user.id)
        .populate('roles')
        .populate('groups');

      expect(user.email).toBe(validUser.email);
      expect(user.firstName).toBe(validUser.firstName);
      expect(user.lastName).toBe(validUser.lastName);
      expect(user.roles[0].name).toBe('USER');
      expect(user.groups[0].name).toBe('GENERAL');
    });

    it('should not create user with existing email', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(validUser);

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/email already registered/i);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ param: 'email' }),
          expect.objectContaining({ param: 'password' }),
          expect.objectContaining({ param: 'firstName' }),
          expect.objectContaining({ param: 'lastName' })
        ])
      );
    });

    it('should validate password strength', async () => {
      const weakPassword = { ...validUser, password: '123' };
      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPassword)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors[0].param).toBe('password');
    });
  });

  describe('User Role and Group Assignment', () => {
    let adminToken;
    let userId;

    beforeEach(async () => {
      // Create admin user
      const adminUser = await User.create({
        email: 'admin@example.com',
        password: 'AdminPass123!',
        firstName: 'Admin',
        lastName: 'User',
        roles: [(await Role.findOne({ name: 'ADMIN' }))._id]
      });

      // Login as admin
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'AdminPass123!'
        });

      adminToken = loginResponse.body.data.token;

      // Create regular user
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@example.com',
          password: 'UserPass123!',
          firstName: 'Regular',
          lastName: 'User'
        });

      userId = userResponse.body.data.user.id;
    });

    it('should allow admin to update user roles', async () => {
      const managerRole = await Role.findOne({ name: 'MANAGER' });
      
      const response = await request(app)
        .put(`/api/users/${userId}/roles`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ roleIds: [managerRole._id] })
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const updatedUser = await User.findById(userId).populate('roles');
      expect(updatedUser.roles[0].name).toBe('MANAGER');
    });

    it('should allow admin to update user groups', async () => {
      const supportGroup = await Group.findOne({ name: 'SUPPORT' });
      
      const response = await request(app)
        .put(`/api/users/${userId}/groups`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ groupIds: [supportGroup._id] })
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const updatedUser = await User.findById(userId).populate('groups');
      expect(updatedUser.groups[0].name).toBe('SUPPORT');
    });
  });
});