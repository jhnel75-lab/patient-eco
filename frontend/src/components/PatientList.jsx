import { useState, useEffect } from 'react';
import { getPatients, deletePatient } from '../services/api';
import FileUpload from './FileUpload';

export default function PatientList({ refreshTrigger }) {
  const [patients, setPatients]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [selectedId, setSelectedId]   = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getPatients();
      setPatients(data.data);
    } catch {
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refreshTrigger]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete patient "${name}"? All their documents will also be deleted.`)) return;
    try {
      await deletePatient(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch {
      setError('Failed to delete patient');
    }
  };

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q)  ||
      p.email.toLowerCase().includes(q)      ||
      (p.medical_record_number || '').toLowerCase().includes(q)
    );
  });

  const selectedPatient = patients.find((p) => p.id === selectedId);

  if (loading) return <div style={styles.card}><p style={{ color: '#718096' }}>Loading patients…</p></div>;

  return (
    <>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Patient Registry</h2>
          <span style={styles.badge}>{patients.length} patients</span>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <input
          style={styles.search}
          placeholder="Search by name, email, or MRN…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filtered.length === 0
          ? <p style={{ color: '#718096', fontSize: 14 }}>No patients found.</p>
          : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['ID', 'Name', 'DOB', 'Email', 'Phone', 'MRN', 'Insurance', 'Actions'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ ...styles.tr, ...(selectedId === p.id ? styles.trSelected : {}) }}>
                    <td style={styles.td}>{p.id}</td>
                    <td style={styles.td}><strong>{p.last_name}, {p.first_name}</strong></td>
                    <td style={styles.td}>{new Date(p.date_of_birth).toLocaleDateString()}</td>
                    <td style={styles.td}>{p.email}</td>
                    <td style={styles.td}>{p.phone || '—'}</td>
                    <td style={styles.td}>{p.medical_record_number || '—'}</td>
                    <td style={styles.td}>{p.insurance_provider || '—'}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
                        style={styles.btnDocs}
                      >
                        {selectedId === p.id ? 'Hide Docs' : 'Documents'}
                      </button>
                      {' '}
                      <button
                        onClick={() => handleDelete(p.id, `${p.first_name} ${p.last_name}`)}
                        style={styles.btnDelete}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      {selectedPatient && (
        <FileUpload
          patientId={selectedPatient.id}
          patientName={`${selectedPatient.first_name} ${selectedPatient.last_name}`}
        />
      )}
    </>
  );
}

const styles = {
  card:       { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)', marginBottom: 24 },
  header:     { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  heading:    { fontSize: 18, fontWeight: 600, color: '#2d3748' },
  badge:      { background: '#ebf8ff', color: '#2b6cb0', borderRadius: 12, padding: '2px 10px', fontSize: 13, fontWeight: 600 },
  search:     { width: '100%', padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 14, marginBottom: 14 },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th:         { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #e2e8f0', color: '#718096', fontWeight: 600, fontSize: 13 },
  tr:         { borderBottom: '1px solid #f7fafc', transition: 'background .1s' },
  trSelected: { background: '#ebf8ff' },
  td:         { padding: '10px', color: '#2d3748', verticalAlign: 'middle' },
  btnDocs:    { background: '#3182ce', color: '#fff', border: 'none', borderRadius: 5, padding: '5px 10px', cursor: 'pointer', fontSize: 13 },
  btnDelete:  { background: 'none', border: '1px solid #fc8181', color: '#e53e3e', borderRadius: 5, padding: '5px 10px', cursor: 'pointer', fontSize: 13 },
  error:      { background: '#fff5f5', border: '1px solid #fc8181', color: '#c53030', padding: '10px 14px', borderRadius: 6, marginBottom: 12, fontSize: 14 },
};
