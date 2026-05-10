import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Bot, TrendingUp, Globe, Briefcase, Target, BarChart3,
  ArrowRight, Users, Star, Zap, ChevronDown, Menu, X,
  CheckCircle, Network, MessageSquare, Award, Rocket, Shield,
  Send
} from 'lucide-react';

const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: '3rem', background: 'rgba(196, 149, 106,0.08)', border: '1px solid rgba(196, 149, 106,0.3)', borderRadius: 20 }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg, #C4956A, #A67C52)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={32} color="#fff" />
        </div>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Message Sent! ðŸŽ‰</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>Thank you for reaching out. Our team will get back to you within 2 hours.</p>
        <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
          style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #C4956A, #A67C52)', border: 'none', color: 'var(--text-primary)', padding: '10px 24px', borderRadius: 20, cursor: 'pointer', fontWeight: 600 }}>
          Send Another
        </button>
      </motion.div>
    );
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, padding: '12px 16px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
    fontFamily: "'Inter', sans-serif", boxSizing: 'border-box', transition: 'border-color 0.3s'
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(196, 149, 106,0.2)', borderRadius: 24, padding: '2.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', display: 'block', marginBottom: 6 }}>Your Name</label>
          <input required style={inputStyle} placeholder="John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
        </div>
        <div>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', display: 'block', marginBottom: 6 }}>Email Address</label>
          <input required type="email" style={inputStyle} placeholder="john@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
        </div>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', display: 'block', marginBottom: 6 }}>Subject</label>
        <input required style={inputStyle} placeholder="How can we help?" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
          onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', display: 'block', marginBottom: 6 }}>Message</label>
        <textarea required rows={5} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tell us more..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
      </div>
      <motion.button type="submit" disabled={sending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        style={{
          width: '100%', background: 'linear-gradient(135deg, #C4956A, #A67C52)', border: 'none', color: 'var(--text-primary)',
          padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit'
        }}>
        {sending ? 'Sending...' : <><Send size={18} /> Send Message</>}
      </motion.button>
    </form>
  );
};

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -80]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Bot size={28} />,
      title: 'AI-Powered Mapping',
      desc: 'Our advanced algorithm analyzes your profile, skills, and career goals to find perfect alumni matches.',
      color: 'var(--brand-teal)'
    },
    {
      icon: <TrendingUp size={28} />,
      title: 'Career Intelligence',
      desc: 'Get personalized insights about industry trends, salary benchmarks, and growth opportunities.',
      color: 'var(--brand-teal)'
    },
    {
      icon: <Globe size={28} />,
      title: 'Global Network',
      desc: 'Connect with alumni worldwide across different industries, companies, and career stages.',
      color: 'var(--text-secondary)'
    },
    {
      icon: <Briefcase size={28} />,
      title: 'Job Opportunities',
      desc: 'Access exclusive job postings and get referrals from your trusted network connections.',
      color: '#B35656'
    },
    {
      icon: <Target size={28} />,
      title: 'Mentorship Programs',
      desc: 'Find mentors or become one. Share knowledge and accelerate career growth together.',
      color: 'var(--brand-teal)'
    },
    {
      icon: <BarChart3 size={28} />,
      title: 'Analytics Dashboard',
      desc: 'Track your networking progress with detailed analytics and actionable insights.',
      color: 'var(--brand-teal)'
    }
  ];

  const testimonials = [
    {
      name: 'Anika Sharma',
      role: 'Senior Engineer, Google',
      img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
      text: 'RootsReconnect helped me land my dream job through a referral from an alumni connection. The AI matching is spot-on!'
    },
    {
      name: 'Marcus Johnson',
      role: 'Product Manager, Meta',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      text: 'I found an incredible mentor through this platform. My career trajectory changed completely within 6 months.'
    },
    {
      name: 'Priya Patel',
      role: 'Founder, TechStart',
      img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
      text: 'The alumni network helped me raise seed funding for my startup. This platform is genuinely life-changing.'
    }
  ];

  const stats = [
    { value: '15K+', label: 'Active Alumni', icon: <Users size={24} /> },
    { value: '95%', label: 'Match Success Rate', icon: <Star size={24} /> },
    { value: '500+', label: 'Partner Companies', icon: <Briefcase size={24} /> },
    { value: '50+', label: 'Countries', icon: <Globe size={24} /> }
  ];

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: "'Inter', -apple-system, sans-serif", overflowX: 'hidden' }}>

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 1000,
        background: scrolled ? 'rgba(0,0,0,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(196, 149, 106,0.3)' : 'none',
        transition: 'all 0.4s ease',
        padding: '1rem 0'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #C4956A, #A67C52)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(196, 149, 106,0.5)'
            }}>
              <Network size={18} color="#fff" />
            </div>
            <span style={{
              fontSize: '1.6rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #C4956A, #A67C52)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>RootsReconnect</span>
          </motion.div>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
            {['Features', 'About', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{
                color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem',
                transition: 'color 0.3s'
              }}
                onMouseEnter={e => e.target.style.color = '#A67C52'}
                onMouseLeave={e => e.target.style.color = '#BED4CB'}
              >{item}</a>
            ))}
            <Link to="/auth" style={{
              background: 'linear-gradient(135deg, #C4956A, #A67C52)',
              color: 'var(--text-primary)', padding: '10px 24px', borderRadius: 30,
              textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem',
              transition: 'transform 0.3s, box-shadow 0.3s',
              boxShadow: '0 4px 20px rgba(196, 149, 106,0.4)'
            }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(196, 149, 106,0.6)'; }}
              onMouseLeave={e => { e.target.style.transform = ''; e.target.style.boxShadow = '0 4px 20px rgba(196, 149, 106,0.4)'; }}
            >Sign In</Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'none' }} className="mobile-menu-btn">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'var(--bg-elevated)', padding: '1rem 24px', borderTop: '1px solid rgba(196, 149, 106,0.3)' }}
          >
            {['Features', 'About', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                style={{ display: 'block', color: 'var(--text-secondary)', textDecoration: 'none', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {item}
              </a>
            ))}
            <Link to="/auth" onClick={() => setMenuOpen(false)}
              style={{ display: 'block', color: 'var(--brand-teal)', textDecoration: 'none', padding: '0.75rem 0', fontWeight: 600 }}>
              Sign In â†’
            </Link>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Background Image */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.15)'
        }} />
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'radial-gradient(ellipse at 70% 50%, rgba(196, 149, 106,0.25) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(196, 149, 106,0.15) 0%, transparent 50%)'
        }} />

        <motion.div
          style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2, y: heroY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(196, 149, 106,0.15)', border: '1px solid rgba(196, 149, 106,0.4)',
                  color: 'var(--brand-teal)', padding: '6px 16px', borderRadius: 30,
                  fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem'
                }}>
                  <Zap size={14} /> AI-Powered Alumni Networking
                </span>
                <h1 style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem',
                  background: 'linear-gradient(135deg, #fff 40%, #A67C52 70%, #C4956A 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                  Reconnect.<br />Grow.<br />Succeed.
                </h1>
                <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.7, maxWidth: 480 }}>
                  Join thousands of professionals building meaningful connections through intelligent alumni matching and career acceleration.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link to="/auth" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'linear-gradient(135deg, #C4956A, #A67C52)',
                    color: 'var(--text-primary)', padding: '14px 32px', borderRadius: 30,
                    textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
                    boxShadow: '0 8px 30px rgba(196, 149, 106,0.5)',
                    transition: 'transform 0.3s, box-shadow 0.3s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(196, 149, 106,0.7)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 30px rgba(196, 149, 106,0.5)'; }}
                  >
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                  <a href="#features" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'transparent', color: 'var(--text-secondary)',
                    padding: '14px 32px', borderRadius: 30,
                    textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
                    border: '1px solid rgba(190,212,203,0.4)',
                    transition: 'all 0.3s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#A67C52'; e.currentTarget.style.color = '#A67C52'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(190,212,203,0.4)'; e.currentTarget.style.color = '#BED4CB'; }}
                  >
                    Explore Features
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Hero Right - Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              style={{ position: 'relative', height: 480 }}
            >
              <div style={{ position: 'relative', height: '100%' }}>
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=280&fit=crop"
                  alt="Professional networking"
                  style={{ position: 'absolute', top: 0, right: 0, width: 280, height: 200, objectFit: 'cover', borderRadius: 20, border: '2px solid rgba(196, 149, 106,0.4)' }}
                />
                <img
                  src="https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=300&h=200&fit=crop"
                  alt="Alumni event"
                  style={{ position: 'absolute', bottom: 60, left: 0, width: 240, height: 180, objectFit: 'cover', borderRadius: 20, border: '2px solid rgba(196, 149, 106,0.4)' }}
                />
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop"
                  alt="Career success"
                  style={{ position: 'absolute', bottom: 0, right: 60, width: 160, height: 160, objectFit: 'cover', borderRadius: 20, border: '2px solid rgba(135,182,188,0.4)' }}
                />
                {/* Floating Badge */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', top: 160, left: 80,
                    background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(196, 149, 106,0.5)',
                    borderRadius: 16, padding: '12px 20px', backdropFilter: 'blur(20px)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #C4956A, #A67C52)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Network size={18} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>New Match Found!</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--brand-teal)' }}>97% compatibility</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 2, cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <ChevronDown size={32} color="rgba(255,255,255,0.4)" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section style={{ background: 'linear-gradient(180deg, #000 0%, #0a0a0a 100%)', padding: '80px 0', borderTop: '1px solid rgba(196, 149, 106,0.2)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              style={{ padding: '2rem 1rem' }}
            >
              <div style={{ color: 'var(--brand-teal)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #C4956A, #A67C52)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>{stat.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '100px 0', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: 'var(--brand-teal)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: 2, textTransform: 'uppercase' }}>Why Choose Us</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, margin: '1rem 0', color: 'var(--text-primary)' }}>
              Built for Modern<br />
              <span style={{ background: 'linear-gradient(135deg, #C4956A, #A67C52)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Professional Growth</span>
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Powerful features designed to accelerate your career and build lasting professional relationships.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                viewport={{ once: true }}
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06))',
                  border: `1px solid rgba(${feat.color === '#C4956A' ? '153,41,234' : feat.color === '#A67C52' ? '255,95,207' : feat.color === '#F5ECD7' ? '135,182,188' : '179,86,86'},0.25)`,
                  borderRadius: 20, padding: '2rem',
                  cursor: 'pointer', backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `${feat.color}20`, border: `1px solid ${feat.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: feat.color, marginBottom: '1.25rem'
                }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '100px 0', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196, 149, 106,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '5rem' }}
          >
            <span style={{ color: 'var(--brand-teal)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: 2, textTransform: 'uppercase' }}>Simple Process</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--text-primary)', margin: '1rem 0' }}>
              Start in 3 Simple Steps
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem', position: 'relative' }}>
            {[
              { num: '01', icon: <Users size={32} />, title: 'Create Your Profile', desc: 'Add your education, skills, and career goals to build your professional identity.' },
              { num: '02', icon: <Bot size={32} />, title: 'Get AI Matches', desc: 'Our AI analyzes your profile and suggests the most relevant alumni connections.' },
              { num: '03', icon: <Rocket size={32} />, title: 'Start Growing', desc: 'Connect, collaborate, attend events, and accelerate your career journey.' }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                style={{ textAlign: 'center', position: 'relative' }}
              >
                {i < 2 && (
                  <div style={{
                    position: 'absolute', top: 40, right: '-50%', width: '100%', height: 2,
                    background: 'linear-gradient(90deg, rgba(196, 149, 106,0.6), transparent)',
                    zIndex: 0
                  }} />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '4rem', fontWeight: 900, color: 'rgba(196, 149, 106,0.15)', lineHeight: 1, marginBottom: '-1rem' }}>{step.num}</div>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1.5rem',
                    background: 'linear-gradient(135deg, rgba(196, 149, 106,0.2), rgba(196, 149, 106,0.2))',
                    border: '1px solid rgba(196, 149, 106,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--brand-teal)'
                  }}>
                    {step.icon}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '100px 0', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: 'var(--brand-teal)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: 2, textTransform: 'uppercase' }}>Success Stories</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--text-primary)', margin: '1rem 0' }}>
              What Our Members Say
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                style={{
                  background: 'linear-gradient(145deg, rgba(196, 149, 106,0.08), rgba(196, 149, 106,0.04))',
                  border: '1px solid rgba(196, 149, 106,0.2)',
                  borderRadius: 20, padding: '2rem', position: 'relative'
                }}
              >
                <div style={{ color: 'var(--brand-teal)', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="#C4956A" style={{ display: 'inline', marginRight: 2 }} />)}
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '0.95rem' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={t.img} alt={t.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(196, 149, 106,0.4)' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{t.name}</div>
                    <div style={{ color: 'var(--brand-teal)', fontSize: '0.8rem' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '100px 0', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.08)'
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(196, 149, 106,0.3) 0%, rgba(196, 149, 106,0.2) 100%)'
        }} />
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #C4956A, #A67C52)', marginBottom: '2rem', boxShadow: '0 0 40px rgba(196, 149, 106,0.5)' }}>
              <Award size={36} color="#fff" />
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Ready to Transform Your Career?
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
              Join 15,000+ professionals already growing their careers with RootsReconnect. It's free to start.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/auth" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #C4956A, #A67C52)',
                color: 'var(--text-primary)', padding: '16px 40px', borderRadius: 30,
                textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem',
                boxShadow: '0 8px 30px rgba(196, 149, 106,0.5)', transition: 'transform 0.3s'
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                Start For Free <ArrowRight size={18} />
              </Link>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              {['No credit card required', 'Free forever plan', 'Cancel anytime'].map(item => (
                <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <CheckCircle size={14} color="#C4956A" /> {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{ padding: '100px 0', background: 'linear-gradient(180deg, #050505 0%, #080010 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196, 149, 106,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span style={{ color: 'var(--brand-teal)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: 2, textTransform: 'uppercase' }}>Our Mission</span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--text-primary)', margin: '1rem 0', lineHeight: 1.2 }}>
                Building Bridges Between<br />
                <span style={{ background: 'linear-gradient(135deg, #C4956A, #A67C52)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Generations of Talent</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '1rem' }}>
                RootsReconnect was born from a simple belief: that the most powerful career accelerant isn't what you know â€” it's who you know. We built an intelligent platform that makes meaningful professional connections accessible to everyone.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '1rem' }}>
                Founded by a team of ex-engineers, data scientists, and career professionals, we combine cutting-edge AI with a deep understanding of how genuine professional relationships work.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { icon: <Shield size={20} />, title: 'Privacy First', desc: 'Full control over your data and visibility' },
                  { icon: <Zap size={20} />, title: 'AI Powered', desc: 'Smart matching with 95%+ success rate' },
                  { icon: <Globe size={20} />, title: 'Global Reach', desc: 'Alumni in 50+ countries worldwide' },
                  { icon: <Award size={20} />, title: 'Award Winning', desc: 'Best Alumni Platform 2023 & 2024' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(196, 149, 106,0.06)', border: '1px solid rgba(196, 149, 106,0.15)', borderRadius: 12 }}>
                    <div style={{ color: 'var(--brand-teal)', marginTop: 2, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{item.title}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ position: 'relative' }}
            >
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=500&fit=crop"
                alt="Team collaboration"
                style={{ width: '100%', borderRadius: 24, border: '1px solid rgba(196, 149, 106,0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
              />
              <div style={{
                position: 'absolute', bottom: -20, left: -20,
                background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(196, 149, 106,0.4)',
                borderRadius: 16, padding: '16px 20px', backdropFilter: 'blur(20px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #C4956A, #A67C52)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={22} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>15,000+</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Members Worldwide</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Team */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginTop: '6rem', marginBottom: '3rem' }}
          >
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Meet Our Leadership</h3>
            <p style={{ color: 'var(--text-secondary)' }}>The people behind RootsReconnect's mission</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { name: 'Dr. Meera Krishnan', role: 'CEO & Co-Founder', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face', bio: 'Former Google AI researcher with 15+ years in machine learning.' },
              { name: 'Rahul Verma', role: 'CTO & Co-Founder', img: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop&crop=face', bio: 'Ex-Meta engineer who built social graph algorithms at scale.' },
              { name: 'Sarah Chen', role: 'Head of Product', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face', bio: 'Product visionary from LinkedIn with expertise in B2B platforms.' },
              { name: 'James Okafor', role: 'Head of Growth', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face', bio: 'Growth strategist who scaled 3 companies to 1M+ users.' }
            ].map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                whileHover={{ y: -6 }}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196, 149, 106,0.2)', borderRadius: 20, padding: '2rem', textAlign: 'center' }}
              >
                <img src={member.img} alt={member.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(196, 149, 106,0.5)', marginBottom: '1rem' }} />
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{member.name}</div>
                <div style={{ color: 'var(--brand-teal)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{member.role}</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.6 }}>{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: '100px 0', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196, 149, 106,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--brand-teal)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: 2, textTransform: 'uppercase' }}>Get In Touch</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--text-primary)', margin: '1rem 0' }}>
              We'd Love to Hear<br />
              <span style={{ background: 'linear-gradient(135deg, #C4956A, #A67C52)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>From You</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>
              Have questions, feedback, or partnership inquiries? Our team responds within 2 hours.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '4rem', alignItems: 'start' }}>
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {[
                { icon: <MessageSquare size={22} />, title: 'Email Support', value: 'support@rootsreconnect.com', sub: 'Typical reply within 2 hours' },
                { icon: <Globe size={22} />, title: 'Headquarters', value: 'Bangalore, India', sub: 'Also in New York & London' },
                { icon: <Users size={22} />, title: 'Community', value: 'Join our Discord', sub: '12,000+ active members' }
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', padding: '1.25rem', background: 'rgba(196, 149, 106,0.05)', border: '1px solid rgba(196, 149, 106,0.15)', borderRadius: 16 }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, rgba(196, 149, 106,0.2), rgba(196, 149, 106,0.2))', border: '1px solid rgba(196, 149, 106,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-teal)', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{item.value}</div>
                    <div style={{ color: 'var(--brand-teal)', fontSize: '0.8rem' }}>{item.sub}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid rgba(196, 149, 106,0.2)', padding: '60px 0 30px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg, #C4956A, #A67C52)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block', marginBottom: '1rem' }}>RootsReconnect</span>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem', maxWidth: 260 }}>
                Connecting alumni worldwide through intelligent networking and AI-powered career acceleration.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                {[MessageSquare, Globe, Shield].map((Icon, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(196, 149, 106,0.15)', border: '1px solid rgba(196, 149, 106,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.3s' }}>
                    <Icon size={16} color="#C4956A" />
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Demo', 'API'] },
              { title: 'Company', links: ['About', 'Careers', 'Blog', 'Contact'] },
              { title: 'Support', links: ['Help Center', 'Privacy', 'Terms', 'Status'] }
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {col.links.map(link => (
                    <li key={link} style={{ marginBottom: '0.6rem' }}>
                      <a href={`#${link.toLowerCase().replace(' ', '-')}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.3s' }}
                        onMouseEnter={e => e.target.style.color = '#A67C52'}
                        onMouseLeave={e => e.target.style.color = '#F5ECD7'}
                      >{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Â© 2024 RootsReconnect. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Privacy', 'Terms', 'Cookies'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default Landing;

