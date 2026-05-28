import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'
import { MOCK_EMPLOYEES } from '../../data/mockData'

// Fetch employees list
export const fetchEmployees = createAsyncThunk(
  'claims/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/claims/employees')
      return response.data
    } catch (error) {
      // Return mock data for development
      return MOCK_EMPLOYEES
    }
  }
)

// Submit claim
export const submitClaim = createAsyncThunk(
  'claims/submit',
  async (claimData, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('claimType', claimData.claimType)
      formData.append('expenseType', claimData.expenseType)
      formData.append('reason', claimData.reason)
      
      if (claimData.employeeId) {
        formData.append('employeeId', claimData.employeeId)
      }
      
      if (claimData.amount) {
        formData.append('amount', claimData.amount)
      }

      claimData.billImages.forEach((image) => {
        formData.append('billImages', image)
      })

      claimData.proofImages.forEach((image) => {
        formData.append('proofImages', image)
      })

      const response = await api.post('/claims/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit claim')
    }
  }
)

// Fetch claims
export const fetchClaims = createAsyncThunk(
  'claims/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/claims', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch claims')
    }
  }
)

const initialState = {
  employees: [],
  claims: [],
  loading: false,
  error: null,
}

const claimsSlice = createSlice({
  name: 'claims',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.employees = action.payload
      })
      .addCase(submitClaim.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitClaim.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(submitClaim.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchClaims.fulfilled, (state, action) => {
        state.claims = action.payload
      })
  },
})

export const { clearError } = claimsSlice.actions
export default claimsSlice.reducer
