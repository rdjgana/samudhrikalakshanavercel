import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { useDispatch, useSelector } from 'react-redux'
import Manpower from '../manpower/Manpower'
import {
  fetchSSList,
  fetchAllDistributors,
  fetchAllShops,
  fetchCategories,
  createOrder,
  clearSuccessMessage,
  clearError,
} from '../../store/slices/ordersSlice'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

import { COSMETICS_CATEGORIES, MOCK_SUPERVISOR_PROMOTERS, MOCK_PRODUCTS, getProductsByCategory, MOCK_SHOP_STOCK_AVAILABILITY, MOCK_DISTRIBUTOR_STOCK_AVAILABILITY, getRsmStockDetailLines } from '../../data/mockData'
import { Plus, Eye, Minus, Trash2, ShoppingCart } from 'lucide-react'

// Get category names for dropdown
const CATEGORIES = COSMETICS_CATEGORIES.map(cat => cat.name)

function getSuperStockistNameForDistributor(distributors, ssList, distributorId) {
  if (!distributorId || !distributors?.length) return null
  const dist = distributors.find((d) => d.id === parseInt(String(distributorId), 10))
  if (!dist?.ssId || !ssList?.length) return null
  const ss = ssList.find((s) => s.id === dist.ssId)
  return ss?.name ?? null
}

function PaginatedOrderCategoryProducts({ categoryProducts, selectedOrder }) {
  const pagination = useTablePagination(categoryProducts)
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagination.paginatedItems.map((product) => {
            const quantity = parseInt(selectedOrder.products[product.id]) || 0
            const totalValue = quantity * product.price
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={product.image || 'https://via.placeholder.com/60?text=Product'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded border border-gray-200"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/60?text=Product'
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.code}</TableCell>
                <TableCell className="text-right">₹{product.price}/{product.unit}</TableCell>
                <TableCell className="text-right">{quantity} units</TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  ₹{totalValue.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {categoryProducts.length > 0 && <TablePaginationControls {...pagination} />}
    </>
  )
}

const Orders = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { ssList, distributors, shops, createdOrders, loading, error, successMessage } = useSelector(
    (state) => state.orders
  )

  const isSupervisor = user?.role === 'Supervisor'
  const isRSM = user?.role === 'RSM'
  const [orderType, setOrderType] = useState(isSupervisor ? 'shop' : 'ss') // Supervisor defaults to shop
  const [showRSMOrderDialog, setShowRSMOrderDialog] = useState(false)
  const [rsmOrderData, setRsmOrderData] = useState({
    entityType: 'ss', // ss, distributor, shop
    entityId: '',
    ssId: '', // SS selection for shop orders
    distributorId: '', // Distributor selection for shop orders
    shopId: '', // Shop selection
    products: {}, // Structure: { productId: quantity }
  })
  const [orderData, setOrderData] = useState({
    ssId: '',
    distributorId: '',
    shopId: '',
    categories: {},
    // Supervisor-specific fields
    promoterId: '', // For Supervisor: Select Promoter
    primaryOrder: '', // Primary order details
    secondaryOrder: '', // Secondary order details
    shopTarget: '', // Target for shop
    shopStockVolume: '', // Shop Stock Volume
    distributorAvlStock: '', // Distributor Available Stock
    display: '', // Display information
    purchaseValue: 0, // Calculated Purchase Value (Day)
  })
  // Entities tab is used for SS/Distributor/Shop order creation (no entity creation)
  const [showSupervisorOrderDialog, setShowSupervisorOrderDialog] = useState(false)
  const [supervisorOrderData, setSupervisorOrderData] = useState({
    orderToType: 'shop', // shop | distributor
    shopId: '',
    distributorId: '',
    products: {}, // Structure: { productId: quantity }
    shopStockAvailability: '', // Shop Stock Availability
    distributorStockAvailability: '', // Distributor Stock Availability
  })
  const [supervisorSelectedCategory, setSupervisorSelectedCategory] = useState(COSMETICS_CATEGORIES[0]?.name || 'Face Care')
  const [showOrderViewDialog, setShowOrderViewDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [localFormError, setLocalFormError] = useState(null)

  const ordersPagination = useTablePagination(createdOrders || [])
  const supervisorShopStockPagination = useTablePagination(MOCK_SHOP_STOCK_AVAILABILITY)
  const supervisorDistributorStockPagination = useTablePagination(MOCK_DISTRIBUTOR_STOCK_AVAILABILITY)

  // Tab selection via ?tab= query param (e.g. /orders?tab=manpower)
  const [searchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const allowedRSMTabs = ['orders', 'entities', 'manpower']
  const allowedSupervisorTabs = ['orders', 'stock-availability']
  const defaultTab = isSupervisor
    ? allowedSupervisorTabs.includes(requestedTab)
      ? requestedTab
      : 'orders'
    : allowedRSMTabs.includes(requestedTab)
      ? requestedTab
      : 'orders'

  // ---- Entity Onboarding (RSM Entities tab) ----
  const EMPTY_ENTITY_FORM = {
    // common
    name: '',
    code: '',
    status: 'Active',
    phone: '',
    email: '',
    address: '',
    // person fields (SS / Distributor)
    dateOfBirth: '',
    dateOfJoining: '',
    gender: '',
    aadharNumber: '',
    panNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: '',
    qualification: '',
    experience: '',
    previousCompany: '',
    region: '',
    district: '',
    // shop fields
    ownerName: '',
    gstNumber: '',
    shopType: '',
    openingDate: '',
    linkedDistributorId: '',
  }
  const [entityFormType, setEntityFormType] = useState('ss')
  const [entityFormData, setEntityFormData] = useState(EMPTY_ENTITY_FORM)
  const [onboardedEntities, setOnboardedEntities] = useState([])
  const [entityFormError, setEntityFormError] = useState(null)
  const [entitySuccessMessage, setEntitySuccessMessage] = useState('')
  const onboardedEntitiesPagination = useTablePagination(onboardedEntities)

  const handleEntityFieldChange = (field, value) => {
    setEntityFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEntityTypeChange = (nextType) => {
    setEntityFormType(nextType)
    setEntityFormData(EMPTY_ENTITY_FORM)
    setEntityFormError(null)
  }

  const generateEntityCode = (type) => {
    const prefix = type === 'ss' ? 'SS' : type === 'distributor' ? 'DIST' : 'SHOP'
    const seed = (onboardedEntities.filter((e) => e.type === type).length + 1)
      .toString()
      .padStart(3, '0')
    return `${prefix}-${seed}`
  }

  const handleEntityOnboardSubmit = (e) => {
    e.preventDefault()
    setEntityFormError(null)

    if (entityFormType === 'shop') {
      if (!entityFormData.name.trim()) {
        setEntityFormError('Shop name is required')
        return
      }
      if (!entityFormData.ownerName.trim()) {
        setEntityFormError('Owner name is required')
        return
      }
      if (!entityFormData.phone.trim()) {
        setEntityFormError('Phone is required')
        return
      }
    } else {
      if (!entityFormData.name.trim()) {
        setEntityFormError('Name is required')
        return
      }
      if (!entityFormData.phone.trim()) {
        setEntityFormError('Phone is required')
        return
      }
    }

    const newEntity = {
      id: Date.now(),
      type: entityFormType,
      typeLabel:
        entityFormType === 'ss'
          ? 'Super Stockist'
          : entityFormType === 'distributor'
            ? 'Distributor'
            : 'Shop',
      code: entityFormData.code?.trim() || generateEntityCode(entityFormType),
      createdAt: new Date().toISOString(),
      ...entityFormData,
    }

    setOnboardedEntities((prev) => [newEntity, ...prev])
    setEntityFormData(EMPTY_ENTITY_FORM)
    setEntitySuccessMessage(`${newEntity.typeLabel} "${newEntity.name}" onboarded successfully`)
    window.setTimeout(() => setEntitySuccessMessage(''), 4000)
  }

  useEffect(() => {
    dispatch(fetchSSList())
    dispatch(fetchCategories())
    dispatch(fetchAllDistributors())
    dispatch(fetchAllShops())
  }, [dispatch])

  // Reset form when switching order types (only for non-Supervisor)
  useEffect(() => {
    if (!isSupervisor) {
      setOrderData(prev => ({
        ...prev,
        ssId: '',
        distributorId: '',
        shopId: '',
        categories: {},
      }))
    }
  }, [orderType, isSupervisor])

  const handleOrderSubmit = async (e) => {
    e.preventDefault()
    setLocalFormError(null)
    
    // Supervisor-specific validation
    if (isSupervisor) {
      if (!orderData.promoterId || !orderData.shopId) {
        setLocalFormError('Please select Promoter and Shop')
        return
      }
    }
    
    // Get entity name based on order type
    let entityName = ''
    if (orderType === 'ss') {
      const ss = ssList.find(s => s.id === parseInt(orderData.ssId))
      entityName = ss?.name || 'Unknown SS'
    } else if (orderType === 'distributor') {
      const dist = distributors.find(d => d.id === parseInt(orderData.distributorId))
      entityName = dist?.name || 'Unknown Distributor'
    } else if (orderType === 'shop') {
      const shop = shops.find(s => s.id === parseInt(orderData.shopId))
      entityName = shop?.name || 'Unknown Shop'
    }
    
    // For Supervisor, get promoter name
    if (isSupervisor && orderData.promoterId) {
      const promoter = MOCK_SUPERVISOR_PROMOTERS.find(p => p.id === parseInt(orderData.promoterId))
      entityName = promoter ? `${entityName} (via ${promoter.name})` : entityName
    }
    
    const submitData = {
      orderType: isSupervisor ? 'shop' : orderType,
      entityName,
      ...orderData,
    }
    
    const result = await dispatch(createOrder(submitData))
    
    if (createOrder.fulfilled.match(result)) {
      // Reset form
      setOrderData({
        ssId: '',
        distributorId: '',
        shopId: '',
        categories: {},
        promoterId: '',
        primaryOrder: '',
        secondaryOrder: '',
        shopTarget: '',
        shopStockVolume: '',
        distributorAvlStock: '',
        display: '',
        purchaseValue: 0,
      })
      // Clear success message after 5 seconds
      setTimeout(() => {
        dispatch(clearSuccessMessage())
      }, 5000)
    }
  }

  const getEntityName = (order) => {
    // For Supervisor orders, show shop and distributor
    if (isSupervisor && order.shopId) {
      const shop = shops.find(s => s.id === parseInt(order.shopId))
      const distributor = distributors.find(d => d.id === parseInt(order.distributorId))
      if (shop && distributor) {
        return `${shop.name} (Distributor: ${distributor.name})`
      }
      return shop?.name || 'Unknown Shop'
    }
    
    if (order.orderType === 'ss') {
      const ss = ssList.find(s => s.id === parseInt(order.ssId))
      return ss?.name || 'Unknown SS'
    } else if (order.orderType === 'distributor') {
      const dist = distributors.find(d => d.id === parseInt(order.distributorId))
      return dist?.name || 'Unknown Distributor'
    } else if (order.orderType === 'shop') {
      const shop = shops.find(s => s.id === parseInt(order.shopId))
      return shop?.name || 'Unknown Shop'
    }
    return 'Unknown'
  }

  const handleCategoryChange = (category, value) => {
    const newCategories = {
      ...orderData.categories,
      [category]: value,
    }
    
    // Calculate Purchase Value for Supervisor (sum of all category cases * average price per case)
    let purchaseValue = 0
    if (isSupervisor) {
      const averagePricePerCase = 5000 // Mock average price per case
      Object.values(newCategories).forEach(cases => {
        purchaseValue += (parseInt(cases) || 0) * averagePricePerCase
      })
    }
    
    setOrderData({
      ...orderData,
      categories: newCategories,
      purchaseValue: isSupervisor ? purchaseValue : orderData.purchaseValue,
    })
  }

  const getSupervisorQuantityStep = (orderToType) => (orderToType === 'distributor' ? 12 : 3)
  const getSupervisorMarginPercent = (orderToType) => (orderToType === 'distributor' ? 8 : 12)
  const getBasicValue = (product, orderToType) => {
    const marginPercent = getSupervisorMarginPercent(orderToType)
    return Math.round(product.price * (1 - marginPercent / 100))
  }

  const supervisorDistributorSsName = useMemo(() => {
    if (supervisorOrderData.orderToType !== 'distributor' || !supervisorOrderData.distributorId) {
      return null
    }
    return getSuperStockistNameForDistributor(
      distributors,
      ssList,
      supervisorOrderData.distributorId,
    )
  }, [supervisorOrderData.orderToType, supervisorOrderData.distributorId, distributors, ssList])

  // Supervisor-specific product quantity handler
  const handleSupervisorProductQuantity = (productId, quantity) => {
    setSupervisorOrderData({
      ...supervisorOrderData,
      products: {
        ...supervisorOrderData.products,
        [productId]: quantity,
      },
    })
  }

  // Handle quantity increment/decrement by step
  const handleQuantityChange = (productId, currentValue, direction) => {
    const currentQty = parseInt(currentValue) || 0
    const step = getSupervisorQuantityStep(supervisorOrderData.orderToType)
    
    if (direction === 'increment') {
      const nextValue = currentQty + step
      handleSupervisorProductQuantity(productId, nextValue.toString())
    } else if (direction === 'decrement') {
      const prevValue = Math.max(0, currentQty - step)
      handleSupervisorProductQuantity(productId, prevValue > 0 ? prevValue.toString() : '')
    }
  }

  // RSM step / margin helpers (mirrors Supervisor pricing logic)
  // SS orders are placed in cases (24 units / case) with the deepest margin.
  const RSM_CASE_SIZE = 24
  const getRSMQuantityStep = (entityType) => {
    if (entityType === 'ss') return RSM_CASE_SIZE
    if (entityType === 'distributor') return 12
    if (entityType === 'shop') return 6
    return 1
  }
  const getRSMMarginPercent = (entityType) => {
    if (entityType === 'ss') return 6
    if (entityType === 'distributor') return 8
    if (entityType === 'shop') return 12
    return 0
  }
  const getRSMBasicValue = (product, entityType) => {
    const marginPercent = getRSMMarginPercent(entityType)
    return Math.round(product.price * (1 - marginPercent / 100))
  }
  const rsmShowsBasicValue =
    rsmOrderData.entityType === 'ss' ||
    rsmOrderData.entityType === 'distributor' ||
    rsmOrderData.entityType === 'shop'

  // RSM per-product stock map for the currently selected entity (deterministic mock)
  const rsmStockByProduct = useMemo(() => {
    const entityType = rsmOrderData.entityType
    let id = ''
    if (entityType === 'ss') id = rsmOrderData.ssId
    else if (entityType === 'distributor') id = rsmOrderData.entityId
    else if (entityType === 'shop') id = rsmOrderData.shopId
    if (!id) return {}
    const lines = getRsmStockDetailLines(entityType, id)
    return lines.reduce((acc, line) => {
      acc[line.productId] = line.pieces
      return acc
    }, {})
  }, [rsmOrderData.entityType, rsmOrderData.ssId, rsmOrderData.entityId, rsmOrderData.shopId])

  const getRSMProductStock = (productId) =>
    typeof rsmStockByProduct[productId] === 'number' ? rsmStockByProduct[productId] : 0

  // Handle RSM product quantity
  const handleRSMProductQuantity = (productId, quantity) => {
    setRsmOrderData({
      ...rsmOrderData,
      products: {
        ...rsmOrderData.products,
        [productId]: quantity,
      },
    })
  }

  // Handle RSM quantity increment/decrement (step + stock-aware)
  const handleRSMQuantityChange = (productId, currentValue, direction) => {
    const currentQty = parseInt(currentValue) || 0
    const step = getRSMQuantityStep(rsmOrderData.entityType)
    const stock = getRSMProductStock(productId)

    if (direction === 'increment') {
      const proposed = currentQty + step
      // Clamp to the largest multiple of `step` that fits within stock
      const maxAllowed = step > 1 ? Math.floor(stock / step) * step : stock
      const nextValue = stock > 0 ? Math.min(proposed, maxAllowed) : currentQty
      if (nextValue <= currentQty) return
      handleRSMProductQuantity(productId, nextValue.toString())
    } else if (direction === 'decrement') {
      const prevValue = Math.max(0, currentQty - step)
      handleRSMProductQuantity(productId, prevValue > 0 ? prevValue.toString() : '')
    }
  }

  // Handle RSM order submission
  const handleRSMOrderSubmit = async (e) => {
    e.preventDefault()
    setLocalFormError(null)
    
    if (rsmOrderData.entityType === 'ss' && !rsmOrderData.ssId) {
      setLocalFormError('Please select Super Stockist')
      return
    }

    if (rsmOrderData.entityType === 'distributor' && !rsmOrderData.entityId) {
      setLocalFormError('Please select Distributor')
      return
    }

    if (rsmOrderData.entityType === 'shop') {
      if (!rsmOrderData.ssId) {
        setLocalFormError('Please select Super Stockist')
        return
      }
      if (!rsmOrderData.distributorId) {
        setLocalFormError('Please select Distributor')
        return
      }
      if (!rsmOrderData.shopId) {
        setLocalFormError('Please select Shop')
        return
      }
    }

    // Check if at least one product has quantity
    const hasProducts = Object.values(rsmOrderData.products).some(qty => parseInt(qty) > 0)
    if (!hasProducts) {
      setLocalFormError('Please add at least one product with quantity')
      return
    }

    // Get entity name
    let entityName = ''
    if (rsmOrderData.entityType === 'ss') {
      const ss = ssList.find((s) => s.id === parseInt(rsmOrderData.ssId))
      entityName = ss?.name || 'Unknown SS'
    } else if (rsmOrderData.entityType === 'distributor') {
      const dist = distributors.find(d => d.id === parseInt(rsmOrderData.entityId))
      entityName = dist?.name || 'Unknown Distributor'
    } else if (rsmOrderData.entityType === 'shop') {
      const shop = shops.find(s => s.id === parseInt(rsmOrderData.shopId))
      entityName = shop?.name || 'Unknown Shop'
    }
    
    const submitData = {
      orderType: rsmOrderData.entityType,
      entityName,
      ...(rsmOrderData.entityType === 'ss' && { ssId: rsmOrderData.ssId }),
      ...(rsmOrderData.entityType === 'distributor' && {
        distributorId: rsmOrderData.entityId,
      }),
      ...(rsmOrderData.entityType === 'shop' && { shopId: rsmOrderData.shopId }),
      ...(rsmOrderData.entityType === 'shop' && {
        ssId: rsmOrderData.ssId,
        distributorId: rsmOrderData.distributorId,
      }),
      products: rsmOrderData.products,
    }
    
    const result = await dispatch(createOrder(submitData))
    
    if (createOrder.fulfilled.match(result)) {
      // Reset form
      setRsmOrderData({
        entityType: 'ss',
        entityId: '',
        ssId: '',
        distributorId: '',
        shopId: '',
        products: {},
      })
      setShowRSMOrderDialog(false)
      // Clear success message after 5 seconds
      setTimeout(() => {
        dispatch(clearSuccessMessage())
      }, 5000)
    }
  }

  // Handle Supervisor order submission
  const handleSupervisorOrderSubmit = async (e) => {
    e.preventDefault()
    setLocalFormError(null)
    
    if (supervisorOrderData.orderToType === 'shop' && !supervisorOrderData.shopId) {
      setLocalFormError('Please select shop')
      return
    }

    if (!supervisorOrderData.distributorId) {
      setLocalFormError(
        supervisorOrderData.orderToType === 'shop'
          ? 'Distributor is required for selected shop'
          : 'Please select distributor',
      )
      return
    }

    const hasProducts = Object.values(supervisorOrderData.products).some(qty => parseInt(qty) > 0)
    if (!hasProducts) {
      setLocalFormError('Please add at least one product quantity')
      return
    }

    const shop = shops.find(s => s.id === parseInt(supervisorOrderData.shopId))
    const distributor = distributors.find(d => d.id === parseInt(supervisorOrderData.distributorId))
    
    const submitData = {
      orderType: supervisorOrderData.orderToType,
      entityName:
        supervisorOrderData.orderToType === 'shop'
          ? (shop?.name || 'Unknown Shop')
          : (distributor?.name || 'Unknown Distributor'),
      ...(supervisorOrderData.orderToType === 'shop' && {
        shopId: supervisorOrderData.shopId,
        shopName: shop?.name,
      }),
      distributorId: supervisorOrderData.distributorId,
      distributorName: distributor?.name,
      products: supervisorOrderData.products,
    }
    
    const result = await dispatch(createOrder(submitData))
    
    if (createOrder.fulfilled.match(result)) {
      // Reset form
      setSupervisorOrderData({
        orderToType: 'shop',
        shopId: '',
        distributorId: '',
        products: {},
        shopStockAvailability: '',
        distributorStockAvailability: '',
      })
      setShowSupervisorOrderDialog(false)
      // Clear success message after 5 seconds
      setTimeout(() => {
        dispatch(clearSuccessMessage())
      }, 5000)
    }
  }

  // Entities tab does not create entities; it uses order creation flow.

  return (
    <div className="space-y-6">
      {/* Header with Create Order Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isSupervisor ? 'Orders' : 'Orders & Entity Creation'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isSupervisor 
              ? 'View and create orders' 
              : 'Create orders and manage entities'
            }
          </p>
        </div>
        {(isRSM || isSupervisor) && (
          <Button
            onClick={() => isSupervisor ? setShowSupervisorOrderDialog(true) : setShowRSMOrderDialog(true)}
            className="bg-[#433228] hover:bg-[#5a4238] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        )}
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          {isSupervisor ? (
            <>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="stock-availability">Stock Availability</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="entities">Entities</TabsTrigger>
              {isRSM && (
                <TabsTrigger value="manpower">Manpower &amp; Employee</TabsTrigger>
              )}
            </>
          )}
        </TabsList>

        {/* Supervisor Orders Tab */}
        {isSupervisor && (
          <TabsContent value="orders">
            {/* Success Message */}
            {successMessage && (
              <Card className="border-green-500 bg-green-50 mb-6">
                <CardContent className="pt-6">
                  <p className="text-green-700 font-medium">{successMessage}</p>
                </CardContent>
              </Card>
            )}

            {/* Error Message */}
            {(error || localFormError) && (
              <Card className="border-destructive mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-destructive">{error || localFormError}</p>
                    <Button variant="ghost" size="sm" onClick={() => { dispatch(clearError()); setLocalFormError(null); }}>
                      ×
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Orders List Table */}
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>List of all submitted orders</CardDescription>
              </CardHeader>
              <CardContent>
                {createdOrders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>S.No</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Batch ID</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead className="text-center">View</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersPagination.paginatedItems.map((order, index) => {
                        // Calculate total value
                        const totalValue = order.products && Object.keys(order.products).length > 0
                          ? Object.entries(order.products).reduce((sum, [productId, quantity]) => {
                              const product = MOCK_PRODUCTS.find(p => p.id === parseInt(productId))
                              return sum + (parseInt(quantity) * (product?.price || 0))
                            }, 0)
                          : 0

                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              {(ordersPagination.page - 1) * ordersPagination.pageSize + index + 1}
                            </TableCell>
                            <TableCell className="font-medium">{order.orderId || `ORD-${order.id}`}</TableCell>
                            <TableCell>{order.batchId || `BATCH-${order.id}`}</TableCell>
                            <TableCell className="text-right">
                              <span className="font-semibold text-green-600">
                                ₹{totalValue.toLocaleString('en-IN')}
                              </span>
                            </TableCell>
                            <TableCell>
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Just now'}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setShowOrderViewDialog(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-500 py-8">No orders created yet</p>
                )}
                {createdOrders.length > 0 && <TablePaginationControls {...ordersPagination} />}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Supervisor Stock Availability Tab */}
        {isSupervisor && (
          <TabsContent value="stock-availability">
            <div className="space-y-6">
              {/* Shop Stock Availability by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Shop Stock Availability</CardTitle>
                  <CardDescription>Current stock availability by category and products at all shops</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={COSMETICS_CATEGORIES[0]?.name} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      {COSMETICS_CATEGORIES.map((category) => (
                        <TabsTrigger key={category.id} value={category.name}>
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {COSMETICS_CATEGORIES.map((category) => {
                      const categoryProducts = getProductsByCategory(category.name)
                      return (
                        <TabsContent key={category.id} value={category.name} className="space-y-4 mt-4">
                          <div className="border rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-[#433228] mb-4">{category.name} - Shop Stock</h3>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Shop Name</TableHead>
                                  <TableHead>Distributor</TableHead>
                                  {categoryProducts.map((product) => (
                                    <TableHead key={product.id} className="text-center">
                                      {product.name}
                                    </TableHead>
                                  ))}
                                  <TableHead className="text-right">Category Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {supervisorShopStockPagination.paginatedItems.map((shop) => {
                                  // Calculate stock per product (mock calculation - distribute total stock across products)
                                  const productsStock = categoryProducts.map((product) => {
                                    // Mock: Distribute stock evenly across products in category
                                    const stockPerProduct = Math.floor(shop.totalStock / 16) // 16 total products across all categories
                                    return {
                                      productId: product.id,
                                      stock: stockPerProduct + (Math.random() * 50) // Add some variation
                                    }
                                  })
                                  const categoryTotal = productsStock.reduce((sum, p) => sum + Math.floor(p.stock), 0)

                                  return (
                                    <TableRow key={shop.id}>
                                      <TableCell className="font-medium">{shop.shopName}</TableCell>
                                      <TableCell>{shop.distributorName}</TableCell>
                                      {productsStock.map((productStock) => (
                                        <TableCell key={productStock.productId} className="text-center">
                                          <span className="font-semibold text-blue-600">
                                            {Math.floor(productStock.stock)}
                                          </span>
                                        </TableCell>
                                      ))}
                                      <TableCell className="text-right">
                                        <span className="font-semibold text-green-600">
                                          {categoryTotal}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                            {MOCK_SHOP_STOCK_AVAILABILITY.length > 0 && (
                              <TablePaginationControls {...supervisorShopStockPagination} />
                            )}
                          </div>
                        </TabsContent>
                      )
                    })}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Distributor Stock Availability by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Distributor Stock Availability</CardTitle>
                  <CardDescription>Current stock availability by category and products at all distributors</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={COSMETICS_CATEGORIES[0]?.name} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      {COSMETICS_CATEGORIES.map((category) => (
                        <TabsTrigger key={category.id} value={category.name}>
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {COSMETICS_CATEGORIES.map((category) => {
                      const categoryProducts = getProductsByCategory(category.name)
                      return (
                        <TabsContent key={category.id} value={category.name} className="space-y-4 mt-4">
                          <div className="border rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-[#433228] mb-4">{category.name} - Distributor Stock</h3>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Distributor Name</TableHead>
                                  <TableHead>Code</TableHead>
                                  {categoryProducts.map((product) => (
                                    <TableHead key={product.id} className="text-center">
                                      {product.name}
                                    </TableHead>
                                  ))}
                                  <TableHead className="text-right">Available</TableHead>
                                  <TableHead className="text-right">Category Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {supervisorDistributorStockPagination.paginatedItems.map((distributor) => {
                                  // Calculate stock per product (mock calculation)
                                  const productsStock = categoryProducts.map((product) => {
                                    // Mock: Distribute available stock across products
                                    const stockPerProduct = Math.floor(distributor.availableStock / 16)
                                    return {
                                      productId: product.id,
                                      available: stockPerProduct + (Math.random() * 100)
                                    }
                                  })
                                  const categoryAvailable = productsStock.reduce((sum, p) => sum + Math.floor(p.available), 0)
                                  const categoryTotal = categoryAvailable

                                  return (
                                    <TableRow key={distributor.id}>
                                      <TableCell className="font-medium">{distributor.distributorName}</TableCell>
                                      <TableCell>{distributor.code}</TableCell>
                                      {productsStock.map((productStock) => (
                                        <TableCell key={productStock.productId} className="text-center">
                                          <span className="font-semibold text-green-600">
                                            {Math.floor(productStock.available)}
                                          </span>
                                        </TableCell>
                                      ))}
                                      <TableCell className="text-right">
                                        <span className="font-semibold text-green-600">
                                          {categoryAvailable.toLocaleString('en-IN')}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <span className="font-semibold">
                                          {categoryTotal.toLocaleString('en-IN')}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                            {MOCK_DISTRIBUTOR_STOCK_AVAILABILITY.length > 0 && (
                              <TablePaginationControls {...supervisorDistributorStockPagination} />
                            )}
                          </div>
                        </TabsContent>
                      )
                    })}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* RSM/ASM/SO Orders Tab */}
        {!isSupervisor && (
          <TabsContent value="orders">
            {/* Orders List - Always shown for RSM */}
            {(isRSM || createdOrders.length > 0) && (
              <Card className={isRSM ? '' : 'mb-6'}>
                <CardHeader>
                  <CardTitle>Created Orders</CardTitle>
                  <CardDescription>List of all submitted orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {createdOrders.length > 0 ? (
                    <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>S.No</TableHead>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Batch ID</TableHead>
                          <TableHead className="text-right">Overall Value</TableHead>
                          <TableHead className="text-center">View</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ordersPagination.paginatedItems.map((order, index) => {
                          // Calculate overall value
                          const overallValue = order.products && Object.keys(order.products).length > 0
                            ? Object.entries(order.products).reduce((sum, [productId, quantity]) => {
                                const product = MOCK_PRODUCTS.find(p => p.id === parseInt(productId))
                                return sum + (parseInt(quantity) * (product?.price || 0))
                              }, 0)
                            : 0

                          return (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">
                                {(ordersPagination.page - 1) * ordersPagination.pageSize + index + 1}
                              </TableCell>
                              <TableCell className="font-medium">{order.orderId || `ORD-${order.id}`}</TableCell>
                              <TableCell>{order.batchId || `BATCH-${order.id}`}</TableCell>
                              <TableCell className="text-right">
                                <span className="font-semibold text-green-600">
                                  ₹{overallValue.toLocaleString('en-IN')}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setShowOrderViewDialog(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                    <TablePaginationControls {...ordersPagination} />
                    </>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No orders created yet</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Order Creation Form - Only for non-RSM */}
            {!isRSM && (
              <>
              <Card>
                <CardHeader>
                  <CardTitle>Create New Order</CardTitle>
                  <CardDescription>Select order type and enter category-wise cases</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={orderType} onValueChange={setOrderType} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="ss">SS Order</TabsTrigger>
                      <TabsTrigger value="distributor">Distributor Order</TabsTrigger>
                      <TabsTrigger value="shop">Shop Order</TabsTrigger>
                    </TabsList>

                {/* SS Order Tab */}
                <TabsContent value="ss">
                  <form onSubmit={handleOrderSubmit} className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label>Super Stockist (SS)</Label>
                      <Select
                        value={orderData.ssId}
                        onChange={(e) =>
                          setOrderData({
                            ...orderData,
                            ssId: e.target.value,
                            distributorId: '',
                            shopId: '',
                          })
                        }
                        required
                      >
                        <option value="">Select SS</option>
                        {ssList.map((ss) => (
                          <option key={ss.id} value={ss.id}>
                            {ss.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Category-wise Cases</Label>
                      <div className="border rounded-lg p-4 space-y-4">
                        {CATEGORIES.map((category) => (
                          <div key={category} className="flex items-center gap-4">
                            <Label className="w-40 font-medium">{category}</Label>
                            <Input
                              type="number"
                              placeholder="Enter cases"
                              value={orderData.categories[category] || ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)
                                handleCategoryChange(category, value)
                              }}
                              onInput={(e) => {
                                if (e.target.value < 0) e.target.value = 0
                              }}
                              min="0"
                              className="max-w-xs"
                            />
                            <span className="text-sm text-gray-500">cases</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit SS Order'}
                    </Button>
                  </form>
                </TabsContent>

                {/* Distributor Order Tab */}
                <TabsContent value="distributor">
                  <form onSubmit={handleOrderSubmit} className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label>Distributor</Label>
                      <Select
                        value={orderData.distributorId}
                        onChange={(e) =>
                          setOrderData({
                            ...orderData,
                            distributorId: e.target.value,
                            shopId: '',
                          })
                        }
                        required
                      >
                        <option value="">Select Distributor</option>
                        {distributors.map((dist) => (
                          <option key={dist.id} value={dist.id}>
                            {dist.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Category-wise Cases</Label>
                      <div className="border rounded-lg p-4 space-y-4">
                        {CATEGORIES.map((category) => (
                          <div key={category} className="flex items-center gap-4">
                            <Label className="w-40 font-medium">{category}</Label>
                            <Input
                              type="number"
                              placeholder="Enter cases"
                              value={orderData.categories[category] || ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)
                                handleCategoryChange(category, value)
                              }}
                              onInput={(e) => {
                                if (e.target.value < 0) e.target.value = 0
                              }}
                              min="0"
                              className="max-w-xs"
                            />
                            <span className="text-sm text-gray-500">cases</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Distributor Order'}
                    </Button>
                  </form>
                </TabsContent>

                {/* Shop Order Tab */}
                <TabsContent value="shop">
                  <form onSubmit={handleOrderSubmit} className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label>Shop</Label>
                      <Select
                        value={orderData.shopId}
                        onChange={(e) =>
                          setOrderData({ ...orderData, shopId: e.target.value })
                        }
                        required
                      >
                        <option value="">Select Shop</option>
                        {shops.map((shop) => (
                          <option key={shop.id} value={shop.id}>
                            {shop.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Category-wise Cases</Label>
                      <div className="border rounded-lg p-4 space-y-4">
                        {CATEGORIES.map((category) => (
                          <div key={category} className="flex items-center gap-4">
                            <Label className="w-40 font-medium">{category}</Label>
                            <Input
                              type="number"
                              placeholder="Enter cases"
                              value={orderData.categories[category] || ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)
                                handleCategoryChange(category, value)
                              }}
                              onInput={(e) => {
                                if (e.target.value < 0) e.target.value = 0
                              }}
                              min="0"
                              className="max-w-xs"
                            />
                            <span className="text-sm text-gray-500">cases</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Shop Order'}
                    </Button>
                  </form>
                </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Success Message */}
              {successMessage && (
                <Card className="border-green-500 bg-green-50 mt-6">
                  <CardContent className="pt-6">
                    <p className="text-green-700 font-medium">{successMessage}</p>
                  </CardContent>
                </Card>
              )}

              {/* Error Message */}
              {error && (
                <Card className="border-destructive mt-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-destructive">{error}</p>
                      <Button variant="ghost" size="sm" onClick={() => dispatch(clearError())}>
                        ×
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Created Orders List - Only for non-RSM (RSM orders shown above) */}
              {createdOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Created Orders</CardTitle>
                <CardDescription>List of all submitted orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {createdOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{getEntityName(order)}</h4>
                          <p className="text-sm text-gray-600">
                            Type: {order.orderType?.toUpperCase() || 'N/A'} | 
                            Created: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Just now'}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      
                      {/* Supervisor-specific order details */}
                      {isSupervisor && order.shopId && (
                        <div className="mt-3 mb-3 p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-sm mb-2">Order Details:</h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {order.shopName && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Shop:</span>
                                <span className="font-medium">{order.shopName}</span>
                              </div>
                            )}
                            {order.distributorName && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Distributor:</span>
                                <span className="font-medium">{order.distributorName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Product-wise details for Supervisor orders */}
                      {isSupervisor && order.products && Object.keys(order.products).length > 0 ? (
                        <div className="mt-3">
                          <h5 className="font-medium text-sm mb-2">Product-wise Quantity:</h5>
                          <div className="space-y-3">
                            {Object.entries(order.products).map(([productId, quantity]) => {
                              const product = MOCK_PRODUCTS.find(p => p.id === parseInt(productId))
                              if (!product || !quantity) return null
                              const totalPrice = parseInt(quantity) * product.price
                              return (
                                <div key={productId} className="border rounded-lg p-3 bg-white">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p className="font-medium text-sm">{product.name}</p>
                                      <p className="text-xs text-gray-500">Code: {product.code} | Price: ₹{product.price}/{product.unit}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                      {quantity} units
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                                    <span className="text-gray-600">Total Value:</span>
                                    <span className="font-semibold text-green-600">₹{totalPrice.toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          {/* Calculate and display total order value */}
                          {(() => {
                            const totalOrderValue = Object.entries(order.products).reduce((sum, [productId, quantity]) => {
                              const product = MOCK_PRODUCTS.find(p => p.id === parseInt(productId))
                              return sum + (parseInt(quantity) * (product?.price || 0))
                            }, 0)
                            return totalOrderValue > 0 ? (
                              <div className="mt-4 p-3 bg-green-50 rounded-lg border-2 border-green-200">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-green-800">Total Order Value:</span>
                                  <span className="text-xl font-bold text-green-700">₹{totalOrderValue.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            ) : null
                          })()}
                        </div>
                      ) : (
                        /* Category-wise details for non-Supervisor orders */
                        <div className="mt-3">
                          <h5 className="font-medium text-sm mb-2">Category-wise Cases:</h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(order.categories || {}).map(([category, cases]) => (
                              cases ? (
                                <div key={category} className="flex justify-between">
                                  <span className="text-gray-600">{category}:</span>
                                  <span className="font-medium">{cases} cases</span>
                                </div>
                              ) : null
                            ))}
                          </div>
                          {Object.keys(order.categories || {}).filter(cat => order.categories[cat]).length === 0 && (
                            <p className="text-gray-400 text-sm">No categories selected</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                </CardContent>
              </Card>
              )}
              </>
            )}
        </TabsContent>
        )}

        {/* RSM/ASM/SO Entities Tab */}
        {!isSupervisor && (
          <TabsContent value="entities">
          <div className="space-y-6">
            {successMessage && (
              <Card className="border-green-500 bg-green-50">
                <CardContent className="pt-6">
                  <p className="text-green-700 font-medium">{successMessage}</p>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-destructive">{error}</p>
                    <Button variant="ghost" size="sm" onClick={() => dispatch(clearError())}>
                      ×
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Entity Onboarding</CardTitle>
                <CardDescription>
                  Onboard a new Super Stockist, Distributor, or Shop. SS and Distributor use the manpower
                  employee details template; Shop uses basic shop onboarding inputs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {entitySuccessMessage && (
                  <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    {entitySuccessMessage}
                  </div>
                )}
                {entityFormError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {entityFormError}
                  </div>
                )}

                <form onSubmit={handleEntityOnboardSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Select Entity Type *</Label>
                      <Select
                        value={entityFormType}
                        onChange={(e) => handleEntityTypeChange(e.target.value)}
                        required
                      >
                        <option value="ss">Super Stockist (SS)</option>
                        <option value="distributor">Distributor</option>
                        <option value="shop">Shop</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entity-code">Code</Label>
                      <Input
                        id="entity-code"
                        value={entityFormData.code}
                        onChange={(e) => handleEntityFieldChange('code', e.target.value)}
                        placeholder="Auto-generated if empty"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entity-status">Status *</Label>
                      <Select
                        id="entity-status"
                        value={entityFormData.status}
                        onChange={(e) => handleEntityFieldChange('status', e.target.value)}
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </Select>
                    </div>
                  </div>

                  {/* SS / Distributor form (matches Manpower Employee template) */}
                  {(entityFormType === 'ss' || entityFormType === 'distributor') && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="entity-name">
                            {entityFormType === 'ss' ? 'Super Stockist Name *' : 'Distributor Name *'}
                          </Label>
                          <Input
                            id="entity-name"
                            value={entityFormData.name}
                            onChange={(e) => handleEntityFieldChange('name', e.target.value)}
                            placeholder="Enter full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="entity-phone">Phone *</Label>
                          <Input
                            id="entity-phone"
                            type="tel"
                            value={entityFormData.phone}
                            onChange={(e) => handleEntityFieldChange('phone', e.target.value)}
                            placeholder="Enter phone number"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="entity-email">Email</Label>
                          <Input
                            id="entity-email"
                            type="email"
                            value={entityFormData.email}
                            onChange={(e) => handleEntityFieldChange('email', e.target.value)}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="entity-address">Address</Label>
                          <Input
                            id="entity-address"
                            value={entityFormData.address}
                            onChange={(e) => handleEntityFieldChange('address', e.target.value)}
                            placeholder="Enter address"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="entity-dob">Date of Birth</Label>
                            <Input
                              id="entity-dob"
                              type="date"
                              value={entityFormData.dateOfBirth}
                              onChange={(e) => handleEntityFieldChange('dateOfBirth', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="entity-doj">Date of Joining</Label>
                            <Input
                              id="entity-doj"
                              type="date"
                              value={entityFormData.dateOfJoining}
                              onChange={(e) => handleEntityFieldChange('dateOfJoining', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="entity-gender">Gender</Label>
                            <Select
                              id="entity-gender"
                              value={entityFormData.gender}
                              onChange={(e) => handleEntityFieldChange('gender', e.target.value)}
                            >
                              <option value="">Select gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="entity-qualification">Qualification</Label>
                            <Input
                              id="entity-qualification"
                              value={entityFormData.qualification}
                              onChange={(e) => handleEntityFieldChange('qualification', e.target.value)}
                              placeholder="e.g., B.Com, MBA, Diploma"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Identity Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="entity-aadhar">Aadhar Number</Label>
                            <Input
                              id="entity-aadhar"
                              value={entityFormData.aadharNumber}
                              onChange={(e) => handleEntityFieldChange('aadharNumber', e.target.value)}
                              placeholder="Enter 12-digit Aadhar number"
                              maxLength={12}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="entity-pan">PAN Number</Label>
                            <Input
                              id="entity-pan"
                              value={entityFormData.panNumber}
                              onChange={(e) =>
                                handleEntityFieldChange('panNumber', e.target.value.toUpperCase())
                              }
                              placeholder="Enter PAN number"
                              maxLength={10}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="entity-emergency-name">Contact Name</Label>
                            <Input
                              id="entity-emergency-name"
                              value={entityFormData.emergencyContactName}
                              onChange={(e) =>
                                handleEntityFieldChange('emergencyContactName', e.target.value)
                              }
                              placeholder="Enter emergency contact name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="entity-emergency-phone">Contact Phone</Label>
                            <Input
                              id="entity-emergency-phone"
                              type="tel"
                              value={entityFormData.emergencyContactPhone}
                              onChange={(e) =>
                                handleEntityFieldChange('emergencyContactPhone', e.target.value)
                              }
                              placeholder="Enter emergency contact phone"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="entity-bank-acc">Account Number</Label>
                            <Input
                              id="entity-bank-acc"
                              value={entityFormData.bankAccountNumber}
                              onChange={(e) =>
                                handleEntityFieldChange('bankAccountNumber', e.target.value)
                              }
                              placeholder="Enter bank account number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="entity-ifsc">IFSC Code</Label>
                            <Input
                              id="entity-ifsc"
                              value={entityFormData.ifscCode}
                              onChange={(e) =>
                                handleEntityFieldChange('ifscCode', e.target.value.toUpperCase())
                              }
                              placeholder="Enter IFSC code"
                              maxLength={11}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="entity-bank-name">Bank Name</Label>
                            <Input
                              id="entity-bank-name"
                              value={entityFormData.bankName}
                              onChange={(e) => handleEntityFieldChange('bankName', e.target.value)}
                              placeholder="Enter bank name"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Experience &amp; Region</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="entity-experience">Experience (years)</Label>
                            <Input
                              id="entity-experience"
                              type="number"
                              min="0"
                              value={entityFormData.experience}
                              onChange={(e) => handleEntityFieldChange('experience', e.target.value)}
                              placeholder="Years of experience"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="entity-prev-company">Previous Company</Label>
                            <Input
                              id="entity-prev-company"
                              value={entityFormData.previousCompany}
                              onChange={(e) =>
                                handleEntityFieldChange('previousCompany', e.target.value)
                              }
                              placeholder="Enter previous company name"
                            />
                          </div>
                          {entityFormType === 'ss' ? (
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="entity-region">Region</Label>
                              <Input
                                id="entity-region"
                                value={entityFormData.region}
                                onChange={(e) => handleEntityFieldChange('region', e.target.value)}
                                placeholder="e.g., North Tamil Nadu"
                              />
                            </div>
                          ) : (
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="entity-district">District</Label>
                              <Input
                                id="entity-district"
                                value={entityFormData.district}
                                onChange={(e) => handleEntityFieldChange('district', e.target.value)}
                                placeholder="e.g., Chennai"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shop form (basic onboarding) */}
                  {entityFormType === 'shop' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="shop-name">Shop Name *</Label>
                          <Input
                            id="shop-name"
                            value={entityFormData.name}
                            onChange={(e) => handleEntityFieldChange('name', e.target.value)}
                            placeholder="Enter shop name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shop-owner">Owner Name *</Label>
                          <Input
                            id="shop-owner"
                            value={entityFormData.ownerName}
                            onChange={(e) => handleEntityFieldChange('ownerName', e.target.value)}
                            placeholder="Enter owner name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shop-phone">Phone *</Label>
                          <Input
                            id="shop-phone"
                            type="tel"
                            value={entityFormData.phone}
                            onChange={(e) => handleEntityFieldChange('phone', e.target.value)}
                            placeholder="Enter shop phone"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shop-email">Email</Label>
                          <Input
                            id="shop-email"
                            type="email"
                            value={entityFormData.email}
                            onChange={(e) => handleEntityFieldChange('email', e.target.value)}
                            placeholder="Enter shop email"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="shop-address">Address</Label>
                          <Textarea
                            id="shop-address"
                            value={entityFormData.address}
                            onChange={(e) => handleEntityFieldChange('address', e.target.value)}
                            placeholder="Street, area, city, pincode"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shop-district">District / City</Label>
                          <Input
                            id="shop-district"
                            value={entityFormData.district}
                            onChange={(e) => handleEntityFieldChange('district', e.target.value)}
                            placeholder="e.g., Chennai"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shop-gst">GST Number</Label>
                          <Input
                            id="shop-gst"
                            value={entityFormData.gstNumber}
                            onChange={(e) =>
                              handleEntityFieldChange('gstNumber', e.target.value.toUpperCase())
                            }
                            placeholder="Enter GSTIN"
                            maxLength={15}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shop-type">Shop Type</Label>
                          <Select
                            id="shop-type"
                            value={entityFormData.shopType}
                            onChange={(e) => handleEntityFieldChange('shopType', e.target.value)}
                          >
                            <option value="">Select shop type</option>
                            <option value="Beauty Parlour">Beauty Parlour</option>
                            <option value="Cosmetic Store">Cosmetic Store</option>
                            <option value="Salon">Salon</option>
                            <option value="Supermarket">Supermarket</option>
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="Other">Other</option>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shop-opening-date">Opening Date</Label>
                          <Input
                            id="shop-opening-date"
                            type="date"
                            value={entityFormData.openingDate}
                            onChange={(e) => handleEntityFieldChange('openingDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shop-distributor">Linked Distributor</Label>
                          <Select
                            id="shop-distributor"
                            value={entityFormData.linkedDistributorId}
                            onChange={(e) =>
                              handleEntityFieldChange('linkedDistributorId', e.target.value)
                            }
                          >
                            <option value="">Select distributor</option>
                            {distributors.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.code})
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEntityFormData(EMPTY_ENTITY_FORM)
                        setEntityFormError(null)
                      }}
                    >
                      Reset
                    </Button>
                    <Button type="submit" className="bg-[#433228] hover:bg-[#5a4238] text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Onboard{' '}
                      {entityFormType === 'ss'
                        ? 'Super Stockist'
                        : entityFormType === 'distributor'
                          ? 'Distributor'
                          : 'Shop'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Onboarded Entities</CardTitle>
                <CardDescription>
                  Recently onboarded SS, Distributor, and Shop entities from this device.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {onboardedEntities.length === 0 ? (
                  <p className="text-sm text-gray-500">No entities onboarded yet.</p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Region / District</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {onboardedEntitiesPagination.paginatedItems.map((entity) => (
                            <TableRow key={entity.id}>
                              <TableCell>
                                <span className="inline-flex items-center rounded-full border bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700">
                                  {entity.typeLabel}
                                </span>
                              </TableCell>
                              <TableCell className="font-mono text-xs">{entity.code}</TableCell>
                              <TableCell className="font-medium">{entity.name}</TableCell>
                              <TableCell>{entity.phone || '—'}</TableCell>
                              <TableCell>
                                {entity.type === 'ss'
                                  ? entity.region || '—'
                                  : entity.district || '—'}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    entity.status === 'Active'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {entity.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-gray-500">
                                {new Date(entity.createdAt).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <TablePaginationControls {...onboardedEntitiesPagination} />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          </TabsContent>
        )}

        {/* Manpower & Employee Tab (RSM only) */}
        {isRSM && (
          <TabsContent value="manpower">
            <Manpower />
          </TabsContent>
        )}
      </Tabs>

      {/* Supervisor Order Creation Dialog */}
      {isSupervisor && (
        <Dialog open={showSupervisorOrderDialog} onOpenChange={setShowSupervisorOrderDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSupervisorOrderSubmit} className="space-y-6">
              {/* Order Target and Entity Selection */}
              <div
                className={`grid grid-cols-1 gap-4 bg-white p-4 rounded-lg border shadow-sm mb-4 ${
                  supervisorOrderData.orderToType === 'shop'
                    ? 'md:grid-cols-3'
                    : 'md:grid-cols-2'
                }`}
              >
                <div className="space-y-2">
                  <Label>Create Order For *</Label>
                  <Select
                    value={supervisorOrderData.orderToType}
                    onChange={(e) => {
                      const nextType = e.target.value
                      setSupervisorOrderData({
                        ...supervisorOrderData,
                        orderToType: nextType,
                        shopId: '',
                        distributorId: '',
                        products: {},
                      })
                    }}
                    required
                  >
                    <option value="shop">Shop</option>
                    <option value="distributor">Distributor</option>
                  </Select>
                </div>

                {/* Shop selection - only when ordering to a Shop */}
                {supervisorOrderData.orderToType === 'shop' && (
                  <div className="space-y-2">
                    <Label>Select Shop *</Label>
                    <Select
                      value={supervisorOrderData.shopId}
                      onChange={(e) => {
                        const selectedShopId = e.target.value
                        const selectedShop = shops.find((shop) => shop.id === parseInt(selectedShopId, 10))
                        setSupervisorOrderData({
                          ...supervisorOrderData,
                          shopId: selectedShopId,
                          distributorId: selectedShop?.distributorId
                            ? String(selectedShop.distributorId)
                            : '',
                          products: {},
                        })
                      }}
                      required
                    >
                      <option value="">Select Shop</option>
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {/* Distributor selection / autopopulate */}
                <div className="space-y-2">
                  <Label>
                    {supervisorOrderData.orderToType === 'shop'
                      ? 'Distributor (Auto-populated) *'
                      : 'Select Distributor *'}
                  </Label>
                  <Select
                    value={supervisorOrderData.distributorId}
                    onChange={(e) => {
                      setSupervisorOrderData({
                        ...supervisorOrderData,
                        distributorId: e.target.value,
                        products: {},
                      })
                    }}
                    required
                    disabled={
                      supervisorOrderData.orderToType === 'shop'
                        ? true
                        : false
                    }
                  >
                    <option value="">Select Distributor</option>
                    {distributors.map((distributor) => (
                      <option key={distributor.id} value={distributor.id}>
                        {distributor.name} ({distributor.code})
                      </option>
                    ))}
                  </Select>
                </div>

                {supervisorOrderData.orderToType === 'distributor' &&
                  supervisorOrderData.distributorId &&
                  (supervisorDistributorSsName ? (
                    <div className="md:col-span-2 rounded-md border border-[#433228]/20 bg-[#433228]/5 px-3 py-2 text-sm">
                      <span className="text-gray-600">Super Stockist for this distributor: </span>
                      <span className="font-semibold text-[#433228]">{supervisorDistributorSsName}</span>
                    </div>
                  ) : (
                    <div className="md:col-span-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      Super Stockist link is not available for this distributor.
                    </div>
                  ))}
              </div>

              {/* Product-wise selection by vertical categories */}
              {((supervisorOrderData.orderToType === 'shop' &&
                supervisorOrderData.shopId &&
                supervisorOrderData.distributorId) ||
                (supervisorOrderData.orderToType === 'distributor' &&
                  supervisorOrderData.distributorId)) && (
                <div className="space-y-4 border-t pt-4">
                  <Label className="text-lg font-semibold">Product List - Assign Quantity</Label>
                  <p className="text-sm text-gray-600">
                    Quantity step: {getSupervisorQuantityStep(supervisorOrderData.orderToType)} units
                    ({supervisorOrderData.orderToType === 'shop' ? '3, 6, 9, 12...' : '12, 24, 36...'})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1 border rounded-lg p-3 bg-gray-50 space-y-2">
                      {COSMETICS_CATEGORIES.map((category) => (
                        <Button
                          key={category.id}
                          type="button"
                          variant={supervisorSelectedCategory === category.name ? 'default' : 'outline'}
                          className={`w-full justify-start ${
                            supervisorSelectedCategory === category.name
                              ? 'bg-[#433228] hover:bg-[#5a4238] text-white'
                              : ''
                          }`}
                          onClick={() => setSupervisorSelectedCategory(category.name)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                    <div className="md:col-span-3 border rounded-lg p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                      {getProductsByCategory(supervisorSelectedCategory).map((product) => {
                        const qtyStep = getSupervisorQuantityStep(supervisorOrderData.orderToType)
                        const basicUnitValue = getBasicValue(product, supervisorOrderData.orderToType)
                        return (
                          <div key={product.id} className="space-y-3 bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-start gap-4">
                                  {/* Product Image */}
                                  <div className="flex-shrink-0">
                                    <img
                                      src={product.image || 'https://via.placeholder.com/100?text=Product'}
                                      alt={product.name}
                                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/100?text=Product'
                                      }}
                                    />
                                  </div>
                                  {/* Product Details */}
                                  <div className="flex-1">
                                    <Label className="text-base font-medium">{product.name}</Label>
                                    <p className="text-xs text-gray-500">
                                      Code: {product.code} | Basic Value: ₹{basicUnitValue}/{product.unit}
                                    </p>
                                  </div>
                                </div>

                                {/* Quantity Input with step rules */}
                                <div className="flex items-center gap-3">
                                  <Label className="w-32 text-sm">Quantity:</Label>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleQuantityChange(
                                          product.id,
                                          supervisorOrderData.products[product.id] || '0',
                                          'decrement',
                                        )
                                      }
                                      className="h-9 w-9"
                                    >
                                      -
                                    </Button>
                                    <Input
                                      type="number"
                                      min="0"
                                      step={qtyStep}
                                      placeholder="Enter quantity"
                                      value={supervisorOrderData.products[product.id] || ''}
                                      onChange={(e) => {
                                        const rawValue = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)
                                        const value =
                                          rawValue === ''
                                            ? ''
                                            : Math.ceil(rawValue / qtyStep) * qtyStep
                                        handleSupervisorProductQuantity(product.id, value.toString())
                                      }}
                                      onInput={(e) => {
                                        if (e.target.value < 0) e.target.value = 0
                                      }}
                                      className="max-w-xs text-center"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleQuantityChange(
                                          product.id,
                                          supervisorOrderData.products[product.id] || '0',
                                          'increment',
                                        )
                                      }
                                      className="h-9 w-9"
                                    >
                                      +
                                    </Button>
                                  </div>
                                  <span className="text-sm text-gray-500">units (step {qtyStep})</span>
                                </div>

                                {/* Display Selected Quantity */}
                                {supervisorOrderData.products[product.id] && (
                                  <div className="text-sm text-green-600 font-medium">
                                    Selected: {supervisorOrderData.products[product.id]} units
                                    {basicUnitValue && (
                                      <span className="text-gray-600 ml-2">
                                        (Total Basic Value: ₹{(parseInt(supervisorOrderData.products[product.id]) * basicUnitValue).toLocaleString('en-IN')})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                    Basic value shown after applying {getSupervisorMarginPercent(supervisorOrderData.orderToType)}% margin
                    for {supervisorOrderData.orderToType === 'shop' ? 'shop' : 'distributor'} order.
                  </div>
                </div>
              )}

              {/* Error and Success Messages */}
              {(error || localFormError) && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-4">
                  {error || localFormError}
                </div>
              )}

              {successMessage && (
                <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md">
                  {successMessage}
                </div>
              )}

              {/* Dialog Footer */}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSupervisorOrderDialog(false)
                    setSupervisorOrderData({
                      orderToType: 'shop',
                      shopId: '',
                      distributorId: '',
                      products: {},
                      shopStockAvailability: '',
                      distributorStockAvailability: '',
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                  disabled={
                    loading || 
                    (supervisorOrderData.orderToType === 'shop' &&
                      (!supervisorOrderData.shopId || !supervisorOrderData.distributorId)) ||
                    (supervisorOrderData.orderToType === 'distributor' &&
                      !supervisorOrderData.distributorId) ||
                    !Object.values(supervisorOrderData.products).some(qty => parseInt(qty) > 0)
                  }
                >
                  {loading ? 'Submitting...' : 'Create Order'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* RSM Order Creation Dialog */}
      {isRSM && (
        <Dialog open={showRSMOrderDialog} onOpenChange={setShowRSMOrderDialog}>
          <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRSMOrderSubmit} className="space-y-6">
              {/* Entity Selection Head */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-lg border shadow-sm mb-2">
                {/* Entity Type Selection */}
                <div className="space-y-2">
                  <Label>Select Entity Type *</Label>
                  <Select
                    value={rsmOrderData.entityType}
                    onChange={(e) => {
                      setRsmOrderData({
                        ...rsmOrderData,
                        entityType: e.target.value,
                        entityId: '',
                        ssId: '',
                        distributorId: '',
                        shopId: '',
                        products: {},
                      })
                    }}
                    required
                  >
                    <option value="ss">Super Stockist (SS)</option>
                    <option value="distributor">Distributor</option>
                    <option value="shop">Shop</option>
                  </Select>
                </div>

                {/* Entity Selection - Super Stockist (SS) */}
                {rsmOrderData.entityType === 'ss' && (
                  <div className="space-y-2">
                    <Label>Select Super Stockist *</Label>
                    <Select
                      value={rsmOrderData.ssId}
                      onChange={(e) => {
                        setRsmOrderData({
                          ...rsmOrderData,
                          ssId: e.target.value,
                          products: {},
                        })
                      }}
                      required
                    >
                      <option value="">Select Super Stockist</option>
                      {ssList.map((ss) => (
                        <option key={ss.id} value={ss.id}>
                          {ss.name} ({ss.city})
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {/* Entity Selection - Distributor */}
                {rsmOrderData.entityType === 'distributor' && (
                  <div className="space-y-2">
                    <Label>Select Distributor *</Label>
                    <Select
                      value={rsmOrderData.entityId}
                      onChange={(e) => {
                        setRsmOrderData({
                          ...rsmOrderData,
                          entityId: e.target.value,
                          products: {},
                        })
                      }}
                      required
                    >
                      <option value="">Select Distributor</option>
                      {distributors.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {/* Shop Selection - Cascading: SS → Distributor → Shop */}
                {rsmOrderData.entityType === 'shop' && (
                  <>
                    {/* Step 1: Select SS */}
                    <div className="space-y-2">
                      <Label>Select Super Stockist (SS) *</Label>
                      <Select
                        value={rsmOrderData.ssId}
                        onChange={(e) => {
                          setRsmOrderData({
                            ...rsmOrderData,
                            ssId: e.target.value,
                            distributorId: '', // Reset distributor when SS changes
                            shopId: '', // Reset shop when SS changes
                          })
                        }}
                        required
                      >
                        <option value="">Select Super Stockist</option>
                        {ssList.map((ss) => (
                          <option key={ss.id} value={ss.id}>
                            {ss.name} ({ss.city})
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Step 2: Select Distributor (filtered by SS) */}
                    <div className="space-y-2">
                      <Label>Select Distributor *</Label>
                      <Select
                        value={rsmOrderData.distributorId}
                        onChange={(e) => {
                          setRsmOrderData({
                            ...rsmOrderData,
                            distributorId: e.target.value,
                            shopId: '', // Reset shop when distributor changes
                          })
                        }}
                        required
                        disabled={!rsmOrderData.ssId}
                      >
                        <option value="">Select Distributor</option>
                        {(() => {
                          // Filter distributors by SS city/district
                          const selectedSS = ssList.find(ss => ss.id === parseInt(rsmOrderData.ssId))
                          const filteredDistributors = selectedSS 
                            ? distributors.filter(dist => {
                                // Match distributors to SS by city/district
                                const ssCity = selectedSS.city.toLowerCase()
                                const distDistrict = dist.district.toLowerCase()
                                
                                if (ssCity === 'chennai' && distDistrict === 'chennai') return true
                                if (ssCity === 'coimbatore' && distDistrict === 'coimbatore') return true
                                if (ssCity === 'madurai' && distDistrict === 'madurai') return true
                                if (ssCity === 'salem' && (distDistrict === 'salem' || distDistrict === 'tiruvallur')) return true
                                if (ssCity === 'tiruchirappalli' && (distDistrict === 'tirunelveli')) return true
                                
                                return false
                              })
                            : distributors
                          
                          return filteredDistributors.map((dist) => (
                            <option key={dist.id} value={dist.id}>
                              {dist.name} ({dist.code})
                            </option>
                          ))
                        })()}
                      </Select>
                    </div>

                    {/* Step 3: Select Shop (filtered by Distributor) */}
                    <div className="space-y-2">
                      <Label>Select Shop *</Label>
                      <Select
                        value={rsmOrderData.shopId}
                        onChange={(e) => {
                          setRsmOrderData({
                            ...rsmOrderData,
                            shopId: e.target.value,
                            products: {},
                          })
                        }}
                        required
                        disabled={!rsmOrderData.distributorId}
                      >
                        <option value="">Select Shop</option>
                        {shops
                          .filter(shop => shop.distributorId === parseInt(rsmOrderData.distributorId))
                          .map((shop) => (
                            <option key={shop.id} value={shop.id}>
                              {shop.name}
                            </option>
                          ))}
                      </Select>
                    </div>
                  </>
                )}
              </div>

              {/* All Categories Products - Tabbed View */}
              {(rsmOrderData.entityId || (rsmOrderData.entityType === 'shop' && rsmOrderData.ssId && rsmOrderData.distributorId && rsmOrderData.shopId) || (rsmOrderData.entityType === 'ss' && rsmOrderData.ssId)) && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <Label className="text-lg font-semibold">Select Products</Label>
                      <p className="text-sm text-gray-600">
                        Choose category and add products
                        {rsmShowsBasicValue && (
                          <>
                            {' '}· Quantity step:{' '}
                            <span className="font-semibold text-gray-800">
                              {getRSMQuantityStep(rsmOrderData.entityType)} units
                              {rsmOrderData.entityType === 'ss' ? ' (1 case)' : ''}
                            </span>{' '}
                            ({rsmOrderData.entityType === 'ss'
                              ? '24, 48, 72… (case)'
                              : rsmOrderData.entityType === 'distributor'
                              ? '12, 24, 36…'
                              : '6, 12, 18…'})
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Selection Tabs */}
                    <div className="lg:col-span-2">
                      <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                          <Tabs defaultValue={COSMETICS_CATEGORIES[0]?.name}>
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto bg-gray-100 rounded-lg p-1 mb-4 gap-1">
                              {COSMETICS_CATEGORIES.map((category) => (
                                <TabsTrigger 
                                  key={category.id} 
                                  value={category.name}
                                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all whitespace-normal text-xs sm:text-sm py-2"
                                >
                                  {category.name}
                                </TabsTrigger>
                              ))}
                            </TabsList>

                            {COSMETICS_CATEGORIES.map((category) => (
                              <TabsContent key={category.id} value={category.name} className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 pb-4">
                                  {getProductsByCategory(category.name).map((product) => {
                                    const currentQty = parseInt(rsmOrderData.products[product.id]) || 0;
                                    const availableStock = getRSMProductStock(product.id);
                                    const remainingStock = Math.max(0, availableStock - currentQty);
                                    const isOutOfStock = availableStock === 0;
                                    const step = getRSMQuantityStep(rsmOrderData.entityType);
                                    const isAtMax =
                                      !isOutOfStock && remainingStock < step;
                                    const stockBadgeClass = isOutOfStock
                                      ? 'bg-red-100 text-red-700 border-red-200'
                                      : remainingStock <= step
                                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    const basicValue = getRSMBasicValue(product, rsmOrderData.entityType)
                                    const unitValue = rsmShowsBasicValue ? basicValue : product.price

                                    return (
                                      <div key={product.id} className="border rounded-lg p-4 space-y-3 bg-white hover:border-gray-300 transition-colors">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1 pr-2">
                                            <h4 className="font-semibold text-sm line-clamp-2" title={product.name}>{product.name}</h4>
                                            <p className="text-xs text-gray-500 mt-1">Code: {product.code}</p>
                                            {rsmShowsBasicValue ? (
                                              <p className="text-sm font-medium text-[#433228] mt-1">
                                                Basic Value: ₹{basicValue}/{product.unit}
                                              </p>
                                            ) : (
                                              <p className="text-sm font-medium text-[#433228] mt-1">
                                                MRP: ₹{product.price}/{product.unit}
                                              </p>
                                            )}
                                          </div>
                                          {product.image && (
                                            <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded border flex items-center justify-center p-1">
                                              <img 
                                                src={product.image} 
                                                alt={product.name} 
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => {
                                                  e.target.src = 'https://via.placeholder.com/100?text=Product'
                                                }}
                                              />
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                          <div className="text-xs">
                                            <span
                                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${stockBadgeClass}`}
                                            >
                                              {isOutOfStock
                                                ? 'Out of stock'
                                                : `Available: ${remainingStock} / ${availableStock}`}
                                            </span>
                                          </div>
                                          
                                          <div className="flex items-center gap-1 bg-gray-50 rounded-md p-1 border">
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="ghost"
                                              disabled={currentQty === 0}
                                              className="h-6 w-6 p-0 hover:bg-white text-gray-500 disabled:opacity-50"
                                              onClick={() => handleRSMQuantityChange(product.id, currentQty, 'decrement')}
                                            >
                                              <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="h-6 min-w-[2.25rem] px-1 text-center text-sm font-medium leading-6 text-gray-800">
                                              {currentQty}
                                            </span>
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="ghost"
                                              disabled={isOutOfStock || isAtMax}
                                              title={
                                                isOutOfStock
                                                  ? 'No stock available'
                                                  : isAtMax
                                                  ? 'Reached available stock'
                                                  : undefined
                                              }
                                              className="h-6 w-6 p-0 hover:bg-white text-gray-500 disabled:opacity-50"
                                              onClick={() => handleRSMQuantityChange(product.id, currentQty, 'increment')}
                                            >
                                              <Plus className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                        {currentQty > 0 && rsmShowsBasicValue && (
                                          <p className="text-xs text-gray-500 -mt-1">
                                            Line total: ₹
                                            {(currentQty * unitValue).toLocaleString('en-IN')}
                                          </p>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </TabsContent>
                            ))}
                          </Tabs>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Cart Summary Side Panel */}
                    <div className="lg:col-span-1 border-gray-200">
                      <Card className="sticky top-0 shadow-sm border-gray-200">
                        <CardHeader className="pb-3 border-b bg-gray-50 rounded-t-lg">
                          <CardTitle className="text-lg flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <ShoppingCart className="h-5 w-5" />
                              Cart
                            </span>
                            <span className="bg-[#433228] text-white text-xs py-1 px-2 rounded-full">
                              {Object.values(rsmOrderData.products).filter(qty => parseInt(qty) > 0).length} Items
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          {Object.keys(rsmOrderData.products).filter(k => parseInt(rsmOrderData.products[k]) > 0).length === 0 ? (
                            <div className="text-center text-gray-500 py-12 px-4">
                              <ShoppingCart className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                              <p>Cart is empty</p>
                              <p className="text-xs mt-1">Add items from the product list</p>
                            </div>
                          ) : (
                            <div className="flex flex-col h-full">
                              <div className="space-y-0 max-h-[350px] overflow-y-auto w-full">
                                {Object.entries(rsmOrderData.products)
                                  .filter(([, qty]) => parseInt(qty) > 0)
                                  .map(([productId, quantity]) => {
                                    const product = MOCK_PRODUCTS.find(p => p.id === parseInt(productId));
                                    if (!product) return null;
                                    const unitValue = rsmShowsBasicValue
                                      ? getRSMBasicValue(product, rsmOrderData.entityType)
                                      : product.price;

                                    return (
                                      <div key={productId} className="p-3 border-b last:border-0 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1 pr-2">
                                            <p className="font-medium text-sm line-clamp-1" title={product.name}>{product.name}</p>
                                            <p className="text-xs text-gray-500">
                                              {rsmShowsBasicValue ? 'Basic' : 'MRP'}: ₹{unitValue} / unit
                                            </p>
                                          </div>
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRSMProductQuantity(productId, '')}
                                            className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 -mr-1"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1 bg-white rounded border p-0.5 shadow-sm">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              className="h-5 w-5 p-0 hover:bg-gray-100"
                                              onClick={() => handleRSMQuantityChange(productId, quantity, 'decrement')}
                                            >
                                              <Minus className="h-2.5 w-2.5" />
                                            </Button>
                                            <span className="w-6 text-center text-xs font-semibold text-gray-700">{quantity}</span>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              className="h-5 w-5 p-0 hover:bg-gray-100"
                                              onClick={() => handleRSMQuantityChange(productId, quantity, 'increment')}
                                            >
                                              <Plus className="h-2.5 w-2.5" />
                                            </Button>
                                          </div>
                                          <div className="text-sm font-semibold text-[#433228]">
                                            ₹{(parseInt(quantity) * unitValue).toLocaleString('en-IN')}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                              
                              {/* Summary Footer Placeholder */}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Overall Order Summary */}
                  {Object.keys(rsmOrderData.products).some(productId => parseInt(rsmOrderData.products[productId]) > 0) && (
                    <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-800 text-lg">
                          {rsmShowsBasicValue ? 'Overall Basic Value:' : 'Overall Order Value:'}
                        </span>
                        <span className="text-2xl font-bold text-green-700">
                          ₹{Object.entries(rsmOrderData.products).reduce((sum, [productId, quantity]) => {
                            const product = MOCK_PRODUCTS.find(p => p.id === parseInt(productId))
                            if (!product) return sum
                            const unitValue = rsmShowsBasicValue
                              ? getRSMBasicValue(product, rsmOrderData.entityType)
                              : product.price
                            return sum + (parseInt(quantity) * unitValue)
                          }, 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {rsmShowsBasicValue && (
                        <p className="text-xs text-gray-600 mt-1">
                          Basic value applies a {getRSMMarginPercent(rsmOrderData.entityType)}% margin discount on MRP for{' '}
                          {rsmOrderData.entityType === 'distributor' ? 'distributor' : 'shop'} orders.
                        </p>
                      )}
                      <div className="mt-2 text-sm text-gray-600">
                        Total Products: {Object.values(rsmOrderData.products).filter(qty => parseInt(qty) > 0).length} | 
                        Total Quantity: {Object.values(rsmOrderData.products).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0)} units
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error and Success Messages */}
              {(error || localFormError) && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-4">
                  {error || localFormError}
                </div>
              )}

              {successMessage && (
                <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md">
                  {successMessage}
                </div>
              )}

              {/* Dialog Footer */}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRSMOrderDialog(false)
                    setRsmOrderData({
                      entityType: 'distributor',
                      entityId: '',
                      ssId: '',
                      distributorId: '',
                      shopId: '',
                      products: {},
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                  disabled={
                    loading || 
                    (rsmOrderData.entityType === 'ss' && !rsmOrderData.ssId) ||
                    (rsmOrderData.entityType === 'distributor' && !rsmOrderData.entityId) ||
                    (rsmOrderData.entityType === 'shop' && (!rsmOrderData.ssId || !rsmOrderData.distributorId || !rsmOrderData.shopId)) ||
                    !Object.values(rsmOrderData.products).some(qty => parseInt(qty) > 0)
                  }
                >
                  {loading ? 'Submitting...' : 'Create Order'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Order View Dialog for RSM and Supervisor */}
      {(isRSM || isSupervisor) && selectedOrder && (
        <Dialog open={showOrderViewDialog} onOpenChange={setShowOrderViewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{selectedOrder.orderId || `ORD-${selectedOrder.id}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Batch ID</p>
                  <p className="font-semibold">{selectedOrder.batchId || `BATCH-${selectedOrder.id}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{isSupervisor ? 'Shop' : 'Entity'}</p>
                  <p className="font-semibold">{getEntityName(selectedOrder)}</p>
                </div>
                {isSupervisor && selectedOrder.distributorName && (
                  <div>
                    <p className="text-sm text-gray-600">Distributor</p>
                    <p className="font-semibold">{selectedOrder.distributorName}</p>
                  </div>
                )}
                {!isSupervisor && (
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {selectedOrder.status || 'Pending'}
                    </span>
                  </div>
                )}
                {isSupervisor && (
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold">
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                )}
              </div>

              {/* Category Tabs with Products */}
              {selectedOrder.products && Object.keys(selectedOrder.products).length > 0 ? (
                <Tabs defaultValue={COSMETICS_CATEGORIES.find(cat => {
                  const categoryProducts = getProductsByCategory(cat.name)
                  return categoryProducts.some(product => 
                    selectedOrder.products[product.id] && parseInt(selectedOrder.products[product.id]) > 0
                  )
                })?.name || COSMETICS_CATEGORIES[0]?.name} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    {COSMETICS_CATEGORIES.map((category) => {
                      // Check if category has products
                      const categoryProducts = getProductsByCategory(category.name)
                      const hasProductsInOrder = categoryProducts.some(product => 
                        selectedOrder.products[product.id] && parseInt(selectedOrder.products[product.id]) > 0
                      )
                      return hasProductsInOrder ? (
                        <TabsTrigger key={category.id} value={category.name}>
                          {category.name}
                        </TabsTrigger>
                      ) : null
                    })}
                  </TabsList>

                  {COSMETICS_CATEGORIES.map((category) => {
                    const categoryProducts = getProductsByCategory(category.name)
                    const orderProductsInCategory = categoryProducts.filter(product => 
                      selectedOrder.products[product.id] && parseInt(selectedOrder.products[product.id]) > 0
                    )

                    if (orderProductsInCategory.length === 0) return null

                    return (
                      <TabsContent key={category.id} value={category.name} className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-[#433228] mb-4">{category.name}</h3>
                          <PaginatedOrderCategoryProducts
                            categoryProducts={orderProductsInCategory}
                            selectedOrder={selectedOrder}
                          />
                        </div>
                      </TabsContent>
                    )
                  })}
                </Tabs>
              ) : (
                <p className="text-center text-gray-500 py-8">No products in this order</p>
              )}

              {/* Overall Value Summary */}
              {selectedOrder.products && Object.keys(selectedOrder.products).length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-800 text-lg">Overall Value:</span>
                    <span className="text-2xl font-bold text-green-700">
                      ₹{Object.entries(selectedOrder.products).reduce((sum, [productId, quantity]) => {
                        const product = MOCK_PRODUCTS.find(p => p.id === parseInt(productId))
                        return sum + (parseInt(quantity) * (product?.price || 0))
                      }, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default Orders
