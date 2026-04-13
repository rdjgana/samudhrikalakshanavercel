// Mock Data for RSM ERP System - Cosmetics Manufacturing

// Tamil Nadu Districts
export const TAMIL_NADU_DISTRICTS = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Erode',
  'Vellore',
  'Dindigul',
  'Thanjavur',
  'Tiruppur',
  'Kanchipuram',
  'Karur',
  'Namakkal',
  'Theni',
  'Tiruvallur',
  'Tiruvannamalai',
  'Villupuram',
  'Cuddalore',
  'Pudukkottai',
  'Ramanathapuram',
  'Sivaganga',
  'Thoothukudi',
  'Virudhunagar',
  'Krishnagiri',
  'Dharmapuri',
  'Nilgiris',
  'Perambalur',
  'Ariyalur',
  'Nagapattinam',
  'Thanjavur',
  'Kanyakumari',
  'Tenkasi',
  'Kallakurichi',
  'Chengalpattu',
  'Ranipet',
  'Tirupattur',
  'Mayiladuthurai',
]

// Cosmetics Categories
export const COSMETICS_CATEGORIES = [
  { id: 1, name: 'Face Care', products: ['Face Wash', 'Face Cream', 'Face Pack', 'Sunscreen'] },
  { id: 2, name: 'Body Care', products: ['Body Lotion', 'Body Wash', 'Body Scrub', 'Body Oil'] },
  { id: 3, name: 'Hair Care', products: ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Serum'] },
  { id: 4, name: 'Personal Care', products: ['Soap', 'Hand Wash', 'Sanitizer', 'Deodorant'] },
]

// Detailed Product List with Mock Data
export const MOCK_PRODUCTS = [
  // Face Care Products
  { id: 1, name: 'Face Wash', code: 'FC001', category: 'Face Care', price: 250, unit: 'piece', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop' },
  { id: 2, name: 'Face Cream', code: 'FC002', category: 'Face Care', price: 450, unit: 'piece', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop' },
  { id: 3, name: 'Face Pack', code: 'FC003', category: 'Face Care', price: 350, unit: 'piece', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=200&h=200&fit=crop' },
  { id: 4, name: 'Sunscreen', code: 'FC004', category: 'Face Care', price: 550, unit: 'piece', image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=200&h=200&fit=crop' },
  
  // Body Care Products
  { id: 5, name: 'Body Lotion', code: 'BC001', category: 'Body Care', price: 300, unit: 'piece', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop' },
  { id: 6, name: 'Body Wash', code: 'BC002', category: 'Body Care', price: 200, unit: 'piece', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200&h=200&fit=crop' },
  { id: 7, name: 'Body Scrub', code: 'BC003', category: 'Body Care', price: 400, unit: 'piece', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&h=200&fit=crop' },
  { id: 8, name: 'Body Oil', code: 'BC004', category: 'Body Care', price: 380, unit: 'piece', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&h=200&fit=crop' },
  
  // Hair Care Products
  { id: 9, name: 'Shampoo', code: 'HC001', category: 'Hair Care', price: 180, unit: 'piece', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop' },
  { id: 10, name: 'Conditioner', code: 'HC002', category: 'Hair Care', price: 200, unit: 'piece', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop' },
  { id: 11, name: 'Hair Oil', code: 'HC003', category: 'Hair Care', price: 150, unit: 'piece', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=200&h=200&fit=crop' },
  { id: 12, name: 'Hair Serum', code: 'HC004', category: 'Hair Care', price: 320, unit: 'piece', image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=200&h=200&fit=crop' },
  
  // Personal Care Products
  { id: 13, name: 'Soap', code: 'PC001', category: 'Personal Care', price: 50, unit: 'piece', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop' },
  { id: 14, name: 'Hand Wash', code: 'PC002', category: 'Personal Care', price: 120, unit: 'piece', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200&h=200&fit=crop' },
  { id: 15, name: 'Sanitizer', code: 'PC003', category: 'Personal Care', price: 100, unit: 'piece', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&h=200&fit=crop' },
  { id: 16, name: 'Deodorant', code: 'PC004', category: 'Personal Care', price: 280, unit: 'piece', image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=200&h=200&fit=crop' },
]

// Helper function to get products by category
export const getProductsByCategory = (categoryName) => {
  return MOCK_PRODUCTS.filter(product => product.category === categoryName)
}

/** Category names for filters (matches MOCK_PRODUCTS.category) */
export const RSM_STOCK_CATEGORY_FILTERS = [
  'Face Care',
  'Body Care',
  'Hair Care',
  'Personal Care',
]

/**
 * Deterministic mock stock lines for RSM monitoring: pieces and value (₹) per SKU.
 * entityType: 'ss' | 'distributor' | 'shop'
 */
export const getRsmStockDetailLines = (entityType, entityId) => {
  if (entityId === '' || entityId === undefined || entityId === null) return []
  const id = parseInt(entityId, 10)
  if (Number.isNaN(id)) return []
  const typeSalt = entityType === 'ss' ? 101 : entityType === 'distributor' ? 307 : 509
  return MOCK_PRODUCTS.map((p) => {
    const pieces = 25 + ((p.id * 17 + id * typeSalt) % 450)
    const value = Math.round(pieces * p.price)
    return {
      productId: p.id,
      productName: p.name,
      productCode: p.code,
      category: p.category,
      unitPrice: p.price,
      pieces,
      value,
    }
  })
}

// Mock Promoter Dashboard Data
export const MOCK_PROMOTER_DASHBOARD = {
  previousMonth: {
    salesAchieved: 285000,
    target: 300000,
    achievementPercentage: 95,
  },
  currentMonth: {
    target: 320000,
    achieved: 245000,
    achievementPercentage: 76.56,
    daysInMonth: 31,
    daysElapsed: 25,
  },
  attendance: {
    daysPresent: 22,
    totalDays: 25,
    attendancePercentage: 88,
  },
  incentive: {
    earned: 12500,
    target: 15000,
    percentage: 83.33,
  },
}

// Mock Promoter Tasks/Targets
export const MOCK_PROMOTER_TARGETS = {
  primaryTarget: {
    target: 250000, // Shop Purchase target
    achieved: 195000,
    balance: 55000,
    percentage: 78,
  },
  secondaryTarget: {
    target: 180000, // MAP (Maximum Achievable Price) target
    achieved: 142000,
    balance: 38000,
    percentage: 78.89,
  },
}

// Work Areas (Districts)
export const WORK_AREAS = TAMIL_NADU_DISTRICTS.map((district, index) => ({
  id: index + 1,
  name: district,
  code: district.toUpperCase().substring(0, 3),
}))

// Purpose of Visit Options
export const PURPOSE_OPTIONS = [
  'General Visit',
  'Sales Development',
  'Distributor Appointment',
  'New Shop Activation',
  'Issue Handling',
  'New Manpower Appointment',
  'Meetings',
]

// Supervisor-specific Purpose Options
export const SUPERVISOR_PURPOSE_OPTIONS = [
  'Primary Sale',
  'Secondary Sales',
  'Issue Handling',
  'General Visit',
  'New Store Activation',
  'Voice of Market',
  'Meetings',
]

// Issue Handling Categories for Supervisor
export const ISSUE_HANDLING_CATEGORIES = [
  'General',
  'With Senior',
  'With SM',
]

// Mock Hierarchy Data
export const MOCK_HIERARCHY = {
  asms: [
    { id: 1, name: 'Rajesh Kumar', code: 'ASM001', region: 'North Tamil Nadu' },
    { id: 2, name: 'Priya Menon', code: 'ASM002', region: 'South Tamil Nadu' },
    { id: 3, name: 'Suresh Iyer', code: 'ASM003', region: 'Central Tamil Nadu' },
    { id: 4, name: 'Lakshmi Devi', code: 'ASM004', region: 'West Tamil Nadu' },
  ],
  sos: [
    { id: 1, name: 'Arun Balaji', code: 'SO001', asmId: 1, district: 'Chennai' },
    { id: 2, name: 'Divya Ramesh', code: 'SO002', asmId: 1, district: 'Tiruvallur' },
    { id: 3, name: 'Karthik Senthil', code: 'SO003', asmId: 2, district: 'Madurai' },
    { id: 4, name: 'Meera Krishnan', code: 'SO004', asmId: 2, district: 'Tirunelveli' },
    { id: 5, name: 'Vikram Reddy', code: 'SO005', asmId: 3, district: 'Coimbatore' },
    { id: 6, name: 'Anjali Nair', code: 'SO006', asmId: 4, district: 'Salem' },
  ],
  supervisors: [
    { id: 1, name: 'Mohan Raj', code: 'SUP001', soId: 1, area: 'North Chennai' },
    { id: 2, name: 'Geetha Lakshmi', code: 'SUP002', soId: 1, area: 'South Chennai' },
    { id: 3, name: 'Ravi Shankar', code: 'SUP003', soId: 2, area: 'Tiruvallur Central' },
    { id: 4, name: 'Saranya Venkat', code: 'SUP004', soId: 3, area: 'Madurai East' },
    { id: 5, name: 'Ganesh Kumar', code: 'SUP005', soId: 4, area: 'Tirunelveli North' },
    { id: 6, name: 'Deepa Suresh', code: 'SUP006', soId: 5, area: 'Coimbatore West' },
  ],
  distributors: [
    { id: 1, name: 'Beauty Distributors Chennai', code: 'DIST001', supervisorId: 1, district: 'Chennai', shopCount: 25 },
    { id: 2, name: 'Cosmetic Solutions Pvt Ltd', code: 'DIST002', supervisorId: 1, district: 'Chennai', shopCount: 18 },
    { id: 3, name: 'Glow Distributors', code: 'DIST003', supervisorId: 2, district: 'Chennai', shopCount: 22 },
    { id: 4, name: 'Radiance Wholesale', code: 'DIST004', supervisorId: 3, district: 'Tiruvallur', shopCount: 15 },
    { id: 5, name: 'Beauty World Distributors', code: 'DIST005', supervisorId: 4, district: 'Madurai', shopCount: 20 },
    { id: 6, name: 'Cosmetic Hub', code: 'DIST006', supervisorId: 5, district: 'Tirunelveli', shopCount: 12 },
    { id: 7, name: 'Glow Enterprises', code: 'DIST007', supervisorId: 6, district: 'Coimbatore', shopCount: 28 },
  ],
  promoters: [
    { id: 1, name: 'Kavitha Rani', code: 'PROM001', distributorId: 1, area: 'T Nagar' },
    { id: 2, name: 'Selvi Murugan', code: 'PROM002', distributorId: 1, area: 'Anna Nagar' },
    { id: 3, name: 'Malathi Devi', code: 'PROM003', distributorId: 2, area: 'Adyar' },
    { id: 4, name: 'Kamala Iyer', code: 'PROM004', distributorId: 3, area: 'Velachery' },
    { id: 5, name: 'Latha Suresh', code: 'PROM005', distributorId: 4, area: 'Ambattur' },
    { id: 6, name: 'Rani Priya', code: 'PROM006', distributorId: 5, area: 'Madurai Central' },
    { id: 7, name: 'Meenakshi Sundaram', code: 'PROM007', distributorId: 6, area: 'Tirunelveli Town' },
    { id: 8, name: 'Pushpa Kumari', code: 'PROM008', distributorId: 7, area: 'Coimbatore City' },
  ],
}

// Super Stockists (SS)
export const MOCK_SS_LIST = [
  { id: 1, name: 'Beauty Cosmetics Super Stockist', code: 'SS001', city: 'Chennai', contact: '044-23456789' },
  { id: 2, name: 'Glow Beauty Wholesale', code: 'SS002', city: 'Coimbatore', contact: '0422-3456789' },
  { id: 3, name: 'Radiance Cosmetics Hub', code: 'SS003', city: 'Madurai', contact: '0452-4567890' },
  { id: 4, name: 'Beauty World Super Stockist', code: 'SS004', city: 'Salem', contact: '0427-5678901' },
  { id: 5, name: 'Cosmetic Solutions SS', code: 'SS005', city: 'Tiruchirappalli', contact: '0431-6789012' },
]

// Mock Dashboard Data
export const MOCK_DASHBOARD_DATA = {
  previousMonth: {
    primary: { value: 1250000, percentage: 85 },
    secondary: { value: 980000, percentage: 78 },
  },
  currentMonth: {
    primary: { target: 1500000, achieved: 1125000, percentage: 75 },
    secondary: { target: 1200000, achieved: 960000, percentage: 80 },
  },
  yesterday: {
    primary: 45000,
    secondary: 38000,
  },
  teamStatus: {
    asm: { active: 3, inactive: 1 },
    so: { active: 5, inactive: 1 },
    supervisor: { active: 5, inactive: 1 },
    trainer: { active: 2, inactive: 0 },
    promoter: { active: 7, inactive: 1 },
  },
}

// Mock Employees
export const MOCK_EMPLOYEES = [
  { id: 1, name: 'Rajesh Kumar', role: 'ASM', code: 'ASM001', status: 'Active' },
  { id: 2, name: 'Priya Menon', role: 'ASM', code: 'ASM002', status: 'Active' },
  { id: 3, name: 'Arun Balaji', role: 'SO', code: 'SO001', status: 'Active' },
  { id: 4, name: 'Divya Ramesh', role: 'SO', code: 'SO002', status: 'Active' },
  { id: 5, name: 'Mohan Raj', role: 'Supervisor', code: 'SUP001', status: 'Active' },
  { id: 6, name: 'Geetha Lakshmi', role: 'Supervisor', code: 'SUP002', status: 'Active' },
  { id: 7, name: 'Kavitha Rani', role: 'Promoter', code: 'PROM001', status: 'Active' },
  { id: 8, name: 'Selvi Murugan', role: 'Promoter', code: 'PROM002', status: 'Active' },
  { id: 9, name: 'Ravi Shankar', role: 'BDE', code: 'BDE001', status: 'Active' },
  { id: 10, name: 'Saranya Venkat', role: 'BDM', code: 'BDM001', status: 'Active' },
  { id: 11, name: 'Ganesh Kumar', role: 'TSE', code: 'TSE001', status: 'Active' },
]

// Mock Shops
export const MOCK_SHOPS = [
  { id: 1, name: 'Beauty Zone T Nagar', distributorId: 1, address: 'T Nagar, Chennai', contact: '9876543210' },
  { id: 2, name: 'Glow Beauty Parlour', distributorId: 1, address: 'Anna Nagar, Chennai', contact: '9876543211' },
  { id: 3, name: 'Radiance Cosmetics', distributorId: 2, address: 'Adyar, Chennai', contact: '9876543212' },
  { id: 4, name: 'Beauty World', distributorId: 3, address: 'Velachery, Chennai', contact: '9876543213' },
  { id: 5, name: 'Cosmetic Corner', distributorId: 4, address: 'Ambattur, Chennai', contact: '9876543214' },
  { id: 6, name: 'Glow Shop', distributorId: 5, address: 'Madurai Central', contact: '9876543215' },
  { id: 7, name: 'Beauty Hub', distributorId: 6, address: 'Tirunelveli Town', contact: '9876543216' },
  { id: 8, name: 'Cosmetic Store', distributorId: 7, address: 'Coimbatore City', contact: '9876543217' },
]

// Mock Stock Availability Data
export const MOCK_SHOP_STOCK_AVAILABILITY = [
  { id: 1, shopId: 1, shopName: 'Beauty Zone T Nagar', distributorId: 1, distributorName: 'Beauty Distributors Chennai', totalStock: 1250, lastUpdated: '2024-01-25T10:30:00' },
  { id: 2, shopId: 2, shopName: 'Glow Beauty Parlour', distributorId: 1, distributorName: 'Beauty Distributors Chennai', totalStock: 980, lastUpdated: '2024-01-25T09:15:00' },
  { id: 3, shopId: 3, shopName: 'Radiance Cosmetics', distributorId: 2, distributorName: 'Cosmetic Solutions Pvt Ltd', totalStock: 1120, lastUpdated: '2024-01-25T11:00:00' },
  { id: 4, shopId: 4, shopName: 'Beauty World', distributorId: 3, distributorName: 'Glow Distributors', totalStock: 850, lastUpdated: '2024-01-25T08:45:00' },
  { id: 5, shopId: 5, shopName: 'Cosmetic Corner', distributorId: 4, distributorName: 'Radiance Wholesale', totalStock: 920, lastUpdated: '2024-01-25T10:00:00' },
  { id: 6, shopId: 6, shopName: 'Glow Shop', distributorId: 5, distributorName: 'Beauty World Distributors', totalStock: 750, lastUpdated: '2024-01-25T09:30:00' },
  { id: 7, shopId: 7, shopName: 'Beauty Hub', distributorId: 6, distributorName: 'Cosmetic Hub', totalStock: 680, lastUpdated: '2024-01-25T11:15:00' },
  { id: 8, shopId: 8, shopName: 'Cosmetic Store', distributorId: 7, distributorName: 'Glow Enterprises', totalStock: 1050, lastUpdated: '2024-01-25T10:45:00' },
]

export const MOCK_DISTRIBUTOR_STOCK_AVAILABILITY = [
  { id: 1, distributorId: 1, distributorName: 'Beauty Distributors Chennai', code: 'DIST001', totalStock: 12500, availableStock: 9800, reservedStock: 2700, lastUpdated: '2024-01-25T10:00:00' },
  { id: 2, distributorId: 2, distributorName: 'Cosmetic Solutions Pvt Ltd', code: 'DIST002', totalStock: 11200, availableStock: 8500, reservedStock: 2700, lastUpdated: '2024-01-25T09:30:00' },
  { id: 3, distributorId: 3, distributorName: 'Glow Distributors', code: 'DIST003', totalStock: 9800, availableStock: 7200, reservedStock: 2600, lastUpdated: '2024-01-25T11:00:00' },
  { id: 4, distributorId: 4, distributorName: 'Radiance Wholesale', code: 'DIST004', totalStock: 8500, availableStock: 6200, reservedStock: 2300, lastUpdated: '2024-01-25T10:15:00' },
  { id: 5, distributorId: 5, distributorName: 'Beauty World Distributors', code: 'DIST005', totalStock: 9200, availableStock: 6800, reservedStock: 2400, lastUpdated: '2024-01-25T09:45:00' },
  { id: 6, distributorId: 6, distributorName: 'Cosmetic Hub', code: 'DIST006', totalStock: 7500, availableStock: 5500, reservedStock: 2000, lastUpdated: '2024-01-25T11:30:00' },
  { id: 7, distributorId: 7, distributorName: 'Glow Enterprises', code: 'DIST007', totalStock: 10500, availableStock: 7800, reservedStock: 2700, lastUpdated: '2024-01-25T10:30:00' },
]

// Mock Approvals Data
export const MOCK_WORK_PLAN_APPROVALS = [
  // ASM Work Plans
  { id: 1, employeeName: 'Rajesh Kumar', role: 'ASM', category: 'Face Care', date: '2024-01-20', status: 'Pending' },
  { id: 2, employeeName: 'Priya Menon', role: 'ASM', category: 'Body Care', date: '2024-01-21', status: 'Pending' },
  { id: 3, employeeName: 'Suresh Iyer', role: 'ASM', category: 'Hair Care', date: '2024-01-22', status: 'Pending' },
  { id: 4, employeeName: 'Lakshmi Devi', role: 'ASM', category: 'Personal Care', date: '2024-01-23', status: 'Pending' },
  
  // SO Work Plans
  { id: 5, employeeName: 'Arun Balaji', role: 'SO', category: 'Face Care', date: '2024-01-20', status: 'Pending' },
  { id: 6, employeeName: 'Divya Ramesh', role: 'SO', category: 'Body Care', date: '2024-01-21', status: 'Pending' },
  { id: 7, employeeName: 'Karthik Senthil', role: 'SO', category: 'Hair Care', date: '2024-01-22', status: 'Pending' },
  { id: 8, employeeName: 'Meera Krishnan', role: 'SO', category: 'Personal Care', date: '2024-01-23', status: 'Pending' },
  { id: 9, employeeName: 'Vikram Reddy', role: 'SO', category: 'Face Care', date: '2024-01-24', status: 'Pending' },
  
  // Supervisor Work Plans
  { id: 10, employeeName: 'Mohan Raj', role: 'Supervisor', category: 'Face Care', date: '2024-01-20', status: 'Pending' },
  { id: 11, employeeName: 'Geetha Lakshmi', role: 'Supervisor', category: 'Body Care', date: '2024-01-21', status: 'Pending' },
  { id: 12, employeeName: 'Ravi Shankar', role: 'Supervisor', category: 'Hair Care', date: '2024-01-22', status: 'Pending' },
  { id: 13, employeeName: 'Saranya Venkat', role: 'Supervisor', category: 'Personal Care', date: '2024-01-23', status: 'Pending' },
  { id: 14, employeeName: 'Ganesh Kumar', role: 'Supervisor', category: 'Face Care', date: '2024-01-24', status: 'Pending' },
  
  // BDM Work Plans
  { id: 15, employeeName: 'Ravi Shankar', role: 'BDM', category: 'Face Care', date: '2024-01-20', status: 'Pending' },
  { id: 16, employeeName: 'Deepa Suresh', role: 'BDM', category: 'Body Care', date: '2024-01-21', status: 'Pending' },
  { id: 17, employeeName: 'Karthik Iyer', role: 'BDM', category: 'Hair Care', date: '2024-01-22', status: 'Pending' },
  { id: 18, employeeName: 'Priya Nair', role: 'BDM', category: 'Personal Care', date: '2024-01-23', status: 'Pending' },
]

export const MOCK_TARGET_APPROVALS = [
  { id: 1, employeeName: 'Arun Balaji', month: '2024-02', status: 'Pending' },
  { id: 2, employeeName: 'Divya Ramesh', month: '2024-02', status: 'Pending' },
]

export const MOCK_LEAVE_APPROVALS = [
  { id: 1, employeeName: 'Kavitha Rani', date: '2024-01-25', reason: 'Personal', status: 'Pending' },
  { id: 2, employeeName: 'Selvi Murugan', date: '2024-01-26', reason: 'Sick Leave', status: 'Pending' },
]

export const MOCK_CLAIM_APPROVALS = [
  { id: 1, entityName: 'Beauty Distributors Chennai', date: '2024-01-20', amount: 5000, status: 'Pending' },
  { id: 2, entityName: 'Cosmetic Solutions Pvt Ltd', date: '2024-01-21', amount: 7500, status: 'Pending' },
]

export const MOCK_ORDER_APPROVALS = [
  { id: 1, entityName: 'Beauty Zone T Nagar', date: '2024-01-20', amount: 25000, status: 'Pending' },
  { id: 2, entityName: 'Glow Beauty Parlour', date: '2024-01-21', amount: 30000, status: 'Pending' },
]

export const MOCK_EXTRA_MARGIN_APPROVALS = [
  { id: 1, entityName: 'Beauty Distributors Chennai', date: '2024-01-20', status: 'Pending' },
  { id: 2, entityName: 'Glow Distributors', date: '2024-01-21', status: 'Pending' },
]

// Mock Area Details (for Activities)
export const getAreaDetails = (areaId) => {
  const area = WORK_AREAS.find(a => a.id === areaId)
  if (!area) return null

  // Find related hierarchy based on area/district
  const relatedDistributor = MOCK_HIERARCHY.distributors.find(d => 
    d.district === area.name
  )
  const relatedSupervisor = relatedDistributor ? 
    MOCK_HIERARCHY.supervisors.find(s => s.id === relatedDistributor.supervisorId) : null
  const relatedSO = relatedSupervisor ?
    MOCK_HIERARCHY.sos.find(so => so.id === relatedSupervisor.soId) : null
  const relatedASM = relatedSO ?
    MOCK_HIERARCHY.asms.find(asm => asm.id === relatedSO.asmId) : null
  const relatedSS = MOCK_SS_LIST.find(ss => ss.city === area.name)

  return {
    asm: relatedASM?.name || 'N/A',
    so: relatedSO?.name || 'N/A',
    supervisor: relatedSupervisor?.name || 'N/A',
    distributor: relatedDistributor?.name || 'N/A',
    ss: relatedSS?.name || 'N/A',
  }
}

// Mock KPI Reports Data
export const MOCK_TARGET_VS_SALES_CONSOLIDATED = [
  {
    entity: 'Total',
    entityType: 'Consolidated',
    primaryTarget: 5000000,
    primaryAchieved: 4200000,
    secondaryTarget: 4500000,
    secondaryAchieved: 3800000,
    primaryPercentage: 84.0,
    secondaryPercentage: 84.4,
  },
]

export const MOCK_TARGET_VS_SALES_CATEGORY_WISE = [
  {
    entity: 'Face Care',
    entityType: 'Category',
    primaryTarget: 1500000,
    primaryAchieved: 1280000,
    secondaryTarget: 1350000,
    secondaryAchieved: 1150000,
    primaryPercentage: 85.3,
    secondaryPercentage: 85.2,
  },
  {
    entity: 'Body Care',
    entityType: 'Category',
    primaryTarget: 1200000,
    primaryAchieved: 980000,
    secondaryTarget: 1100000,
    secondaryAchieved: 920000,
    primaryPercentage: 81.7,
    secondaryPercentage: 83.6,
  },
  {
    entity: 'Hair Care',
    entityType: 'Category',
    primaryTarget: 1400000,
    primaryAchieved: 1180000,
    secondaryTarget: 1300000,
    secondaryAchieved: 1080000,
    primaryPercentage: 84.3,
    secondaryPercentage: 83.1,
  },
  {
    entity: 'Personal Care',
    entityType: 'Category',
    primaryTarget: 900000,
    primaryAchieved: 760000,
    secondaryTarget: 750000,
    secondaryAchieved: 650000,
    primaryPercentage: 84.4,
    secondaryPercentage: 86.7,
  },
]

export const MOCK_TARGET_VS_SALES_EMPLOYEE_WISE = [
  {
    entity: 'Rajesh Kumar',
    entityType: 'ASM',
    primaryTarget: 1200000,
    primaryAchieved: 1020000,
    secondaryTarget: 1100000,
    secondaryAchieved: 950000,
    primaryPercentage: 85.0,
    secondaryPercentage: 86.4,
  },
  {
    entity: 'Priya Menon',
    entityType: 'ASM',
    primaryTarget: 1150000,
    primaryAchieved: 980000,
    secondaryTarget: 1050000,
    secondaryAchieved: 900000,
    primaryPercentage: 85.2,
    secondaryPercentage: 85.7,
  },
  {
    entity: 'Arun Balaji',
    entityType: 'SO',
    primaryTarget: 850000,
    primaryAchieved: 720000,
    secondaryTarget: 780000,
    secondaryAchieved: 680000,
    primaryPercentage: 84.7,
    secondaryPercentage: 87.2,
  },
  {
    entity: 'Divya Ramesh',
    entityType: 'SO',
    primaryTarget: 800000,
    primaryAchieved: 680000,
    secondaryTarget: 750000,
    secondaryAchieved: 640000,
    primaryPercentage: 85.0,
    secondaryPercentage: 85.3,
  },
  {
    entity: 'Saranya Venkat',
    entityType: 'BDM',
    primaryTarget: 950000,
    primaryAchieved: 810000,
    secondaryTarget: 880000,
    secondaryAchieved: 750000,
    primaryPercentage: 85.3,
    secondaryPercentage: 85.2,
  },
  {
    entity: 'Mohan Raj',
    entityType: 'Supervisor',
    primaryTarget: 600000,
    primaryAchieved: 510000,
    secondaryTarget: 550000,
    secondaryAchieved: 480000,
    primaryPercentage: 85.0,
    secondaryPercentage: 87.3,
  },
  {
    entity: 'Kavitha Rani',
    entityType: 'Promoter',
    primaryTarget: 350000,
    primaryAchieved: 300000,
    secondaryTarget: 320000,
    secondaryAchieved: 280000,
    primaryPercentage: 85.7,
    secondaryPercentage: 87.5,
  },
]

export const MOCK_ATTENDANCE_REPORT = [
  { employee: 'Rajesh Kumar', role: 'ASM', category: 'Face Care', daysPresent: 22, daysAbsent: 3, totalDays: 25, attendancePercentage: 88 },
  { employee: 'Rajesh Kumar', role: 'ASM', category: 'Body Care', daysPresent: 23, daysAbsent: 2, totalDays: 25, attendancePercentage: 92 },
  { employee: 'Rajesh Kumar', role: 'ASM', category: 'Hair Care', daysPresent: 21, daysAbsent: 4, totalDays: 25, attendancePercentage: 84 },
  { employee: 'Rajesh Kumar', role: 'ASM', category: 'Personal Care', daysPresent: 24, daysAbsent: 1, totalDays: 25, attendancePercentage: 96 },
  { employee: 'Priya Menon', role: 'ASM', category: 'Face Care', daysPresent: 23, daysAbsent: 2, totalDays: 25, attendancePercentage: 92 },
  { employee: 'Priya Menon', role: 'ASM', category: 'Body Care', daysPresent: 22, daysAbsent: 3, totalDays: 25, attendancePercentage: 88 },
  { employee: 'Priya Menon', role: 'ASM', category: 'Hair Care', daysPresent: 24, daysAbsent: 1, totalDays: 25, attendancePercentage: 96 },
  { employee: 'Priya Menon', role: 'ASM', category: 'Personal Care', daysPresent: 21, daysAbsent: 4, totalDays: 25, attendancePercentage: 84 },
  { employee: 'Arun Balaji', role: 'SO', category: 'Face Care', daysPresent: 20, daysAbsent: 5, totalDays: 25, attendancePercentage: 80 },
  { employee: 'Arun Balaji', role: 'SO', category: 'Body Care', daysPresent: 22, daysAbsent: 3, totalDays: 25, attendancePercentage: 88 },
  { employee: 'Arun Balaji', role: 'SO', category: 'Hair Care', daysPresent: 23, daysAbsent: 2, totalDays: 25, attendancePercentage: 92 },
  { employee: 'Arun Balaji', role: 'SO', category: 'Personal Care', daysPresent: 21, daysAbsent: 4, totalDays: 25, attendancePercentage: 84 },
  { employee: 'Divya Ramesh', role: 'SO', category: 'Face Care', daysPresent: 24, daysAbsent: 1, totalDays: 25, attendancePercentage: 96 },
  { employee: 'Divya Ramesh', role: 'SO', category: 'Body Care', daysPresent: 23, daysAbsent: 2, totalDays: 25, attendancePercentage: 92 },
  { employee: 'Divya Ramesh', role: 'SO', category: 'Hair Care', daysPresent: 22, daysAbsent: 3, totalDays: 25, attendancePercentage: 88 },
  { employee: 'Divya Ramesh', role: 'SO', category: 'Personal Care', daysPresent: 20, daysAbsent: 5, totalDays: 25, attendancePercentage: 80 },
]

export const MOCK_INCENTIVES_REPORT = [
  {
    category: 'Face Care',
    targetAchieved: 85,
    incentiveAmount: 45000,
    bonusAmount: 15000,
    totalIncentive: 60000,
    employeesEligible: 12,
  },
  {
    category: 'Body Care',
    targetAchieved: 82,
    incentiveAmount: 38000,
    bonusAmount: 12000,
    totalIncentive: 50000,
    employeesEligible: 10,
  },
  {
    category: 'Hair Care',
    targetAchieved: 84,
    incentiveAmount: 42000,
    bonusAmount: 14000,
    totalIncentive: 56000,
    employeesEligible: 11,
  },
  {
    category: 'Personal Care',
    targetAchieved: 87,
    incentiveAmount: 35000,
    bonusAmount: 10000,
    totalIncentive: 45000,
    employeesEligible: 8,
  },
]

export const MOCK_SALARY_REPORT = [
  {
    category: 'Face Care',
    totalEmployees: 15,
    totalSalary: 4500000,
    averageSalary: 300000,
    highestSalary: 850000,
    lowestSalary: 280000,
  },
  {
    category: 'Body Care',
    totalEmployees: 12,
    totalSalary: 3600000,
    averageSalary: 300000,
    highestSalary: 820000,
    lowestSalary: 270000,
  },
  {
    category: 'Hair Care',
    totalEmployees: 14,
    totalSalary: 4200000,
    averageSalary: 300000,
    highestSalary: 840000,
    lowestSalary: 290000,
  },
  {
    category: 'Personal Care',
    totalEmployees: 10,
    totalSalary: 2800000,
    averageSalary: 280000,
    highestSalary: 750000,
    lowestSalary: 250000,
  },
]

export const MOCK_EXPENSES_REPORT = [
  {
    category: 'Face Care',
    totalClaims: 42,
    totalExpenses: 185000,
    approvedAmount: 162000,
    pendingAmount: 23000,
    averageClaim: 4405,
  },
  {
    category: 'Body Care',
    totalClaims: 36,
    totalExpenses: 148000,
    approvedAmount: 132000,
    pendingAmount: 16000,
    averageClaim: 4111,
  },
  {
    category: 'Hair Care',
    totalClaims: 38,
    totalExpenses: 172000,
    approvedAmount: 155000,
    pendingAmount: 17000,
    averageClaim: 4526,
  },
  {
    category: 'Personal Care',
    totalClaims: 28,
    totalExpenses: 96500,
    approvedAmount: 88000,
    pendingAmount: 8500,
    averageClaim: 3446,
  },
]

export const MOCK_NEW_SHOPS_REPORT = [
  { shopName: 'Face Care Shop 1', category: 'Face Care', location: 'Chennai', workPlanDate: '2024-01-05', activatedDate: '2024-01-15', status: 'Active' },
  { shopName: 'Face Care Shop 2', category: 'Face Care', location: 'Coimbatore', workPlanDate: '2024-01-08', activatedDate: '2024-01-18', status: 'Active' },
  { shopName: 'Face Care Shop 3', category: 'Face Care', location: 'Madurai', workPlanDate: '2024-01-10', activatedDate: '2024-01-20', status: 'Active' },
  { shopName: 'Body Care Shop 1', category: 'Body Care', location: 'Chennai', workPlanDate: '2024-01-06', activatedDate: '2024-01-16', status: 'Active' },
  { shopName: 'Body Care Shop 2', category: 'Body Care', location: 'Salem', workPlanDate: '2024-01-09', activatedDate: '2024-01-19', status: 'Active' },
  { shopName: 'Body Care Shop 3', category: 'Body Care', location: 'Tirunelveli', workPlanDate: '2024-01-12', activatedDate: '2024-01-22', status: 'Pending' },
  { shopName: 'Hair Care Shop 1', category: 'Hair Care', location: 'Chennai', workPlanDate: '2024-01-07', activatedDate: '2024-01-17', status: 'Active' },
  { shopName: 'Hair Care Shop 2', category: 'Hair Care', location: 'Coimbatore', workPlanDate: '2024-01-11', activatedDate: '2024-01-21', status: 'Active' },
  { shopName: 'Hair Care Shop 3', category: 'Hair Care', location: 'Madurai', workPlanDate: '2024-01-13', activatedDate: '2024-01-23', status: 'Active' },
  { shopName: 'Personal Care Shop 1', category: 'Personal Care', location: 'Chennai', workPlanDate: '2024-01-08', activatedDate: '2024-01-18', status: 'Active' },
  { shopName: 'Personal Care Shop 2', category: 'Personal Care', location: 'Salem', workPlanDate: '2024-01-14', activatedDate: '2024-01-24', status: 'Active' },
]

// Mock Supervisor Dashboard Data
export const MOCK_SUPERVISOR_DASHBOARD = {
  teamStatus: {
    activePromoters: 6,
    inactivePromoters: 2,
    totalPromoters: 8,
  },
  performance: {
    yesterdayPrimarySales: 125000,
    yesterdaySecondarySales: 98000,
    todayPurchase: 45000,
    todaySales: 32000,
    primaryChange: 5.2, // percentage
    secondaryChange: -2.1,
    purchaseChange: 8.5,
    salesChange: 12.3,
  },
  promoters: [
    { id: 1, name: 'Kavitha Rani', code: 'PROM001', status: 'Active', todaySales: 8500 },
    { id: 2, name: 'Selvi Murugan', code: 'PROM002', status: 'Active', todaySales: 7200 },
    { id: 3, name: 'Malathi Devi', code: 'PROM003', status: 'Active', todaySales: 6800 },
    { id: 4, name: 'Kamala Iyer', code: 'PROM004', status: 'Active', todaySales: 5500 },
    { id: 5, name: 'Latha Suresh', code: 'PROM005', status: 'Active', todaySales: 4200 },
    { id: 6, name: 'Rani Priya', code: 'PROM006', status: 'Active', todaySales: 3800 },
    { id: 7, name: 'Meenakshi Sundaram', code: 'PROM007', status: 'Inactive', todaySales: 0 },
    { id: 8, name: 'Pushpa Kumari', code: 'PROM008', status: 'Inactive', todaySales: 0 },
  ],
}

// Mock Supervisor Promoters (for target assignment, orders, etc.)
export const MOCK_SUPERVISOR_PROMOTERS = [
  { id: 1, name: 'Kavitha Rani', code: 'PROM001', distributorId: 1, area: 'T Nagar', status: 'Active' },
  { id: 2, name: 'Selvi Murugan', code: 'PROM002', distributorId: 1, area: 'Anna Nagar', status: 'Active' },
  { id: 3, name: 'Malathi Devi', code: 'PROM003', distributorId: 2, area: 'Adyar', status: 'Active' },
  { id: 4, name: 'Kamala Iyer', code: 'PROM004', distributorId: 3, area: 'Velachery', status: 'Active' },
]

// Mock Supervisor Leave Requests (for RSM Profile)
export const MOCK_SUPERVISOR_LEAVE_REQUESTS = [
  {
    id: 1,
    supervisorId: 1,
    supervisorName: 'Rajesh Kumar',
    supervisorCode: 'SUP001',
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    days: 3,
    type: 'Casual Leave',
    reason: 'Family function',
    status: 'Pending',
    appliedAt: '2024-01-15',
  },
  {
    id: 2,
    supervisorId: 2,
    supervisorName: 'Priya Sharma',
    supervisorCode: 'SUP002',
    startDate: '2024-01-25',
    endDate: '2024-01-25',
    days: 1,
    type: 'Sick Leave',
    reason: 'Medical appointment',
    status: 'Pending',
    appliedAt: '2024-01-20',
  },
  {
    id: 3,
    supervisorId: 3,
    supervisorName: 'Vikram Singh',
    supervisorCode: 'SUP003',
    startDate: '2024-01-28',
    endDate: '2024-01-30',
    days: 3,
    type: 'Casual Leave',
    reason: 'Personal work',
    status: 'Approved',
    appliedAt: '2024-01-18',
    approvedAt: '2024-01-19',
  },
  {
    id: 4,
    supervisorId: 4,
    supervisorName: 'Anita Reddy',
    supervisorCode: 'SUP004',
    startDate: '2024-02-01',
    endDate: '2024-02-03',
    days: 3,
    type: 'Casual Leave',
    reason: 'Wedding',
    status: 'Rejected',
    appliedAt: '2024-01-22',
    rejectedAt: '2024-01-23',
    rejectionReason: 'High workload during that period',
  },
]

// Mock User Details (for Targets)
export const getUserDetails = (userId) => {
  // Check in different hierarchy levels
  const asm = MOCK_HIERARCHY.asms.find(a => a.id === userId)
  const so = MOCK_HIERARCHY.sos.find(s => s.id === userId)
  const supervisor = MOCK_HIERARCHY.supervisors.find(s => s.id === userId)
  const distributor = MOCK_HIERARCHY.distributors.find(d => d.id === userId)
  const promoter = MOCK_HIERARCHY.promoters.find(p => p.id === userId)

  const user = asm || so || supervisor || distributor || promoter
  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    code: user.code,
    distributorCount: distributor ? distributor.shopCount : (so ? 3 : 0),
    shopCount: distributor ? distributor.shopCount : 0,
  }
}
