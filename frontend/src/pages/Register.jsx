import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, Phone, Utensils, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' }
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-yellow-500' }
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-blue-500' }
    return { level: 4, label: 'Strong', color: 'bg-green-500' }
  }
  const { level, label, color } = getStrength()
  if (!password) return null
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= level ? color : 'bg-gray-700'}`} />
        ))}
      </div>
      <p className={`text-xs ${level === 4 ? 'text-green-400' : level === 3 ? 'text-blue-400' : level === 2 ? 'text-yellow-400' : 'text-red-400'}`}>{label}</p>
    </div>
  )
}

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm_password: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Valid email required'
    if (!form.phone.match(/^[6-9]\d{9}$/)) errs.phone = 'Valid 10-digit phone required'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name: form.name, email: form.email, phone: form.phone, password: form.password })
      const { user, token } = data.data
      login(user, token)
      toast.success('Welcome to MealMatrix! 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Rahul Kumar', icon: <User size={16} /> },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', icon: <Mail size={16} /> },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '9876543210', icon: <Phone size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-bg font-inter flex">
      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col justify-center w-1/2 relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #0F1115 0%, #1A1D24 100%)' }}
      >
        <div className="absolute inset-0 opacity-25"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(255,140,66,0.5) 0%, transparent 60%)' }}
        />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center"><Utensils size={20} className="text-white" /></div>
            <span className="text-2xl font-black text-white">Meal<span className="gradient-text">Matrix</span></span>
          </Link>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Join 10,000+<br /><span className="gradient-text">happy subscribers</span>
          </h2>
          <p className="text-gray-muted text-lg mb-8">Create your account and start your healthy meal journey today.</p>
          {['Free first week trial', 'Flexible pause/cancel anytime', '200+ meal plan choices', 'Delivered to your doorstep'].map(f => (
            <div key={f} className="flex items-center gap-3 text-gray-soft mb-3">
              <CheckCircle size={18} className="text-accent shrink-0" /> {f}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-8 overflow-y-auto"
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center"><Utensils size={20} className="text-white" /></div>
              <span className="text-2xl font-black text-white">Meal<span className="gradient-text">Matrix</span></span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Create Account</h1>
            <p className="text-gray-muted">Start your healthy meal journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.name}>
                <label className="text-sm text-gray-soft font-medium block mb-1.5">{f.label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted">{f.icon}</span>
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    className={`input-field pl-11 ${errors[f.name] ? 'border-red-500/50' : ''}`}
                  />
                </div>
                {errors[f.name] && <p className="text-red-400 text-xs mt-1">{errors[f.name]}</p>}
              </div>
            ))}

            <div>
              <label className="text-sm text-gray-soft font-medium block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className={`input-field pl-11 pr-11 ${errors.password ? 'border-red-500/50' : ''}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-muted hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-soft font-medium block mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className={`input-field pl-11 pr-11 ${errors.confirm_password ? 'border-red-500/50' : ''}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-muted hover:text-white">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-red-400 text-xs mt-1">{errors.confirm_password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
              {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="text-center text-gray-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover font-semibold">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
