import React, { useState, useEffect, lazy, Suspense, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App-dark.css';
import AIAvatar from './components/AIAvatar';
import OnboardingTour from './components/OnboardingTour';

const Landing = lazy(() => import('./components/Landing'));
const Auth = lazy(() => import('./components/Auth'));
const Dashboard = lazy(() => import('./components/Dashboard'));

// ---- Loading Fallback ----
const LoadingFallback = () => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    height: '100vh', gap: 16,
    background: 'var(--bg-base)',
  }}>
    <div style={{
      width: 40, height: 40,
      border: '3px solid var(--border-subtle)',
      borderTopColor: 'var(--brand-teal)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ---- Error Boundary ----
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', gap: 16, padding: 32,
          background: 'var(--bg-base)',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
          }}>⚠️</div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, textAlign: 'center', fontSize: '0.875rem' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{
              padding: '10px 24px', borderRadius: 10,
              background: 'linear-gradient(135deg, #4E8D9C, #85C79A)',
              border: 'none', color: '#fff', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---- App ----
// Global fetch interceptor — auto logout on 401
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const res = await originalFetch(...args);
  if (res.status === 401) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    // Don't intercept login/register endpoints
    if (!url.includes('/api/auth/')) {
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('rr_current_user');
        window.location.href = '/auth';
      }
    }
  }
  return res;
};

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('rr_current_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('rr_current_user');
      }
    }
  }, []);

  const handleLogin = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('rr_current_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('rr_current_user');
    window.location.href = '/';
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Landing />} />
              <Route path="/auth" element={token ? <Navigate to="/dashboard" /> : <Auth onLogin={handleLogin} />} />
              <Route path="/dashboard/*" element={token ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
            </Routes>
          </Suspense>
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-sans)',
            },
            success: { iconTheme: { primary: '#85C79A', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <AIAvatar />
        {token && user && <OnboardingTour user={user} />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
