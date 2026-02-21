const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const pool    = require('../config/database');
const { upload, UPLOAD_DIR } = require('../middleware/upload');

// GET /api/patients/:id/documents - List documents for a patient (own only)
router.get('/patients/:id/documents', async (req, res) => {
  if (parseInt(req.params.id) !== req.patient.id) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, original_name, mime_type, file_size, document_type,
              description, uploaded_at
       FROM documents
       WHERE patient_id = $1
       ORDER BY uploaded_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/patients/:id/documents - Upload document for a patient (own only)
router.post('/patients/:id/documents', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  const filePath = path.join(UPLOAD_DIR, req.file.filename);

  // Ownership check — clean up temp file on rejection
  if (parseInt(req.params.id) !== req.patient.id) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  const { document_type = 'general', description = '' } = req.body;
  const { originalname, filename, mimetype, size } = req.file;

  try {
    // Verify patient exists
    const patient = await pool.query('SELECT id FROM patients WHERE id = $1', [req.params.id]);
    if (patient.rows.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    const { rows } = await pool.query(
      `INSERT INTO documents
         (patient_id, original_name, stored_name, file_path, mime_type,
          file_size, document_type, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [req.params.id, originalname, filename, filePath,
       mimetype, size, document_type, description]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    // Clean up uploaded file on DB error
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/documents/:id/download - Download a document (own only)
router.get('/documents/:id/download', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const doc = rows[0];

    if (doc.patient_id !== req.patient.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (!fs.existsSync(doc.file_path)) {
      return res.status(404).json({ success: false, error: 'File not found on disk' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${doc.original_name}"`);
    res.setHeader('Content-Type', doc.mime_type);
    res.sendFile(doc.file_path);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/documents/:id - Delete a document (own only)
router.delete('/documents/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const doc = rows[0];

    if (doc.patient_id !== req.patient.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await pool.query('DELETE FROM documents WHERE id = $1', [req.params.id]);

    // Remove file from disk
    if (fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }

    res.json({ success: true, message: 'Document deleted', data: { id: doc.id } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
