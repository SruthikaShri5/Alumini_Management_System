import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Users, Zap, Target, Sparkles, Calendar,
  Briefcase, Brain, Network, Rocket, Eye, ArrowRight,
  Activity, Award, MessageCircle, Shield, Plus,
  CheckCircle, Clock, UserPlus, BarChart3
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35, ease: 'easeOut' },
});

const Skel = ({ h = 80 }) => <div className="ds-skeleton" style={{ height: h, borderRadius: 14 }} />;

// ─── STUDENT HOME ────────────────────────────────────────────────────────────
const StudentHome = ({ user, navigate, stats, loading, matches, jobs }) => (
  <div style={{ padding: '28px 32px', maxWidth: 1300, margin: '0 auto' }}>
    {/* Welcome */}
    <motion.div {...fadeUp(0)} style={{ background: 'var(--gradient-brand)', borderRadius: 20, padding: '22px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff' }}>Welcome back, {user?.full_name?.split(' ')[0]} 👋</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontSize: '0.875rem' }}>Find alumni mentors, discover jobs, and grow your career</p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="ds-btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', fontSize: '0.82rem' }} onClick={() => navigate('/dashboard/matches')}>
          <Users size={14} /> Find Alumni
        </button>
        <button className="ds-btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', fontSize: '0.82rem' }} onClick={() => navigate('/dashboard/jobs')}>
          <Briefcase size={14} /> Browse Jobs
        </button>
      </div>
    </motion.div>

    {/* Stats */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
      {loading ? [0,1,2,3].map(i=><Skel key={i}/>) : [
        { icon: Users, label: 'Connections', value: stats?.connections ?? 0, change: 'Alumni connected', color: 'var(--brand-teal)' },
        { icon: Sparkles, label: 'AI Matches', value: matches.length, change: 'Suggested for you', color: '#8B6020' },
        { icon: Briefcase, label: 'Job Matches', value: jobs.length, change: 'Available now', color: '#5A7A3C' },
        { icon: Target, label: 'Profile Score', value: `${stats?.profileScore ?? 0}%`, change: 'Complete your profile', color: '#7A5030' },
      ].map((s,i) => { const Icon=s.icon; return (
        <motion.div key={i} {...fadeUp(0.05*i)} className="ds-card" style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', cursor:'default' }}>
          <div style={{ width:44, height:44, borderRadius:10, background:`${s.color}15`, border:`1px solid ${s.color}25`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, flexShrink:0 }}><Icon size={20}/></div>
          <div><div style={{ fontSize:'1.6rem', fontWeight:800, lineHeight:1 }}>{s.value}</div><div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{s.label}</div><div style={{ fontSize:'0.7rem', color:s.color, marginTop:2 }}>{s.change}</div></div>
        </motion.div>
      );})}
    </div>

    <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18, marginBottom:18 }}>
      {/* Top Alumni Matches */}
      <motion.div {...fadeUp(0.2)} className="ds-card">
        <div className="ds-section-header">
          <span className="ds-section-title"><Sparkles size={15}/> Top Alumni Matches</span>
          <button className="ds-btn ds-btn-ghost" style={{ padding:'4px 12px', fontSize:'0.78rem' }} onClick={()=>navigate('/dashboard/matches')}>See all <ArrowRight size={12}/></button>
        </div>
        {loading ? [0,1,2].map(i=><Skel key={i} h={60}/>) : matches.slice(0,4).map((m,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i<3?'1px solid var(--border-subtle)':'none' }}>
            <div className="ds-avatar ds-avatar-sm">{(m.full_name||'U')[0]}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{m.full_name}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{m.company||m.sector} · Class of {m.graduation_year}</div>
            </div>
            <span className="ds-badge ds-badge-teal">{m.compatibility_score}%</span>
            <button className="ds-btn ds-btn-primary" style={{ padding:'6px 12px', fontSize:'0.75rem' }} onClick={()=>navigate('/dashboard/matches')}>Connect</button>
          </div>
        ))}
        {!loading && matches.length===0 && <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', textAlign:'center', padding:'1rem' }}>Complete your profile to get matches</p>}
      </motion.div>

      {/* Quick Actions */}
      <motion.div {...fadeUp(0.25)} className="ds-card">
        <div className="ds-section-header"><span className="ds-section-title"><Zap size={15}/> Quick Actions</span></div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { icon:Users, label:'Find Alumni Mentors', sub:'Connect with professionals', path:'/dashboard/matches', color:'var(--brand-teal)' },
            { icon:Briefcase, label:'Browse Job Board', sub:`${jobs.length} jobs available`, path:'/dashboard/jobs', color:'#8B6020' },
            { icon:Calendar, label:'Join Events', sub:'Networking opportunities', path:'/dashboard/events', color:'#5A7A3C' },
            { icon:Brain, label:'Career Advisor', sub:'AI-powered guidance', path:'/dashboard/career', color:'#7A5030' },
            { icon:MessageCircle, label:'Messages', sub:'Chat with connections', path:'/dashboard/messages', color:'var(--brand-teal)' },
          ].map((a,i)=>{ const Icon=a.icon; return (
            <button key={i} onClick={()=>navigate(a.path)} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', borderRadius:10, cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all 0.15s' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--border-strong)'; e.currentTarget.style.background='var(--bg-overlay)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.background='var(--bg-elevated)'; }}>
              <div style={{ width:34, height:34, borderRadius:8, background:`${a.color}15`, border:`1px solid ${a.color}25`, display:'flex', alignItems:'center', justifyContent:'center', color:a.color, flexShrink:0 }}><Icon size={16}/></div>
              <div><div style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text-primary)' }}>{a.label}</div><div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{a.sub}</div></div>
              <ArrowRight size={14} color="var(--text-muted)" style={{ marginLeft:'auto' }}/>
            </button>
          );})}
        </div>
      </motion.div>
    </div>

    {/* Recent Jobs */}
    <motion.div {...fadeUp(0.35)} className="ds-card">
      <div className="ds-section-header">
        <span className="ds-section-title"><Briefcase size={15}/> Latest Job Matches</span>
        <button className="ds-btn ds-btn-ghost" style={{ padding:'4px 12px', fontSize:'0.78rem' }} onClick={()=>navigate('/dashboard/jobs')}>View all <ArrowRight size={12}/></button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {loading ? [0,1,2].map(i=><Skel key={i} h={100}/>) : jobs.slice(0,3).map((j,i)=>(
          <div key={i} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', borderRadius:12, padding:'14px 16px' }}>
            <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:4 }}>{j.title}</div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:8 }}>{j.company} · {j.location}</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span className="ds-badge ds-badge-teal">{j.match_score||75}% match</span>
              <button className="ds-btn ds-btn-primary" style={{ padding:'5px 12px', fontSize:'0.75rem' }} onClick={()=>navigate('/dashboard/jobs')}>Apply</button>
            </div>
          </div>
        ))}
        {!loading && jobs.length===0 && <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', gridColumn:'1/-1', textAlign:'center', padding:'1rem' }}>No jobs yet — check back soon</p>}
      </div>
    </motion.div>
  </div>
);

// ─── ALUMNI HOME ─────────────────────────────────────────────────────────────
const AlumniHome = ({ user, navigate, stats, loading, matches, jobs }) => (
  <div style={{ padding:'28px 32px', maxWidth:1300, margin:'0 auto' }}>
    <motion.div {...fadeUp(0)} style={{ background:'var(--gradient-brand)', borderRadius:20, padding:'22px 28px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
      <div>
        <h2 style={{ fontSize:'1.4rem', fontWeight:800, margin:0, color:'#fff' }}>Welcome back, {user?.full_name?.split(' ')[0]} 👋</h2>
        <p style={{ color:'rgba(255,255,255,0.8)', margin:'4px 0 0', fontSize:'0.875rem' }}>Post jobs, mentor students, and grow your network</p>
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button className="ds-btn" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)', padding:'8px 16px', fontSize:'0.82rem' }} onClick={()=>navigate('/dashboard/jobs')}>
          <Plus size={14}/> Post a Job
        </button>
        <button className="ds-btn" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)', padding:'8px 16px', fontSize:'0.82rem' }} onClick={()=>navigate('/dashboard/events')}>
          <Calendar size={14}/> Create Event
        </button>
      </div>
    </motion.div>

    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
      {loading ? [0,1,2,3].map(i=><Skel key={i}/>) : [
        { icon:Users, label:'Connections', value:stats?.connections??0, color:'var(--brand-teal)' },
        { icon:Briefcase, label:'Jobs Posted', value:jobs.filter(j=>j.posted_by===user?.email).length||0, color:'#8B6020' },
        { icon:UserPlus, label:'Mentees', value:matches.length, color:'#5A7A3C' },
        { icon:Award, label:'Profile Score', value:`${stats?.profileScore??0}%`, color:'#7A5030' },
      ].map((s,i)=>{ const Icon=s.icon; return (
        <motion.div key={i} {...fadeUp(0.05*i)} className="ds-card" style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px' }}>
          <div style={{ width:44, height:44, borderRadius:10, background:`${s.color}15`, border:`1px solid ${s.color}25`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, flexShrink:0 }}><Icon size={20}/></div>
          <div><div style={{ fontSize:'1.6rem', fontWeight:800, lineHeight:1 }}>{s.value}</div><div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{s.label}</div></div>
        </motion.div>
      );})}
    </div>

    <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18, marginBottom:18 }}>
      {/* Students to Mentor */}
      <motion.div {...fadeUp(0.2)} className="ds-card">
        <div className="ds-section-header">
          <span className="ds-section-title"><Users size={15}/> Students to Mentor</span>
          <button className="ds-btn ds-btn-ghost" style={{ padding:'4px 12px', fontSize:'0.78rem' }} onClick={()=>navigate('/dashboard/mentorship')}>See all <ArrowRight size={12}/></button>
        </div>
        {loading ? [0,1,2].map(i=><Skel key={i} h={60}/>) : matches.slice(0,4).map((m,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:i<3?'1px solid var(--border-subtle)':'none' }}>
            <div className="ds-avatar ds-avatar-sm">{(m.full_name||'U')[0]}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{m.full_name}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{m.sector} · Class of {m.graduation_year}</div>
            </div>
            <button className="ds-btn ds-btn-primary" style={{ padding:'6px 12px', fontSize:'0.75rem' }} onClick={()=>navigate('/dashboard/mentorship')}>Mentor</button>
          </div>
        ))}
        {!loading && matches.length===0 && <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', textAlign:'center', padding:'1rem' }}>No student matches yet</p>}
      </motion.div>

      {/* Alumni Actions */}
      <motion.div {...fadeUp(0.25)} className="ds-card">
        <div className="ds-section-header"><span className="ds-section-title"><Zap size={15}/> Alumni Actions</span></div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { icon:Plus, label:'Post a Job', sub:'Help students find opportunities', path:'/dashboard/jobs', color:'#8B6020' },
            { icon:Calendar, label:'Create Event', sub:'Host networking events', path:'/dashboard/events', color:'#5A7A3C' },
            { icon:Users, label:'Mentor Students', sub:'Share your expertise', path:'/dashboard/mentorship', color:'var(--brand-teal)' },
            { icon:Network, label:'Expand Network', sub:'Connect with peers', path:'/dashboard/matches', color:'#7A5030' },
            { icon:BarChart3, label:'View Analytics', sub:'Track your impact', path:'/dashboard/analytics', color:'var(--brand-teal)' },
          ].map((a,i)=>{ const Icon=a.icon; return (
            <button key={i} onClick={()=>navigate(a.path)} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', borderRadius:10, cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all 0.15s' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--border-strong)'; e.currentTarget.style.background='var(--bg-overlay)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.background='var(--bg-elevated)'; }}>
              <div style={{ width:34, height:34, borderRadius:8, background:`${a.color}15`, border:`1px solid ${a.color}25`, display:'flex', alignItems:'center', justifyContent:'center', color:a.color, flexShrink:0 }}><Icon size={16}/></div>
              <div><div style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text-primary)' }}>{a.label}</div><div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{a.sub}</div></div>
              <ArrowRight size={14} color="var(--text-muted)" style={{ marginLeft:'auto' }}/>
            </button>
          );})}
        </div>
      </motion.div>
    </div>
  </div>
);

// ─── ADMIN HOME ───────────────────────────────────────────────────────────────
const AdminHome = ({ user, navigate, stats, loading }) => (
  <div style={{ padding:'28px 32px', maxWidth:1300, margin:'0 auto' }}>
    <motion.div {...fadeUp(0)} style={{ background:'var(--gradient-brand)', borderRadius:20, padding:'22px 28px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
      <div>
        <h2 style={{ fontSize:'1.4rem', fontWeight:800, margin:0, color:'#fff' }}>Admin Dashboard 🛡️</h2>
        <p style={{ color:'rgba(255,255,255,0.8)', margin:'4px 0 0', fontSize:'0.875rem' }}>Full platform overview and management</p>
      </div>
      <button className="ds-btn" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)', padding:'8px 16px', fontSize:'0.82rem' }} onClick={()=>navigate('/dashboard/admin')}>
        <Shield size={14}/> Open Admin Panel
      </button>
    </motion.div>

    {/* Platform Stats */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12, marginBottom:24 }}>
      {loading ? [0,1,2,3,4,5].map(i=><Skel key={i} h={80}/>) : [
        { icon:Users, label:'Total Users', value:stats?.total_users??0, color:'var(--brand-teal)' },
        { icon:Award, label:'Alumni', value:stats?.total_alumni??0, color:'#8B6020' },
        { icon:Target, label:'Students', value:stats?.total_students??0, color:'#5A7A3C' },
        { icon:Network, label:'Connections', value:stats?.total_connections??0, color:'#7A5030' },
        { icon:Calendar, label:'Events', value:stats?.total_events??0, color:'var(--brand-teal)' },
        { icon:Briefcase, label:'Jobs', value:stats?.total_jobs??0, color:'#8B6020' },
      ].map((s,i)=>{ const Icon=s.icon; return (
        <motion.div key={i} {...fadeUp(0.04*i)} className="ds-card" style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:`${s.color}15`, border:`1px solid ${s.color}25`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, flexShrink:0 }}><Icon size={17}/></div>
          <div><div style={{ fontSize:'1.4rem', fontWeight:800, lineHeight:1 }}>{s.value}</div><div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:2 }}>{s.label}</div></div>
        </motion.div>
      );})}
    </div>

    {/* Admin Quick Actions */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
      {[
        { icon:Shield, title:'User Management', desc:'Approve, edit, or remove users from the platform', path:'/dashboard/admin', color:'var(--brand-teal)', badge:'Admin' },
        { icon:Clock, title:'Pending Approvals', desc:'Review and approve student registrations', path:'/dashboard/admin', color:'#8B6020', badge:'Action needed' },
        { icon:BarChart3, title:'Platform Analytics', desc:'View detailed usage stats and growth metrics', path:'/dashboard/analytics', color:'#5A7A3C', badge:'Insights' },
        { icon:Briefcase, title:'Job Board', desc:'Monitor all job postings and applications', path:'/dashboard/jobs', color:'#7A5030', badge:'Jobs' },
        { icon:Calendar, title:'Events', desc:'Manage all platform events and registrations', path:'/dashboard/events', color:'var(--brand-teal)', badge:'Events' },
        { icon:MessageCircle, title:'Messages', desc:'Monitor platform communications', path:'/dashboard/messages', color:'#8B6020', badge:'Comms' },
      ].map((a,i)=>{ const Icon=a.icon; return (
        <motion.div key={i} {...fadeUp(0.06*i)} className="ds-card" style={{ cursor:'pointer' }} onClick={()=>navigate(a.path)}
          whileHover={{ y:-3 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:`${a.color}15`, border:`1px solid ${a.color}25`, display:'flex', alignItems:'center', justifyContent:'center', color:a.color }}><Icon size={19}/></div>
            <span className="ds-badge ds-badge-teal" style={{ fontSize:'0.68rem' }}>{a.badge}</span>
          </div>
          <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'0 0 6px' }}>{a.title}</h3>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.82rem', margin:'0 0 12px', lineHeight:1.5 }}>{a.desc}</p>
          <div style={{ display:'flex', alignItems:'center', gap:4, color:a.color, fontSize:'0.78rem', fontWeight:600 }}>Go to {a.title} <ArrowRight size={12}/></div>
        </motion.div>
      );})}
    </div>
  </div>
);

// ─── MAIN HOME ────────────────────────────────────────────────────────────────
const Home = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [matches, setMatches] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}` };
      try {
        const [aRes, mRes, jRes] = await Promise.all([
          fetch('/api/analytics/dashboard', { headers: h }),
          fetch('/api/matching/suggestions?mode=semantic', { headers: h }),
          fetch('/api/jobs', { headers: h }),
        ]);
        if (aRes.ok) { const d = await aRes.json(); setStats({ ...d, connections: d.total_connections||d.connections_count||0, profileScore: 87 }); }
        if (mRes.ok) { const d = await mRes.json(); setMatches(d.matches||[]); }
        if (jRes.ok) { const d = await jRes.json(); setJobs(d.jobs||[]); }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const props = { user, navigate, stats, loading, matches, jobs };

  if (user?.role === 'admin') return <AdminHome {...props} />;
  if (user?.role === 'alumni') return <AlumniHome {...props} />;
  return <StudentHome {...props} />;
};

export default Home;
