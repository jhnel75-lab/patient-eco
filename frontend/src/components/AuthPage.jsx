import { useState } from 'react';
import { loginPatient, registerPatient } from '../services/api';

export default function AuthPage({ onAuth }) {
  const [mode, setMode]     = useState('login'); // 'login' | 'register'
  const [form, setForm]     = useState({ first_name: '', last_name: '', date_of_birth: '', email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await loginPatient({ email: form.email, password: form.password });
      } else {
        res = await registerPatient({
          first_name: form.first_name,
          last_name:  form.last_name,
          date_of_birth: form.date_of_birth,
          email:    form.email,
          password: form.password,
        });
      }
      const { token, patient } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('patient', JSON.stringify(patient));
      onAuth(patient);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(''); };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h1 style={styles.appTitle}>Patient Ecosystem</h1>
        <p style={styles.appSub}>Secure Patient Self-Service Portal</p>

        {/* Tab switcher */}
        <div style={styles.tabs}>
          <button
            onClick={() => switchMode('login')}
            style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
          >
            Log In
          </button>
          <button
            onClick={() => switchMode('register')}
            style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'register' && (
            <>
              <div style={styles.row}>
                <div style={styles.fieldHalf}>
                  <label htmlFor="first_name" style={styles.label}>First Name</label>
                  <input id="first_name" style={styles.input} required value={form.first_name} onChange={set('first_name')} />
                </div>
                <div style={styles.fieldHalf}>
                  <label htmlFor="last_name" style={styles.label}>Last Name</label>
                  <input id="last_name" style={styles.input} required value={form.last_name} onChange={set('last_name')} />
                </div>
              </div>
              <div style={styles.field}>
                <label htmlFor="date_of_birth" style={styles.label}>Date of Birth</label>
                <input id="date_of_birth" style={styles.input} type="date" required value={form.date_of_birth} onChange={set('date_of_birth')} />
              </div>
            </>
          )}

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input id="email" style={styles.input} type="email" required value={form.email} onChange={set('email')} />
          </div>
          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input id="password" style={styles.input} type="password" required minLength={8} value={form.password} onChange={set('password')} />
            {mode === 'register' && <p style={styles.hint}>Minimum 8 characters</p>}
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" data-testid="auth-submit" disabled={loading} style={styles.submit}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay:   { minHeight: '100vh', background: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card:      { background: '#fff', borderRadius: 10, padding: '36px 40px', boxShadow: '0 4px 16px rgba(0,0,0,.1)', width: '100%', maxWidth: 440 },
  appTitle:  { textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#2b6cb0', marginBottom: 4 },
  appSub:    { textAlign: 'center', fontSize: 13, color: '#718096', marginBottom: 24 },
  tabs:      { display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: 24 },
  tab:       { flex: 1, background: 'none', border: 'none', padding: '10px 0', fontSize: 15, fontWeight: 500, color: '#718096', cursor: 'pointer', borderBottom: '3px solid transparent', marginBottom: -2 },
  tabActive: { color: '#2b6cb0', borderBottomColor: '#2b6cb0' },
  form:      { display: 'flex', flexDirection: 'column', gap: 14 },
  row:       { display: 'flex', gap: 12 },
  field:     { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldHalf: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  label:     { fontSize: 13, fontWeight: 600, color: '#4a5568' },
  input:     { padding: '9px 12px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 14, outline: 'none' },
  hint:      { fontSize: 12, color: '#a0aec0', margin: '2px 0 0' },
  error:     { background: '#fff5f5', border: '1px solid #fc8181', color: '#c53030', padding: '10px 14px', borderRadius: 6, fontSize: 14 },
  submit:    { marginTop: 4, background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: 6, padding: '11px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
};
