import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Briefcase, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STAGES = ['applied', 'interview', 'offer', 'rejected'];
const STAGE_CONFIG = {
  applied:   { label: 'Applied',    color: 'var(--brand-teal)',  icon: Clock },
  interview: { label: 'Interview',  color: '#8B6020',            icon: TrendingUp },
  offer:     { label: 'Offer',      color: '#5A7A3C',            icon: CheckCircle },
  rejected:  { label: 'Rejected',   color: '#b43c3c',            icon: XCircle },
};

const JobTracker = ({ user }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ job_title: '', company: '', status: 'applied', notes: '', job_url: '' });
  const token = localStorage.getItem('token');
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchApps(); }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/job-tracker', { headers: h });
      if (res.ok) { const d = await res.json(); setApps(d.applications || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openAdd = () => { setEditing(null); setForm({ job_title: '', company: '', status: 'applied', notes: '', job_url: '' }); setShowModal(true); };
  const openEdit = (app) => { setEditing(app); setForm({ job_title: app.job_title, company: app.company, status: app.status, notes: app.notes || '', job_url: app.job_url || '' }); setShowModal(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const res = await fetch(`/api/job-tracker/${editing.id}`, { method: 'PUT', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (res.ok) { toast.success('Updated!'); fetchApps(); setShowModal(false); }
      } else {
        const res = await fetch('/api/job-tracker', { method: 'POST', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (res.ok) { toast.success('Application tracked!'); fetchApps(); setShowModal(false); }
      }
    } catch { toast.error('Failed to save'); }
  };

  const deleteApp = async (id) => {
    if (!window.confirm('Remove this application?')) return;
    try {
      await fetch(`/api/job-tracker/${id}`, { method: 'DELETE', headers: h });
      toast.success('Removed'); fetchApps();
    } catch { toast.error('Failed'); }
  };

  const updateStatus = async (app, status) => {
    try {
      await fetch(`/api/job-tracker/${app.id}`, { method: 'PUT', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...app, status }) });
      fetchApps();
    } catch { }
  };

  const byStage = (stage) => apps.filter(a => a.status === stage);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Job Application Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.875rem' }}>Track every application in one place</p>
        </div>
        <button className="ds-btn ds-btn-primary" onClick={openAdd}><Plus size={15} /> Add Application</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {STAGES.map(s => {
          const cfg = STAGE_CONFIG[s]; const Icon = cfg.icon; const count = byStage(s).length;
          return (
            <div key={s} className="ds-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: `${cfg.color}15`, border: `1px solid ${cfg.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color }}>
                <Icon size={17} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{cfg.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {STAGES.map(s => <div key={s} className="ds-skeleton" style={{ height: 200, borderRadius: 16 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {STAGES.map(stage => {
            const cfg = STAGE_CONFIG[stage];
            return (
              <div key={stage} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{cfg.label}</span>
                  <span className="ds-badge" style={{ marginLeft: 'auto', background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}25`, fontSize: '0.68rem' }}>{byStage(stage).length}</span>
                </div>
                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
                  <AnimatePresence>
                    {byStage(stage).map(app => (
                      <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{app.job_title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{app.company}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{app.applied_date}</div>
                            {app.notes && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>{app.notes}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                            <button onClick={() => openEdit(app)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}><Edit2 size={13} /></button>
                            <button onClick={() => deleteApp(app.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b43c3c', padding: 2 }}><Trash2 size={13} /></button>
                          </div>
                        </div>
                        {/* Move buttons */}
                        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                          {STAGES.filter(s => s !== stage).map(s => (
                            <button key={s} onClick={() => updateStatus(app, s)}
                              style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 6, background: `${STAGE_CONFIG[s].color}12`, border: `1px solid ${STAGE_CONFIG[s].color}25`, color: STAGE_CONFIG[s].color, cursor: 'pointer', fontFamily: 'inherit' }}>
                              → {STAGE_CONFIG[s].label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {byStage(stage).length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', padding: '1rem 0' }}>No applications</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,43,31,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>{editing ? 'Edit Application' : 'Track Application'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="ds-label">Job Title</label><input className="ds-input" required value={form.job_title} onChange={e => setForm({...form, job_title: e.target.value})} placeholder="Software Engineer" /></div>
              <div><label className="ds-label">Company</label><input className="ds-input" required value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Google" /></div>
              <div><label className="ds-label">Status</label>
                <select className="ds-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  {STAGES.map(s => <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>)}
                </select>
              </div>
              <div><label className="ds-label">Job URL (optional)</label><input className="ds-input" value={form.job_url} onChange={e => setForm({...form, job_url: e.target.value})} placeholder="https://..." /></div>
              <div><label className="ds-label">Notes</label><textarea className="ds-input" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Interview date, contact person..." style={{ resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="ds-btn ds-btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="ds-btn ds-btn-primary" style={{ flex: 1 }}>{editing ? 'Update' : 'Track'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default JobTracker;
