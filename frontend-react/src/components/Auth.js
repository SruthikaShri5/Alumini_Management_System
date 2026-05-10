import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Bot, Globe, Briefcase, ArrowLeft, Network, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import './auth-styles.css';

// ---- Validation helpers ----
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (pw) => pw.length >= 6;

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: '6+ characters', ok: password.length >= 6 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['#b43c3c', '#8B6020', '#5A7A3C'];
  const labels = ['Weak', 'Fair', 'Strong'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? colors[score - 1] : 'var(--border-subtle)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {checks.map((c, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: c.ok ? 'var(--brand-green)' : 'var(--text-muted)' }}>
            {c.ok ? <CheckCircle size={10} /> : <AlertCircle size={10} />} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const WelcomeStep = ({ setCurrentStep }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="auth-welcome"
  >
    <div className="welcome-content">
      <h1>Join RootsReconnect</h1>
      <p>Connect with your alumni network and accelerate your career growth</p>
      
      <div className="welcome-options">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentStep('register')}
          className="btn-primary large"
        >
          Create New Account
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentStep('login')}
          className="btn-secondary large"
        >
          Sign In
        </motion.button>
      </div>

        <div className="welcome-features">
          <div className="feature-item">
            <span className="feature-icon"><Bot size={16} /></span>
            <span>AI-Powered Matching</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon"><Globe size={16} /></span>
            <span>Global Alumni Network</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon"><Briefcase size={16} /></span>
            <span>Career Opportunities</span>
          </div>
        </div>
    </div>
  </motion.div>
);

const LoginStep = ({ formData, handleChange, handleLogin, setCurrentStep }) => {
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = (e) => {
    e.preventDefault();
    const errs = {};
    if (!validateEmail(formData.email)) errs.email = 'Enter a valid email address';
    if (!formData.password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length === 0) handleLogin(e);
  };

  return (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="auth-form"
  >
    <div className="form-header">
      <h2>Welcome Back</h2>
      <p>Sign in to your account</p>
    </div>

    <form onSubmit={validate}>
      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          autoComplete="email"
          style={errors.email ? { borderColor: '#ef4444' } : {}}
        />
        {errors.email && <small style={{ color: '#ef4444' }}>{errors.email}</small>}
      </div>

      <div className="form-group">
        <label>Password</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPw ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            style={{ paddingRight: 44, ...(errors.password ? { borderColor: '#ef4444' } : {}) }}
          />
          <button type="button" onClick={() => setShowPw(!showPw)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <small style={{ color: '#ef4444' }}>{errors.password}</small>}
      </div>

      <div className="form-options">
        <label className="checkbox-label">
          <input type="checkbox" />
          Remember me
        </label>
        <a href="#forgot" className="forgot-link">Forgot password?</a>
      </div>

      <button type="submit" className="btn-primary full-width">
        Sign In
      </button>
    </form>

    <div className="form-footer">
      <p>Don't have an account?
        <button onClick={() => setCurrentStep('register')} className="link-button">Sign up</button>
      </p>
    </div>
  </motion.div>
  );
};

const RegisterStep = ({ formData, handleChange, nextStep, setCurrentStep }) => {
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Full name is required';
    if (!validateEmail(formData.email)) errs.email = 'Enter a valid email address';
    if (!validatePassword(formData.password)) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length === 0) nextStep();
  };

  return (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="auth-form"
  >
    <div className="form-header">
      <h2>Create Account</h2>
      <p>Join thousands of professionals</p>
    </div>

    <div>
      <div className="form-group">
        <label>Full Name</label>
        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange}
          placeholder="Enter your full name" autoComplete="name"
          style={errors.full_name ? { borderColor: '#ef4444' } : {}} />
        {errors.full_name && <small style={{ color: '#ef4444' }}>{errors.full_name}</small>}
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange}
          placeholder="Enter your email" autoComplete="email"
          style={errors.email ? { borderColor: '#ef4444' } : {}} />
        {errors.email && <small style={{ color: '#ef4444' }}>{errors.email}</small>}
      </div>

      <div className="form-group">
        <label>I am a</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="alumni">Alumni</option>
          <option value="admin">Administrator</option>
        </select>
        <small>
          {formData.role === 'student' && '✓ Access mentorship, internships, and career guidance'}
          {formData.role === 'alumni' && '✓ Create events, post jobs, and mentor students'}
          {formData.role === 'admin' && '✓ Full system access — manage users, events, and jobs'}
        </small>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} name="password" value={formData.password}
              onChange={handleChange} placeholder="Create password" autoComplete="new-password"
              style={{ paddingRight: 44, ...(errors.password ? { borderColor: '#ef4444' } : {}) }} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <small style={{ color: '#ef4444' }}>{errors.password}</small>}
          <PasswordStrength password={formData.password} />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword}
            onChange={handleChange} placeholder="Confirm password" autoComplete="new-password"
            style={errors.confirmPassword ? { borderColor: '#ef4444' } : {}} />
          {errors.confirmPassword && <small style={{ color: '#ef4444' }}>{errors.confirmPassword}</small>}
        </div>
      </div>

      <button type="button" onClick={validate} className="btn-primary full-width">
        Continue
      </button>
    </div>

    <div className="form-footer">
      <p>Already have an account?
        <button onClick={() => setCurrentStep('login')} className="link-button">Sign in</button>
      </p>
    </div>
  </motion.div>
  );
};

const ProfileStep = ({ formData, handleChange, handleRegister, setCurrentStep }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="auth-form profile-form"
  >
    <div className="form-header">
      <h2>Complete Your Profile</h2>
      <p>Help us find the best matches for you</p>
    </div>

    <div>
      <div className="form-row">
        <div className="form-group">
          <label>Industry Sector</label>
          <select
            name="sector"
            value={formData.sector}
            onChange={handleChange}
          >
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="consulting">Consulting</option>
            <option value="government">Government</option>
            <option value="public_sector">Public Sector</option>
          </select>
        </div>

        <div className="form-group">
          <label>Graduation Year</label>
          <input
            type="number"
            name="graduation_year"
            value={formData.graduation_year}
            onChange={handleChange}
            min="1950"
            max="2030"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_rural"
              checked={formData.is_rural || false}
              onChange={handleChange}
            />
            I am a student from a rural area
          </label>
          <small>Rural students get priority alumni matching</small>
        </div>
      </div>

      <div className="form-group">
        <label>Skills & Expertise</label>
        <textarea
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="e.g., Python, Machine Learning, Project Management"
          rows="3"
        />
        <small>Separate skills with commas</small>
      </div>

      <div className="form-group">
        <label>Interests & Goals</label>
        <textarea
          name="interests"
          value={formData.interests}
          onChange={handleChange}
          placeholder="e.g., AI Research, Startups, Mentorship"
          rows="3"
        />
        <small>What are you passionate about?</small>
      </div>

      <div className="form-group">
        <label>What are you looking for?</label>
        <div className="checkbox-group">
          {['networking', 'mentorship', 'job_opportunities', 'collaboration', 'career_advice'].map(option => (
            <label key={option} className="checkbox-label">
              <input
                type="checkbox"
                value={option}
                checked={formData.looking_for.includes(option)}
                onChange={handleChange}
              />
              {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </label>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="button"
          onClick={() => setCurrentStep('register')}
          className="btn-secondary"
        >
          Back
        </button>
        <button type="button" onClick={handleRegister} className="btn-primary">
          Create Account
        </button>
      </div>
    </div>
  </motion.div>
);

const Auth = ({ onLogin }) => {
  const [currentStep, setCurrentStep] = useState('welcome'); // welcome, login, register, profile
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'student',
    sector: 'technology',
    graduation_year: 2020,
    skills: '',
    interests: '',
    looking_for: []
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password');
      return;
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      toast.success('Welcome back!');
      onLogin(data.access_token, data.user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.full_name) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role || 'student',
          sector: formData.sector || 'technology',
          graduation_year: parseInt(formData.graduation_year) || 2020,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
          interests: formData.interests ? formData.interests.split(',').map(i => i.trim()).filter(Boolean) : [],
          looking_for: formData.looking_for || [],
          company: '',
          position: '',
          is_rural: formData.is_rural || false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');

      if (data.role === 'student' && !data.approved) {
        toast.success('Registration submitted! Waiting for admin approval.');
        setCurrentStep('welcome');
        return;
      }

      // Auto-login for alumni/admin
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.email, password: formData.password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.detail || 'Login failed');
      toast.success('Account created! Welcome to RootsReconnect!');
      onLogin(loginData.access_token, loginData.user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        looking_for: checked 
          ? [...prev.looking_for, value]
          : prev.looking_for.filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const nextStep = () => {
    if (currentStep === 'welcome') return;
    if (currentStep === 'register') {
      if (!formData.full_name || !formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      setCurrentStep('profile');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <div className="sidebar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(196,149,106,0.4)' }}>
              <Network size={16} color="#fff" />
            </div>
            <h3 style={{ margin: 0, padding: 0 }}>RootsReconnect</h3>
          </div>
          <div className="progress-steps">
            <div className={`step ${currentStep === 'welcome' ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Welcome</span>
            </div>
            <div className={`step ${currentStep === 'login' || currentStep === 'register' ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Account</span>
            </div>
            <div className={`step ${currentStep === 'profile' ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Profile</span>
            </div>
          </div>
          <div className="sidebar-image">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop"
              alt="Professional networking"
            />
          </div>
        </div>
      </div>

      <div className="auth-main">
        <button 
          onClick={() => setCurrentStep('welcome')}
          className="back-button"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <WelcomeStep key="welcome" setCurrentStep={setCurrentStep} />
          )}
          {currentStep === 'login' && (
            <LoginStep
              key="login"
              formData={formData}
              handleChange={handleChange}
              handleLogin={handleLogin}
              setCurrentStep={setCurrentStep}
            />
          )}
          {currentStep === 'register' && (
            <RegisterStep
              key="register"
              formData={formData}
              handleChange={handleChange}
              nextStep={nextStep}
              setCurrentStep={setCurrentStep}
            />
          )}
          {currentStep === 'profile' && (
            <ProfileStep
              key="profile"
              formData={formData}
              handleChange={handleChange}
              handleRegister={handleRegister}
              setCurrentStep={setCurrentStep}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;
