import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Briefcase, Award, Target, TrendingUp, Edit2, Save,
  Globe, Linkedin, Github, Twitter, Mail, Phone, MapPin,
  Calendar, X, CheckCircle, Camera, Eye, Users, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = ({ user }) => {
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    sector: user?.sector || 'technology',
    graduation_year: user?.graduation_year || 2020,
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    location: user?.location || '',
    phone: user?.phone || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    twitter: user?.twitter || '',
    website: user?.website || '',
    current_role: user?.current_role || user?.position || '',
    company: user?.company || '',
  });
  const [profileScore, setProfileScore] = useState(0);

  useEffect(() => { calcScore(); }, [profileData]);

  const calcScore = () => {
    let s = 0;
    if (profileData.full_name) s += 10;
    if (profileData.bio) s += 15;
    if (profileData.skills) s += 20;
    if (profileData.interests) s += 15;
    if (profileData.location) s += 10;
    if (profileData.linkedin) s += 10;
    if (profileData.current_role) s += 20;
    setProfileScore(s);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        ...profileData,
        skills: profileData.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: profileData.interests.split(',').map(i => i.trim()).filter(Boolean),
      };
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (res.ok) { toast.success('Profile updated!'); setEditing(false); }
      else { toast.error('Failed to update profile'); }
    } catch { toast.error('Failed to update profile'); }
  };

  const handleChange = e => setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const skills = profileData.skills.split(',').map(s => s.trim()).filter(Boolean);
  const interests = profileData.interests.split(',').map(i => i.trim()).filter(Boolean);

  const completionTips = [
    { done: !!profileData.bio, label: 'Add a bio', points: 15 },
    { done: skills.length > 0, label: 'List your skills', points: 20 },
    { done: !!profileData.linkedin, label: 'Connect LinkedIn', points: 10 },
    { done: !!profileData.current_role, label: 'Add current role', points: 20 },
    { done: !!profileData.location, label: 'Add location', points: 10 },
  ];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Profile Header Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="ds-card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>

        {/* Banner */}
        <div style={{
          height: 120,
          background: 'linear-gradient(135deg, rgba(78,141,156,0.3) 0%, rgba(133,199,154,0.2) 100%)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(78,141,156,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(133,199,154,0.15) 0%, transparent 50%)',
          }} />
          {/* Profile Score */}
          <div style={{
            position: 'absolute', top: 16, right: 20,
            background: 'rgba(8,12,20,0.7)', backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-default)',
            borderRadius: 12, padding: '8px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ position: 'relative', width: 40, height: 40 }}>
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="url(#scoreGrad)" strokeWidth="3"
                  strokeDasharray={`${(profileScore / 100) * 100.5} 100.5`}
                  strokeLinecap="round" transform="rotate(-90 20 20)" />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4E8D9C" />
                    <stop offset="100%" stopColor="#85C79A" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {profileScore}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Profile</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Strength</div>
            </div>
          </div>
        </div>

        {/* Main Info */}
        <div style={{ padding: '0 24px 24px', position: 'relative' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', display: 'inline-block', marginTop: -36, marginBottom: 12 }}>
            <div className="ds-avatar ds-avatar-xl" style={{
              border: '3px solid var(--bg-surface)',
              fontSize: '2rem',
            }}>
              {(user?.full_name || 'U')[0].toUpperCase()}
            </div>
            {editing && (
              <button style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--gradient-brand)',
                border: '2px solid var(--bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}>
                <Camera size={12} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ flex: 1 }}>
              {editing ? (
                <input name="full_name" value={profileData.full_name} onChange={handleChange}
                  className="ds-input" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8, padding: '8px 12px' }} />
              ) : (
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>{profileData.full_name}</h2>
              )}
              {editing ? (
                <input name="current_role" value={profileData.current_role} onChange={handleChange}
                  className="ds-input" placeholder="Current Role" style={{ marginBottom: 10, padding: '7px 12px' }} />
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 10 }}>
                  {profileData.current_role || 'Add your current role'}
                  {profileData.company && ` at ${profileData.company}`}
                </p>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="ds-badge ds-badge-teal"><Briefcase size={10} /> {profileData.sector}</span>
                <span className="ds-badge ds-badge-teal"><Calendar size={10} /> Class of {profileData.graduation_year}</span>
                {profileData.location && <span className="ds-badge ds-badge-teal"><MapPin size={10} /> {profileData.location}</span>}
                <span className="ds-badge ds-badge-green"><Star size={10} /> {user?.role}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {editing ? (
                <>
                  <button className="ds-btn ds-btn-primary" onClick={handleSave} style={{ gap: 6 }}>
                    <Save size={15} /> Save
                  </button>
                  <button className="ds-btn ds-btn-ghost" onClick={() => setEditing(false)}>
                    <X size={15} />
                  </button>
                </>
              ) : (
                <button className="ds-btn ds-btn-secondary" onClick={() => setEditing(true)}>
                  <Edit2 size={15} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* About */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="ds-card">
          <div className="ds-section-header">
            <span className="ds-section-title"><User size={15} /> About</span>
          </div>
          {editing ? (
            <textarea name="bio" value={profileData.bio} onChange={handleChange}
              placeholder="Tell your story..." rows={4}
              className="ds-input" style={{ resize: 'vertical', lineHeight: 1.6 }} />
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
              {profileData.bio || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Add a bio to tell your story</span>}
            </p>
          )}
        </motion.div>

        {/* Career Stats */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="ds-card">
          <div className="ds-section-header">
            <span className="ds-section-title"><TrendingUp size={15} /> Career Impact</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { icon: Eye, label: 'Profile Views', value: '234', color: 'var(--brand-teal)' },
              { icon: Users, label: 'Connections', value: '42', color: 'var(--brand-green)' },
              { icon: Award, label: 'Endorsements', value: '15', color: '#f59e0b' },
              { icon: Star, label: 'Referrals Given', value: '8', color: '#a78bfa' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${s.color}15`, border: `1px solid ${s.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: s.color, flexShrink: 0,
                  }}>
                    <Icon size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="ds-card">
          <div className="ds-section-header">
            <span className="ds-section-title"><Award size={15} /> Skills & Expertise</span>
          </div>
          {editing ? (
            <textarea name="skills" value={profileData.skills} onChange={handleChange}
              placeholder="Python, React, Machine Learning..." rows={3}
              className="ds-input" style={{ resize: 'vertical' }} />
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills.length > 0
                ? skills.map((s, i) => <span key={i} className="ds-tag ds-tag-teal">{s}</span>)
                : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>Add your skills</span>
              }
            </div>
          )}
        </motion.div>

        {/* Interests */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="ds-card">
          <div className="ds-section-header">
            <span className="ds-section-title"><Target size={15} /> Interests & Goals</span>
          </div>
          {editing ? (
            <textarea name="interests" value={profileData.interests} onChange={handleChange}
              placeholder="AI, Startups, Mentorship..." rows={3}
              className="ds-input" style={{ resize: 'vertical' }} />
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {interests.length > 0
                ? interests.map((s, i) => <span key={i} className="ds-tag">{s}</span>)
                : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>Add your interests</span>
              }
            </div>
          )}
        </motion.div>

        {/* Contact & Social */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="ds-card" style={{ gridColumn: '1 / -1' }}>
          <div className="ds-section-header">
            <span className="ds-section-title"><Globe size={15} /> Contact & Social</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { icon: Mail, name: 'email', value: user?.email, label: 'Email', disabled: true },
              { icon: Phone, name: 'phone', value: profileData.phone, label: 'Phone', placeholder: '+1 (555) 000-0000' },
              { icon: MapPin, name: 'location', value: profileData.location, label: 'Location', placeholder: 'City, Country' },
              { icon: Linkedin, name: 'linkedin', value: profileData.linkedin, label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
              { icon: Github, name: 'github', value: profileData.github, label: 'GitHub', placeholder: 'github.com/...' },
              { icon: Twitter, name: 'twitter', value: profileData.twitter, label: 'Twitter', placeholder: '@username' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                }}>
                  <Icon size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  {editing && !f.disabled ? (
                    <input name={f.name} value={f.value} onChange={handleChange}
                      placeholder={f.placeholder}
                      className="ds-input" style={{ border: 'none', background: 'transparent', padding: '0', fontSize: '0.82rem', flex: 1 }} />
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: f.value ? 'var(--text-secondary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.value || f.placeholder || `Add ${f.label}`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Completion Tips */}
        {profileScore < 100 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="ds-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(78,141,156,0.08), rgba(133,199,154,0.05))' }}>
            <div className="ds-section-header">
              <span className="ds-section-title"><CheckCircle size={15} /> Complete Your Profile</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unlock more opportunities</span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {completionTips.filter(t => !t.done).map((tip, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                  onClick={() => setEditing(true)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-teal)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tip.label}</span>
                  <span className="ds-badge ds-badge-green" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>+{tip.points}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
