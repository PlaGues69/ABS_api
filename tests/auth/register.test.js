// tests/auth/register.test.js
const request = require('supertest');
const app = require('../../index');
const mongoose = require('mongoose');

let authToken; 

describe('User Registration', () => {
  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@mail.com`,
      password: 'password123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');

    authToken = res.body.token;
  });
});

module.exports = { authToken }; 
