import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { ArrowRight, Star, Users, Utensils, BookOpen, Truck, CheckCircle, ChevronRight, Flame, Clock } from 'lucide-react'
import api from '../api/axios'
import PlanCard from '../components/subscription/PlanCard'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import GlobalSearchBar from '../components/ui/GlobalSearchBar'

// Animated Counter Component
function AnimatedCounter({ target, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: 2000 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (inView) motionValue.set(target)
  }, [inView, target])

  useEffect(() => {
    spring.on('change', v => setDisplay(Math.round(v)))
  }, [spring])

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>
}

const CATEGORIES = ['All', 'Veg', 'Non-Veg', 'Diet', 'Student', 'Office', 'Family']

const TESTIMONIALS = [
  {
    name: 'Priya Sharma', role: 'Software Engineer', initials: 'PS', color: 'bg-purple-500',
    text: 'MealMatrix changed my life! Fresh, healthy meals delivered every day. No more stressing about what to eat for lunch!',
    rating: 5
  },
  {
    name: 'Rahul Kumar', role: 'College Student', initials: 'RK', color: 'bg-blue-500',
    text: 'The student plan is incredibly affordable. Great variety, perfectly portioned, and always on time.',
    rating: 5
  },
  {
    name: 'Ananya Reddy', role: 'Marketing Manager', initials: 'AR', color: 'bg-green-500',
    text: 'The premium plan is worth every rupee. Restaurant-quality meals at my doorstep. Absolutely love the variety!',
    rating: 4
  },
]

const HOW_IT_WORKS = [
  { step: '01', icon: <BookOpen size={28} />, title: 'Choose a Plan', desc: 'Browse 200+ meal plans tailored to your diet, lifestyle, and budget.' },
  { step: '02', icon: <CheckCircle size={28} />, title: 'Subscribe & Pay', desc: 'Pick your duration, select start date, and pay securely in seconds.' },
  { step: '03', icon: <Truck size={28} />, title: 'Get Delivered', desc: 'Fresh meals prepared daily and delivered right to your doorstep.' },
]

const FLOAT_FOODS = ['🥗', '🍛', '🥙', '🍜', '🥘', '🍱']

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [plans, setPlans] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [loadingRest, setLoadingRest] = useState(true)

  useEffect(() => {
    api.get('/meal-plans?limit=3').then(r => setPlans(r.data?.data || r.data || [])).catch(() => setPlans([])).finally(() => setLoadingPlans(false))
    api.get('/restaurants?limit=6').then(r => setRestaurants(r.data?.data || r.data || [])).catch(() => setRestaurants([])).finally(() => setLoadingRest(false))
  }, [])

  return (
    <div className="min-h-screen bg-bg font-inter">
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg to-bg-card" />
          <div className="absolute top-0 left-0 w-full h-full opacity-20"
            style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(255,140,66,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,140,66,0.15) 0%, transparent 50%)' }}
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(rgba(255,140,66,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,140,66,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
        </div>

        {/* Floating food emojis */}
        {FLOAT_FOODS.map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl pointer-events-none select-none"
            style={{
              top: `${15 + (i * 14) % 70}%`,
              left: i % 2 === 0 ? `${5 + i * 3}%` : `${80 + (i * 4) % 15}%`,
              opacity: 0.12 + (i % 3) * 0.06,
            }}
            animate={{ y: [0, -16, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
            transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          >
            {emoji}
          </motion.div>
        ))}

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-24">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Flame size={14} /> India's #1 Smart Meal Platform
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Smart Meals,<br />
            <span className="gradient-text">Delivered Daily</span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-soft max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Nutritious subscription meal plans tailored to your lifestyle. Choose from 200+ plans across 50+ restaurants.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/meal-plans" className="btn-primary text-base px-8 py-4 flex items-center gap-2 justify-center">
              Explore Plans <ArrowRight size={18} />
            </Link>
            <Link to="/restaurants" className="btn-secondary text-base px-8 py-4 flex items-center gap-2 justify-center">
              Order Now <ChevronRight size={18} />
            </Link>
          </motion.div>

          {/* 🔍 Search Bar – Swiggy/Zomato style */}
          <motion.div
            className="mt-8 w-full max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GlobalSearchBar placeholder="Search for food, restaurants, cuisines…" />
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex items-center justify-center gap-6 mt-8 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {['✓ Free Delivery on First Order', '✓ Cancel Anytime', '✓ 100% Fresh Ingredients'].map(t => (
              <span key={t} className="text-sm text-gray-muted font-medium">{t}</span>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-700 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1 h-3 bg-accent rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="py-16 bg-bg-card border-y border-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Subscribers', value: 10000, suffix: '+', icon: <Users size={24} className="text-accent" /> },
              { label: 'Restaurants', value: 50, suffix: '+', icon: <Utensils size={24} className="text-accent" /> },
              { label: 'Meal Plans', value: 200, suffix: '+', icon: <BookOpen size={24} className="text-accent" /> },
              { label: 'Avg Rating', value: 4.8, suffix: '★', icon: <Star size={24} className="text-accent" /> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-bg border border-gray-800 hover:border-accent/30 transition-all group"
              >
                <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-3xl font-black text-white mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-muted text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="py-10 max-w-7xl mx-auto px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-accent text-white shadow-orange'
                  : 'bg-bg-card border border-gray-800 text-gray-muted hover:border-accent/40 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ─── FEATURED MEAL PLANS ─── */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-accent text-sm font-semibold uppercase tracking-wide">Meal Plans</span>
            <h2 className="text-3xl font-black text-white mt-1">Featured Plans</h2>
          </div>
          <Link to="/meal-plans" className="flex items-center gap-1 text-accent text-sm font-semibold hover:gap-2 transition-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(plans.length > 0 ? plans : [
              { id: 'f1', plan_name: 'Office Delight', plan_type: 'standard', meal_type: 'veg', price: 3999, duration_days: 30, meals_per_day: 2, description: 'Perfect for professionals. Balanced nutrition for a productive workday.', restaurant_name: 'Spice Garden' },
              { id: 'f2', plan_name: 'Student Saver', plan_type: 'student', meal_type: 'veg', price: 1999, duration_days: 30, meals_per_day: 2, description: 'Budget-friendly, nutritious meals for students on the go.', restaurant_name: 'Campus Bites' },
              { id: 'f3', plan_name: 'Premium Indulge', plan_type: 'premium', meal_type: 'nonveg', price: 7999, duration_days: 30, meals_per_day: 3, description: 'Restaurant-quality gourmet meals delivered to your door daily.', restaurant_name: 'Royal Kitchen' },
            ]).map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} index={i} popular={i === 1} />
            ))}
          </div>
        )}
      </section>

      {/* ─── TOP RESTAURANTS ─── */}
      <section className="py-16 bg-bg-card border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-accent text-sm font-semibold uppercase tracking-wide">Partners</span>
              <h2 className="text-3xl font-black text-white mt-1">Top Restaurants</h2>
            </div>
            <Link to="/restaurants" className="flex items-center gap-1 text-accent text-sm font-semibold hover:gap-2 transition-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4">
            {loadingRest ? [1, 2, 3, 4].map(i => (
              <div key={i} className="shrink-0 w-72"><CardSkeleton /></div>
            )) : (restaurants.length > 0 ? restaurants : [
              { id: 'r1', name: 'Spice Garden', cuisine_type: 'Indian', address: 'HSR Layout, Bangalore', rating: 4.5, delivery_time: '25-35', min_order: 199 },
              { id: 'r2', name: 'Dragon Palace', cuisine_type: 'Chinese', address: 'Koramangala, Bangalore', rating: 4.2, delivery_time: '30-40', min_order: 249 },
              { id: 'r3', name: 'Bella Italia', cuisine_type: 'Italian', address: 'Indiranagar, Bangalore', rating: 4.7, delivery_time: '35-45', min_order: 349 },
              { id: 'r4', name: 'Campus Bites', cuisine_type: 'Indian', address: 'BTM Layout, Bangalore', rating: 4.0, delivery_time: '20-30', min_order: 149 },
            ]).map((r, i) => (
              <div key={r.id} className="shrink-0 w-72">
                <RestaurantCard restaurant={r} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 max-w-5xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-accent text-sm font-semibold uppercase tracking-wide">Process</span>
          <h2 className="text-3xl font-black text-white mt-1">How MealMatrix Works</h2>
          <p className="text-gray-muted mt-3 max-w-lg mx-auto">Three simple steps to your daily nutritious meals</p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-2xl orange-gradient flex items-center justify-center text-white shadow-orange-lg mb-4 mx-auto">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-bg-card border-2 border-accent rounded-full flex items-center justify-center text-accent text-xs font-black">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-muted text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-16 bg-bg-card border-y border-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-accent text-sm font-semibold uppercase tracking-wide">Reviews</span>
            <h2 className="text-3xl font-black text-white mt-1">What Our Members Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-bg border border-gray-800 rounded-2xl p-6 hover:border-accent/30 transition-all"
              >
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-gray-soft text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-gray-muted text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-20 max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl p-12 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(255,140,66,0.15) 0%, rgba(255,140,66,0.05) 50%, rgba(255,140,66,0.15) 100%)', border: '1px solid rgba(255,140,66,0.3)' }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ background: 'radial-gradient(circle at 50% 50%, #FF8C42 0%, transparent 70%)' }}
          />
          <div className="relative">
            <h2 className="text-4xl font-black text-white mb-4">Start Your Meal Journey Today</h2>
            <p className="text-gray-muted text-lg mb-8 max-w-xl mx-auto">Join 10,000+ happy subscribers enjoying fresh, healthy meals every day.</p>
            <Link to="/meal-plans" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
              Get Started Now <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
