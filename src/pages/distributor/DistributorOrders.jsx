import { useMemo, useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { useSelector } from 'react-redux'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Eye, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import { MOCK_PRODUCTS, COSMETICS_CATEGORIES, MOCK_SS_LIST, MOCK_SHOPS, MOCK_HIERARCHY } from '../../data/mockData'
import ExportButtons from '../../components/common/ExportButtons'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'

// Distributor buys from SS: each case = 6 pieces
const DISTRIBUTOR_PIECES_PER_CASE = 6

// Mock SS Stock for ordering
const getSSStock = () => {
  return MOCK_PRODUCTS.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price * 0.9, // Distributor price (10% discount from SS)
    availableCases: Math.floor(Math.random() * 80) + 40,
    piecesPerCase: DISTRIBUTOR_PIECES_PER_CASE,
  }))
}

const MOCK_SS_STOCK = getSSStock()

const getDistributorForShopId = (shopId) => {
  const shop = MOCK_SHOPS.find((s) => s.id === Number(shopId))
  const dist = MOCK_HIERARCHY.distributors.find((d) => d.id === shop?.distributorId)
  return {
    distributorId: shop?.distributorId,
    distributorName: dist?.name || '—',
    distributorCode: dist?.code || '',
  }
}

// Mock Shop Orders
const MOCK_SHOP_ORDERS = [
  {
    id: 1,
    shopId: 1,
    shopName: 'Beauty Zone T Nagar',
    area: 'T Nagar',
    items: [
      { productId: 1, productName: 'Face Wash', quantity: 3, value: 6750 },
      { productId: 5, productName: 'Body Lotion', quantity: 2, value: 5400 },
    ],
    totalValue: 12150,
    status: 'created',
    createdAt: '2026-01-28T10:00:00Z',
  },
  {
    id: 2,
    shopId: 2,
    shopName: 'Glow Beauty Parlour',
    area: 'Anna Nagar',
    items: [
      { productId: 13, productName: 'Soap', quantity: 5, value: 13500 },
    ],
    totalValue: 13500,
    status: 'created',
    createdAt: '2026-01-27T14:30:00Z',
  },
]

const DistributorOrders = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('create')
  const [createOrderData, setCreateOrderData] = useState({ entityId: '' }) // SS ID or Shop ID
  const [selectedCategory, setSelectedCategory] = useState(COSMETICS_CATEGORIES?.[0]?.name || 'Face Care')
  const [cart, setCart] = useState({}) // { productId: { product, quantityCases } } — SS purchase
  const [shopSaleSelectedShopId, setShopSaleSelectedShopId] = useState('')
  const [shopSaleCategory, setShopSaleCategory] = useState(COSMETICS_CATEGORIES?.[0]?.name || 'Face Care')
  const [shopSaleCart, setShopSaleCart] = useState({}) // shop sale to retailer
  const [shopOrders, setShopOrders] = useState(MOCK_SHOP_ORDERS)
  const [viewFilters, setViewFilters] = useState({
    shopId: '',
    area: '',
    status: 'all',
    startDate: '',
    endDate: '',
  })
  const [showViewShopOrderDialog, setShowViewShopOrderDialog] = useState(false)
  const [viewingShopOrder, setViewingShopOrder] = useState(null)

  // Get shops assigned to this distributor
  const assignedShops = MOCK_SHOPS.filter(shop => shop.distributorId === user?.distributorId || shop.distributorId === 1)

  const handleCreateOrder = () => {
    if (!createOrderData.entityId) {
      alert('Please select SS')
      return
    }
    const selectedProducts = Object.keys(cart)
    if (selectedProducts.length === 0) {
      alert('Please add products to cart')
      return
    }
    alert('Order created successfully!')
    setCreateOrderData({ entityId: '' })
    setCart({})
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

  const filteredShopOrders = useMemo(() => {
    return (shopOrders || []).filter((order) => {
      if (viewFilters.shopId && order.shopId !== Number(viewFilters.shopId)) return false
      if (viewFilters.area && order.area !== viewFilters.area) return false
      if (viewFilters.status !== 'all' && String(order.status || 'created') !== viewFilters.status) return false
      return isInRange(order.createdAt, viewFilters.startDate, viewFilters.endDate)
    })
  }, [shopOrders, viewFilters])

  const shopOrdersPagination = useTablePagination(filteredShopOrders)

  const handleViewShopOrder = (order) => {
    setViewingShopOrder(order)
    setShowViewShopOrderDialog(true)
  }

  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return []
    return MOCK_SS_STOCK.filter((p) => p.category === selectedCategory)
  }, [selectedCategory])

  const cartTotals = useMemo(() => {
    const totalCases = Object.values(cart).reduce((sum, item) => sum + (Number(item.quantityCases) || 0), 0)
    const totalValue = Object.values(cart).reduce((sum, item) => {
      const qty = Number(item.quantityCases || 0)
      const p = item.product
      return sum + qty * Number(p.price || 0) * Number(p.piecesPerCase || DISTRIBUTOR_PIECES_PER_CASE)
    }, 0)
    return { totalCases, totalValue }
  }, [cart])

  const shopSaleCategoryProducts = useMemo(() => {
    if (!shopSaleCategory) return []
    return MOCK_SS_STOCK.filter((p) => p.category === shopSaleCategory)
  }, [shopSaleCategory])

  const shopSaleCartTotals = useMemo(() => {
    const totalCases = Object.values(shopSaleCart).reduce((sum, item) => sum + (Number(item.quantityCases) || 0), 0)
    const totalValue = Object.values(shopSaleCart).reduce((sum, item) => {
      const qty = Number(item.quantityCases || 0)
      const p = item.product
      return sum + qty * Number(p.price || 0) * Number(p.piecesPerCase || DISTRIBUTOR_PIECES_PER_CASE)
    }, 0)
    return { totalCases, totalValue }
  }, [shopSaleCart])

  const handleSubmitShopSale = () => {
    if (!shopSaleSelectedShopId) {
      alert('Please select a shop')
      return
    }
    if (Object.keys(shopSaleCart).length === 0) {
      alert('Please add products to cart')
      return
    }
    const shop = assignedShops.find((s) => s.id === Number(shopSaleSelectedShopId))
    if (!shop) {
      alert('Invalid shop')
      return
    }
    const area = shop.address?.split(',')[0]?.trim() || shop.address || ''
    const items = Object.entries(shopSaleCart).map(([pid, item]) => {
      const qty = Number(item.quantityCases || 0)
      const p = item.product
      const value = qty * Number(p.price || 0) * Number(p.piecesPerCase || DISTRIBUTOR_PIECES_PER_CASE)
      return {
        productId: Number(pid),
        productName: p.name,
        quantity: qty,
        value,
      }
    })
    const totalValue = items.reduce((sum, i) => sum + (i.value || 0), 0)
    const newOrder = {
      id: Date.now(),
      shopId: shop.id,
      shopName: shop.name,
      area,
      items,
      totalValue,
      status: 'created',
      createdAt: new Date().toISOString(),
    }
    setShopOrders((prev) => [newOrder, ...prev])
    setShopSaleCart({})
    setShopSaleSelectedShopId('')
    alert('Shop sale order created successfully!')
    setActiveTab('view')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-2">
          Purchase from SS, create shop sale orders, and view all distributor-to-shop sales
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="gap-2">
          <TabsTrigger value="create" className="whitespace-nowrap">
            Purchase from SS
          </TabsTrigger>
          <TabsTrigger value="create-shop" className="whitespace-nowrap">
            Create Shop Sale
          </TabsTrigger>
          <TabsTrigger value="view" className="whitespace-nowrap">
            Shop Sales Orders
          </TabsTrigger>
        </TabsList>

        {/* Create Order Tab */}
        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Selection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase from Super Stockist</CardTitle>
                  <CardDescription>{`Order stock from SS (each case = ${DISTRIBUTOR_PIECES_PER_CASE} pieces)`}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="entity">Select SS Name *</Label>
                    <Select
                      id="entity"
                      value={createOrderData.entityId}
                      onChange={(e) => {
                        setCreateOrderData({ entityId: e.target.value })
                        setCart({})
                      }}
                    >
                      <option value="">Select SS</option>
                      {MOCK_SS_LIST.map((ss) => (
                        <option key={ss.id} value={ss.id}>
                          {ss.name} - {ss.city}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {createOrderData.entityId ? (
                    <>
                      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                        <TabsList className="gap-2">
                          {COSMETICS_CATEGORIES.map((category) => (
                            <TabsTrigger key={category.id} value={category.name} className="whitespace-nowrap">
                              {category.name}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {COSMETICS_CATEGORIES.map((category) => (
                          <TabsContent key={category.id} value={category.name} className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {categoryProducts
                                .filter((p) => p.category === category.name)
                                .map((product) => {
                                  const cartItem = cart[product.id]
                                  const orderedCases = Number(cartItem?.quantityCases || 0)
                                  const remaining = Math.max(0, Number(product.availableCases || 0) - orderedCases)
                                  const productMaster = MOCK_PRODUCTS.find((p) => p.id === product.id)
                                  return (
                                    <div key={product.id} className="border rounded-lg p-4 space-y-3">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold truncate">{product.name}</h4>
                                          <p className="text-xs text-gray-500">Pieces/Case: {product.piecesPerCase}</p>
                                          <p className="text-sm font-medium text-[#433228] mt-1">
                                            Price (Basic): ₹{Number(product.price || 0).toLocaleString('en-IN')}
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
                                          <p
                                            className={`text-sm font-semibold ${
                                              remaining > 10 ? 'text-green-600' : remaining > 0 ? 'text-yellow-600' : 'text-red-600'
                                            }`}
                                          >
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
                                                setCart((prev) => {
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
                                                setCart((prev) => ({
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
                                            onClick={() => setCart((prev) => ({ ...prev, [product.id]: { product, quantityCases: 1 } }))}
                                            disabled={Number(product.availableCases || 0) === 0}
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add
                                          </Button>
                                        )}

                                        <div className="text-sm text-gray-700">
                                          Value:{' '}
                                          <span className="font-semibold">
                                            ₹{(orderedCases * Number(product.price || 0) * Number(product.piecesPerCase || 0)).toLocaleString('en-IN')}
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
                    </>
                  ) : (
                    <div className="text-center py-10 text-gray-500">Select SS to start ordering.</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Cart */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Cart ({Object.keys(cart).length})
                  </CardTitle>
                  <CardDescription>Selected products (cases)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.keys(cart).length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {Object.values(cart).map((item) => (
                          <div key={item.product.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {(() => {
                                  const img = MOCK_PRODUCTS.find((p) => p.id === item.product.id)?.image
                                  return img ? (
                                    <img src={img} alt={item.product.name} className="h-10 w-10 rounded object-cover border bg-gray-100 flex-shrink-0" />
                                  ) : (
                                    <div className="h-10 w-10 rounded border bg-gray-100 flex-shrink-0" />
                                  )
                                })()}
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{item.product.name}</p>
                                  <p className="text-xs text-gray-500">Pieces/Case: {item.product.piecesPerCase}</p>
                                  <p className="text-xs text-gray-600">Basic: ₹{Number(item.product.price || 0).toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setCart((prev) => {
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
                                    setCart((prev) => {
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
                                  onClick={() => setCart((prev) => ({ ...prev, [item.product.id]: { product: item.product, quantityCases: Number(item.quantityCases || 0) + 1 } }))}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-sm font-semibold">
                                ₹{(Number(item.quantityCases || 0) * Number(item.product.price || 0) * Number(item.product.piecesPerCase || 0)).toLocaleString('en-IN')}
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
                        <Button type="button" variant="outline" className="w-full" onClick={() => setCart({})}>
                          Reset Cart
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Create Shop Sale — distributor → shop */}
        <TabsContent value="create-shop">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create Shop Sale Order</CardTitle>
                  <CardDescription>
                    {`Sell products to your shop (each case = ${DISTRIBUTOR_PIECES_PER_CASE} pieces). Select a shop, then add cases to cart.`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="shop-sale-shop">Select Shop *</Label>
                    <Select
                      id="shop-sale-shop"
                      value={shopSaleSelectedShopId}
                      onChange={(e) => {
                        setShopSaleSelectedShopId(e.target.value)
                        setShopSaleCart({})
                      }}
                    >
                      <option value="">Select shop</option>
                      {assignedShops.map((shop) => {
                        const { distributorName } = getDistributorForShopId(shop.id)
                        return (
                          <option key={shop.id} value={String(shop.id)}>
                            {shop.name} — {distributorName}
                          </option>
                        )
                      })}
                    </Select>
                  </div>

                  {shopSaleSelectedShopId ? (
                    <>
                      <Tabs value={shopSaleCategory} onValueChange={setShopSaleCategory}>
                        <TabsList className="gap-2">
                          {COSMETICS_CATEGORIES.map((category) => (
                            <TabsTrigger key={category.id} value={category.name} className="whitespace-nowrap">
                              {category.name}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {COSMETICS_CATEGORIES.map((category) => (
                          <TabsContent key={category.id} value={category.name} className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {shopSaleCategoryProducts
                                .filter((p) => p.category === category.name)
                                .map((product) => {
                                  const cartItem = shopSaleCart[product.id]
                                  const orderedCases = Number(cartItem?.quantityCases || 0)
                                  const remaining = Math.max(0, Number(product.availableCases || 0) - orderedCases)
                                  const productMaster = MOCK_PRODUCTS.find((p) => p.id === product.id)
                                  return (
                                    <div key={product.id} className="border rounded-lg p-4 space-y-3">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold truncate">{product.name}</h4>
                                          <p className="text-xs text-gray-500">Pieces/Case: {product.piecesPerCase}</p>
                                          <p className="text-sm font-medium text-[#433228] mt-1">
                                            Rate (Basic): ₹{Number(product.price || 0).toLocaleString('en-IN')}
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
                                          <p
                                            className={`text-sm font-semibold ${
                                              remaining > 10 ? 'text-green-600' : remaining > 0 ? 'text-yellow-600' : 'text-red-600'
                                            }`}
                                          >
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
                                                setShopSaleCart((prev) => {
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
                                                setShopSaleCart((prev) => ({
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
                                            onClick={() =>
                                              setShopSaleCart((prev) => ({ ...prev, [product.id]: { product, quantityCases: 1 } }))
                                            }
                                            disabled={Number(product.availableCases || 0) === 0}
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add
                                          </Button>
                                        )}

                                        <div className="text-sm text-gray-700">
                                          Value:{' '}
                                          <span className="font-semibold">
                                            ₹
                                            {(
                                              orderedCases *
                                              Number(product.price || 0) *
                                              Number(product.piecesPerCase || DISTRIBUTOR_PIECES_PER_CASE)
                                            ).toLocaleString('en-IN')}
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
                    </>
                  ) : (
                    <div className="text-center py-10 text-gray-500">Select a shop to add products.</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Cart ({Object.keys(shopSaleCart).length})
                  </CardTitle>
                  <CardDescription>Shop sale — cases × {DISTRIBUTOR_PIECES_PER_CASE} pcs × rate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.keys(shopSaleCart).length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {Object.values(shopSaleCart).map((item) => (
                          <div key={item.product.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {(() => {
                                  const img = MOCK_PRODUCTS.find((p) => p.id === item.product.id)?.image
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
                                  <p className="text-xs text-gray-600">
                                    Rate: ₹{Number(item.product.price || 0).toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setShopSaleCart((prev) => {
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
                                    setShopSaleCart((prev) => {
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
                                    const stock = MOCK_SS_STOCK.find((p) => p.id === item.product.id)
                                    const available = stock?.availableCases ?? 0
                                    const nextQty = Number(item.quantityCases || 0) + 1
                                    if (nextQty > available) return
                                    setShopSaleCart((prev) => ({
                                      ...prev,
                                      [item.product.id]: {
                                        product: item.product,
                                        quantityCases: nextQty,
                                      },
                                    }))
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-sm font-semibold">
                                ₹
                                {(
                                  Number(item.quantityCases || 0) *
                                  Number(item.product.price || 0) *
                                  Number(item.product.piecesPerCase || DISTRIBUTOR_PIECES_PER_CASE)
                                ).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Cases:</span>
                          <span>{shopSaleCartTotals.totalCases}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total Value:</span>
                          <span className="text-lg text-[#433228]">
                            ₹{shopSaleCartTotals.totalValue.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <Button
                          type="button"
                          onClick={handleSubmitShopSale}
                          className="w-full bg-[#433228] hover:bg-[#5a4238] text-white"
                        >
                          Create Shop Sale Order
                        </Button>
                        <Button type="button" variant="outline" className="w-full" onClick={() => setShopSaleCart({})}>
                          Reset Cart
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* View Order Tab */}
        <TabsContent value="view">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Optional — list shows all shop orders by default</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vf_shop">Shop</Label>
                  <Select
                    id="vf_shop"
                    value={viewFilters.shopId}
                    onChange={(e) => {
                      const shopId = e.target.value
                      const shop = assignedShops.find((s) => s.id === Number(shopId))
                      setViewFilters((prev) => ({
                        ...prev,
                        shopId,
                        area: shopId ? shop?.address?.split(',')?.[1]?.trim?.() || '' : '',
                      }))
                    }}
                  >
                    <option value="">All</option>
                    {assignedShops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
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
                    <option value="created">Created</option>
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

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setViewFilters({
                      shopId: '',
                      area: '',
                      status: 'all',
                      startDate: '',
                      endDate: '',
                    })
                  }
                >
                  Reset
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle>Shop Orders</CardTitle>
                    <CardDescription>{`Shop sales orders you created. Each case = ${DISTRIBUTOR_PIECES_PER_CASE} pieces`}</CardDescription>
                  </div>
                  <ExportButtons
                    rows={filteredShopOrders.flatMap((o) =>
                      (o.items || []).map((i) => {
                        const master = MOCK_PRODUCTS.find((p) => p.id === i.productId)
                        const piecesPerCase = DISTRIBUTOR_PIECES_PER_CASE
                        const cases = Number(i.quantity || 0)
                        const unitPrice = Number(MOCK_SS_STOCK.find((p) => p.id === i.productId)?.price || 0)
                        const itemValue = Number(i.value ?? (cases * unitPrice * piecesPerCase || 0))
                        return {
                          'Order ID': o.id,
                          'Created At': o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : '',
                          Shop: o.shopName,
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
                    csvFilename={`Distributor_Shop_Fulfillment_${new Date().toISOString().split('T')[0]}.csv`}
                    xlsxFilename={`Distributor_Shop_Fulfillment_${new Date().toISOString().split('T')[0]}.xlsx`}
                    xlsxSheetName="Distributor Shop Sales"
                    disabled={filteredShopOrders.length === 0}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filteredShopOrders.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No orders found for selected filters.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Created At</TableHead>
                        <TableHead>Shop</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead className="text-right">Cases</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shopOrdersPagination.paginatedItems.map((order) => {
                        const totalCases = (order.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0)
                        return (
                          <TableRow key={order.id}>
                            <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : '-'}</TableCell>
                            <TableCell className="min-w-[200px]">
                              <div className="font-medium">{order.shopName}</div>
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
                                  order.status === 'created' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {String(order.status || 'created').toUpperCase()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => handleViewShopOrder(order)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
                {filteredShopOrders.length > 0 && <TablePaginationControls {...shopOrdersPagination} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Shop Order Dialog */}
      <Dialog open={showViewShopOrderDialog} onOpenChange={setShowViewShopOrderDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {viewingShopOrder && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span>Shop Sale Order</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                      viewingShopOrder.status === 'created' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {String(viewingShopOrder.status || 'created').toUpperCase()}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {`Order #${viewingShopOrder.id} • ${viewingShopOrder.shopName} • ${viewingShopOrder.area} • ${viewingShopOrder.createdAt ? new Date(viewingShopOrder.createdAt).toLocaleString('en-IN') : ''}`}
                </DialogDescription>
              </DialogHeader>

              <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                <p className="text-xs font-semibold text-gray-500">SHOP</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{viewingShopOrder.shopName}</p>
                <p className="text-xs text-gray-600 mt-1">{viewingShopOrder.area}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-500">TOTAL CASES</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {(viewingShopOrder.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Requested cases</p>
                </div>
                <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-500">TOTAL VALUE</p>
                  <p className="text-2xl font-bold text-[#433228] mt-1">₹{Number(viewingShopOrder.totalValue || 0).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500 mt-1">Order total value</p>
                </div>
                <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-500">PRODUCTS</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{(viewingShopOrder.items || []).length}</p>
                  <p className="text-xs text-gray-500 mt-1">{`${DISTRIBUTOR_PIECES_PER_CASE} pcs/case`}</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <p className="font-semibold text-gray-900">Order Items</p>
                  <p className="text-xs text-gray-500">Item-wise details for this shop order</p>
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
                      {(viewingShopOrder.items || []).map((item) => {
                        const master = MOCK_PRODUCTS.find((p) => p.id === item.productId)
                        const img = master?.image
                        const piecesPerCase = DISTRIBUTOR_PIECES_PER_CASE
                        const cases = Number(item.quantity || 0)
                        const unitPrice = Number(MOCK_SS_STOCK.find((p) => p.id === item.productId)?.price || 0)
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
                          {(viewingShopOrder.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0)}
                        </TableCell>
                        <TableCell colSpan={2} />
                        <TableCell className="text-right">₹{Number(viewingShopOrder.totalValue || 0).toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowViewShopOrderDialog(false)}>
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

export default DistributorOrders
