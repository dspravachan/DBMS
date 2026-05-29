import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mealmatrix_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Allow injecting a logout callback from AuthContext so we avoid hard reloads
let _logoutCallback = null
export function setLogoutCallback(fn) {
  _logoutCallback = fn
}

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth tokens ONLY – do NOT touch the cart so items survive a re-login
      localStorage.removeItem('mealmatrix_token')
      localStorage.removeItem('mealmatrix_user')
      // Use React-aware logout if registered, otherwise fall back to redirect
      if (_logoutCallback) {
        _logoutCallback()
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
