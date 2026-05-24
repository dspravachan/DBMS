import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShoppingBag, Zap, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back! 🎉');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    const handleDemoAdmin = () => {
      setEmail('admin@foodieexpress.com');
      setPassword('admin123');
    };
    const handleDemoUser = () => {
      setEmail('user@foodieexpress.com');
      setPassword('user123');
    };
    if (type === 'admin') {
      handleDemoAdmin();
    } else {
      handleDemoUser();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', fontFamily: "'Inter', sans-serif" }}>
      {/* Left Panel - Branding */}
      <div style={{
        display: 'none',
        flex: '1',
        background: 'linear-gradient(135deg, #1a0533 0%, #2d1257 30%, #4c1d95 60%, #6C63FF 100%)',
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '3rem',
        color: 'white',
      }} className="login-left-panel">
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '-10%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '20%',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '400px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem',
            fontSize: '2rem', fontWeight: '900',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            🛍️
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>
            Shop smarter,<br />
            <span style={{ background: 'linear-gradient(90deg, #c4b5fd, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              not harder.
            </span>
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.8, lineHeight: '1.7', marginBottom: '3rem' }}>
            Discover thousands of products at unbeatable prices. Your next favourite thing is just one click away.
          </p>

          {/* Features */}
          {[
            { icon: <Zap size={18} />, text: 'Lightning-fast checkout' },
            { icon: <Shield size={18} />, text: 'Secure & encrypted payments' },
            { icon: <ShoppingBag size={18} />, text: 'Free returns on every order' },
          ].map((feat, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              marginBottom: '1rem', textAlign: 'left',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {feat.icon}
              </div>
              <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{feat.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#fafbff',
        position: 'relative',
      }}>
        {/* Subtle bg gradient */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 70% 20%, rgba(108,99,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(139,92,246,0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
          {/* Logo for mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', fontWeight: '900', color: 'white',
              boxShadow: '0 8px 20px rgba(108,99,255,0.35)',
            }}>
              S
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0f172a' }}>
                Shop<span style={{ color: '#6C63FF' }}>Vista</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>Premium Shopping Experience</div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
              Welcome back 👋
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#6C63FF', fontWeight: '600', textDecoration: 'none' }}>
                Sign up free
              </Link>
            </p>
          </div>

          {/* Demo Quick-fill */}
          <div style={{
            background: 'linear-gradient(135deg, #ede9fe 0%, #f0f9ff 100%)',
            border: '1px solid #ddd6fe',
            borderRadius: '14px',
            padding: '1rem',
            marginBottom: '1.75rem',
          }}>
            <p style={{ fontSize: '0.78rem', fontWeight: '700', color: '#7c3aed', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚡ Quick Demo Login
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => fillDemo('user')}
                style={{
                  flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px',
                  background: 'white', border: '1px solid #c4b5fd',
                  color: '#5b21b6', fontSize: '0.78rem', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.target.style.background = '#ede9fe'}
                onMouseLeave={e => e.target.style.background = 'white'}
              >
                👤 User Account
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                style={{
                  flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px',
                  background: 'white', border: '1px solid #c4b5fd',
                  color: '#5b21b6', fontSize: '0.78rem', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.target.style.background = '#ede9fe'}
                onMouseLeave={e => e.target.style.background = 'white'}
              >
                🛡️ Admin Account
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                  color: '#9ca3af', pointerEvents: 'none',
                }}>
                  <Mail size={18} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%', paddingLeft: '3rem', paddingRight: '1rem',
                    paddingTop: '0.875rem', paddingBottom: '0.875rem',
                    border: '2px solid #e2e8f0', borderRadius: '12px',
                    fontSize: '0.95rem', color: '#0f172a',
                    background: 'white', outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6C63FF'; e.target.style.boxShadow = '0 0 0 4px rgba(108,99,255,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                  color: '#9ca3af', pointerEvents: 'none',
                }}>
                  <Lock size={18} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', paddingLeft: '3rem', paddingRight: '3rem',
                    paddingTop: '0.875rem', paddingBottom: '0.875rem',
                    border: '2px solid #e2e8f0', borderRadius: '12px',
                    fontSize: '0.95rem', color: '#0f172a',
                    background: 'white', outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6C63FF'; e.target.style.boxShadow = '0 0 0 4px rgba(108,99,255,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#9ca3af', padding: '0', display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '1rem',
                background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.3s',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(108,99,255,0.4)',
                transform: 'translateY(0)',
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 28px rgba(108,99,255,0.5)'; }}}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = loading ? 'none' : '0 8px 24px rgba(108,99,255,0.4)'; }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: '#94a3b8' }}>
            By signing in you agree to our{' '}
            <span style={{ color: '#6C63FF', cursor: 'pointer' }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: '#6C63FF', cursor: 'pointer' }}>Privacy Policy</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (min-width: 768px) {
          .login-left-panel {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
