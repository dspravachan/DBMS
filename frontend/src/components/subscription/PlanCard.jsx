import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Utensils, Star, Crown, Zap } from 'lucide-react'

const planTypeConfig = {
  weekly: { label: 'Weekly', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/20' },
  monthly: { label: 'Monthly', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/20' },
  custom: { label: 'Custom', color: 'text-accent', bg: 'bg-accent/20', border: 'border-accent/20' },
}

export default function PlanCard({ plan, index = 0, onSubscribe, popular = false }) {
  const {
    id,
    plan_name,
    plan_type,
    meal_type,
    price,
    duration_days,
    meals_per_day,
    description,
    restaurant_name,
  } = plan

  const typeConfig = planTypeConfig[plan_type?.toLowerCase()] || planTypeConfig.weekly
  const pricePerDay = price && duration_days ? (price / duration_days).toFixed(0) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className={`relative group bg-bg-card border rounded-2xl overflow-hidden shadow-card transition-all duration-300 ${
        popular
          ? 'border-accent shadow-orange'
          : 'border-gray-800 hover:border-accent/40 hover:shadow-orange'
      }`}
    >
      {/* Popular Badge */}
      {popular && (
        <div className="absolute top-0 left-0 right-0 bg-accent text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-1">
          <Crown size={12} /> Most Popular
        </div>
      )}

      <div className={`p-6 ${popular ? 'pt-10' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-accent transition-colors">
              {plan_name}
            </h3>
            {restaurant_name && (
              <p className="text-gray-muted text-xs mt-0.5 flex items-center gap-1">
                <Utensils size={10} /> {restaurant_name}
              </p>
            )}
          </div>
          <div className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${typeConfig.color} ${typeConfig.bg} ${typeConfig.border}`}>
            {plan_type?.toLowerCase() === 'custom' && <Crown size={10} />}
            {typeConfig.label}
          </div>
        </div>

        {/* Price */}
        <div className="mb-5">
          <div className="flex items-end gap-1">
            <span className="text-4xl font-black text-white">₹{price}</span>
            <span className="text-gray-muted text-sm mb-1">/{duration_days}days</span>
          </div>
          {pricePerDay && (
            <p className="text-accent text-xs font-semibold mt-0.5 flex items-center gap-1">
              <Zap size={10} /> ₹{pricePerDay}/day only
            </p>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-bg-secondary rounded-lg flex items-center justify-center">
              <Calendar size={14} className="text-accent" />
            </div>
            <div>
              <span className="text-gray-muted text-xs">Duration</span>
              <p className="text-white font-semibold text-sm">{duration_days} Days</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-bg-secondary rounded-lg flex items-center justify-center">
              <Utensils size={14} className="text-accent" />
            </div>
            <div>
              <span className="text-gray-muted text-xs">Meals per Day</span>
              <p className="text-white font-semibold text-sm">{meals_per_day} meals</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-bg-secondary rounded-lg flex items-center justify-center">
              {meal_type === 'veg' ? (
                <span className="text-green-400 text-xs font-bold">V</span>
              ) : (
                <span className="text-red-400 text-xs font-bold">NV</span>
              )}
            </div>
            <div>
              <span className="text-gray-muted text-xs">Meal Type</span>
              <p className={`font-semibold text-sm ${meal_type === 'veg' ? 'text-green-400' : 'text-red-400'}`}>
                {meal_type === 'veg' ? '🌿 Vegetarian' : '🍗 Non-Vegetarian'}
              </p>
            </div>
          </div>
        </div>

        {description && (
          <p className="text-gray-muted text-xs line-clamp-2 mb-5 leading-relaxed">{description}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {onSubscribe ? (
            <button
              onClick={() => onSubscribe(plan)}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                popular
                  ? 'bg-accent text-white hover:bg-accent-hover shadow-orange hover:shadow-orange-lg'
                  : 'bg-bg-secondary border border-gray-700 text-white hover:border-accent hover:bg-accent/10 hover:text-accent'
              }`}
            >
              Subscribe Now
            </button>
          ) : (
            <Link
              to={`/meal-plans/${id}`}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all text-center ${
                popular
                  ? 'bg-accent text-white hover:bg-accent-hover shadow-orange'
                  : 'bg-bg-secondary border border-gray-700 text-white hover:border-accent hover:bg-accent/10 hover:text-accent'
              }`}
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}
