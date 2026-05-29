import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Sidebar from './components/layout/Sidebar'

// Public Pages
import Home from './pages/Home'
import RestaurantList from './pages/RestaurantList'
import RestaurantDetail from './pages/RestaurantDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import MealPlans from './pages/MealPlans'
import MealPlanDetail from './pages/MealPlanDetail'

// User Pages
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import MySubscriptions from './pages/MySubscriptions'
import WeeklyMenu from './pages/WeeklyMenu'
import Checkout from './pages/Checkout'
import Wallet from './pages/Wallet'
import Membership from './pages/Membership'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import ManageRestaurants from './pages/admin/ManageRestaurants'
import ManageFoods from './pages/admin/ManageFoods'
import ManageMealPlans from './pages/admin/ManageMealPlans'
import ManageWeeklyMenus from './pages/admin/ManageWeeklyMenus'
import ManageSubscriptions from './pages/admin/ManageSubscriptions'
import ManageCoupons from './pages/admin/ManageCoupons'
import ManageUsers from './pages/admin/ManageUsers'

// Route Guards
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return isAdmin ? children : <Navigate to="/" replace />
}

// Layout wrappers
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg font-inter">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg font-inter flex">
      <Sidebar />
      <div className="flex-1 overflow-auto ml-0 lg:ml-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/restaurants" element={<PublicLayout><RestaurantList /></PublicLayout>} />
      <Route path="/restaurants/:id" element={<PublicLayout><RestaurantDetail /></PublicLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/meal-plans" element={<PublicLayout><MealPlans /></PublicLayout>} />
      <Route path="/meal-plans/:id" element={<PublicLayout><MealPlanDetail /></PublicLayout>} />

      {/* Protected User Routes */}
      <Route path="/cart" element={<ProtectedRoute><PublicLayout><Cart /></PublicLayout></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><PublicLayout><Wishlist /></PublicLayout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><PublicLayout><Orders /></PublicLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><PublicLayout><Profile /></PublicLayout></ProtectedRoute>} />
      <Route path="/my-subscriptions" element={<ProtectedRoute><PublicLayout><MySubscriptions /></PublicLayout></ProtectedRoute>} />
      <Route path="/weekly-menu" element={<ProtectedRoute><PublicLayout><WeeklyMenu /></PublicLayout></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><PublicLayout><Checkout /></PublicLayout></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><PublicLayout><Wallet /></PublicLayout></ProtectedRoute>} />
      <Route path="/membership" element={<ProtectedRoute><PublicLayout><Membership /></PublicLayout></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><Dashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/restaurants" element={<AdminRoute><AdminLayout><ManageRestaurants /></AdminLayout></AdminRoute>} />
      <Route path="/admin/foods" element={<AdminRoute><AdminLayout><ManageFoods /></AdminLayout></AdminRoute>} />
      <Route path="/admin/meal-plans" element={<AdminRoute><AdminLayout><ManageMealPlans /></AdminLayout></AdminRoute>} />
      <Route path="/admin/weekly-menus" element={<AdminRoute><AdminLayout><ManageWeeklyMenus /></AdminLayout></AdminRoute>} />
      <Route path="/admin/subscriptions" element={<AdminRoute><AdminLayout><ManageSubscriptions /></AdminLayout></AdminRoute>} />
      <Route path="/admin/coupons" element={<AdminRoute><AdminLayout><ManageCoupons /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminLayout><ManageUsers /></AdminLayout></AdminRoute>} />

      {/* 404 */}
      <Route path="*" element={<PublicLayout><div className="min-h-[60vh] flex flex-col items-center justify-center"><h1 className="text-6xl font-black gradient-text">404</h1><p className="text-gray-soft mt-4 text-xl">Page not found</p><a href="/" className="btn-primary mt-8 inline-block">Go Home</a></div></PublicLayout>} />
    </Routes>
  )
}
