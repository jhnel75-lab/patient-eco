const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const pool     = require('../config/database');

function signToken(patient) {
  return jwt.sign(
    { id: patient.id, email: patient.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { first_name, last_name, date_of_birth, email, password } = req.body;

  if (!first_name || !last_name || !date_of_birth || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'first_name, last_name, date_of_birth, email, and password are required',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO patients (first_name, last_name, date_of_birth, email, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, email`,
      [first_name, last_name, date_of_birth, email, password_hash]
    );
    const patient = rows[0];
    const token = signToken(patient);
    res.status(201).json({ success: true, token, patient });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: 'An account with that email already exists' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'email and password are required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, email, password_hash FROM patients WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const patient = rows[0];

    if (!patient.password_hash) {
      return res.status(401).json({ success: false, error: 'Account has no password set — contact support' });
    }

    const match = await bcrypt.compare(password, patient.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = signToken(patient);
    res.json({
      success: true,
      token,
      patient: { id: patient.id, first_name: patient.first_name, last_name: patient.last_name, email: patient.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
