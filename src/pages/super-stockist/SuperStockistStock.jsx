import { useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Package, Warehouse, ShoppingBag, Store } from 'lucide-react'
import ExportButtons from '../../components/common/ExportButtons'

// Mock data
const MOCK_SS_STOCK = [
  { id: 1, name: 'Gold Soap', category: 'Samudhrika lakshau', quantity: 150, unit: 'cases', piecesPerCase: 60 },
  { id: 2, name: 'Silver Soap', category: 'Samudhrika lakshau', quantity: 120, unit: 'cases', piecesPerCase: 60 },
  { id: 3, name: 'Herbal Face Wash', category: 'Herbal concepts', quantity: 80, unit: 'cases', piecesPerCase: 24 },
  { id: 4, name: 'Herbal Cream', category: 'Herbal concepts', quantity: 90, unit: 'cases', piecesPerCase: 12 },
]

const MOCK_FACTORY_STOCK = [
  { id: 1, name: 'Gold Soap', category: 'Samudhrika lakshau', quantity: 500, unit: 'cases' },
  { id: 2, name: 'Silver Soap', category: 'Samudhrika lakshau', quantity: 400, unit: 'cases' },
  { id: 3, name: 'Herbal Face Wash', category: 'Herbal concepts', quantity: 300, unit: 'cases' },
  { id: 4, name: 'Herbal Cream', category: 'Herbal concepts', quantity: 250, unit: 'cases' },
]

const MOCK_DISTRIBUTORS = [
  { id: 1, name: 'Shraam', area: 'Sivakasi' },
  { id: 2, name: 'Raj Distributors', area: 'Madurai' },
  { id: 3, name: 'Kumar Agencies', area: 'Coimbatore' },
]

const MOCK_DISTRIBUTOR_STOCK = {
  1: [
    { id: 1, name: 'Gold Soap', quantity: 50, unit: 'cases' },
    { id: 2, name: 'Silver Soap', quantity: 40, unit: 'cases' },
  ],
  2: [
    { id: 1, name: 'Gold Soap', quantity: 60, unit: 'cases' },
    { id: 3, name: 'Herbal Face Wash', quantity: 30, unit: 'cases' },
  ],
  3: [
    { id: 2, name: 'Silver Soap', quantity: 35, unit: 'cases' },
    { id: 4, name: 'Herbal Cream', quantity: 25, unit: 'cases' },
  ],
}

const MOCK_SHOPS = {
  1: [
    { id: 1, name: 'Beauty Zone Sivakasi', stock: [{ productId: 1, productName: 'Gold Soap', closingStock: 15 }] },
    { id: 2, name: 'Cosmetics Hub Sivakasi', stock: [{ productId: 2, productName: 'Silver Soap', closingStock: 12 }] },
  ],
  2: [
    { id: 3, name: 'Beauty Zone Madurai', stock: [{ productId: 1, productName: 'Gold Soap', closingStock: 20 }] },
    { id: 4, name: 'Cosmetics Hub Madurai', stock: [{ productId: 3, productName: 'Herbal Face Wash', closingStock: 10 }] },
  ],
  3: [
    { id: 5, name: 'Beauty Zone Coimbatore', stock: [{ productId: 2, productName: 'Silver Soap', closingStock: 18 }] },
    { id: 6, name: 'Cosmetics Hub Coimbatore', stock: [{ productId: 4, productName: 'Herbal Cream', closingStock: 8 }] },
  ],
}

const SuperStockistStock = () => {
  const [activeTab, setActiveTab] = useState('ss-stock')
  const [selectedDistributor, setSelectedDistributor] = useState('')
  const [selectedShop, setSelectedShop] = useState('')

  const selectedDistributorStock = selectedDistributor
    ? MOCK_DISTRIBUTOR_STOCK[parseInt(selectedDistributor)] || []
    : []

  const selectedShopStock = selectedDistributor && selectedShop
    ? MOCK_SHOPS[parseInt(selectedDistributor)]?.find(s => s.id === parseInt(selectedShop))?.stock || []
    : []

  const ssStockPagination = useTablePagination(MOCK_SS_STOCK)
  const factoryStockPagination = useTablePagination(MOCK_FACTORY_STOCK)
  const distributorStockPagination = useTablePagination(selectedDistributorStock)
  const shopStockPagination = useTablePagination(selectedShopStock)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stock Monitoring</h1>
        <p className="text-gray-600 mt-2">Monitor inventory levels across the supply chain</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ss-stock">Current SS Stock</TabsTrigger>
          <TabsTrigger value="factory-stock">Factory Stock</TabsTrigger>
          <TabsTrigger value="distributor-stock">Distributor Stock</TabsTrigger>
          <TabsTrigger value="shop-stock">Shop-wise Stock</TabsTrigger>
        </TabsList>

        {/* Current SS Stock */}
        <TabsContent value="ss-stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#433228]" />
                Current SS Stock
              </CardTitle>
              <CardDescription>Your current inventory levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <ExportButtons
                  rows={MOCK_SS_STOCK.map((item) => ({
                    'Product Name': item.name,
                    Category: item.category,
                    Quantity: `${item.quantity} ${item.unit}`,
                    'Pieces/Case': item.piecesPerCase,
                    'Total Pieces': item.quantity * item.piecesPerCase,
                  }))}
                  csvFilename={`SS_Stock_${new Date().toISOString().split('T')[0]}.csv`}
                  xlsxFilename={`SS_Stock_${new Date().toISOString().split('T')[0]}.xlsx`}
                  xlsxSheetName="SS Stock"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total Pieces</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ssStockPagination.paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell>{item.quantity * item.piecesPerCase} pieces</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {MOCK_SS_STOCK.length > 0 && <TablePaginationControls {...ssStockPagination} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Factory Stock */}
        <TabsContent value="factory-stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-[#433228]" />
                Factory Stock
              </CardTitle>
              <CardDescription>Available stock at factory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <ExportButtons
                  rows={MOCK_FACTORY_STOCK.map((item) => ({
                    'Product Name': item.name,
                    Category: item.category,
                    'Available Quantity': `${item.quantity} ${item.unit}`,
                  }))}
                  csvFilename={`Factory_Stock_${new Date().toISOString().split('T')[0]}.csv`}
                  xlsxFilename={`Factory_Stock_${new Date().toISOString().split('T')[0]}.xlsx`}
                  xlsxSheetName="Factory Stock"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Available Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factoryStockPagination.paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {MOCK_FACTORY_STOCK.length > 0 && <TablePaginationControls {...factoryStockPagination} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distributor Stock */}
        <TabsContent value="distributor-stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#433228]" />
                Distributor Stock
              </CardTitle>
              <CardDescription>Stock levels at distributor level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="distributor-select">Select Distributor</Label>
                  <Select
                    id="distributor-select"
                    value={selectedDistributor}
                    onChange={(e) => {
                      setSelectedDistributor(e.target.value)
                      setSelectedShop('')
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

                {selectedDistributor && selectedDistributorStock.length > 0 && (
                  <>
                    <div className="flex justify-end">
                      <ExportButtons
                        rows={selectedDistributorStock.map((item) => ({
                          Distributor: MOCK_DISTRIBUTORS.find((d) => d.id === parseInt(selectedDistributor))?.name || '',
                          Area: MOCK_DISTRIBUTORS.find((d) => d.id === parseInt(selectedDistributor))?.area || '',
                          'Product Name': item.name,
                          Quantity: `${item.quantity} ${item.unit}`,
                        }))}
                        csvFilename={`Distributor_Stock_${new Date().toISOString().split('T')[0]}.csv`}
                        xlsxFilename={`Distributor_Stock_${new Date().toISOString().split('T')[0]}.xlsx`}
                        xlsxSheetName="Distributor Stock"
                      />
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {distributorStockPagination.paginatedItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.quantity} {item.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {selectedDistributor && selectedDistributorStock.length > 0 && (
                      <TablePaginationControls {...distributorStockPagination} />
                    )}
                  </>
                )}

                {selectedDistributor && selectedDistributorStock.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No stock data available for this distributor</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shop-wise Stock */}
        <TabsContent value="shop-stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-[#433228]" />
                Shop-wise Stock
              </CardTitle>
              <CardDescription>View closing stock list by selecting distributor and shop</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distributor-shop">Select Distributor</Label>
                    <Select
                      id="distributor-shop"
                      value={selectedDistributor}
                      onChange={(e) => {
                        setSelectedDistributor(e.target.value)
                        setSelectedShop('')
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
                    <Label htmlFor="shop-select">Select Shop</Label>
                    <Select
                      id="shop-select"
                      value={selectedShop}
                      onChange={(e) => setSelectedShop(e.target.value)}
                      disabled={!selectedDistributor}
                    >
                      <option value="">Select Shop</option>
                      {selectedDistributor && MOCK_SHOPS[parseInt(selectedDistributor)]?.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {selectedDistributor && selectedShop && selectedShopStock.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Closing Stock List</h3>
                      <ExportButtons
                        rows={selectedShopStock.map((item) => ({
                          Distributor: MOCK_DISTRIBUTORS.find((d) => d.id === parseInt(selectedDistributor))?.name || '',
                          Shop: MOCK_SHOPS[parseInt(selectedDistributor)]?.find((s) => s.id === parseInt(selectedShop))?.name || '',
                          'Product Name': item.productName,
                          'Closing Stock (pcs)': item.closingStock,
                        }))}
                        csvFilename={`Shop_Stock_${new Date().toISOString().split('T')[0]}.csv`}
                        xlsxFilename={`Shop_Stock_${new Date().toISOString().split('T')[0]}.xlsx`}
                        xlsxSheetName="Shop Stock"
                      />
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Closing Stock</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shopStockPagination.paginatedItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell>{item.closingStock} pieces</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {selectedDistributor && selectedShop && selectedShopStock.length > 0 && (
                      <TablePaginationControls {...shopStockPagination} />
                    )}
                  </div>
                )}

                {selectedDistributor && selectedShop && selectedShopStock.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No stock data available for this shop</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SuperStockistStock
