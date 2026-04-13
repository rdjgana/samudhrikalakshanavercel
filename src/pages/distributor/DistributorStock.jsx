import { useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { useSelector } from 'react-redux'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Package, Warehouse, Store } from 'lucide-react'
import { MOCK_PRODUCTS, MOCK_SHOPS, MOCK_SS_LIST } from '../../data/mockData'

// Mock Distributor Stock
const MOCK_DISTRIBUTOR_STOCK = MOCK_PRODUCTS.map((product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  quantity: Math.floor(Math.random() * 100) + 50,
  unit: 'cases',
  piecesPerCase: product.category === 'Personal Care' && product.name === 'Soap' ? 60 : 
                 product.category === 'Hair Care' ? 24 : 12,
}))

// Mock SS Stock
const MOCK_SS_STOCK_VIEW = MOCK_PRODUCTS.map((product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  quantity: Math.floor(Math.random() * 200) + 100,
  unit: 'cases',
}))

// Mock Shops Stock
const getShopsStock = () => {
  const shopsStock = {}
  MOCK_SHOPS.forEach(shop => {
    shopsStock[shop.id] = MOCK_PRODUCTS.slice(0, 4).map((product) => ({
      id: product.id,
      name: product.name,
      quantity: Math.floor(Math.random() * 30) + 10,
      unit: 'pieces',
    }))
  })
  return shopsStock
}

const MOCK_SHOPS_STOCK = getShopsStock()

const DistributorStock = () => {
  const { user } = useSelector((state) => state.auth)
  const [selectedShop, setSelectedShop] = useState('')

  // Get shops assigned to this distributor
  const assignedShops = MOCK_SHOPS.filter(shop => shop.distributorId === user?.distributorId || shop.distributorId === 1)

  const selectedShopStock = selectedShop ? MOCK_SHOPS_STOCK[parseInt(selectedShop)] || [] : []

  const ownStockPagination = useTablePagination(MOCK_DISTRIBUTOR_STOCK)
  const ssStockViewPagination = useTablePagination(MOCK_SS_STOCK_VIEW)
  const shopStockPagination = useTablePagination(selectedShopStock)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stock Monitoring</h1>
        <p className="text-gray-600 mt-2">Monitor inventory levels across the supply chain</p>
      </div>

      <Tabs defaultValue="own-stock">
        <TabsList>
          <TabsTrigger value="own-stock">Current Distributor Stock</TabsTrigger>
          <TabsTrigger value="ss-stock">SS Stock</TabsTrigger>
          <TabsTrigger value="shops-stock">Shops Stock</TabsTrigger>
        </TabsList>

        {/* Own Stock */}
        <TabsContent value="own-stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#433228]" />
                Current Distributor Stock
              </CardTitle>
              <CardDescription>Your current inventory levels</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {ownStockPagination.paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell>{item.quantity * item.piecesPerCase} pieces</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {MOCK_DISTRIBUTOR_STOCK.length > 0 && <TablePaginationControls {...ownStockPagination} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SS Stock */}
        <TabsContent value="ss-stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-[#433228]" />
                SS Stock (Super Stockist)
              </CardTitle>
              <CardDescription>Available stock at Super Stockist level</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Available Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ssStockViewPagination.paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {MOCK_SS_STOCK_VIEW.length > 0 && <TablePaginationControls {...ssStockViewPagination} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shops Stock */}
        <TabsContent value="shops-stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-[#433228]" />
                Shops Stock
              </CardTitle>
              <CardDescription>Stock levels at shops assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shop-select">Select Shop</Label>
                  <Select
                    id="shop-select"
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                  >
                    <option value="">Select Shop</option>
                    {assignedShops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name} - {shop.address}
                      </option>
                    ))}
                  </Select>
                </div>

                {selectedShop && selectedShopStock.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shopStockPagination.paginatedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {selectedShop && selectedShopStock.length > 0 && <TablePaginationControls {...shopStockPagination} />}

                {selectedShop && selectedShopStock.length === 0 && (
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

export default DistributorStock
