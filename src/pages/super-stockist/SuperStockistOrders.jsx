import { useEffect, useMemo, useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Plus, Eye, Check, X, Edit, ShoppingCart, Minus, Trash2 } from 'lucide-react'
import { MOCK_PRODUCTS, COSMETICS_CATEGORIES, getProductsByCategory } from '../../data/mockData'
import ExportButtons from '../../components/common/ExportButtons'

// Mock Factory Stock - Convert MOCK_PRODUCTS to factory stock format with cases
// Each product has SS Billing Value (Basic price), available cases, and pieces per case
const getPiecesPerCase = (product) => {
  // Different products have different pieces per case
  if (product.category === 'Personal Care') {
    return product.name === 'Soap' ? 60 : 24 // Soap: 60 pieces, others: 24 pieces
  } else if (product.category === 'Hair Care') {
    return 24 // Hair care products: 24 pieces per case
  } else if (product.category === 'Body Care') {
    return product.name === 'Body Lotion' || product.name === 'Body Oil' ? 12 : 24 // Lotions/Oils: 12, others: 24
  } else {
    return 12 // Face Care: 12 pieces per case
  }
}

const MOCK_FACTORY_STOCK = MOCK_PRODUCTS.map((product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  price: product.price, // SS Billing Value (Basic)
  availableCases: Math.floor(Math.random() * 100) + 50, // Random between 50-150 cases
  piecesPerCase: getPiecesPerCase(product),
}))

const MOCK_DISTRIBUTORS = [
  { id: 1, name: 'Shraam', area: 'Sivakasi' },
  { id: 2, name: 'Raj Distributors', area: 'Madurai' },
  { id: 3, name: 'Kumar Agencies', area: 'Coimbatore' },
]

// Distributor buys from SS: each case = 6 pieces (fixed for SS → Distributor sales)
const DISTRIBUTOR_PIECES_PER_CASE = 6

// Mock Distributor Orders - Using actual product names from MOCK_PRODUCTS; each item is cases × 6 pcs/case
const MOCK_DISTRIBUTOR_ORDERS = [
  {
    id: 1,
    distributorId: 1,
    distributorName: 'Shraam',
    area: 'Sivakasi',
    items: [
      { productId: 13, productName: 'Soap', quantity: 5, piecesPerCase: DISTRIBUTOR_PIECES_PER_CASE, value: 15000 },
      { productId: 14, productName: 'Hand Wash', quantity: 3, piecesPerCase: DISTRIBUTOR_PIECES_PER_CASE, value: 10800 },
    ],
    totalValue: 25800,
    status: 'pending',
    createdAt: '2026-01-28T10:00:00Z',
  },
  {
    id: 2,
    distributorId: 2,
    distributorName: 'Raj Distributors',
    area: 'Madurai',
    items: [
      { productId: 1, productName: 'Face Wash', quantity: 2, piecesPerCase: DISTRIBUTOR_PIECES_PER_CASE, value: 12000 },
      { productId: 2, productName: 'Face Cream', quantity: 1, piecesPerCase: DISTRIBUTOR_PIECES_PER_CASE, value: 5400 },
    ],
    totalValue: 17400,
    status: 'pending',
    createdAt: '2026-01-27T14:30:00Z',
  },
]

const SuperStockistOrders = () => {
  const [activeTab, setActiveTab] = useState('create')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedDistributor, setSelectedDistributor] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showViewFactoryOrderDialog, setShowViewFactoryOrderDialog] = useState(false)
  const [viewingFactoryOrder, setViewingFactoryOrder] = useState(null)
  const [showViewDistributorOrderDialog, setShowViewDistributorOrderDialog] = useState(false)
  const [viewingDistributorOrder, setViewingDistributorOrder] = useState(null)
  const [selectedFactoryCategory, setSelectedFactoryCategory] = useState('Face Care')
  const [factoryCart, setFactoryCart] = useState({}) // { productId: { product, quantityCases } }
  const [factoryOrders, setFactoryOrders] = useState([])
  const [distributorOrders, setDistributorOrders] = useState(MOCK_DISTRIBUTOR_ORDERS)
  const [viewFilters, setViewFilters] = useState({
    distributorId: '',
    area: '',
    status: 'all',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ssFactoryOrders')
      if (saved) setFactoryOrders(JSON.parse(saved))
      else setFactoryOrders([])
    } catch {
      setFactoryOrders([])
    }
  }, [])

  const handleCreateOrder = () => {
    const selectedProducts = Object.keys(factoryCart)
    if (selectedProducts.length === 0) {
      alert('Please add products to cart')
      return
    }

    // Validate against available factory cases
    for (const [productId, item] of Object.entries(factoryCart)) {
      const product = MOCK_FACTORY_STOCK.find((p) => p.id === Number(productId))
      const qty = Number(item.quantityCases || 0)
      if (!product) continue
      if (qty <= 0) {
        alert('Quantity must be at least 1 case')
        return
      }
      if (qty > product.availableCases) {
        alert(`${product.name}: cannot order more than ${product.availableCases} cases`)
        return
      }
    }

    const orderItems = Object.entries(factoryCart).map(([productId, item]) => {
      const product = MOCK_FACTORY_STOCK.find((p) => p.id === Number(productId))
      const productMaster = MOCK_PRODUCTS.find((p) => p.id === Number(productId))
      const qtyCases = Number(item.quantityCases || 0)
      const piecesPerCase = product?.piecesPerCase || 0
      const basic = product?.price || 0
      const value = qtyCases * basic * piecesPerCase
      return {
        productId: Number(productId),
        productName: product?.name || item.product?.name || 'Unknown',
        category: product?.category || item.product?.category || '',
        image: productMaster?.image || item.product?.image || '',
        quantityCases: qtyCases,
        piecesPerCase,
        basic,
        value,
      }
    })

    const newFactoryOrder = {
      id: Date.now(),
      items: orderItems,
      totalCases: orderItems.reduce((sum, i) => sum + (i.quantityCases || 0), 0),
      totalValue: orderItems.reduce((sum, i) => sum + (i.value || 0), 0),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    setFactoryOrders((prev) => {
      const next = [newFactoryOrder, ...prev]
      localStorage.setItem('ssFactoryOrders', JSON.stringify(next))
      return next
    })
    alert('Order created successfully!')
    setFactoryCart({})
  }

  const handleViewFactoryOrder = (order) => {
    setViewingFactoryOrder(order)
    setShowViewFactoryOrderDialog(true)
  }

  const handleViewOrders = () => {
    // Kept for backwards compatibility (no-op with new UI)
    setShowViewDialog(true)
  }

  const handleAcceptOrder = (orderId) => {
    if (confirm('Are you sure you want to accept this order? This will deduct stock from SS Stock.')) {
      setDistributorOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'approved' } : o)))
      alert('Order accepted successfully! Stock deducted.')
    }
  }

  const handleModifyOrder = (order) => {
    setSelectedOrder(order)
    // Open modify dialog
    alert('Modify order functionality - Open edit dialog')
  }

  const handleRejectOrder = (orderId) => {
    if (confirm('Are you sure you want to reject this order?')) {
      setDistributorOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'rejected' } : o)))
      alert('Order rejected successfully!')
    }
  }

  const getPiecesPerCaseById = (productId) => {
    const master = MOCK_PRODUCTS.find((p) => p.id === Number(productId))
    if (!master) return 0
    return getPiecesPerCase(master)
  }

  const isInRange = (dateStr, startDate, endDate) => {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return true
    const s = startDate ? new Date(startDate) : null
    const e = endDate ? new Date(endDate) : null
    if (s && !Number.isNaN(s.getTime())) {
      s.setHours(0, 0, 0, 0)
      if (d < s) return false
    }
    if (e && !Number.isNaN(e.getTime())) {
      e.setHours(23, 59, 59, 999)
      if (d > e) return false
    }
    return true
  }

  const filteredOrders = useMemo(() => {
    return (distributorOrders || []).filter((order) => {
      if (viewFilters.distributorId && order.distributorId !== Number(viewFilters.distributorId)) return false
      if (viewFilters.area && order.area !== viewFilters.area) return false
      if (viewFilters.status !== 'all' && String(order.status || 'pending') !== viewFilters.status) return false
      return isInRange(order.createdAt, viewFilters.startDate, viewFilters.endDate)
    })
  }, [distributorOrders, viewFilters])

  const factoryOrdersPagination = useTablePagination(factoryOrders)
  const distributorOrdersListPagination = useTablePagination(filteredOrders)
  const factoryOrderItemsPagination = useTablePagination(viewingFactoryOrder?.items || [])
  const distributorOrderItemsPagination = useTablePagination(viewingDistributorOrder?.items || [])

  const handleViewDistributorOrder = (order) => {
    setViewingDistributorOrder(order)
    setShowViewDistributorOrderDialog(true)
  }

  const categoryFactoryProducts = useMemo(() => {
    if (!selectedFactoryCategory) return []
    return MOCK_FACTORY_STOCK.filter((p) => p.category === selectedFactoryCategory)
  }, [selectedFactoryCategory])

  const cartTotals = useMemo(() => {
    const totalCases = Object.values(factoryCart).reduce((sum, item) => sum + (Number(item.quantityCases) || 0), 0)
    const totalValue = Object.entries(factoryCart).reduce((sum, [productId, item]) => {
      const product = MOCK_FACTORY_STOCK.find((p) => p.id === Number(productId))
      if (!product) return sum
      const qty = Number(item.quantityCases || 0)
      return sum + qty * product.price * product.piecesPerCase
    }, 0)
    return { totalCases, totalValue }
  }, [factoryCart])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-2">Create orders from factory and manage distributor orders</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="gap-2">
          <TabsTrigger value="create" className="whitespace-nowrap data-[state=active]:bg-white">
            Create Order (Purchase from Factory)
          </TabsTrigger>
          <TabsTrigger value="view" className="whitespace-nowrap data-[state=active]:bg-white">
            View Order (Distributor Fulfillment)
          </TabsTrigger>
        </TabsList>

        {/* Create Order Tab */}
        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Selection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create Order - Purchase from Factory</CardTitle>
                  <CardDescription>Choose category and add products to cart (cases)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedFactoryCategory} onValueChange={setSelectedFactoryCategory}>
                    <TabsList className="gap-2">
                      {COSMETICS_CATEGORIES.map((category) => (
                        <TabsTrigger
                          key={category.id}
                          value={category.name}
                          className="whitespace-nowrap flex-shrink-0"
                        >
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {COSMETICS_CATEGORIES.map((category) => (
                      <TabsContent key={category.id} value={category.name} className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {MOCK_FACTORY_STOCK.filter((p) => p.category === category.name).map((product) => {
                            const cartItem = factoryCart[product.id]
                            const orderedCases = Number(cartItem?.quantityCases || 0)
                            const remaining = Math.max(0, product.availableCases - orderedCases)
                            const productMaster = MOCK_PRODUCTS.find((p) => p.id === product.id)
                            return (
                              <div key={product.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{product.name}</h4>
                                    <p className="text-xs text-gray-500">Pieces/Case: {product.piecesPerCase}</p>
                                    <p className="text-sm font-medium text-[#433228] mt-1">
                                      SS Billing (Basic): ₹{product.price}
                                    </p>
                                  </div>
                                  {productMaster?.image ? (
                                    <img
                                      src={productMaster.image}
                                      alt={product.name}
                                      className="h-14 w-14 rounded object-cover border bg-gray-100 flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="h-14 w-14 rounded border bg-gray-100 flex-shrink-0" />
                                  )}
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">Available</p>
                                    <p className={`text-sm font-semibold ${remaining > 10 ? 'text-green-600' : remaining > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                      {remaining} cases
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  {cartItem ? (
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          const nextQty = Math.max(0, orderedCases - 1)
                                          setFactoryCart((prev) => {
                                            const copy = { ...prev }
                                            if (nextQty === 0) delete copy[product.id]
                                            else copy[product.id] = { product, quantityCases: nextQty }
                                            return copy
                                          })
                                        }}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-10 text-center font-semibold">{orderedCases}</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          if (remaining === 0) return
                                          setFactoryCart((prev) => ({
                                            ...prev,
                                            [product.id]: { product, quantityCases: orderedCases + 1 },
                                          }))
                                        }}
                                        disabled={remaining === 0}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => setFactoryCart((prev) => ({ ...prev, [product.id]: { product, quantityCases: 1 } }))}
                                      disabled={product.availableCases === 0}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add
                                    </Button>
                                  )}

                                  <div className="text-sm text-gray-700">
                                    Value:{' '}
                                    <span className="font-semibold">
                                      ₹{(orderedCases * product.price * product.piecesPerCase).toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </div>
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

            {/* Cart */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Cart ({Object.keys(factoryCart).length})
                  </CardTitle>
                  <CardDescription>Selected products (cases)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.keys(factoryCart).length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {Object.values(factoryCart).map((item) => (
                          <div key={item.product.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {(() => {
                                  const img = MOCK_PRODUCTS.find((p) => p.id === item.product.id)?.image || item.product.image
                                  return img ? (
                                    <img
                                      src={img}
                                      alt={item.product.name}
                                      className="h-10 w-10 rounded object-cover border bg-gray-100 flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded border bg-gray-100 flex-shrink-0" />
                                  )
                                })()}
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{item.product.name}</p>
                                  <p className="text-xs text-gray-500">Pieces/Case: {item.product.piecesPerCase}</p>
                                  <p className="text-xs text-gray-600">Basic: ₹{item.product.price}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setFactoryCart((prev) => {
                                    const copy = { ...prev }
                                    delete copy[item.product.id]
                                    return copy
                                  })
                                }
                                title="Remove"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const nextQty = Math.max(0, Number(item.quantityCases || 0) - 1)
                                    setFactoryCart((prev) => {
                                      const copy = { ...prev }
                                      if (nextQty === 0) delete copy[item.product.id]
                                      else copy[item.product.id] = { product: item.product, quantityCases: nextQty }
                                      return copy
                                    })
                                  }}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-10 text-center font-semibold">{item.quantityCases}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const stock = MOCK_FACTORY_STOCK.find((p) => p.id === item.product.id)
                                    const available = stock?.availableCases ?? 0
                                    const nextQty = Number(item.quantityCases || 0) + 1
                                    if (nextQty > available) return
                                    setFactoryCart((prev) => ({ ...prev, [item.product.id]: { product: item.product, quantityCases: nextQty } }))
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-sm font-semibold">
                                ₹{(Number(item.quantityCases || 0) * item.product.price * item.product.piecesPerCase).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Cases:</span>
                          <span>{cartTotals.totalCases}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total Value:</span>
                          <span className="text-lg text-[#433228]">₹{cartTotals.totalValue.toLocaleString('en-IN')}</span>
                        </div>
                        <Button onClick={handleCreateOrder} className="w-full bg-[#433228] hover:bg-[#5a4238] text-white">
                          Complete Order
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setFactoryCart({})}
                        >
                          Reset Cart
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Created Orders (Factory Purchase Orders) */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle>Created Orders</CardTitle>
                  <CardDescription>Orders created for purchase from factory</CardDescription>
                </div>
                <div className="flex gap-2">
                  <ExportButtons
                    rows={factoryOrders.flatMap((o) =>
                      (o.items || []).map((i) => ({
                        'Order ID': o.id,
                        'Created At': o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : '',
                        Status: o.status,
                        Product: i.productName,
                        Category: i.category,
                        'Cases (Ordered)': i.quantityCases,
                        'Pieces/Case': i.piecesPerCase,
                        'Total Pieces': Number(i.quantityCases || 0) * Number(i.piecesPerCase || 0),
                        'Basic (₹)': i.basic,
                        'Item Value (₹)': i.value,
                        'Order Total Cases': o.totalCases,
                        'Order Total Value (₹)': o.totalValue,
                      })),
                    )}
                    csvFilename={`SS_Factory_Orders_${new Date().toISOString().split('T')[0]}.csv`}
                    xlsxFilename={`SS_Factory_Orders_${new Date().toISOString().split('T')[0]}.xlsx`}
                    xlsxSheetName="Factory Orders"
                    disabled={factoryOrders.length === 0}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {factoryOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No orders created yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead className="text-right">Total Cases</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {factoryOrdersPagination.paginatedItems.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="max-w-[420px]">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {(order.items || []).slice(0, 3).map((i) => {
                                const img = i.image || MOCK_PRODUCTS.find((p) => p.id === i.productId)?.image
                                return img ? (
                                  <img
                                    key={i.productId}
                                    src={img}
                                    alt={i.productName}
                                    className="h-8 w-8 rounded border border-white object-cover bg-gray-100"
                                  />
                                ) : (
                                  <div
                                    key={i.productId}
                                    className="h-8 w-8 rounded border border-white bg-gray-100"
                                    title={i.productName}
                                  />
                                )
                              })}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm text-gray-900 truncate">
                                {order.items?.map((i) => i.productName).join(', ') || '-'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? '' : 's'}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? '' : 's'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{order.totalCases}</TableCell>
                        <TableCell className="text-right">₹{order.totalValue.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => handleViewFactoryOrder(order)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {factoryOrders.length > 0 && <TablePaginationControls {...factoryOrdersPagination} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* View Order Tab */}
        <TabsContent value="view">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Optional — list shows all orders by default</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vf_distributor">Distributor</Label>
                  <Select
                    id="vf_distributor"
                    value={viewFilters.distributorId}
                    onChange={(e) => {
                      const distributorId = e.target.value
                      const dist = MOCK_DISTRIBUTORS.find((d) => d.id === Number(distributorId))
                      setViewFilters((prev) => ({
                        ...prev,
                        distributorId,
                        area: distributorId ? dist?.area || '' : '',
                      }))
                    }}
                  >
                    <option value="">All</option>
                    {MOCK_DISTRIBUTORS.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        {dist.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vf_area">Area</Label>
                  <Input
                    id="vf_area"
                    value={viewFilters.area}
                    onChange={(e) => setViewFilters((prev) => ({ ...prev, area: e.target.value }))}
                    placeholder="All"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vf_status">Status</Label>
                  <Select
                    id="vf_status"
                    value={viewFilters.status}
                    onChange={(e) => setViewFilters((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="vf_start">Start Date</Label>
                    <Input
                      id="vf_start"
                      type="date"
                      value={viewFilters.startDate}
                      onChange={(e) => setViewFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vf_end">End Date</Label>
                    <Input
                      id="vf_end"
                      type="date"
                      value={viewFilters.endDate}
                      onChange={(e) => setViewFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      setViewFilters({
                        distributorId: '',
                        area: '',
                        status: 'all',
                        startDate: '',
                        endDate: '',
                      })
                    }
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle>Distributor Orders</CardTitle>
                    <CardDescription>Orders requested by distributors (each case = {DISTRIBUTOR_PIECES_PER_CASE} pieces)</CardDescription>
                  </div>
                  <ExportButtons
                    rows={filteredOrders.flatMap((o) =>
                      (o.items || []).map((i) => {
                        const master = MOCK_PRODUCTS.find((p) => p.id === i.productId)
                        const piecesPerCase = Number(i.piecesPerCase) || DISTRIBUTOR_PIECES_PER_CASE
                        const cases = Number(i.quantity || 0)
                        const unitPrice = Number(MOCK_FACTORY_STOCK.find((p) => p.id === i.productId)?.price || 0)
                        const itemValue = Number(i.value ?? (cases * unitPrice * piecesPerCase || 0))
                        return {
                          'Order ID': o.id,
                          'Created At': o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : '',
                          Distributor: o.distributorName,
                          Area: o.area,
                          Status: o.status,
                          Product: i.productName || master?.name || `#${i.productId}`,
                          Category: master?.category || '',
                          Cases: cases,
                          'Pieces/Case': piecesPerCase,
                          'Total Pieces': cases * piecesPerCase,
                          'Basic (₹)': unitPrice,
                          'Item Value (₹)': itemValue,
                          'Order Total Value (₹)': o.totalValue,
                        }
                      }),
                    )}
                    csvFilename={`SS_Distributor_Fulfillment_${new Date().toISOString().split('T')[0]}.csv`}
                    xlsxFilename={`SS_Distributor_Fulfillment_${new Date().toISOString().split('T')[0]}.xlsx`}
                    xlsxSheetName="Distributor Fulfillment"
                    disabled={filteredOrders.length === 0}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No orders found for selected filters.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Created At</TableHead>
                        <TableHead>Distributor</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead className="text-right">Cases</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributorOrdersListPagination.paginatedItems.map((order) => {
                        const totalCases = (order.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0)
                        return (
                          <TableRow key={order.id}>
                            <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : '-'}</TableCell>
                            <TableCell className="min-w-[180px]">
                              <div className="font-medium">{order.distributorName}</div>
                              <div className="text-xs text-gray-500">{order.area}</div>
                              <div className="text-xs text-gray-500">Order #{order.id}</div>
                            </TableCell>
                            <TableCell className="max-w-[420px]">
                              <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                  {(order.items || []).slice(0, 3).map((i) => {
                                    const img = MOCK_PRODUCTS.find((p) => p.id === i.productId)?.image
                                    return img ? (
                                      <img
                                        key={i.productId}
                                        src={img}
                                        alt={i.productName}
                                        className="h-8 w-8 rounded border border-white object-cover bg-gray-100"
                                      />
                                    ) : (
                                      <div key={i.productId} className="h-8 w-8 rounded border border-white bg-gray-100" title={i.productName} />
                                    )
                                  })}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm text-gray-900 truncate">
                                    {(order.items || []).map((i) => i.productName).join(', ') || '-'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {DISTRIBUTOR_PIECES_PER_CASE} pcs/case • {(order.items || []).length} item{(order.items || []).length === 1 ? '' : 's'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">{totalCases}</TableCell>
                            <TableCell className="text-right font-semibold text-[#433228]">₹{Number(order.totalValue || 0).toLocaleString('en-IN')}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  order.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {String(order.status || 'pending').toUpperCase()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleViewDistributorOrder(order)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptOrder(order.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  disabled={order.status === 'approved' || order.status === 'rejected'}
                                  title={order.status !== 'pending' ? 'Already processed' : 'Accept'}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleRejectOrder(order.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  disabled={order.status === 'approved' || order.status === 'rejected'}
                                  title={order.status !== 'pending' ? 'Already processed' : 'Reject'}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
                {filteredOrders.length > 0 && <TablePaginationControls {...distributorOrdersListPagination} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Factory Order Dialog */}
      <Dialog open={showViewFactoryOrderDialog} onOpenChange={setShowViewFactoryOrderDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {viewingFactoryOrder && (
            <div className="space-y-6">
              {/* Header */}
              <DialogHeader>
                <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span>Factory Purchase Order</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                      viewingFactoryOrder.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : viewingFactoryOrder.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {String(viewingFactoryOrder.status || 'pending').toUpperCase()}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {`Order #${viewingFactoryOrder.id} • Created ${new Date(viewingFactoryOrder.createdAt).toLocaleString('en-IN')}`}
                </DialogDescription>
              </DialogHeader>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-500">TOTAL CASES</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{viewingFactoryOrder.totalCases}</p>
                  <p className="text-xs text-gray-500 mt-1">Total ordered cases</p>
                </div>
                <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-500">TOTAL VALUE</p>
                  <p className="text-2xl font-bold text-[#433228] mt-1">
                    ₹{viewingFactoryOrder.totalValue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Cases × basic × pieces/case</p>
                </div>
                <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-500">PRODUCTS</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{viewingFactoryOrder.items?.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Distinct items in this order</p>
                </div>
              </div>

              {/* Items */}
              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <p className="font-semibold text-gray-900">Order Items</p>
                  <p className="text-xs text-gray-500">All products included in this factory purchase order</p>
                </div>
                <div className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Cases</TableHead>
                        <TableHead className="text-right">Pieces/Case</TableHead>
                        <TableHead className="text-right">Basic</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {factoryOrderItemsPagination.paginatedItems.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>
                            {(() => {
                              const img = item.image || MOCK_PRODUCTS.find((p) => p.id === item.productId)?.image
                              return img ? (
                                <img
                                  src={img}
                                  alt={item.productName}
                                  className="h-10 w-10 rounded object-cover bg-gray-100 border"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-gray-100 border" />
                              )
                            })()}
                          </TableCell>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">{item.quantityCases}</TableCell>
                          <TableCell className="text-right">{item.piecesPerCase}</TableCell>
                          <TableCell className="text-right">₹{Number(item.basic || 0).toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right">₹{Number(item.value || 0).toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold bg-gray-50">
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">{viewingFactoryOrder.totalCases}</TableCell>
                        <TableCell colSpan={2} />
                        <TableCell className="text-right">₹{viewingFactoryOrder.totalValue.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  {(viewingFactoryOrder.items || []).length > 0 && (
                    <TablePaginationControls {...factoryOrderItemsPagination} />
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowViewFactoryOrderDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Distributor Order Dialog */}
      <Dialog open={showViewDistributorOrderDialog} onOpenChange={setShowViewDistributorOrderDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {viewingDistributorOrder && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span>Distributor Order</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                      viewingDistributorOrder.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : viewingDistributorOrder.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {String(viewingDistributorOrder.status || 'pending').toUpperCase()}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {`Order #${viewingDistributorOrder.id} • ${viewingDistributorOrder.distributorName} • ${viewingDistributorOrder.area} • ${viewingDistributorOrder.createdAt ? new Date(viewingDistributorOrder.createdAt).toLocaleString('en-IN') : ''}`}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-500">TOTAL CASES</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {(viewingDistributorOrder.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Requested cases</p>
                </div>
                <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-500">TOTAL VALUE</p>
                  <p className="text-2xl font-bold text-[#433228] mt-1">
                    ₹{Number(viewingDistributorOrder.totalValue || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Order total value</p>
                </div>
                <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-500">PRODUCTS</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{(viewingDistributorOrder.items || []).length}</p>
                  <p className="text-xs text-gray-500 mt-1">Distinct items</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <p className="font-semibold text-gray-900">Order Items</p>
                  <p className="text-xs text-gray-500">Item-wise details for this distributor order</p>
                </div>
                <div className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Cases</TableHead>
                        <TableHead className="text-right">Pieces/Case</TableHead>
                        <TableHead className="text-right">Basic</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributorOrderItemsPagination.paginatedItems.map((item) => {
                        const master = MOCK_PRODUCTS.find((p) => p.id === item.productId)
                        const img = master?.image
                        const piecesPerCase = Number(item.piecesPerCase) || DISTRIBUTOR_PIECES_PER_CASE
                        const cases = Number(item.quantity || 0)
                        const unitPrice = Number(MOCK_FACTORY_STOCK.find((p) => p.id === item.productId)?.price || 0)
                        const itemValue = Number(item.value ?? (cases * unitPrice * piecesPerCase || 0))
                        return (
                          <TableRow key={item.productId}>
                            <TableCell>
                              {img ? (
                                <img src={img} alt={item.productName} className="h-10 w-10 rounded object-cover bg-gray-100 border" />
                              ) : (
                                <div className="h-10 w-10 rounded bg-gray-100 border" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{item.productName || master?.name || `#${item.productId}`}</TableCell>
                            <TableCell>{master?.category || '-'}</TableCell>
                            <TableCell className="text-right">{cases}</TableCell>
                            <TableCell className="text-right">{piecesPerCase}</TableCell>
                            <TableCell className="text-right">₹{unitPrice.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-right">₹{itemValue.toLocaleString('en-IN')}</TableCell>
                          </TableRow>
                        )
                      })}
                      <TableRow className="font-semibold bg-gray-50">
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">
                          {(viewingDistributorOrder.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0)}
                        </TableCell>
                        <TableCell colSpan={2} />
                        <TableCell className="text-right">
                          ₹{Number(viewingDistributorOrder.totalValue || 0).toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  {(viewingDistributorOrder.items || []).length > 0 && (
                    <TablePaginationControls {...distributorOrderItemsPagination} />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowViewDistributorOrderDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SuperStockistOrders
