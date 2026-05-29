import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  // Load cart from localStorage on mount (safe parse)
  useEffect(() => {
    const stored = localStorage.getItem('mealmatrix_cart')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setCartItems(parsed)
      } catch {
        localStorage.removeItem('mealmatrix_cart')
      }
    }
  }, [])

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('mealmatrix_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = useCallback(async (food, quantity = 1) => {
    // Normalise food object – backend returns `id`+`name`, UI may pass `food_id`+`food_name`
    const normalised = {
      ...food,
      food_id: food.food_id || food.id,   // ← KEY FIX: DB returns `id`, not `food_id`
      food_name: food.food_name || food.name,
      price: parseFloat(food.price) || 0,
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.food_id === normalised.food_id)
      if (existing) {
        return prev.map(item =>
          item.food_id === normalised.food_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { ...normalised, quantity }]
    })

    if (isAuthenticated) {
      try {
        // Backend returns updated cart; capture cart_item_id (DB primary key) for future deletes
        const res = await api.post('/cart', { food_id: normalised.food_id, quantity })
        const items = res.data?.data?.items || []
        // Sync cart_item_id from backend into local state
        setCartItems(prev =>
          prev.map(localItem => {
            const backendItem = items.find(bi => bi.food_id === localItem.food_id)
            return backendItem ? { ...localItem, cart_item_id: backendItem.id } : localItem
          })
        )
      } catch {
        // Silent fail – local state already updated
      }
    }
    toast.success(`${normalised.food_name} added to cart!`, {
      icon: '🛒',
      style: { background: '#1A1D24', color: '#fff', border: '1px solid #10B981' }
    })
  }, [isAuthenticated])

  const removeFromCart = useCallback(async (foodId) => {
    // Capture the DB row id BEFORE mutating state
    const item = cartItems.find(i => i.food_id === foodId)
    setCartItems(prev => prev.filter(i => i.food_id !== foodId))
    if (isAuthenticated && item?.cart_item_id) {
      try {
        // Must use cart row's DB id, NOT food_id
        await api.delete(`/cart/${item.cart_item_id}`)
      } catch {}
    }
  }, [isAuthenticated, cartItems])

  const updateQuantity = useCallback(async (foodId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(foodId)
      return
    }
    setCartItems(prev =>
      prev.map(item =>
        item.food_id === foodId ? { ...item, quantity } : item
      )
    )
    if (isAuthenticated) {
      try {
        // POST /cart does an upsert by food_id – correct endpoint (no PUT route exists)
        await api.post('/cart', { food_id: foodId, quantity })
      } catch {}
    }
  }, [isAuthenticated, removeFromCart])

  const clearCart = useCallback(() => {
    setCartItems([])
    localStorage.removeItem('mealmatrix_cart')
  }, [])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

export default CartContext
