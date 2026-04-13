import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { COSMETICS_CATEGORIES, MOCK_PRODUCTS, getProductsByCategory } from '../../data/mockData'
import { Upload, X } from 'lucide-react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

const RETURN_REASONS = [
  'Product returned by customer',
  'Product received with damage',
  'No proper racking',
  'Customer did not like the product after use',
  'Sales entered by mistake',
]

const PromoterSalesReturn = () => {
  const [selectedCategory, setSelectedCategory] = useState('Face Care')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [returnReason, setReturnReason] = useState('')
  const [batchNumber, setBatchNumber] = useState('')
  const [manufacturingMonth, setManufacturingMonth] = useState('')
  const [productPhoto, setProductPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [returnRequests, setReturnRequests] = useState([])
  const returnRequestsPagination = useTablePagination(returnRequests)

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProductPhoto(reader.result)
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!selectedProduct || !returnReason || !batchNumber || !manufacturingMonth || !productPhoto) {
      alert('Please fill all required fields including product photo')
      return
    }

    const product = MOCK_PRODUCTS.find(p => p.id === parseInt(selectedProduct))
    if (!product) {
      alert('Product not found')
      return
    }

    const newReturn = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      category: selectedCategory,
      returnReason,
      batchNumber,
      manufacturingMonth,
      photo: productPhoto,
      status: 'Pending Approval',
      submittedAt: new Date().toISOString(),
    }

    setReturnRequests(prev => [newReturn, ...prev])
    
    // Reset form
    setSelectedProduct('')
    setReturnReason('')
    setBatchNumber('')
    setManufacturingMonth('')
    setProductPhoto(null)
    setPhotoPreview(null)
    
    alert('Sales return submitted for approval!')
  }

  const categoryProducts = getProductsByCategory(selectedCategory)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales Return</h1>
        <p className="text-gray-600 mt-2">Submit sales return for approval</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit Sales Return</CardTitle>
          <CardDescription>Select category, product, and provide return details</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={(val) => {
            setSelectedCategory(val)
            setSelectedProduct('')
          }}>
            <TabsList className="grid w-full grid-cols-4">
              {COSMETICS_CATEGORIES.filter(cat => cat.name !== 'Summit').map((category) => (
                <TabsTrigger key={category.id} value={category.name}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {COSMETICS_CATEGORIES.filter(cat => cat.name !== 'Summit').map((category) => (
              <TabsContent key={category.id} value={category.name} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Select Product *</Label>
                  <Select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    required
                  >
                    <option value="">Select Product</option>
                    {getProductsByCategory(category.name).map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.code})
                      </option>
                    ))}
                  </Select>
                </div>

                {selectedProduct && (
                  <>
                    <div className="space-y-2">
                      <Label>Reason for Return *</Label>
                      <Select
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        required
                      >
                        <option value="">Select Reason</option>
                        {RETURN_REASONS.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Batch Number *</Label>
                        <Input
                          value={batchNumber}
                          onChange={(e) => setBatchNumber(e.target.value)}
                          placeholder="Enter batch number"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Manufacturing Month *</Label>
                        <Input
                          type="month"
                          value={manufacturingMonth}
                          onChange={(e) => setManufacturingMonth(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Photo of Returned Product *</Label>
                      <div className="space-y-3">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="cursor-pointer"
                        />
                        {photoPreview && (
                          <div className="relative inline-block">
                            <img src={photoPreview} alt="Product photo" className="max-w-xs rounded-lg border" />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setPhotoPreview(null)
                                setProductPhoto(null)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      className="w-full bg-[#433228] hover:bg-[#5a4238]"
                      disabled={!returnReason || !batchNumber || !manufacturingMonth || !productPhoto}
                    >
                      Submit for Approval
                    </Button>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Return Requests */}
      {returnRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Return Requests</CardTitle>
            <CardDescription>Your submitted return requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Mfg Month</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returnRequestsPagination.paginatedItems.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.productName}</TableCell>
                    <TableCell>{request.category}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.returnReason}</TableCell>
                    <TableCell>{request.batchNumber}</TableCell>
                    <TableCell>{request.manufacturingMonth}</TableCell>
                    <TableCell>
                      {request.photo && (
                        <img src={request.photo} alt="Product" className="w-16 h-16 object-cover rounded" />
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'Approved' 
                          ? 'bg-green-100 text-green-800' 
                          : request.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePaginationControls {...returnRequestsPagination} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PromoterSalesReturn
