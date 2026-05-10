import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Users, Briefcase, Calendar, Sparkles, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Notifications = ({ user }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    // Build real notifications from pending connections + jobs
    const token = localStorage.getItem('token');
    const h = { Authorization: `Bearer ${token}` };
    const base = [];

    try {
      const [pendingRes, jobsRes, matchRes] = await Promise.all([
        fetch('/api/connections/pending', { headers: h }),
        fetch('/api/jobs', { headers: h }),
        fetch('/api/matching/suggestions?mode=semantic', { headers: h }),
      ]);

      if (pendingRes.ok) {
        const d = await pendingRes.json();
        (d.pending || []).forEach((c, i) => {
          base.push({ id: `conn-${i}`, type: 'connection', title: 'New Connection Request', message: `${c.from_user} wants to connect with you`, time: 'Recently', unread: true, path: '/dashboard/network' });
        });
      }

      if (matchRes.ok) {
        const d = await matchRes.json();
        const top = (d.matches || []).slice(0, 2);
        top.forEach((m, i) => {
          base.push({ id: `match-${i}`, type: 'ai', title: 'New AI Match', message: `${m.full_name} — ${m.compatibility_score}% compatibility`, time: 'Just now', unread: true, path: '/dashboard/matches' });
        });
      }

      if (jobsRes.ok) {
        const d = await jobsRes.json();
        const top = (d.jobs || []).slice(0, 2);
        top.forEach((j, i) => {
          base.push({ id: `job-${i}`, type: 'job', title: 'Job Match Found', message: `${j.title} at ${j.company} — ${j.match_score || 80}% match`, time: 'Today', unread: i === 0, path: '/dashboard/jobs' });
        });
      }
    } catch (err) { console.error(err); }

    // Always add a few static ones so it's never empty
    base.push(
      { id: 'static-1', type: 'event', title: 'Upcoming Event', message: 'AI & Machine Learning Summit starts soon', time: '2 days', unread: false, path: '/dashboard/events' },
      { id: 'static-2', type: 'ai', title: 'AI Insight', message: 'Complete your profile to boost match rate by 40%', time: '1 day ago', unread: false, path: '/dashboard/profile' },
    );

    setNotifications(base);
  };

  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  const markAllRead = () => { setNotifications(prev => prev.map(n => ({ ...n, unread: false }))); toast.success('All marked as read'); };
  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const clearAll = () => { setNotifications([]); toast.success('All notifications cleared'); };

  const handleClick = (notif) => {
    markRead(notif.id);
    navigate(notif.path);
  };

  const iconMap = {
    connection: { icon: Users, color: 'var(--brand-teal)' },
    job: { icon: Briefcase, color: 'var(--brand-green)' },
    event: { icon: Calendar, color: '#a78bfa' },
    ai: { icon: Sparkles, color: '#f59e0b' },
  };

  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => n.unread) : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 800, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Notifications</h1>
          {unreadCount > 0 && (
            <span className="ds-badge ds-badge-teal">{unreadCount} new</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button className="ds-btn ds-btn-ghost" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={markAllRead}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="ds-btn ds-btn-ghost" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'unread', 'connection', 'job', 'event', 'ai'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: 8, background: filter === f ? 'var(--gradient-brand)' : 'var(--bg-elevated)', border: filter === f ? 'none' : '1px solid var(--border-subtle)', color: filter === f ? '#fff' : 'var(--text-secondary)', fontWeight: filter === f ? 600 : 400, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Bell size={48} style={{ marginBottom: 16 }} />
          <h3>No notifications</h3>
          <p style={{ fontSize: '0.875rem' }}>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence>
            {filtered.map((n, idx) => {
              const cfg = iconMap[n.type] || { icon: Bell, color: 'var(--text-muted)' };
              const Icon = cfg.icon;
              return (
                <motion.div key={n.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ delay: idx * 0.04 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: n.unread ? 'rgba(78,141,156,0.07)' : 'var(--bg-surface)', border: `1px solid ${n.unread ? 'var(--border-default)' : 'var(--border-subtle)'}`, borderRadius: 12, cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onClick={() => handleClick(n)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = n.unread ? 'var(--border-default)' : 'var(--border-subtle)'}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: `${cfg.color}15`, border: `1px solid ${cfg.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
                    <Icon size={17} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>{n.title}</h4>
                      {n.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-teal)', flexShrink: 0 }} />}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '2px 0 0' }}>{n.message}</p>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{n.time}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    {n.unread && (
                      <button onClick={() => markRead(n.id)} title="Mark as read"
                        style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(133,199,154,0.12)', border: '1px solid rgba(133,199,154,0.25)', color: 'var(--brand-green)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} />
                      </button>
                    )}
                    <button onClick={() => dismiss(n.id)} title="Dismiss"
                      style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Notifications;
