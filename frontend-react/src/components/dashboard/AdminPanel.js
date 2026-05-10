import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trash2, Shield, TrendingUp, Calendar, Briefcase, Edit, Plus, X, CheckCircle, XCircle, Clock, Download, BarChart3, Network, Award, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#C4956A','#A67C52','#8B6020','#5A7A3C','#7A5030','#B09070'];

const AdminPanel = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ email:'', full_name:'', role:'student', sector:'technology', graduation_year:2020, password:'' });
  const token = localStorage.getItem('token');
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchAnalytics(), fetchPendingUsers()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try { const res = await fetch('/api/admin/users', { headers: h }); if (res.ok) { const d = await res.json(); setUsers(d.users||[]); } } catch {}
  };
  const fetchAnalytics = async () => {
    try { const res = await fetch('/api/analytics/dashboard', { headers: h }); if (res.ok) { const d = await res.json(); setAnalytics(d); } } catch {}
  };
  const fetchPendingUsers = async () => {
    try { const res = await fetch('/api/admin/pending-users', { headers: h }); if (res.ok) { const d = await res.json(); setPendingUsers(d.pending_users||[]); } } catch {}
  };

  const approveUser = async (email) => {
    try { const res = await fetch(`/api/admin/approve/${email}`, { method:'POST', headers: h }); if (res.ok) { toast.success(`${email} approved!`); fetchAll(); } } catch { toast.error('Failed'); }
  };
  const rejectUser = async (email) => {
    if (!window.confirm(`Reject ${email}?`)) return;
    try { const res = await fetch(`/api/admin/reject/${email}`, { method:'POST', headers: h }); if (res.ok) { toast.success('Rejected'); fetchAll(); } } catch { toast.error('Failed'); }
  };
  const deleteUser = async (email) => {
    if (!window.confirm(`Delete ${email}?`)) return;
    try { const res = await fetch(`/api/admin/users/${email}`, { method:'DELETE', headers: h }); if (res.ok) { toast.success('Deleted'); fetchAll(); } } catch { toast.error('Failed'); }
  };

  const openCreate = () => { setEditingUser(null); setFormData({ email:'', full_name:'', role:'student', sector:'technology', graduation_year:2020, password:'' }); setShowModal(true); };
  const openEdit = (u) => { setEditingUser(u); setFormData({ email:u.email, full_name:u.full_name, role:u.role, sector:u.sector, graduation_year:u.graduation_year, password:'' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const upd = { ...formData }; delete upd.email; if (!upd.password) delete upd.password;
        const res = await fetch(`/api/admin/users/${editingUser.email}`, { method:'PUT', headers:{ ...h,'Content-Type':'application/json' }, body:JSON.stringify(upd) });
        if (res.ok) { toast.success('Updated'); setShowModal(false); fetchUsers(); }
        else toast.error('Failed to update');
      } else {
        const res = await fetch('/api/auth/register', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ ...formData, skills:[], interests:[], looking_for:[] }) });
        if (res.ok) { toast.success('User created'); setShowModal(false); fetchAll(); }
        else { const d = await res.json(); toast.error(d.detail||'Failed'); }
      }
    } catch { toast.error('Operation failed'); }
  };

  const exportCSV = async () => {
    try {
      const res = await fetch('/api/analytics/export-full', { headers: h });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'rootsreconnect_full_export.csv'; a.click();
        URL.revokeObjectURL(url);
        toast.success('Full export downloaded!');
      } else toast.error('Export failed');
    } catch { toast.error('Export failed'); }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sectorData = analytics?.sector_distribution || [];
  const roleData = [
    { name:'Alumni', value: analytics?.total_alumni||0 },
    { name:'Students', value: analytics?.total_students||0 },
  ];

  const tabBtn = (id) => ({ padding:'8px 18px', borderRadius:8, background: activeTab===id?'var(--bg-surface)':'transparent', border: activeTab===id?'1px solid var(--border-default)':'1px solid transparent', color: activeTab===id?'var(--text-primary)':'var(--text-muted)', fontWeight: activeTab===id?600:400, fontSize:'0.875rem', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' });

  if (loading) return (
    <div style={{ padding:'28px 32px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, gap:16 }}>
      <div className="ds-spinner"/><p style={{ color:'var(--text-secondary)' }}>Loading admin data...</p>
    </div>
  );

  return (
    <div style={{ padding:'28px 32px', maxWidth:1400, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:'var(--gradient-brand)', display:'flex', alignItems:'center', justifyContent:'center' }}><Shield size={24} color="#fff"/></div>
          <div>
            <h1 style={{ fontSize:'1.5rem', fontWeight:800, margin:0 }}>Admin Dashboard</h1>
            <p style={{ color:'var(--text-secondary)', margin:0, fontSize:'0.875rem' }}>Full platform control and analytics</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="ds-btn ds-btn-ghost" style={{ padding:'8px 16px', fontSize:'0.82rem' }} onClick={exportCSV}><Download size={14}/> Export CSV</button>
          <button className="ds-btn ds-btn-primary" onClick={openCreate}><Plus size={14}/> Add User</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12, marginBottom:24 }}>
        {[
          { icon:Users, label:'Total Users', value:analytics?.total_users??0, color:'var(--brand-teal)' },
          { icon:Award, label:'Alumni', value:analytics?.total_alumni??0, color:'#8B6020' },
          { icon:Target, label:'Students', value:analytics?.total_students??0, color:'#5A7A3C' },
          { icon:Network, label:'Connections', value:analytics?.total_connections??0, color:'#7A5030' },
          { icon:Calendar, label:'Events', value:analytics?.total_events??0, color:'var(--brand-teal)' },
          { icon:Briefcase, label:'Jobs', value:analytics?.total_jobs??0, color:'#8B6020' },
        ].map((s,i)=>{ const Icon=s.icon; return (
          <div key={i} className="ds-card" style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:`${s.color}15`, border:`1px solid ${s.color}25`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, flexShrink:0 }}><Icon size={17}/></div>
            <div><div style={{ fontSize:'1.4rem', fontWeight:800, lineHeight:1 }}>{s.value}</div><div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:2 }}>{s.label}</div></div>
          </div>
        );})}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', borderRadius:12, padding:4, width:'fit-content' }}>
        <button style={tabBtn('overview')} onClick={()=>setActiveTab('overview')}>Overview</button>
        <button style={tabBtn('users')} onClick={()=>setActiveTab('users')}>All Users ({users.length})</button>
        <button style={tabBtn('pending')} onClick={()=>setActiveTab('pending')}>
          Pending {pendingUsers.length>0?`(${pendingUsers.length})`:''}
          {pendingUsers.length>0 && <span style={{ marginLeft:4, width:8, height:8, borderRadius:'50%', background:'#b43c3c', display:'inline-block' }}/>}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab==='overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div className="ds-card">
            <div className="ds-section-header"><span className="ds-section-title"><BarChart3 size={15}/> Sector Distribution</span></div>
            {sectorData.length>0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sectorData}>
                  <XAxis dataKey="sector" tick={{ fontSize:11, fill:'var(--text-muted)' }}/>
                  <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }}/>
                  <Tooltip contentStyle={{ background:'var(--bg-elevated)', border:'1px solid var(--border-default)', borderRadius:8, fontSize:12 }}/>
                  <Bar dataKey="count" fill="#C4956A" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color:'var(--text-muted)', textAlign:'center', padding:'2rem' }}>No data yet</p>}
          </div>
          <div className="ds-card">
            <div className="ds-section-header"><span className="ds-section-title"><Users size={15}/> User Roles</span></div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>`${name}: ${value}`} labelLine={false} fontSize={11}>
                  {roleData.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
                </Pie>
                <Tooltip contentStyle={{ background:'var(--bg-elevated)', border:'1px solid var(--border-default)', borderRadius:8, fontSize:12 }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Recent Users */}
          <div className="ds-card" style={{ gridColumn:'1/-1' }}>
            <div className="ds-section-header"><span className="ds-section-title"><Clock size={15}/> Recently Joined</span></div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              {users.slice(0,8).map((u,i)=>(
                <div key={i} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', borderRadius:10, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
                  <div className="ds-avatar ds-avatar-sm">{(u.full_name||'U')[0]}</div>
                  <div style={{ overflow:'hidden' }}>
                    <div style={{ fontWeight:600, fontSize:'0.82rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.full_name}</div>
                    <span className={`ds-badge ${u.role==='admin'?'ds-badge-teal':u.role==='alumni'?'ds-badge-green':'ds-badge-yellow'}`} style={{ fontSize:'0.65rem', padding:'1px 7px' }}>{u.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab==='users' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <input className="ds-input" placeholder="Search by name, email, or role..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ maxWidth:360 }}/>
            <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>{filteredUsers.length} users</span>
          </div>
          <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:16, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--bg-elevated)' }}>
                  {['Name','Email','Role','Sector','Grad Year','Status','Actions'].map(h=>(
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid var(--border-subtle)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u,i)=>(
                  <tr key={u.email} style={{ borderBottom:'1px solid var(--border-subtle)', transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="ds-avatar ds-avatar-sm">{(u.full_name||'U')[0]}</div>
                        <span style={{ fontWeight:600, fontSize:'0.875rem' }}>{u.full_name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:'0.82rem', color:'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span className={`ds-badge ${u.role==='admin'?'ds-badge-teal':u.role==='alumni'?'ds-badge-green':'ds-badge-yellow'}`}>{u.role}</span>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:'0.82rem', color:'var(--text-secondary)' }}>{u.sector}</td>
                    <td style={{ padding:'12px 16px', fontSize:'0.82rem', color:'var(--text-secondary)' }}>{u.graduation_year}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span className={`ds-badge ${u.is_approved?'ds-badge-green':'ds-badge-yellow'}`}>{u.is_approved?'Active':'Pending'}</span>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      {u.email!==user.email && (
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={()=>openEdit(u)} style={{ width:30, height:30, borderRadius:7, background:'rgba(196,149,106,0.12)', border:'1px solid rgba(196,149,106,0.25)', color:'var(--brand-teal)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Edit size={13}/></button>
                          <button onClick={()=>deleteUser(u.email)} style={{ width:30, height:30, borderRadius:7, background:'rgba(180,60,60,0.08)', border:'1px solid rgba(180,60,60,0.2)', color:'#b43c3c', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Trash2 size={13}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length===0 && <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>No users found</div>}
          </div>
        </div>
      )}

      {/* Pending Tab */}
      {activeTab==='pending' && (
        <div>
          {pendingUsers.length===0 ? (
            <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-muted)' }}>
              <CheckCircle size={48} style={{ marginBottom:12 }}/><h3>All caught up!</h3><p style={{ fontSize:'0.875rem' }}>No pending approvals</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {pendingUsers.map(u=>(
                <motion.div key={u.email} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} className="ds-card" style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div className="ds-avatar ds-avatar-md">{(u.full_name||'U')[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{u.full_name}</div>
                    <div style={{ color:'var(--text-secondary)', fontSize:'0.82rem' }}>{u.email}</div>
                    <div style={{ display:'flex', gap:8, marginTop:4 }}>
                      <span className="ds-badge ds-badge-teal">{u.sector}</span>
                      <span className="ds-badge ds-badge-yellow">Class of {u.graduation_year}</span>
                      <span className="ds-badge ds-badge-teal">{u.role}</span>
                    </div>
                  </div>
                  <span className="ds-badge ds-badge-yellow"><Clock size={10}/> Pending</span>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="ds-btn ds-btn-primary" style={{ padding:'8px 18px', fontSize:'0.82rem' }} onClick={()=>approveUser(u.email)}><CheckCircle size={14}/> Approve</button>
                    <button className="ds-btn ds-btn-danger" style={{ padding:'8px 18px', fontSize:'0.82rem' }} onClick={()=>rejectUser(u.email)}><XCircle size={14}/> Reject</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(61,43,31,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            style={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:20, padding:28, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ margin:0 }}>{editingUser?'Edit User':'Create User'}</h3>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div><label className="ds-label">Full Name</label><input className="ds-input" required value={formData.full_name} onChange={e=>setFormData({...formData,full_name:e.target.value})} placeholder="John Doe"/></div>
              <div><label className="ds-label">Email</label><input className="ds-input" type="email" required disabled={!!editingUser} value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} placeholder="john@example.com"/></div>
              {!editingUser && <div><label className="ds-label">Password</label><input className="ds-input" type="password" required value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})} placeholder="Min 6 characters"/></div>}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label className="ds-label">Role</label>
                  <select className="ds-input" value={formData.role} onChange={e=>setFormData({...formData,role:e.target.value})}>
                    <option value="student">Student</option><option value="alumni">Alumni</option><option value="admin">Admin</option>
                  </select>
                </div>
                <div><label className="ds-label">Sector</label>
                  <select className="ds-input" value={formData.sector} onChange={e=>setFormData({...formData,sector:e.target.value})}>
                    {['technology','healthcare','finance','education','manufacturing','consulting','government'].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="ds-label">Graduation Year</label><input className="ds-input" type="number" min="1950" max="2030" value={formData.graduation_year} onChange={e=>setFormData({...formData,graduation_year:parseInt(e.target.value)})}/></div>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="button" className="ds-btn ds-btn-ghost" style={{ flex:1 }} onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="ds-btn ds-btn-primary" style={{ flex:1 }}>{editingUser?'Update':'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
