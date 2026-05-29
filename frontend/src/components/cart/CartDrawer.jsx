import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { Link } from 'react-router-dom'

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-card border-l border-gray-800 z-50 flex flex-col shadow-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-accent" />
                <h2 className="text-lg font-bold">Your Cart</h2>
                {cartCount > 0 && (
                  <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
                )}
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg-secondary text-gray-muted hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-xl font-bold text-white mb-2">Cart is empty</h3>
                  <p className="text-gray-muted mb-6">Add some delicious items to get started!</p>
                  <Link to="/restaurants" onClick={onClose} className="btn-primary">
                    Browse Restaurants
                  </Link>
                </div>
              ) : (
                <AnimatePresence>
                  {cartItems.map(item => (
                    <motion.div
                      key={item.food_id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 bg-bg-secondary rounded-xl p-3 border border-gray-800"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl bg-bg overflow-hidden shrink-0">
                        <img
                          src={item.image_url || '/images/food_placeholder.png'}
                          alt={item.food_name}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='%230F1115'/><text x='32' y='40' text-anchor='middle' fill='%23FF8C42' font-size='24'>🍽️</text></svg>` }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm line-clamp-1">{item.food_name}</p>
                        <p className="text-accent font-bold">₹{item.price}</p>
                      </div>

                      {/* Quantity + Remove */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeFromCart(item.food_id)}
                          className="text-gray-muted hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.food_id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-bg border border-gray-700 flex items-center justify-center text-gray-soft hover:border-accent hover:text-accent transition-all"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-white font-bold text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.food_id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white hover:bg-accent-hover transition-all"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-gray-muted text-xs">₹{(item.price * item.quantity).toFixed(0)}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-800 px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-muted">Subtotal</span>
                  <span className="text-white font-bold text-lg">₹{cartTotal.toFixed(0)}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="btn-primary w-full text-center block py-3.5"
                >
                  Proceed to Checkout →
                </Link>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="btn-secondary w-full text-center block py-3"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
