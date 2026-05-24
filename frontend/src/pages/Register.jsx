import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created! Welcome to ShopVista 🎉');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (p.length < 10) return { label: 'Fair', color: '#f59e0b', width: '55%' };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: 'Strong', color: '#10b981', width: '100%' };
    return { label: 'Good', color: '#6C63FF', width: '80%' };
  };

  const strength = passwordStrength();

  const inputStyle = {
    width: '100%',
    paddingLeft: '3rem',
    paddingRight: '1rem',
    paddingTop: '0.875rem',
    paddingBottom: '0.875rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.95rem',
    color: '#0f172a',
    background: 'white',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  const iconStyle = {
    position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
    color: '#9ca3af', pointerEvents: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', fontFamily: "'Inter', sans-serif" }}>
      {/* Left Branding Panel */}
      <div style={{
        display: 'none',
        flex: '1',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '3rem',
        color: 'white',
      }} className="register-left-panel">
        {/* Animated orbs */}
        <div style={{
          position: 'absolute', top: '5%', right: '-10%',
          width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '-5%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite reverse',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '420px' }}>
          <div style={{
            fontSize: '4rem', marginBottom: '1.5rem',
            animation: 'bounce 2s ease-in-out infinite',
          }}>
            🚀
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '1rem' }}>
            Join{' '}
            <span style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              thousands
            </span>
            {' '}of happy shoppers
          </h1>
          <p style={{ opacity: 0.75, lineHeight: '1.7', fontSize: '1rem', marginBottom: '3rem' }}>
            Create your free account and start exploring premium products with exclusive member benefits.
          </p>

          {/* Benefit chips */}
          {[
            '✓  Exclusive member-only deals',
            '✓  Track orders in real-time',
            '✓  Wishlist your favourites',
            '✓  Free returns within 30 days',
          ].map((text, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: '0.75rem', textAlign: 'left',
              fontSize: '0.9rem', opacity: 0.9,
            }}>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#fafbff',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 80% 10%, rgba(108,99,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 10% 90%, rgba(139,92,246,0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
          {/* Logo */}
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
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>Join the community</div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
              Create your account ✨
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#6C63FF', fontWeight: '600', textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <div style={iconStyle}><User size={18} /></div>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#6C63FF'; e.target.style.boxShadow = '0 0 0 4px rgba(108,99,255,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={iconStyle}><Mail size={18} /></div>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#6C63FF'; e.target.style.boxShadow = '0 0 0 4px rgba(108,99,255,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={iconStyle}><Lock size={18} /></div>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  style={{ ...inputStyle, paddingRight: '3rem' }}
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

              {/* Password strength bar */}
              {strength && (
                <div style={{ marginTop: '0.6rem' }}>
                  <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: strength.width,
                      background: strength.color,
                      borderRadius: '2px',
                      transition: 'width 0.4s ease, background 0.3s',
                    }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: strength.color, marginTop: '0.3rem', fontWeight: '600' }}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Terms note */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              marginBottom: '1.5rem',
              padding: '0.75rem 1rem',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
            }}>
              <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '0.78rem', color: '#065f46', lineHeight: '1.5' }}>
                Your data is encrypted and secure. We never share your information with third parties.
              </p>
            </div>

            {/* Submit */}
            <button
              id="register-submit-btn"
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
                  Creating account...
                </>
              ) : (
                <>
                  Create free account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @media (min-width: 768px) {
          .register-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default Register;
