import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Clock, TrendingUp, Sparkles, Filter, Bookmark, ExternalLink, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Jobs = ({ user }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: 'all', remote: false });
  const [savedJobs, setSavedJobs] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: '', type: 'Full-time', salary: '', remote: false, description: '', skills: '' });
  const [posting, setPosting] = useState(false);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/jobs', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const saveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      toast.success('Removed from saved');
    } else {
      setSavedJobs([...savedJobs, jobId]);
      toast.success('Job saved!');
    }
  };

  const applyJob = (job) => {
    toast.success(`Application submitted for ${job.title} at ${job.company}!`);
  };

  const getReferral = (job) => {
    toast.success(`Requesting referral from alumni at ${job.company}...`);
  };

  const viewDetails = (job) => {
    toast(`${job.title} at ${job.company}\n${job.description}`, { duration: 5000, icon: '📋' });
  };

  const postJob = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobForm,
          skills: jobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        toast.success('Job posted successfully!');
        setShowPostModal(false);
        setJobForm({ title: '', company: '', location: '', type: 'Full-time', salary: '', remote: false, description: '', skills: '' });
        fetchJobs();
      } else {
        const d = await res.json();
        toast.error(d.detail || 'Failed to post job');
      }
    } catch { toast.error('Failed to post job'); }
    setPosting(false);
  };

  const getMatchColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    return '#f59e0b';
  };

  const filteredJobs = jobs.filter(job => {
    if (filters.type !== 'all' && job.type !== filters.type) return false;
    if (filters.remote && !job.remote) return false;
    return true;
  });

  const canPost = user?.role === 'admin' || user?.role === 'alumni';

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Job Board</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.875rem' }}>
            {canPost ? 'Post jobs and help students find opportunities' : 'AI-matched opportunities from your alumni network'}
          </p>
        </div>
        {canPost && (
          <button className="ds-btn ds-btn-primary" onClick={() => setShowPostModal(true)}>
            <Plus size={16} /> Post a Job
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '8px 14px' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.875rem', cursor: 'pointer' }}>
            <option value="all">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={filters.remote} onChange={e => setFilters({ ...filters, remote: e.target.checked })} style={{ accentColor: 'var(--brand-teal)' }} />
          Remote Only
        </label>
        <button className="ds-btn ds-btn-ghost" style={{ padding: '8px 14px', fontSize: '0.875rem' }}
          onClick={() => setFilters({ type: 'all', remote: false })}>
          Reset
        </button>
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          {filteredJobs.length} jobs found
        </span>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[0,1,2].map(i => <div key={i} className="ds-skeleton" style={{ height: 180, borderRadius: 16 }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AnimatePresence>
            {filteredJobs.map((job, idx) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ delay: idx * 0.05 }}
                className="ds-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Logo */}
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {(job.company || 'C')[0]}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px' }}>{job.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>{job.company}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: getMatchColor(job.match_score || 75), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                          {job.match_score || 75}%
                        </div>
                        <button onClick={() => saveJob(job.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: savedJobs.includes(job.id) ? 'var(--brand-teal)' : 'var(--text-muted)', padding: 4 }}>
                          <Bookmark size={18} fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16, margin: '10px 0', flexWrap: 'wrap' }}>
                      {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><MapPin size={13} />{job.location}</span>}
                      {job.salary && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><DollarSign size={13} />{job.salary}</span>}
                      {job.posted && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><Clock size={13} />{job.posted}</span>}
                      {job.remote === 1 && <span className="ds-badge ds-badge-green">Remote</span>}
                      {job.type && <span className="ds-badge ds-badge-teal">{job.type}</span>}
                    </div>

                    {job.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 10px', lineHeight: 1.5 }}>{job.description}</p>}

                    {job.skills?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                        {job.skills.map(s => <span key={s} className="ds-tag ds-tag-teal">{s}</span>)}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="ds-btn ds-btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                        onClick={() => applyJob(job)}>
                        Apply Now
                      </button>
                      <button className="ds-btn ds-btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        onClick={() => getReferral(job)}>
                        <Sparkles size={14} /> Get Referral
                      </button>
                      <button className="ds-btn ds-btn-ghost" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        onClick={() => viewDetails(job)}>
                        <ExternalLink size={14} /> Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredJobs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Briefcase size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <h3 style={{ color: 'var(--text-secondary)' }}>No jobs match your filters</h3>
          <button className="ds-btn ds-btn-secondary" style={{ marginTop: 12 }} onClick={() => setFilters({ type: 'all', remote: false })}>Clear Filters</button>
        </div>
      )}

      {/* Post Job Modal */}
      {showPostModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Post a Job</h3>
              <button onClick={() => setShowPostModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={postJob} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['Job Title', 'title', 'text'], ['Company', 'company', 'text'], ['Location', 'location', 'text'], ['Salary', 'salary', 'text']].map(([label, name, type]) => (
                <div key={name}>
                  <label className="ds-label">{label}</label>
                  <input className="ds-input" type={type} required value={jobForm[name]} placeholder={label}
                    onChange={e => setJobForm({ ...jobForm, [name]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="ds-label">Type</label>
                <select className="ds-input" value={jobForm.type} onChange={e => setJobForm({ ...jobForm, type: e.target.value })}>
                  <option>Full-time</option><option>Contract</option><option>Internship</option><option>Part-time</option>
                </select>
              </div>
              <div>
                <label className="ds-label">Description</label>
                <textarea className="ds-input" rows={3} required value={jobForm.description} placeholder="Job description..."
                  onChange={e => setJobForm({ ...jobForm, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="ds-label">Skills (comma separated)</label>
                <input className="ds-input" value={jobForm.skills} placeholder="React, Python, AWS..."
                  onChange={e => setJobForm({ ...jobForm, skills: e.target.value })} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={jobForm.remote} onChange={e => setJobForm({ ...jobForm, remote: e.target.checked })} style={{ accentColor: 'var(--brand-teal)' }} />
                Remote position
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" className="ds-btn ds-btn-ghost" style={{ flex: 1 }} onClick={() => setShowPostModal(false)}>Cancel</button>
                <button type="submit" className="ds-btn ds-btn-primary" style={{ flex: 1 }} disabled={posting}>
                  {posting ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
