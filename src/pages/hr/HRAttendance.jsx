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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { FileText, Download, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
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
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report')
  
  // Generate XLSX file and download
  XLSX.writeFile(workbook, filename)
}

// Mock Attendance Categories
const ATTENDANCE_CATEGORIES = [
  'Management',
  'Factory Employees',
  'RSM',
  'Supervisors',
  'Promoters'
]

// Mock Employee Names by Category
const MOCK_EMPLOYEES = {
  'Management': ['Gokul', 'Shyam', 'Meenashakti', 'Rajesh Kumar'],
  'Factory Employees': ['Factory Worker 1', 'Factory Worker 2', 'Factory Worker 3'],
  'RSM': ['Rajesh Kumar', 'Priya Menon', 'Suresh Iyer'],
  'Supervisors': ['Mohan Raj', 'Karthik Senthil', 'Vikram Reddy'],
  'Promoters': ['Kavitha Rani', 'Selvi Murugan', 'Malathi Devi']
}

// Mock Attendance Report Data
const MOCK_ATTENDANCE_REPORT = [
  { 
    name: 'Gokul', 
    category: 'Management', 
    date: '2026-01-15', 
    clockIn: '09:00 AM', 
    clockOut: '06:00 PM', 
    status: 'Present',
    reason: ''
  },
  { 
    name: 'Shyam', 
    category: 'Management', 
    date: '2026-01-15', 
    clockIn: '09:15 AM', 
    clockOut: '06:30 PM', 
    status: 'Present',
    reason: ''
  },
  { 
    name: 'Rajesh Kumar', 
    category: 'RSM', 
    date: '2026-01-15', 
    clockIn: '-', 
    clockOut: '-', 
    status: 'Leave',
    reason: 'Personal work'
  },
  { 
    name: 'Priya Menon', 
    category: 'ASM', 
    date: '2026-01-16', 
    clockIn: '-', 
    clockOut: '-', 
    status: 'Leave',
    reason: 'Sick leave - Medical appointment'
  },
  { 
    name: 'Mohan Raj', 
    category: 'Supervisors', 
    date: '2026-01-17', 
    clockIn: '-', 
    clockOut: '-', 
    status: 'Leave',
    reason: 'Family function'
  },
]

// Mock Consolidated Report Data
const MOCK_CONSOLIDATED_REPORT = [
  {
    name: 'Gokul',
    category: 'Management',
    totalDays: 30,
    daysPresent: 28,
    lop: 0,
    sickLeave: 1,
    casualLeave: 1,
    weekOff: 0,
    leaveReasons: {
      sickLeave: 'Medical appointment',
      casualLeave: 'Personal work'
    }
  },
  {
    name: 'Shyam',
    category: 'Management',
    totalDays: 30,
    daysPresent: 26,
    lop: 1,
    sickLeave: 1,
    casualLeave: 2,
    weekOff: 0,
    leaveReasons: {
      sickLeave: 'Fever',
      casualLeave: 'Family function, Personal work'
    }
  },
  {
    name: 'Rajesh Kumar',
    category: 'RSM',
    totalDays: 30,
    daysPresent: 25,
    lop: 0,
    sickLeave: 2,
    casualLeave: 1,
    weekOff: 2,
    leaveReasons: {
      sickLeave: 'Medical checkup, Health issue',
      casualLeave: 'Personal work'
    }
  },
]

// Mock Today's Attendance Data
const MOCK_TODAY_ATTENDANCE = [
  { id: 1, name: 'Gokul', designation: 'HR', clockIn: '09:00 AM', clockOut: '06:00 PM', status: 'Present' },
  { id: 2, name: 'Shyam', designation: 'DM', clockIn: '09:15 AM', clockOut: '-', status: 'Present' },
  { id: 3, name: 'Meenashakti', designation: 'HR', clockIn: '09:30 AM', clockOut: '-', status: 'Present' },
  { id: 4, name: 'Rajesh Kumar', designation: 'RSM', clockIn: '-', clockOut: '-', status: 'Week Off' },
  { id: 5, name: 'Priya Menon', designation: 'ASM', clockIn: '-', clockOut: '-', status: 'Leave' },
]

const HRAttendance = () => {
  const [reportData, setReportData] = useState({
    category: '',
    name: '',
    startDate: '',
    endDate: '',
  })
  const [consolidatedData, setConsolidatedData] = useState({
    category: '',
    startDate: '',
    endDate: '',
  })
  const [showReport, setShowReport] = useState(true)
  const [showConsolidatedReport, setShowConsolidatedReport] = useState(true)
  const [showTodayAttendance, setShowTodayAttendance] = useState(false)

  const presentCount = MOCK_TODAY_ATTENDANCE.filter(emp => emp.status === 'Present').length
  const leaveCount = MOCK_TODAY_ATTENDANCE.filter(emp => emp.status === 'Leave').length
  const weekOffCount = MOCK_TODAY_ATTENDANCE.filter(emp => emp.status === 'Week Off').length

  const handleGenerateReport = () => {
    if (!reportData.category || !reportData.startDate || !reportData.endDate) {
      alert('Please fill all required fields')
      return
    }
    setShowReport(true)
  }

  const handleGenerateConsolidatedReport = () => {
    if (!consolidatedData.category || !consolidatedData.startDate || !consolidatedData.endDate) {
      alert('Please fill all required fields')
      return
    }
    setShowConsolidatedReport(true)
  }

  const handleDownloadAttendanceReport = (format = 'csv') => {
    if (filteredReport.length === 0) {
      alert('No data to download')
      return
    }

    const headers = ['Name', 'Category', 'Date', 'Clock In', 'Clock Out', 'Status', 'Reason']
    const data = filteredReport.map(item => ({
      Name: item.name,
      Category: item.category,
      Date: new Date(item.date).toLocaleDateString('en-IN'),
      'Clock In': item.clockIn,
      'Clock Out': item.clockOut,
      Status: item.status,
      Reason: item.status === 'Leave' ? (item.reason || '') : ''
    }))

    const dateRange = `${reportData.startDate}_to_${reportData.endDate}`
    const filename = `Attendance_Report_${dateRange}.${format}`

    if (format === 'csv') {
      const csvContent = convertToCSV(data, headers)
      downloadCSV(csvContent, filename)
    } else {
      downloadXLSX(data, headers, filename)
    }
  }

  const handleDownloadConsolidatedReport = (format = 'csv') => {
    if (filteredConsolidated.length === 0) {
      alert('No data to download')
      return
    }

    const headers = ['Name', 'Category', 'Total Days', 'Days Present', 'LOP', 'Sick Leave', 'Casual Leave', 'Week Off', 'Leave Reasons']
    const data = filteredConsolidated.map(item => ({
      Name: item.name,
      Category: item.category,
      'Total Days': item.totalDays,
      'Days Present': item.daysPresent,
      LOP: item.lop,
      'Sick Leave': item.sickLeave,
      'Casual Leave': item.casualLeave,
      'Week Off': item.weekOff,
      'Leave Reasons': item.leaveReasons 
        ? `${item.sickLeave > 0 ? `Sick: ${item.leaveReasons.sickLeave || ''}` : ''}${item.sickLeave > 0 && item.casualLeave > 0 ? '; ' : ''}${item.casualLeave > 0 ? `Casual: ${item.leaveReasons.casualLeave || ''}` : ''}`
        : ''
    }))

    const dateRange = `${consolidatedData.startDate}_to_${consolidatedData.endDate}`
    const filename = `Consolidated_Attendance_Report_${dateRange}.${format}`

    if (format === 'csv') {
      const csvContent = convertToCSV(data, headers)
      downloadCSV(csvContent, filename)
    } else {
      downloadXLSX(data, headers, filename)
    }
  }

  const filteredReport = MOCK_ATTENDANCE_REPORT.filter(item => {
    // Apply filters only if they are filled
    if (reportData.category && item.category !== reportData.category) return false
    if (reportData.name && item.name !== reportData.name) return false
    if (reportData.startDate && item.date < reportData.startDate) return false
    if (reportData.endDate && item.date > reportData.endDate) return false
    return true
  })

  const filteredConsolidated = MOCK_CONSOLIDATED_REPORT.filter(item => {
    // Apply filters only if they are filled
    if (consolidatedData.category && item.category !== consolidatedData.category) return false
    return true
  })

  const attendanceReportPagination = useTablePagination(filteredReport)
  const consolidatedAttendancePagination = useTablePagination(filteredConsolidated)
  const todayAttendancePagination = useTablePagination(MOCK_TODAY_ATTENDANCE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-600 mt-2">View and manage employee attendance reports</p>
      </div>

      {/* Dashboard UI - Today's Attendance Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Present Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{presentCount}</div>
            <p className="text-sm text-gray-600 mt-2">Employees present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              On Leave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{leaveCount}</div>
            <p className="text-sm text-gray-600 mt-2">Employees on leave</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Week Off
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{weekOffCount}</div>
            <p className="text-sm text-gray-600 mt-2">Employees on week off</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Attendance Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#433228]" />
            Today's Attendance
          </CardTitle>
          <CardDescription>View attendance status for today</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowTodayAttendance(true)}
            className="bg-[#433228] hover:bg-[#5a4238] text-white"
          >
            View Today's Attendance
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="view-report" className="w-full">
        <TabsList>
          <TabsTrigger value="view-report">View Attendance Report</TabsTrigger>
          <TabsTrigger value="consolidated">Consolidated Report</TabsTrigger>
        </TabsList>

        {/* View Attendance Report */}
        <TabsContent value="view-report">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#433228]" />
                View Attendance Report
              </CardTitle>
              <CardDescription>Filter attendance by category, name, and date range</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      id="category"
                      value={reportData.category}
                      onChange={(e) => {
                        setReportData({ ...reportData, category: e.target.value, name: '' })
                        setShowReport(true)
                      }}
                    >
                      <option value="">All Categories</option>
                      {ATTENDANCE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Select
                      id="name"
                      value={reportData.name}
                      onChange={(e) => {
                        setReportData({ ...reportData, name: e.target.value })
                        setShowReport(true)
                      }}
                      disabled={!reportData.category}
                    >
                      <option value="">All Names</option>
                      {reportData.category && MOCK_EMPLOYEES[reportData.category]?.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={reportData.startDate}
                      onChange={(e) => {
                        setReportData({ ...reportData, startDate: e.target.value })
                        setShowReport(true)
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={reportData.endDate}
                      onChange={(e) => {
                        setReportData({ ...reportData, endDate: e.target.value })
                        setShowReport(true)
                      }}
                      min={reportData.startDate}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                >
                  Apply Filters
                </Button>

                {filteredReport.length > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Attendance Report</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadAttendanceReport('csv')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadAttendanceReport('xlsx')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download XLSX
                        </Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Clock In</TableHead>
                          <TableHead>Clock Out</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reason (for Leave)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceReportPagination.paginatedItems.map((item, index) => (
                          <TableRow key={`${item.name}-${item.date}-${index}`}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{new Date(item.date).toLocaleDateString('en-IN')}</TableCell>
                            <TableCell>{item.clockIn}</TableCell>
                            <TableCell>{item.clockOut}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === 'Present' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.status}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              {item.status === 'Leave' && item.reason ? (
                                <span className="text-sm text-gray-700 italic">{item.reason}</span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredReport.length > 0 && <TablePaginationControls {...attendanceReportPagination} />}
                  </div>
                )}

                {filteredReport.length === 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">No attendance records found for the selected filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consolidated Report */}
        <TabsContent value="consolidated">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#433228]" />
                Consolidated Report
              </CardTitle>
              <CardDescription>View comprehensive attendance summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cons-category">Category</Label>
                    <Select
                      id="cons-category"
                      value={consolidatedData.category}
                      onChange={(e) => {
                        setConsolidatedData({ ...consolidatedData, category: e.target.value })
                        setShowConsolidatedReport(true)
                      }}
                    >
                      <option value="">All Categories</option>
                      {ATTENDANCE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cons-start-date">Start Date</Label>
                    <Input
                      id="cons-start-date"
                      type="date"
                      value={consolidatedData.startDate}
                      onChange={(e) => {
                        setConsolidatedData({ ...consolidatedData, startDate: e.target.value })
                        setShowConsolidatedReport(true)
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cons-end-date">End Date</Label>
                    <Input
                      id="cons-end-date"
                      type="date"
                      value={consolidatedData.endDate}
                      onChange={(e) => {
                        setConsolidatedData({ ...consolidatedData, endDate: e.target.value })
                        setShowConsolidatedReport(true)
                      }}
                      min={consolidatedData.startDate}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateConsolidatedReport}
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                >
                  Apply Filters
                </Button>

                {filteredConsolidated.length > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Consolidated Attendance Report</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadConsolidatedReport('csv')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadConsolidatedReport('xlsx')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download XLSX
                        </Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Total Days</TableHead>
                          <TableHead>Days Present</TableHead>
                          <TableHead>LOP</TableHead>
                          <TableHead>Sick Leave</TableHead>
                          <TableHead>Casual Leave</TableHead>
                          <TableHead>Week Off</TableHead>
                          <TableHead>Leave Reasons</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consolidatedAttendancePagination.paginatedItems.map((item, index) => (
                          <TableRow key={`${item.name}-${item.category}-${index}`}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.totalDays}</TableCell>
                            <TableCell className="text-green-600 font-semibold">{item.daysPresent}</TableCell>
                            <TableCell className="text-red-600">{item.lop}</TableCell>
                            <TableCell>{item.sickLeave}</TableCell>
                            <TableCell>{item.casualLeave}</TableCell>
                            <TableCell>{item.weekOff}</TableCell>
                            <TableCell className="max-w-xs">
                              {item.leaveReasons && (item.sickLeave > 0 || item.casualLeave > 0) ? (
                                <div className="text-xs text-gray-700 space-y-1">
                                  {item.sickLeave > 0 && item.leaveReasons.sickLeave && (
                                    <div>
                                      <span className="font-medium">Sick:</span> {item.leaveReasons.sickLeave}
                                    </div>
                                  )}
                                  {item.casualLeave > 0 && item.leaveReasons.casualLeave && (
                                    <div>
                                      <span className="font-medium">Casual:</span> {item.leaveReasons.casualLeave}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredConsolidated.length > 0 && <TablePaginationControls {...consolidatedAttendancePagination} />}
                  </div>
                )}

                {filteredConsolidated.length === 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">No consolidated data found for the selected filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Today's Attendance Dialog */}
      <Dialog open={showTodayAttendance} onOpenChange={setShowTodayAttendance}>
        <DialogContent className="w-full max-w-[95vw] lg:max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Today's Attendance - {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAttendancePagination.paginatedItems.map((employee, index) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      {(todayAttendancePagination.page - 1) * todayAttendancePagination.pageSize + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>{employee.clockIn}</TableCell>
                    <TableCell>{employee.clockOut}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.status === 'Present' 
                          ? 'bg-green-100 text-green-800' 
                          : employee.status === 'Leave'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {employee.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {MOCK_TODAY_ATTENDANCE.length > 0 && <TablePaginationControls {...todayAttendancePagination} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HRAttendance
