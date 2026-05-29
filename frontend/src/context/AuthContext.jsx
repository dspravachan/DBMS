import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { setLogoutCallback } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('mealmatrix_token')
    const storedUser = localStorage.getItem('mealmatrix_user')
    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        // Guard against "undefined" string or non-object values
        if (parsed && typeof parsed === 'object') {
          setToken(storedToken)
          setUser(parsed)
        } else {
          throw new Error('Invalid user object')
        }
      } catch (e) {
        console.warn('Clearing corrupted auth session from localStorage:', e.message)
        localStorage.removeItem('mealmatrix_token')
        localStorage.removeItem('mealmatrix_user')
        localStorage.removeItem('mealmatrix_cart')
      }
    }
    setLoading(false)
  }, [])

  // Register logout with axios so 401s cleanly clear React state
  useEffect(() => {
    setLogoutCallback(() => {
      setUser(null)
      setToken(null)
    })
    return () => setLogoutCallback(null)
  }, [])

  const login = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('mealmatrix_token', userToken)
    localStorage.setItem('mealmatrix_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('mealmatrix_token')
    localStorage.removeItem('mealmatrix_user')
    localStorage.removeItem('mealmatrix_cart')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('mealmatrix_user', JSON.stringify(updatedUser))
  }

  const isAuthenticated = !!token && !!user
  const isAdmin = isAuthenticated && user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export default AuthContext
