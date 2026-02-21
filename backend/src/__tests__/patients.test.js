process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const express = require('express');
const jwt     = require('jsonwebtoken');

jest.mock('../config/database', () => ({ query: jest.fn() }));

const pool          = require('../config/database');
const requireAuth   = require('../middleware/auth');
const patientRoutes = require('../routes/patients');

const app = express();
app.use(express.json());
app.use('/api/patients', requireAuth, patientRoutes);

// Token for patient id=5
const token = jwt.sign({ id: 5, email: 'test@example.com' }, 'test-secret');
const auth  = { Authorization: `Bearer ${token}` };

describe('GET /api/patients', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.status).toBe(401);
  });

  it("returns the authenticated patient's own record", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 5, first_name: 'Test', last_name: 'User', email: 'test@example.com' }],
    });

    const res = await request(app).get('/api/patients').set(auth);

    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe(5);
  });
});

describe('GET /api/patients/:id', () => {
  it('returns 403 when accessing another patient', async () => {
    const res = await request(app).get('/api/patients/1').set(auth);
    expect(res.status).toBe(403);
  });

  it("returns the patient's own record when ID matches", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 5, first_name: 'Test', last_name: 'User', email: 'test@example.com' }],
    });

    const res = await request(app).get('/api/patients/5').set(auth);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(5);
  });

  it('returns 404 when the record does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/patients/5').set(auth);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/patients/:id', () => {
  it('returns 403 when updating another patient', async () => {
    const res = await request(app).put('/api/patients/1').set(auth).send({ phone: '555-0000' });
    expect(res.status).toBe(403);
  });

  it("updates the patient's own record", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 5, first_name: 'Test', last_name: 'User', phone: '555-0000', email: 'test@example.com' }],
    });

    const res = await request(app).put('/api/patients/5').set(auth).send({ phone: '555-0000' });

    expect(res.status).toBe(200);
    expect(res.body.data.phone).toBe('555-0000');
  });
});

describe('DELETE /api/patients/:id', () => {
  it('returns 403 when deleting another patient', async () => {
    const res = await request(app).delete('/api/patients/1').set(auth);
    expect(res.status).toBe(403);
  });

  it("deletes the patient's own record", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 5, first_name: 'Test', last_name: 'User' }],
    });

    const res = await request(app).delete('/api/patients/5').set(auth);
    expect(res.status).toBe(200);
  });
});
