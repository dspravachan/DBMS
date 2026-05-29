import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Clock, MapPin, TrendingUp } from 'lucide-react'

const cuisineColors = {
  Indian: 'bg-orange-500/20 text-orange-400',
  Chinese: 'bg-red-500/20 text-red-400',
  Italian: 'bg-green-500/20 text-green-400',
  Continental: 'bg-blue-500/20 text-blue-400',
  Mexican: 'bg-yellow-500/20 text-yellow-400',
  Default: 'bg-purple-500/20 text-purple-400',
}

export default function RestaurantCard({ restaurant, index = 0 }) {
  const {
    id,
    name,
    cuisine_type,
    address,
    rating = 4.2,
    delivery_time = '30-45',
    min_order = 199,
    image_url,
    is_featured,
    review_count = 0,
  } = restaurant

  const cuisineColor = cuisineColors[cuisine_type] || cuisineColors.Default

  const imgSrc = image_url || `https://placehold.co/400x200/1A1D24/FF8C42?text=${encodeURIComponent(name || 'Restaurant')}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link to={`/restaurants/${id}`} className="block">
        <div className="bg-bg-card border border-gray-800 rounded-2xl overflow-hidden shadow-card group-hover:border-accent/30 group-hover:shadow-orange transition-all duration-300">
          {/* Image */}
          <div className="relative h-48 overflow-hidden bg-bg-secondary">
            <img
              src={imgSrc}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="hidden w-full h-full items-center justify-center" style={{ display: 'none' }}>
              <div className="text-5xl">🍽️</div>
            </div>

            {/* Featured Badge */}
            {is_featured && (
              <div className="absolute top-3 left-3">
                <span className="flex items-center gap-1 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-orange">
                  <TrendingUp size={10} /> Featured
                </span>
              </div>
            )}

            {/* Rating overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1">
              <Star size={12} className="fill-accent text-accent" />
              <span className="text-white text-xs font-bold">{rating}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-white text-lg leading-tight group-hover:text-accent transition-colors line-clamp-1">
                {name}
              </h3>
              <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${cuisineColor}`}>
                {cuisine_type}
              </span>
            </div>

            {address && (
              <div className="flex items-center gap-1.5 text-gray-muted text-xs mb-3">
                <MapPin size={12} />
                <span className="line-clamp-1">{address}</span>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              <div className="flex items-center gap-1 text-gray-muted text-xs">
                <Clock size={12} />
                <span>{delivery_time}</span>
              </div>
              <div className="text-gray-muted text-xs">
                Min: <span className="text-white font-semibold">₹{min_order}</span>
              </div>
              <div className="text-gray-muted text-xs">
                <span className="text-white font-semibold">{review_count}</span> reviews
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
