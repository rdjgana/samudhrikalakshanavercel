import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { Edit, Save, X, TrendingUp, DollarSign } from 'lucide-react'
import { MOCK_PRODUCTS } from '../../data/mockData'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

// Mock Incentive Data
const MOCK_INCENTIVE_DATA = [
  { 
    id: 1, 
    employeeName: 'Rajesh Kumar', 
    category: 'RSM', 
    month: 'January 2026',
    primaryTarget: 1500000, 
    primaryAchieved: 1125000, 
    secondaryTarget: 1200000, 
    secondaryAchieved: 960000, 
    incentiveAmount: 25000,
    products: [
      { productId: 1, productName: 'Face Wash', quantity: 100, amount: 5000 },
      { productId: 5, productName: 'Body Lotion', quantity: 80, amount: 8000 },
    ],
    status: 'Approved'
  },
  { 
    id: 2, 
    employeeName: 'Priya Menon', 
    category: 'ASM', 
    month: 'January 2026',
    primaryTarget: 1200000, 
    primaryAchieved: 1080000, 
    secondaryTarget: 1000000, 
    secondaryAchieved: 850000, 
    incentiveAmount: 20000,
    products: [
      { productId: 2, productName: 'Face Cream', quantity: 60, amount: 6000 },
      { productId: 9, productName: 'Shampoo', quantity: 100, amount: 5000 },
    ],
    status: 'Approved'
  },
  { 
    id: 3, 
    employeeName: 'Arun Balaji', 
    category: 'SO', 
    month: 'January 2026',
    primaryTarget: 800000, 
    primaryAchieved: 720000, 
    secondaryTarget: 600000, 
    secondaryAchieved: 540000, 
    incentiveAmount: 15000,
    products: [
      { productId: 3, productName: 'Face Pack', quantity: 50, amount: 5000 },
    ],
    status: 'Pending'
  },
]

const HRManagerFinancialAdjustments = () => {
  const [incentives, setIncentives] = useState(MOCK_INCENTIVE_DATA)
  const [editingId, setEditingId] = useState(null)
  const [editedIncentive, setEditedIncentive] = useState(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedIncentive, setSelectedIncentive] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState('January 2026')

  const months = ['January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026']

  const handleEdit = (incentive) => {
    setSelectedIncentive(incentive)
    setEditedIncentive({
      ...incentive,
      products: [...incentive.products]
    })
    setShowEditDialog(true)
  }

  const handleAddProduct = () => {
    setEditedIncentive(prev => ({
      ...prev,
      products: [...prev.products, { productId: '', productName: '', quantity: 0, amount: 0 }]
    }))
  }

  const handleRemoveProduct = (index) => {
    setEditedIncentive(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }))
  }

  const handleProductChange = (index, field, value) => {
    setEditedIncentive(prev => {
      const newProducts = [...prev.products]
      newProducts[index] = {
        ...newProducts[index],
        [field]: field === 'productId' ? value : field === 'quantity' || field === 'amount' ? parseFloat(value) || 0 : value
      }
      
      // Update product name when productId changes
      if (field === 'productId') {
        const product = MOCK_PRODUCTS.find(p => p.id === parseInt(value))
        if (product) {
          newProducts[index].productName = product.name
        }
      }
      
      return {
        ...prev,
        products: newProducts,
        incentiveAmount: newProducts.reduce((sum, p) => sum + (p.amount || 0), 0)
      }
    })
  }

  const handleSave = () => {
    if (!editedIncentive.incentiveAmount || editedIncentive.incentiveAmount <= 0) {
      alert('Please ensure total incentive amount is greater than 0')
      return
    }

    setIncentives(prev => prev.map(item => 
      item.id === selectedIncentive.id 
        ? { ...editedIncentive, modifiedDate: new Date().toISOString() }
        : item
    ))

    setShowEditDialog(false)
    setEditedIncentive(null)
    setSelectedIncentive(null)
    alert('Incentive adjusted successfully!')
  }

  const filteredIncentives = incentives.filter(item => item.month === selectedMonth)
  const filteredIncentivesPagination = useTablePagination(filteredIncentives)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Adjustments</h1>
        <p className="text-gray-600 mt-2">Change incentive products or amounts for the month</p>
      </div>

      {/* Month Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#433228]" />
            Incentive Management
          </CardTitle>
          <CardDescription>Select month to view and adjust incentives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="month">Select Month:</Label>
            <Select
              id="month"
              value={selectedMonth}
              onValueChange={setSelectedMonth}
              className="w-48"
            >
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Incentives Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#433228]" />
            Incentive Adjustments - {selectedMonth}
          </CardTitle>
          <CardDescription>View and modify incentive products and amounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Primary Target (₹)</TableHead>
                <TableHead className="text-right">Primary Achieved (₹)</TableHead>
                <TableHead className="text-right">Secondary Target (₹)</TableHead>
                <TableHead className="text-right">Secondary Achieved (₹)</TableHead>
                <TableHead className="text-right">Current Incentive (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncentives.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No incentives found for {selectedMonth}
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncentivesPagination.paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.employeeName}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">₹{item.primaryTarget.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right">₹{item.primaryAchieved.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right">₹{item.secondaryTarget.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right">₹{item.secondaryAchieved.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      ₹{item.incentiveAmount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filteredIncentives.length > 0 && <TablePaginationControls {...filteredIncentivesPagination} />}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adjust Incentive - {selectedIncentive?.employeeName}</DialogTitle>
          </DialogHeader>
          {editedIncentive && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-base">{editedIncentive.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Month</p>
                  <p className="text-base">{editedIncentive.month}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Primary Achieved</p>
                  <p className="text-base">₹{editedIncentive.primaryAchieved.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Secondary Achieved</p>
                  <p className="text-base">₹{editedIncentive.secondaryAchieved.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">Incentive Products</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddProduct}
                  >
                    + Add Product
                  </Button>
                </div>

                <div className="space-y-3">
                  {editedIncentive.products.map((product, index) => (
                    <div key={index} className="flex gap-3 items-end p-3 border rounded-lg">
                      <div className="flex-1">
                        <Label>Product</Label>
                        <Select
                          value={product.productId.toString()}
                          onValueChange={(value) => handleProductChange(index, 'productId', value)}
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
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="w-32">
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          value={product.amount}
                          onChange={(e) => handleProductChange(index, 'amount', e.target.value)}
                          min="0"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveProduct(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-green-800">Total Incentive Amount</Label>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{editedIncentive.incentiveAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false)
              setEditedIncentive(null)
              setSelectedIncentive(null)
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#433228] hover:bg-[#5a4238] text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Adjustments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HRManagerFinancialAdjustments
