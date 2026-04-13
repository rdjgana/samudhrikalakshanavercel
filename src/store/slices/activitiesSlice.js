import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'
import { WORK_AREAS, getAreaDetails } from '../../data/mockData'

// Fetch work areas
export const fetchWorkAreas = createAsyncThunk(
  'activities/fetchWorkAreas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/activities/work-areas')
      return response.data
    } catch (error) {
      // Return mock data for development
      return WORK_AREAS
    }
  }
)

// Fetch area details (ASM, SO, Supervisor, Distributor, SS)
export const fetchAreaDetails = createAsyncThunk(
  'activities/fetchAreaDetails',
  async (areaId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/activities/area-details/${areaId}`)
      return response.data
    } catch (error) {
      // Return mock data for development
      const details = getAreaDetails(areaId)
      return details || {
        asm: 'Rajesh Kumar',
        so: 'Arun Balaji',
        supervisor: 'Mohan Raj',
        distributor: 'Beauty Distributors Chennai',
        ss: 'Beauty Cosmetics Super Stockist',
      }
    }
  }
)

// Submit activity
export const submitActivity = createAsyncThunk(
  'activities/submit',
  async (activityData, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('workAreaId', activityData.workAreaId)
      formData.append('purpose', activityData.purpose)
      formData.append('reason', activityData.reason)
      
      activityData.photos.forEach((photo) => {
        formData.append('photos', photo)
      })
      
      if (activityData.latitude && activityData.longitude) {
        formData.append('latitude', activityData.latitude)
        formData.append('longitude', activityData.longitude)
      }

      const response = await api.post('/activities/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      // Return mock success data for development
      const workArea = WORK_AREAS.find(area => area.id === parseInt(activityData.workAreaId))
      return {
        id: Date.now(),
        workAreaId: activityData.workAreaId,
        workAreaName: workArea?.name || 'Unknown Area',
        purpose: activityData.purpose,
        reason: activityData.reason,
        completionStatus: activityData.completionStatus || null,
        notCompletedReason: activityData.notCompletedReason || null,
        issueCategory: activityData.issueCategory || null,
        voiceOfMarket: activityData.voiceOfMarket || null,
        latitude: activityData.latitude,
        longitude: activityData.longitude,
        photoCount: activityData.photos?.length || 0,
        photoUrls: activityData.photos ? activityData.photos.map(file => URL.createObjectURL(file)) : [],
        voiceRecordingUrl: activityData.voiceRecording ? URL.createObjectURL(activityData.voiceRecording) : null,
        submittedAt: new Date().toISOString(),
        status: 'Submitted',
        message: 'Activity submitted successfully',
      }
    }
  }
)

// Fetch activities list
export const fetchActivities = createAsyncThunk(
  'activities/fetchList',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/activities', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities')
    }
  }
)

const initialState = {
  workAreas: [],
  selectedAreaDetails: null,
  activities: [],
  submittedActivities: [], // Store submitted activities
  loading: false,
  error: null,
  successMessage: null,
}

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearAreaDetails: (state) => {
      state.selectedAreaDetails = null
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkAreas.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchWorkAreas.fulfilled, (state, action) => {
        state.loading = false
        state.workAreas = action.payload
      })
      .addCase(fetchWorkAreas.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchAreaDetails.fulfilled, (state, action) => {
        state.selectedAreaDetails = action.payload
      })
      .addCase(submitActivity.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(submitActivity.fulfilled, (state, action) => {
        state.loading = false
        state.successMessage = action.payload.message || 'Activity submitted successfully'
        // Add to submitted activities list
        state.submittedActivities = [action.payload, ...state.submittedActivities]
      })
      .addCase(submitActivity.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.activities = action.payload
      })
  },
})

export const { clearError, clearAreaDetails, clearSuccessMessage } = activitiesSlice.actions
export default activitiesSlice.reducer
