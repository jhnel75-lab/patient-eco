process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const express = require('express');

jest.mock('../config/database', () => ({ query: jest.fn() }));
jest.mock('bcryptjs', () => ({
  hash:    jest.fn().mockResolvedValue('$hashed'),
  compare: jest.fn(),
}));

const pool      = require('../config/database');
const bcrypt    = require('bcryptjs');
const authRoutes = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('POST /api/auth/register', () => {
  it('creates a patient and returns a JWT', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' }],
    });

    const res = await request(app).post('/api/auth/register').send({
      first_name: 'Jane', last_name: 'Smith',
      date_of_birth: '1985-01-01', email: 'jane@example.com', password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.patient.email).toBe('jane@example.com');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'jane@example.com', password: 'password123',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      first_name: 'Jane', last_name: 'Smith',
      date_of_birth: '1985-01-01', email: 'jane@example.com', password: 'short',
    });
    expect(res.status).toBe(400);
  });

  it('returns 409 when the email is already registered', async () => {
    const err = Object.assign(new Error('unique violation'), { code: '23505' });
    pool.query.mockRejectedValueOnce(err);

    const res = await request(app).post('/api/auth/register').send({
      first_name: 'Jane', last_name: 'Smith',
      date_of_birth: '1985-01-01', email: 'jane@example.com', password: 'password123',
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a JWT on valid credentials', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', password_hash: '$hashed' }],
    });
    bcrypt.compare.mockResolvedValueOnce(true);

    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com', password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.patient.email).toBe('jane@example.com');
  });

  it('returns 401 for an incorrect password', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', password_hash: '$hashed' }],
    });
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com', password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for an unknown email', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com', password: 'password123',
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'jane@example.com' });
    expect(res.status).toBe(400);
  });
});
