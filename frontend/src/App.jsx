import { useState, useEffect } from 'react';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import api from './services/api';

const TABS = ['Register Patient', 'Patient Registry'];

export default function App() {
  const [tab, setTab]           = useState(0);
  const [refresh, setRefresh]   = useState(0);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    api.get('/health')
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
  }, []);

  const handlePatientAdded = () => {
    setRefresh((r) => r + 1);
    setTab(1);
  };

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.title}>Patient Ecosystem</h1>
            <p style={styles.subtitle}>Local POC — Patient Management System</p>
          </div>
          <div style={styles.statusWrap}>
            <span style={styles.statusDot(apiStatus)} />
            <span style={styles.statusText}>
              API {apiStatus === 'checking' ? 'connecting…' : apiStatus}
            </span>
          </div>
        </div>
      </header>

      {/* Nav tabs */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          {TABS.map((label, i) => (
            <button key={label} onClick={() => setTab(i)}
              style={{ ...styles.navBtn, ...(tab === i ? styles.navBtnActive : {}) }}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main style={styles.main}>
        {tab === 0 && (
          <PatientForm onPatientAdded={handlePatientAdded} />
        )}
        {tab === 1 && (
          <PatientList refreshTrigger={refresh} />
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>Patient Ecosystem POC &mdash; Local Development &mdash; Not for production use</p>
      </footer>
    </div>
  );
}

const styles = {
  root:          { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header:        { background: '#2b6cb0', color: '#fff', padding: '0 24px' },
  headerInner:   { maxWidth: 1100, margin: '0 auto', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title:         { fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px' },
  subtitle:      { fontSize: 13, opacity: 0.75, marginTop: 2 },
  statusWrap:    { display: 'flex', alignItems: 'center', gap: 6 },
  statusDot:     (s) => ({ width: 10, height: 10, borderRadius: '50%', background: s === 'online' ? '#68d391' : s === 'offline' ? '#fc8181' : '#fbd38d' }),
  statusText:    { fontSize: 13, opacity: 0.9 },
  nav:           { background: '#2c5282', borderBottom: '1px solid rgba(255,255,255,.1)' },
  navInner:      { maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 2, padding: '0 0' },
  navBtn:        { background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', padding: '12px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 500, borderBottom: '3px solid transparent', transition: 'all .2s' },
  navBtnActive:  { color: '#fff', borderBottomColor: '#63b3ed' },
  main:          { flex: 1, maxWidth: 1100, width: '100%', margin: '0 auto', padding: '24px 24px' },
  footer:        { background: '#edf2f7', borderTop: '1px solid #e2e8f0', padding: '12px 24px', textAlign: 'center', fontSize: 12, color: '#a0aec0' },
};
