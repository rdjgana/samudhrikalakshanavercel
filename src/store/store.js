import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import dashboardReducer from './slices/dashboardSlice'
import attendanceReducer from './slices/attendanceSlice'
import activitiesReducer from './slices/activitiesSlice'
import targetsReducer from './slices/targetsSlice'
import ordersReducer from './slices/ordersSlice'
import claimsReducer from './slices/claimsSlice'
import approvalsReducer from './slices/approvalsSlice'
import reportsReducer from './slices/reportsSlice'
import { setStore } from '../api/api'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    attendance: attendanceReducer,
    activities: activitiesReducer,
    targets: targetsReducer,
    orders: ordersReducer,
    claims: claimsReducer,
    approvals: approvalsReducer,
    reports: reportsReducer,
  },
})

// Set store reference in api.js to break circular dependency
setStore(store)
