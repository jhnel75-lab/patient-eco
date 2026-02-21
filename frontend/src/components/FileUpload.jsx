import { useState, useRef } from 'react';
import { uploadDocument, getDocuments, deleteDocument, getDownloadUrl } from '../services/api';

const DOC_TYPES = ['general', 'consent_form', 'insurance', 'lab_result', 'referral', 'prescription', 'other'];

export default function FileUpload({ patientId, patientName }) {
  const [docs, setDocs]             = useState([]);
  const [loaded, setLoaded]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [docType, setDocType]       = useState('general');
  const [description, setDescription] = useState('');
  const [dragOver, setDragOver]     = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const fileRef = useRef();

  const loadDocs = async () => {
    try {
      const { data } = await getDocuments(patientId);
      setDocs(data.data);
      setLoaded(true);
    } catch {
      setError('Failed to load documents');
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError(''); setSuccess('');
    setUploading(true);
    try {
      await uploadDocument(patientId, file, docType, description);
      setSuccess(`"${file.name}" uploaded successfully`);
      setDescription('');
      loadDocs();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDelete = async (docId, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteDocument(docId);
      setDocs((prev) => prev.filter((d) => d.id !== docId));
    } catch {
      setError('Failed to delete document');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>Documents – {patientName}</h3>

      {error   && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* Upload Controls */}
      <div style={styles.controls}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Document Type</label>
          <select style={styles.select} value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 2 }}>
          <label style={styles.label}>Description</label>
          <input style={styles.input} placeholder="Optional description…"
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        style={{ ...styles.dropZone, ...(dragOver ? styles.dropZoneActive : {}) }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
      >
        <input ref={fileRef} type="file" style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
          onChange={(e) => handleFile(e.target.files[0])} />
        {uploading
          ? <p style={styles.dropText}>Uploading…</p>
          : <>
              <p style={styles.dropIcon}>📄</p>
              <p style={styles.dropText}>Drag & drop a file here, or <u>click to browse</u></p>
              <p style={styles.dropSub}>PDF, Word, TXT, Images — max 10 MB</p>
            </>
        }
      </div>

      {/* Document List */}
      {!loaded
        ? <button style={styles.btnSecondary} onClick={loadDocs}>Load Documents</button>
        : docs.length === 0
          ? <p style={{ color: '#718096', fontSize: 14, marginTop: 12 }}>No documents uploaded yet.</p>
          : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['File Name', 'Type', 'Size', 'Uploaded', ''].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id} style={styles.tr}>
                    <td style={styles.td}>{doc.original_name}</td>
                    <td style={styles.td}>{doc.document_type.replace(/_/g, ' ')}</td>
                    <td style={styles.td}>{formatSize(doc.file_size)}</td>
                    <td style={styles.td}>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <a href={getDownloadUrl(doc.id)} target="_blank" rel="noreferrer" style={styles.link}>Download</a>
                      {' | '}
                      <button onClick={() => handleDelete(doc.id, doc.original_name)} style={styles.btnDelete}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
      }
    </div>
  );
}

const styles = {
  card:        { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)', marginBottom: 24 },
  heading:     { fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#2d3748' },
  controls:    { display: 'flex', gap: 12, marginBottom: 12 },
  label:       { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#4a5568' },
  select:      { width: '100%', padding: '8px 10px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 14 },
  input:       { width: '100%', padding: '8px 10px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 14 },
  dropZone:    { border: '2px dashed #cbd5e0', borderRadius: 8, padding: '32px 16px', textAlign: 'center', cursor: 'pointer', marginTop: 8, transition: 'all .2s' },
  dropZoneActive: { borderColor: '#3182ce', background: '#ebf8ff' },
  dropIcon:    { fontSize: 32, marginBottom: 8 },
  dropText:    { fontSize: 14, color: '#4a5568' },
  dropSub:     { fontSize: 12, color: '#a0aec0', marginTop: 4 },
  table:       { width: '100%', borderCollapse: 'collapse', marginTop: 16, fontSize: 14 },
  th:          { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #e2e8f0', color: '#718096', fontWeight: 600, fontSize: 13 },
  tr:          { borderBottom: '1px solid #f7fafc' },
  td:          { padding: '10px 12px', color: '#2d3748' },
  link:        { color: '#3182ce', textDecoration: 'none' },
  btnDelete:   { background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: 13, padding: 0 },
  btnSecondary:{ marginTop: 12, background: '#edf2f7', border: '1px solid #cbd5e0', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 14 },
  error:       { background: '#fff5f5', border: '1px solid #fc8181', color: '#c53030', padding: '10px 14px', borderRadius: 6, marginBottom: 12, fontSize: 14 },
  success:     { background: '#f0fff4', border: '1px solid #68d391', color: '#276749', padding: '10px 14px', borderRadius: 6, marginBottom: 12, fontSize: 14 },
};
