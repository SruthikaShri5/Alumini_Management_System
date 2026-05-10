import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, Target, Lightbulb, Award, BookOpen,
  Users, ArrowRight, Brain, Zap, BarChart2, CheckCircle,
  Clock, DollarSign, ChevronRight, Rocket, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const TAB_CONFIG = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'paths', label: 'Career Paths', icon: Target },
  { id: 'skills', label: 'Skill Gaps', icon: Zap },
  { id: 'learning', label: 'Learning Path', icon: BookOpen },
];

const CareerAdvisor = ({ user }) => {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { generateAdvice(); }, []);

  const generateAdvice = () => {
    const role = user?.role || 'student';
    const careerPaths = {
      student: [
        { title: 'Software Engineer', match: 85, growth: '+15%', salary: '$95K–$130K', demand: 'High' },
        { title: 'Data Analyst', match: 78, growth: '+12%', salary: '$70K–$95K', demand: 'High' },
        { title: 'Product Manager', match: 72, growth: '+18%', salary: '$110K–$150K', demand: 'Very High' },
      ],
      alumni: [
        { title: 'Senior Engineer', match: 88, growth: '+20%', salary: '$140K–$180K', demand: 'Very High' },
        { title: 'Tech Lead', match: 82, growth: '+22%', salary: '$160K–$200K', demand: 'High' },
        { title: 'Engineering Manager', match: 75, growth: '+25%', salary: '$180K–$220K', demand: 'High' },
      ],
    };
    const skillGaps = {
      student: [
        { skill: 'System Design', priority: 'High', impact: '+25% match rate', weeks: 8 },
        { skill: 'Cloud Architecture', priority: 'High', impact: '+35% opportunities', weeks: 12 },
        { skill: 'Leadership', priority: 'Medium', impact: '+18% salary potential', weeks: 16 },
      ],
      alumni: [
        { skill: 'Strategic Planning', priority: 'High', impact: '+30% leadership roles', weeks: 10 },
        { skill: 'Team Management', priority: 'High', impact: '+40% senior positions', weeks: 8 },
        { skill: 'Executive Communication', priority: 'Medium', impact: '+22% visibility', weeks: 6 },
      ],
    };
    const recommendations = {
      student: [
        { type: 'course', title: 'AWS Solutions Architect', provider: 'AWS', duration: '3 months', url: '#' },
        { type: 'certification', title: 'Professional Scrum Master', provider: 'Scrum.org', duration: '1 month', url: '#' },
        { type: 'project', title: 'Build a Microservices App', provider: 'Self-paced', duration: '2 months', url: '#' },
      ],
      alumni: [
        { type: 'course', title: 'Executive Leadership', provider: 'Harvard Online', duration: '6 weeks', url: '#' },
        { type: 'certification', title: 'PMP Certification', provider: 'PMI', duration: '3 months', url: '#' },
        { type: 'mentorship', title: 'C-Level Mentorship Program', provider: 'RootsReconnect', duration: '6 months', url: '#' },
      ],
    };
    const yearsExp = new Date().getFullYear() - (user?.graduation_year || 2020);
    setAdvice({
      careerStage: role === 'student' ? 'Early Career' : 'Mid-Senior Level',
      yearsExp,
      careerPaths: careerPaths[role] || careerPaths.student,
      skillGaps: skillGaps[role] || skillGaps.student,
      recommendations: recommendations[role] || recommendations.student,
      networkingScore: 8.5,
      marketDemand: 'High',
      salaryGrowth: '+18%',
      profileStrength: 72,
    });
    setLoading(false);
  };

  const askAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.response || 'No response from AI.');
      } else {
        setAiResponse('AI service unavailable. Please try again.');
      }
    } catch {
      setAiResponse('Could not reach AI service. Check your connection.');
    }
    setAiLoading(false);
  };

  const typeIcon = (type) => {
    const map = { course: BookOpen, certification: Award, project: Lightbulb, mentorship: Users };
    const Icon = map[type] || BookOpen;
    return <Icon size={20} />;
  };

  const priorityColor = (p) => p === 'High' ? '#ef4444' : p === 'Medium' ? '#f59e0b' : 'var(--brand-green)';

  if (loading) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 400, justifyContent: 'center' }}>
        <div className="ds-spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Analyzing your career trajectory...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>AI Career Advisor</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
              Personalized career guidance powered by AI
            </p>
          </div>
          <span className="ds-badge ds-badge-green" style={{ marginLeft: 'auto' }}>
            <Sparkles size={11} /> AI Active
          </span>
        </div>

        {/* Overview Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Career Stage', value: advice.careerStage, color: 'var(--brand-teal)' },
            { label: 'Experience', value: `${advice.yearsExp} Years`, color: 'var(--brand-green)' },
            { label: 'Market Demand', value: advice.marketDemand, color: '#4ade80' },
            { label: 'Salary Growth', value: advice.salaryGrowth, color: 'var(--brand-green)' },
          ].map((s, i) => (
            <div key={i} className="ds-card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* AI Ask Box */}
        <div className="ds-card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(78,141,156,0.08), rgba(133,199,154,0.05))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <MessageSquare size={16} color="var(--brand-teal)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Ask Your AI Advisor</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="ds-input"
              placeholder="e.g. How do I transition to a senior role? What skills should I focus on?"
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && askAI()}
              style={{ flex: 1 }}
            />
            <button className="ds-btn ds-btn-primary" onClick={askAI} disabled={aiLoading || !aiQuery.trim()}>
              {aiLoading ? <div className="ds-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><Sparkles size={15} /> Ask AI</>}
            </button>
          </div>
          <AnimatePresence>
            {aiResponse && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  marginTop: 14, padding: '14px 16px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 10,
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--brand-teal)', fontWeight: 600, fontSize: '0.8rem' }}>
                  <Brain size={13} /> AI Response
                </div>
                {aiResponse}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 20,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12, padding: 4,
          width: 'fit-content',
        }}>
          {TAB_CONFIG.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8,
                  background: active ? 'var(--bg-surface)' : 'transparent',
                  border: active ? '1px solid var(--border-default)' : '1px solid transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: active ? 600 : 500,
                  fontSize: '0.85rem', cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                }}>
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

            {/* Overview */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { icon: TrendingUp, color: '#4ade80', title: 'Career Momentum', text: "You're on an excellent trajectory! Your skills align well with market demands. Focus on leadership development to accelerate growth." },
                  { icon: Users, color: 'var(--brand-green)', title: 'Networking Power', text: `Your network score is ${advice.networkingScore}/10. Connect with 5 more senior professionals to unlock premium opportunities.` },
                  { icon: Lightbulb, color: '#f59e0b', title: 'Next Best Action', text: 'Complete the AWS Solutions Architect certification to increase your market value by 25% and unlock senior roles.' },
                ].map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <div key={i} className="ds-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: `${c.color}15`, border: `1px solid ${c.color}25`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: c.color,
                        }}>
                          <Icon size={17} />
                        </div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{c.title}</h3>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                    </div>
                  );
                })}

                {/* Profile Strength */}
                <div className="ds-card" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Profile Strength</span>
                    <span style={{ color: 'var(--brand-teal)', fontWeight: 700 }}>{advice.profileStrength}%</span>
                  </div>
                  <div className="ds-progress-bar">
                    <div className="ds-progress-fill" style={{ width: `${advice.profileStrength}%` }} />
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                    {['Add bio', 'Upload photo', 'Link LinkedIn', 'Add 5+ skills'].map((tip, i) => (
                      <span key={i} className="ds-badge ds-badge-teal" style={{ cursor: 'pointer' }}>
                        <CheckCircle size={10} /> {tip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Career Paths */}
            {activeTab === 'paths' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {advice.careerPaths.map((path, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                    className="ds-card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                    whileHover={{ x: 4 }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                      background: `rgba(78,141,156,${0.2 - idx * 0.04})`,
                      border: '1px solid var(--border-default)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-teal)',
                    }}>
                      #{idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px' }}>{path.title}</h3>
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--brand-green)' }}>Match: {path.match}%</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Growth: {path.growth}</span>
                        <span style={{ color: 'var(--brand-teal)' }}>{path.salary}</span>
                        <span className="ds-badge ds-badge-teal" style={{ fontSize: '0.68rem' }}>{path.demand} Demand</span>
                      </div>
                    </div>
                    <div style={{ width: 60 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Match</div>
                      <div className="ds-progress-bar">
                        <div className="ds-progress-fill" style={{ width: `${path.match}%` }} />
                      </div>
                    </div>
                    <ArrowRight size={18} color="var(--text-muted)" />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Skill Gaps */}
            {activeTab === 'skills' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {advice.skillGaps.map((s, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.08 }}
                    className="ds-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: `${priorityColor(s.priority)}15`,
                        border: `1px solid ${priorityColor(s.priority)}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: priorityColor(s.priority),
                      }}>
                        <Award size={17} />
                      </div>
                      <span className="ds-badge" style={{
                        background: `${priorityColor(s.priority)}12`,
                        color: priorityColor(s.priority),
                        border: `1px solid ${priorityColor(s.priority)}25`,
                        fontSize: '0.68rem',
                      }}>
                        {s.priority} Priority
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{s.skill}</h3>
                    <p style={{ color: 'var(--brand-green)', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>{s.impact}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      <Clock size={12} /> ~{s.weeks} weeks to learn
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Learning Path */}
            {activeTab === 'learning' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {advice.recommendations.map((rec, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                    className="ds-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                      background: 'var(--gradient-brand)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff',
                    }}>
                      {typeIcon(rec.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--brand-teal)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                        {rec.type}
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px' }}>{rec.title}</h3>
                      <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span>{rec.provider}</span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {rec.duration}</span>
                      </div>
                    </div>
                    <button className="ds-btn ds-btn-primary" style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                      onClick={() => toast.success(`Opening ${rec.title}...`)}>
                      Start
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default CareerAdvisor;
