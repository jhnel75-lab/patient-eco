import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Patients ──────────────────────────────────────────────
export const getPatients = () => api.get('/patients');
export const getPatient  = (id) => api.get(`/patients/${id}`);
export const createPatient = (data) => api.post('/patients', data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/patients/${id}`);

// ── Documents ─────────────────────────────────────────────
export const getDocuments   = (patientId) => api.get(`/patients/${patientId}/documents`);
export const deleteDocument = (docId) => api.delete(`/documents/${docId}`);

export const uploadDocument = (patientId, file, documentType, description) => {
  const form = new FormData();
  form.append('document', file);
  form.append('document_type', documentType);
  form.append('description', description);
  return api.post(`/patients/${patientId}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getDownloadUrl = (docId) => `/api/documents/${docId}/download`;

export default api;
