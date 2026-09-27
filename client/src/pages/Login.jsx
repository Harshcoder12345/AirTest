import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Lock, Mail, User, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

const Login = () => {
  const { login, register, error } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');

    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setLocalError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (presetEmail, presetPassword) => {
    setEmail(presetEmail);
    setPassword(presetPassword);
    setLoading(true);
    setLocalError('');

    try {
      await login(presetEmail, presetPassword);
    } catch (err) {
      setLocalError(err.message || 'Quick login failed. Make sure database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', padding: '14px', background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))', borderRadius: '16px', color: 'white', marginBottom: '16px', boxShadow: 'var(--shadow-glow)' }}>
            <Award size={36} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>CertiVoucher Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Enterprise Certification Voucher Management System
          </p>
        </div>

        {(localError || error) && (
          <div className="alert alert-error">
            <AlertTriangle size={18} />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  required
                />
                <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">User Role</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px', padding: '12px' }} disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Credentials Switcher for Assessment Evaluator */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
            <Zap size={14} style={{ color: 'var(--accent-amber)' }} />
            Quick Demo Presets for Testing
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => quickLogin('manager@company.com', 'Password123')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 12px' }}
              disabled={loading}
            >
              <ShieldCheck size={14} style={{ color: '#818cf8' }} />
              Login Manager
            </button>
            <button
              onClick={() => quickLogin('john.doe@company.com', 'Password123')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 12px' }}
              disabled={loading}
            >
              <User size={14} style={{ color: '#34d399' }} />
              Login Employee
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setLocalError('');
            }}
            style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
