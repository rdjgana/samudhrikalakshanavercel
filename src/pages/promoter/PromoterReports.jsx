import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Calendar, Save } from 'lucide-react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

const REPORT_TYPES = [
  { key: 'openingStock', label: 'Opening Stock Report' },
  { key: 'purchaseStock', label: 'Purchase Stock Report' },
  { key: 'sales', label: 'Sales Report' },
  { key: 'salesReturn', label: 'Sales Return Report' },
  { key: 'closingStock', label: 'Closing Stock Report' },
]

const PromoterReports = () => {
  const getPreviousMonth = () => {
    const now = new Date()
    now.setMonth(now.getMonth() - 1)
    return now.toISOString().slice(0, 7)
  }

  const today = new Date()
  const currentMonth = today.toISOString().slice(0, 7)
  const [activeReportType, setActiveReportType] = useState('openingStock')
  const [viewMode, setViewMode] = useState('current')
  const [selectedPreviousMonth, setSelectedPreviousMonth] = useState(getPreviousMonth())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('')
  const [isPreviousReportModalOpen, setIsPreviousReportModalOpen] = useState(false)
  const [closingStockEntries, setClosingStockEntries] = useState({
    1: 115,
    2: 94,
    3: 108,
    4: 76,
  })

  const reportData = {
    openingStock: [
      { id: 1, product: 'Face Wash', category: 'Face Care', units: 150 },
      { id: 2, product: 'Body Lotion', category: 'Body Care', units: 130 },
      { id: 3, product: 'Shampoo', category: 'Hair Care', units: 145 },
      { id: 4, product: 'Soap', category: 'Personal Care', units: 120 },
    ],
    purchaseStock: [
      { id: 1, product: 'Face Wash', category: 'Face Care', units: 60, amount: 15000 },
      { id: 2, product: 'Body Lotion', category: 'Body Care', units: 45, amount: 13500 },
      { id: 3, product: 'Shampoo', category: 'Hair Care', units: 50, amount: 9000 },
      { id: 4, product: 'Soap', category: 'Personal Care', units: 70, amount: 3500 },
    ],
    sales: [
      { id: 1, product: 'Face Wash', category: 'Face Care', units: 75, amount: 18750 },
      { id: 2, product: 'Body Lotion', category: 'Body Care', units: 52, amount: 15600 },
      { id: 3, product: 'Shampoo', category: 'Hair Care', units: 63, amount: 11340 },
      { id: 4, product: 'Soap', category: 'Personal Care', units: 88, amount: 4400 },
    ],
    salesReturn: [
      { id: 1, product: 'Face Wash', category: 'Face Care', units: 5, reason: 'Damaged pack' },
      { id: 2, product: 'Body Lotion', category: 'Body Care', units: 3, reason: 'Near expiry' },
      { id: 3, product: 'Shampoo', category: 'Hair Care', units: 4, reason: 'Leakage' },
      { id: 4, product: 'Soap', category: 'Personal Care', units: 2, reason: 'Customer return' },
    ],
    closingStock: [
      { id: 1, product: 'Face Wash', category: 'Face Care' },
      { id: 2, product: 'Body Lotion', category: 'Body Care' },
      { id: 3, product: 'Shampoo', category: 'Hair Care' },
      { id: 4, product: 'Soap', category: 'Personal Care' },
    ],
  }
  const activeRows = reportData[activeReportType]
  const reportPagination = useTablePagination(activeRows || [])

  const previousMonthCalendarData = useMemo(() => {
    const [yearStr, monthStr] = selectedPreviousMonth.split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10) - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()

    const days = []
    for (let i = 0; i < firstDay; i += 1) {
      days.push({ isPadding: true, key: `p-${i}` })
    }
    for (let date = 1; date <= daysInMonth; date += 1) {
      const dateKey = `${selectedPreviousMonth}-${String(date).padStart(2, '0')}`
      const hasReport = date % 2 === 0 || date % 5 === 0
      days.push({ isPadding: false, key: dateKey, date, hasReport })
    }
    return days
  }, [selectedPreviousMonth])

  const selectedCalendarDay = previousMonthCalendarData.find(
    (day) => !day.isPadding && day.key === selectedCalendarDate,
  )

  const previousDayReportData = useMemo(() => {
    if (!selectedCalendarDate || !selectedCalendarDay?.hasReport) return null

    const dayNumber = parseInt(selectedCalendarDate.split('-')[2], 10)
    const unitShift = dayNumber % 7
    const amountShift = dayNumber * 120

    return {
      openingStock: [
        { id: 1, product: 'Face Wash', category: 'Face Care', units: 140 + unitShift },
        { id: 2, product: 'Body Lotion', category: 'Body Care', units: 122 + unitShift },
        { id: 3, product: 'Shampoo', category: 'Hair Care', units: 136 + unitShift },
        { id: 4, product: 'Soap', category: 'Personal Care', units: 118 + unitShift },
      ],
      purchaseStock: [
        { id: 1, product: 'Face Wash', category: 'Face Care', units: 20 + unitShift, amount: 5000 + amountShift },
        { id: 2, product: 'Body Lotion', category: 'Body Care', units: 16 + unitShift, amount: 4800 + amountShift },
        { id: 3, product: 'Shampoo', category: 'Hair Care', units: 18 + unitShift, amount: 3240 + amountShift },
        { id: 4, product: 'Soap', category: 'Personal Care', units: 24 + unitShift, amount: 1200 + amountShift },
      ],
      sales: [
        { id: 1, product: 'Face Wash', category: 'Face Care', units: 26 + unitShift, amount: 6500 + amountShift },
        { id: 2, product: 'Body Lotion', category: 'Body Care', units: 21 + unitShift, amount: 6300 + amountShift },
        { id: 3, product: 'Shampoo', category: 'Hair Care', units: 24 + unitShift, amount: 4320 + amountShift },
        { id: 4, product: 'Soap', category: 'Personal Care', units: 32 + unitShift, amount: 1600 + amountShift },
      ],
      salesReturn: [
        { id: 1, product: 'Face Wash', category: 'Face Care', units: 1 + (dayNumber % 2), reason: 'Damaged pack' },
        { id: 2, product: 'Body Lotion', category: 'Body Care', units: 1, reason: 'Leakage' },
        { id: 3, product: 'Shampoo', category: 'Hair Care', units: 2, reason: 'Near expiry' },
        { id: 4, product: 'Soap', category: 'Personal Care', units: 1, reason: 'Customer return' },
      ],
      closingStock: [
        { id: 1, product: 'Face Wash', category: 'Face Care', units: 132 + unitShift },
        { id: 2, product: 'Body Lotion', category: 'Body Care', units: 115 + unitShift },
        { id: 3, product: 'Shampoo', category: 'Hair Care', units: 126 + unitShift },
        { id: 4, product: 'Soap', category: 'Personal Care', units: 109 + unitShift },
      ],
    }
  }, [selectedCalendarDate, selectedCalendarDay])

  const formatMonth = (monthValue) =>
    new Date(`${monthValue}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const handleClosingStockChange = (productId, value) => {
    setClosingStockEntries((prev) => ({
      ...prev,
      [productId]: value === '' ? '' : Number(value),
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">View monthly stock and sales reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report View</CardTitle>
          <CardDescription>Choose current month report or previous month calendar view</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={viewMode === 'current' ? 'default' : 'outline'}
              className={viewMode === 'current' ? 'bg-[#433228] hover:bg-[#5a4238]' : ''}
              onClick={() => setViewMode('current')}
            >
              Current Month Reports
            </Button>
            <Button
              variant={viewMode === 'previous' ? 'default' : 'outline'}
              className={viewMode === 'previous' ? 'bg-[#433228] hover:bg-[#5a4238]' : ''}
              onClick={() => setViewMode('previous')}
            >
              Previous Month Calendar
            </Button>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'current' && (
        <Card>
          <CardHeader>
            <CardTitle>Current Month Report Options</CardTitle>
            <CardDescription>
              Month: {formatMonth(currentMonth)} | Closing stock is manually entered by promoter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {REPORT_TYPES.map((report) => (
                <Button
                  key={report.key}
                  variant={activeReportType === report.key ? 'default' : 'outline'}
                  className={activeReportType === report.key ? 'bg-[#433228] hover:bg-[#5a4238]' : ''}
                  onClick={() => setActiveReportType(report.key)}
                >
                  {report.label}
                </Button>
              ))}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  {(activeReportType === 'purchaseStock' || activeReportType === 'sales') && (
                    <TableHead className="text-right">Amount</TableHead>
                  )}
                  {activeReportType === 'salesReturn' ? (
                    <TableHead>Reason</TableHead>
                  ) : (
                    <TableHead className="text-right">
                      {activeReportType === 'openingStock' && 'Opening Stock'}
                      {activeReportType === 'purchaseStock' && 'Purchased Units'}
                      {activeReportType === 'sales' && 'Sold Units'}
                      {activeReportType === 'closingStock' && 'Closing Stock (Manual)'}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportPagination.paginatedItems.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    {(activeReportType === 'purchaseStock' || activeReportType === 'sales') && (
                      <TableCell className="text-right">₹{row.amount.toLocaleString('en-IN')}</TableCell>
                    )}
                    {activeReportType === 'salesReturn' ? (
                      <TableCell>{row.reason}</TableCell>
                    ) : activeReportType === 'closingStock' ? (
                      <TableCell className="text-right">
                        <input
                          type="number"
                          min="0"
                          className="h-9 w-28 rounded-md border border-input px-2 text-right text-sm"
                          value={closingStockEntries[row.id] ?? ''}
                          onChange={(e) => handleClosingStockChange(row.id, e.target.value)}
                        />
                      </TableCell>
                    ) : (
                      <TableCell className="text-right">{row.units} units</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {activeRows.length > 0 && <TablePaginationControls {...reportPagination} />}

            {activeReportType === 'closingStock' && (
              <div className="flex justify-end">
                <Button
                  className="bg-[#433228] hover:bg-[#5a4238]"
                  onClick={() => alert('Closing stock saved successfully for current month')}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Closing Stock
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {viewMode === 'previous' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Previous Month Reports (Calendar View)
            </CardTitle>
            <CardDescription>Select a previous month and click a date to view report availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Month</Label>
              <input
                type="month"
                value={selectedPreviousMonth}
                onChange={(e) => {
                  setSelectedPreviousMonth(e.target.value)
                  setSelectedCalendarDate('')
                }}
                max={getPreviousMonth()}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <p className="text-sm text-gray-600">{formatMonth(selectedPreviousMonth)}</p>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-600">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {previousMonthCalendarData.map((day) =>
                day.isPadding ? (
                  <div key={day.key} className="h-12 rounded-md bg-transparent" />
                ) : (
                  <button
                    type="button"
                    key={day.key}
                    onClick={() => {
                      if (!day.hasReport) return
                      setSelectedCalendarDate(day.key)
                      setIsPreviousReportModalOpen(true)
                    }}
                    disabled={!day.hasReport}
                    className={`h-12 rounded-md border text-sm ${
                      selectedCalendarDate === day.key
                        ? 'bg-[#433228] text-white border-[#433228]'
                        : day.hasReport
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                    } ${day.hasReport ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                  >
                    {day.date}
                  </button>
                ),
              )}
            </div>

          </CardContent>
        </Card>
      )}

      <Dialog open={isPreviousReportModalOpen} onOpenChange={setIsPreviousReportModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              Reports for {selectedCalendarDate ? new Date(selectedCalendarDate).toLocaleDateString('en-US') : ''}
            </DialogTitle>
            <DialogDescription>
              Opening stock, purchase stock, sales, sales return and closing stock details
            </DialogDescription>
          </DialogHeader>

          {previousDayReportData && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Opening Stock Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Opening Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previousDayReportData.openingStock.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.product}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell className="text-right">{row.units} units</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Purchase Stock Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Purchased Units</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previousDayReportData.purchaseStock.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.product}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell className="text-right">₹{row.amount.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right">{row.units} units</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sales Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Sold Units</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previousDayReportData.sales.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.product}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell className="text-right">₹{row.amount.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right">{row.units} units</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sales Return Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Returned Units</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previousDayReportData.salesReturn.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.product}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell>{row.reason}</TableCell>
                          <TableCell className="text-right">{row.units} units</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Closing Stock Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Closing Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previousDayReportData.closingStock.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.product}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell className="text-right">{row.units} units</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PromoterReports
