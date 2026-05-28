import { useEffect, useMemo, useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { FileText, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { MOCK_PRODUCTS } from '../../data/mockData'
import ExportButtons from '../../components/common/ExportButtons'

// Mock data
const MOCK_DISTRIBUTORS = [
  { id: 1, name: 'Shraam', area: 'Sivakasi' },
  { id: 2, name: 'Raj Distributors', area: 'Madurai' },
  { id: 3, name: 'Kumar Agencies', area: 'Coimbatore' },
]

const MOCK_SHOPS = {
  1: [
    { id: 1, name: 'Beauty Zone Sivakasi' },
    { id: 2, name: 'Cosmetics Hub Sivakasi' },
  ],
  2: [
    { id: 3, name: 'Beauty Zone Madurai' },
    { id: 4, name: 'Cosmetics Hub Madurai' },
  ],
  3: [
    { id: 5, name: 'Beauty Zone Coimbatore' },
    { id: 6, name: 'Cosmetics Hub Coimbatore' },
  ],
}

// SS -> Distributor sales orders (order-level, with items)
const MOCK_SS_DISTRIBUTOR_SALES = [
  {
    id: 'SS-SALE-001',
    date: '2026-01-18',
    distributorId: 1,
    distributorName: 'Shraam',
    area: 'Sivakasi',
    saleType: 'primary',
    items: [
      { productId: 13, quantityCases: 10, unitPrice: 250, piecesPerCase: 60 }, // Soap
      { productId: 14, quantityCases: 6, unitPrice: 300, piecesPerCase: 24 }, // Hand Wash
    ],
  },
  {
    id: 'SS-SALE-002',
    date: '2026-01-22',
    distributorId: 2,
    distributorName: 'Raj Distributors',
    area: 'Madurai',
    saleType: 'secondary',
    items: [
      { productId: 1, quantityCases: 4, unitPrice: 500, piecesPerCase: 12 }, // Face Wash
      { productId: 2, quantityCases: 2, unitPrice: 450, piecesPerCase: 12 }, // Face Cream
    ],
  },
]

// Distributor -> Shop sales (shop-level)
const MOCK_SS_SHOP_SALES = [
  {
    id: 'SHOP-SALE-001',
    date: '2026-01-20',
    distributorId: 1,
    shopId: 1,
    shopName: 'Beauty Zone Sivakasi',
    saleType: 'primary',
    items: [
      { productId: 13, quantity: 15, mrp: 50 }, // Soap (pieces)
      { productId: 14, quantity: 8, mrp: 120 }, // Hand Wash
    ],
  },
  {
    id: 'SHOP-SALE-002',
    date: '2026-01-24',
    distributorId: 2,
    shopId: 3,
    shopName: 'Beauty Zone Madurai',
    saleType: 'secondary',
    items: [
      { productId: 1, quantity: 10, mrp: 250 }, // Face Wash
    ],
  },
]

// Fallback purchase orders (Factory -> SS) if no localStorage orders exist
const MOCK_SS_PURCHASE_ORDERS = [
  {
    id: 1706000000001,
    createdAt: '2026-01-15T10:00:00Z',
    status: 'pending',
    items: [
      { productId: 1, productName: 'Face Wash', category: 'Face Care', quantityCases: 10, piecesPerCase: 12, basic: 500, value: 60000, image: '' },
      { productId: 13, productName: 'Soap', category: 'Personal Care', quantityCases: 8, piecesPerCase: 60, basic: 250, value: 120000, image: '' },
    ],
    totalCases: 18,
    totalValue: 180000,
  },
]

const SuperStockistReports = () => {
  const [activeTab, setActiveTab] = useState('distributor')
  const [distributorReportData, setDistributorReportData] = useState({
    distributorId: '',
    saleType: 'both', // 'primary', 'secondary', 'both'
    startDate: '',
    endDate: '',
  })
  const [shopReportData, setShopReportData] = useState({
    distributorId: '',
    shopId: '',
    saleType: 'both',
    startDate: '',
    endDate: '',
  })
  const [purchaseReportData, setPurchaseReportData] = useState({
    startDate: '',
    endDate: '',
  })

  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewing, setViewing] = useState(null) // { type, data }

  const handleGenerateDistributorReport = () => {
    // Filters are optional; table updates automatically.
    alert('Filters applied!')
  }

  const handleGenerateShopReport = () => {
    // Filters are optional; table updates automatically.
    alert('Filters applied!')
  }

  const handleGeneratePurchaseReport = () => {
    // Filters are optional; table updates automatically.
    alert('Filters applied!')
  }

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('ssFactoryOrders') || '[]')
    setPurchaseOrders(stored.length > 0 ? stored : MOCK_SS_PURCHASE_ORDERS)
  }, [])

  const getProduct = (productId) => MOCK_PRODUCTS.find((p) => p.id === Number(productId))

  const isInRange = (dateStr, start, end) => {
    if (!start && !end) return true
    const d = new Date(dateStr)
    const s = start ? new Date(start) : null
    const e = end ? new Date(end) : null
    if (e) e.setHours(23, 59, 59, 999)
    if (s && d < s) return false
    if (e && d > e) return false
    return true
  }

  const distributorHasFilters = Boolean(
    distributorReportData.distributorId ||
      distributorReportData.saleType !== 'both' ||
      distributorReportData.startDate ||
      distributorReportData.endDate,
  )

  const shopHasFilters = Boolean(
    shopReportData.distributorId ||
      shopReportData.shopId ||
      shopReportData.saleType !== 'both' ||
      shopReportData.startDate ||
      shopReportData.endDate,
  )

  const purchaseHasFilters = Boolean(purchaseReportData.startDate || purchaseReportData.endDate)

  const filteredDistributorOrders = useMemo(() => {
    return MOCK_SS_DISTRIBUTOR_SALES.filter((o) => {
      if (distributorReportData.distributorId && o.distributorId !== Number(distributorReportData.distributorId)) return false
      if (distributorReportData.saleType !== 'both' && o.saleType !== distributorReportData.saleType) return false
      return isInRange(o.date, distributorReportData.startDate, distributorReportData.endDate)
    })
  }, [distributorReportData])

  const filteredShopOrders = useMemo(() => {
    return MOCK_SS_SHOP_SALES.filter((o) => {
      if (shopReportData.distributorId && o.distributorId !== Number(shopReportData.distributorId)) return false
      if (shopReportData.shopId && o.shopId !== Number(shopReportData.shopId)) return false
      if (shopReportData.saleType !== 'both' && o.saleType !== shopReportData.saleType) return false
      return isInRange(o.date, shopReportData.startDate, shopReportData.endDate)
    })
  }, [shopReportData])

  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter((o) => isInRange(o.createdAt || o.date, purchaseReportData.startDate, purchaseReportData.endDate))
  }, [purchaseReportData, purchaseOrders])

  const distributorReportPagination = useTablePagination(filteredDistributorOrders)
  const shopReportPagination = useTablePagination(filteredShopOrders)
  const purchaseReportPagination = useTablePagination(filteredPurchaseOrders)
  const viewPurchaseDialogItemsPagination = useTablePagination(
    viewing?.type === 'purchase' && viewing?.data ? viewing.data.items || [] : [],
  )
  const viewSalesDialogItemsPagination = useTablePagination(
    (viewing?.type === 'distributor' || viewing?.type === 'shop') && viewing?.data ? viewing.data.items || [] : [],
  )

  const formatCasesPieces = (cases, piecesPerCase) => {
    const c = Number(cases || 0)
    const ppc = Number(piecesPerCase || 0)
    if (!c || !ppc) return ''
    return `${c} case${c === 1 ? '' : 's'} × ${ppc} pcs`
  }

  const formatProductsSummary = (items, type) => {
    if (!Array.isArray(items) || items.length === 0) return '-'
    if (type === 'shop') {
      return items
        .map((i) => {
          const name = getProduct(i.productId)?.name || `#${i.productId}`
          const qty = Number(i.quantity || 0)
          return `${name} (${qty} pcs)`
        })
        .join(', ')
    }

    return items
      .map((i) => {
        const name = i.productName || getProduct(i.productId)?.name || `#${i.productId}`
        const meta = formatCasesPieces(i.quantityCases, i.piecesPerCase)
        return meta ? `${name} (${meta})` : name
      })
      .join(', ')
  }

  const handleView = (type, data) => {
    setViewing({ type, data })
    setShowViewDialog(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales & Purchase Reports</h1>
        <p className="text-gray-600 mt-2">Generate distributor-wise and shop-wise reports</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="gap-2">
          <TabsTrigger value="distributor" className="whitespace-nowrap data-[state=active]:bg-white">
            Distributor-wise Report
          </TabsTrigger>
          <TabsTrigger value="shop" className="whitespace-nowrap data-[state=active]:bg-white">
            Shop-wise Report
          </TabsTrigger>
          <TabsTrigger value="purchase" className="whitespace-nowrap data-[state=active]:bg-white">
            Purchase Report
          </TabsTrigger>
        </TabsList>

        {/* Distributor-wise Report */}
        <TabsContent value="distributor">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#433228]" />
                Distributor-wise Report
              </CardTitle>
              <CardDescription>Generate report based on Distributor Billing Data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distributor-report">Select Distributor *</Label>
                    <Select
                      id="distributor-report"
                      value={distributorReportData.distributorId}
                      onChange={(e) => setDistributorReportData({ ...distributorReportData, distributorId: e.target.value })}
                    >
                      <option value="">Select Distributor</option>
                      {MOCK_DISTRIBUTORS.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.name} - {dist.area}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sale-type-dist">Sale Type *</Label>
                    <Select
                      id="sale-type-dist"
                      value={distributorReportData.saleType}
                      onChange={(e) => setDistributorReportData({ ...distributorReportData, saleType: e.target.value })}
                    >
                      <option value="both">Both (Primary & Secondary)</option>
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-date-dist">Start Date *</Label>
                    <Input
                      id="start-date-dist"
                      type="date"
                      value={distributorReportData.startDate}
                      onChange={(e) => setDistributorReportData({ ...distributorReportData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date-dist">End Date *</Label>
                    <Input
                      id="end-date-dist"
                      type="date"
                      value={distributorReportData.endDate}
                      onChange={(e) => setDistributorReportData({ ...distributorReportData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateDistributorReport}
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                >
                  Generate Report
                </Button>

                {filteredDistributorOrders.length > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Report Results</h3>
                      <ExportButtons
                        rows={filteredDistributorOrders.flatMap((o) => {
                          const orderValue = (o.items || []).reduce(
                            (sum, i) => sum + Number(i.quantityCases || 0) * Number(i.unitPrice || 0) * Number(i.piecesPerCase || 0),
                            0,
                          )
                          const orderTotalCases = (o.items || []).reduce((sum, i) => sum + Number(i.quantityCases || 0), 0)
                          return (o.items || []).map((i) => {
                            const p = getProduct(i.productId)
                            const productName = p?.name || `#${i.productId}`
                            const totalPieces = Number(i.quantityCases || 0) * Number(i.piecesPerCase || 0)
                            const itemValue = Number(i.quantityCases || 0) * Number(i.unitPrice || 0) * Number(i.piecesPerCase || 0)
                            return {
                              Date: new Date(o.date).toLocaleDateString('en-IN'),
                              'Order ID': o.id,
                              Distributor: o.distributorName,
                              Area: o.area,
                              'Sale Type': o.saleType,
                              Product: productName,
                              'Cases': i.quantityCases,
                              'Pieces/Case': i.piecesPerCase,
                              'Total Pieces': totalPieces,
                              'Unit Price (₹)': i.unitPrice,
                              'Item Value (₹)': itemValue,
                              'Order Total Cases': orderTotalCases,
                              'Order Total Value (₹)': orderValue,
                            }
                          })
                        })}
                        csvFilename={`SS_Distributor_Report_${new Date().toISOString().split('T')[0]}.csv`}
                        xlsxFilename={`SS_Distributor_Report_${new Date().toISOString().split('T')[0]}.xlsx`}
                        xlsxSheetName="Distributor Report"
                      />
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead>Sale Type</TableHead>
                          <TableHead className="text-right">Items</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                          <TableHead>View</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {distributorReportPagination.paginatedItems.map((order) => {
                          const orderValue = order.items.reduce((sum, i) => sum + i.quantityCases * i.unitPrice * i.piecesPerCase, 0)
                          return (
                            <TableRow key={order.id}>
                              <TableCell>{new Date(order.date).toLocaleDateString('en-IN')}</TableCell>
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell className="max-w-[360px]">
                                <div className="flex items-center gap-3">
                                  <div className="flex -space-x-2">
                                    {order.items.slice(0, 3).map((i) => {
                                      const img = getProduct(i.productId)?.image
                                      const name = getProduct(i.productId)?.name || `#${i.productId}`
                                      return img ? (
                                        <img key={i.productId} src={img} alt={name} className="h-8 w-8 rounded border border-white object-cover bg-gray-100" />
                                      ) : (
                                        <div key={i.productId} className="h-8 w-8 rounded border border-white bg-gray-100" title={name} />
                                      )
                                    })}
                                  </div>
                                  <div className="truncate text-sm text-gray-900">
                                    {formatProductsSummary(order.items, 'distributor')}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">{order.saleType}</TableCell>
                              <TableCell className="text-right">{order.items.length}</TableCell>
                              <TableCell className="text-right font-semibold text-green-600">₹{orderValue.toLocaleString('en-IN')}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline" onClick={() => handleView('distributor', order)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                    {filteredDistributorOrders.length > 0 && <TablePaginationControls {...distributorReportPagination} />}
                  </div>
                )}
                {distributorHasFilters && filteredDistributorOrders.length === 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">No distributor sales found for the selected filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shop-wise Report */}
        <TabsContent value="shop">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#433228]" />
                Shop-wise Report
              </CardTitle>
              <CardDescription>Generate report based on MRP (Shop Value)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distributor-shop-report">Select Distributor *</Label>
                    <Select
                      id="distributor-shop-report"
                      value={shopReportData.distributorId}
                      onChange={(e) => {
                        setShopReportData({ ...shopReportData, distributorId: e.target.value, shopId: '' })
                      }}
                    >
                      <option value="">Select Distributor</option>
                      {MOCK_DISTRIBUTORS.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.name} - {dist.area}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shop-report">Select Shop *</Label>
                    <Select
                      id="shop-report"
                      value={shopReportData.shopId}
                      onChange={(e) => setShopReportData({ ...shopReportData, shopId: e.target.value })}
                      disabled={!shopReportData.distributorId}
                    >
                      <option value="">Select Shop</option>
                      {shopReportData.distributorId && MOCK_SHOPS[parseInt(shopReportData.distributorId)]?.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sale-type-shop">Sale Type *</Label>
                    <Select
                      id="sale-type-shop"
                      value={shopReportData.saleType}
                      onChange={(e) => setShopReportData({ ...shopReportData, saleType: e.target.value })}
                    >
                      <option value="both">Both (Primary & Secondary)</option>
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-date-shop">Start Date *</Label>
                    <Input
                      id="start-date-shop"
                      type="date"
                      value={shopReportData.startDate}
                      onChange={(e) => setShopReportData({ ...shopReportData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date-shop">End Date *</Label>
                    <Input
                      id="end-date-shop"
                      type="date"
                      value={shopReportData.endDate}
                      onChange={(e) => setShopReportData({ ...shopReportData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateShopReport}
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                >
                  Generate Report
                </Button>

                {filteredShopOrders.length > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Report Results</h3>
                      <ExportButtons
                        rows={filteredShopOrders.flatMap((o) => {
                          const orderValue = (o.items || []).reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.mrp || 0), 0)
                          const orderTotalQty = (o.items || []).reduce((sum, i) => sum + Number(i.quantity || 0), 0)
                          return (o.items || []).map((i) => {
                            const p = getProduct(i.productId)
                            const productName = p?.name || `#${i.productId}`
                            const itemValue = Number(i.quantity || 0) * Number(i.mrp || 0)
                            return {
                              Date: new Date(o.date).toLocaleDateString('en-IN'),
                              'Order ID': o.id,
                              Distributor: MOCK_DISTRIBUTORS.find((d) => d.id === Number(o.distributorId))?.name || '',
                              Shop: o.shopName,
                              'Sale Type': o.saleType,
                              Product: productName,
                              'Qty (pcs)': i.quantity,
                              'MRP (₹)': i.mrp,
                              'Item Value (₹)': itemValue,
                              'Order Total Qty (pcs)': orderTotalQty,
                              'Order Total Value (₹)': orderValue,
                            }
                          })
                        })}
                        csvFilename={`SS_Shop_Report_${new Date().toISOString().split('T')[0]}.csv`}
                        xlsxFilename={`SS_Shop_Report_${new Date().toISOString().split('T')[0]}.xlsx`}
                        xlsxSheetName="Shop Report"
                      />
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead>Sale Type</TableHead>
                          <TableHead className="text-right">Items</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                          <TableHead>View</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shopReportPagination.paginatedItems.map((order) => {
                          const orderValue = order.items.reduce((sum, i) => sum + i.quantity * i.mrp, 0)
                          return (
                            <TableRow key={order.id}>
                              <TableCell>{new Date(order.date).toLocaleDateString('en-IN')}</TableCell>
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell className="max-w-[360px]">
                                <div className="flex items-center gap-3">
                                  <div className="flex -space-x-2">
                                    {order.items.slice(0, 3).map((i) => {
                                      const img = getProduct(i.productId)?.image
                                      const name = getProduct(i.productId)?.name || `#${i.productId}`
                                      return img ? (
                                        <img key={i.productId} src={img} alt={name} className="h-8 w-8 rounded border border-white object-cover bg-gray-100" />
                                      ) : (
                                        <div key={i.productId} className="h-8 w-8 rounded border border-white bg-gray-100" title={name} />
                                      )
                                    })}
                                  </div>
                                  <div className="truncate text-sm text-gray-900">
                                    {formatProductsSummary(order.items, 'shop')}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">{order.saleType}</TableCell>
                              <TableCell className="text-right">{order.items.length}</TableCell>
                              <TableCell className="text-right font-semibold text-green-600">₹{orderValue.toLocaleString('en-IN')}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline" onClick={() => handleView('shop', order)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                    {filteredShopOrders.length > 0 && <TablePaginationControls {...shopReportPagination} />}
                  </div>
                )}
                {shopHasFilters && filteredShopOrders.length === 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">No shop sales found for the selected filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Report */}
        <TabsContent value="purchase">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#433228]" />
                Super Stockist Purchase Report
              </CardTitle>
              <CardDescription>Purchase from Factory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date-purchase">Start Date *</Label>
                    <Input
                      id="start-date-purchase"
                      type="date"
                      value={purchaseReportData.startDate}
                      onChange={(e) => setPurchaseReportData({ ...purchaseReportData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date-purchase">End Date *</Label>
                    <Input
                      id="end-date-purchase"
                      type="date"
                      value={purchaseReportData.endDate}
                      onChange={(e) => setPurchaseReportData({ ...purchaseReportData, endDate: e.target.value })}
                      min={purchaseReportData.startDate}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGeneratePurchaseReport}
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                >
                  Generate Purchase Report
                </Button>

                {filteredPurchaseOrders.length > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Purchase Report Results</h3>
                      <ExportButtons
                        rows={filteredPurchaseOrders.flatMap((o) => {
                          const createdAt = o.createdAt || o.date
                          return (o.items || []).map((i) => {
                            const p = getProduct(i.productId)
                            const productName = i.productName || p?.name || `#${i.productId}`
                            const totalPieces = Number(i.quantityCases || 0) * Number(i.piecesPerCase || 0)
                            return {
                              'Created At': createdAt ? new Date(createdAt).toLocaleString('en-IN') : '',
                              'Order ID': o.id,
                              Status: o.status || 'pending',
                              Product: productName,
                              Category: i.category || p?.category || '',
                              'Cases': i.quantityCases,
                              'Pieces/Case': i.piecesPerCase,
                              'Total Pieces': totalPieces,
                              'Basic (₹)': i.basic,
                              'Item Value (₹)': i.value,
                              'Order Total Cases': o.totalCases,
                              'Order Total Value (₹)': o.totalValue,
                            }
                          })
                        })}
                        csvFilename={`SS_Purchase_Report_${new Date().toISOString().split('T')[0]}.csv`}
                        xlsxFilename={`SS_Purchase_Report_${new Date().toISOString().split('T')[0]}.xlsx`}
                        xlsxSheetName="Purchase Report"
                      />
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead className="text-right">Total Cases</TableHead>
                          <TableHead className="text-right">Purchase Value (₹)</TableHead>
                          <TableHead>View</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchaseReportPagination.paginatedItems.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{new Date(order.createdAt || order.date).toLocaleDateString('en-IN')}</TableCell>
                            <TableCell className="font-medium">#{order.id}</TableCell>
                            <TableCell className="max-w-[360px]">
                              <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                  {(order.items || []).slice(0, 3).map((i) => {
                                    const img = i.image || getProduct(i.productId)?.image
                                    const name = i.productName || getProduct(i.productId)?.name || `#${i.productId}`
                                    return img ? (
                                      <img key={i.productId} src={img} alt={name} className="h-8 w-8 rounded border border-white object-cover bg-gray-100" />
                                    ) : (
                                      <div key={i.productId} className="h-8 w-8 rounded border border-white bg-gray-100" title={name} />
                                    )
                                  })}
                                </div>
                                <div className="truncate text-sm text-gray-900">
                                  {formatProductsSummary(order.items || [], 'purchase')}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{order.totalCases}</TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              ₹{Number(order.totalValue || 0).toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => handleView('purchase', order)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-semibold bg-gray-50">
                          <TableCell colSpan={3}>Total</TableCell>
                          <TableCell className="text-right">
                            {filteredPurchaseOrders.reduce((sum, o) => sum + Number(o.totalCases || 0), 0)}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            ₹{filteredPurchaseOrders.reduce((sum, o) => sum + Number(o.totalValue || 0), 0).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                    {filteredPurchaseOrders.length > 0 && <TablePaginationControls {...purchaseReportPagination} />}
                  </div>
                )}

                {purchaseHasFilters && filteredPurchaseOrders.length === 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">No purchase records found for the selected date range.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {viewing?.type === 'purchase' && viewing?.data && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span>Purchase Report Details</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                      viewing.data.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : viewing.data.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {String(viewing.data.status || 'pending').toUpperCase()}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {`Order #${viewing.data.id} • ${new Date(viewing.data.createdAt || viewing.data.date).toLocaleString('en-IN')}`}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-500">TOTAL CASES</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{viewing.data.totalCases}</p>
                  <p className="text-xs text-gray-500 mt-1">Total ordered cases</p>
                </div>
                <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-500">TOTAL VALUE</p>
                  <p className="text-2xl font-bold text-[#433228] mt-1">
                    ₹{Number(viewing.data.totalValue || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Cases × basic × pieces/case</p>
                </div>
                <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-500">PRODUCTS</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{(viewing.data.items || []).length}</p>
                  <p className="text-xs text-gray-500 mt-1">Distinct items in this order</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <p className="font-semibold text-gray-900">Order Items</p>
                  <p className="text-xs text-gray-500">Full product breakdown for this purchase</p>
                </div>
                <div className="p-4">
                  <>
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
                      {viewPurchaseDialogItemsPagination.paginatedItems.map((i) => {
                        const img = i.image || getProduct(i.productId)?.image
                        const name = i.productName || getProduct(i.productId)?.name || `#${i.productId}`
                        return (
                          <TableRow key={i.productId}>
                            <TableCell>
                              {img ? (
                                <img src={img} alt={name} className="h-10 w-10 rounded object-cover border bg-gray-100" />
                              ) : (
                                <div className="h-10 w-10 rounded border bg-gray-100" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{name}</TableCell>
                            <TableCell>{i.category || getProduct(i.productId)?.category || '-'}</TableCell>
                            <TableCell className="text-right">{i.quantityCases}</TableCell>
                            <TableCell className="text-right">{i.piecesPerCase}</TableCell>
                            <TableCell className="text-right">₹{Number(i.basic || 0).toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-right">₹{Number(i.value || 0).toLocaleString('en-IN')}</TableCell>
                          </TableRow>
                        )
                      })}
                      <TableRow className="font-semibold bg-gray-50">
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">{viewing.data.totalCases}</TableCell>
                        <TableCell colSpan={2} />
                        <TableCell className="text-right">₹{Number(viewing.data.totalValue || 0).toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  {(viewing.data.items || []).length > 0 && (
                    <TablePaginationControls {...viewPurchaseDialogItemsPagination} />
                  )}
                  </>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}

          {(viewing?.type === 'distributor' || viewing?.type === 'shop') && viewing?.data && (
            <div className="space-y-6">
              {(() => {
                const items = viewing.data.items || []
                const totalValue =
                  viewing.type === 'shop'
                    ? items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.mrp || 0), 0)
                    : items.reduce((sum, i) => sum + Number(i.quantityCases || 0) * Number(i.unitPrice || 0) * Number(i.piecesPerCase || 0), 0)
                const label =
                  viewing.type === 'shop'
                    ? viewing.data.shopName || `Shop #${viewing.data.shopId || ''}`
                    : `${viewing.data.distributorName || 'Distributor'}${viewing.data.area ? ` • ${viewing.data.area}` : ''}`

                return (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <span>{viewing.type === 'shop' ? 'Shop-wise Sales Details' : 'Distributor-wise Sales Details'}</span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold w-fit bg-blue-100 text-blue-800">
                          SUBMITTED
                        </span>
                      </DialogTitle>
                      <DialogDescription>
                        {`${label} • Ref: ${viewing.data.id} • ${new Date(viewing.data.date).toLocaleDateString('en-IN')}`}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                        <p className="text-xs font-semibold text-gray-500">SALE TYPE</p>
                        <p className="text-xl font-bold text-gray-900 mt-1 capitalize">{viewing.data.saleType}</p>
                        <p className="text-xs text-gray-500 mt-1">Primary / Secondary</p>
                      </div>
                      <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                        <p className="text-xs font-semibold text-gray-500">ITEMS</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{items.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Distinct products</p>
                      </div>
                      <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                        <p className="text-xs font-semibold text-gray-500">{viewing.type === 'shop' ? 'TOTAL QTY' : 'TOTAL CASES'}</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {viewing.type === 'shop'
                            ? items.reduce((sum, i) => sum + Number(i.quantity || 0), 0)
                            : items.reduce((sum, i) => sum + Number(i.quantityCases || 0), 0)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{viewing.type === 'shop' ? 'Total pieces' : 'Total cases'}</p>
                      </div>
                      <div className="border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                        <p className="text-xs font-semibold text-gray-500">TOTAL VALUE</p>
                        <p className="text-xl font-bold text-[#433228] mt-1">₹{Number(totalValue || 0).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-500 mt-1">{viewing.type === 'shop' ? 'Qty × MRP' : 'Cases × unit × pieces/case'}</p>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b">
                        <p className="font-semibold text-gray-900">Items</p>
                        <p className="text-xs text-gray-500">Product-level breakdown</p>
                      </div>
                      <div className="p-4">
                        <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Image</TableHead>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-right">{viewing.type === 'shop' ? 'Qty (pcs)' : 'Cases'}</TableHead>
                              <TableHead className="text-right">{viewing.type === 'shop' ? 'MRP' : 'Unit Price'}</TableHead>
                              <TableHead className="text-right">{viewing.type === 'shop' ? '-' : 'Pieces/Case'}</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewSalesDialogItemsPagination.paginatedItems.map((i) => {
                              const p = getProduct(i.productId)
                              const img = p?.image
                              const name = p?.name || `#${i.productId}`
                              const rowTotal =
                                viewing.type === 'shop'
                                  ? Number(i.quantity || 0) * Number(i.mrp || 0)
                                  : Number(i.quantityCases || 0) * Number(i.unitPrice || 0) * Number(i.piecesPerCase || 0)
                              return (
                                <TableRow key={`${viewing.data.id}-${i.productId}`}>
                                  <TableCell>
                                    {img ? (
                                      <img src={img} alt={name} className="h-10 w-10 rounded object-cover border bg-gray-100" />
                                    ) : (
                                      <div className="h-10 w-10 rounded border bg-gray-100" />
                                    )}
                                  </TableCell>
                                  <TableCell className="font-medium">{name}</TableCell>
                                  <TableCell className="text-right">{viewing.type === 'shop' ? i.quantity : i.quantityCases}</TableCell>
                                  <TableCell className="text-right">₹{Number((viewing.type === 'shop' ? i.mrp : i.unitPrice) || 0).toLocaleString('en-IN')}</TableCell>
                                  <TableCell className="text-right">{viewing.type === 'shop' ? '-' : i.piecesPerCase}</TableCell>
                                  <TableCell className="text-right font-semibold">₹{Number(rowTotal || 0).toLocaleString('en-IN')}</TableCell>
                                </TableRow>
                              )
                            })}
                            <TableRow className="font-semibold bg-gray-50">
                              <TableCell colSpan={5}>Total</TableCell>
                              <TableCell className="text-right">₹{Number(totalValue || 0).toLocaleString('en-IN')}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        {items.length > 0 && <TablePaginationControls {...viewSalesDialogItemsPagination} />}
                        </>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                        Close
                      </Button>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SuperStockistReports
