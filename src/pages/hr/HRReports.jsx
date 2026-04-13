import { useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { FileText, Download, CheckCircle, XCircle, Edit, Eye, Play, Pause, Headphones } from 'lucide-react'
import { MOCK_SS_LIST, MOCK_HIERARCHY, MOCK_SHOPS } from '../../data/mockData'
import * as XLSX from 'xlsx'

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
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')
  
  // Generate XLSX file and download
  XLSX.writeFile(workbook, filename)
}

// Mock Sales Report Data
const MOCK_SALES_REPORT = [
  { ssName: 'Beauty Cosmetics Super Stockist', distName: 'Beauty Distributors Chennai', supName: 'Mohan Raj', shopName: 'Beauty Zone T Nagar', salesValue: 250000 },
  { ssName: 'Glow Beauty Wholesale', distName: 'Cosmetic Solutions Pvt Ltd', supName: 'Karthik Senthil', shopName: 'Glow Beauty Parlour', salesValue: 180000 },
]

// Mock Daily Activity Report Data
const MOCK_DAILY_ACTIVITY = [
  {
    id: 1,
    employeeName: 'Rajesh Kumar',
    date: '2026-01-15',
    workArea: 'Chennai',
    purposeOfVisit: 'Sales Development',
    voice: 'Voice recording available',
    voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Sample audio URL
    reason: 'Follow up on previous sales order and discuss new product launch',
    photos: [
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop',
    ],
    status: 'Pending',
  },
  {
    id: 2,
    employeeName: 'Priya Menon',
    date: '2026-01-15',
    workArea: 'Coimbatore',
    purposeOfVisit: 'Distributor Appointment',
    voice: 'Voice recording available',
    voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Sample audio URL
    reason: 'Meeting with distributor to discuss monthly targets and incentives',
    photos: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop',
    ],
    status: 'Approved',
  },
  {
    id: 3,
    employeeName: 'Mohan Raj',
    date: '2026-01-16',
    workArea: 'Madurai',
    purposeOfVisit: 'New Shop Activation',
    voice: 'No voice recording',
    voiceUrl: null,
    reason: 'Activate new shop and provide product training to shop staff',
    photos: [
      'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop',
    ],
    status: 'Pending',
  },
]

// Mock Stock Report Data - Distributor/Shop Level
const MOCK_STOCK_REPORT = [
  { storeName: 'Beauty Zone T Nagar', distributor: 'Beauty Distributors Chennai', currentStock: 1250, value: 625000 },
  { storeName: 'Glow Beauty Parlour', distributor: 'Beauty Distributors Chennai', currentStock: 980, value: 490000 },
  { storeName: 'Radiance Cosmetics', distributor: 'Cosmetic Solutions Pvt Ltd', currentStock: 1120, value: 560000 },
  { storeName: 'Beauty World', distributor: 'Glow Distributors', currentStock: 850, value: 425000 },
]

// Mock Super Stockist Stock Report Data
const MOCK_SS_STOCK_REPORT = [
  { ssName: 'Beauty Cosmetics Super Stockist', city: 'Chennai', currentStock: 12500, value: 6250000, lastUpdated: '2026-01-25' },
  { ssName: 'Glow Beauty Wholesale', city: 'Coimbatore', currentStock: 9800, value: 4900000, lastUpdated: '2026-01-25' },
  { ssName: 'Radiance Cosmetics Hub', city: 'Madurai', currentStock: 11200, value: 5600000, lastUpdated: '2026-01-24' },
  { ssName: 'Beauty World Super Stockist', city: 'Salem', currentStock: 8500, value: 4250000, lastUpdated: '2026-01-24' },
  { ssName: 'Cosmetic Solutions SS', city: 'Tiruchirappalli', currentStock: 9200, value: 4600000, lastUpdated: '2026-01-25' },
]

const HRReports = () => {
  const [salesReportData, setSalesReportData] = useState({
    ssId: '',
    distributorId: '',
    shopId: '',
  })
  const [showSalesReport, setShowSalesReport] = useState(true)
  const [showDailyActivity, setShowDailyActivity] = useState(false)
  const [showStockReport, setShowStockReport] = useState(true)
  const [stockReportType, setStockReportType] = useState('distributor') // 'distributor' or 'superstockist'
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showActivityDialog, setShowActivityDialog] = useState(false)
  const [showViewActivityDialog, setShowViewActivityDialog] = useState(false)
  const [viewingActivity, setViewingActivity] = useState(null)
  const [playingAudioId, setPlayingAudioId] = useState(null)
  const [audioRefs, setAudioRefs] = useState({})

  // Filter sales report data based on selected filters
  const filteredSalesReport = MOCK_SALES_REPORT.filter(report => {
    return true
  })

  const salesReportPagination = useTablePagination(filteredSalesReport)
  const dailyActivityPagination = useTablePagination(MOCK_DAILY_ACTIVITY)
  const ssStockReportPagination = useTablePagination(MOCK_SS_STOCK_REPORT)
  const distStockReportPagination = useTablePagination(MOCK_STOCK_REPORT)

  const handleGenerateSalesReport = () => {
    // Filters are optional - just ensure report is shown
    setShowSalesReport(true)
  }

  const handleApproveActivity = (activityId) => {
    alert(`Activity ${activityId} approved`)
    setShowDailyActivity(true)
  }

  const handleModifyActivity = (activity) => {
    setSelectedActivity(activity)
    setShowActivityDialog(true)
  }

  const handleViewActivity = (activity) => {
    // Stop any playing audio when opening dialog
    if (playingAudioId) {
      const playingAudio = document.getElementById(`audio-${playingAudioId}`)
      if (playingAudio) {
        playingAudio.pause()
        setPlayingAudioId(null)
      }
    }
    setViewingActivity(activity)
    setShowViewActivityDialog(true)
  }

  const handlePlayPauseAudio = (activityId, audioUrl) => {
    if (!audioUrl) return

    const audioId = `audio-${activityId}`
    const audioElement = document.getElementById(audioId)

    if (!audioElement) return

    if (playingAudioId === activityId) {
      // Pause current audio
      audioElement.pause()
      setPlayingAudioId(null)
    } else {
      // Pause any other playing audio (both table and dialog)
      if (playingAudioId) {
        const prevTableAudio = document.getElementById(`audio-${playingAudioId}`)
        const prevDialogAudio = document.getElementById(`audio-detail-${playingAudioId}`)
        if (prevTableAudio) prevTableAudio.pause()
        if (prevDialogAudio) prevDialogAudio.pause()
      }
      // Play new audio
      audioElement.play()
      setPlayingAudioId(activityId)
    }
  }

  const handleAudioEnded = () => {
    setPlayingAudioId(null)
  }

  const handleDialogAudioPlay = (activityId) => {
    // Sync with table audio state
    if (playingAudioId && playingAudioId !== activityId) {
      const prevAudio = document.getElementById(`audio-${playingAudioId}`)
      if (prevAudio) {
        prevAudio.pause()
      }
    }
    setPlayingAudioId(activityId)
  }

  const handleDialogAudioPause = () => {
    setPlayingAudioId(null)
  }

  const handleAcceptModifiedActivity = () => {
    alert('Modified activity accepted')
    setShowActivityDialog(false)
    setSelectedActivity(null)
  }

  // Filter shops based on selected distributor
  const getFilteredShops = () => {
    if (!salesReportData.distributorId) return MOCK_SHOPS
    return MOCK_SHOPS.filter(shop => shop.distributorId === parseInt(salesReportData.distributorId))
  }

  // Download Sales Report
  const handleDownloadSalesReport = (format = 'csv') => {
    if (filteredSalesReport.length === 0) {
      alert('No data to download')
      return
    }

    const headers = ['SS Name', 'Distributor', 'Shop', 'Sales Value (₹)']
    const data = filteredSalesReport.map(item => ({
      'SS Name': item.ssName,
      'Distributor': item.distName,
      'Shop': item.shopName,
      'Sales Value (₹)': `₹${item.salesValue.toLocaleString('en-IN')}`
    }))

    const filename = `Sales_Report_${new Date().toISOString().split('T')[0]}.${format}`

    if (format === 'csv') {
      const csvContent = convertToCSV(data, headers)
      downloadCSV(csvContent, filename)
    } else {
      downloadXLSX(data, headers, filename)
    }
  }

  // Download Daily Activity Report
  const handleDownloadDailyActivityReport = (format = 'csv') => {
    if (MOCK_DAILY_ACTIVITY.length === 0) {
      alert('No data to download')
      return
    }

    const headers = ['Employee Name', 'Date', 'Work Area', 'Purpose of Visit', 'Voice', 'Reason', 'Photos', 'Status']
    const data = MOCK_DAILY_ACTIVITY.map(item => ({
      'Employee Name': item.employeeName,
      'Date': new Date(item.date).toLocaleDateString('en-IN'),
      'Work Area': item.workArea,
      'Purpose of Visit': item.purposeOfVisit,
      'Voice': item.voice,
      'Reason': item.reason,
      'Photos': Array.isArray(item.photos) ? item.photos.length : item.photos,
      'Status': item.status
    }))

    const filename = `Daily_Activity_Report_${new Date().toISOString().split('T')[0]}.${format}`

    if (format === 'csv') {
      const csvContent = convertToCSV(data, headers)
      downloadCSV(csvContent, filename)
    } else {
      downloadXLSX(data, headers, filename)
    }
  }

  // Download Stock Report
  const handleDownloadStockReport = (format = 'csv') => {
    const isSSReport = stockReportType === 'superstockist'
    const reportData = isSSReport ? MOCK_SS_STOCK_REPORT : MOCK_STOCK_REPORT

    if (reportData.length === 0) {
      alert('No data to download')
      return
    }

    const headers = isSSReport 
      ? ['Super Stockist Name', 'City', 'Current Stock', 'Stock Value (₹)', 'Last Updated']
      : ['Store Name', 'Distributor', 'Current Stock', 'Stock Value (₹)']
    
    const data = reportData.map(item => {
      if (isSSReport) {
        return {
          'Super Stockist Name': item.ssName,
          'City': item.city,
          'Current Stock': item.currentStock,
          'Stock Value (₹)': `₹${item.value.toLocaleString('en-IN')}`,
          'Last Updated': new Date(item.lastUpdated).toLocaleDateString('en-IN')
        }
      } else {
        return {
          'Store Name': item.storeName,
          'Distributor': item.distributor,
          'Current Stock': item.currentStock,
          'Stock Value (₹)': `₹${item.value.toLocaleString('en-IN')}`
        }
      }
    })

    const reportTypeLabel = isSSReport ? 'Super_Stockist' : 'Distributor_Shop'
    const filename = `Stock_Report_${reportTypeLabel}_${new Date().toISOString().split('T')[0]}.${format}`

    if (format === 'csv') {
      const csvContent = convertToCSV(data, headers)
      downloadCSV(csvContent, filename)
    } else {
      downloadXLSX(data, headers, filename)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">View sales, activity, and stock reports</p>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="activity">Daily Activity Report</TabsTrigger>
          <TabsTrigger value="stock">Stock Report</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#433228]" />
                Sales Report
              </CardTitle>
              <CardDescription>Filter sales data by SS, Distributor, and Shop</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ss-report">Select SS</Label>
                    <Select
                      id="ss-report"
                      value={salesReportData.ssId}
                      onChange={(e) => {
                        setSalesReportData({ ...salesReportData, ssId: e.target.value, distributorId: '', shopId: '' })
                        setShowSalesReport(true)
                      }}
                    >
                      <option value="">All SS</option>
                      {MOCK_SS_LIST.map((ss) => (
                        <option key={ss.id} value={ss.id}>
                          {ss.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dist-report">Select DIST</Label>
                    <Select
                      id="dist-report"
                      value={salesReportData.distributorId}
                      onChange={(e) => {
                        setSalesReportData({ ...salesReportData, distributorId: e.target.value, shopId: '' })
                        setShowSalesReport(true)
                      }}
                    >
                      <option value="">All Distributors</option>
                      {MOCK_HIERARCHY.distributors.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shop-report">Select Shop</Label>
                    <Select
                      id="shop-report"
                      value={salesReportData.shopId}
                      onChange={(e) => {
                        setSalesReportData({ ...salesReportData, shopId: e.target.value })
                        setShowSalesReport(true)
                      }}
                    >
                      <option value="">All Shops</option>
                      {getFilteredShops().map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateSalesReport}
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                >
                  Apply Filters
                </Button>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Sales Report</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadSalesReport('csv')}
                        disabled={filteredSalesReport.length === 0}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadSalesReport('xlsx')}
                        disabled={filteredSalesReport.length === 0}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download XLSX
                      </Button>
                    </div>
                  </div>
                  {filteredSalesReport.length > 0 ? (
                    <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SS Name</TableHead>
                          <TableHead>Distributor</TableHead>
                          <TableHead>Shop</TableHead>
                          <TableHead className="text-right">Sales Value (₹)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesReportPagination.paginatedItems.map((report, index) => (
                          <TableRow key={index}>
                            <TableCell>{report.ssName}</TableCell>
                            <TableCell>{report.distName}</TableCell>
                            <TableCell>{report.shopName}</TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              ₹{report.salesValue.toLocaleString('en-IN')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <TablePaginationControls {...salesReportPagination} />
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No sales data found for the selected filters.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Activity Report */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#433228]" />
                Daily Activity Report
              </CardTitle>
              <CardDescription>Review field activities with work area, purpose of visit, voice recordings, and photos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={() => setShowDailyActivity(true)}
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                >
                  View Daily Activity Report
                </Button>

                {showDailyActivity && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Daily Activity Report</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadDailyActivityReport('csv')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadDailyActivityReport('xlsx')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download XLSX
                        </Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Work Area</TableHead>
                          <TableHead>Purpose of Visit</TableHead>
                          <TableHead>Voice</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Uploaded Photos</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyActivityPagination.paginatedItems.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell className="font-medium">{activity.employeeName}</TableCell>
                            <TableCell>{new Date(activity.date).toLocaleDateString('en-IN')}</TableCell>
                            <TableCell>{activity.workArea}</TableCell>
                            <TableCell>{activity.purposeOfVisit}</TableCell>
                            <TableCell>
                              {activity.voiceUrl ? (
                                <div className="flex items-center gap-2">
                                  <audio
                                    id={`audio-${activity.id}`}
                                    src={activity.voiceUrl}
                                    onEnded={handleAudioEnded}
                                    preload="metadata"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2"
                                    onClick={() => handlePlayPauseAudio(activity.id, activity.voiceUrl)}
                                  >
                                    {playingAudioId === activity.id ? (
                                      <>
                                        <Pause className="h-3 w-3 mr-1" />
                                        Pause
                                      </>
                                    ) : (
                                      <>
                                        <Play className="h-3 w-3 mr-1" />
                                        Play
                                      </>
                                    )}
                                  </Button>
                                  <Headphones className="h-4 w-4 text-green-600" />
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  {activity.voice}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="text-sm truncate" title={activity.reason}>
                                {activity.reason}
                              </p>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-blue-600">
                                {Array.isArray(activity.photos) ? activity.photos.length : activity.photos}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                activity.status === 'Approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {activity.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewActivity(activity)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {activity.status === 'Pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 border-green-600 hover:bg-green-50"
                                      onClick={() => handleApproveActivity(activity.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                                      onClick={() => handleModifyActivity(activity)}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Modify
                                    </Button>
                                  </>
                                )}
                                {activity.status === 'Modified' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                    onClick={handleAcceptModifiedActivity}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Accept
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {MOCK_DAILY_ACTIVITY.length > 0 && <TablePaginationControls {...dailyActivityPagination} />}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Report */}
        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#433228]" />
                Stock Report
              </CardTitle>
              <CardDescription>View current inventory levels at distributor/shop level or super stockist level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Report Type Selector */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                  <Label className="text-sm font-semibold">Report Type:</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={stockReportType === 'distributor' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setStockReportType('distributor')
                        setShowStockReport(true)
                      }}
                      className={stockReportType === 'distributor' ? 'bg-[#433228] hover:bg-[#5a4238] text-white' : ''}
                    >
                      Distributor/Shop Stock
                    </Button>
                    <Button
                      variant={stockReportType === 'superstockist' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setStockReportType('superstockist')
                        setShowStockReport(true)
                      }}
                      className={stockReportType === 'superstockist' ? 'bg-[#433228] hover:bg-[#5a4238] text-white' : ''}
                    >
                      Super Stockist Stock
                    </Button>
                  </div>
                </div>

                {showStockReport && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">
                        {stockReportType === 'superstockist' ? 'Super Stockist Stock Report' : 'Distributor/Shop Stock Report'}
                      </h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadStockReport('csv')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadStockReport('xlsx')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download XLSX
                        </Button>
                      </div>
                    </div>
                    
                    {stockReportType === 'superstockist' ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Super Stockist Name</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead className="text-right">Current Stock</TableHead>
                            <TableHead className="text-right">Stock Value (₹)</TableHead>
                            <TableHead>Last Updated</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {MOCK_SS_STOCK_REPORT.length > 0 ? (
                            ssStockReportPagination.paginatedItems.map((stock, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{stock.ssName}</TableCell>
                                <TableCell>{stock.city}</TableCell>
                                <TableCell className="text-right">{stock.currentStock.toLocaleString('en-IN')}</TableCell>
                                <TableCell className="text-right font-semibold text-green-600">
                                  ₹{stock.value.toLocaleString('en-IN')}
                                </TableCell>
                                <TableCell>{new Date(stock.lastUpdated).toLocaleDateString('en-IN')}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                No super stockist stock data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Store Name</TableHead>
                            <TableHead>Distributor</TableHead>
                            <TableHead className="text-right">Current Stock</TableHead>
                            <TableHead className="text-right">Stock Value (₹)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {MOCK_STOCK_REPORT.length > 0 ? (
                            distStockReportPagination.paginatedItems.map((stock, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{stock.storeName}</TableCell>
                                <TableCell>{stock.distributor}</TableCell>
                                <TableCell className="text-right">{stock.currentStock.toLocaleString('en-IN')}</TableCell>
                                <TableCell className="text-right font-semibold text-green-600">
                                  ₹{stock.value.toLocaleString('en-IN')}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                No distributor/shop stock data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                    {stockReportType === 'superstockist'
                      ? MOCK_SS_STOCK_REPORT.length > 0 && <TablePaginationControls {...ssStockReportPagination} />
                      : MOCK_STOCK_REPORT.length > 0 && <TablePaginationControls {...distStockReportPagination} />}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Activity Dialog */}
      {viewingActivity && (
        <Dialog open={showViewActivityDialog} onOpenChange={setShowViewActivityDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Activity Details - {viewingActivity.employeeName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Employee Name</Label>
                  <p className="mt-1 text-base font-medium">{viewingActivity.employeeName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Date</Label>
                  <p className="mt-1 text-base">{new Date(viewingActivity.date).toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Work Area</Label>
                  <p className="mt-1 text-base">{viewingActivity.workArea}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Purpose of Visit</Label>
                  <p className="mt-1 text-base">{viewingActivity.purposeOfVisit}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600 mb-2 block">Voice Recording</Label>
                  {viewingActivity.voiceUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <audio
                        id={`audio-detail-${viewingActivity.id}`}
                        src={viewingActivity.voiceUrl}
                        onPlay={() => handleDialogAudioPlay(viewingActivity.id)}
                        onPause={handleDialogAudioPause}
                        onEnded={handleAudioEnded}
                        preload="metadata"
                        controls
                        className="flex-1"
                      />
                      <Headphones className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <p className="text-base text-gray-500">
                      {viewingActivity.voice}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Status</Label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      viewingActivity.status === 'Approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {viewingActivity.status}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-600 mb-2 block">Reason</Label>
                <p className="text-base bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {viewingActivity.reason}
                </p>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Photos ({Array.isArray(viewingActivity.photos) ? viewingActivity.photos.length : viewingActivity.photos})</Label>
                {Array.isArray(viewingActivity.photos) && viewingActivity.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {viewingActivity.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=Photo+Not+Available'
                          }}
                          onClick={() => window.open(photo, '_blank')}
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          Photo {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No photos available</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  // Stop audio when closing dialog
                  if (viewingActivity?.voiceUrl) {
                    const audio = document.getElementById(`audio-detail-${viewingActivity.id}`)
                    if (audio) {
                      audio.pause()
                      audio.currentTime = 0
                    }
                  }
                  setShowViewActivityDialog(false)
                  setViewingActivity(null)
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modify Activity Dialog */}
      {selectedActivity && (
        <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modify Activity Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Employee: <strong>{selectedActivity.employeeName}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Date: <strong>{new Date(selectedActivity.date).toLocaleDateString('en-IN')}</strong>
              </p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Activity Details:</p>
                <p className="text-sm">Work Area: {selectedActivity.workArea}</p>
                <p className="text-sm">Purpose of Visit: {selectedActivity.purposeOfVisit}</p>
                <p className="text-sm">Voice: {selectedActivity.voice}</p>
                <p className="text-sm">Reason: {selectedActivity.reason}</p>
                <p className="text-sm">Photos: {Array.isArray(selectedActivity.photos) ? selectedActivity.photos.length : selectedActivity.photos}</p>
              </div>
              <p className="text-sm text-orange-600">
                Make your modifications and click "Accept" to approve the modified activity.
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowActivityDialog(false)
                  setSelectedActivity(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAcceptModifiedActivity}
                className="bg-[#433228] hover:bg-[#5a4238] text-white"
              >
                Accept Modified Activity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default HRReports
