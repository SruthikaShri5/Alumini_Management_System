import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Search, ArrowLeft, Sparkles, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Messages = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { if (activeConvo) fetchMessages(activeConvo.other_user); }, [activeConvo]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/messages/conversations', { headers: h });
      if (res.ok) { const d = await res.json(); setConversations(d.conversations || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchMessages = async (email) => {
    try {
      const res = await fetch(`/api/messages/${email}`, { headers: h });
      if (res.ok) { const d = await res.json(); setMessages(d.messages || []); }
    } catch (e) { console.error(e); }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConvo) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${activeConvo.other_user}`, {
        method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() }),
      });
      if (res.ok) {
        setMessages(prev => [...prev, { from_user: user.email, to_user: activeConvo.other_user, content: input.trim(), created_at: new Date().toISOString() }]);
        setInput('');
        setAiSuggestion('');
        fetchConversations();
      }
    } catch { toast.error('Failed to send'); }
    setSending(false);
  };

  const getAiSuggestion = async () => {
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Suggest a professional reply to continue a conversation with ${activeConvo?.other_name} who works at ${activeConvo?.other_company}. Keep it under 2 sentences.` }),
      });
      if (res.ok) { const d = await res.json(); setAiSuggestion(d.response?.slice(0, 200) || ''); }
    } catch { }
  };

  const startNewConvo = async () => {
    const email = prompt('Enter the email of the person you want to message:');
    if (!email) return;
    try {
      const res = await fetch(`/api/users/${email}`, { headers: h });
      if (res.ok) {
        const u = await res.json();
        const convo = { other_user: email, other_name: u.full_name, other_company: u.company || '', other_sector: u.sector || '', last_message: '', last_time: '' };
        setConversations(prev => [convo, ...prev.filter(c => c.other_user !== email)]);
        setActiveConvo(convo);
        setMessages([]);
      } else { toast.error('User not found'); }
    } catch { toast.error('User not found'); }
  };

  const filtered = conversations.filter(c => c.other_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Messages</h1>
        <button className="ds-btn ds-btn-primary" onClick={startNewConvo}><MessageCircle size={15} /> New Message</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, height: '70vh' }}>
        {/* Sidebar */}
        <div className="ds-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', borderRadius: 8, padding: '8px 12px' }}>
              <Search size={14} color="var(--text-muted)" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..."
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.85rem', color: 'var(--text-primary)', width: '100%' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              [0,1,2].map(i => <div key={i} className="ds-skeleton" style={{ height: 60, margin: '8px 12px', borderRadius: 10 }} />)
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <MessageCircle size={32} style={{ marginBottom: 8 }} /><br />No conversations yet
              </div>
            ) : filtered.map(c => (
              <div key={c.other_user} onClick={() => setActiveConvo(c)}
                style={{ padding: '12px 14px', cursor: 'pointer', background: activeConvo?.other_user === c.other_user ? 'var(--bg-elevated)' : 'transparent', borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (activeConvo?.other_user !== c.other_user) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (activeConvo?.other_user !== c.other_user) e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="ds-avatar ds-avatar-sm">{(c.other_name || 'U')[0]}</div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{c.other_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last_message || c.other_company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="ds-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!activeConvo ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <MessageCircle size={48} style={{ marginBottom: 12 }} />
              <p>Select a conversation or start a new one</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="ds-avatar ds-avatar-md">{(activeConvo.other_name || 'U')[0]}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activeConvo.other_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeConvo.other_company} · {activeConvo.other_sector}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
                    Start the conversation with {activeConvo.other_name}
                  </div>
                )}
                {messages.map((m, i) => {
                  const mine = m.from_user === user.email;
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: mine ? 'var(--gradient-brand)' : 'var(--bg-elevated)', color: mine ? '#fff' : 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                        {m.content}
                        <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 4, textAlign: mine ? 'right' : 'left' }}>
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* AI Suggestion */}
              {aiSuggestion && (
                <div style={{ padding: '8px 16px', background: 'rgba(196,149,106,0.08)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Sparkles size={14} color="var(--brand-teal)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1 }}>{aiSuggestion}</span>
                  <button className="ds-btn ds-btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setInput(aiSuggestion)}>Use</button>
                  <button onClick={() => setAiSuggestion('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                </div>
              )}

              {/* Input */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="ds-btn ds-btn-ghost" style={{ padding: '8px', flexShrink: 0 }} onClick={getAiSuggestion} title="AI suggestion">
                  <Sparkles size={16} />
                </button>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..." className="ds-input" style={{ flex: 1 }} />
                <button className="ds-btn ds-btn-primary" style={{ padding: '10px 16px', flexShrink: 0 }} onClick={sendMessage} disabled={sending || !input.trim()}>
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
