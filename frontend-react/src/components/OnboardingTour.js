import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ArrowRight, ArrowLeft, Sparkles, Users, Briefcase,
  Brain, CheckCircle, Map, MessageCircle, Shield, Star,
  Zap, Rocket, Target
} from 'lucide-react';

const getTourSteps = (role) => {
  const base = [
    {
      title: 'Welcome to RootsReconnect!',
      desc: "You're now part of an AI-powered alumni network. Let's take a quick tour so you get the most out of the platform.",
      icon: Sparkles,
      color: '#C4956A',
      gradient: 'linear-gradient(135deg, #C4956A, #A67C52)',
      emoji: '🎉',
    },
  ];

  const studentSteps = [
    { title: 'Find Alumni Mentors', desc: 'Our AI matches you with professionals based on your skills, interests, and career goals. One click to connect.', icon: Map, color: '#8B6020', gradient: 'linear-gradient(135deg, #8B6020, #C4956A)', emoji: '🤝' },
    { title: 'Browse Job Opportunities', desc: 'See AI-matched job listings from alumni-connected companies. Apply directly or request a referral.', icon: Briefcase, color: '#5A7A3C', gradient: 'linear-gradient(135deg, #5A7A3C, #8B6020)', emoji: '💼' },
    { title: 'Upload Your Resume', desc: 'Use the Resume Parser to auto-fill your profile in seconds. AI extracts your skills, experience, and education.', icon: Brain, color: '#7A5030', gradient: 'linear-gradient(135deg, #7A5030, #C4956A)', emoji: '📄' },
    { title: 'Connect & Message', desc: 'Send connection requests and chat directly with alumni. Build real relationships, not just connections.', icon: MessageCircle, color: '#C4956A', gradient: 'linear-gradient(135deg, #C4956A, #A67C52)', emoji: '💬' },
  ];

  const alumniSteps = [
    { title: 'Post Jobs for Students', desc: 'Share opportunities from your company. Help students find their first role and give back to the community.', icon: Briefcase, color: '#8B6020', gradient: 'linear-gradient(135deg, #8B6020, #C4956A)', emoji: '📢' },
    { title: 'Mentor Students', desc: "Visit the Mentorship Hub to find students who match your expertise. Your guidance can change someone's career.", icon: Users, color: '#5A7A3C', gradient: 'linear-gradient(135deg, #5A7A3C, #8B6020)', emoji: '🎓' },
    { title: 'Create Events', desc: 'Host virtual or in-person networking events. Bring the community together and grow your influence.', icon: Star, color: '#7A5030', gradient: 'linear-gradient(135deg, #7A5030, #C4956A)', emoji: '🗓️' },
    { title: 'Expand Your Network', desc: 'Use Alumni Mapping to connect with peers from your sector. Build a strong professional network.', icon: Map, color: '#C4956A', gradient: 'linear-gradient(135deg, #C4956A, #A67C52)', emoji: '🌐' },
  ];

  const adminSteps = [
    { title: 'Manage Users', desc: 'The Admin Panel gives you full control. Approve registrations, edit users, and monitor platform activity.', icon: Shield, color: '#8B6020', gradient: 'linear-gradient(135deg, #8B6020, #C4956A)', emoji: '🛡️' },
    { title: 'Approve Students', desc: 'Students need your approval before accessing the platform. Check Pending Approvals regularly.', icon: CheckCircle, color: '#5A7A3C', gradient: 'linear-gradient(135deg, #5A7A3C, #8B6020)', emoji: '✅' },
    { title: 'Export Platform Data', desc: 'Download users, connections, events, and jobs as CSV for reporting and analysis.', icon: Target, color: '#7A5030', gradient: 'linear-gradient(135deg, #7A5030, #C4956A)', emoji: '📊' },
    { title: 'Monitor Analytics', desc: 'The Analytics page shows sector distribution, user growth, and engagement. Track platform health.', icon: Rocket, color: '#C4956A', gradient: 'linear-gradient(135deg, #C4956A, #A67C52)', emoji: '📈' },
  ];

  const roleSteps = role === 'admin' ? adminSteps : role === 'alumni' ? alumniSteps : studentSteps;

  return [
    ...base,
    ...roleSteps,
    {
      title: "You're all set!",
      desc: role === 'student'
        ? 'Start by finding alumni mentors or uploading your resume to auto-fill your profile.'
        : role === 'alumni'
        ? 'Start by posting a job or mentoring a student. Your impact starts now.'
        : 'Start by reviewing pending approvals in the Admin Panel.',
      icon: CheckCircle,
      color: '#5A7A3C',
      gradient: 'linear-gradient(135deg, #5A7A3C, #8B6020)',
      emoji: '🚀',
    },
  ];
};

const TOUR_KEY = 'rr_tour_completed_v2';

// Floating particles
const Particle = ({ delay, x, y, size }) => (
  <motion.div
    style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', background: 'rgba(196,149,106,0.4)', left: `${x}%`, top: `${y}%`, pointerEvents: 'none' }}
    animate={{ y: [0, -20, 0], opacity: [0.4, 0.8, 0.4], scale: [1, 1.3, 1] }}
    transition={{ duration: 2.5 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

const OnboardingTour = ({ user, onComplete }) => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done && user) setTimeout(() => setVisible(true), 900);
  }, [user]);

  const steps = getTourSteps(user?.role || 'student');
  const current = steps[step];
  const Icon = current.icon;
  const progress = ((step + 1) / steps.length) * 100;

  const complete = () => { localStorage.setItem(TOUR_KEY, '1'); setVisible(false); onComplete?.(); };
  const next = () => { if (step < steps.length - 1) { setDirection(1); setStep(s => s + 1); } else complete(); };
  const prev = () => { setDirection(-1); setStep(s => Math.max(0, s - 1)); };

  const slideVariants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 40 : -40, scale: 0.97 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -40 : 40, scale: 0.97 }),
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(61,43,31,0.6)', zIndex: 9000, backdropFilter: 'blur(4px)' }}
            onClick={complete}
          />

          {/* Card — positioned in upper-center */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            style={{
              position: 'fixed',
              top: '12%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9001,
              width: '100%',
              maxWidth: 500,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 28,
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(61,43,31,0.35), 0 0 0 1px rgba(196,149,106,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Gradient top banner */}
            <div style={{ position: 'relative', background: current.gradient, padding: '28px 28px 24px', overflow: 'hidden' }}>
              {/* Floating particles */}
              {[
                { delay: 0, x: 10, y: 20, size: 6 },
                { delay: 0.5, x: 80, y: 10, size: 4 },
                { delay: 1, x: 60, y: 70, size: 8 },
                { delay: 1.5, x: 30, y: 60, size: 5 },
                { delay: 0.8, x: 90, y: 50, size: 6 },
              ].map((p, i) => <Particle key={i} {...p} />)}

              {/* Glow circle */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Animated icon */}
                  <motion.div
                    key={step}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 14, stiffness: 260, delay: 0.1 }}
                    style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', backdropFilter: 'blur(8px)' }}
                  >
                    <Icon size={26} />
                  </motion.div>
                  <div>
                    <motion.div key={`emoji-${step}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                      style={{ fontSize: '1.5rem', lineHeight: 1, marginBottom: 4 }}>
                      {current.emoji}
                    </motion.div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Step {step + 1} of {steps.length}
                    </div>
                  </div>
                </div>
                <button onClick={complete} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', backdropFilter: 'blur(4px)' }}>
                  <X size={15} />
                </button>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 16, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'rgba(255,255,255,0.8)', borderRadius: 4 }} />
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '24px 28px 28px', position: 'relative', overflow: 'hidden' }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25, ease: 'easeOut' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 10, color: 'var(--text-primary)' }}>
                    {current.title}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 0, fontSize: '0.9rem' }}>
                    {current.desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Step dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '20px 0 20px' }}>
                {steps.map((_, i) => (
                  <motion.div key={i} onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
                    animate={{ width: i === step ? 24 : 8, background: i === step ? current.color : 'var(--border-default)' }}
                    transition={{ duration: 0.3 }}
                    style={{ height: 8, borderRadius: 4, cursor: 'pointer' }}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {step > 0 ? (
                  <button className="ds-btn ds-btn-ghost" style={{ flex: 1, padding: '11px' }} onClick={() => { setDirection(-1); prev(); }}>
                    <ArrowLeft size={15} /> Back
                  </button>
                ) : (
                  <button className="ds-btn ds-btn-ghost" style={{ flex: 1, padding: '11px', fontSize: '0.8rem' }} onClick={complete}>
                    Skip tour
                  </button>
                )}
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="ds-btn ds-btn-primary"
                  style={{ flex: 2, padding: '11px', background: current.gradient, border: 'none', fontSize: '0.9rem' }}
                  onClick={() => { setDirection(1); next(); }}
                >
                  {step === steps.length - 1
                    ? <><CheckCircle size={15} /> Get Started!</>
                    : <>Next <ArrowRight size={15} /></>
                  }
                </motion.button>
              </div>

              {/* Subtle tip */}
              {step === 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 12, marginBottom: 0 }}>
                  Click anywhere outside to dismiss · This tour won't show again
                </motion.p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const resetTour = () => localStorage.removeItem(TOUR_KEY);

export default OnboardingTour;
