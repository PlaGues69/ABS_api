const request = require('supertest');
const app = require('../../index');
const mongoose = require('mongoose');

describe('User Login', () => {
  let testEmail = `login${Date.now()}@mail.com`;

  beforeAll(async () => {
    // Register a user first
    await request(app).post('/api/auth/register').send({
      firstName: 'Login',
      lastName: 'Tester',
      email: testEmail,
      password: 'password123',
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should login an existing user successfully', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'password123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.success).toBe(true);
  });
});
