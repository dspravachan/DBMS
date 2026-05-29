import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Star } from 'lucide-react'
import api from '../api/axios'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import GlobalSearchBar from '../components/ui/GlobalSearchBar'

const CUISINES = ['All', 'Indian', 'Chinese', 'Italian', 'Continental', 'Mexican', 'Other']
const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'new', label: 'Newest' },
  { value: 'min_order', label: 'Low Min Order' },
]

export default function RestaurantList() {
  const [searchParams] = useSearchParams()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [cuisine, setCuisine] = useState('All')
  const [sort, setSort] = useState('rating')
  const [vegOnly, setVegOnly] = useState(false)
  const serverSearch = searchParams.get('search') || ''

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (serverSearch) params.set('search', serverSearch)
    if (cuisine !== 'All') params.set('cuisine_type', cuisine)
    if (vegOnly) params.set('has_veg', 'true')   // ← server-side veg filter
    api.get(`/restaurants?${params.toString()}`)
      .then(r => setRestaurants(r.data?.data || r.data || []))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false))
  }, [serverSearch, cuisine, vegOnly])  // vegOnly triggers re-fetch

  // Client-side sort only (veg filter is now server-side via has_veg param)
  const sorted = [...restaurants]
    .sort((a, b) => {
      if (sort === 'rating') return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0)
      if (sort === 'min_order') return (a.min_order || 0) - (b.min_order || 0)
      return new Date(b.created_at) - new Date(a.created_at)
    })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-bg pt-24 pb-16"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <span className="text-accent text-sm font-semibold uppercase tracking-wide">Partners</span>
          <h1 className="text-4xl font-black text-white mt-1 mb-2">Explore Restaurants</h1>
          <p className="text-gray-muted">Discover top restaurants offering fresh meal subscriptions</p>
        </div>

        {/* Swiggy/Zomato-style search bar */}
        <div className="mb-6">
          <GlobalSearchBar placeholder="Search restaurants, food, cuisines…" />
          {serverSearch && (
            <p className="text-gray-400 text-sm mt-3">
              Showing results for "<span className="text-white font-medium">{serverSearch}</span>"
              {restaurants.length > 0 && <span className="text-gray-500"> — {restaurants.length} found</span>}
            </p>
          )}
        </div>

        {/* Cuisine Chips + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
            {CUISINES.map(c => (
              <button
                key={c}
                onClick={() => setCuisine(c)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  cuisine === c
                    ? 'bg-accent text-white shadow-orange'
                    : 'bg-bg-card border border-gray-800 text-gray-muted hover:border-accent/40'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Veg only toggle */}
            <button
              onClick={() => setVegOnly(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                vegOnly ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-gray-800 text-gray-muted hover:border-green-500/40'
              }`}
            >
              <span className="w-3 h-3 rounded-sm border-2 border-green-500 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </span>
              Pure Veg
            </button>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-bg-card border border-gray-800 text-gray-300 text-sm rounded-full px-4 py-2 outline-none focus:border-accent/40 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results info */}
        {!loading && (
          <p className="text-gray-600 text-xs mb-4">
            {sorted.length} restaurant{sorted.length !== 1 ? 's' : ''} found
            {cuisine !== 'All' && ` · ${cuisine}`}
            {vegOnly && ' · Veg only'}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-white mb-2">No restaurants found</h3>
            <p className="text-gray-muted">Try changing your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)}
          </div>
        )}
      </div>
    </motion.div>
  )
}
