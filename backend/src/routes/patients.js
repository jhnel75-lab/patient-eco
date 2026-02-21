const express = require('express');
const router  = express.Router();
const pool    = require('../config/database');

const SAFE_COLUMNS = `id, first_name, last_name, date_of_birth, email, phone,
                      address, medical_record_number, insurance_provider,
                      insurance_id, notes, created_at, updated_at`;

// GET /api/patients - Return only the logged-in patient's record
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${SAFE_COLUMNS} FROM patients WHERE id = $1`,
      [req.patient.id]
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/patients/:id - Get single patient (own record only)
router.get('/:id', async (req, res) => {
  if (parseInt(req.params.id) !== req.patient.id) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT ${SAFE_COLUMNS} FROM patients WHERE id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/patients - Create new patient (admin only in a real app; kept for compatibility)
router.post('/', async (req, res) => {
  const {
    first_name, last_name, date_of_birth, email, phone,
    address, medical_record_number, insurance_provider,
    insurance_id, notes
  } = req.body;

  if (!first_name || !last_name || !date_of_birth || !email) {
    return res.status(400).json({
      success: false,
      error: 'first_name, last_name, date_of_birth, and email are required'
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO patients
         (first_name, last_name, date_of_birth, email, phone,
          address, medical_record_number, insurance_provider, insurance_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING ${SAFE_COLUMNS}`,
      [first_name, last_name, date_of_birth, email, phone,
       address, medical_record_number, insurance_provider, insurance_id, notes]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: 'Email or MRN already exists' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/patients/:id - Update own record only
router.put('/:id', async (req, res) => {
  if (parseInt(req.params.id) !== req.patient.id) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  const {
    first_name, last_name, date_of_birth, email, phone,
    address, medical_record_number, insurance_provider,
    insurance_id, notes
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE patients SET
         first_name = COALESCE($1, first_name),
         last_name  = COALESCE($2, last_name),
         date_of_birth = COALESCE($3, date_of_birth),
         email      = COALESCE($4, email),
         phone      = COALESCE($5, phone),
         address    = COALESCE($6, address),
         medical_record_number = COALESCE($7, medical_record_number),
         insurance_provider    = COALESCE($8, insurance_provider),
         insurance_id          = COALESCE($9, insurance_id),
         notes      = COALESCE($10, notes)
       WHERE id = $11
       RETURNING ${SAFE_COLUMNS}`,
      [first_name, last_name, date_of_birth, email, phone,
       address, medical_record_number, insurance_provider,
       insurance_id, notes, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/patients/:id - Delete own record only
router.delete('/:id', async (req, res) => {
  if (parseInt(req.params.id) !== req.patient.id) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  try {
    const { rows } = await pool.query(
      'DELETE FROM patients WHERE id = $1 RETURNING id, first_name, last_name',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    res.json({ success: true, data: rows[0], message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
