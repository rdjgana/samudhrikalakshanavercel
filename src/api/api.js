import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Store reference - will be set after store is created
let storeRef = null

// Function to set store reference (called from store.js after initialization)
export const setStore = (store) => {
  storeRef = store
}

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    if (storeRef) {
      const state = storeRef.getState()
      const token = state.auth.token

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle 401 & global errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - token expired
      if (error.response.status === 401) {
        if (storeRef) {
          // Import logout action dynamically to avoid circular dependency
          import('../store/slices/authSlice').then(({ logout }) => {
            storeRef.dispatch(logout())
          })
        }
        // Clear localStorage directly
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(new Error('Session expired. Please login again.'))
      }

      // Handle other errors
      const errorMessage = error.response.data?.message || error.response.data?.error || 'An error occurred'
      
      // You can add toast notification here
      console.error('API Error:', errorMessage)
      
      return Promise.reject(error)
    }

    // Network error
    if (error.request) {
      console.error('Network Error:', 'No response received from server')
      return Promise.reject(new Error('Network error. Please check your connection.'))
    }

    return Promise.reject(error)
  }
)

export default api
