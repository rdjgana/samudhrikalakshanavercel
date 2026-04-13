import { useMemo, useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { FileText, Download, ShoppingCart, Plus, Minus, Trash2, Eye } from 'lucide-react'
import { COSMETICS_CATEGORIES, getProductsByCategory, MOCK_PRODUCTS } from '../../data/mockData'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'

// Purchase from SS: each case = 6 pieces; MRP on product is per piece
const PURCHASE_PIECES_PER_CASE = 6

const purchaseLineTotal = (cases, piecePrice) =>
  Number(cases || 0) * PURCHASE_PIECES_PER_CASE * Number(piecePrice || 0)

// Mock Sales Report Data
const MOCK_SALES_REPORT = {
  primary: [
    { item: 'Face Wash', quantity: 25, value: 56250 },
    { item: 'Body Lotion', quantity: 20, value: 54000 },
    { item: 'Soap', quantity: 30, value: 81000 },
  ],
  secondary: [
    { item: 'Face Cream', quantity: 15, value: 60750 },
    { item: 'Hair Oil', quantity: 18, value: 24300 },
  ],
}

// Mock Purchase Report Data (line items for View detail)
const MOCK_PURCHASE_REPORT = [
  {
    date: '2026-01-15',
    ssName: 'Beauty Cosmetics Super Stockist',
    items: 'Face Wash, Body Lotion',
    quantity: 45,
    value: 73500,
    lineItems: [
      { productId: 1, productName: 'Face Wash', productCode: 'FC001', category: 'Face Care', quantity: 25, mrpPerPiece: 250, total: 37500 },
      { productId: 5, productName: 'Body Lotion', productCode: 'BC001', category: 'Body Care', quantity: 20, mrpPerPiece: 300, total: 36000 },
    ],
  },
  {
    date: '2026-01-20',
    ssName: 'Beauty Cosmetics Super Stockist',
    items: 'Soap, Hand Wash',
    quantity: 60,
    value: 28500,
    lineItems: [
      { productId: 13, productName: 'Soap', productCode: 'PC001', category: 'Personal Care', quantity: 35, mrpPerPiece: 50, total: 10500 },
      { productId: 14, productName: 'Hand Wash', productCode: 'PC002', category: 'Personal Care', quantity: 25, mrpPerPiece: 120, total: 18000 },
    ],
  },
  {
    date: '2026-01-25',
    ssName: 'Glow Beauty Wholesale',
    items: 'Face Cream, Hair Oil',
    quantity: 35,
    value: 58500,
    lineItems: [
      { productId: 2, productName: 'Face Cream', productCode: 'FC002', category: 'Face Care', quantity: 15, mrpPerPiece: 450, total: 40500 },
      { productId: 11, productName: 'Hair Oil', productCode: 'HC003', category: 'Hair Care', quantity: 20, mrpPerPiece: 150, total: 18000 },
    ],
  },
]

const currencyINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const downloadCSV = (filename, rows) => {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell ?? ''
          const str = String(value)
          if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`
          return str
        })
        .join(','),
    )
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const DistributorReports = () => {
  const [activeTab, setActiveTab] = useState('sales')
  const [salesReportData, setSalesReportData] = useState({
    saleType: 'both', // 'primary', 'secondary', 'both'
    startDate: '',
    endDate: '',
  })
  const [selectedPurchaseCategory, setSelectedPurchaseCategory] = useState('Face Care')
  const [purchaseCart, setPurchaseCart] = useState({}) // { productId: { product, quantity } }
  const [purchaseReports, setPurchaseReports] = useState(() =>
    MOCK_PURCHASE_REPORT.map((r) => ({
      id: `seed-${r.date}-${r.ssName}`,
      date: r.date,
      ssName: r.ssName,
      productsText: r.items,
      quantityCases: r.quantity,
      totalPieces: r.quantity * PURCHASE_PIECES_PER_CASE,
      totalValue: r.value,
      createdAt: new Date(r.date).toISOString(),
      source: 'seed',
      products: (r.lineItems || []).map((li) => ({
        productId: li.productId,
        productName: li.productName,
        productCode: li.productCode,
        category: li.category,
        quantity: li.quantity,
        piecesPerCase: PURCHASE_PIECES_PER_CASE,
        mrp: li.mrpPerPiece,
        total: li.total,
      })),
    })),
  )
  const [showPurchaseDetailDialog, setShowPurchaseDetailDialog] = useState(false)
  const [viewingPurchase, setViewingPurchase] = useState(null)
  const [purchaseMeta, setPurchaseMeta] = useState({
    ssName: 'Beauty Cosmetics Super Stockist',
    date: new Date().toISOString().split('T')[0],
  })

  const showSalesResults = Boolean(salesReportData.startDate && salesReportData.endDate)

  const salesPrimaryTotals = useMemo(() => {
    const qty = MOCK_SALES_REPORT.primary.reduce((sum, i) => sum + (i.quantity || 0), 0)
    const value = MOCK_SALES_REPORT.primary.reduce((sum, i) => sum + (i.value || 0), 0)
    return { qty, value }
  }, [])

  const salesSecondaryTotals = useMemo(() => {
    const qty = MOCK_SALES_REPORT.secondary.reduce((sum, i) => sum + (i.quantity || 0), 0)
    const value = MOCK_SALES_REPORT.secondary.reduce((sum, i) => sum + (i.value || 0), 0)
    return { qty, value }
  }, [])

  const primarySalesPagination = useTablePagination(MOCK_SALES_REPORT.primary)
  const secondarySalesPagination = useTablePagination(MOCK_SALES_REPORT.secondary)
  const purchaseHistoryPagination = useTablePagination(purchaseReports)
  const purchaseDetailPagination = useTablePagination(viewingPurchase?.products ?? [])

  const purchaseCartTotals = useMemo(() => {
    const totalQty = Object.values(purchaseCart).reduce((sum, item) => sum + (item.quantity || 0), 0)
    const totalPieces = totalQty * PURCHASE_PIECES_PER_CASE
    const totalValue = Object.values(purchaseCart).reduce(
      (sum, item) => sum + purchaseLineTotal(item.quantity, item.product?.price),
      0,
    )
    return { totalQty, totalPieces, totalValue }
  }, [purchaseCart])

  const handleGenerateSalesReport = () => {
    if (!salesReportData.startDate || !salesReportData.endDate) {
      alert('Please select date range')
      return
    }
    alert('Sales report generated successfully!')
  }

  const addPurchaseToCart = (product) => {
    setPurchaseCart((prev) => {
      const existing = prev[product.id]
      const nextQty = (existing?.quantity || 0) + 1
      return {
        ...prev,
        [product.id]: { product, quantity: nextQty },
      }
    })
  }

  const updatePurchaseQuantity = (productId, newQuantity) => {
    const qty = Number(newQuantity)
    if (!Number.isFinite(qty) || qty < 0) return
    setPurchaseCart((prev) => {
      const existing = prev[productId]
      if (!existing) return prev
      if (qty === 0) {
        const copy = { ...prev }
        delete copy[productId]
        return copy
      }
      return {
        ...prev,
        [productId]: { ...existing, quantity: qty },
      }
    })
  }

  const removePurchaseFromCart = (productId) => {
    setPurchaseCart((prev) => {
      const copy = { ...prev }
      delete copy[productId]
      return copy
    })
  }

  const handleSubmitPurchase = () => {
    if (!purchaseMeta.ssName) {
      alert('Please select SS Name')
      return
    }
    if (!purchaseMeta.date) {
      alert('Please select Purchase Date')
      return
    }
    if (Object.keys(purchaseCart).length === 0) {
      alert('Please add products to cart')
      return
    }

    const products = Object.values(purchaseCart).map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      productCode: item.product.code,
      category: item.product.category,
      quantity: item.quantity,
      piecesPerCase: PURCHASE_PIECES_PER_CASE,
      mrp: item.product.price,
      total: purchaseLineTotal(item.quantity, item.product.price),
    }))

    const totalValue = products.reduce((sum, p) => sum + (p.total || 0), 0)
    const quantityCases = products.reduce((sum, p) => sum + (p.quantity || 0), 0)

    const report = {
      id: Date.now(),
      date: purchaseMeta.date,
      ssName: purchaseMeta.ssName,
      productsText: products.map((p) => p.productName).join(', '),
      products,
      quantityCases,
      totalPieces: quantityCases * PURCHASE_PIECES_PER_CASE,
      totalValue,
      createdAt: new Date().toISOString(),
      source: 'submitted',
    }

    setPurchaseReports((prev) => [report, ...prev])
    setPurchaseCart({})
    alert('Purchase submitted successfully!')
  }

  const getPurchaseLineItems = (report) => {
    if (!report?.products?.length) return []
    return report.products
  }

  const handleViewPurchaseDetail = (report) => {
    setViewingPurchase(report)
    setShowPurchaseDetailDialog(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales & Purchase Reports</h1>
        <p className="text-gray-600 mt-2">Generate sales and purchase reports</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sales">My Sales Report</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Report</TabsTrigger>
        </TabsList>

        {/* My Sales Report */}
        <TabsContent value="sales">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filters */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#433228]" />
                    Sales Filters
                  </CardTitle>
                  <CardDescription>Select sale type and date range</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sale-type">Sale Type</Label>
                    <Select
                      id="sale-type"
                      value={salesReportData.saleType}
                      onChange={(e) => setSalesReportData({ ...salesReportData, saleType: e.target.value })}
                    >
                      <option value="both">Both (Primary & Secondary)</option>
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date-sales">Start Date</Label>
                      <Input
                        id="start-date-sales"
                        type="date"
                        value={salesReportData.startDate}
                        onChange={(e) => setSalesReportData({ ...salesReportData, startDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end-date-sales">End Date</Label>
                      <Input
                        id="end-date-sales"
                        type="date"
                        value={salesReportData.endDate}
                        onChange={(e) => setSalesReportData({ ...salesReportData, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateSalesReport}
                    className="w-full bg-[#433228] hover:bg-[#5a4238] text-white"
                  >
                    Generate Report
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setSalesReportData({ saleType: 'both', startDate: '', endDate: '' })}
                  >
                    Reset
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results + Summary */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Sales Report</CardTitle>
                  <CardDescription>Sales made to Shops</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!showSalesResults ? (
                    <div className="text-center py-10 text-gray-500">
                      Select a date range and generate the report to view results.
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-sm text-gray-600">
                          Showing results for <span className="font-medium text-gray-900">{salesReportData.startDate}</span> to{' '}
                          <span className="font-medium text-gray-900">{salesReportData.endDate}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const rows = [
                              ['Sale Type', salesReportData.saleType],
                              ['Start Date', salesReportData.startDate],
                              ['End Date', salesReportData.endDate],
                              [],
                            ]

                            if (salesReportData.saleType === 'primary' || salesReportData.saleType === 'both') {
                              rows.push(['Primary Sales'])
                              rows.push(['Item', 'Quantity', 'Value'])
                              MOCK_SALES_REPORT.primary.forEach((i) => rows.push([i.item, i.quantity, i.value]))
                              rows.push(['Total', salesPrimaryTotals.qty, salesPrimaryTotals.value])
                              rows.push([])
                            }

                            if (salesReportData.saleType === 'secondary' || salesReportData.saleType === 'both') {
                              rows.push(['Secondary Sales'])
                              rows.push(['Item', 'Quantity', 'Value'])
                              MOCK_SALES_REPORT.secondary.forEach((i) => rows.push([i.item, i.quantity, i.value]))
                              rows.push(['Total', salesSecondaryTotals.qty, salesSecondaryTotals.value])
                            }

                            downloadCSV(`Distributor_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`, rows)
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV
                        </Button>
                      </div>

                      {(salesReportData.saleType === 'primary' || salesReportData.saleType === 'both') && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Primary Sales</h4>
                            <div className="text-sm text-gray-600">
                              Total: <span className="font-semibold text-gray-900">{salesPrimaryTotals.qty}</span> |{' '}
                              <span className="font-semibold text-[#433228]">{currencyINR(salesPrimaryTotals.value)}</span>
                            </div>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Value</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {primarySalesPagination.paginatedItems.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{item.item}</TableCell>
                                  <TableCell className="text-right">{item.quantity}</TableCell>
                                  <TableCell className="text-right">{currencyINR(item.value)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {MOCK_SALES_REPORT.primary.length > 0 && (
                            <TablePaginationControls {...primarySalesPagination} />
                          )}
                        </div>
                      )}

                      {(salesReportData.saleType === 'secondary' || salesReportData.saleType === 'both') && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Secondary Sales</h4>
                            <div className="text-sm text-gray-600">
                              Total: <span className="font-semibold text-gray-900">{salesSecondaryTotals.qty}</span> |{' '}
                              <span className="font-semibold text-[#433228]">{currencyINR(salesSecondaryTotals.value)}</span>
                            </div>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Value</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {secondarySalesPagination.paginatedItems.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{item.item}</TableCell>
                                  <TableCell className="text-right">{item.quantity}</TableCell>
                                  <TableCell className="text-right">{currencyINR(item.value)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {MOCK_SALES_REPORT.secondary.length > 0 && (
                            <TablePaginationControls {...secondarySalesPagination} />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Purchase Report */}
        <TabsContent value="purchase">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Selection */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Products to Purchase</CardTitle>
                    <CardDescription>
                      {`MRP is per piece. Each case = ${PURCHASE_PIECES_PER_CASE} pieces — line value = cases × ${PURCHASE_PIECES_PER_CASE} × MRP.`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={selectedPurchaseCategory} onValueChange={setSelectedPurchaseCategory}>
                      <TabsList className="grid w-full grid-cols-5">
                        {COSMETICS_CATEGORIES.map((category) => (
                          <TabsTrigger key={category.id} value={category.name}>
                            {category.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {COSMETICS_CATEGORIES.map((category) => (
                        <TabsContent key={category.id} value={category.name} className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {getProductsByCategory(category.name).map((product) => {
                              const cartItem = purchaseCart[product.id]
                              return (
                                <div key={product.id} className="border rounded-lg p-4 space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-semibold">{product.name}</h4>
                                      <p className="text-xs text-gray-500">Code: {product.code}</p>
                                      <p className="text-xs text-gray-600">{PURCHASE_PIECES_PER_CASE} pcs/case</p>
                                      <p className="text-sm font-medium text-[#433228] mt-1">
                                        MRP (per piece): {currencyINR(product.price)}
                                      </p>
                                    </div>
                                    {product.image && (
                                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between">
                                    {cartItem ? (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => updatePurchaseQuantity(product.id, cartItem.quantity - 1)}
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-10 text-center font-semibold">{cartItem.quantity}</span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => updatePurchaseQuantity(product.id, cartItem.quantity + 1)}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button size="sm" onClick={() => addPurchaseToCart(product)}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add
                                      </Button>
                                    )}
                                    <div className="text-sm text-gray-700">
                                      Line:{' '}
                                      <span className="font-semibold">
                                        {currencyINR(purchaseLineTotal(cartItem?.quantity || 0, product.price))}
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
                      Cart ({Object.keys(purchaseCart).length})
                    </CardTitle>
                    <CardDescription>{`Cases × ${PURCHASE_PIECES_PER_CASE} pieces × MRP (per piece)`}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-2">
                        <Label>SS Name *</Label>
                        <Select
                          value={purchaseMeta.ssName}
                          onChange={(e) => setPurchaseMeta({ ...purchaseMeta, ssName: e.target.value })}
                        >
                          <option value="Beauty Cosmetics Super Stockist">Beauty Cosmetics Super Stockist</option>
                          <option value="Glow Beauty Wholesale">Glow Beauty Wholesale</option>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Purchase Date *</Label>
                        <Input
                          type="date"
                          value={purchaseMeta.date}
                          onChange={(e) => setPurchaseMeta({ ...purchaseMeta, date: e.target.value })}
                        />
                      </div>
                    </div>

                    {Object.keys(purchaseCart).length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Cart is empty</p>
                    ) : (
                      <>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {Object.values(purchaseCart).map((item) => (
                            <div key={item.product.id} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.product.name}</p>
                                  <p className="text-xs text-gray-500">{item.product.code}</p>
                                  <p className="text-xs text-gray-600">
                                    {PURCHASE_PIECES_PER_CASE} pcs/case • MRP (per piece): {currencyINR(item.product.price)}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removePurchaseFromCart(item.product.id)}
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
                                    onClick={() => updatePurchaseQuantity(item.product.id, item.quantity - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-10 text-center font-semibold">{item.quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updatePurchaseQuantity(item.product.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-sm font-semibold">{currencyINR(purchaseLineTotal(item.quantity, item.product.price))}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t pt-4 space-y-3">
                          <div className="flex justify-between font-semibold">
                            <span>Total Qty (cases):</span>
                            <span className="text-gray-900">{purchaseCartTotals.totalQty}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Total pieces ({PURCHASE_PIECES_PER_CASE} pcs/case):</span>
                            <span className="font-medium text-gray-900">{purchaseCartTotals.totalPieces}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Total Value:</span>
                            <span className="text-lg text-[#433228]">{currencyINR(purchaseCartTotals.totalValue)}</span>
                          </div>

                          <Button
                            onClick={handleSubmitPurchase}
                            className="w-full bg-[#433228] hover:bg-[#5a4238]"
                          >
                            Submit Purchase
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Submitted Purchases */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle>Purchase History</CardTitle>
                    <CardDescription>{`Each case = ${PURCHASE_PIECES_PER_CASE} pieces. Value = cases × ${PURCHASE_PIECES_PER_CASE} × MRP (per piece).`}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const rows = [
                        [
                          'Date',
                          'SS Name',
                          'Products',
                          'Quantity (cases)',
                          'Pieces/case',
                          'Total pieces',
                          'Value',
                        ],
                        ...purchaseReports.map((r) => {
                          const tp = r.totalPieces ?? Number(r.quantityCases || 0) * PURCHASE_PIECES_PER_CASE
                          return [
                            r.date,
                            r.ssName,
                            r.productsText || (r.products ? r.products.map((p) => p.productName).join(', ') : ''),
                            r.quantityCases,
                            PURCHASE_PIECES_PER_CASE,
                            tp,
                            r.totalValue,
                          ]
                        }),
                      ]
                      downloadCSV(`Distributor_Purchase_History_${new Date().toISOString().split('T')[0]}.csv`, rows)
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>SS Name</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead className="text-right">Cases</TableHead>
                      <TableHead className="text-right">Total pieces</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseHistoryPagination.paginatedItems.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{new Date(r.date).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell className="font-medium">{r.ssName}</TableCell>
                        <TableCell>
                          {r.productsText || (r.products ? r.products.map((p) => p.productName).join(', ') : '-')}
                        </TableCell>
                        <TableCell className="text-right">{r.quantityCases}</TableCell>
                        <TableCell className="text-right">
                          {r.totalPieces ?? Number(r.quantityCases || 0) * PURCHASE_PIECES_PER_CASE}
                        </TableCell>
                        <TableCell className="text-right">{currencyINR(r.totalValue)}</TableCell>
                        <TableCell className="text-right">
                          <Button type="button" variant="outline" size="sm" onClick={() => handleViewPurchaseDetail(r)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {purchaseReports.length > 0 && <TablePaginationControls {...purchaseHistoryPagination} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showPurchaseDetailDialog} onOpenChange={setShowPurchaseDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingPurchase && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>Purchase detail</DialogTitle>
                <DialogDescription>
                  {viewingPurchase.ssName} • {new Date(viewingPurchase.date).toLocaleDateString('en-IN')} • Order{' '}
                  <span className="font-medium text-gray-900">#{viewingPurchase.id}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500">TOTAL CASES</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{viewingPurchase.quantityCases}</p>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500">TOTAL PIECES</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {viewingPurchase.totalPieces ?? Number(viewingPurchase.quantityCases || 0) * PURCHASE_PIECES_PER_CASE}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{`${PURCHASE_PIECES_PER_CASE} pcs/case`}</p>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500">TOTAL VALUE</p>
                  <p className="text-2xl font-bold text-[#433228] mt-1">{currencyINR(viewingPurchase.totalValue)}</p>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500">LINE ITEMS</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{getPurchaseLineItems(viewingPurchase).length}</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <p className="font-semibold text-gray-900">All products</p>
                  <p className="text-xs text-gray-500">{`Value per line = cases × ${PURCHASE_PIECES_PER_CASE} × MRP (per piece)`}</p>
                </div>
                <div className="p-4">
                  {getPurchaseLineItems(viewingPurchase).length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No product lines saved for this entry.</p>
                  ) : (
                    <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[72px]">Image</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Cases</TableHead>
                          <TableHead className="text-right">Pcs/case</TableHead>
                          <TableHead className="text-right">Total pcs</TableHead>
                          <TableHead className="text-right">MRP/piece (₹)</TableHead>
                          <TableHead className="text-right">Line total (₹)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchaseDetailPagination.paginatedItems.map((line, idx) => {
                          const master = MOCK_PRODUCTS.find((p) => p.id === line.productId)
                          const img = master?.image
                          const piecePrice = line.mrp ?? line.mrpPerPiece ?? line.unitPrice
                          const ppc = line.piecesPerCase || PURCHASE_PIECES_PER_CASE
                          const linePieces = Number(line.quantity || 0) * ppc
                          return (
                            <TableRow key={`${line.productId}-${idx}`}>
                              <TableCell>
                                {img ? (
                                  <img src={img} alt={line.productName} className="h-10 w-10 rounded object-cover border bg-gray-100" />
                                ) : (
                                  <div className="h-10 w-10 rounded border bg-gray-100" />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{line.productName}</TableCell>
                              <TableCell className="text-gray-600">{line.productCode || '-'}</TableCell>
                              <TableCell>{line.category || '-'}</TableCell>
                              <TableCell className="text-right">{line.quantity}</TableCell>
                              <TableCell className="text-right">{ppc}</TableCell>
                              <TableCell className="text-right">{linePieces}</TableCell>
                              <TableCell className="text-right">{currencyINR(piecePrice)}</TableCell>
                              <TableCell className="text-right font-semibold">{currencyINR(line.total)}</TableCell>
                            </TableRow>
                          )
                        })}
                        <TableRow className="bg-gray-50 font-semibold">
                          <TableCell colSpan={4}>Total</TableCell>
                          <TableCell className="text-right">{viewingPurchase.quantityCases}</TableCell>
                          <TableCell />
                          <TableCell className="text-right">
                            {viewingPurchase.totalPieces ?? Number(viewingPurchase.quantityCases || 0) * PURCHASE_PIECES_PER_CASE}
                          </TableCell>
                          <TableCell />
                          <TableCell className="text-right">{currencyINR(viewingPurchase.totalValue)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    {getPurchaseLineItems(viewingPurchase).length > 0 && (
                      <TablePaginationControls {...purchaseDetailPagination} />
                    )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={() => setShowPurchaseDetailDialog(false)}>
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

export default DistributorReports
