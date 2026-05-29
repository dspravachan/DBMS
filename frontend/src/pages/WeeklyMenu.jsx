import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Coffee, Sun, Moon, ChevronDown, BookOpen } from 'lucide-react'
import api from '../api/axios'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' }
const TODAY = new Date().toLocaleDateString('en-US', { weekday: 'long' })

function MealRow({ icon: Icon, label, name, calories, color }) {
  if (!name) return null
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl bg-bg border border-gray-800/60`}>
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
        <Icon size={14} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{name}</p>
        <p className="text-gray-500 text-xs">{label}</p>
      </div>
      {calories && (
        <span className="text-xs text-gray-500 shrink-0">{calories} kcal</span>
      )}
    </div>
  )
}

export default function WeeklyMenu() {
  const [searchParams] = useSearchParams()

  // Sanitise: treat the literal string "undefined" or empty string as no value
  const rawSub = searchParams.get('sub') || ''
  const initialSub = rawSub === 'undefined' ? '' : rawSub

  const [subscriptions, setSubscriptions] = useState([])
  const [selectedSub, setSelectedSub] = useState(initialSub)
  const [weeklyMenu, setWeeklyMenu] = useState({})   // keyed by day_of_week
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [subsLoading, setSubsLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(TODAY)

  // Load subscriptions
  useEffect(() => {
    api.get('/subscriptions')
      .then(r => {
        const subs = r.data?.data || r.data || []
        setSubscriptions(subs)
        // Auto-select: prefer the one from URL, else first active
        if (!selectedSub && subs.length > 0) {
          const firstActive = subs.find(s => s.status === 'active') || subs[0]
          setSelectedSub(String(firstActive.id))
        }
      })
      .catch(() => {})
      .finally(() => setSubsLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load weekly menu when subscription changes
  useEffect(() => {
    if (!selectedSub || selectedSub === 'undefined') return
    const sub = subscriptions.find(s => String(s.id) === String(selectedSub))
    if (!sub) return

    setPlan(sub)
    setLoading(true)
    setWeeklyMenu({})

    api.get(`/weekly-menu?meal_plan_id=${sub.meal_plan_id}`)
      .then(r => {
        const data = r.data?.data
        if (Array.isArray(data) && data.length > 0) {
          const byDay = {}
          data.forEach(d => { byDay[d.day_of_week] = d })
          setWeeklyMenu(byDay)
          // Auto-select today's day if it has a menu entry
          if (byDay[TODAY]) setActiveDay(TODAY)
          else setActiveDay(Object.keys(byDay)[0])
        }
      })
      .catch(() => setWeeklyMenu({}))
      .finally(() => setLoading(false))
  }, [selectedSub, subscriptions])

  const hasMenu = Object.keys(weeklyMenu).length > 0
  const activeDayData = weeklyMenu[activeDay]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-bg pt-24 pb-16"
    >
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <span className="text-accent text-sm font-semibold uppercase tracking-wide">Schedule</span>
          <h1 className="text-3xl font-black text-white mt-1 mb-1">Weekly Menu</h1>
          <p className="text-gray-muted">Your meal schedule for the week</p>
        </div>

        {/* Subscription Selector */}
        {!subsLoading && subscriptions.length > 0 && (
          <div className="mb-6">
            <label className="text-sm text-gray-soft block mb-1.5 font-medium">Select Subscription</label>
            <div className="relative max-w-sm">
              <select
                value={selectedSub}
                onChange={e => setSelectedSub(e.target.value)}
                className="w-full appearance-none bg-bg-card border border-gray-700 text-white rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-accent transition-colors cursor-pointer"
              >
                {subscriptions.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.plan_name} – {sub.restaurant_name} [{sub.status}]
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Plan Info Card */}
        {plan && (
          <div className="bg-bg-card border border-gray-800 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl orange-gradient flex items-center justify-center text-2xl shrink-0">🍱</div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold truncate">{plan.plan_name}</p>
              <p className="text-gray-muted text-sm">{plan.restaurant_name} · {plan.meals_per_day} meals/day</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-500">
                {plan.start_date ? new Date(plan.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                {' → '}
                {plan.end_date ? new Date(plan.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
              </p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                plan.status === 'active' ? 'bg-green-500/20 text-green-400' :
                plan.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>{plan.status}</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {(subsLoading || loading) && (
          <div className="space-y-4">
            <div className="h-12 bg-bg-card rounded-2xl shimmer" />
            <div className="h-64 bg-bg-card rounded-2xl shimmer" />
          </div>
        )}

        {/* No subscriptions */}
        {!subsLoading && subscriptions.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-white mb-2">No active subscriptions</h3>
            <p className="text-gray-muted mb-6">Subscribe to a meal plan to view your weekly menu</p>
            <Link to="/meal-plans" className="btn-primary inline-flex items-center gap-2">
              <BookOpen size={16} /> Browse Plans
            </Link>
          </div>
        )}

        {/* No menu configured for this plan */}
        {!loading && !subsLoading && plan && !hasMenu && (
          <div className="text-center py-16 bg-bg-card border border-gray-800 rounded-2xl">
            <div className="text-5xl mb-4">🗓️</div>
            <h3 className="text-lg font-bold text-white mb-2">Menu not configured yet</h3>
            <p className="text-gray-muted text-sm max-w-sm mx-auto">
              The weekly menu for <span className="text-white font-medium">{plan.plan_name}</span> hasn't been set up by the restaurant yet. Check back soon!
            </p>
          </div>
        )}

        {/* Weekly Menu Grid */}
        {!loading && !subsLoading && hasMenu && (
          <div>
            {/* Day tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
              {DAYS.map(day => {
                const hasData = !!weeklyMenu[day]
                const isToday = day === TODAY
                return (
                  <button
                    key={day}
                    onClick={() => hasData && setActiveDay(day)}
                    className={`shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      activeDay === day
                        ? 'bg-accent text-white border-accent shadow-orange'
                        : hasData
                          ? 'bg-bg-card border-gray-700 text-gray-300 hover:border-accent/40 hover:text-white'
                          : 'bg-bg-card border-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="text-xs font-bold">{DAY_SHORT[day]}</span>
                    {isToday && <span className="text-[9px] opacity-70 mt-0.5">TODAY</span>}
                  </button>
                )
              })}
            </div>

            {/* Active day detail */}
            {activeDayData ? (
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-card border border-gray-800 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center">
                    <Calendar size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{activeDay}</h3>
                    {activeDayData.description && (
                      <p className="text-gray-400 text-sm">{activeDayData.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <MealRow
                    icon={Coffee}
                    label="Breakfast"
                    name={activeDayData.breakfast_name}
                    calories={activeDayData.breakfast_calories}
                    color="bg-orange-500/80"
                  />
                  <MealRow
                    icon={Sun}
                    label="Lunch"
                    name={activeDayData.lunch_name}
                    calories={activeDayData.lunch_calories}
                    color="bg-yellow-500/80"
                  />
                  <MealRow
                    icon={Moon}
                    label="Dinner"
                    name={activeDayData.dinner_name}
                    calories={activeDayData.dinner_calories}
                    color="bg-blue-500/80"
                  />
                </div>

                {/* Total calories */}
                {(activeDayData.breakfast_calories || activeDayData.lunch_calories || activeDayData.dinner_calories) && (
                  <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between text-sm">
                    <span className="text-gray-400">Total Calories</span>
                    <span className="text-white font-bold">
                      {(parseInt(activeDayData.breakfast_calories || 0) +
                        parseInt(activeDayData.lunch_calories || 0) +
                        parseInt(activeDayData.dinner_calories || 0)).toLocaleString()} kcal
                    </span>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-12 bg-bg-card border border-gray-800 rounded-2xl">
                <p className="text-gray-500">No menu for {activeDay}</p>
              </div>
            )}

            {/* Week at a glance */}
            <div className="mt-6">
              <h4 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">Week at a Glance</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DAYS.filter(d => weeklyMenu[d]).map(day => {
                  const d = weeklyMenu[day]
                  return (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`text-left p-4 bg-bg-card border rounded-xl transition-all hover:border-accent/30 ${
                        activeDay === day ? 'border-accent/50' : 'border-gray-800'
                      }`}
                    >
                      <p className="text-accent text-xs font-bold uppercase mb-2">{day}</p>
                      <div className="space-y-1">
                        {d.breakfast_name && <p className="text-gray-300 text-xs truncate">☀️ {d.breakfast_name}</p>}
                        {d.lunch_name && <p className="text-gray-300 text-xs truncate">🌤️ {d.lunch_name}</p>}
                        {d.dinner_name && <p className="text-gray-300 text-xs truncate">🌙 {d.dinner_name}</p>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
