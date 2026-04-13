import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

const REPORT_TYPES = [
  'Opening Stock Report',
  'Purchase Stock Report',
  'Sales Report',
  'Sales Return',
  'Commission Report',
]

const PromoterReports = () => {
  const [selectedReportType, setSelectedReportType] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [viewMode, setViewMode] = useState('current') // 'current' or 'previous'
  const [generatedReport, setGeneratedReport] = useState(null)
  const generatedReportPagination = useTablePagination(generatedReport?.data || [])

  const handleGenerateReport = () => {
    if (!selectedReportType) {
      alert('Please select a report type')
      return
    }

    // Mock report data
    const mockReport = {
      type: selectedReportType,
      date: selectedDate,
      month: selectedMonth,
      data: generateMockReportData(selectedReportType),
    }

    setGeneratedReport(mockReport)
  }

  const generateMockReportData = (reportType) => {
    // Mock data based on report type
    return [
      { id: 1, item: 'Sample Item 1', value: 1000, date: selectedDate },
      { id: 2, item: 'Sample Item 2', value: 2000, date: selectedDate },
      { id: 3, item: 'Sample Item 3', value: 1500, date: selectedDate },
    ]
  }

  const getCurrentMonth = () => {
    const now = new Date()
    return now.toISOString().slice(0, 7)
  }

  const getPreviousMonth = () => {
    const now = new Date()
    now.setMonth(now.getMonth() - 1)
    return now.toISOString().slice(0, 7)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">Generate and view various reports</p>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select report type and date range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Report Type *</Label>
            <Select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
            >
              <option value="">Select Report Type</option>
              {REPORT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Select Month (for monthly reports)</Label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerateReport}
            className="w-full bg-[#433228] hover:bg-[#5a4238]"
            disabled={!selectedReportType}
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Opening Stock Report - Current Month */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Opening Stock Report
          </CardTitle>
          <CardDescription>Current month opening stock</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Month: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Opening Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Sample Product 1</TableCell>
                <TableCell>Face Care</TableCell>
                <TableCell className="text-right">150 units</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sample Product 2</TableCell>
                <TableCell>Body Care</TableCell>
                <TableCell className="text-right">120 units</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Previous Month's Report */}
      <Card>
        <CardHeader>
          <CardTitle>View Previous Month's Report</CardTitle>
          <CardDescription>Select month to view historical reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Month</Label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              max={getPreviousMonth()}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button variant="outline" className="w-full">
            View Report for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Report */}
      {generatedReport && (
        <Card>
          <CardHeader>
            <CardTitle>{generatedReport.type}</CardTitle>
            <CardDescription>
              Generated for {new Date(generatedReport.date).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedReportPagination.paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.item}</TableCell>
                    <TableCell>₹{item.value.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {generatedReport.data.length > 0 && <TablePaginationControls {...generatedReportPagination} />}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PromoterReports
