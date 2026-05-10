import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Target, TrendingUp, MessageCircle, Award, Sparkles, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MentorshipHub = ({ user }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(user?.role === 'student' ? 'find-mentor' : 'mentor-students');
  const [requested, setRequested] = useState([]);

  useEffect(() => { fetchMatches(); }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/mentorship/matches', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const requestMentorship = async (id, name) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/mentorship/request', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentor_id: id, message: `Hi ${name}, I would love to connect and learn from your experience!` }),
      });
      setRequested(prev => [...prev, id]);
      toast.success(`Mentorship request sent to ${name}!`);
    } catch { toast.error('Failed to send request'); }
  };

  const acceptMentee = (id, name) => {
    setRequested(prev => [...prev, id]);
    toast.success(`You accepted ${name} as your mentee!`);
  };

  const scheduleSession = (name) => {
    toast.success(`Opening calendar to schedule a session with ${name}...`);
  };

  const tabs = user?.role === 'student'
    ? [{ id: 'find-mentor', label: 'Find a Mentor', icon: Users }]
    : [
        { id: 'find-mentor', label: 'Find a Mentor', icon: Users },
        { id: 'mentor-students', label: 'Mentor Students', icon: Target },
      ];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Award size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Mentorship Hub</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>AI-powered mentorship matching for career growth</p>
        </div>
        <span className="ds-badge ds-badge-green" style={{ marginLeft: 'auto' }}><Sparkles size={11} /> AI Matched</span>
      </div>

      {/* Banner */}
      <div className="ds-card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(78,141,156,0.12), rgba(133,199,154,0.08))', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Sparkles size={22} color="var(--brand-green)" />
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>AI Career Path Matching</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.85rem' }}>
            Our AI analyzes your goals, skills, and interests to find mentors who have walked your exact career path.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = view === tab.id;
          return (
            <button key={tab.id} onClick={() => setView(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, background: active ? 'var(--bg-surface)' : 'transparent', border: active ? '1px solid var(--border-default)' : '1px solid transparent', color: active ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: active ? 600 : 500, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[0,1,2].map(i => <div key={i} className="ds-skeleton" style={{ height: 220, borderRadius: 16 }} />)}
        </div>
      ) : matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Users size={48} style={{ marginBottom: 16 }} />
          <h3>No matches found yet</h3>
          <p style={{ fontSize: '0.875rem' }}>Complete your profile to get better matches</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {matches.map((m, idx) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
              className="ds-card">
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div className="ds-avatar ds-avatar-md">{(m.name || 'U')[0]}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{m.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '2px 0 0' }}>
                    {m.position || m.role} {m.company ? `at ${m.company}` : ''}
                  </p>
                </div>
                <span className="ds-badge ds-badge-teal" style={{ fontSize: '0.68rem' }}>{m.match_score}%</span>
              </div>

              {/* Skills */}
              {m.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {m.skills.slice(0, 4).map(s => <span key={s} className="ds-tag ds-tag-teal">{s}</span>)}
                </div>
              )}

              {/* Stats */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-green)' }}>
                  <Award size={13} /> {m.success_rate || 90}% success
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                  <TrendingUp size={13} /> {m.experience_years || 0}y exp
                </span>
              </div>

              {/* Actions */}
              {requested.includes(m.id) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(133,199,154,0.1)', border: '1px solid rgba(133,199,154,0.25)', borderRadius: 10, color: 'var(--brand-green)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <CheckCircle size={16} /> Request Sent
                </div>
              ) : view === 'find-mentor' ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="ds-btn ds-btn-primary" style={{ flex: 1, padding: '9px', fontSize: '0.82rem' }}
                    onClick={() => requestMentorship(m.id, m.name)}>
                    <MessageCircle size={14} /> Request
                  </button>
                  <button className="ds-btn ds-btn-ghost" style={{ padding: '9px 14px', fontSize: '0.82rem' }}
                    onClick={() => scheduleSession(m.name)}>
                    Schedule
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="ds-btn ds-btn-primary" style={{ flex: 1, padding: '9px', fontSize: '0.82rem' }}
                    onClick={() => acceptMentee(m.id, m.name)}>
                    <CheckCircle size={14} /> Accept
                  </button>
                  <button className="ds-btn ds-btn-ghost" style={{ padding: '9px 14px', fontSize: '0.82rem' }}
                    onClick={() => scheduleSession(m.name)}>
                    Schedule
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorshipHub;
