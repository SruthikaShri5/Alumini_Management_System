import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Minimize2, Maximize2, Bot } from 'lucide-react';

const AVATAR_IMG = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face';

const knowledgeBase = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'howdy'],
    response: "Hi there! 👋 I'm Aria, RootsReconnect's AI assistant. I'm here to help you navigate the platform, answer questions about alumni networking, job opportunities, and more. What can I help you with today?"
  },
  {
    keywords: ['what is', 'about', 'rootsreconnect', 'platform', 'explain'],
    response: "RootsReconnect is an alumni networking platform that connects students with alumni from their institution. 🌐 We help rural students connect with alumni for mentorship, career guidance, and job opportunities. Government sector professionals can also join to help students."
  },
  {
    keywords: ['ai match', 'matching', 'algorithm', 'how match'],
    response: "Our Alumni Mapping feature helps you find alumni from your institution. Alumni can only approve connection requests from students of their organization. Rural students get priority in matching! Government sector alumni are also available to help."
  },
  {
    keywords: ['job', 'jobs', 'career', 'employment', 'opportunity', 'opportunities', 'hiring'],
    response: "The Job Board features exclusive listings from alumni-connected companies. 💼 You can filter by industry, location, salary, and role type. Additionally, alumni within your network can refer you directly to open positions at their companies!"
  },
  {
    keywords: ['mentor', 'mentorship', 'guide', 'coach'],
    response: "Our Mentorship Program connects you with experienced professionals who've walked your path. 🎯 You can search for mentors by industry, company, or career stage. Conversely, if you're experienced, you can become a mentor and shape the next generation of professionals."
  },
  {
    keywords: ['event', 'events', 'webinar', 'meetup', 'conference', 'networking event'],
    response: "RootsReconnect hosts virtual and in-person events including webinars, workshops, alumni meetups, and career fairs. 📅 Browse upcoming events in the Events section, RSVP, and connect with attendees beforehand to maximize your experience."
  },
  {
    keywords: ['network', 'connect', 'connection', 'alumni'],
    response: "Your Network section shows all your connections, pending requests, and suggested alumni. 🔗 You can connect with people from your institution, industry, or based on AI suggestions. Build meaningful relationships through direct messaging and collaboration."
  },
  {
    keywords: ['analytics', 'stats', 'statistics', 'track', 'progress', 'insights'],
    response: "The Analytics Dashboard gives you real-time insights into your networking progress. 📊 Track profile views, connection growth, message response rates, and career trajectory. Use data-driven insights to optimize your networking strategy."
  },
  {
    keywords: ['profile', 'bio', 'resume', 'skills', 'edit profile'],
    response: "Your Profile is your professional identity on RootsReconnect. ✨ Add your education, work experience, skills, and career goals. A complete profile gets 5x more connection requests and better AI match recommendations. Head to the Profile section to update yours!"
  },
  {
    keywords: ['sign up', 'register', 'join', 'create account', 'get started', 'free'],
    response: "Getting started is completely free! 🚀 Click 'Get Started Free' or go to the Sign In page to create your account. We offer a forever-free plan that includes full access to the alumni network, job board, and basic AI matching."
  },
  {
    keywords: ['price', 'pricing', 'cost', 'paid', 'premium', 'subscription'],
    response: "RootsReconnect offers a free tier with core features, and premium plans for advanced AI matching, unlimited messaging, and priority access to exclusive job listings. 💎 The free plan is genuinely powerful and most users find it sufficient to start."
  },
  {
    keywords: ['privacy', 'secure', 'security', 'data', 'safe'],
    response: "Your privacy and security are our top priorities. 🔒 We use enterprise-grade encryption, never sell your data, and give you full control over your profile visibility. You can connect anonymously, control who sees your information, and delete your account anytime."
  },
  {
    keywords: ['contact', 'support', 'help', 'issue', 'problem', 'trouble'],
    response: "Need help? 🤝 You can reach our support team through the Contact section on the homepage, or email us at support@rootsreconnect.com. We typically respond within 2 hours. You can also scroll down on the homepage to find our contact form!"
  },
  {
    keywords: ['dashboard', 'home', 'overview'],
    response: "The Dashboard Home gives you a personalized overview of your activity — recent connections, upcoming events, job recommendations, AI match scores, and key metrics. 🏠 It's your command center for everything on the platform."
  },
  {
    keywords: ['country', 'international', 'global', 'worldwide'],
    response: "RootsReconnect has alumni from 50+ countries! 🌍 Our global network spans major tech hubs, financial centers, and emerging markets. You can filter connections by country or region to find alumni near you or build international relationships."
  },
  {
    keywords: ['thank', 'thanks', 'great', 'awesome', 'helpful'],
    response: "You're welcome! 😊 I'm always here to help. Feel free to ask me anything about RootsReconnect — features, your account, networking tips, or career advice. Is there anything else you'd like to know?"
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'quit'],
    response: "It was great chatting with you! 👋 Remember, I'm always here whenever you need help. Good luck with your networking journey on RootsReconnect — go build those connections! 🚀"
  }
];

const getResponse = (input) => {
  const lower = input.toLowerCase();
  for (const entry of knowledgeBase) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.response;
    }
  }
  return "That's a great question! 🤔 I'm still learning about that specific topic. For detailed assistance, please reach out to our support team at support@rootsreconnect.com, or scroll to our Contact section on the homepage. Meanwhile, I can help you with questions about our features, jobs, mentorship, events, and more!";
};

const suggestedQuestions = [
  "What is RootsReconnect?",
  "How does AI matching work?",
  "How do I find a mentor?",
  "Tell me about job opportunities"
];

const AIAvatar = () => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm Aria, your AI assistant at RootsReconnect. 👋 I can help you with questions about our platform, features, networking, and more. What would you like to know?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [pulse, setPulse] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current && open && !minimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  useEffect(() => {
    const timeout = setTimeout(() => setPulse(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: userMsg, time }]);
    setTyping(true);

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMsg }),
        });
        if (res.ok) {
          const data = await res.json();
          setTyping(false);
          setMessages(prev => [...prev, {
            role: 'assistant',
            text: data.response || 'I could not process that.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          return;
        }
      }
    } catch (e) { /* fall through to local */ }

    // Fallback to local knowledge base
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    const response = getResponse(userMsg);
    setTyping(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      text: response,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setOpen(true); setPulse(false); }}
            style={{
              position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4E8D9C, #85C79A)',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(78, 141, 156,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', padding: 0
            }}
          >
            <img src={AVATAR_IMG} alt="AI Assistant" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            {pulse && (
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: 'absolute', inset: -4, borderRadius: '50%',
                  border: '2px solid rgba(78, 141, 156,0.6)', pointerEvents: 'none'
                }}
              />
            )}
            <div style={{
              position: 'absolute', top: 2, right: 2,
              width: 16, height: 16, borderRadius: '50%',
              background: '#22c55e', border: '2px solid #000'
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
              position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
              width: 380, borderRadius: 20,
              background: 'var(--bg-surface, #0f1623)',
              border: '1px solid var(--border-strong, rgba(78,141,156,0.45))',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 60px rgba(78,141,156,0.15)',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              maxHeight: minimized ? 'auto' : 560,
              fontFamily: "'Inter', -apple-system, sans-serif"
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #4E8D9C, #85C79A)',
              padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 12,
              flexShrink: 0
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img src={AVATAR_IMG} alt="Aria" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }} />
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#22c55e', border: '2px solid #4E8D9C' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Aria</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>AI Assistant • Online</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setMinimized(!minimized)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                >
                  {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12, background: '#0d0d0d' }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
                      {msg.role === 'assistant' && (
                        <img src={AVATAR_IMG} alt="Aria" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div style={{ maxWidth: '78%' }}>
                        <div style={{
                          background: msg.role === 'user' ? 'linear-gradient(135deg, #4E8D9C, #85C79A)' : 'rgba(255,255,255,0.06)',
                          border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          padding: '10px 14px',
                          color: '#fff',
                          fontSize: '0.875rem',
                          lineHeight: 1.6
                        }}>
                          {msg.text}
                        </div>
                        <div style={{ color: '#555', fontSize: '0.7rem', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</div>
                      </div>
                    </div>
                  ))}

                  {typing && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                      <img src={AVATAR_IMG} alt="Aria" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '18px 18px 18px 4px', padding: '12px 16px',
                        display: 'flex', gap: 4, alignItems: 'center'
                      }}>
                        {[0, 1, 2].map(d => (
                          <motion.div key={d} animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                            style={{ width: 7, height: 7, borderRadius: '50%', background: '#4E8D9C' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {messages.length <= 1 && (
                  <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6, background: '#0d0d0d' }}>
                    {suggestedQuestions.map((q, i) => (
                      <button key={i} onClick={() => sendMessage(q)} style={{
                        background: 'rgba(78, 141, 156,0.12)', border: '1px solid rgba(78, 141, 156,0.3)',
                        borderRadius: 20, padding: '5px 12px', color: '#85C79A', fontSize: '0.75rem',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
                      }}
                        onMouseEnter={e => { e.target.style.background = 'rgba(78, 141, 156,0.25)'; }}
                        onMouseLeave={e => { e.target.style.background = 'rgba(78, 141, 156,0.12)'; }}
                      >{q}</button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div style={{
                  padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', gap: 10, alignItems: 'center', background: '#111'
                }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask me anything..."
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: '0.875rem',
                      outline: 'none', fontFamily: 'inherit'
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    style={{
                      width: 40, height: 40, borderRadius: '50%', border: 'none',
                      background: input.trim() ? 'linear-gradient(135deg, #4E8D9C, #85C79A)' : 'rgba(255,255,255,0.1)',
                      cursor: input.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.3s', flexShrink: 0
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

      <style>{`
        @media (max-width: 480px) {
          .aria-chat { width: calc(100vw - 32px) !important; right: 16px !important; bottom: 16px !important; }
        }
      `}</style>
    </>
  );
};

export default AIAvatar;
