import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Edit, Save, X, Package, FileText, Ban, Upload } from 'lucide-react'
import { MOCK_PRODUCTS } from '../../data/mockData'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

// Mock Factory Stock Data
const MOCK_FACTORY_STOCK = [
  { id: 1, productId: 1, productName: 'Face Wash', code: 'FC001', quantity: 5000, unit: 'piece', lastUpdated: '2026-01-25' },
  { id: 2, productId: 2, productName: 'Face Cream', code: 'FC002', quantity: 3000, unit: 'piece', lastUpdated: '2026-01-25' },
  { id: 3, productId: 5, productName: 'Body Lotion', code: 'BC001', quantity: 4000, unit: 'piece', lastUpdated: '2026-01-24' },
  { id: 4, productId: 9, productName: 'Shampoo', code: 'HC001', quantity: 6000, unit: 'piece', lastUpdated: '2026-01-24' },
]

// Mock Blocked Items Data
const MOCK_BLOCKED_ITEMS = [
  { id: 1, productId: 3, productName: 'Face Pack', code: 'FC003', reason: 'Quality Issue', blockedDate: '2026-01-20', blockedBy: 'HR Manager' },
  { id: 2, productId: 7, productName: 'Body Scrub', code: 'BC003', reason: 'Expiry Date Near', blockedDate: '2026-01-22', blockedBy: 'HR Manager' },
]

// Mock Bills Data
const MOCK_BILLS = [
  { 
    id: 1, 
    billNo: 'BILL-001', 
    date: '2026-01-25', 
    customer: 'Super Stockist Chennai', 
    totalAmount: 125000, 
    status: 'Pending',
    items: [
      { productId: 1, productName: 'Face Wash', quantity: 100, rate: 250, amount: 25000 },
      { productId: 5, productName: 'Body Lotion', quantity: 200, rate: 300, amount: 60000 },
      { productId: 9, productName: 'Shampoo', quantity: 200, rate: 180, amount: 36000 },
    ]
  },
  { 
    id: 2, 
    billNo: 'BILL-002', 
    date: '2026-01-24', 
    customer: 'Distributor Coimbatore', 
    totalAmount: 85000, 
    status: 'Approved',
    items: [
      { productId: 2, productName: 'Face Cream', quantity: 50, rate: 450, amount: 22500 },
      { productId: 6, productName: 'Body Wash', quantity: 150, rate: 200, amount: 30000 },
      { productId: 10, productName: 'Conditioner', quantity: 100, rate: 200, amount: 20000 },
    ]
  },
]

const HRManagerOperations = () => {
  const [factoryStock, setFactoryStock] = useState(MOCK_FACTORY_STOCK)
  const [blockedItems, setBlockedItems] = useState(MOCK_BLOCKED_ITEMS)
  const [bills, setBills] = useState(MOCK_BILLS)
  const [showStockDialog, setShowStockDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [editingStock, setEditingStock] = useState(null)
  const [blockingItem, setBlockingItem] = useState(null)
  const [editingBill, setEditingBill] = useState(null)
  const factoryStockPagination = useTablePagination(factoryStock)
  const blockedItemsPagination = useTablePagination(blockedItems)
  const billsPagination = useTablePagination(bills)

  const handleUploadStock = () => {
    setEditingStock({
      productId: '',
      quantity: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    })
    setShowStockDialog(true)
  }

  const handleSaveStock = () => {
    if (!editingStock.productId || !editingStock.quantity || editingStock.quantity <= 0) {
      alert('Please fill all required fields with valid values')
      return
    }

    const product = MOCK_PRODUCTS.find(p => p.id === parseInt(editingStock.productId))
    if (!product) {
      alert('Please select a valid product')
      return
    }

    const existingStock = factoryStock.find(s => s.productId === parseInt(editingStock.productId))
    
    if (existingStock) {
      setFactoryStock(prev => prev.map(item => 
        item.productId === parseInt(editingStock.productId)
          ? { ...item, quantity: editingStock.quantity, lastUpdated: editingStock.lastUpdated }
          : item
      ))
    } else {
      const newStock = {
        id: factoryStock.length + 1,
        productId: parseInt(editingStock.productId),
        productName: product.name,
        code: product.code,
        quantity: editingStock.quantity,
        unit: product.unit,
        lastUpdated: editingStock.lastUpdated
      }
      setFactoryStock(prev => [...prev, newStock])
    }

    setShowStockDialog(false)
    setEditingStock(null)
    alert('Factory stock updated successfully!')
  }

  const handleBlockItem = () => {
    setBlockingItem({
      productId: '',
      reason: ''
    })
    setShowBlockDialog(true)
  }

  const handleSaveBlock = () => {
    if (!blockingItem.productId || !blockingItem.reason.trim()) {
      alert('Please fill all required fields')
      return
    }

    const product = MOCK_PRODUCTS.find(p => p.id === parseInt(blockingItem.productId))
    if (!product) {
      alert('Please select a valid product')
      return
    }

    const isAlreadyBlocked = blockedItems.some(item => item.productId === parseInt(blockingItem.productId))
    if (isAlreadyBlocked) {
      alert('This product is already blocked')
      return
    }

    const newBlockedItem = {
      id: blockedItems.length + 1,
      productId: parseInt(blockingItem.productId),
      productName: product.name,
      code: product.code,
      reason: blockingItem.reason,
      blockedDate: new Date().toISOString().split('T')[0],
      blockedBy: 'HR Manager'
    }

    setBlockedItems(prev => [...prev, newBlockedItem])
    setShowBlockDialog(false)
    setBlockingItem(null)
    alert('Item blocked successfully!')
  }

  const handleUnblockItem = (itemId) => {
    if (window.confirm('Are you sure you want to unblock this item?')) {
      setBlockedItems(prev => prev.filter(item => item.id !== itemId))
      alert('Item unblocked successfully!')
    }
  }

  const handleEditBill = (bill) => {
    setEditingBill({ ...bill })
    setShowBillDialog(true)
  }

  const handleUpdateBillItem = (itemIndex, field, value) => {
    setEditingBill(prev => {
      const newItems = [...prev.items]
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        [field]: field === 'quantity' || field === 'rate' || field === 'amount' ? parseFloat(value) || 0 : value
      }
      
      // Recalculate amount if quantity or rate changes
      if (field === 'quantity' || field === 'rate') {
        newItems[itemIndex].amount = newItems[itemIndex].quantity * newItems[itemIndex].rate
      }
      
      return {
        ...prev,
        items: newItems,
        totalAmount: newItems.reduce((sum, item) => sum + item.amount, 0)
      }
    })
  }

  const handleAddBillItem = () => {
    setEditingBill(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', productName: '', quantity: 0, rate: 0, amount: 0 }]
    }))
  }

  const handleRemoveBillItem = (index) => {
    setEditingBill(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
      totalAmount: prev.items.filter((_, i) => i !== index).reduce((sum, item) => sum + item.amount, 0)
    }))
  }

  const handleProductSelectInBill = (itemIndex, productId) => {
    const product = MOCK_PRODUCTS.find(p => p.id === parseInt(productId))
    if (product) {
      handleUpdateBillItem(itemIndex, 'productId', productId)
      handleUpdateBillItem(itemIndex, 'productName', product.name)
      handleUpdateBillItem(itemIndex, 'rate', product.price)
    }
  }

  const handleSaveBill = () => {
    if (!editingBill.items || editingBill.items.length === 0) {
      alert('Please add at least one item to the bill')
      return
    }

    setBills(prev => prev.map(item => 
      item.id === editingBill.id ? editingBill : item
    ))

    setShowBillDialog(false)
    setEditingBill(null)
    alert('Bill updated successfully!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Operations</h1>
        <p className="text-gray-600 mt-2">Manage factory stock, block items, and edit bills</p>
      </div>

      <Tabs defaultValue="stock" className="w-full">
        <TabsList>
          <TabsTrigger value="stock">Factory Stock</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Items</TabsTrigger>
          <TabsTrigger value="bills">Edit Bills</TabsTrigger>
        </TabsList>

        {/* Factory Stock Tab */}
        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#433228]" />
                    Factory Stock Management
                  </CardTitle>
                  <CardDescription>Upload and manage factory stock</CardDescription>
                </div>
                <Button onClick={handleUploadStock}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Stock
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factoryStockPagination.paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell className="text-right font-semibold">{item.quantity.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{new Date(item.lastUpdated).toLocaleDateString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {factoryStock.length > 0 && <TablePaginationControls {...factoryStockPagination} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked Items Tab */}
        <TabsContent value="blocked">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Ban className="h-5 w-5 text-[#433228]" />
                    Blocked Items
                  </CardTitle>
                  <CardDescription>Manage blocked products</CardDescription>
                </div>
                <Button onClick={handleBlockItem} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                  <Ban className="h-4 w-4 mr-2" />
                  Block Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Blocked Date</TableHead>
                    <TableHead>Blocked By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No blocked items
                      </TableCell>
                    </TableRow>
                  ) : (
                    blockedItemsPagination.paginatedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.code}</TableCell>
                        <TableCell>{item.reason}</TableCell>
                        <TableCell>{new Date(item.blockedDate).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>{item.blockedBy}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleUnblockItem(item.id)}
                          >
                            Unblock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {blockedItems.length > 0 && <TablePaginationControls {...blockedItemsPagination} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit Bills Tab */}
        <TabsContent value="bills">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#433228]" />
                Edit Bills
              </CardTitle>
              <CardDescription>Modify bill details and items</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total Amount (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billsPagination.paginatedItems.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.billNo}</TableCell>
                      <TableCell>{new Date(bill.date).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>{bill.customer}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{bill.totalAmount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bill.status === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bill.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBill(bill)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {bills.length > 0 && <TablePaginationControls {...billsPagination} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Stock Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Factory Stock</DialogTitle>
          </DialogHeader>
          {editingStock && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="product">Product *</Label>
                <Select
                  id="product"
                  value={editingStock.productId.toString()}
                  onValueChange={(value) => setEditingStock({ ...editingStock, productId: value })}
                >
                  <option value="">Select Product</option>
                  {MOCK_PRODUCTS.map(p => (
                    <option key={p.id} value={p.id.toString()}>{p.name} ({p.code})</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={editingStock.quantity}
                  onChange={(e) => setEditingStock({ ...editingStock, quantity: parseFloat(e.target.value) || 0 })}
                  min="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastUpdated">Last Updated</Label>
                <Input
                  id="lastUpdated"
                  type="date"
                  value={editingStock.lastUpdated}
                  onChange={(e) => setEditingStock({ ...editingStock, lastUpdated: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowStockDialog(false)
              setEditingStock(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveStock} className="bg-[#433228] hover:bg-[#5a4238] text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Item Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Item</DialogTitle>
          </DialogHeader>
          {blockingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="blockProduct">Product *</Label>
                <Select
                  id="blockProduct"
                  value={blockingItem.productId.toString()}
                  onValueChange={(value) => setBlockingItem({ ...blockingItem, productId: value })}
                >
                  <option value="">Select Product</option>
                  {MOCK_PRODUCTS.map(p => (
                    <option key={p.id} value={p.id.toString()}>{p.name} ({p.code})</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="blockReason">Reason *</Label>
                <Input
                  id="blockReason"
                  value={blockingItem.reason}
                  onChange={(e) => setBlockingItem({ ...blockingItem, reason: e.target.value })}
                  placeholder="Enter reason for blocking..."
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowBlockDialog(false)
              setBlockingItem(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveBlock} className="bg-red-600 hover:bg-red-700 text-white">
              <Ban className="h-4 w-4 mr-2" />
              Block Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bill Dialog */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bill - {editingBill?.billNo}</DialogTitle>
          </DialogHeader>
          {editingBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bill No</Label>
                  <Input value={editingBill.billNo} disabled />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={editingBill.date} onChange={(e) => setEditingBill({ ...editingBill, date: e.target.value })} />
                </div>
                <div>
                  <Label>Customer</Label>
                  <Input value={editingBill.customer} onChange={(e) => setEditingBill({ ...editingBill, customer: e.target.value })} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editingBill.status} onValueChange={(value) => setEditingBill({ ...editingBill, status: value })}>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">Bill Items</Label>
                  <Button type="button" size="sm" variant="outline" onClick={handleAddBillItem}>
                    + Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {editingBill.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end p-3 border rounded-lg">
                      <div className="flex-1">
                        <Label>Product</Label>
                        <Select
                          value={item.productId.toString()}
                          onValueChange={(value) => handleProductSelectInBill(index, value)}
                        >
                          <option value="">Select Product</option>
                          {MOCK_PRODUCTS.map(p => (
                            <option key={p.id} value={p.id.toString()}>{p.name} ({p.code})</option>
                          ))}
                        </Select>
                      </div>
                      <div className="w-32">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateBillItem(index, 'quantity', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="w-32">
                        <Label>Rate (₹)</Label>
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleUpdateBillItem(index, 'rate', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="w-32">
                        <Label>Amount (₹)</Label>
                        <Input value={item.amount.toLocaleString('en-IN')} disabled />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveBillItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Total Amount</Label>
                  <p className="text-2xl font-bold text-[#433228]">
                    ₹{editingBill.totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowBillDialog(false)
              setEditingBill(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveBill} className="bg-[#433228] hover:bg-[#5a4238] text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HRManagerOperations
