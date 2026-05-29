import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import api from '../api/axios'
import PlanCard from '../components/subscription/PlanCard'
import { CardSkeleton } from '../components/ui/SkeletonLoader'

const PLAN_TYPES = ['All', 'Weekly', 'Monthly', 'Custom']
const MEAL_TYPES = ['All', 'Veg', 'Non-Veg', 'Both']

export default function MealPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planType, setPlanType] = useState('All')
  const [mealType, setMealType] = useState('All')
  const [maxPrice, setMaxPrice] = useState(10000)

  useEffect(() => {
    api.get('/meal-plans')
      .then(r => setPlans(r.data?.data || r.data || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = plans.filter(p => {
    const ms = p.plan_name?.toLowerCase().includes(search.toLowerCase())
    const mt = planType === 'All' || p.plan_type?.toLowerCase() === planType.toLowerCase()
    const mvt = mealType === 'All' || (mealType === 'Veg' ? p.meal_type === 'veg' : p.meal_type !== 'veg')
    const mp = !p.price || p.price <= maxPrice
    return ms && mt && mvt && mp
  })

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <span className="text-accent text-sm font-semibold uppercase tracking-wide">Subscriptions</span>
          <h1 className="text-4xl font-black text-white mt-1 mb-2">Meal Plans</h1>
          <p className="text-gray-muted">Choose the perfect plan for your lifestyle and budget</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search meal plans..." className="input-field pl-11" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div>
            <p className="text-gray-muted text-xs font-semibold uppercase tracking-wide mb-2">Plan Type</p>
            <div className="flex gap-2 flex-wrap">
              {PLAN_TYPES.map(t => (
                <button key={t} onClick={() => setPlanType(t)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${planType === t ? 'bg-accent text-white shadow-orange' : 'bg-bg-card border border-gray-800 text-gray-muted hover:border-accent/40'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-gray-muted text-xs font-semibold uppercase tracking-wide mb-2">Meal Type</p>
            <div className="flex gap-2">
              {MEAL_TYPES.map(t => (
                <button key={t} onClick={() => setMealType(t)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${mealType === t ? 'bg-accent text-white shadow-orange' : 'bg-bg-card border border-gray-800 text-gray-muted hover:border-accent/40'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="max-w-xs">
            <p className="text-gray-muted text-xs font-semibold uppercase tracking-wide mb-2">Max Price: ₹{maxPrice.toLocaleString()}</p>
            <input type="range" min={500} max={10000} step={500} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)}
              className="w-full accent-accent" />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">No plans found</h3>
            <p className="text-gray-muted">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => <PlanCard key={p.id} plan={p} index={i} popular={i === 1} />)}
          </div>
        )}
      </div>
    </motion.div>
  )
}
