import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Utensils, ArrowLeft, Crown, Zap } from 'lucide-react'
import api from '../api/axios'
import WeeklyMenuCard from '../components/subscription/WeeklyMenuCard'
import PlanCard from '../components/subscription/PlanCard'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const TABS = ['Overview', 'Weekly Menu']
const PAYMENT_METHODS = [
  { id: 'wallet', label: 'Wallet' },
  { id: 'card', label: 'Card' },
  { id: 'upi', label: 'UPI' },
  { id: 'netbanking', label: 'Net Banking' },
]

export default function MealPlanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [plan, setPlan] = useState(null)
  const [weeklyMenu, setWeeklyMenu] = useState({})
  const [similarPlans, setSimilarPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')
  const [showSubModal, setShowSubModal] = useState(false)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [subLoading, setSubLoading] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('wallet')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/meal-plans/${id}`),
      // FIX: backend expects 'meal_plan_id' not 'plan_id'
      api.get(`/weekly-menu?meal_plan_id=${id}`).catch(() => ({ data: { data: [] } })),
      api.get(`/meal-plans?limit=3`).catch(() => ({ data: [] })),
    ]).then(([planRes, menuRes, simRes]) => {
      setPlan(planRes.data?.data || planRes.data)
      // Backend returns array; convert to object keyed by day_of_week
      const menuData = menuRes.data?.data || menuRes.data || []
      if (Array.isArray(menuData)) {
        const byDay = {}
        menuData.forEach(d => { byDay[d.day_of_week] = d })
        setWeeklyMenu(byDay)
      } else {
        setWeeklyMenu(menuData)
      }
      const sim = (simRes.data?.data || simRes.data || []).filter(p => String(p.plan_id) !== String(id))
      setSimilarPlans(sim.slice(0, 3))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const handleSubscribe = async () => {
    if (!isAuthenticated) { toast.error('Please login to subscribe'); navigate('/login'); return }
    if (!deliveryAddress.trim()) { toast.error('Please enter a delivery address'); return }
    setSubLoading(true)
    try {
      // FIX H-2: use meal_plan_id (not plan_id), and send all required fields
      await api.post('/subscriptions', {
        meal_plan_id: id,
        start_date: startDate,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        auto_renew: false,
      })
      toast.success('🎉 Subscription activated!')
      setShowSubModal(false)
      navigate('/my-subscriptions')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed')
    } finally {
      setSubLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-bg pt-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const p = plan || { plan_name: 'Meal Plan', plan_type: 'standard', meal_type: 'veg', price: 3999, duration_days: 30, meals_per_day: 2 }
  const pricePerDay = p.price && p.duration_days ? (p.price / p.duration_days).toFixed(0) : null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back */}
        <Link to="/meal-plans" className="flex items-center gap-2 text-gray-muted hover:text-white transition-colors mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Plans
        </Link>

        {/* Header */}
        <div className="bg-bg-card border border-gray-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full"
            style={{ background: 'radial-gradient(circle, #FF8C42 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={p.plan_type?.toLowerCase() || 'standard'} label={p.plan_type} />
                <Badge variant={p.meal_type === 'veg' ? 'veg' : 'nonveg'} />
              </div>
              <h1 className="text-3xl font-black text-white mb-2">{p.plan_name}</h1>
              {p.restaurant_name && <p className="text-gray-muted flex items-center gap-1.5"><Utensils size={14} /> {p.restaurant_name}</p>}
              {p.description && <p className="text-gray-soft mt-4 max-w-xl leading-relaxed">{p.description}</p>}
            </div>
            <div className="shrink-0 text-right">
              <div className="text-5xl font-black text-white">₹{p.price}</div>
              <p className="text-gray-muted text-sm">for {p.duration_days} days</p>
              {pricePerDay && <p className="text-accent text-sm font-semibold flex items-center gap-1 justify-end mt-1"><Zap size={12} /> ₹{pricePerDay}/day</p>}
              <button onClick={() => setShowSubModal(true)} className="btn-primary mt-4 px-8 py-3">
                Subscribe Now
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-800">
            {[
              { label: 'Duration', value: `${p.duration_days} Days`, icon: '📅' },
              { label: 'Meals/Day', value: `${p.meals_per_day} meals`, icon: '🍽️' },
              { label: 'Meal Type', value: p.meal_type === 'veg' ? 'Vegetarian' : 'Non-Veg', icon: p.meal_type === 'veg' ? '🌿' : '🍗' },
              { label: 'Plan Type', value: p.plan_type, icon: '⭐' },
            ].map(s => (
              <div key={s.label} className="bg-bg rounded-xl p-3 border border-gray-800">
                <div className="text-xl mb-1">{s.icon}</div>
                <p className="text-gray-muted text-xs">{s.label}</p>
                <p className="text-white font-bold text-sm capitalize">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-bg-card border border-gray-800 rounded-2xl mb-8 w-fit">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? 'bg-accent text-white shadow-orange' : 'text-gray-muted hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {activeTab === 'Overview' && (
              <div className="space-y-6">
                <div className="bg-bg-card border border-gray-800 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">What's Included</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Fresh daily preparation',
                      `${p.meals_per_day} meals per day`,
                      `${p.duration_days}-day subscription`,
                      'Nutritionally balanced',
                      'Easy pause/resume',
                      'Weekly menu updates',
                    ].map(feature => (
                      <div key={feature} className="flex items-center gap-2 text-gray-soft text-sm">
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs">✓</div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'Weekly Menu' && (
              <WeeklyMenuCard weeklyMenu={weeklyMenu} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Similar Plans */}
        {similarPlans.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-white mb-6">Similar Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarPlans.map((sp, i) => <PlanCard key={sp.plan_id} plan={sp} index={i} />)}
            </div>
          </div>
        )}
      </div>

      {/* Subscribe Modal */}
      <Modal isOpen={showSubModal} onClose={() => setShowSubModal(false)} title="Subscribe to Plan" size="sm">
        <div className="space-y-4">
          <div className="bg-bg-secondary rounded-xl p-4 border border-gray-800">
            <p className="text-white font-bold">{p.plan_name}</p>
            <p className="text-accent text-2xl font-black mt-1">₹{p.price}</p>
          </div>
          <div>
            <label className="text-sm text-gray-soft font-medium block mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="text-xs text-gray-muted">
            Your subscription will end on:{' '}
            <span className="text-white font-semibold">
              {new Date(new Date(startDate).getTime() + p.duration_days * 86400000).toLocaleDateString('en-IN')}
            </span>
          </div>
          <div>
            <label className="text-sm text-gray-soft font-medium block mb-1.5">Delivery Address *</label>
            <textarea
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              placeholder="Enter your full delivery address..."
              rows={3}
              className="input-field resize-none"
            />
          </div>
          <div>
            <label className="text-sm text-gray-soft font-medium block mb-1.5">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="input-field"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <button onClick={handleSubscribe} disabled={subLoading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {subLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</> : 'Confirm Subscription'}
          </button>
        </div>
      </Modal>
    </motion.div>
  )
}
