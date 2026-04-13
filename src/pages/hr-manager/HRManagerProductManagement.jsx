import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Edit, Save, Package, Image as ImageIcon, Trash2 } from 'lucide-react'
import { MOCK_PRODUCTS } from '../../data/mockData'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

const MOCK_BANNERS = [
  {
    id: 1,
    title: 'Summer Skin Care Offer',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=220&fit=crop',
    ctaLabel: 'Shop Now',
    status: 'Active',
    lastUpdated: '2026-03-01',
  },
  {
    id: 2,
    title: 'Hair Care Combo',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=220&fit=crop',
    ctaLabel: 'View Deals',
    status: 'Draft',
    lastUpdated: '2026-03-04',
  },
]

const HRManagerProductManagement = () => {
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [banners, setBanners] = useState(MOCK_BANNERS)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingBanner, setEditingBanner] = useState(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showBannerDialog, setShowBannerDialog] = useState(false)
  const productsPagination = useTablePagination(products)
  const bannersPagination = useTablePagination(banners)

  const handleAddProduct = () => {
    setEditingProduct({
      id: Date.now(),
      name: '',
      code: '',
      category: 'Face Care',
      price: 0,
      unit: 'piece',
      image: '',
      isNew: true,
    })
    setShowProductDialog(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product, isNew: false })
    setShowProductDialog(true)
  }

  const handleSaveProduct = () => {
    if (!editingProduct.name || !editingProduct.price || editingProduct.price <= 0) {
      alert('Please fill all required fields with valid values')
      return
    }

    if (editingProduct.isNew) {
      const { isNew, ...newProduct } = editingProduct
      setProducts(prev => [newProduct, ...prev])
    } else {
      setProducts(prev => prev.map(item => 
        item.id === editingProduct.id ? { ...editingProduct, isNew: undefined } : item
      ))
    }

    setShowProductDialog(false)
    setEditingProduct(null)
    alert(editingProduct.isNew ? 'Product created successfully!' : 'Product updated successfully!')
  }

  const handleProductImageUpload = (file) => {
    if (!file || !editingProduct) return

    const reader = new FileReader()
    reader.onload = () => {
      setEditingProduct((prev) =>
        prev ? { ...prev, image: reader.result } : prev,
      )
    }
    reader.readAsDataURL(file)
  }

  const handleAddBanner = () => {
    setEditingBanner({
      id: Date.now(),
      title: '',
      image: '',
      ctaLabel: '',
      status: 'Draft',
      lastUpdated: new Date().toISOString().split('T')[0],
      isNew: true,
    })
    setShowBannerDialog(true)
  }

  const handleEditBanner = (banner) => {
    setEditingBanner({ ...banner, isNew: false })
    setShowBannerDialog(true)
  }

  const handleBannerImageUpload = (file) => {
    if (!file || !editingBanner) return
    const reader = new FileReader()
    reader.onload = () => {
      setEditingBanner((prev) => (prev ? { ...prev, image: reader.result } : prev))
    }
    reader.readAsDataURL(file)
  }

  const handleSaveBanner = () => {
    if (!editingBanner?.title.trim() || !editingBanner?.image) {
      alert('Please fill banner title and image')
      return
    }

    const payload = {
      ...editingBanner,
      lastUpdated: new Date().toISOString().split('T')[0],
    }

    if (editingBanner.isNew) {
      const { isNew, ...newBanner } = payload
      setBanners((prev) => [newBanner, ...prev])
    } else {
      setBanners((prev) =>
        prev.map((item) => (item.id === editingBanner.id ? { ...payload, isNew: undefined } : item)),
      )
    }

    setShowBannerDialog(false)
    setEditingBanner(null)
    alert(editingBanner.isNew ? 'Banner created successfully!' : 'Banner updated successfully!')
  }

  const handleDeleteBanner = (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return
    setBanners((prev) => prev.filter((item) => item.id !== bannerId))
    alert('Banner deleted successfully!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <p className="text-gray-600 mt-2">Create and modify product photos, MRP, and banners</p>
      </div>
      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#433228]" />
                    Product Catalog
                  </CardTitle>
                  <CardDescription>Update product photos, MRP, and category details</CardDescription>
                </div>
                <Button
                  onClick={handleAddProduct}
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                >
                  + Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">MRP (₹)</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsPagination.paginatedItems.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200'
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{product.price.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {products.length > 0 && <TablePaginationControls {...productsPagination} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-[#433228]" />
                    Banner Management
                  </CardTitle>
                  <CardDescription>Create and update marketing banners</CardDescription>
                </div>
                <Button
                  onClick={handleAddBanner}
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                >
                  + Add Banner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Banner</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>CTA Label</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No banners available
                      </TableCell>
                    </TableRow>
                  ) : (
                    bannersPagination.paginatedItems.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-28 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x220'
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{banner.title}</TableCell>
                        <TableCell>{banner.ctaLabel || '—'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            banner.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {banner.status}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(banner.lastUpdated).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditBanner(banner)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteBanner(banner.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {banners.length > 0 && <TablePaginationControls {...bannersPagination} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Edit Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct?.isNew ? 'Create Product' : 'Edit Product'}</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Product Code</Label>
                  <Input
                    id="code"
                    value={editingProduct.code}
                    onChange={(e) => setEditingProduct({ ...editingProduct, code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    id="category"
                    value={editingProduct.category}
                    onValueChange={(value) => setEditingProduct({ ...editingProduct, category: value })}
                  >
                    <option value="Face Care">Face Care</option>
                    <option value="Body Care">Body Care</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Personal Care">Personal Care</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="mrp">MRP (₹) *</Label>
                  <Input
                    id="mrp"
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image">Product Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleProductImageUpload(e.target.files?.[0])}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Choose an image file from your device.
                </p>
                {editingProduct.image && (
                  <div className="mt-2">
                    <img
                      src={editingProduct.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowProductDialog(false)
              setEditingProduct(null)
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProduct}
              className="bg-[#433228] hover:bg-[#5a4238] text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Banner Edit Dialog */}
      <Dialog open={showBannerDialog} onOpenChange={setShowBannerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBanner?.isNew ? 'Create Banner' : 'Edit Banner'}</DialogTitle>
          </DialogHeader>
          {editingBanner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="bannerTitle">Banner Title *</Label>
                  <Input
                    id="bannerTitle"
                    value={editingBanner.title}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ctaLabel">CTA Label</Label>
                  <Input
                    id="ctaLabel"
                    value={editingBanner.ctaLabel}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaLabel: e.target.value })}
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <Label htmlFor="bannerStatus">Status</Label>
                  <Select
                    id="bannerStatus"
                    value={editingBanner.status}
                    onValueChange={(value) => setEditingBanner({ ...editingBanner, status: value })}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="bannerImage">Banner Image *</Label>
                <Input
                  id="bannerImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBannerImageUpload(e.target.files?.[0])}
                />
                {editingBanner.image && (
                  <div className="mt-2">
                    <img
                      src={editingBanner.image}
                      alt="Banner preview"
                      className="w-full h-40 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowBannerDialog(false)
              setEditingBanner(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveBanner} className="bg-[#433228] hover:bg-[#5a4238] text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default HRManagerProductManagement
