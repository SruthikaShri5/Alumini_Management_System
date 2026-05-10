import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Minimize2, Maximize2, Briefcase, UserCheck, Calendar, FileText, Target, Zap, TrendingUp, Lightbulb, Sparkles } from 'lucide-react';

const AVATAR_EMOJI = '🤖';

// Augment-style action buttons
const augmentActions = [
  { id: 'profile', label: 'Augment Profile', icon: FileText, color: '#8B5CF6', description: 'Analyze & improve' },
  { id: 'jobs', label: 'Find Jobs', icon: Briefcase, color: '#10B981', description: 'AI-matched' },
  { id: 'network', label: 'Network', icon: UserCheck, color: '#3B82F6', description: 'Strategic connects' },
  { id: 'events', label: 'Events', icon: Calendar, color: '#F59E0B', description: 'Recommended' },
  { id: 'plan', label: 'Career Plan', icon: Target, color: '#EC4899', description: '90-day roadmap' },
  { id: 'insights', label: 'Insights', icon: Zap, color: '#06B6D4', description: 'Real-time analytics' }
];

const CareerAdvisorAvatar = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `🤖 **I'm Augment, your AI Career Agent!**

I'm powered by real AI and can help you with:

🎯 **Career Advice** - Personalized guidance based on your profile
🔍 **Job Search** - Find opportunities that match your skills
🔗 **Alumni Mapping** - Connect with alumni from your organization
📈 **Skill Development** - Identify gaps and learning paths
📋 **Career Planning** - Create actionable roadmaps
🏛️ **Government Jobs** - Explore public sector opportunities
🌾 **Rural Support** - Special assistance for rural students

Just ask me anything about your career!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAugment: true
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [isBouncing, setIsBouncing] = useState(true);
  const [currentAction, setCurrentAction] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current && open && !minimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  useEffect(() => {
    const timeout = setTimeout(() => setIsBouncing(false), 6000);
    return () => clearTimeout(timeout);
  }, []);

  const callAugmentAPI = async (action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/agent/actions?action=${action}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Augment API error:', error);
    }
    return null;
  };

  const formatAugmentResponse = (action, data) => {
    if (!data) return "⚠️ Unable to augment that. Please try again.";

    if (action === 'profile') {
      return `📊 **Profile Augmentation Complete**

**Score:** ${data.profile_score}/100 (Grade: ${data.grade})

**Improvements:**` + 
        (data.improvements?.map((imp, i) => `\n${i+1}. ${imp.action} (${imp.impact} impact)`).join('') || '\nNo improvements needed!');
    }

    if (action === 'jobs') {
      let response = `🎯 **Job Search Augmented**

Found ${data.total_found} opportunities. **Top Matches:**

`;
      data.top_matches?.slice(0, 3).forEach((job, i) => {
        response += `${i+1}. **${job.title}** at ${job.company}
   Match: ${job.match_score}% | 📍 ${job.location}
   Skills: ${job.matched_skills?.join(', ')}
   Strategy: ${job.apply_strategy}

`;
      });
      response += `\n📈 Insights: Your strengths are ${data.search_insights?.your_strengths?.join(', ')}`;
      return response;
    }

    if (action === 'network') {
      let response = `🔗 **Network Augmented**

${data.total_suggested} strategic connections found:

`;
      data.priority_connections?.slice(0, 3).forEach((conn, i) => {
        response += `${i+1}. **${conn.name}** - ${conn.title} at ${conn.company}
   Value: ${conn.value_score}% | ${conn.reason}
   📝 "${conn.reach_out_template?.substring(0, 80)}..."

`;
      });
      return response;
    }

    if (action === 'events') {
      let response = `📅 **Events Augmented**

Recommended for you:

`;
      data.recommended?.slice(0, 3).forEach((event, i) => {
        response += `${i+1}. **${event.title}**
   📅 ${event.date} | 📍 ${event.location}
   Relevance: ${event.relevance_score}%
   Why: ${event.why_attend}

`;
      });
      return response;
    }

    if (action === 'plan') {
      let response = `📋 **Career Plan Augmented**

**Goal:** ${data.career_goal} | **Timeline:** ${data.timeline}

`;
      data.weekly_actions?.slice(0, 4).forEach(week => {
        response += `**Week ${week.week}:** ${week.focus}\n`;
        week.tasks.forEach(task => {
          response += `   ✓ ${task}\n`;
        });
        response += '\n';
      });
      return response;
    }

    if (action === 'insights') {
      return `📈 **Career Insights Augmented**

**Market Position:** ${data.market_position?.demand}
**Your Advantages:** ${data.advantages?.join(', ') || 'Multiple'}
**Gaps to Close:** ${data.gaps_to_close?.join(', ')}

**AI Recommendations:**
` + (data.ai_recommendations?.map(r => `• ${r}`).join('\n') || '');
    }

    return JSON.stringify(data, null, 2);
  };

  const sendAction = async (actionId) => {
    setCurrentAction(actionId);
    setTyping(true);
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const action = augmentActions.find(a => a.id === actionId);
    
    // Add user message
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: `Augment my ${actionId}!`, 
      time 
    }]);

    try {
      const data = await callAugmentAPI(actionId);
      const responseText = formatAugmentResponse(actionId, data);
      
      setTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAugment: true,
        showActions: true
      }]);
    } catch (error) {
      setTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "⚠️ I couldn't process that request. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAugment: true
      }]);
    }
    
    setCurrentAction(null);
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: userMsg, time }]);
    setTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg })
      });
      
      let responseText = "I can help you with:\n\n🎯 Jobs - Find matching opportunities\n🔗 Network - Build strategic connections\n📅 Events - Discover recommended events\n📋 Plan - Create career roadmap\n📊 Insights - Get real-time analytics\n\nOr just ask me anything!";
      
      if (response.ok) {
        const data = await response.json();
        responseText = data.response || responseText;
      }

      setTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAugment: true,
        showActions: true
      }]);
    } catch (error) {
      setTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I'm here to augment your career! Click one of the action buttons above or ask me anything.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAugment: true
      }]);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getUserContext = () => {
    if (!user) return 'Guest';
    const role = user.role === 'student' ? 'Student' : 'Alumni';
    const year = user.graduation_year ? `, Class of ${user.graduation_year}` : '';
    return `${user.full_name || role}${year}`;
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setOpen(true); setIsBouncing(false); }}
            style={{
              position: 'fixed',
              bottom: 100,
              right: 28,
              zIndex: 9998,
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: 0
            }}
          >
            <motion.div
              animate={isBouncing ? {
                y: [0, -8, 0, -4, 0],
                rotate: [0, 10, -10, 0]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontSize: '2rem', lineHeight: 1 }}
            >
              {AVATAR_EMOJI}
            </motion.div>
            {isBouncing && (
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '50%',
                  border: '2px solid rgba(139, 92, 246, 0.6)',
                  pointerEvents: 'none'
                }}
              />
            )}
            <div style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#10B981',
              border: '2px solid #fff'
            }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 28,
              right: 28,
              zIndex: 9999,
              width: 420,
              borderRadius: 24,
              background: '#0f0f1a',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 60px rgba(139, 92, 246, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: minimized ? 'auto' : 700,
              fontFamily: "'Inter', -apple-system, sans-serif"
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexShrink: 0
            }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ position: 'relative', flexShrink: 0 }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fff, #e0e0e0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  border: '2px solid rgba(255,255,255,0.4)'
                }}>
                  🤖
                </div>
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#10B981', border: '2px solid #8B5CF6' }} />
              </motion.div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Augment</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>AI Career Agent • Active</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setMinimized(!minimized)}
                  style={{ background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                >
                  {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Augment Actions Bar */}
                <div style={{
                  padding: '10px 12px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  flexShrink: 0
                }}>
                  {augmentActions.map(action => (
                    <motion.button
                      key={action.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => sendAction(action.id)}
                      disabled={typing}
                      style={{
                        background: currentAction === action.id ? action.color : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${action.color}40`,
                        borderRadius: 12,
                        padding: '8px 12px',
                        cursor: typing ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        flexShrink: 0,
                        minWidth: 70
                      }}
                    >
                      <action.icon size={18} color={action.color} />
                      <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 600 }}>{action.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12, background: '#0f0f1a', maxHeight: 420 }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
                      {msg.role === 'assistant' && (
                        <div style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          flexShrink: 0
                        }}>
                          🤖
                        </div>
                      )}
                      <div style={{ maxWidth: '82%' }}>
                        <div style={{
                          background: msg.role === 'user' ? 'linear-gradient(135deg, #8B5CF6, #6366F1)' : 'rgba(255,255,255,0.06)',
                          border: msg.role === 'user' ? 'none' : '1px solid rgba(139, 92, 246, 0.2)',
                          borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          padding: '10px 14px',
                          color: '#fff',
                          fontSize: '0.8rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap'
                        }}>
                          {msg.text}
                        </div>
                        <div style={{ color: '#555', fontSize: '0.65rem', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</div>
                      </div>
                    </div>
                  ))}

                  {typing && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}>
                        🤖
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '18px 18px 18px 4px',
                        padding: '12px 16px',
                        display: 'flex',
                        gap: 4,
                        alignItems: 'center'
                      }}>
                        {[0, 1, 2].map(d => (
                          <motion.div
                            key={d}
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                            style={{ width: 7, height: 7, borderRadius: '50%', background: '#8B5CF6' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* User Context */}
                {user && (
                  <div style={{
                    padding: '8px 14px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderTop: '1px solid rgba(139, 92, 246, 0.1)',
                    fontSize: '0.7rem',
                    color: '#8B5CF6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <Zap size={12} />
                    <span>Augmenting: {getUserContext()}</span>
                  </div>
                )}

                {/* Input */}
                <div style={{
                  padding: '12px 14px',
                  borderTop: '1px solid rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  background: '#141428'
                }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask Augment anything..."
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: '0.875rem',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: 'none',
                      background: input.trim() ? 'linear-gradient(135deg, #8B5CF6, #6366F1)' : 'rgba(255,255,255,0.1)',
                      cursor: input.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.3s',
                      flexShrink: 0
                    }}
                  >
                    <Send size={16} color="#fff" />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CareerAdvisorAvatar;
