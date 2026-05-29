import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Utensils, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const FLOATS = ['🥗', '🍛', '🥙', '🍜', '🥘', '🍱']

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      const { user, token } = data.data
      login(user, token)
      toast.success(`Welcome back, ${user.name}! 👋`)
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg font-inter flex">
      {/* Left Decorative Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F1115 0%, #1A1D24 100%)' }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 opacity-30"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(255,140,66,0.4) 0%, transparent 60%)' }}
        />

        {/* Floating food emojis */}
        {FLOATS.map((e, i) => (
          <motion.div
            key={i}
            className="absolute text-5xl pointer-events-none opacity-10"
            style={{ top: `${10 + i * 14}%`, left: `${10 + (i % 3) * 25}%` }}
            animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.4 }}
          >
            {e}
          </motion.div>
        ))}

        <div className="relative z-10 p-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center shadow-orange">
              <Utensils size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white">Meal<span className="gradient-text">Matrix</span></span>
          </Link>
        </div>

        <div className="relative z-10 p-10">
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Your daily meals,<br />
            <span className="gradient-text">perfectly planned.</span>
          </h2>
          <p className="text-gray-muted text-lg mb-8">
            Subscribe to fresh meal plans and get healthy food delivered every day.
          </p>
          <div className="space-y-3">
            {['200+ Meal Plans to choose from', '50+ Partner Restaurants', 'Cancel or pause anytime'].map(f => (
              <div key={f} className="flex items-center gap-3 text-gray-soft">
                <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs">✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-10">
          <p className="text-gray-800 text-sm">© 2024 MealMatrix. All rights reserved.</p>
        </div>
      </motion.div>

      {/* Right Form Panel */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center">
                <Utensils size={20} className="text-white" />
              </div>
              <span className="text-2xl font-black text-white">Meal<span className="gradient-text">Matrix</span></span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
            <p className="text-gray-muted">Sign in to your MealMatrix account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-soft font-medium block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field pl-11"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-soft font-medium block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded"
                />
                <span className="text-sm text-gray-muted">Remember me</span>
              </label>
              <a href="#" className="text-sm text-accent hover:text-accent-hover transition-colors">Forgot password?</a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-gray-muted mt-6">
            New to MealMatrix?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover font-semibold transition-colors">Create account</Link>
          </p>


        </div>
      </motion.div>
    </div>
  )
}
