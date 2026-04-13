import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { MOCK_HIERARCHY, getUserDetails } from "../../data/mockData";

// Fetch hierarchy for target assignment
export const fetchHierarchy = createAsyncThunk(
  "targets/fetchHierarchy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/targets/hierarchy");
      return response.data;
    } catch (error) {
      // Return mock data for development
      return MOCK_HIERARCHY;
    }
  },
);

// Fetch user details (distributor/shop counts)
export const fetchUserDetails = createAsyncThunk(
  "targets/fetchUserDetails",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/targets/user-details/${userId}`);
      return response.data;
    } catch (error) {
      // Return mock data for development
      const details = getUserDetails(userId);
      return details || { distributorCount: 0, shopCount: 0 };
    }
  },
);

// Assign target
export const assignTarget = createAsyncThunk(
  "targets/assign",
  async (targetData, { rejectWithValue }) => {
    try {
      const url = targetData.id
        ? `/targets/assign/${targetData.id}`
        : "/targets/assign";
      const method = targetData.id ? "put" : "post";
      const response = await api[method](url, targetData);
      return response.data;
    } catch (error) {
      // Return mock success for development
      const isEdit = !!targetData.id;
      return {
        id: targetData.id || Date.now(), // Preserve existing ID when editing
        ...targetData,
        status: "assigned",
        assignedAt: targetData.assignedAt || new Date().toISOString(), // Preserve original assignedAt
        updatedAt: isEdit ? new Date().toISOString() : undefined,
        message: isEdit
          ? "Target updated successfully"
          : "Target assigned successfully",
      };
    }
  },
);

// Fetch targets
export const fetchTargets = createAsyncThunk(
  "targets/fetch",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/targets", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch targets",
      );
    }
  },
);

const initialState = {
  hierarchy: {
    asms: [],
    sos: [],
    supervisors: [],
    distributors: [],
    promoters: [],
  },
  selectedUser: null,
  targets: [],
  assignedTargets: [], // Store assigned targets
  loading: false,
  error: null,
  successMessage: null,
};

const targetsSlice = createSlice({
  name: "targets",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHierarchy.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHierarchy.fulfilled, (state, action) => {
        state.loading = false;
        state.hierarchy = action.payload;
      })
      .addCase(fetchHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(assignTarget.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(assignTarget.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;

        // Check if this is an edit by comparing IDs (handle both string and number)
        const existingIndex = state.assignedTargets.findIndex(
          (t) => t.id === payload.id || String(t.id) === String(payload.id),
        );

        if (existingIndex !== -1) {
          // Update existing target - preserve original assignedAt, add updatedAt
          const existingTarget = state.assignedTargets[existingIndex];
          state.assignedTargets[existingIndex] = {
            ...existingTarget,
            ...payload,
            assignedAt: existingTarget.assignedAt || payload.assignedAt, // Preserve original assignedAt
            updatedAt: new Date().toISOString(), // Add update timestamp
          };
        } else {
          // Add new target
          state.assignedTargets.unshift(payload);
        }
        state.successMessage =
          payload.message || "Target assigned successfully";
        state.error = null;
      })
      .addCase(assignTarget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      .addCase(fetchTargets.fulfilled, (state, action) => {
        state.targets = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccessMessage,
  setSelectedUser,
  clearSelectedUser,
} = targetsSlice.actions;
export default targetsSlice.reducer;
