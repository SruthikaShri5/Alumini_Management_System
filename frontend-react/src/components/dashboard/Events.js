import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Video, Clock, Star, Bell, Share2, CheckCircle, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Events = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [registered, setRegistered] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title:'', date:'', time:'', type:'virtual', location:'', max_attendees:100, description:'', tags:'' });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setEvents(d.events || []); }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean), max_attendees: parseInt(form.max_attendees) })
      });
      if (res.ok) { toast.success('Event created!'); setShowModal(false); fetchEvents(); setForm({ title:'', date:'', time:'', type:'virtual', location:'', max_attendees:100, description:'', tags:'' }); }
      else toast.error('Failed to create event');
    } catch { toast.error('Error creating event'); }
  };

  const registerEvent = (id) => {
    if (registered.includes(id)) { setRegistered(registered.filter(r=>r!==id)); toast.success('Registration cancelled'); }
    else { setRegistered([...registered, id]); toast.success('Registered successfully!'); }
  };

  const shareEvent = (ev) => { navigator.clipboard?.writeText(`${ev.title} — ${ev.date}`); toast.success('Copied to clipboard!'); };

  const filtered = events.filter(ev => {
    if (filter === 'upcoming') return new Date(ev.date) >= new Date();
    if (filter === 'registered') return registered.includes(ev.id);
    if (filter === 'virtual') return ev.type === 'virtual';
    if (filter === 'in-person') return ev.type === 'in-person';
    return true;
  });

  const canCreate = user?.role === 'admin' || user?.role === 'alumni';

  const card = { background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:16, padding:'20px 24px', marginBottom:14, transition:'all 0.2s' };
  const filterBtn = (active) => ({ padding:'8px 18px', borderRadius:8, border:'1px solid var(--border-default)', background: active ? 'var(--gradient-brand)' : 'var(--bg-elevated)', color: active ? '#fff' : 'var(--text-secondary)', fontWeight: active ? 600 : 400, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem', transition:'all 0.15s' });

  return (
    <div style={{ padding:'28px 32px', maxWidth:1100, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, margin:0 }}>Alumni Events</h1>
          <p style={{ color:'var(--text-secondary)', margin:'4px 0 0', fontSize:'0.875rem' }}>Discover networking opportunities and professional development</p>
        </div>
        {canCreate && <button className="ds-btn ds-btn-primary" onClick={() => setShowModal(true)}><Plus size={15}/> Create Event</button>}
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
        {[
          { icon: Calendar, label:'Upcoming Events', value: events.filter(e=>new Date(e.date)>=new Date()).length },
          { icon: CheckCircle, label:'Registered', value: registered.length },
          { icon: Users, label:'Total Attendees', value: events.reduce((s,e)=>s+(e.attendees||0),0) },
        ].map((s,i) => { const Icon=s.icon; return (
          <div key={i} className="ds-card" style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px' }}>
            <div style={{ width:40, height:40, borderRadius:9, background:'rgba(196,149,106,0.12)', border:'1px solid rgba(196,149,106,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--brand-teal)' }}><Icon size={18}/></div>
            <div><div style={{ fontSize:'1.4rem', fontWeight:800, lineHeight:1 }}>{s.value}</div><div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{s.label}</div></div>
          </div>
        );})}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {['all','upcoming','registered','virtual','in-person'].map(f => (
          <button key={f} style={filterBtn(filter===f)} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1).replace('-',' ')}
          </button>
        ))}
      </div>

      {/* Events */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[0,1,2].map(i=><div key={i} className="ds-skeleton" style={{ height:140, borderRadius:16 }}/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-muted)' }}>
          <Calendar size={48} style={{ marginBottom:12 }}/><h3>No events found</h3><p style={{ fontSize:'0.875rem' }}>Check back later for new events</p>
        </div>
      ) : (
        <div>
          {filtered.map((ev, idx) => (
            <motion.div key={ev.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:idx*0.06 }}
              style={{ ...card, position:'relative' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--border-strong)'; e.currentTarget.style.boxShadow='var(--shadow-glow)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border-default)'; e.currentTarget.style.boxShadow='none'; }}>
              {ev.featured===1 && (
                <div style={{ position:'absolute', top:14, right:14, display:'flex', alignItems:'center', gap:5, background:'var(--gradient-brand)', color:'#fff', padding:'4px 12px', borderRadius:20, fontSize:'0.75rem', fontWeight:600 }}>
                  <Star size={12} fill="currentColor"/> Featured
                </div>
              )}
              <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
                {/* Date box */}
                <div style={{ background:'var(--gradient-brand)', color:'#fff', padding:'10px 14px', borderRadius:12, textAlign:'center', minWidth:64, flexShrink:0 }}>
                  <div style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>{new Date(ev.date).toLocaleDateString('en',{month:'short'})}</div>
                  <div style={{ fontSize:'1.8rem', fontWeight:800, lineHeight:1 }}>{new Date(ev.date).getDate()}</div>
                </div>
                {/* Content */}
                <div style={{ flex:1 }}>
                  <h3 style={{ fontSize:'1.1rem', fontWeight:700, margin:'0 0 6px' }}>{ev.title}</h3>
                  <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem', margin:'0 0 10px', lineHeight:1.5 }}>{ev.description}</p>
                  <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:10 }}>
                    {ev.time && <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.8rem', color:'var(--text-secondary)' }}><Clock size={13}/>{ev.time}</span>}
                    {ev.type==='virtual' && <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.8rem', color:'var(--text-secondary)' }}><Video size={13}/>Virtual</span>}
                    {ev.location && <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.8rem', color:'var(--text-secondary)' }}><MapPin size={13}/>{ev.location}</span>}
                    <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.8rem', color:'var(--text-secondary)' }}><Users size={13}/>{ev.attendees||0}/{ev.max_attendees}</span>
                  </div>
                  {ev.tags?.length>0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                      {ev.tags.map(t=><span key={t} className="ds-tag ds-tag-teal">{t}</span>)}
                    </div>
                  )}
                  {ev.speakers?.length>0 && (
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginRight:4 }}>Speakers:</span>
                      {ev.speakers.map(s=><span key={s} className="ds-badge ds-badge-teal">{s}</span>)}
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
                  <button className={`ds-btn ${registered.includes(ev.id)?'ds-btn-secondary':'ds-btn-primary'}`} style={{ padding:'8px 16px', fontSize:'0.82rem' }} onClick={()=>registerEvent(ev.id)}>
                    {registered.includes(ev.id) ? <><CheckCircle size={14}/> Registered</> : <><Bell size={14}/> Register</>}
                  </button>
                  <button className="ds-btn ds-btn-ghost" style={{ padding:'8px 12px', fontSize:'0.82rem' }} onClick={()=>shareEvent(ev)}>
                    <Share2 size={14}/> Share
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(61,43,31,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            style={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:20, padding:28, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ margin:0 }}>Create New Event</h3>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={createEvent} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div><label className="ds-label">Event Title</label><input className="ds-input" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="AI Summit 2025"/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label className="ds-label">Date</label><input className="ds-input" type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
                <div><label className="ds-label">Time</label><input className="ds-input" type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label className="ds-label">Type</label>
                  <select className="ds-input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                    <option value="virtual">Virtual</option><option value="in-person">In-Person</option><option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div><label className="ds-label">Max Attendees</label><input className="ds-input" type="number" min="1" value={form.max_attendees} onChange={e=>setForm({...form,max_attendees:e.target.value})}/></div>
              </div>
              <div><label className="ds-label">Location / Link</label><input className="ds-input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Zoom link or venue"/></div>
              <div><label className="ds-label">Description</label><textarea className="ds-input" rows={3} required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{ resize:'vertical' }}/></div>
              <div><label className="ds-label">Tags (comma separated)</label><input className="ds-input" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="Networking, AI, Career"/></div>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="button" className="ds-btn ds-btn-ghost" style={{ flex:1 }} onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="ds-btn ds-btn-primary" style={{ flex:1 }}>Create Event</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Events;
