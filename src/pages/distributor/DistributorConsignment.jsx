import { useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Truck, Package, Check, Upload, Eye } from 'lucide-react'
import { MOCK_SS_LIST } from '../../data/mockData'

// Mock Consignments from SS
const MOCK_CONSIGNMENTS = [
  {
    id: 1,
    orderId: 'ORD-SS-001',
    ssId: 1,
    ssName: 'Beauty Cosmetics Super Stockist',
    items: [
      { productId: 1, productName: 'Face Wash', quantity: 10, value: 22500 },
      { productId: 5, productName: 'Body Lotion', quantity: 8, value: 21600 },
    ],
    totalValue: 44100,
    status: 'pending',
    createdAt: '2026-01-28T10:00:00Z',
    trackingInfo: null,
    deliveryInfo: null,
  },
  {
    id: 2,
    orderId: 'ORD-SS-002',
    ssId: 2,
    ssName: 'Glow Beauty Wholesale',
    items: [
      { productId: 13, productName: 'Soap', quantity: 15, value: 40500 },
    ],
    totalValue: 40500,
    status: 'pending',
    createdAt: '2026-01-27T14:30:00Z',
    trackingInfo: null,
    deliveryInfo: null,
  },
]

const DistributorConsignment = () => {
  const consignmentPagination = useTablePagination(MOCK_CONSIGNMENTS)
  const [activeTab, setActiveTab] = useState('consignments')
  const [selectedConsignment, setSelectedConsignment] = useState(null)
  const [showTrackingDialog, setShowTrackingDialog] = useState(false)
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false)
  const [trackingData, setTrackingData] = useState({
    consignmentId: '',
    trackingNumber: '',
    courierName: '',
    billNo: '',
    billDate: '',
    billImage: null,
    lrImage: null,
  })
  const [deliveryData, setDeliveryData] = useState({
    consignmentId: '',
    deliveryDate: '',
    deliveryStatus: 'Delivered',
    notes: '',
  })

  const handleAcceptConsignment = (consignmentId) => {
    if (confirm('Are you sure you want to accept this consignment?')) {
      alert('Consignment accepted successfully!')
      // Update consignment status
    }
  }

  const handleAddTracking = (consignment) => {
    setSelectedConsignment(consignment)
    setTrackingData({
      consignmentId: consignment.id,
      trackingNumber: '',
      courierName: '',
      billNo: '',
      billDate: '',
      billImage: null,
      lrImage: null,
    })
    setShowTrackingDialog(true)
  }

  const handleSubmitTracking = () => {
    if (!trackingData.trackingNumber || !trackingData.courierName || !trackingData.billNo || !trackingData.billDate) {
      alert('Please fill all required fields')
      return
    }
    alert('Order tracking information recorded successfully!')
    setShowTrackingDialog(false)
    setTrackingData({
      consignmentId: '',
      trackingNumber: '',
      courierName: '',
      billNo: '',
      billDate: '',
      billImage: null,
      lrImage: null,
    })
  }

  const handleAddDelivery = (consignment) => {
    setSelectedConsignment(consignment)
    setDeliveryData({
      consignmentId: consignment.id,
      deliveryDate: '',
      deliveryStatus: 'Delivered',
      notes: '',
    })
    setShowDeliveryDialog(true)
  }

  const handleSubmitDelivery = () => {
    if (!deliveryData.deliveryDate) {
      alert('Please select delivery date')
      return
    }
    alert('Delivery information recorded successfully!')
    setShowDeliveryDialog(false)
    setDeliveryData({
      consignmentId: '',
      deliveryDate: '',
      deliveryStatus: 'Delivered',
      notes: '',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Consignment & Delivery Tracking</h1>
        <p className="text-gray-600 mt-2">Accept consignments from SS and track delivery information</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="consignments">Accept Consignments</TabsTrigger>
          <TabsTrigger value="tracking">Order Tracking Info</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Info</TabsTrigger>
        </TabsList>

        {/* Accept Consignments */}
        <TabsContent value="consignments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#433228]" />
                Consignments from SS
              </CardTitle>
              <CardDescription>Accept consignments received from Super Stockist</CardDescription>
            </CardHeader>
            <CardContent>
              {MOCK_CONSIGNMENTS.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>SS Name</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consignmentPagination.paginatedItems.map((consignment) => (
                      <TableRow key={consignment.id}>
                        <TableCell className="font-medium">{consignment.orderId}</TableCell>
                        <TableCell>{consignment.ssName}</TableCell>
                        <TableCell>
                          {consignment.items.map(item => item.productName).join(', ')}
                        </TableCell>
                        <TableCell>₹{consignment.totalValue.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          {new Date(consignment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptConsignment(consignment.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">No consignments available</p>
              )}
              {MOCK_CONSIGNMENTS.length > 0 && <TablePaginationControls {...consignmentPagination} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Order Tracking Info */}
        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#433228]" />
                Order Tracking Information
              </CardTitle>
              <CardDescription>Record tracking details for consignments</CardDescription>
            </CardHeader>
            <CardContent>
              {MOCK_CONSIGNMENTS.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>SS Name</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consignmentPagination.paginatedItems.map((consignment) => (
                      <TableRow key={consignment.id}>
                        <TableCell className="font-medium">{consignment.orderId}</TableCell>
                        <TableCell>{consignment.ssName}</TableCell>
                        <TableCell>
                          {consignment.items.map(item => item.productName).join(', ')}
                        </TableCell>
                        <TableCell>₹{consignment.totalValue.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleAddTracking(consignment)}
                            className="bg-[#433228] hover:bg-[#5a4238] text-white"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Add Tracking
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">No consignments available for tracking</p>
              )}
              {MOCK_CONSIGNMENTS.length > 0 && <TablePaginationControls {...consignmentPagination} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Info */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#433228]" />
                Delivery Information
              </CardTitle>
              <CardDescription>Record delivery status and information</CardDescription>
            </CardHeader>
            <CardContent>
              {MOCK_CONSIGNMENTS.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>SS Name</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consignmentPagination.paginatedItems.map((consignment) => (
                      <TableRow key={consignment.id}>
                        <TableCell className="font-medium">{consignment.orderId}</TableCell>
                        <TableCell>{consignment.ssName}</TableCell>
                        <TableCell>
                          {consignment.items.map(item => item.productName).join(', ')}
                        </TableCell>
                        <TableCell>₹{consignment.totalValue.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleAddDelivery(consignment)}
                            className="bg-[#433228] hover:bg-[#5a4238] text-white"
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Add Delivery Info
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">No consignments available for delivery tracking</p>
              )}
              {MOCK_CONSIGNMENTS.length > 0 && <TablePaginationControls {...consignmentPagination} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tracking Dialog */}
      <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Tracking Info</DialogTitle>
            <DialogDescription>Enter tracking details for the consignment</DialogDescription>
          </DialogHeader>
          {selectedConsignment && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Consignment Details</h4>
                <p><strong>Order ID:</strong> {selectedConsignment.orderId}</p>
                <p><strong>SS:</strong> {selectedConsignment.ssName}</p>
                <p><strong>Items:</strong> {selectedConsignment.items.map(item => item.productName).join(', ')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tracking-number">Tracking Number *</Label>
                  <Input
                    id="tracking-number"
                    value={trackingData.trackingNumber}
                    onChange={(e) => setTrackingData({ ...trackingData, trackingNumber: e.target.value })}
                    placeholder="Enter tracking number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courier-name">Courier Name *</Label>
                  <Input
                    id="courier-name"
                    value={trackingData.courierName}
                    onChange={(e) => setTrackingData({ ...trackingData, courierName: e.target.value })}
                    placeholder="Enter courier name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bill-no">Bill No. *</Label>
                  <Input
                    id="bill-no"
                    value={trackingData.billNo}
                    onChange={(e) => setTrackingData({ ...trackingData, billNo: e.target.value })}
                    placeholder="Enter bill number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bill-date">Bill Date *</Label>
                  <Input
                    id="bill-date"
                    type="date"
                    value={trackingData.billDate}
                    onChange={(e) => setTrackingData({ ...trackingData, billDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Upload Bill Image (Optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setTrackingData({ ...trackingData, billImage: e.target.files[0] })
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Upload LR (Lorry Receipt) Image (Optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setTrackingData({ ...trackingData, lrImage: e.target.files[0] })
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleSubmitTracking}
                className="w-full bg-[#433228] hover:bg-[#5a4238] text-white"
              >
                Submit Tracking Information
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delivery Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Delivery Information</DialogTitle>
            <DialogDescription>Record delivery status and details</DialogDescription>
          </DialogHeader>
          {selectedConsignment && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Consignment Details</h4>
                <p><strong>Order ID:</strong> {selectedConsignment.orderId}</p>
                <p><strong>SS:</strong> {selectedConsignment.ssName}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery-date">Delivery Date *</Label>
                  <Input
                    id="delivery-date"
                    type="date"
                    value={deliveryData.deliveryDate}
                    onChange={(e) => setDeliveryData({ ...deliveryData, deliveryDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-status">Delivery Status *</Label>
                  <select
                    id="delivery-status"
                    value={deliveryData.deliveryStatus}
                    onChange={(e) => setDeliveryData({ ...deliveryData, deliveryStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Delivered">Delivered</option>
                    <option value="Partially Delivered">Partially Delivered</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-notes">Notes (Optional)</Label>
                <textarea
                  id="delivery-notes"
                  value={deliveryData.notes}
                  onChange={(e) => setDeliveryData({ ...deliveryData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter delivery notes..."
                />
              </div>
              <Button
                onClick={handleSubmitDelivery}
                className="w-full bg-[#433228] hover:bg-[#5a4238] text-white"
              >
                Submit Delivery Information
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DistributorConsignment
