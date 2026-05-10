import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, Sparkles, X, User, Briefcase, Award, MapPin, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ResumeParser = ({ user, onProfileUpdated }) => {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  // Always read fresh token
  const getToken = () => localStorage.getItem('token');
  const isValidToken = () => {
    const t = getToken();
    return t && t.split('.').length === 3;
  };

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf')) { toast.error('Only PDF files supported'); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error('File too large (max 5MB)'); return; }
    setFile(f); setExtracted(null); setApplied(false);
  };

  const parseResume = async () => {
    if (!file) return;

    // Check token exists and looks like a real JWT (3 parts separated by dots)
    const token = localStorage.getItem('token');
    if (!token || token.split('.').length !== 3) {
      toast.error('Session expired. Please log out and log back in.');
      return;
    }

    setParsing(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (res.ok) {
        const d = await res.json();
        setExtracted(d.extracted);
        toast.success('Resume parsed successfully!');
      } else if (res.status === 401) {
        toast.error('Session expired. Please log out and log back in.');
        // Clear stale token
        localStorage.removeItem('token');
        localStorage.removeItem('rr_current_user');
        setTimeout(() => window.location.href = '/auth', 1500);
      } else {
        const d = await res.json();
        toast.error(d.detail || 'Failed to parse resume');
      }
    } catch { toast.error('Failed to parse resume'); }
    setParsing(false);
  };

  const applyToProfile = async () => {
    if (!extracted) return;
    setApplying(true);
    try {
      const res = await fetch('/api/resume/apply', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(extracted),
      });
      if (res.ok) {
        setApplied(true);
        toast.success('Profile updated from resume!');
        onProfileUpdated?.();
      } else toast.error('Failed to apply');
    } catch { toast.error('Failed to apply'); }
    setApplying(false);
  };

  const reset = () => { setFile(null); setExtracted(null); setApplied(false); };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Resume Parser</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Upload your PDF resume — AI extracts skills, experience & education to auto-fill your profile
          </p>
        </div>
        <span className="ds-badge ds-badge-teal" style={{ marginLeft: 'auto' }}><Sparkles size={11} /> AI Powered</span>
      </div>

      {/* Session warning */}
      {!isValidToken() && (
        <div style={{ background: 'rgba(180,60,60,0.1)', border: '1px solid rgba(180,60,60,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1rem' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <span style={{ color: '#b43c3c', fontWeight: 600, fontSize: '0.875rem' }}>Session expired. </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Please log out and log back in to use the resume parser.</span>
          </div>
          <button className="ds-btn ds-btn-danger" style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('rr_current_user'); window.location.href = '/auth'; }}>
            Re-login
          </button>
        </div>
      )}

      {/* Upload Zone */}
      {!extracted && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="ds-card"
          style={{
            border: `2px dashed ${dragOver ? 'var(--brand-teal)' : 'var(--border-default)'}`,
            background: dragOver ? 'rgba(196,149,106,0.06)' : 'var(--bg-surface)',
            textAlign: 'center', padding: '48px 32px', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(196,149,106,0.12)', border: '1px solid rgba(196,149,106,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--brand-teal)' }}>
            <Upload size={28} />
          </div>
          {file ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
                <FileText size={20} color="var(--brand-teal)" />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{file.name}</span>
                <button onClick={e => { e.stopPropagation(); reset(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          ) : (
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 6 }}>Drop your PDF resume here</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>or click to browse · PDF only · Max 5MB</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Parse Button */}
      {file && !extracted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
          <button className="ds-btn ds-btn-primary" style={{ padding: '12px 32px', fontSize: '1rem' }} onClick={parseResume} disabled={parsing}>
            {parsing ? (
              <><div className="ds-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analyzing with AI...</>
            ) : (
              <><Sparkles size={17} /> Parse Resume</>
            )}
          </button>
        </motion.div>
      )}

      {/* Parsing Progress */}
      <AnimatePresence>
        {parsing && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="ds-card" style={{ marginTop: 16, textAlign: 'center', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div className="ds-spinner" style={{ width: 36, height: 36 }} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>AI is reading your resume...</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>Extracting skills, experience, and education</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extracted Data */}
      <AnimatePresence>
        {extracted && !applied && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 14px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} color="#5A7A3C" /> Extracted from Resume
              </h2>
              <button className="ds-btn ds-btn-ghost" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={reset}>
                <RefreshCw size={13} /> Try another
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              {/* Identity */}
              <div className="ds-card">
                <div className="ds-section-header" style={{ marginBottom: 12 }}>
                  <span className="ds-section-title"><User size={14} /> Identity</span>
                </div>
                {[
                  { label: 'Name', value: extracted.full_name },
                  { label: 'Current Role', value: extracted.current_role },
                  { label: 'Company', value: extracted.company },
                  { label: 'Location', value: extracted.location },
                  { label: 'Sector', value: extracted.sector },
                  { label: 'Grad Year', value: extracted.graduation_year },
                ].map((f, i) => f.value ? (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, minWidth: 80, paddingTop: 2 }}>{f.label}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{f.value}</span>
                  </div>
                ) : null)}
              </div>

              {/* Bio */}
              <div className="ds-card">
                <div className="ds-section-header" style={{ marginBottom: 12 }}>
                  <span className="ds-section-title"><Briefcase size={14} /> Professional Summary</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  {extracted.bio || 'No summary extracted'}
                </p>
              </div>

              {/* Skills */}
              <div className="ds-card">
                <div className="ds-section-header" style={{ marginBottom: 12 }}>
                  <span className="ds-section-title"><Award size={14} /> Skills ({extracted.skills?.length || 0})</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {extracted.skills?.length > 0
                    ? extracted.skills.map((s, i) => <span key={i} className="ds-tag ds-tag-teal">{s}</span>)
                    : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No skills extracted</span>
                  }
                </div>
              </div>

              {/* Interests */}
              <div className="ds-card">
                <div className="ds-section-header" style={{ marginBottom: 12 }}>
                  <span className="ds-section-title"><MapPin size={14} /> Interests ({extracted.interests?.length || 0})</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {extracted.interests?.length > 0
                    ? extracted.interests.map((s, i) => <span key={i} className="ds-tag">{s}</span>)
                    : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No interests extracted</span>
                  }
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="ds-card" style={{ background: 'linear-gradient(135deg, rgba(196,149,106,0.1), rgba(166,124,82,0.06))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700 }}>Apply to your profile?</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.82rem' }}>
                  This will update your name, bio, skills, interests, role, company, and location
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <button className="ds-btn ds-btn-ghost" onClick={reset}>Discard</button>
                <button className="ds-btn ds-btn-primary" style={{ padding: '10px 24px' }} onClick={applyToProfile} disabled={applying}>
                  {applying ? 'Applying...' : <><CheckCircle size={15} /> Apply to Profile</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {applied && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="ds-card" style={{ textAlign: 'center', padding: '48px 32px', marginTop: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(90,122,60,0.12)', border: '1px solid rgba(90,122,60,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#5A7A3C' }}>
              <CheckCircle size={32} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Profile Updated!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.875rem' }}>
              Your profile has been auto-filled from your resume. Review it in the Profile section.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="ds-btn ds-btn-primary" onClick={() => window.location.href = '/dashboard/profile'}>View Profile</button>
              <button className="ds-btn ds-btn-ghost" onClick={reset}>Parse Another</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeParser;
