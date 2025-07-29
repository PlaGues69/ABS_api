const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../index');

describe('Health Check', () => {
  it('should return Hello World!', async () => {
    const res = await request(app).get('/hey');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello World!');
  });

  // ✅ Cleanly close MongoDB connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });
});
