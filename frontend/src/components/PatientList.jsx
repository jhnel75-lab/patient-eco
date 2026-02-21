import { useState, useEffect } from 'react';
import { getPatients } from '../services/api';
import FileUpload from './FileUpload';

export default function PatientList() {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await getPatients();
        setPatient(data.data[0] || null);
      } catch {
        setError('Failed to load your profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={styles.card}><p style={{ color: '#718096' }}>Loading your profile…</p></div>;
  if (error)   return <div style={styles.card}><div style={styles.error}>{error}</div></div>;
  if (!patient) return <div style={styles.card}><p style={{ color: '#718096' }}>No profile found.</p></div>;

  const dob = patient.date_of_birth
    ? new Date(patient.date_of_birth).toLocaleDateString()
    : '—';

  const fields = [
    ['First Name',        patient.first_name],
    ['Last Name',         patient.last_name],
    ['Date of Birth',     dob],
    ['Email',             patient.email],
    ['Phone',             patient.phone || '—'],
    ['Address',           patient.address || '—'],
    ['Medical Record #',  patient.medical_record_number || '—'],
    ['Insurance Provider',patient.insurance_provider || '—'],
    ['Insurance ID',      patient.insurance_id || '—'],
    ['Notes',             patient.notes || '—'],
  ];

  return (
    <>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.heading}>My Profile</h2>
          <span style={styles.badge}>ID #{patient.id}</span>
        </div>

        <div style={styles.grid}>
          {fields.map(([label, value]) => (
            <div key={label} style={styles.field}>
              <span style={styles.fieldLabel}>{label}</span>
              <span style={styles.fieldValue}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <FileUpload
        patientId={patient.id}
        patientName={`${patient.first_name} ${patient.last_name}`}
      />
    </>
  );
}

const styles = {
  card:       { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)', marginBottom: 24 },
  header:     { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  heading:    { fontSize: 18, fontWeight: 600, color: '#2d3748' },
  badge:      { background: '#ebf8ff', color: '#2b6cb0', borderRadius: 12, padding: '2px 10px', fontSize: 13, fontWeight: 600 },
  grid:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' },
  field:      { display: 'flex', flexDirection: 'column', gap: 2 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' },
  fieldValue: { fontSize: 14, color: '#2d3748' },
  error:      { background: '#fff5f5', border: '1px solid #fc8181', color: '#c53030', padding: '10px 14px', borderRadius: 6, fontSize: 14 },
};
