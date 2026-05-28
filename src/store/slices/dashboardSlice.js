import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'
import { MOCK_DASHBOARD_DATA } from '../../data/mockData'

// Fetch dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/rsm')
      return response.data
    } catch (error) {
      // Return mock data for development
      return MOCK_DASHBOARD_DATA
    }
  }
)

const initialState = {
  previousMonth: {
    primary: { value: 0, percentage: 0 },
    secondary: { value: 0, percentage: 0 },
  },
  currentMonth: {
    primary: { target: 0, achieved: 0, percentage: 0 },
    secondary: { target: 0, achieved: 0, percentage: 0 },
  },
  yesterday: {
    primary: 0,
    secondary: 0,
  },
  teamStatus: {
    asm: { active: 0, inactive: 0 },
    so: { active: 0, inactive: 0 },
    supervisor: { active: 0, inactive: 0 },
    trainer: { active: 0, inactive: 0 },
    promoter: { active: 0, inactive: 0 },
  },
  loading: false,
  error: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false
        state.previousMonth = action.payload.previousMonth || state.previousMonth
        state.currentMonth = action.payload.currentMonth || state.currentMonth
        state.yesterday = action.payload.yesterday || state.yesterday
        state.teamStatus = action.payload.teamStatus || state.teamStatus
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = dashboardSlice.actions
export default dashboardSlice.reducer
