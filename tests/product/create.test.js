const request = require('supertest');
const app = require('../../index');
const mongoose = require('mongoose');
const path = require('path');

describe('Product Creation', () => {
  let token = '';

  beforeAll(async () => {
    const email = `admin${Date.now()}@mail.com`;
    const password = 'password123';

    // Register a new admin user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Admin',
        lastName: 'User',
        email,
        password,
        isAdmin: true, // 👈 ensure admin user
      });

    // Login with that user to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should create a new product with valid token', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${token}`) // 👈 set auth token
      .field('name', 'Test Product')
      .field('price', '99.99')
      .field('description', 'A test product')
      .field('category', 'test')
      .attach('image', path.join(__dirname, '../assets/test-image.jpg')); // 👈 attach a test image

    console.log('RESPONSE:', res.body); // optional debug log

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Test Product');
  });
});
