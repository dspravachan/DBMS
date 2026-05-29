import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MapPin, Clock, Phone, ChevronRight } from 'lucide-react'
import api from '../api/axios'
import FoodCard from '../components/food/FoodCard'
import PlanCard from '../components/subscription/PlanCard'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import StarRating from '../components/ui/StarRating'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const TABS = ['Foods', 'Meal Plans', 'Reviews']

export default function RestaurantDetail() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [foods, setFoods] = useState([])
  const [plans, setPlans] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Foods')
  const [tabLoading, setTabLoading] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)

  useEffect(() => {
    api.get(`/restaurants/${id}`)
      .then(r => setRestaurant(r.data?.data || r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
    api.get(`/foods?restaurant_id=${id}`).then(r => setFoods(r.data?.data || r.data || [])).catch(() => {})
  }, [id])

  const handleTabChange = async (tab) => {
    setActiveTab(tab)
    if (tab === 'Meal Plans' && plans.length === 0) {
      setTabLoading(true)
      api.get(`/meal-plans?restaurant_id=${id}`).then(r => setPlans(r.data?.data || r.data || [])).finally(() => setTabLoading(false))
    }
    if (tab === 'Reviews') {
      setTabLoading(true)
      // Correct endpoint: GET /reviews?restaurant_id=... (not /restaurants/:id/reviews)
      api.get(`/reviews?restaurant_id=${id}`)
        .then(r => setReviews(r.data?.data || r.data || []))
        .catch(() => {})
        .finally(() => setTabLoading(false))
    }
  }

  const submitReview = async () => {
    if (!isAuthenticated) { toast.error('Please login to review'); return }
    if (!reviewRating) { toast.error('Please select a rating'); return }
    try {
      // Correct endpoint: POST /reviews with {stars, review_text, restaurant_id}
      const res = await api.post('/reviews', {
        stars: reviewRating,
        review_text: reviewText,
        restaurant_id: id,
      })
      toast.success('Review submitted! ⭐')
      setReviewText('')
      // Prepend new review to list
      setReviews(prev => [res.data?.data, ...prev].filter(Boolean))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-bg pt-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const r = restaurant || { restaurant_name: 'Restaurant', cuisine_type: 'Indian', address: 'Bangalore', rating: 4.5 }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-bg pt-16 pb-16">
      {/* Hero */}
      <div className="relative h-72 bg-bg-secondary overflow-hidden">
        <img
          src={r.image_url || `/images/restaurant_${(r.cuisine_type || 'food').toLowerCase()}.png`}
          alt={r.restaurant_name}
          className="w-full h-full object-cover opacity-60"
          onError={e => { e.target.onerror = null; e.target.style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        <div className="absolute bottom-6 left-4 right-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-accent/20 text-accent text-xs font-semibold px-3 py-1 rounded-full border border-accent/30">{r.cuisine_type}</span>
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
              <Star size={12} className="fill-accent text-accent" />
              <span className="text-white text-xs font-bold">{r.rating || 4.5}</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white">{r.restaurant_name}</h1>
          {r.address && (
            <p className="flex items-center gap-1.5 text-gray-soft text-sm mt-1">
              <MapPin size={14} /> {r.address}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-bg-card border border-gray-800 rounded-2xl mb-8 w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab ? 'bg-accent text-white shadow-orange' : 'text-gray-muted hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'Foods' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {foods.length > 0 ? foods.map((f, i) => <FoodCard key={f.food_id} food={f} index={i} />) : (
                  [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                )}
              </div>
            )}
            {activeTab === 'Meal Plans' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tabLoading ? [1, 2, 3].map(i => <CardSkeleton key={i} />) :
                  plans.length > 0 ? plans.map((p, i) => <PlanCard key={p.plan_id} plan={p} index={i} />) : (
                    <p className="text-gray-muted col-span-3 text-center py-10">No meal plans for this restaurant</p>
                  )
                }
              </div>
            )}
            {activeTab === 'Reviews' && (
              <div className="max-w-2xl">
                {/* Add Review */}
                {isAuthenticated && (
                  <div className="bg-bg-card border border-gray-800 rounded-2xl p-5 mb-6">
                    <h3 className="text-white font-bold mb-4">Write a Review</h3>
                    <div className="mb-3">
                      <label className="text-gray-muted text-sm mb-1 block">Rating</label>
                      <StarRating value={reviewRating} onChange={setReviewRating} size={24} />
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      rows={3}
                      className="input-field resize-none mb-3"
                    />
                    <button onClick={submitReview} className="btn-primary">Submit Review</button>
                  </div>
                )}
                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.map((rev, i) => (
                    <div key={rev.id || i} className="bg-bg-card border border-gray-800 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                          {rev.user_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{rev.user_name || 'Anonymous'}</p>
                          {/* Backend returns 'stars' not 'rating' */}
                          <StarRating value={rev.stars || rev.rating} readonly size={14} />
                        </div>
                      </div>
                      {/* Backend returns 'review_text' not 'comment' */}
                      <p className="text-gray-soft text-sm">{rev.review_text || rev.comment || ''}</p>
                    </div>
                  ))}
                  {reviews.length === 0 && !tabLoading && (
                    <div className="text-center py-10 text-gray-muted">⭐ Be the first to review!</div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
