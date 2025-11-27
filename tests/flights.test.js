const request = require('supertest');
const app = require('../src/index');

describe('GET /api/flights', () => {
  test('returns all flights when no query', async () => {
    const res = await request(app).get('/api/flights');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('count');
    expect(Array.isArray(res.body.flights)).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  test('filter by origin', async () => {
    const res = await request(app).get('/api/flights').query({ origin: 'TPE' });
    expect(res.statusCode).toBe(200);
    expect(res.body.flights.every(f => f.origin === 'TPE')).toBe(true);
  });

  test('filter by date', async () => {
    const res = await request(app).get('/api/flights').query({ date: '2025-12-02' });
    expect(res.statusCode).toBe(200);
    expect(res.body.flights.every(f => f.date === '2025-12-02')).toBe(true);
  });
});
