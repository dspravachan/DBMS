import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Flame, Leaf } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import Badge from '../ui/Badge'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function FoodCard({ food, index = 0 }) {
  const {
    food_id,
    food_name,
    price,
    calories,
    is_veg,
    is_popular,
    image_url,
    description,
    category,
    restaurant_name,
  } = food

  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [wishlisted, setWishlisted] = useState(false)
  const [wishLoading, setWishLoading] = useState(false)
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async () => {
    setAdding(true)
    await addToCart(food)
    setTimeout(() => setAdding(false), 600)
  }

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    setWishLoading(true)
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${food_id}`)
        setWishlisted(false)
        toast.success('Removed from wishlist')
      } else {
        await api.post('/wishlist', { food_id })
        setWishlisted(true)
        toast.success('Added to wishlist ❤️')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setWishLoading(false)
    }
  }

  const imgSrc = image_url || `/images/food_${food_name?.toLowerCase().replace(/\s+/g, '_')}.png`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group bg-bg-card border border-gray-800 rounded-2xl overflow-hidden shadow-card hover:border-accent/30 hover:shadow-orange transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-44 bg-bg-secondary overflow-hidden">
        <img
          src={imgSrc}
          alt={food_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'><rect width='400' height='200' fill='%231A1D24'/><text x='200' y='110' text-anchor='middle' fill='%23FF8C42' font-size='48'>🍽️</text></svg>`
          }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge variant={is_veg ? 'veg' : 'nonveg'} />
          {is_popular && <Badge variant="popular" />}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          disabled={wishLoading}
          className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-all"
        >
          <Heart
            size={16}
            className={`transition-all ${wishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`}
          />
        </button>

        {/* Calorie badge */}
        {calories && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Flame size={10} className="text-orange-400" />
            <span className="text-white text-xs font-medium">{calories} kcal</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-1">
          <h3 className="font-bold text-white text-base leading-tight line-clamp-1 group-hover:text-accent transition-colors">
            {food_name}
          </h3>
          {restaurant_name && (
            <p className="text-gray-muted text-xs mt-0.5">{restaurant_name}</p>
          )}
        </div>

        {description && (
          <p className="text-gray-muted text-xs line-clamp-2 mt-1 mb-3">{description}</p>
        )}

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
          <div>
            <span className="text-xl font-black text-white">₹{price}</span>
          </div>
          <motion.button
            onClick={handleAddToCart}
            whileTap={{ scale: 0.9 }}
            disabled={adding}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              adding
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-accent text-white hover:bg-accent-hover shadow-orange hover:shadow-orange-lg'
            }`}
          >
            <ShoppingCart size={15} />
            {adding ? 'Added!' : 'Add'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
