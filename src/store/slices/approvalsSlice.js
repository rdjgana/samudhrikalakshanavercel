import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'
import {
  MOCK_WORK_PLAN_APPROVALS,
  MOCK_TARGET_APPROVALS,
  MOCK_LEAVE_APPROVALS,
  MOCK_CLAIM_APPROVALS,
  MOCK_ORDER_APPROVALS,
  MOCK_EXTRA_MARGIN_APPROVALS,
} from '../../data/mockData'

// Fetch work plan approvals
export const fetchWorkPlanApprovals = createAsyncThunk(
  'approvals/fetchWorkPlan',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/approvals/work-plan', { params })
      return response.data
    } catch (error) {
      // Return mock data for development
      return MOCK_WORK_PLAN_APPROVALS
    }
  }
)

// Fetch target approvals
export const fetchTargetApprovals = createAsyncThunk(
  'approvals/fetchTarget',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/approvals/target', { params })
      return response.data
    } catch (error) {
      // Return mock data for development
      return MOCK_TARGET_APPROVALS
    }
  }
)

// Fetch leave approvals
export const fetchLeaveApprovals = createAsyncThunk(
  'approvals/fetchLeave',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/approvals/leave', { params })
      return response.data
    } catch (error) {
      // Return mock data for development
      return MOCK_LEAVE_APPROVALS
    }
  }
)

// Fetch claim approvals
export const fetchClaimApprovals = createAsyncThunk(
  'approvals/fetchClaim',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/approvals/claim', { params })
      return response.data
    } catch (error) {
      // Return mock data for development
      return MOCK_CLAIM_APPROVALS
    }
  }
)

// Fetch order approvals
export const fetchOrderApprovals = createAsyncThunk(
  'approvals/fetchOrder',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/approvals/order', { params })
      return response.data
    } catch (error) {
      // Return mock data for development
      return MOCK_ORDER_APPROVALS
    }
  }
)

// Fetch extra margin/display approvals
export const fetchExtraMarginApprovals = createAsyncThunk(
  'approvals/fetchExtraMargin',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/approvals/extra-margin', { params })
      return response.data
    } catch (error) {
      // Return mock data for development
      return MOCK_EXTRA_MARGIN_APPROVALS
    }
  }
)

// Approve/Reject/Change action
export const processApproval = createAsyncThunk(
  'approvals/process',
  async ({ type, id, action, comment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/approvals/${type}/${id}`, { action, comment })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process approval')
    }
  }
)

const initialState = {
  workPlanApprovals: [],
  targetApprovals: [],
  leaveApprovals: [],
  claimApprovals: [],
  orderApprovals: [],
  extraMarginApprovals: [],
  loading: false,
  error: null,
}

const approvalsSlice = createSlice({
  name: 'approvals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkPlanApprovals.fulfilled, (state, action) => {
        state.workPlanApprovals = action.payload
      })
      .addCase(fetchTargetApprovals.fulfilled, (state, action) => {
        state.targetApprovals = action.payload
      })
      .addCase(fetchLeaveApprovals.fulfilled, (state, action) => {
        state.leaveApprovals = action.payload
      })
      .addCase(fetchClaimApprovals.fulfilled, (state, action) => {
        state.claimApprovals = action.payload
      })
      .addCase(fetchOrderApprovals.fulfilled, (state, action) => {
        state.orderApprovals = action.payload
      })
      .addCase(fetchExtraMarginApprovals.fulfilled, (state, action) => {
        state.extraMarginApprovals = action.payload
      })
      .addCase(processApproval.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(processApproval.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(processApproval.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = approvalsSlice.actions
export default approvalsSlice.reducer
