import { useState, useEffect } from 'react';
import PatientList from './components/PatientList';
import AuthPage from './components/AuthPage';
import api from './services/api';

export default function App() {
  const [patient, setPatient]     = useState(() => {
    const stored = localStorage.getItem('patient');
    return stored ? JSON.parse(stored) : null;
  });
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    api.get('/health')
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
  }, []);

  const handleAuth = (p) => setPatient(p);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('patient');
    setPatient(null);
  };

  if (!patient) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.title}>Patient Ecosystem</h1>
            <p style={styles.subtitle}>Local POC — Patient Management System</p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.statusWrap}>
              <span style={styles.statusDot(apiStatus)} />
              <span style={styles.statusText}>
                API {apiStatus === 'checking' ? 'connecting…' : apiStatus}
              </span>
            </div>
            <div style={styles.userWrap}>
              <span style={styles.userName}>
                {patient.first_name} {patient.last_name}
              </span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <span style={styles.navLabel}>My Profile</span>
        </div>
      </nav>

      {/* Main content */}
      <main style={styles.main}>
        <PatientList />
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>Patient Ecosystem POC &mdash; Local Development &mdash; Not for production use</p>
      </footer>
    </div>
  );
}

const styles = {
  root:        { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header:      { background: '#2b6cb0', color: '#fff', padding: '0 24px' },
  headerInner: { maxWidth: 1100, margin: '0 auto', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title:       { fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px' },
  subtitle:    { fontSize: 13, opacity: 0.75, marginTop: 2 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 24 },
  statusWrap:  { display: 'flex', alignItems: 'center', gap: 6 },
  statusDot:   (s) => ({ width: 10, height: 10, borderRadius: '50%', background: s === 'online' ? '#68d391' : s === 'offline' ? '#fc8181' : '#fbd38d' }),
  statusText:  { fontSize: 13, opacity: 0.9 },
  userWrap:    { display: 'flex', alignItems: 'center', gap: 10 },
  userName:    { fontSize: 14, fontWeight: 500 },
  logoutBtn:   { background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.4)', color: '#fff', borderRadius: 5, padding: '6px 12px', cursor: 'pointer', fontSize: 13 },
  nav:         { background: '#2c5282', borderBottom: '1px solid rgba(255,255,255,.1)' },
  navInner:    { maxWidth: 1100, margin: '0 auto', padding: '0 0' },
  navLabel:    { display: 'inline-block', color: '#fff', padding: '12px 20px', fontSize: 14, fontWeight: 500, borderBottom: '3px solid #63b3ed' },
  main:        { flex: 1, maxWidth: 1100, width: '100%', margin: '0 auto', padding: '24px 24px' },
  footer:      { background: '#edf2f7', borderTop: '1px solid #e2e8f0', padding: '12px 24px', textAlign: 'center', fontSize: 12, color: '#a0aec0' },
};
