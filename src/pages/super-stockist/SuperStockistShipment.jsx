import { useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Truck, Package, Upload, Eye, Plus } from 'lucide-react'
import ExportButtons from '../../components/common/ExportButtons'

// Mock data
const MOCK_DISTRIBUTORS = [
  { id: 1, name: 'Shraam', area: 'Sivakasi' },
  { id: 2, name: 'Raj Distributors', area: 'Madurai' },
]

const MOCK_ACCEPTED_ORDERS = [
  {
    id: 1,
    distributorId: 1,
    distributorName: 'Shraam',
    area: 'Sivakasi',
    items: [
      { productId: 1, productName: 'Gold Soap', quantity: 5, value: 15000 },
    ],
    totalValue: 15000,
    status: 'accepted',
    acceptedAt: '2026-01-28T10:00:00Z',
  },
  {
    id: 2,
    distributorId: 2,
    distributorName: 'Raj Distributors',
    area: 'Madurai',
    items: [
      { productId: 3, productName: 'Herbal Face Wash', quantity: 2, value: 12000 },
    ],
    totalValue: 12000,
    status: 'accepted',
    acceptedAt: '2026-01-27T14:30:00Z',
  },
]

const SuperStockistShipment = () => {
  const shipmentOrdersPagination = useTablePagination(MOCK_ACCEPTED_ORDERS)
  const [activeTab, setActiveTab] = useState('shipment')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showShipmentDialog, setShowShipmentDialog] = useState(false)
  const [showTrackingDialog, setShowTrackingDialog] = useState(false)
  const [shipmentData, setShipmentData] = useState({
    orderId: '',
    trackingNo: '',
    consignmentDetails: '',
  })
  const [trackingData, setTrackingData] = useState({
    orderId: '',
    billImage: null,
    billNo: '',
    billDate: '',
    courierName: '',
    lrImage: null, // Lorry Receipt image
  })

  const handleShipment = (order) => {
    setSelectedOrder(order)
    setShipmentData({
      orderId: order.id,
      trackingNo: '',
      consignmentDetails: '',
    })
    setShowShipmentDialog(true)
  }

  const handleSubmitShipment = () => {
    if (!shipmentData.trackingNo || !shipmentData.consignmentDetails) {
      alert('Please fill all required fields')
      return
    }
    alert('Shipment details recorded successfully!')
    setShowShipmentDialog(false)
    setShipmentData({ orderId: '', trackingNo: '', consignmentDetails: '' })
  }

  const handleTracking = (order) => {
    setSelectedOrder(order)
    setTrackingData({
      orderId: order.id,
      billImage: null,
      billNo: '',
      billDate: '',
      courierName: '',
      lrImage: null,
    })
    setShowTrackingDialog(true)
  }

  const handleSubmitTracking = () => {
    if (!trackingData.billNo || !trackingData.billDate || !trackingData.courierName || !trackingData.billImage || !trackingData.lrImage) {
      alert('Please fill all required fields and upload images')
      return
    }
    alert('Order tracking information recorded successfully!')
    setShowTrackingDialog(false)
    setTrackingData({
      orderId: '',
      billImage: null,
      billNo: '',
      billDate: '',
      courierName: '',
      lrImage: null,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shipment & Tracking</h1>
        <p className="text-gray-600 mt-2">Manage shipment and tracking information for fulfilled orders</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="shipment">Shipment Management</TabsTrigger>
          <TabsTrigger value="tracking">Order Tracking</TabsTrigger>
        </TabsList>

        {/* Shipment Management */}
        <TabsContent value="shipment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#433228]" />
                Shipment Management
              </CardTitle>
              <CardDescription>Record shipment details for accepted distributor orders</CardDescription>
            </CardHeader>
            <CardContent>
              {MOCK_ACCEPTED_ORDERS.length > 0 ? (
                <>
                  <div className="flex justify-end mb-4">
                    <ExportButtons
                      rows={MOCK_ACCEPTED_ORDERS.map((o) => ({
                        'Order ID': `ORD-${o.id.toString().padStart(4, '0')}`,
                        'Order Date': o.acceptedAt,
                        Distributor: o.distributorName,
                        Area: o.area,
                        Items: o.items.map((i) => i.productName).join(', '),
                        Value: o.totalValue,
                        Status: o.status,
                      }))}
                      csvFilename={`Shipment_Orders_${new Date().toISOString().split('T')[0]}.csv`}
                      xlsxFilename={`Shipment_Orders_${new Date().toISOString().split('T')[0]}.xlsx`}
                      xlsxSheetName="Shipment Orders"
                    />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Distributor</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shipmentOrdersPagination.paginatedItems.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium text-[#433228]">
                            ORD-{order.id.toString().padStart(4, '0')}
                          </TableCell>
                          <TableCell>
                            {new Date(order.acceptedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">{order.distributorName}</TableCell>
                          <TableCell>{order.area}</TableCell>
                          <TableCell>
                            {order.items.map(item => item.productName).join(', ')}
                          </TableCell>
                          <TableCell>₹{order.totalValue.toLocaleString('en-IN')}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleShipment(order)}
                              className="bg-[#433228] hover:bg-[#5a4238] text-white"
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Ship
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {MOCK_ACCEPTED_ORDERS.length > 0 && <TablePaginationControls {...shipmentOrdersPagination} />}
                </>
              ) : (
                <p className="text-center text-gray-500 py-8">No accepted orders available for shipment</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Order Tracking */}
        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#433228]" />
                Order Tracking Information
              </CardTitle>
              <CardDescription>Record tracking details for shipped orders</CardDescription>
            </CardHeader>
            <CardContent>
              {MOCK_ACCEPTED_ORDERS.length > 0 ? (
                <>
                  <div className="flex justify-end mb-4">
                    <ExportButtons
                      rows={MOCK_ACCEPTED_ORDERS.map((o) => ({
                        'Order ID': `ORD-${o.id.toString().padStart(4, '0')}`,
                        'Order Date': o.acceptedAt,
                        Distributor: o.distributorName,
                        Area: o.area,
                        Items: o.items.map((i) => i.productName).join(', '),
                        Value: o.totalValue,
                        Status: o.status,
                      }))}
                      csvFilename={`Tracking_Orders_${new Date().toISOString().split('T')[0]}.csv`}
                      xlsxFilename={`Tracking_Orders_${new Date().toISOString().split('T')[0]}.xlsx`}
                      xlsxSheetName="Tracking Orders"
                    />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Distributor</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shipmentOrdersPagination.paginatedItems.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium text-[#433228]">
                            ORD-{order.id.toString().padStart(4, '0')}
                          </TableCell>
                          <TableCell>
                            {new Date(order.acceptedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">{order.distributorName}</TableCell>
                          <TableCell>{order.area}</TableCell>
                          <TableCell>
                            {order.items.map(item => item.productName).join(', ')}
                          </TableCell>
                          <TableCell>₹{order.totalValue.toLocaleString('en-IN')}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleTracking(order)}
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
                  {MOCK_ACCEPTED_ORDERS.length > 0 && <TablePaginationControls {...shipmentOrdersPagination} />}
                </>
              ) : (
                <p className="text-center text-gray-500 py-8">No orders available for tracking</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Shipment Dialog */}
      <Dialog open={showShipmentDialog} onOpenChange={setShowShipmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Shipment Details</DialogTitle>
            <DialogDescription>Enter tracking and consignment information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedOrder && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Order Details</h4>
                <p><strong>Distributor:</strong> {selectedOrder.distributorName} - {selectedOrder.area}</p>
                <p><strong>Items:</strong> {selectedOrder.items.map(item => item.productName).join(', ')}</p>
                <p><strong>Value:</strong> ₹{selectedOrder.totalValue.toLocaleString('en-IN')}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="tracking-no">Tracking No. *</Label>
              <Input
                id="tracking-no"
                value={shipmentData.trackingNo}
                onChange={(e) => setShipmentData({ ...shipmentData, trackingNo: e.target.value })}
                placeholder="Enter tracking number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consignment">Consignment Details *</Label>
              <Input
                id="consignment"
                value={shipmentData.consignmentDetails}
                onChange={(e) => setShipmentData({ ...shipmentData, consignmentDetails: e.target.value })}
                placeholder="Enter consignment details"
              />
            </div>
            <Button
              onClick={handleSubmitShipment}
              className="w-full bg-[#433228] hover:bg-[#5a4238] text-white"
            >
              Submit Shipment Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tracking Dialog */}
      <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Order Tracking Info</DialogTitle>
            <DialogDescription>Upload bill and LR images, enter tracking details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedOrder && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Order Details</h4>
                <p><strong>Distributor:</strong> {selectedOrder.distributorName} - {selectedOrder.area}</p>
                <p><strong>Items:</strong> {selectedOrder.items.map(item => item.productName).join(', ')}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="bill-image">Upload Bill Image *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {trackingData.billImage ? (
                  <div className="space-y-2">
                    <img
                      src={URL.createObjectURL(trackingData.billImage)}
                      alt="Bill"
                      className="w-full h-32 object-cover rounded"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTrackingData({ ...trackingData, billImage: null })}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="bill-image"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload bill image</span>
                    <Input
                      id="bill-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          setTrackingData({ ...trackingData, billImage: e.target.files[0] })
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="courier-name">Courier Name *</Label>
              <Input
                id="courier-name"
                value={trackingData.courierName}
                onChange={(e) => setTrackingData({ ...trackingData, courierName: e.target.value })}
                placeholder="Enter courier name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lr-image">Upload LR (Lorry Receipt) Image *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {trackingData.lrImage ? (
                  <div className="space-y-2">
                    <img
                      src={URL.createObjectURL(trackingData.lrImage)}
                      alt="LR"
                      className="w-full h-32 object-cover rounded"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTrackingData({ ...trackingData, lrImage: null })}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="lr-image"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload LR image</span>
                    <Input
                      id="lr-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          setTrackingData({ ...trackingData, lrImage: e.target.files[0] })
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
            <Button
              onClick={handleSubmitTracking}
              className="w-full bg-[#433228] hover:bg-[#5a4238] text-white"
            >
              Submit Tracking Information
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SuperStockistShipment
