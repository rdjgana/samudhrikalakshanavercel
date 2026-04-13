import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { username, password })
      const { token, user } = response.data
      
      // Store token in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { token, user }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

// Async thunk for logout
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
})

const initialState = {
  token: localStorage.getItem('token') || null,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    },
    dummyLogin: (state, action) => {
      // Dummy login for development - bypasses API
      // Supports RSM role
      const role = action.payload?.role || 'RSM'
      const dummyToken = 'dummy-jwt-token-' + Date.now()
      
      const dummyUser = {
        id: 1,
        username: 'rsm_user',
        name: 'RSM User',
        role: 'RSM',
        email: 'rsm@example.com'
      }
      
      state.token = dummyToken
      state.user = dummyUser
      state.isAuthenticated = true
      state.loading = false
      state.error = null
      
      localStorage.setItem('token', dummyToken)
      localStorage.setItem('user', JSON.stringify(dummyUser))
    },
    dummyPromoterLogin: (state, action) => {
      // Dummy promoter login for development - bypasses API
      const { shopId, shopName } = action.payload || {}
      const promoterToken = 'dummy-promoter-token-' + Date.now()
      
      const dummyPromoter = {
        id: 10,
        username: 'promoter_user',
        name: 'Kavitha Rani',
        role: 'Promoter',
        email: 'promoter@example.com',
        code: 'PROM001',
        shopId: shopId || null,
        shopName: shopName || null,
        distributorId: 1,
        area: 'T Nagar'
      }
      
      state.token = promoterToken
      state.user = dummyPromoter
      state.isAuthenticated = true
      state.loading = false
      state.error = null
      
      localStorage.setItem('token', promoterToken)
      localStorage.setItem('user', JSON.stringify(dummyPromoter))
    },
    dummySupervisorLogin: (state) => {
      // Dummy supervisor login for development - bypasses API
      const supervisorToken = 'dummy-supervisor-token-' + Date.now()
      const supervisorUser = {
        id: 5,
        username: 'supervisor_user',
        name: 'Mohan Raj',
        role: 'Supervisor',
        email: 'supervisor@example.com',
        supervisorId: 1
      }
      
      state.token = supervisorToken
      state.user = supervisorUser
      state.isAuthenticated = true
      state.loading = false
      state.error = null
      
      localStorage.setItem('token', supervisorToken)
      localStorage.setItem('user', JSON.stringify(supervisorUser))
    },
    dummySuperStockistLogin: (state) => {
      // Dummy Super Stockist login for development - bypasses API
      const ssToken = 'dummy-ss-token-' + Date.now()
      const ssUser = {
        id: 20,
        username: 'ss_user',
        name: 'Super Stockist User',
        role: 'Super Stockist',
        email: 'ss@example.com',
        code: 'SS001',
        gst: '29ABCDE1234F1Z5',
        aadhaar: '1234 5678 9012',
        pan: 'ABCDE1234F',
        ssId: 1
      }
      
      state.token = ssToken
      state.user = ssUser
      state.isAuthenticated = true
      state.loading = false
      state.error = null
      
      localStorage.setItem('token', ssToken)
      localStorage.setItem('user', JSON.stringify(ssUser))
    },
    dummyDistributorLogin: (state) => {
      // Dummy Distributor login for development - bypasses API
      const distributorToken = 'dummy-distributor-token-' + Date.now()
      const distributorUser = {
        id: 30,
        username: 'distributor_user',
        name: 'Distributor User',
        role: 'Distributor',
        email: 'distributor@example.com',
        code: 'DIST001',
        distributorId: 1,
        area: 'Sivakasi',
        ssId: 1
      }
      
      state.token = distributorToken
      state.user = distributorUser
      state.isAuthenticated = true
      state.loading = false
      state.error = null
      
      localStorage.setItem('token', distributorToken)
      localStorage.setItem('user', JSON.stringify(distributorUser))
    },
    dummyHRLogin: (state) => {
      // Dummy HR login for development - bypasses API
      const hrToken = 'dummy-hr-token-' + Date.now()
      const hrUser = {
        id: 40,
        username: 'hr_user',
        name: 'Gokul',
        role: 'HR',
        email: 'hr@example.com',
        code: 'HR001',
        designation: 'HR Manager'
      }
      
      state.token = hrToken
      state.user = hrUser
      state.isAuthenticated = true
      state.loading = false
      state.error = null
      
      localStorage.setItem('token', hrToken)
      localStorage.setItem('user', JSON.stringify(hrUser))
    },
    dummyHRManagerLogin: (state) => {
      // Dummy HR Manager login for development - bypasses API
      const hrManagerToken = 'dummy-hr-manager-token-' + Date.now()
      const hrManagerUser = {
        id: 50,
        username: 'hr_manager_user',
        name: 'HR Manager',
        role: 'HR Manager',
        email: 'hrmanager@example.com',
        code: 'HRM001',
        designation: 'HR Manager'
      }
      
      state.token = hrManagerToken
      state.user = hrManagerUser
      state.isAuthenticated = true
      state.loading = false
      state.error = null
      
      localStorage.setItem('token', hrManagerToken)
      localStorage.setItem('user', JSON.stringify(hrManagerUser))
    },
    dummyAdminLogin: (state) => {
      // Dummy Admin login for development - mirrors HR Manager access
      const adminToken = 'dummy-admin-token-' + Date.now()
      const adminUser = {
        id: 60,
        username: 'admin_user',
        name: 'Admin',
        role: 'Admin',
        email: 'admin@example.com',
        code: 'ADM001',
        designation: 'Admin'
      }

      state.token = adminToken
      state.user = adminUser
      state.isAuthenticated = true
      state.loading = false
      state.error = null

      localStorage.setItem('token', adminToken)
      localStorage.setItem('user', JSON.stringify(adminUser))
    },
    updateUserShop: (state, action) => {
      const { shopId, shopName } = action.payload || {}
      if (state.user && state.user.role === 'Promoter') {
        state.user = { ...state.user, shopId, shopName }
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null
        state.user = null
        state.isAuthenticated = false
      })
  },
})

export const { logout, clearError, dummyLogin, dummySupervisorLogin, dummyPromoterLogin, dummySuperStockistLogin, dummyDistributorLogin, dummyHRLogin, dummyHRManagerLogin, dummyAdminLogin, updateUserShop } = authSlice.actions
export default authSlice.reducer
