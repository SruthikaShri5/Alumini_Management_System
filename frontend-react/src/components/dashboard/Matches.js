import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Target, Brain, Zap, Users, MessageCircle, UserPlus, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Matches = ({ user }) => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [aiMode, setAiMode] = useState('semantic');
  const [connected, setConnected] = useState([]);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [aiMsg, setAiMsg] = useState('');
  const [generatingMsg, setGeneratingMsg] = useState(false);
  const token = localStorage.getItem('token');
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchMatches(); fetchInsights(); }, [aiMode]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/matching/suggestions?mode=${aiMode}`, { headers: h });
      if (res.ok) { const d = await res.json(); setMatches(d.matches || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch('/api/matching/insights', { headers: h });
      if (res.ok) { const d = await res.json(); setInsights(d); }
    } catch (e) { console.error(e); }
  };

  const sendConnection = async (userId, name) => {
    setConnected(prev => [...prev, userId]);
    toast.success(`Request sent to ${name}!`);
    try { await fetch('/api/connections/request', { method:'POST', headers:{ ...h,'Content-Type':'application/json' }, body: JSON.stringify({ target_user_id: userId }) }); } catch {}
  };

  const generateAiMsg = async (targetEmail) => {
    setGeneratingMsg(true); setAiMsg('');
    try {
      const res = await fetch('/api/ai/connection-message', { method:'POST', headers:{ ...h,'Content-Type':'application/json' }, body: JSON.stringify({ target_email: targetEmail }) });
      if (res.ok) { const d = await res.json(); setAiMsg(d.message || ''); }
    } catch {}
    setGeneratingMsg(false);
  };

  const scoreColor = (s) => s>=90?'#5A7A3C':s>=75?'#8B6020':s>=60?'#C4956A':'#b43c3c';

  const filtered = matches.filter(m => {
    if (filter==='all') return true;
    if (filter==='high') return m.compatibility_score>=80;
    if (filter==='mentor') return m.reasons?.some(r=>r.toLowerCase().includes('mentor'));
    if (filter==='peer') return Math.abs(m.graduation_year-(user?.graduation_year||2020))<=2;
    return true;
  });

  const tabBtn = (active) => ({ padding:'7px 16px', borderRadius:8, border:'1px solid var(--border-default)', background: active?'var(--gradient-brand)':'var(--bg-elevated)', color: active?'#fff':'var(--text-secondary)', fontWeight: active?600:400, cursor:'pointer', fontFamily:'inherit', fontSize:'0.82rem', transition:'all 0.15s' });

  return (
    <div style={{ padding:'28px 32px', maxWidth:1300, margin:'0 auto' }}>
      {/* Profile Modal */}
      <AnimatePresence>
        {viewingProfile && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(61,43,31,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
            onClick={()=>{ setViewingProfile(null); setAiMsg(''); }}>
            <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }} exit={{ scale:0.9 }}
              style={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:20, padding:28, maxWidth:480, width:'100%', maxHeight:'90vh', overflowY:'auto' }}
              onClick={e=>e.stopPropagation()}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div className="ds-avatar ds-avatar-lg">{(viewingProfile.full_name||'U')[0]}</div>
                  <div>
                    <h3 style={{ margin:0, fontWeight:800 }}>{viewingProfile.full_name}</h3>
                    <p style={{ color:'var(--text-secondary)', margin:'4px 0 0', fontSize:'0.875rem' }}>{viewingProfile.position||viewingProfile.sector}{viewingProfile.company?` · ${viewingProfile.company}`:''}</p>
                    <span className="ds-badge ds-badge-teal" style={{ marginTop:6 }}>Class of {viewingProfile.graduation_year}</span>
                  </div>
                </div>
                <button onClick={()=>{ setViewingProfile(null); setAiMsg(''); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={18}/></button>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
                {viewingProfile.skills?.map(s=><span key={s} className="ds-tag ds-tag-teal">{s}</span>)}
              </div>
              {viewingProfile.reasons?.length>0 && (
                <div style={{ background:'var(--bg-elevated)', borderRadius:10, padding:'10px 14px', marginBottom:14 }}>
                  <p style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-muted)', marginBottom:6 }}>Why connect:</p>
                  {viewingProfile.reasons.map((r,i)=><p key={i} style={{ fontSize:'0.82rem', color:'var(--text-secondary)', margin:'3px 0', display:'flex', alignItems:'center', gap:6 }}><CheckCircle size={12} color="var(--brand-teal)"/>{r}</p>)}
                </div>
              )}
              {/* AI Message */}
              <div style={{ marginBottom:14 }}>
                <button className="ds-btn ds-btn-ghost" style={{ width:'100%', padding:'8px', fontSize:'0.82rem', marginBottom:8 }} onClick={()=>generateAiMsg(viewingProfile.user_id)} disabled={generatingMsg}>
                  <Sparkles size={14}/> {generatingMsg?'Generating...':'Generate AI Intro Message'}
                </button>
                {aiMsg && (
                  <textarea value={aiMsg} onChange={e=>setAiMsg(e.target.value)} rows={5} className="ds-input" style={{ resize:'vertical', fontSize:'0.82rem' }}/>
                )}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                {connected.includes(viewingProfile.user_id) ? (
                  <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', background:'rgba(90,122,60,0.1)', border:'1px solid rgba(90,122,60,0.25)', borderRadius:10, color:'#5A7A3C', fontWeight:600, fontSize:'0.875rem' }}>
                    <CheckCircle size={15}/> Request Sent
                  </div>
                ) : (
                  <button className="ds-btn ds-btn-primary" style={{ flex:1 }} onClick={()=>{ sendConnection(viewingProfile.user_id, viewingProfile.full_name); setViewingProfile(null); setAiMsg(''); }}>
                    <UserPlus size={15}/> Connect
                  </button>
                )}
                <button className="ds-btn ds-btn-ghost" style={{ flex:1 }} onClick={()=>{ navigate('/dashboard/messages'); setViewingProfile(null); }}>
                  <MessageCircle size={15}/> Message
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, margin:0 }}>Alumni Mapping</h1>
        <p style={{ color:'var(--text-secondary)', margin:'4px 0 0', fontSize:'0.875rem' }}>AI-powered alumni matching for your career growth</p>
      </div>

      {/* Insights */}
      {insights && (
        <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
          style={{ background:'var(--gradient-brand)', borderRadius:16, padding:'18px 24px', marginBottom:24, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {[
            { icon:TrendingUp, label:'Career Stage', value: insights.career_stage?.split(' - ')[0]||'Professional' },
            { icon:Target, label:'Network Potential', value: `${insights.networking_potential}/10` },
            { icon:Zap, label:'Growth Areas', value: (insights.skill_gaps||[]).slice(0,2).join(', ')||'—' },
          ].map((s,i)=>{ const Icon=s.icon; return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:8, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><Icon size={17}/></div>
              <div><div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.75)', marginBottom:2 }}>{s.label}</div><div style={{ fontSize:'0.95rem', fontWeight:700, color:'#fff' }}>{s.value}</div></div>
            </div>
          );})}
        </motion.div>
      )}

      {/* Controls */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', gap:4, background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', borderRadius:10, padding:4 }}>
          {[['semantic','Semantic AI'],['collaborative','Collaborative']].map(([m,l])=>(
            <button key={m} style={tabBtn(aiMode===m)} onClick={()=>setAiMode(m)}>{m==='semantic'?<Sparkles size={13}/>:<Users size={13}/>} {l}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {['all','high','mentor','peer'].map(f=>(
            <button key={f} style={tabBtn(filter===f)} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          {[0,1,2,3,4,5].map(i=><div key={i} className="ds-skeleton" style={{ height:220, borderRadius:16 }}/>)}
        </div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-muted)' }}>
          <Sparkles size={48} style={{ marginBottom:12 }}/><h3>No matches found</h3><p style={{ fontSize:'0.875rem' }}>Try adjusting filters or update your profile</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          <AnimatePresence>
            {filtered.map((m,idx)=>(
              <motion.div key={m.user_id} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} transition={{ delay:idx*0.05 }}
                className="ds-card" style={{ cursor:'default' }}>
                {/* Header */}
                <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
                  <div className="ds-avatar ds-avatar-md">{(m.full_name||'U')[0]}</div>
                  <div style={{ flex:1 }}>
                    <h4 style={{ margin:'0 0 3px', fontWeight:700, fontSize:'0.95rem' }}>{m.full_name}</h4>
                    <p style={{ color:'var(--text-secondary)', fontSize:'0.78rem', margin:0 }}>{m.sector} · Class of {m.graduation_year}</p>
                    {m.company && <p style={{ color:'var(--brand-teal)', fontSize:'0.78rem', fontWeight:600, margin:'2px 0 0' }}>{m.company}</p>}
                  </div>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:scoreColor(m.compatibility_score), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:800, color:'#fff', flexShrink:0 }}>
                    {m.compatibility_score}%
                  </div>
                </div>
                {/* Skills */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
                  {m.skills?.slice(0,4).map(s=><span key={s} className="ds-tag ds-tag-teal">{s}</span>)}
                </div>
                {/* Reasons */}
                {m.reasons?.length>0 && (
                  <div style={{ marginBottom:12 }}>
                    <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', marginBottom:5 }}>Why connect:</p>
                    {m.reasons.slice(0,2).map((r,i)=>(
                      <p key={i} style={{ fontSize:'0.78rem', color:'var(--text-secondary)', margin:'3px 0', display:'flex', alignItems:'center', gap:5 }}>
                        <CheckCircle size={11} color="var(--brand-teal)"/>{r}
                      </p>
                    ))}
                  </div>
                )}
                {/* Actions */}
                <div style={{ display:'flex', gap:8 }}>
                  {connected.includes(m.user_id) ? (
                    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'8px', background:'rgba(90,122,60,0.1)', border:'1px solid rgba(90,122,60,0.25)', borderRadius:9, color:'#5A7A3C', fontWeight:600, fontSize:'0.8rem' }}>
                      <CheckCircle size={13}/> Sent
                    </div>
                  ) : (
                    <button className="ds-btn ds-btn-primary" style={{ flex:1, padding:'8px', fontSize:'0.82rem' }} onClick={()=>sendConnection(m.user_id, m.full_name)}>
                      <UserPlus size={13}/> Connect
                    </button>
                  )}
                  <button className="ds-btn ds-btn-ghost" style={{ padding:'8px 12px', fontSize:'0.82rem' }} onClick={()=>setViewingProfile(m)}>
                    View
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Matches;
