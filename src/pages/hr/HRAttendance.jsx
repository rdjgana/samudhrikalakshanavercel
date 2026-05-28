import { useState, useMemo, useEffect } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import SupervisorDailyAttendanceReport from '../../components/reports/SupervisorDailyAttendanceReport'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { FileText, Download, Calendar, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
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

// Mock Attendance Categories (role / function for Category column)
const ATTENDANCE_CATEGORIES = [
  'ASM',
  'RSM',
  'SO',
  'Supervisor',
  'Distributor',
  'Promoter',
  'Management',
  'Factory Employees',
]

// Mock Employee Names by Category
const MOCK_EMPLOYEES = {
  RSM: ['Rajesh Kumar', 'Suresh Iyer'],
  ASM: ['Priya Menon', 'Lakshmi Devi'],
  SO: ['Arun Balaji', 'Divya Ramesh', 'Karthik Senthil'],
  Supervisor: ['Mohan Raj', 'Geetha Lakshmi', 'Ravi Shankar'],
  Distributor: ['Anand Krishnan', 'Deepa Suresh'],
  Promoter: ['Kavitha Rani', 'Selvi Murugan', 'Malathi Devi'],
  Management: ['Gokul', 'Shyam', 'Meenashakti'],
  'Factory Employees': ['Factory Worker 1', 'Factory Worker 2', 'Factory Worker 3'],
}

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
      casualLeave: 'Personal work',
    },
  },
  {
    name: 'Kavitha Rani',
    category: 'Promoter',
    totalDays: 30,
    daysPresent: 27,
    lop: 0,
    sickLeave: 1,
    casualLeave: 1,
    weekOff: 1,
    leaveReasons: {
      sickLeave: 'Fever',
      casualLeave: 'Personal errand',
    },
  },
  {
    name: 'Arun Balaji',
    category: 'SO',
    totalDays: 30,
    daysPresent: 26,
    lop: 0,
    sickLeave: 1,
    casualLeave: 2,
    weekOff: 1,
    leaveReasons: {
      sickLeave: 'Dental appointment',
      casualLeave: 'Family function',
    },
  },
]

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAY_LABELS_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

/** Full roster for HR calendar / daywise views */
const HR_ALL_EMPLOYEES = Object.entries(MOCK_EMPLOYEES).flatMap(([category, names]) =>
  names.map((name) => ({ name, category }))
)

const empKey = (name, category) => `${name}::${category}`

/**
 * Deterministic mock: returns the configured weekly off day for an employee.
 * Most employees have Sunday off; a few have Monday or Saturday for variety.
 */
const getEmployeeWeekOffDay = (name, category) => {
  const hash =
    (name.length +
      category.length +
      (name.charCodeAt(0) || 0) +
      (name.charCodeAt(name.length - 1) || 0)) %
    7
  if (hash === 1) return 'Monday'
  if (hash === 2) return 'Saturday'
  return 'Sunday'
}

/** Deterministic mock: every employee × every day for a window around the current month */
const buildHrDaywiseRecords = () => {
  const records = []
  const employees = HR_ALL_EMPLOYEES
  for (let offset = -3; offset <= 3; offset++) {
    const monthStart = startOfMonth(addMonths(new Date(), offset))
    const monthEnd = endOfMonth(monthStart)
    for (const day of eachDayOfInterval({ start: monthStart, end: monthEnd })) {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayName = WEEKDAY_LABELS_FULL[day.getDay()]
      for (const emp of employees) {
        const hash =
          (emp.name.charCodeAt(0) +
            (emp.name.charCodeAt(emp.name.length - 1) || 0) +
            day.getDate() * 13 +
            day.getMonth() * 5 +
            emp.category.length * 7) %
          14
        const weekOffDay = getEmployeeWeekOffDay(emp.name, emp.category)
        let status = 'Present'
        let clockIn = '09:00 AM'
        let clockOut = '06:00 PM'
        let reason = ''
        if (dayName === weekOffDay) {
          status = 'Week Off'
          clockIn = '-'
          clockOut = '-'
        } else if (hash === 0) {
          status = 'Leave'
          clockIn = '-'
          clockOut = '-'
          reason = 'Personal work'
        } else if (hash === 1) {
          status = 'Leave'
          clockIn = '-'
          clockOut = '-'
          reason = 'Medical / sick leave'
        } else if (hash === 2) {
          clockIn = '09:15 AM'
          clockOut = '06:30 PM'
        } else if (hash === 3) {
          clockIn = '08:55 AM'
          clockOut = '05:45 PM'
        }
        records.push({
          name: emp.name,
          category: emp.category,
          date: dateStr,
          clockIn,
          clockOut,
          status,
          reason,
          weekOffDay,
        })
      }
    }
  }
  return records
}

const hrStatusBadgeClass = (status) => {
  switch (status) {
    case 'Present':
      return 'bg-green-100 text-green-800'
    case 'Leave':
      return 'bg-red-100 text-red-800'
    case 'Week Off':
      return 'bg-blue-100 text-blue-800'
    case 'Not marked':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const HRAttendance = () => {
  const [consolidatedData, setConsolidatedData] = useState({
    category: '',
    startDate: '',
    endDate: '',
  })
  const [showTodayAttendance, setShowTodayAttendance] = useState(false)
  const [showDayAttendanceModal, setShowDayAttendanceModal] = useState(false)
  const [dayFilterCategory, setDayFilterCategory] = useState('')
  const [dayFilterName, setDayFilterName] = useState('')
  const [calendarViewMonth, setCalendarViewMonth] = useState(() => startOfMonth(new Date()))
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date())

  const hrDaywiseRecords = useMemo(() => buildHrDaywiseRecords(), [])

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayEmployeeRows = useMemo(() => {
    const byKey = new Map()
    for (const r of hrDaywiseRecords) {
      if (r.date === todayStr) byKey.set(empKey(r.name, r.category), r)
    }
    return HR_ALL_EMPLOYEES.map((emp, index) => {
      const rec = byKey.get(empKey(emp.name, emp.category))
      if (rec) {
        return {
          id: index + 1,
          name: rec.name,
          designation: rec.category,
          clockIn: rec.clockIn,
          clockOut: rec.clockOut,
          status: rec.status,
          weekOffDay: rec.weekOffDay,
        }
      }
      return {
        id: index + 1,
        name: emp.name,
        designation: emp.category,
        clockIn: '-',
        clockOut: '-',
        status: 'Not marked',
        weekOffDay: getEmployeeWeekOffDay(emp.name, emp.category),
      }
    })
  }, [hrDaywiseRecords, todayStr])

  const presentCount = todayEmployeeRows.filter((emp) => emp.status === 'Present').length
  const leaveCount = todayEmployeeRows.filter((emp) => emp.status === 'Leave').length
  const weekOffCount = todayEmployeeRows.filter((emp) => emp.status === 'Week Off').length

  const employeesForSelectedDay = useMemo(() => {
    const d = format(selectedCalendarDate, 'yyyy-MM-dd')
    const byKey = new Map()
    for (const r of hrDaywiseRecords) {
      if (r.date === d) byKey.set(empKey(r.name, r.category), r)
    }
    return HR_ALL_EMPLOYEES.map((emp) => {
      const rec = byKey.get(empKey(emp.name, emp.category))
      if (rec) return rec
      return {
        name: emp.name,
        category: emp.category,
        date: d,
        clockIn: '-',
        clockOut: '-',
        status: 'Not marked',
        reason: '',
        weekOffDay: getEmployeeWeekOffDay(emp.name, emp.category),
      }
    })
  }, [hrDaywiseRecords, selectedCalendarDate])

  const dayFilterNames = useMemo(() => {
    if (!dayFilterCategory) return HR_ALL_EMPLOYEES.map((e) => e.name)
    return HR_ALL_EMPLOYEES.filter((e) => e.category === dayFilterCategory).map((e) => e.name)
  }, [dayFilterCategory])

  const filteredEmployeesForSelectedDay = useMemo(() => {
    const category = dayFilterCategory
    const name = dayFilterName
    return employeesForSelectedDay.filter((row) => {
      if (category && row.category !== category) return false
      if (name && row.name !== name) return false
      return true
    })
  }, [dayFilterCategory, dayFilterName, employeesForSelectedDay])

  const calendarGridDays = useMemo(() => {
    const monthStart = startOfMonth(calendarViewMonth)
    const monthEnd = endOfMonth(calendarViewMonth)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [calendarViewMonth])

  const daySummaryMap = useMemo(() => {
    const map = new Map()
    for (const r of hrDaywiseRecords) {
      if (!map.has(r.date)) {
        map.set(r.date, { present: 0, leave: 0, weekOff: 0, notMarked: 0, total: 0 })
      }
    }
    for (const r of hrDaywiseRecords) {
      const s = map.get(r.date)
      s.total += 1
      if (r.status === 'Present') s.present += 1
      else if (r.status === 'Leave') s.leave += 1
      else if (r.status === 'Week Off') s.weekOff += 1
      else if (r.status === 'Not marked') s.notMarked += 1
    }
    return map
  }, [hrDaywiseRecords])

  useEffect(() => {
    setSelectedCalendarDate((prev) =>
      isSameMonth(prev, calendarViewMonth) ? prev : startOfMonth(calendarViewMonth)
    )
  }, [calendarViewMonth])

  useEffect(() => {
    if (!showDayAttendanceModal) return
    setDayFilterCategory('')
    setDayFilterName('')
  }, [showDayAttendanceModal])

  const handleGenerateConsolidatedReport = () => {
    if (!consolidatedData.category || !consolidatedData.startDate || !consolidatedData.endDate) {
      alert('Please fill all required fields')
      return
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

  const filteredConsolidated = MOCK_CONSOLIDATED_REPORT.filter(item => {
    // Apply filters only if they are filled
    if (consolidatedData.category && item.category !== consolidatedData.category) return false
    return true
  })

  const consolidatedAttendancePagination = useTablePagination(filteredConsolidated)
  const todayAttendancePagination = useTablePagination(todayEmployeeRows)
  const daywiseCalendarPagination = useTablePagination(filteredEmployeesForSelectedDay)

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
            Today — team attendance
          </CardTitle>
          <CardDescription>Quick list for the current date (same roster as the calendar)</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowTodayAttendance(true)}
            className="bg-[#433228] hover:bg-[#5a4238] text-white"
          >
            View full list for today
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="calendar-view" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="calendar-view">Calendar & day view</TabsTrigger>
          <TabsTrigger value="view-report">View Attendance Report</TabsTrigger>
          <TabsTrigger value="consolidated">Consolidated Report</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar-view" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#433228]" />
                Team attendance (calendar)
              </CardTitle>
              <CardDescription>
                Click any date on the calendar to open a centered window with the full daywise attendance table.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setCalendarViewMonth((m) => addMonths(m, -1))}
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setCalendarViewMonth((m) => addMonths(m, 1))}
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold text-gray-900 min-w-[10rem]">
                    {format(calendarViewMonth, 'MMMM yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="hr-cal-month" className="whitespace-nowrap text-sm text-gray-600">
                    Jump to month
                  </Label>
                  <Input
                    id="hr-cal-month"
                    type="month"
                    className="w-auto max-w-[11rem]"
                    value={format(calendarViewMonth, 'yyyy-MM')}
                    onChange={(e) => {
                      const v = e.target.value
                      if (!v) return
                      const [y, mo] = v.split('-').map(Number)
                      if (!y || !mo) return
                      setCalendarViewMonth(new Date(y, mo - 1, 1))
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
                  {WEEKDAY_LABELS.map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarGridDays.map((day) => {
                    const key = format(day, 'yyyy-MM-dd')
                    const summary = daySummaryMap.get(key) || {
                      present: 0,
                      leave: 0,
                      weekOff: 0,
                      notMarked: 0,
                      total: 0,
                    }
                    const inMonth = isSameMonth(day, calendarViewMonth)
                    const selected = isSameDay(day, selectedCalendarDate)
                    const today = isToday(day)
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSelectedCalendarDate(day)
                          if (!isSameMonth(day, calendarViewMonth)) {
                            setCalendarViewMonth(startOfMonth(day))
                          }
                          setShowDayAttendanceModal(true)
                        }}
                        className={[
                          'flex min-h-[4.25rem] flex-col rounded-lg border p-1.5 text-left text-xs transition-colors',
                          inMonth ? 'border-gray-200 bg-white' : 'border-transparent bg-gray-50 text-gray-400',
                          selected ? 'ring-2 ring-[#433228] ring-offset-1' : 'hover:border-gray-300 hover:bg-gray-50',
                          today ? 'font-semibold' : '',
                        ].join(' ')}
                      >
                        <span className={inMonth ? 'text-gray-900' : 'text-gray-400'}>{format(day, 'd')}</span>
                        {summary.total > 0 ? (
                          <span className="mt-auto text-[10px] leading-tight text-gray-500">
                            P {summary.present}/{HR_ALL_EMPLOYEES.length}
                          </span>
                        ) : (
                          <span className="mt-auto text-[10px] text-gray-300">—</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={showDayAttendanceModal} onOpenChange={setShowDayAttendanceModal}>
            <DialogContent className="w-full max-w-[95vw] lg:max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Attendance — {format(selectedCalendarDate, 'EEEE, d MMMM yyyy')}
                </DialogTitle>
                <DialogDescription>
                  {HR_ALL_EMPLOYEES.length} employees — one row per person for this date.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="day-filter-category">Category</Label>
                  <Select
                    id="day-filter-category"
                    value={dayFilterCategory}
                    onChange={(e) => {
                      setDayFilterCategory(e.target.value)
                      setDayFilterName('')
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
                  <Label htmlFor="day-filter-name">Name</Label>
                  <Select
                    id="day-filter-name"
                    value={dayFilterName}
                    onChange={(e) => setDayFilterName(e.target.value)}
                  >
                    <option value="">All Names</option>
                    {dayFilterNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Showing <span className="font-medium text-gray-700">{filteredEmployeesForSelectedDay.length}</span>{' '}
                employees for the selected date.
              </p>

              <div className="mt-2 overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Week Off</TableHead>
                      <TableHead>Reason (leave)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daywiseCalendarPagination.paginatedItems.map((row, index) => {
                      const isWeekOffToday = row.status === 'Week Off'
                      return (
                        <TableRow key={`${row.name}-${row.category}-${row.date}-${index}`}>
                          <TableCell className="text-muted-foreground">
                            {(daywiseCalendarPagination.page - 1) * daywiseCalendarPagination.pageSize + index + 1}
                          </TableCell>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell>{row.clockIn}</TableCell>
                          <TableCell>{row.clockOut}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${hrStatusBadgeClass(row.status)}`}
                            >
                              {row.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isWeekOffToday
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {isWeekOffToday ? 'Yes' : 'No'}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs text-sm text-gray-600">
                            {row.status === 'Leave' && row.reason ? row.reason : '—'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              {filteredEmployeesForSelectedDay.length > 0 && (
                <div className="mt-4">
                  <TablePaginationControls {...daywiseCalendarPagination} />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="view-report" className="mt-4">
          <SupervisorDailyAttendanceReport audience="hr" />
        </TabsContent>

        {/* Consolidated Report */}
        <TabsContent value="consolidated" className="mt-4">
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
            <DialogTitle>
              Today — team attendance —{' '}
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </DialogTitle>
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
                  <TableHead>Week Off</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAttendancePagination.paginatedItems.map((employee, index) => {
                  const isWeekOffToday = employee.status === 'Week Off'
                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
                        {(todayAttendancePagination.page - 1) * todayAttendancePagination.pageSize + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.designation}</TableCell>
                      <TableCell>{employee.clockIn}</TableCell>
                      <TableCell>{employee.clockOut}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${hrStatusBadgeClass(employee.status)}`}
                        >
                          {employee.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isWeekOffToday
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {isWeekOffToday ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {todayEmployeeRows.length > 0 && <TablePaginationControls {...todayAttendancePagination} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HRAttendance
