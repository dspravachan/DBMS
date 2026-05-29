import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Coffee, Sun, Moon } from 'lucide-react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const mealIcons = {
  breakfast: <Coffee size={14} />,
  lunch: <Sun size={14} />,
  dinner: <Moon size={14} />,
}

const mealColors = {
  breakfast: 'text-yellow-400',
  lunch: 'text-orange-400',
  dinner: 'text-blue-400',
}

/**
 * Normalises a day's data into a consistent format regardless of whether the
 * backend returned flat keys (breakfast_name / breakfast_calories) or nested
 * objects ({ breakfast: { food_name, calories } }).
 */
function normaliseDayData(raw) {
  if (!raw) return null

  // If already nested (e.g., { breakfast: { food_name, calories } })
  if (raw.breakfast && typeof raw.breakfast === 'object') return raw

  // Flat format from DB: { breakfast_name, breakfast_calories, lunch_name, ... }
  return {
    breakfast: raw.breakfast_name
      ? { food_name: raw.breakfast_name, calories: raw.breakfast_calories, name: raw.breakfast_name }
      : null,
    lunch: raw.lunch_name
      ? { food_name: raw.lunch_name, calories: raw.lunch_calories, name: raw.lunch_name }
      : null,
    dinner: raw.dinner_name
      ? { food_name: raw.dinner_name, calories: raw.dinner_calories, name: raw.dinner_name }
      : null,
    description: raw.description,
  }
}

export default function WeeklyMenuCard({ weeklyMenu = {}, todayIndex = new Date().getDay() - 1 }) {
  const [activeDay, setActiveDay] = useState(
    todayIndex >= 0 && todayIndex < 7 ? todayIndex : 0
  )

  const rawDayData = weeklyMenu[FULL_DAYS[activeDay]] || weeklyMenu[DAYS[activeDay]] || null
  const dayData = normaliseDayData(rawDayData)

  const mealTypes = ['breakfast', 'lunch', 'dinner']
  const hasAnyMenu = Object.keys(weeklyMenu).length > 0

  if (!hasAnyMenu) {
    return (
      <div className="bg-bg-card border border-gray-800 rounded-2xl p-10 text-center">
        <div className="text-4xl mb-3">🗓️</div>
        <p className="text-gray-muted">Weekly menu hasn't been set up yet for this plan.</p>
        <p className="text-gray-700 text-xs mt-1">Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="bg-bg-card border border-gray-800 rounded-2xl overflow-hidden">
      {/* Day Tabs */}
      <div className="flex gap-1 p-3 bg-bg-secondary border-b border-gray-800 overflow-x-auto">
        {DAYS.map((day, i) => {
          const isToday = i === todayIndex
          const isActive = i === activeDay
          const hasData = !!(weeklyMenu[FULL_DAYS[i]] || weeklyMenu[DAYS[i]])

          return (
            <button
              key={day}
              onClick={() => setActiveDay(i)}
              className={`relative flex flex-col items-center px-3 py-2 rounded-xl min-w-[52px] transition-all ${
                isActive
                  ? 'bg-accent text-white shadow-orange'
                  : hasData
                    ? 'text-gray-muted hover:text-white hover:bg-bg-secondary'
                    : 'text-gray-700 cursor-default'
              }`}
            >
              <span className="text-xs font-medium">{day}</span>
              {isToday && (
                <span className={`text-xs font-bold mt-0.5 ${isActive ? 'text-white/80' : 'text-accent'}`}>
                  •
                </span>
              )}
              {!hasData && <span className="text-[8px] text-gray-700 mt-0.5">—</span>}
            </button>
          )
        })}
      </div>

      {/* Meal Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="p-5"
        >
          {dayData ? (
            <div className="space-y-4">
              {/* Day description */}
              {dayData.description && (
                <p className="text-gray-400 text-sm italic border-l-2 border-accent/40 pl-3">{dayData.description}</p>
              )}
              {mealTypes.map((mealType) => {
                const meal = dayData[mealType]
                if (!meal) return null

                return (
                  <div key={mealType} className="flex items-start gap-4 p-4 bg-bg-secondary rounded-xl border border-gray-800/50">
                    <div className={`w-10 h-10 rounded-xl bg-bg-card flex items-center justify-center shrink-0 ${mealColors[mealType]}`}>
                      {mealIcons[mealType]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold capitalize ${mealColors[mealType]}`}>
                          {mealType}
                        </span>
                        {meal.calories && (
                          <span className="flex items-center gap-0.5 text-xs text-gray-muted">
                            <Flame size={10} className="text-orange-400" />
                            {meal.calories} kcal
                          </span>
                        )}
                      </div>
                      <p className="text-white font-semibold text-sm line-clamp-1">
                        {meal.food_name || meal.name || 'Menu coming soon'}
                      </p>
                      {meal.description && (
                        <p className="text-gray-muted text-xs mt-0.5 line-clamp-1">{meal.description}</p>
                      )}
                    </div>
                    {meal.is_veg !== undefined && (
                      <div className={`shrink-0 w-5 h-5 rounded-sm border-2 flex items-center justify-center ${
                        meal.is_veg ? 'border-green-500' : 'border-red-500'
                      }`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${meal.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    )}
                  </div>
                )
              })}
              {/* Show empty if all meals are null */}
              {!dayData.breakfast && !dayData.lunch && !dayData.dinner && (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">📅</div>
                  <p className="text-gray-muted text-sm">No meals scheduled for {FULL_DAYS[activeDay]}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-gray-muted">Menu not set for {FULL_DAYS[activeDay]}</p>
              <p className="text-gray-700 text-xs mt-1">Check back later</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
