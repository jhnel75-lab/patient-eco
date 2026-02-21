import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ───────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('patient');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const registerPatient = (data) => api.post('/auth/register', data);
export const loginPatient    = (data) => api.post('/auth/login', data);

// ── Patients ──────────────────────────────────────────────
export const getPatients   = () => api.get('/patients');
export const getPatient    = (id) => api.get(`/patients/${id}`);
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

// Download URL includes token as query param for <a href> links
export const getDownloadUrl = (docId) => {
  const token = localStorage.getItem('token');
  return `/api/documents/${docId}/download${token ? `?token=${token}` : ''}`;
};

export default api;
