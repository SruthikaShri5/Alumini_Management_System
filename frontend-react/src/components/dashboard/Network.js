import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, UserCheck, UserX, MessageCircle, Search, TrendingUp, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Network = ({ user }) => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [view, setView] = useState('connections');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchConnections(), fetchPending(), fetchSuggestions()]);
    setLoading(false);
  };

  // Fetch accepted connections
  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/connections/accepted', { headers: h });
      if (res.ok) {
        const data = await res.json();
        // Enrich each connection with the other user's profile
        const enriched = await Promise.all((data.connections || []).map(async (c) => {
          const otherEmail = c.other_user;
          const uRes = await fetch(`/api/users/${otherEmail}`, { headers: h }).catch(() => null);
          const u = uRes?.ok ? await uRes.json() : {};
          return {
            id: c.id,
            email: otherEmail,
            name: u.full_name || otherEmail,
            title: u.current_role || u.position || '',
            company: u.company || '',
            sector: u.sector || '',
            graduationYear: u.graduation_year || '',
            role: u.role || '',
            avatar: (u.full_name || otherEmail || 'U')[0].toUpperCase(),
            lastInteraction: 'Connected',
          };
        }));
        setConnections(enriched);
      }
    } catch (e) { console.error(e); }
  };

  // Fetch pending requests directed TO current user
  const fetchPending = async () => {
    try {
      const res = await fetch('/api/connections/pending', { headers: h });
      if (res.ok) {
        const data = await res.json();
        const enriched = await Promise.all((data.pending || []).map(async (c) => {
          const uRes = await fetch(`/api/users/${c.from_user}`, { headers: h }).catch(() => null);
          const u = uRes?.ok ? await uRes.json() : {};
          return {
            id: c.id,
            email: c.from_user,
            name: u.full_name || c.from_user,
            title: u.current_role || u.position || '',
            company: u.company || '',
            sector: u.sector || '',
            graduationYear: u.graduation_year || '',
            role: u.role || '',
            avatar: (u.full_name || c.from_user || 'U')[0].toUpperCase(),
          };
        }));
        setPending(enriched);
      }
    } catch (e) { console.error(e); }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/matching/suggestions?mode=semantic', { headers: h });
      if (res.ok) {
        const data = await res.json();
        setSuggestions((data.matches || []).slice(0, 8).map(m => ({
          id: m.user_id,
          name: m.full_name,
          title: m.position || m.current_role || '',
          company: m.company || '',
          sector: m.sector,
          graduationYear: m.graduation_year,
          matchScore: m.compatibility_score,
          avatar: (m.full_name || 'U')[0].toUpperCase(),
        })));
      }
    } catch (e) { console.error(e); }
  };

  const acceptConnection = async (id, req) => {
    try {
      const res = await fetch('/api/connections/accept', {
        method: 'PUT',
        headers: { ...h, 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: id })
      });
      if (res.ok) {
        // Move from pending to connections
        setConnections(prev => [...prev, { ...req, lastInteraction: 'Just now' }]);
        setPending(prev => prev.filter(p => p.id !== id));
        toast.success(`Connected with ${req.name}!`);
      } else {
        const d = await res.json();
        toast.error(d.detail || 'Failed to accept');
      }
    } catch { toast.error('Failed to accept connection'); }
  };

  const declineConnection = async (id) => {
    setPending(prev => prev.filter(p => p.id !== id));
    toast.success('Request declined');
  };

  const sendRequest = async (id, name) => {
    try {
      const res = await fetch('/api/connections/request', {
        method: 'POST',
        headers: { ...h, 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: id })
      });
      if (res.ok) {
        setSuggestions(prev => prev.filter(s => s.id !== id));
        toast.success(`Request sent to ${name}!`);
      } else {
        const d = await res.json();
        toast.error(d.detail || 'Failed to send request');
      }
    } catch { toast.error('Failed to send request'); }
  };

  const messageUser = (email, name) => {
    navigate('/dashboard/messages');
    toast.success(`Opening chat with ${name}...`);
  };

  const filtered = connections.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  const tabBtn = (active) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '9px 18px', borderRadius: 8,
    background: active ? 'var(--bg-surface)' : 'transparent',
    border: active ? '1px solid var(--border-default)' : '1px solid transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    fontWeight: active ? 600 : 400, fontSize: '0.875rem',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>My Network</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.875rem' }}>
            Manage your professional connections
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '8px 14px' }}>
            <UserCheck size={15} color="var(--brand-teal)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{connections.length} Connections</span>
          </div>
          {pending.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(196,149,106,0.12)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '8px 14px' }}>
              <UserPlus size={15} color="var(--brand-teal)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-teal)' }}>{pending.length} Pending</span>
            </div>
          )}
          <button className="ds-btn ds-btn-ghost" style={{ padding: '8px 12px' }} onClick={fetchAll} title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        <button style={tabBtn(view === 'connections')} onClick={() => setView('connections')}>
          <UserCheck size={15} /> Connections ({connections.length})
        </button>
        <button style={{ ...tabBtn(view === 'pending'), position: 'relative' }} onClick={() => setView('pending')}>
          <UserPlus size={15} /> Pending ({pending.length})
          {pending.length > 0 && (
            <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#b43c3c' }} />
          )}
        </button>
        <button style={tabBtn(view === 'suggestions')} onClick={() => setView('suggestions')}>
          <TrendingUp size={15} /> Suggestions ({suggestions.length})
        </button>
      </div>

      {/* Search */}
      {view === 'connections' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '10px 16px', marginBottom: 20 }}>
          <Search size={16} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or company..."
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', width: '100%' }} />
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
          {[0,1,2,3].map(i => <div key={i} className="ds-skeleton" style={{ height: 180, borderRadius: 16 }} />)}
        </div>
      ) : (
        <>
          {/* ── Connections ── */}
          {view === 'connections' && (
            filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <Users size={48} style={{ marginBottom: 12 }} />
                <h3>No connections yet</h3>
                <p style={{ fontSize: '0.875rem', marginBottom: 16 }}>
                  {user?.role === 'student'
                    ? 'Send connection requests to alumni from the Alumni Mapping page'
                    : 'Connect with peers from the Suggestions tab'}
                </p>
                <button className="ds-btn ds-btn-primary" onClick={() => navigate('/dashboard/matches')}>
                  Find Alumni
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                {filtered.map((c, i) => (
                  <motion.div key={c.id || i}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="ds-card"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 16px' }}>
                    <div className="ds-avatar ds-avatar-lg" style={{ marginBottom: 10 }}>{c.avatar}</div>
                    <h4 style={{ margin: '0 0 4px', fontWeight: 700 }}>{c.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 2px' }}>{c.title}</p>
                    <p style={{ color: 'var(--brand-teal)', fontSize: '0.82rem', fontWeight: 600, margin: '0 0 4px' }}>{c.company}</p>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                      <span className="ds-badge ds-badge-teal">Class of {c.graduationYear}</span>
                      {c.role && <span className="ds-badge ds-badge-green">{c.role}</span>}
                    </div>
                    <button className="ds-btn ds-btn-primary"
                      style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }}
                      onClick={() => messageUser(c.email, c.name)}>
                      <MessageCircle size={14} /> Message
                    </button>
                  </motion.div>
                ))}
              </div>
            )
          )}

          {/* ── Pending ── */}
          {view === 'pending' && (
            pending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <UserPlus size={48} style={{ marginBottom: 12 }} />
                <h3>No pending requests</h3>
                <p style={{ fontSize: '0.875rem' }}>You're all caught up!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pending.map((req, i) => (
                  <motion.div key={req.id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="ds-card"
                    style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="ds-avatar ds-avatar-md">{req.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 3px', fontWeight: 700 }}>{req.name}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
                        {req.title}{req.company ? ` at ${req.company}` : ''}
                      </p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        {req.role && <span className="ds-badge ds-badge-teal">{req.role}</span>}
                        {req.sector && <span className="ds-badge ds-badge-yellow">{req.sector}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="ds-btn ds-btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                        onClick={() => acceptConnection(req.id, req)}>
                        <UserCheck size={14} /> Accept
                      </button>
                      <button className="ds-btn ds-btn-danger"
                        style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                        onClick={() => declineConnection(req.id)}>
                        <UserX size={14} /> Decline
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}

          {/* ── Suggestions ── */}
          {view === 'suggestions' && (
            suggestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <TrendingUp size={48} style={{ marginBottom: 12 }} />
                <h3>No suggestions</h3>
                <p style={{ fontSize: '0.875rem' }}>Complete your profile to get better matches</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                {suggestions.map((s, i) => (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="ds-card"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 16px', position: 'relative' }}>
                    <span className="ds-badge ds-badge-teal"
                      style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.68rem' }}>
                      {s.matchScore}% Match
                    </span>
                    <div className="ds-avatar ds-avatar-lg" style={{ marginBottom: 10 }}>{s.avatar}</div>
                    <h4 style={{ margin: '0 0 4px', fontWeight: 700 }}>{s.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 2px' }}>{s.title}</p>
                    <p style={{ color: 'var(--brand-teal)', fontSize: '0.82rem', fontWeight: 600, margin: '0 0 4px' }}>{s.company}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                      Class of {s.graduationYear} · {s.sector}
                    </span>
                    <button className="ds-btn ds-btn-primary"
                      style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }}
                      onClick={() => sendRequest(s.id, s.name)}>
                      <UserPlus size={14} /> Connect
                    </button>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default Network;
