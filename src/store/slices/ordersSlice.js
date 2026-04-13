import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'
import { MOCK_SS_LIST, MOCK_HIERARCHY, MOCK_SHOPS, COSMETICS_CATEGORIES } from '../../data/mockData'

// Fetch SS list
export const fetchSSList = createAsyncThunk(
  'orders/fetchSSList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/ss-list')
      return response.data
    } catch (error) {
      // Return mock data for development
      return MOCK_SS_LIST
    }
  }
)

// Fetch Distributors by SS
export const fetchDistributorsBySS = createAsyncThunk(
  'orders/fetchDistributorsBySS',
  async (ssId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/distributors/${ssId}`)
      return response.data
    } catch (error) {
      // Return mock data for development - return all distributors for now
      return MOCK_HIERARCHY.distributors
    }
  }
)

// Fetch All Distributors
export const fetchAllDistributors = createAsyncThunk(
  'orders/fetchAllDistributors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/distributors')
      return response.data
    } catch (error) {
      // Return mock data for development
      return MOCK_HIERARCHY.distributors
    }
  }
)

// Fetch Shops by Distributor
export const fetchShopsByDistributor = createAsyncThunk(
  'orders/fetchShopsByDistributor',
  async (distributorId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/shops/${distributorId}`)
      return response.data
    } catch (error) {
      // Return mock data for development
      return MOCK_SHOPS.filter(shop => shop.distributorId === distributorId)
    }
  }
)

// Fetch All Shops
export const fetchAllShops = createAsyncThunk(
  'orders/fetchAllShops',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/shops')
      return response.data
    } catch (error) {
      // Return mock data for development
      return MOCK_SHOPS
    }
  }
)

// Fetch Categories
export const fetchCategories = createAsyncThunk(
  'orders/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/categories')
      return response.data
    } catch (error) {
      // Return mock data for development
      return COSMETICS_CATEGORIES.map(cat => cat.name)
    }
  }
)

// Create Order
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders/create', orderData)
      return response.data
    } catch (error) {
      // Return mock success for development
      const orderId = Date.now()
      const batchId = 'BATCH-' + Date.now().toString().slice(-8)
      const orderIdFormatted = 'ORD-' + Date.now().toString().slice(-8)
      const entityName = orderData.orderType === 'ss' 
        ? orderData.ssId 
        : orderData.orderType === 'distributor'
        ? orderData.distributorId
        : orderData.shopId
      
      return {
        id: orderId,
        orderId: orderIdFormatted,
        batchId: batchId,
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        message: 'Order created successfully',
        entityName,
      }
    }
  }
)

// Create Entity (SS, Distributor, Shop)
export const createEntity = createAsyncThunk(
  'orders/createEntity',
  async (entityData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders/create-entity', entityData)
      return response.data
    } catch (error) {
      // Mock success for development
      return {
        id: Date.now(),
        ...entityData,
        createdAt: new Date().toISOString(),
        message: 'Entity created successfully',
      }
    }
  }
)

// Fetch Orders
export const fetchOrders = createAsyncThunk(
  'orders/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

const initialState = {
  ssList: [],
  distributors: [],
  shops: [],
  categories: [],
  orders: [],
  createdOrders: [], // Store created orders
  createdEntities: [], // Store created entities (SS/Distributor/Shop)
  loading: false,
  error: null,
  successMessage: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null
    },
    clearDistributors: (state) => {
      state.distributors = []
    },
    clearShops: (state) => {
      state.shops = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSSList.fulfilled, (state, action) => {
        state.ssList = action.payload
      })
      .addCase(fetchDistributorsBySS.fulfilled, (state, action) => {
        state.distributors = action.payload
      })
      .addCase(fetchAllDistributors.fulfilled, (state, action) => {
        state.distributors = action.payload
      })
      .addCase(fetchShopsByDistributor.fulfilled, (state, action) => {
        state.shops = action.payload
      })
      .addCase(fetchAllShops.fulfilled, (state, action) => {
        state.shops = action.payload
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.createdOrders.unshift(action.payload)
        state.successMessage = action.payload.message || 'Order created successfully'
        state.error = null
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.successMessage = null
      })
      .addCase(createEntity.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(createEntity.fulfilled, (state, action) => {
        state.loading = false
        state.createdEntities.unshift(action.payload)
        state.successMessage =
          action.payload.message || 'Entity created successfully'
      })
      .addCase(createEntity.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload
      })
  },
})

export const { clearError, clearSuccessMessage, clearDistributors, clearShops } = ordersSlice.actions
export default ordersSlice.reducer
