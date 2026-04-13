import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'

// Fetch Target vs Sales report
export const fetchTargetVsSalesReport = createAsyncThunk(
  'reports/fetchTargetVsSales',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/target-vs-sales', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch target vs sales report')
    }
  }
)

// Fetch Attendance report
export const fetchAttendanceReport = createAsyncThunk(
  'reports/fetchAttendance',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/attendance', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance report')
    }
  }
)

// Fetch Incentives report
export const fetchIncentivesReport = createAsyncThunk(
  'reports/fetchIncentives',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/incentives', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch incentives report')
    }
  }
)

// Fetch Salary report
export const fetchSalaryReport = createAsyncThunk(
  'reports/fetchSalary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/salary', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch salary report')
    }
  }
)

// Fetch New Shops report
export const fetchNewShopsReport = createAsyncThunk(
  'reports/fetchNewShops',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/new-shops', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch new shops report')
    }
  }
)

const initialState = {
  targetVsSales: null,
  attendance: null,
  incentives: null,
  salary: null,
  newShops: null,
  loading: false,
  error: null,
}

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearReports: (state) => {
      state.targetVsSales = null
      state.attendance = null
      state.incentives = null
      state.salary = null
      state.newShops = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTargetVsSalesReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTargetVsSalesReport.fulfilled, (state, action) => {
        state.loading = false
        state.targetVsSales = action.payload
      })
      .addCase(fetchTargetVsSalesReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchAttendanceReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAttendanceReport.fulfilled, (state, action) => {
        state.loading = false
        state.attendance = action.payload
      })
      .addCase(fetchAttendanceReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchIncentivesReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIncentivesReport.fulfilled, (state, action) => {
        state.loading = false
        state.incentives = action.payload
      })
      .addCase(fetchIncentivesReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchSalaryReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSalaryReport.fulfilled, (state, action) => {
        state.loading = false
        state.salary = action.payload
      })
      .addCase(fetchSalaryReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchNewShopsReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNewShopsReport.fulfilled, (state, action) => {
        state.loading = false
        state.newShops = action.payload
      })
      .addCase(fetchNewShopsReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearReports } = reportsSlice.actions
export default reportsSlice.reducer
