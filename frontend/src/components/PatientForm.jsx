import { useState } from 'react';
import { createPatient } from '../services/api';

const EMPTY = {
  first_name: '', last_name: '', date_of_birth: '', email: '',
  phone: '', address: '', medical_record_number: '',
  insurance_provider: '', insurance_id: '', notes: '',
};

export default function PatientForm({ onPatientAdded }) {
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const { data } = await createPatient(form);
      setSuccess(`Patient "${data.data.first_name} ${data.data.last_name}" registered (ID: ${data.data.id})`);
      setForm(EMPTY);
      onPatientAdded && onPatientAdded(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.heading}>Register New Patient</h2>

      {error   && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.row}>
          <Field label="First Name *" name="first_name" value={form.first_name} onChange={handleChange} required />
          <Field label="Last Name *"  name="last_name"  value={form.last_name}  onChange={handleChange} required />
        </div>
        <div style={styles.row}>
          <Field label="Date of Birth *" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} required />
          <Field label="Email *" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div style={styles.row}>
          <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Field label="Medical Record #" name="medical_record_number" value={form.medical_record_number} onChange={handleChange} />
        </div>
        <div style={styles.row}>
          <Field label="Insurance Provider" name="insurance_provider" value={form.insurance_provider} onChange={handleChange} />
          <Field label="Insurance ID" name="insurance_id" value={form.insurance_id} onChange={handleChange} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={styles.label}>Address</label>
          <input style={styles.input} name="address" value={form.address} onChange={handleChange} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={styles.label}>Notes</label>
          <textarea style={{ ...styles.input, height: 80, resize: 'vertical' }}
            name="notes" value={form.notes} onChange={handleChange} />
        </div>
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Registering…' : 'Register Patient'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, required }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={styles.label}>{label}</label>
      <input style={styles.input} type={type} name={name}
        value={value} onChange={onChange} required={required} />
    </div>
  );
}

const styles = {
  card:    { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)', marginBottom: 24 },
  heading: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#2d3748' },
  row:     { display: 'flex', gap: 12, marginBottom: 12 },
  label:   { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#4a5568' },
  input:   { width: '100%', padding: '8px 10px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 14, outline: 'none' },
  button:  { background: '#3182ce', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 15, cursor: 'pointer', fontWeight: 600 },
  error:   { background: '#fff5f5', border: '1px solid #fc8181', color: '#c53030', padding: '10px 14px', borderRadius: 6, marginBottom: 14, fontSize: 14 },
  success: { background: '#f0fff4', border: '1px solid #68d391', color: '#276749', padding: '10px 14px', borderRadius: 6, marginBottom: 14, fontSize: 14 },
};
