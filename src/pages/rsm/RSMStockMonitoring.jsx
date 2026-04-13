import { useMemo, useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Package, Warehouse, Store, LayoutGrid } from 'lucide-react'
import ExportButtons from '../../components/common/ExportButtons'
import {
  MOCK_SS_LIST,
  MOCK_HIERARCHY,
  MOCK_SHOPS,
  getRsmStockDetailLines,
  RSM_STOCK_CATEGORY_FILTERS,
} from '../../data/mockData'

const tabConfig = [
  {
    value: 'ss',
    label: 'Super Stockist',
    icon: Warehouse,
    entityType: 'ss',
    description: 'Stock by super stockist — category-wise pieces and value',
  },
  {
    value: 'distributor',
    label: 'Distributor',
    icon: Package,
    entityType: 'distributor',
    description: 'Stock by distributor — category-wise pieces and value',
  },
  {
    value: 'shop',
    label: 'Shop',
    icon: Store,
    entityType: 'shop',
    description: 'Stock by retail shop — category-wise pieces and value',
  },
]

function StockPanel({ entityType, lines, categoryFilter, entityLabel }) {
  const filteredLines = useMemo(() => {
    if (!categoryFilter) return lines
    return lines.filter((r) => r.category === categoryFilter)
  }, [lines, categoryFilter])

  const categorySummary = useMemo(() => {
    const map = {}
    filteredLines.forEach((row) => {
      if (!map[row.category]) {
        map[row.category] = { pieces: 0, value: 0 }
      }
      map[row.category].pieces += row.pieces
      map[row.category].value += row.value
    })
    return Object.entries(map)
      .map(([category, v]) => ({ category, pieces: v.pieces, value: v.value }))
      .sort((a, b) => a.category.localeCompare(b.category))
  }, [filteredLines])

  const totals = useMemo(
    () =>
      filteredLines.reduce(
        (acc, r) => {
          acc.pieces += r.pieces
          acc.value += r.value
          return acc
        },
        { pieces: 0, value: 0 },
      ),
    [filteredLines],
  )

  const categoryPagination = useTablePagination(categorySummary)
  const productPagination = useTablePagination(filteredLines)

  const exportRows = useMemo(
    () =>
      filteredLines.map((r) => ({
        'Product Name': r.productName,
        Code: r.productCode,
        Category: r.category,
        Pieces: r.pieces,
        'Unit Price (₹)': r.unitPrice,
        'Value (₹)': r.value,
      })),
    [filteredLines],
  )

  if (!entityLabel) {
    return (
      <p className="text-center text-gray-500 py-10">
        Select an entity above to load stock details.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LayoutGrid className="h-5 w-5 text-[#433228]" />
            Category summary
          </CardTitle>
          <CardDescription>Total pieces and stock value by product category</CardDescription>
        </CardHeader>
        <CardContent>
          {categorySummary.length === 0 ? (
            <p className="text-sm text-gray-500">No rows for the selected category filter.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Pieces</TableHead>
                  <TableHead className="text-right">Value (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryPagination.paginatedItems.map((row) => (
                  <TableRow key={row.category}>
                    <TableCell className="font-medium">{row.category}</TableCell>
                    <TableCell className="text-right">
                      {row.pieces.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{row.value.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {totals.pieces.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{totals.value.toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
          {categorySummary.length > 0 && <TablePaginationControls {...categoryPagination} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg">Product-wise stock</CardTitle>
            <CardDescription>
              {entityLabel} — SKU pieces and value (unit price × pieces)
            </CardDescription>
          </div>
          <ExportButtons
            rows={exportRows}
            csvFilename={`RSM_Stock_${entityType}_${new Date().toISOString().split('T')[0]}.csv`}
            xlsxFilename={`RSM_Stock_${entityType}_${new Date().toISOString().split('T')[0]}.xlsx`}
            xlsxSheetName="Stock"
            disabled={filteredLines.length === 0}
          />
        </CardHeader>
        <CardContent>
          {filteredLines.length === 0 ? (
            <p className="text-sm text-gray-500">No product lines to show.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Pieces</TableHead>
                      <TableHead className="text-right">Unit price (₹)</TableHead>
                      <TableHead className="text-right">Value (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productPagination.paginatedItems.map((r) => (
                      <TableRow key={r.productId}>
                        <TableCell className="font-medium">{r.productName}</TableCell>
                        <TableCell className="text-gray-600">{r.productCode}</TableCell>
                        <TableCell>{r.category}</TableCell>
                        <TableCell className="text-right">
                          {r.pieces.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{r.unitPrice.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{r.value.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredLines.length > 0 && <TablePaginationControls {...productPagination} />}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const RSMStockMonitoring = () => {
  const [activeTab, setActiveTab] = useState('ss')
  const [selectedSs, setSelectedSs] = useState('')
  const [selectedDistributor, setSelectedDistributor] = useState('')
  const [selectedShop, setSelectedShop] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const ssLines = useMemo(
    () => getRsmStockDetailLines('ss', selectedSs),
    [selectedSs],
  )
  const distLines = useMemo(
    () => getRsmStockDetailLines('distributor', selectedDistributor),
    [selectedDistributor],
  )
  const shopLines = useMemo(
    () => getRsmStockDetailLines('shop', selectedShop),
    [selectedShop],
  )

  const ssLabel = selectedSs
    ? MOCK_SS_LIST.find((s) => s.id === parseInt(selectedSs, 10))
    : null
  const distLabel = selectedDistributor
    ? MOCK_HIERARCHY.distributors?.find((d) => d.id === parseInt(selectedDistributor, 10))
    : null
  const shopLabel = selectedShop
    ? MOCK_SHOPS.find((s) => s.id === parseInt(selectedShop, 10))
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stock Monitoring</h1>
        <p className="text-gray-600 mt-2">
          View inventory across super stockists, distributors, and shops — category-wise
          pieces and stock value.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto flex-wrap gap-1 p-1">
          {tabConfig.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="flex items-center gap-2 py-2"
            >
              <t.icon className="h-4 w-4 shrink-0" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfig.map((t) => (
          <TabsContent key={t.value} value={t.value} className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <t.icon className="h-5 w-5 text-[#433228]" />
                  {t.label} stock
                </CardTitle>
                <CardDescription>{t.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {t.value === 'ss' && (
                    <div className="space-y-2">
                      <Label htmlFor="rsm-ss">Super Stockist *</Label>
                      <Select
                        id="rsm-ss"
                        value={selectedSs}
                        onChange={(e) => setSelectedSs(e.target.value)}
                      >
                        <option value="">Select Super Stockist</option>
                        {MOCK_SS_LIST.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code}) — {s.city}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}
                  {t.value === 'distributor' && (
                    <div className="space-y-2">
                      <Label htmlFor="rsm-dist">Distributor *</Label>
                      <Select
                        id="rsm-dist"
                        value={selectedDistributor}
                        onChange={(e) => setSelectedDistributor(e.target.value)}
                      >
                        <option value="">Select Distributor</option>
                        {(MOCK_HIERARCHY.distributors || []).map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} {d.code ? `(${d.code})` : ''}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}
                  {t.value === 'shop' && (
                    <div className="space-y-2">
                      <Label htmlFor="rsm-shop">Shop *</Label>
                      <Select
                        id="rsm-shop"
                        value={selectedShop}
                        onChange={(e) => setSelectedShop(e.target.value)}
                      >
                        <option value="">Select Shop</option>
                        {MOCK_SHOPS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} — {s.address}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="rsm-cat">Category</Label>
                    <Select
                      id="rsm-cat"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All categories</option>
                      {RSM_STOCK_CATEGORY_FILTERS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Values shown are illustrative (mock). Replace with API data when
                  integrating backend.
                </p>
              </CardContent>
            </Card>

            {t.value === 'ss' && (
              <StockPanel
                entityType="ss"
                lines={ssLines}
                categoryFilter={categoryFilter}
                entityLabel={
                  ssLabel ? `${ssLabel.name} (${ssLabel.code})` : ''
                }
              />
            )}
            {t.value === 'distributor' && (
              <StockPanel
                entityType="distributor"
                lines={distLines}
                categoryFilter={categoryFilter}
                entityLabel={distLabel ? distLabel.name : ''}
              />
            )}
            {t.value === 'shop' && (
              <StockPanel
                entityType="shop"
                lines={shopLines}
                categoryFilter={categoryFilter}
                entityLabel={
                  shopLabel
                    ? `${shopLabel.name} — ${shopLabel.address}`
                    : ''
                }
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default RSMStockMonitoring
