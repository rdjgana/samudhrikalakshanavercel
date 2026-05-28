import { useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog'
import { Receipt, Eye } from 'lucide-react'
import ExportButtons from '../../components/common/ExportButtons'

// Mock Bills Receivable Data
const MOCK_BILLS_RECEIVABLE = [
  {
    id: 1,
    sNo: 1,
    trackingNumber: 'TRK001234',
    date: '2026-01-25',
    amount: 25000,
    deliveryStatus: 'Delivered',
    deliveryDate: '2026-01-27',
    consignmentDetails: {
      orderId: 'ORD001',
      items: 'Face Wash, Body Lotion',
      quantity: 15,
    },
  },
  {
    id: 2,
    sNo: 2,
    trackingNumber: 'TRK001235',
    date: '2026-01-26',
    amount: 18000,
    deliveryStatus: 'In Transit',
    deliveryDate: null,
    consignmentDetails: {
      orderId: 'ORD002',
      items: 'Soap, Hand Wash',
      quantity: 20,
    },
  },
  {
    id: 3,
    sNo: 3,
    trackingNumber: 'TRK001236',
    date: '2026-01-27',
    amount: 32000,
    deliveryStatus: 'Pending',
    deliveryDate: null,
    consignmentDetails: {
      orderId: 'ORD003',
      items: 'Face Cream, Hair Oil',
      quantity: 12,
    },
  },
]

const DistributorBillsReceivable = () => {
  const [selectedBill, setSelectedBill] = useState(null)
  const [showViewDialog, setShowViewDialog] = useState(false)

  const billsPagination = useTablePagination(MOCK_BILLS_RECEIVABLE)

  const handleViewBill = (bill) => {
    setSelectedBill(bill)
    setShowViewDialog(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bills Receivable</h1>
        <p className="text-gray-600 mt-2">Track payments and delivery information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#433228]" />
            Bills Receivable
          </CardTitle>
          <CardDescription>Payment tracking with delivery report information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <ExportButtons
              rows={MOCK_BILLS_RECEIVABLE.map((b) => ({
                'S.No': b.sNo,
                'Tracking Number': b.trackingNumber,
                Date: b.date,
                Amount: b.amount,
                'Delivery Status': b.deliveryStatus,
                'Delivery Date': b.deliveryDate || '',
                'Order ID': b.consignmentDetails?.orderId || '',
                Items: b.consignmentDetails?.items || '',
                Quantity: b.consignmentDetails?.quantity || '',
              }))}
              csvFilename={`Bills_Receivable_${new Date().toISOString().split('T')[0]}.csv`}
              xlsxFilename={`Bills_Receivable_${new Date().toISOString().split('T')[0]}.xlsx`}
              xlsxSheetName="Bills Receivable"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Tracking Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Delivery Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billsPagination.paginatedItems.map((bill, index) => (
                <TableRow key={bill.id}>
                  <TableCell>{(billsPagination.page - 1) * billsPagination.pageSize + index + 1}</TableCell>
                  <TableCell className="font-medium">{bill.trackingNumber}</TableCell>
                  <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                  <TableCell>₹{bill.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      bill.deliveryStatus === 'Delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : bill.deliveryStatus === 'In Transit'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bill.deliveryStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleViewBill(bill)}
                      className="bg-[#433228] hover:bg-[#5a4238] text-white"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {MOCK_BILLS_RECEIVABLE.length > 0 && <TablePaginationControls {...billsPagination} />}
        </CardContent>
      </Card>

      {/* View Bill Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
            <DialogDescription>Complete information about the bill and delivery</DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tracking Number</label>
                  <p className="text-lg font-semibold">{selectedBill.trackingNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-lg">{new Date(selectedBill.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-lg font-semibold">₹{selectedBill.amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Delivery Status</label>
                  <p className="text-lg">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedBill.deliveryStatus === 'Delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedBill.deliveryStatus === 'In Transit'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedBill.deliveryStatus}
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Delivery Report Info</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="font-medium">{selectedBill.deliveryStatus}</span>
                  </div>
                  {selectedBill.deliveryDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Delivery Date:</span>
                      <span className="font-medium">{new Date(selectedBill.deliveryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Consignment Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order ID:</span>
                    <span className="font-medium">{selectedBill.consignmentDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Items:</span>
                    <span className="font-medium">{selectedBill.consignmentDetails.items}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="font-medium">{selectedBill.consignmentDetails.quantity} cases</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DistributorBillsReceivable
