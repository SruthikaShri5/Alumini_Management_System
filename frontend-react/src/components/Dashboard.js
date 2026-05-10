import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Sparkles, BarChart3, Briefcase,
  CalendarDays, Network, User, LogOut, Menu, X,
  TrendingUp, Star, Bell, Shield, Map, ChevronRight,
  Zap, Activity, MessageCircle, ClipboardList, Search, FileText
} from 'lucide-react';
import Home from './dashboard/Home';
import Matches from './dashboard/Matches';
import Analytics from './dashboard/Analytics';
import Jobs from './dashboard/Jobs';
import Events from './dashboard/Events';
import NetworkComp from './dashboard/Network';
import Profile from './dashboard/Profile';
import AdminPanel from './dashboard/AdminPanel';
import MentorshipHub from './dashboard/MentorshipHub';
import CareerAdvisor from './dashboard/CareerAdvisor';
import Notifications from './dashboard/Notifications';
import Messages from './dashboard/Messages';
import JobTracker from './dashboard/JobTracker';
import ResumeParser from './dashboard/ResumeParser';

// Smart Search Component
const SmartSearch = () => {
  const navigate = useNavigate();
  const [q, setQ] = React.useState('');
  const [results, setResults] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = async (val) => {
    setQ(val);
    if (!val.trim()) { setResults(null); setOpen(false); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setResults(d); setOpen(true); }
    } catch {}
  };

  const go = (path) => { navigate(path); setOpen(false); setQ(''); setResults(null); };

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '7px 14px' }}>
        <Search size={14} color="var(--text-muted)" />
        <input value={q} onChange={e => search(e.target.value)} placeholder="Search alumni, jobs, events..."
          style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.85rem', color: 'var(--text-primary)', width: '100%' }} />
      </div>
      {open && results && (
        <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 200, maxHeight: 360, overflowY: 'auto' }}>
          {results.users?.length > 0 && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>People</div>
              {results.users.slice(0,4).map(u => (
                <div key={u.email} onClick={() => go('/dashboard/matches')} style={{ padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="ds-avatar ds-avatar-sm">{(u.full_name||'U')[0]}</div>
                  <div><div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.full_name}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.role} · {u.sector}</div></div>
                </div>
              ))}
            </div>
          )}
          {results.jobs?.length > 0 && (
            <div style={{ padding: '8px 0', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Jobs</div>
              {results.jobs.slice(0,3).map(j => (
                <div key={j.id} onClick={() => go('/dashboard/jobs')} style={{ padding: '8px 14px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {j.title} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>at {j.company}</span>
                </div>
              ))}
            </div>
          )}
          {results.events?.length > 0 && (
            <div style={{ padding: '8px 0', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Events</div>
              {results.events.slice(0,3).map(e => (
                <div key={e.id} onClick={() => go('/dashboard/events')} style={{ padding: '8px 14px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', transition: 'background 0.15s' }}
                  onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                  {e.title}
                </div>
              ))}
            </div>
          )}
          {!results.users?.length && !results.jobs?.length && !results.events?.length && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No results for "{q}"</div>
          )}
        </div>
      )}
    </div>
  );
};

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ]
  },
  {
    label: 'Network',
    items: [
      { path: '/dashboard/matches', label: 'Alumni Mapping', icon: Map },
      { path: '/dashboard/network', label: 'My Network', icon: Network },
      { path: '/dashboard/messages', label: 'Messages', icon: MessageCircle },
      { path: '/dashboard/mentorship', label: 'Mentorship', icon: Star },
    ]
  },
  {
    label: 'Career',
    items: [
      { path: '/dashboard/career', label: 'Career Advisor', icon: TrendingUp },
      { path: '/dashboard/jobs', label: 'Job Board', icon: Briefcase },
      { path: '/dashboard/job-tracker', label: 'Job Tracker', icon: ClipboardList },
      { path: '/dashboard/events', label: 'Events', icon: CalendarDays },
    ]
  },
  {
    label: 'Insights',
    items: [
      { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    ]
  },
  {
    label: 'Account',
    items: [
      { path: '/dashboard/profile', label: 'Profile', icon: User },
      { path: '/dashboard/resume', label: 'Resume Parser', icon: FileText },
    ]
  }
];

const Dashboard = ({ user, onLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const adminGroup = user?.role === 'admin' ? [{
    label: 'Admin',
    items: [{ path: '/dashboard/admin', label: 'Admin Panel', icon: Shield }]
  }] : [];

  const allGroups = [...adminGroup, ...NAV_GROUPS];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-sans)' }}>

      {/* ---- Sidebar ---- */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          zIndex: 100,
          overflow: 'hidden',
        }}
        className="sidebar-desktop"
      >
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 64,
          flexShrink: 0,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--gradient-brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Network size={16} color="#fff" />
              </div>
              <span style={{
                fontSize: '1rem', fontWeight: 800,
                background: 'var(--gradient-brand)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                whiteSpace: 'nowrap',
              }}>RootsReconnect</span>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Network size={16} color="#fff" />
            </div>
          )}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <ChevronRight size={16} />
            </button>
          )}
          {collapsed && (
            <button onClick={() => setCollapsed(false)} style={{
              position: 'absolute', right: -12, top: 20,
              width: 24, height: 24, borderRadius: '50%',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChevronRight size={12} style={{ transform: 'rotate(180deg)' }} />
            </button>
          )}
        </div>

        {/* User Info */}
        {!collapsed && user && (
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="ds-avatar ds-avatar-md" style={{ flexShrink: 0 }}>
                {(user.full_name || 'U')[0].toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.full_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <span className="ds-badge ds-badge-teal" style={{ fontSize: '0.68rem', padding: '1px 7px' }}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
          {allGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: 4 }}>
              {!collapsed && (
                <div style={{
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--text-muted)',
                  padding: '10px 8px 4px',
                }}>
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const active = isActive(item.path, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: collapsed ? '10px 0' : '9px 10px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: 8,
                      marginBottom: 2,
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      transition: 'all 0.15s',
                      background: active ? 'rgba(78,141,156,0.12)' : 'transparent',
                      color: active ? 'var(--brand-teal)' : 'var(--text-secondary)',
                      border: active ? '1px solid rgba(78,141,156,0.25)' : '1px solid transparent',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'var(--bg-hover)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    {active && (
                      <div style={{
                        position: 'absolute', left: 0, top: '20%', bottom: '20%',
                        width: 3, borderRadius: '0 3px 3px 0',
                        background: 'var(--gradient-brand)',
                      }} />
                    )}
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          {!collapsed && (
            <div style={{
              background: 'rgba(78,141,156,0.08)',
              border: '1px solid var(--border-default)',
              borderRadius: 10, padding: '10px 12px', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Activity size={16} color="var(--brand-green)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Network Score</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>8.7 / 10</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Zap size={12} color="var(--brand-green)" />
                <span style={{ fontSize: '0.7rem', color: 'var(--brand-green)', fontWeight: 600 }}>+0.3</span>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            title={collapsed ? 'Sign Out' : undefined}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8,
              background: 'transparent',
              border: '1px solid transparent',
              color: 'var(--text-muted)',
              padding: collapsed ? '10px 0' : '9px 10px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <LogOut size={17} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99 }}
          />
        )}
      </AnimatePresence>

      {/* ---- Main Content ---- */}
      <div style={{
        flex: 1,
        marginLeft: collapsed ? 72 : 256,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.25s ease',
      }} className="main-area">

        {/* Top Bar */}
        <header style={{
          padding: '0 28px',
          height: 60,
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'rgba(250,246,239,0.92)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'none' }}
            className="mobile-menu-btn"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>RootsReconnect</span>
            <ChevronRight size={14} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {allGroups.flatMap(g => g.items).find(i => isActive(i.path, i.exact))?.label || 'Dashboard'}
            </span>
          </div>

          {/* Smart Search */}
          <SmartSearch />

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(196,149,106,0.12)',
              border: '1px solid rgba(196,149,106,0.28)',
              color: 'var(--brand-teal)',
              padding: '4px 12px', borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem', fontWeight: 600,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-teal)', display: 'inline-block' }} />
              AI Active
            </span>
            {user && (
              <div className="ds-avatar ds-avatar-sm" style={{ cursor: 'pointer' }}>
                {(user.full_name || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowX: 'hidden', color: 'var(--text-primary)' }}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              {user?.role === 'admin' && <Route path="/admin" element={<AdminPanel user={user} />} />}
              <Route path="/matches" element={<Matches user={user} />} />
              <Route path="/career" element={<CareerAdvisor user={user} />} />
              <Route path="/analytics" element={<Analytics user={user} />} />
              <Route path="/jobs" element={<Jobs user={user} />} />
              <Route path="/job-tracker" element={<JobTracker user={user} />} />
              <Route path="/events" element={<Events user={user} />} />
              <Route path="/mentorship" element={<MentorshipHub user={user} />} />
              <Route path="/notifications" element={<Notifications user={user} />} />
              <Route path="/network" element={<NetworkComp user={user} />} />
              <Route path="/messages" element={<Messages user={user} />} />
              <Route path="/resume" element={<ResumeParser user={user} />} />
              <Route path="/profile" element={<Profile user={user} />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { transform: translateX(-100%); }
          .sidebar-desktop.open { transform: translateX(0); }
          .main-area { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
