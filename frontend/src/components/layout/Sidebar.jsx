import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Store, UtensilsCrossed, BookOpen, Calendar,
  Users, Ticket, Crown, ChevronLeft, Utensils, Menu, X
} from 'lucide-react'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/admin/restaurants', label: 'Restaurants', icon: <Store size={18} /> },
  { to: '/admin/foods', label: 'Foods', icon: <UtensilsCrossed size={18} /> },
  { to: '/admin/meal-plans', label: 'Meal Plans', icon: <BookOpen size={18} /> },
  { to: '/admin/weekly-menus', label: 'Weekly Menus', icon: <Calendar size={18} /> },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: <Crown size={18} /> },
  { to: '/admin/coupons', label: 'Coupons', icon: <Ticket size={18} /> },
  { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
]

export default function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg orange-gradient flex items-center justify-center">
              <Utensils size={16} className="text-white" />
            </div>
            <span className="font-black text-sm">Meal<span className="gradient-text">Matrix</span></span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-bg-secondary text-gray-muted hover:text-white transition-all hidden lg:block"
        >
          <ChevronLeft size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Label */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <span className="text-xs text-gray-800 font-semibold uppercase tracking-wider">Admin Panel</span>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                isActive
                  ? 'bg-accent/20 text-accent border border-accent/20 shadow-orange'
                  : 'text-gray-muted hover:text-white hover:bg-bg-secondary'
              }`}
            >
              <span className={`transition-colors ${isActive ? 'text-accent' : 'group-hover:text-white'}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="ml-auto w-1.5 h-1.5 bg-accent rounded-full"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-2 px-3 py-2 bg-bg-secondary rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-muted">System Online</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 mt-2 text-xs text-gray-muted hover:text-white transition-colors"
          >
            ← Back to Site
          </Link>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-bg-card border border-gray-800 rounded-xl text-gray-soft shadow-card"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed left-0 top-0 h-full w-64 bg-bg-card border-r border-gray-800 z-50 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-bg-secondary text-gray-muted"
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 70 : 256 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full bg-bg-card border-r border-gray-800 z-40 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>
    </>
  )
}
