import { useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Truck, Plus, Upload, Download, Eye } from 'lucide-react'
import * as XLSX from 'xlsx'
import { MOCK_SS_LIST, MOCK_HIERARCHY, MOCK_SHOPS } from '../../data/mockData'

// Utility function to convert data to CSV
const convertToCSV = (data, headers) => {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || ''
      // Escape commas and quotes in values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  })
  return [csvHeaders, ...csvRows].join('\n')
}

// Utility function to download CSV file
const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Utility function to download XLSX file
const downloadXLSX = (data, headers, filename) => {
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Consignment Report')
  
  // Generate XLSX file and download
  XLSX.writeFile(workbook, filename)
}

// Mock Consignment Data
const MOCK_CONSIGNMENTS = [
  {
    id: 1,
    orderDate: '2026-01-15',
    orderNo: 'ORD-001',
    partyName: 'Beauty Cosmetics Super Stockist',
    billValue: 250000,
    dispatchDate: '2026-01-16',
    trackingId: 'TRACK-001',
    destination: 'To SS',
    status: 'Dispatched',
    photoUrl: '',
  },
  {
    id: 2,
    orderDate: '2026-01-20',
    orderNo: 'ORD-002',
    partyName: 'Beauty Distributors Chennai',
    billValue: 180000,
    dispatchDate: '2026-01-21',
    trackingId: 'TRACK-002',
    destination: 'To Dist',
    status: 'In Transit',
    photoUrl: '',
  },
]

const HRConsignment = () => {
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [bookingData, setBookingData] = useState({
    orderDate: new Date().toISOString().split('T')[0],
    orderNo: '',
    destination: '',
    partyId: '',
    partyName: '',
    docketNo: '',
    numberOfBoxes: '',
    transporterName: '',
    photo: null,
  })
  const [consignments, setConsignments] = useState(MOCK_CONSIGNMENTS)
  const [filters, setFilters] = useState({
    status: '',
    destination: '',
    startDate: '',
    endDate: '',
    partyName: '',
  })
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingConsignment, setViewingConsignment] = useState(null)

  // Get party list based on destination type
  const getPartyList = () => {
    switch (bookingData.destination) {
      case 'To SS':
        return MOCK_SS_LIST.map(ss => ({ id: ss.id, name: ss.name, code: ss.code }))
      case 'To Dist':
        return MOCK_HIERARCHY.distributors.map(dist => ({ id: dist.id, name: dist.name, code: dist.code }))
      case 'To Shop':
        return MOCK_SHOPS.map(shop => ({ id: shop.id, name: shop.name, code: shop.id }))
      case 'To Promoter':
        return MOCK_HIERARCHY.promoters.map(promo => ({ id: promo.id, name: promo.name, code: promo.code }))
      default:
        return []
    }
  }

  const handleBookingSubmit = () => {
    if (!bookingData.orderDate || !bookingData.orderNo || !bookingData.destination || !bookingData.partyId || !bookingData.docketNo || !bookingData.numberOfBoxes || !bookingData.transporterName) {
      alert('Please fill all required fields')
      return
    }

    const photoUrl = bookingData.photo ? URL.createObjectURL(bookingData.photo) : ''

    const newConsignment = {
      id: Date.now(),
      orderDate: bookingData.orderDate,
      orderNo: bookingData.orderNo,
      partyName: bookingData.partyName,
      billValue: 0,
      dispatchDate: '-',
      trackingId: bookingData.docketNo,
      destination: bookingData.destination,
      status: 'Booked',
      numberOfBoxes: bookingData.numberOfBoxes,
      transporterName: bookingData.transporterName,
      photoUrl,
    }

    setConsignments([newConsignment, ...consignments])
    setShowBookingDialog(false)
    setBookingData({
      orderDate: new Date().toISOString().split('T')[0],
      orderNo: '',
      destination: '',
      partyId: '',
      partyName: '',
      docketNo: '',
      numberOfBoxes: '',
      transporterName: '',
      photo: null,
    })
    alert('Consignment booking entry created successfully!')
  }

  const handleViewConsignment = (consignment) => {
    setViewingConsignment(consignment)
    setShowViewDialog(true)
  }

  // Filter consignments based on selected filters
  const filteredConsignments = consignments.filter(consignment => {
    if (filters.status && consignment.status !== filters.status) return false
    if (filters.destination && consignment.destination !== filters.destination) return false
    if (filters.partyName && !consignment.partyName.toLowerCase().includes(filters.partyName.toLowerCase())) return false
    
    if (filters.startDate) {
      const orderDate = new Date(consignment.orderDate)
      const startDate = new Date(filters.startDate)
      if (orderDate < startDate) return false
    }
    
    if (filters.endDate) {
      const orderDate = new Date(consignment.orderDate)
      const endDate = new Date(filters.endDate)
      endDate.setHours(23, 59, 59, 999)
      if (orderDate > endDate) return false
    }
    
    return true
  })

  const consignmentPagination = useTablePagination(filteredConsignments)

  const handleDownloadConsignments = (format = 'csv') => {
    if (filteredConsignments.length === 0) {
      alert('No data to download')
      return
    }

    const headers = ['Order Date', 'Order No', 'Party Name', 'Bill Value (₹)', 'Dispatch Date', 'Tracking ID', 'Destination', 'Status']
    const data = filteredConsignments.map(item => ({
      'Order Date': new Date(item.orderDate).toLocaleDateString('en-IN'),
      'Order No': item.orderNo,
      'Party Name': item.partyName,
      'Bill Value (₹)': item.billValue > 0 ? `₹${item.billValue.toLocaleString('en-IN')}` : '-',
      'Dispatch Date': item.dispatchDate !== '-' ? new Date(item.dispatchDate).toLocaleDateString('en-IN') : '-',
      'Tracking ID': item.trackingId,
      'Destination': item.destination,
      'Status': item.status
    }))

    const filename = `Consignment_Tracking_Report_${new Date().toISOString().split('T')[0]}.${format}`

    if (format === 'csv') {
      const csvContent = convertToCSV(data, headers)
      downloadCSV(csvContent, filename)
    } else {
      downloadXLSX(data, headers, filename)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consignment Tracking</h1>
          <p className="text-gray-600 mt-2">Track consignments and manage bookings</p>
        </div>
        <Button
          onClick={() => setShowBookingDialog(true)}
          className="bg-[#433228] hover:bg-[#5a4238] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Booking Entry
        </Button>
      </div>

      {/* Consignment List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#433228]" />
            Consignment Status
          </CardTitle>
          <CardDescription>Track all consignments and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters Section */}
          <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadConsignments('csv')}
                  disabled={filteredConsignments.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadConsignments('xlsx')}
                  disabled={filteredConsignments.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download XLSX
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-status">Status</Label>
                <Select
                  id="filter-status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="Booked">Booked</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-destination">Destination</Label>
                <Select
                  id="filter-destination"
                  value={filters.destination}
                  onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                >
                  <option value="">All Destinations</option>
                  <option value="To SS">To SS (Super Stockist)</option>
                  <option value="To Dist">To Dist (Distributor)</option>
                  <option value="To Shop">To Shop</option>
                  <option value="To Promoter">To Promoter</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-start-date">Start Date</Label>
                <Input
                  id="filter-start-date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-end-date">End Date</Label>
                <Input
                  id="filter-end-date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  min={filters.startDate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-party">Party Name</Label>
                <Input
                  id="filter-party"
                  type="text"
                  placeholder="Search party name"
                  value={filters.partyName}
                  onChange={(e) => setFilters({ ...filters, partyName: e.target.value })}
                />
              </div>
            </div>
            {(filters.status || filters.destination || filters.startDate || filters.endDate || filters.partyName) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ status: '', destination: '', startDate: '', endDate: '', partyName: '' })}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredConsignments.length} of {consignments.length} consignment{consignments.length !== 1 ? 's' : ''}
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Date</TableHead>
                <TableHead>Order No</TableHead>
                <TableHead>Party Name</TableHead>
                <TableHead>Image</TableHead>
                <TableHead className="text-right">Bill Value (₹)</TableHead>
                <TableHead>Dispatch Date</TableHead>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsignments.length > 0 ? (
                consignmentPagination.paginatedItems.map((consignment) => (
                <TableRow key={consignment.id}>
                  <TableCell>{new Date(consignment.orderDate).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell className="font-medium">{consignment.orderNo}</TableCell>
                  <TableCell>{consignment.partyName}</TableCell>
                  <TableCell>
                    {consignment.photoUrl ? (
                      <img
                        src={consignment.photoUrl}
                        alt={`Consignment ${consignment.orderNo}`}
                        className="h-10 w-10 rounded object-cover border bg-gray-100"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No image</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {consignment.billValue > 0 ? `₹${consignment.billValue.toLocaleString('en-IN')}` : '-'}
                  </TableCell>
                  <TableCell>
                    {consignment.dispatchDate !== '-' 
                      ? new Date(consignment.dispatchDate).toLocaleDateString('en-IN')
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="font-medium">{consignment.trackingId}</TableCell>
                  <TableCell>{consignment.destination}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      consignment.status === 'Dispatched' 
                        ? 'bg-green-100 text-green-800' 
                        : consignment.status === 'In Transit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {consignment.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewConsignment(consignment)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    No consignments found matching the filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {filteredConsignments.length > 0 && <TablePaginationControls {...consignmentPagination} />}
        </CardContent>
      </Card>

      {/* Booking Entry Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consignment Booking Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order-date">Order Date *</Label>
                <Input
                  id="order-date"
                  type="date"
                  value={bookingData.orderDate}
                  onChange={(e) => setBookingData({ ...bookingData, orderDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-no">Order No. *</Label>
                <Input
                  id="order-no"
                  type="text"
                  placeholder="Enter order number"
                  value={bookingData.orderNo}
                  onChange={(e) => setBookingData({ ...bookingData, orderNo: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination *</Label>
              <Select
                id="destination"
                value={bookingData.destination}
                onChange={(e) => setBookingData({ 
                  ...bookingData, 
                  destination: e.target.value,
                  partyId: '',
                  partyName: ''
                })}
                required
              >
                <option value="">Select Destination</option>
                <option value="To SS">To SS (Super Stockist)</option>
                <option value="To Dist">To Dist (Distributor)</option>
                <option value="To Shop">To Shop</option>
                <option value="To Promoter">To Promoter</option>
              </Select>
            </div>

            {bookingData.destination && (
              <div className="space-y-2">
                <Label htmlFor="party-name">
                  Select {bookingData.destination === 'To SS' ? 'Super Stockist' : 
                          bookingData.destination === 'To Dist' ? 'Distributor' :
                          bookingData.destination === 'To Shop' ? 'Shop' : 'Promoter'} *
                </Label>
                <Select
                  id="party-name"
                  value={bookingData.partyId}
                  onChange={(e) => {
                    const selectedParty = getPartyList().find(p => p.id === parseInt(e.target.value))
                    setBookingData({ 
                      ...bookingData, 
                      partyId: e.target.value,
                      partyName: selectedParty?.name || ''
                    })
                  }}
                  required
                >
                  <option value="">Select {bookingData.destination === 'To SS' ? 'Super Stockist' : 
                                    bookingData.destination === 'To Dist' ? 'Distributor' :
                                    bookingData.destination === 'To Shop' ? 'Shop' : 'Promoter'}</option>
                  {getPartyList().map((party) => (
                    <option key={party.id} value={party.id}>
                      {party.name} {party.code ? `(${party.code})` : ''}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tracking-id">Tracking ID *</Label>
              <Input
                id="tracking-id"
                type="text"
                placeholder="Enter tracking ID"
                value={bookingData.docketNo}
                onChange={(e) => setBookingData({ ...bookingData, docketNo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="boxes">Number of Boxes *</Label>
              <Input
                id="boxes"
                type="number"
                placeholder="Enter number of boxes"
                value={bookingData.numberOfBoxes}
                onChange={(e) => setBookingData({ ...bookingData, numberOfBoxes: e.target.value })}
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transporter">Transporter Name *</Label>
              <Input
                id="transporter"
                type="text"
                placeholder="Enter transporter name"
                value={bookingData.transporterName}
                onChange={(e) => setBookingData({ ...bookingData, transporterName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Upload Photo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBookingData({ ...bookingData, photo: e.target.files[0] })}
                />
                <Upload className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBookingSubmit}
              className="bg-[#433228] hover:bg-[#5a4238] text-white"
            >
              Create Booking Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl">
          {viewingConsignment && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Consignment Details</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">Order No:</span> {viewingConsignment.orderNo}</div>
                <div><span className="font-semibold">Order Date:</span> {new Date(viewingConsignment.orderDate).toLocaleDateString('en-IN')}</div>
                <div><span className="font-semibold">Party Name:</span> {viewingConsignment.partyName}</div>
                <div><span className="font-semibold">Tracking ID:</span> {viewingConsignment.trackingId}</div>
                <div><span className="font-semibold">Destination:</span> {viewingConsignment.destination}</div>
                <div><span className="font-semibold">Status:</span> {viewingConsignment.status}</div>
                <div><span className="font-semibold">Bill Value:</span> {viewingConsignment.billValue > 0 ? `₹${viewingConsignment.billValue.toLocaleString('en-IN')}` : '-'}</div>
                <div><span className="font-semibold">Dispatch Date:</span> {viewingConsignment.dispatchDate !== '-' ? new Date(viewingConsignment.dispatchDate).toLocaleDateString('en-IN') : '-'}</div>
                {viewingConsignment.numberOfBoxes ? (
                  <div><span className="font-semibold">No. of Boxes:</span> {viewingConsignment.numberOfBoxes}</div>
                ) : null}
                {viewingConsignment.transporterName ? (
                  <div><span className="font-semibold">Transporter:</span> {viewingConsignment.transporterName}</div>
                ) : null}
              </div>

              <div className="pt-2">
                <p className="text-sm font-semibold mb-2">Uploaded Image</p>
                {viewingConsignment.photoUrl ? (
                  <img
                    src={viewingConsignment.photoUrl}
                    alt={`Consignment ${viewingConsignment.orderNo}`}
                    className="max-h-72 w-full object-contain rounded border bg-gray-50"
                  />
                ) : (
                  <div className="text-sm text-gray-500 border rounded p-4">No image uploaded for this consignment.</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HRConsignment
