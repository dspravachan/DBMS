import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, Menu, X, ChevronDown, Shield, Utensils, LogOut, Package, CreditCard, Heart, Star, Home, BookOpen } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import GlobalSearchBar from '../ui/GlobalSearchBar'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setUserDropdown(false)
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={16} /> },
    { to: '/restaurants', label: 'Restaurants', icon: <Utensils size={16} /> },
    { to: '/meal-plans', label: 'Meal Plans', icon: <BookOpen size={16} /> },
  ]

  const userMenuItems = [
    { to: '/profile', label: 'My Profile', icon: <User size={16} /> },
    { to: '/orders', label: 'My Orders', icon: <Package size={16} /> },
    { to: '/my-subscriptions', label: 'Subscriptions', icon: <Star size={16} /> },
    { to: '/wallet', label: 'Wallet', icon: <CreditCard size={16} /> },
    { to: '/wishlist', label: 'Wishlist', icon: <Heart size={16} /> },
  ]

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-card' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl orange-gradient flex items-center justify-center shadow-orange group-hover:shadow-orange-lg transition-shadow">
              <Utensils size={18} className="text-white" />
            </div>
            <span className="text-xl font-black">
              Meal<span className="gradient-text">Matrix</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-soft hover:text-white hover:bg-bg-secondary transition-all text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search + Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search bar – GlobalSearchBar */}
            <div className="w-64">
              <GlobalSearchBar placeholder="Search food, restaurants…" />
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-bg-secondary hover:bg-accent/20 transition-all group"
              id="cart-btn"
            >
              <ShoppingCart size={20} className="text-gray-soft group-hover:text-accent transition-colors" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-orange"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 bg-bg-secondary hover:bg-accent/20 border border-transparent hover:border-accent/30 rounded-xl px-3 py-2 transition-all"
                  id="user-menu-btn"
                >
                  <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium max-w-24 truncate">{user?.name}</span>
                  {isAdmin && <Shield size={12} className="text-accent" />}
                  <ChevronDown size={14} className={`text-gray-soft transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl shadow-card border border-gray-800 overflow-hidden"
                    >
                      <div className="p-3 border-b border-gray-800">
                        <p className="text-white font-semibold text-sm">{user?.name}</p>
                        <p className="text-gray-muted text-xs truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:bg-accent/10 transition-colors"
                          >
                            <Shield size={16} /> Admin Dashboard
                          </Link>
                        )}
                        {userMenuItems.map(item => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-soft hover:text-white hover:bg-bg-secondary transition-colors"
                          >
                            {item.icon} {item.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-800 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-soft hover:text-white transition-colors px-3 py-2">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/cart" className="relative p-2 rounded-xl bg-bg-secondary">
              <ShoppingCart size={20} className="text-gray-soft" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl bg-bg-secondary text-gray-soft"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-gray-800"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-soft hover:text-white hover:bg-bg-secondary transition-all"
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              <div className="border-t border-gray-800 pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    {userMenuItems.map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-soft hover:text-white hover:bg-bg-secondary transition-all"
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-accent hover:bg-accent/10 transition-all">
                        <Shield size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 btn-ghost text-center text-sm py-2">Sign In</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary text-center text-sm py-2">Sign Up</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
