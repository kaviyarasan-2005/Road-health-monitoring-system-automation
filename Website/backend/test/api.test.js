const request = require('supertest');
const app = require('./server'); // Assuming server exports the app

describe('API Tests', () => {
  test('GET / should return server running message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Backend Server Running 🚀');
  });

  test('GET /api/public/reports should return reports', async () => {
    const response = await request(app).get('/api/public/reports');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});