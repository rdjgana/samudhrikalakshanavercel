import { useState, useEffect, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  clockIn, 
  clockOut, 
  fetchAttendanceStatus,
  submitLeaveRequest,
  fetchLeaveRequests,
  submitWeekOff,
  fetchWeekOff
} from '../../store/slices/attendanceSlice'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isAfter, isSameDay, isSameMonth, isToday, parseISO, startOfDay, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { Calendar, CalendarDays, Camera, CheckCircle2, ChevronLeft, ChevronRight, Clock, MapPin, X } from 'lucide-react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import {
  MOCK_SUPERVISOR_PROMOTERS,
  MOCK_SHOPS,
  MOCK_DISTRIBUTOR_STOCK_AVAILABILITY,
} from '../../data/mockData'

const DEFAULT_PAID_LEAVES = 12
const SUPERVISOR_WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PAID_LEAVE_TYPES = new Set([
  'Casual Leave',
  'Earned Leave',
  'Personal Leave',
  'Sick Leave',
])

const parseDateValue = (value) => {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'string') {
    const parsedValue = parseISO(value)
    if (!Number.isNaN(parsedValue.getTime())) {
      return parsedValue
    }
  }

  const fallbackDate = new Date(value)
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate
}

const getInclusiveDayCount = (startDate, endDate) => {
  const start = parseDateValue(startDate)
  const end = parseDateValue(endDate)

  if (!start || !end || isAfter(startOfDay(start), startOfDay(end))) {
    return 0
  }

  return eachDayOfInterval({
    start: startOfDay(start),
    end: startOfDay(end),
  }).length
}

const isDateWithinRange = (date, startDate, endDate) => {
  const targetDate = parseDateValue(date)
  const start = parseDateValue(startDate)
  const end = parseDateValue(endDate)

  if (!targetDate || !start || !end || isAfter(startOfDay(start), startOfDay(end))) {
    return false
  }

  const normalizedDate = startOfDay(targetDate)
  return !isAfter(startOfDay(start), normalizedDate) && !isAfter(normalizedDate, startOfDay(end))
}

const getSupervisorDayStyles = (tone, isCurrentMonth, isSelected, isCurrentDay) => {
  const toneStyles = {
    default: 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50',
    leave: 'border-rose-200 bg-rose-50 text-rose-900 hover:border-rose-300',
    weekOff: 'border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-300',
    active: 'border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300',
    present: 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300',
  }

  const baseStyle = toneStyles[tone] || toneStyles.default
  const mutedStyle = isCurrentMonth ? '' : ' opacity-60'
  const selectedStyle = isSelected ? ' ring-2 ring-[#433228] ring-offset-2' : ''
  const todayStyle = isCurrentDay ? ' shadow-sm' : ''

  return `${baseStyle}${mutedStyle}${selectedStyle}${todayStyle}`
}

const getSupervisorChipStyles = (tone) => {
  const toneStyles = {
    leave: 'bg-rose-100 text-rose-700',
    weekOff: 'bg-sky-100 text-sky-700',
    active: 'bg-amber-100 text-amber-700',
    present: 'bg-emerald-100 text-emerald-700',
    default: 'bg-gray-100 text-gray-700',
  }

  return toneStyles[tone] || toneStyles.default
}

const getPromoterOptionLabel = (promoter) => `${promoter.name} (${promoter.code})`
const getPromoterAttendanceRecordKey = (promoterId, date) => `${promoterId}-${format(date, 'yyyy-MM-dd')}`

const Attendance = () => {
  const dispatch = useDispatch()
  const { status, loading, error, leaveRequests, weekOff } = useSelector((state) => state.attendance)
  const { user } = useSelector((state) => state.auth)
  const [location, setLocation] = useState({ latitude: null, longitude: null })
  const [locationError, setLocationError] = useState(null)
  const [timeError, setTimeError] = useState(null)
  const [selfie, setSelfie] = useState(null)
  const [selfiePreview, setSelfiePreview] = useState(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)
  const [showClockInModal, setShowClockInModal] = useState(false)
  const [modalSelfie, setModalSelfie] = useState(null)
  const [modalSelfiePreview, setModalSelfiePreview] = useState(null)
  const [modalShowCamera, setModalShowCamera] = useState(false)
  const modalVideoRef = useRef(null)
  
  // Leave Request states
  const [showLeaveRequestDialog, setShowLeaveRequestDialog] = useState(false)
  const [leaveFormData, setLeaveFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: '',
  })
  
  // Week Off states
  const [selectedWeekOffDays, setSelectedWeekOffDays] = useState([])
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  // Supervisor: custom date based week-off (yyyy-MM-dd strings)
  const [selectedWeekOffDates, setSelectedWeekOffDates] = useState([])
  const [newWeekOffDate, setNewWeekOffDate] = useState('')
  
  // Date Filters
  const [dateFilters, setDateFilters] = useState({
    startDate: '',
    endDate: '',
  })
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [promoterCalendarMonth, setPromoterCalendarMonth] = useState(startOfMonth(new Date()))
  const [selectedPromoterDate, setSelectedPromoterDate] = useState(new Date())
  const leaveRequestsPagination = useTablePagination(leaveRequests || [])
  const [selectedPromoterId, setSelectedPromoterId] = useState('')
  const [promoterSearchQuery, setPromoterSearchQuery] = useState('')
  const [promoterAttendanceRecords, setPromoterAttendanceRecords] = useState({})
  const [showPromoterLeaveDialog, setShowPromoterLeaveDialog] = useState(false)
  const [promoterLeaveFormData, setPromoterLeaveFormData] = useState({
    leaveType: '',
    reason: '',
  })

  // Time windows based on role
  const isSupervisor = user?.role === 'Supervisor'
  const isPromoter = user?.role === 'Promoter'
  const isRSM = user?.role === 'RSM'
  const clockInWindow = isPromoter
    ? { start: 8, end: 9, endMinutes: 30 } // 8:00 AM - 9:30 AM (Promoter)
    : isSupervisor 
    ? { start: 9, end: 9, endMinutes: 35 } // 9:00 AM - 9:35 AM
    : { start: 11, end: 11, endMinutes: 0 } // 11:00 AM - 11:00 AM (RSM)
  const clockOutWindow = isPromoter
    ? { start: 10, end: 11, endMinutes: 0 } // 10:00 AM - 11:00 AM (Promoter)
    : isSupervisor
    ? { start: 19, end: 23, endMinutes: 50 } // 7:30 PM - 11:50 PM
    : { start: 21, end: 21, endMinutes: 0 } // 9:00 PM - 9:00 PM (RSM)

  useEffect(() => {
    dispatch(fetchAttendanceStatus())
    dispatch(fetchLeaveRequests())
    dispatch(fetchWeekOff())
    getCurrentLocation()
  }, [dispatch])
  
  // Load week off days if they exist
  useEffect(() => {
    if (weekOff?.weekOffDays) {
      setSelectedWeekOffDays(weekOff.weekOffDays)
    }
    if (Array.isArray(weekOff?.weekOffDates)) {
      setSelectedWeekOffDates(weekOff.weekOffDates)
    }
  }, [weekOff])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setLocationError(null)
        },
        (error) => {
          setLocationError('GPS must be ON. Unable to retrieve your location.')
          console.error('Geolocation error:', error)
        }
      )
    } else {
      setLocationError('GPS is not supported by your browser')
    }
  }

  // Check if current time is within allowed window
  const checkTimeWindow = (type) => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinutes = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinutes

    if (type === 'clockIn') {
      const windowStart = clockInWindow.start * 60
      const windowEnd = clockInWindow.end * 60 + clockInWindow.endMinutes
      
      if (currentTime < windowStart || currentTime > windowEnd) {
        const startTime = `${String(clockInWindow.start).padStart(2, '0')}:00`
        const endTime = `${String(clockInWindow.end).padStart(2, '0')}:${String(clockInWindow.endMinutes).padStart(2, '0')}`
        setTimeError(`Clock In is only allowed between ${startTime} AM and ${endTime} AM`)
        return false
      }
    } else if (type === 'clockOut') {
      const windowStart = clockOutWindow.start * 60 + (isSupervisor ? 30 : 0) // 7:30 PM for supervisor
      const windowEnd = clockOutWindow.end * 60 + clockOutWindow.endMinutes
      
      if (currentTime < windowStart || currentTime > windowEnd) {
        let startTime
        let period = 'PM'
        if (isPromoter) {
          startTime = `${String(clockOutWindow.start).padStart(2, '0')}:00`
          period = 'AM'
        } else if (isSupervisor) {
          startTime = '7:30'
        } else {
          startTime = '9:00'
        }
        const endTime = `${String(clockOutWindow.end).padStart(2, '0')}:${String(clockOutWindow.endMinutes).padStart(2, '0')}`
        setTimeError(`Clock Out is only allowed between ${startTime} ${period} and ${endTime} ${period}`)
        return false
      }
    }
    setTimeError(null)
    return true
  }

  const captureSelfie = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
      const dataURL = canvas.toDataURL('image/jpeg')
      setSelfie(dataURL)
      setSelfiePreview(dataURL)
      setShowCamera(false)
      // Stop video stream
      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }

  const captureModalSelfie = () => {
    if (modalVideoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = modalVideoRef.current.videoWidth
      canvas.height = modalVideoRef.current.videoHeight
      canvas.getContext('2d').drawImage(modalVideoRef.current, 0, 0)
      const dataURL = canvas.toDataURL('image/jpeg')
      setModalSelfie(dataURL)
      setModalSelfiePreview(dataURL)
      setModalShowCamera(false)
      // Stop video stream
      if (modalVideoRef.current.srcObject) {
        modalVideoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowCamera(true)
      }
    } catch (error) {
      alert('Camera access denied. Please allow camera access to capture selfie.')
      console.error('Camera error:', error)
    }
  }

  const startModalCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (modalVideoRef.current) {
        modalVideoRef.current.srcObject = stream
        setModalShowCamera(true)
      }
    } catch (error) {
      alert('Camera access denied. Please allow camera access to capture selfie.')
      console.error('Camera error:', error)
    }
  }

  const handleClockInClick = () => {
    // Check GPS
    if (!location.latitude || !location.longitude) {
      setLocationError('GPS must be ON. Please enable location services.')
      getCurrentLocation()
      return
    }

    // Check time window
    if (!checkTimeWindow('clockIn')) {
      return
    }

    // For Promoter and Supervisor, open modal to capture selfie
    if (isPromoter || isSupervisor) {
      setShowClockInModal(true)
      setModalSelfie(null)
      setModalSelfiePreview(null)
      setModalShowCamera(false)
    } else {
      // For RSM, clock in directly
      handleClockInSubmit()
    }
  }

  const handleClockInSubmit = async () => {
    // Use modal selfie if available, otherwise use regular selfie
    const selfieToUse = modalSelfie || selfie

    await dispatch(clockIn({ ...location, selfie: (isPromoter || isSupervisor) ? selfieToUse : null }))
    dispatch(fetchAttendanceStatus())
    
    // Reset all selfie states
    setSelfie(null)
    setSelfiePreview(null)
    setModalSelfie(null)
    setModalSelfiePreview(null)
    setShowClockInModal(false)
    
    // Stop camera if running
    if (modalVideoRef.current?.srcObject) {
      modalVideoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
  }

  const handleCloseClockInModal = () => {
    setShowClockInModal(false)
    setModalSelfie(null)
    setModalSelfiePreview(null)
    setModalShowCamera(false)
    // Stop camera if running
    if (modalVideoRef.current?.srcObject) {
      modalVideoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
  }

  const handleClockOut = async () => {
    // Check GPS
    if (!location.latitude || !location.longitude) {
      setLocationError('GPS must be ON. Please enable location services.')
      getCurrentLocation()
      return
    }

    // Check time window
    if (!checkTimeWindow('clockOut')) {
      return
    }

    // For Promoter, selfie is required
    if (isPromoter && !selfie) {
      alert('Please capture a selfie before clocking out')
      return
    }

    await dispatch(clockOut({ ...location, selfie: isPromoter ? selfie : null }))
    dispatch(fetchAttendanceStatus())
    setSelfie(null)
    setSelfiePreview(null)
  }

  const openLeaveRequestDialog = (date = new Date()) => {
    const today = startOfDay(new Date())
    const targetDate = parseDateValue(date)
    const safeDate = targetDate && !isAfter(today, startOfDay(targetDate))
      ? format(targetDate, 'yyyy-MM-dd')
      : format(today, 'yyyy-MM-dd')

    setLeaveFormData({
      startDate: safeDate,
      endDate: safeDate,
      leaveType: '',
      reason: '',
    })
    setShowLeaveRequestDialog(true)
  }

  // Leave Request Handlers
  const handleLeaveRequestSubmit = async (e) => {
    e.preventDefault()
    if (!leaveFormData.startDate || !leaveFormData.endDate || !leaveFormData.leaveType || !leaveFormData.reason) {
      alert('Please fill all required fields')
      return
    }
    
    if (new Date(leaveFormData.startDate) > new Date(leaveFormData.endDate)) {
      alert('End date must be after start date')
      return
    }
    
    await dispatch(submitLeaveRequest(leaveFormData))
    setShowLeaveRequestDialog(false)
    setLeaveFormData({
      startDate: '',
      endDate: '',
      leaveType: '',
      reason: '',
    })
  }
  
  // Week Off Handlers
  const handleWeekOffDayToggle = (day) => {
    setSelectedWeekOffDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }
  
  const handleWeekOffSubmit = async () => {
    if (selectedWeekOffDays.length === 0) {
      alert('Please select at least one day for week off')
      return
    }
    
    await dispatch(submitWeekOff({ weekOffDays: selectedWeekOffDays }))
    dispatch(fetchWeekOff())
    alert('Week off updated successfully!')
  }

  // Supervisor week-off (custom dates)
  const handleAddWeekOffDate = (date) => {
    if (!date) return
    setSelectedWeekOffDates((prev) =>
      prev.includes(date) ? prev : [...prev, date].sort()
    )
  }

  const handleRemoveWeekOffDate = (date) => {
    setSelectedWeekOffDates((prev) => prev.filter((d) => d !== date))
  }

  const handleSupervisorWeekOffSubmit = async () => {
    if (selectedWeekOffDates.length === 0) {
      alert('Please select at least one date for week off')
      return
    }

    await dispatch(submitWeekOff({ weekOffDates: selectedWeekOffDates }))
    dispatch(fetchWeekOff())
    alert('Week off updated successfully!')
  }
  
  const getLeaveStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }
  
  const isClockedIn = status?.clockedIn || false
  const clockInTime = status?.clockInTime
  const clockOutTime = status?.clockOutTime
  const attendanceClockInDate = parseDateValue(clockInTime)
  const attendanceClockOutDate = parseDateValue(clockOutTime)
  const leaveRequestItems = Array.isArray(leaveRequests) ? leaveRequests : []
  const today = startOfDay(new Date())
  const selectedDateIsToday = isToday(selectedDate)
  const selectedDateAllowsLeaveRequest = !isAfter(today, startOfDay(selectedDate))

  const leaveBalances = useMemo(() => {
    const paidLeaveTakenFromRequests = leaveRequestItems.reduce((total, request) => {
      const normalizedStatus = request?.status?.toLowerCase()
      const isApprovedPaidLeave = normalizedStatus === 'approved' && PAID_LEAVE_TYPES.has(request.leaveType)
      return isApprovedPaidLeave ? total + getInclusiveDayCount(request.startDate, request.endDate) : total
    }, 0)

    const parsedAvailableLeaves = Number(status?.availablePaidLeaves)
    const parsedTakenLeaves = Number(status?.takenPaidLeaves)
    const parsedTotalLeaves = Number(status?.totalPaidLeaves)

    const totalPaidLeaves = Number.isFinite(parsedTotalLeaves)
      ? parsedTotalLeaves
      : Math.max(DEFAULT_PAID_LEAVES, paidLeaveTakenFromRequests)

    const takenPaidLeaves = Number.isFinite(parsedTakenLeaves)
      ? parsedTakenLeaves
      : paidLeaveTakenFromRequests

    const availablePaidLeaves = Number.isFinite(parsedAvailableLeaves)
      ? parsedAvailableLeaves
      : Math.max(totalPaidLeaves - takenPaidLeaves, 0)

    return {
      totalPaidLeaves,
      takenPaidLeaves,
      availablePaidLeaves,
    }
  }, [leaveRequestItems, status?.availablePaidLeaves, status?.takenPaidLeaves, status?.totalPaidLeaves])

  const supervisorCalendarDays = useMemo(() => {
    const calendarStart = startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(endOfMonth(calendarMonth), { weekStartsOn: 0 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map((date) => {
      const matchingLeaveRequest = leaveRequestItems.find((request) =>
        isDateWithinRange(date, request.startDate, request.endDate),
      )
      const dateKey = format(date, 'yyyy-MM-dd')
      const usesDateBasedWeekOff = isSupervisor || isRSM
      const isWeekOffDay = usesDateBasedWeekOff
        ? selectedWeekOffDates.includes(dateKey)
        : selectedWeekOffDays.includes(format(date, 'EEEE'))
      const hasClockInRecord = attendanceClockInDate ? isSameDay(attendanceClockInDate, date) : false
      const hasClockOutRecord = attendanceClockOutDate ? isSameDay(attendanceClockOutDate, date) : false

      let tone = 'default'
      let label = ''

      if (matchingLeaveRequest) {
        tone = 'leave'
        label = matchingLeaveRequest.leaveType || 'Leave'
      } else if (hasClockOutRecord) {
        tone = 'present'
        label = 'Present'
      } else if (hasClockInRecord) {
        tone = 'active'
        label = 'Checked In'
      } else if (isWeekOffDay) {
        tone = 'weekOff'
        label = 'Week Off'
      }

      return {
        date,
        tone,
        label,
        isCurrentMonth: isSameMonth(date, calendarMonth),
        isCurrentDay: isToday(date),
        isSelected: isSameDay(date, selectedDate),
        isWeekOffDay,
        hasClockInRecord,
        hasClockOutRecord,
        leaveRequest: matchingLeaveRequest || null,
      }
    })
  }, [
    attendanceClockInDate,
    attendanceClockOutDate,
    calendarMonth,
    isRSM,
    isSupervisor,
    leaveRequestItems,
    selectedDate,
    selectedWeekOffDates,
    selectedWeekOffDays,
  ])

  const selectedDateSummary = useMemo(
    () => supervisorCalendarDays.find((day) => isSameDay(day.date, selectedDate)) || null,
    [selectedDate, supervisorCalendarDays],
  )
  const selectedSupervisorPromoter = useMemo(
    () => MOCK_SUPERVISOR_PROMOTERS.find((promoter) => promoter.id === Number(selectedPromoterId)) || null,
    [selectedPromoterId],
  )
  const selectedPromoterDetails = useMemo(() => {
    if (!selectedSupervisorPromoter) {
      return null
    }

    const distributorRecord = MOCK_DISTRIBUTOR_STOCK_AVAILABILITY.find(
      (distributor) => distributor.distributorId === selectedSupervisorPromoter.distributorId,
    )
    const allocatedShop =
      MOCK_SHOPS.find(
        (shop) =>
          shop.distributorId === selectedSupervisorPromoter.distributorId &&
          shop.address.toLowerCase().includes(selectedSupervisorPromoter.area.toLowerCase()),
      ) ||
      MOCK_SHOPS.find((shop) => shop.distributorId === selectedSupervisorPromoter.distributorId) ||
      null

    return {
      distributorName: distributorRecord?.distributorName || '-',
      allocatedShopName: allocatedShop?.name || '-',
    }
  }, [selectedSupervisorPromoter])
  const promoterCalendarDays = useMemo(() => {
    const calendarStart = startOfWeek(startOfMonth(promoterCalendarMonth))
    const calendarEnd = endOfWeek(endOfMonth(promoterCalendarMonth))

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map((date) => {
      const attendanceRecord = selectedSupervisorPromoter
        ? promoterAttendanceRecords[getPromoterAttendanceRecordKey(selectedSupervisorPromoter.id, date)]
        : null

      return {
        date,
        tone:
          attendanceRecord?.status === 'Leave'
            ? 'leave'
            : attendanceRecord?.status === 'Present'
            ? 'present'
            : 'default',
        label:
          attendanceRecord?.status === 'Leave'
            ? attendanceRecord.leaveType || 'Leave'
            : attendanceRecord?.status === 'Present'
            ? 'Present'
            : null,
        isCurrentMonth: isSameMonth(date, promoterCalendarMonth),
        isCurrentDay: isToday(date),
        isSelected: isSameDay(date, selectedPromoterDate),
      }
    })
  }, [promoterAttendanceRecords, promoterCalendarMonth, selectedPromoterDate, selectedSupervisorPromoter])
  const selectedPromoterAttendanceRecord = useMemo(() => {
    if (!selectedSupervisorPromoter) {
      return null
    }

    return (
      promoterAttendanceRecords[
        getPromoterAttendanceRecordKey(selectedSupervisorPromoter.id, selectedPromoterDate)
      ] || null
    )
  }, [promoterAttendanceRecords, selectedPromoterDate, selectedSupervisorPromoter])
  const promoterAttendanceRows = useMemo(
    () =>
      MOCK_SUPERVISOR_PROMOTERS.map((promoter) => ({
        ...promoter,
        attendanceStatus:
          promoterAttendanceRecords[getPromoterAttendanceRecordKey(promoter.id, selectedPromoterDate)]?.status ||
          'Not Marked',
        markedAt:
          promoterAttendanceRecords[getPromoterAttendanceRecordKey(promoter.id, selectedPromoterDate)]?.markedAt ||
          null,
      })),
    [promoterAttendanceRecords, selectedPromoterDate],
  )
  const filteredSupervisorPromoters = useMemo(() => {
    const normalizedQuery = promoterSearchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return MOCK_SUPERVISOR_PROMOTERS
    }

    return MOCK_SUPERVISOR_PROMOTERS.filter((promoter) =>
      `${promoter.name} ${promoter.code}`.toLowerCase().includes(normalizedQuery),
    )
  }, [promoterSearchQuery])
  const markedPromotersCount = promoterAttendanceRows.filter(
    (promoter) => promoter.attendanceStatus === 'Present',
  ).length
  const leaveAppliedCount = promoterAttendanceRows.filter(
    (promoter) => promoter.attendanceStatus === 'Leave',
  ).length
  const pendingPromotersCount = promoterAttendanceRows.length - markedPromotersCount - leaveAppliedCount

  const pendingLeaveRequestsCount = leaveRequestItems.filter(
    (request) => request?.status?.toLowerCase() === 'pending',
  ).length
  const approvedLeaveRequestsCount = leaveRequestItems.filter(
    (request) => request?.status?.toLowerCase() === 'approved',
  ).length

  const handlePromoterPickerChange = (value) => {
    setPromoterSearchQuery(value)

    const normalizedValue = value.trim().toLowerCase()
    const matchedPromoter = MOCK_SUPERVISOR_PROMOTERS.find((promoter) => {
      const optionLabel = getPromoterOptionLabel(promoter).toLowerCase()
      return (
        optionLabel === normalizedValue ||
        promoter.name.toLowerCase() === normalizedValue ||
        promoter.code.toLowerCase() === normalizedValue
      )
    })

    setSelectedPromoterId(matchedPromoter ? String(matchedPromoter.id) : '')
  }

  const handlePromoterAttendanceMark = () => {
    if (!selectedSupervisorPromoter) {
      return
    }

    const attendanceRecordKey = getPromoterAttendanceRecordKey(
      selectedSupervisorPromoter.id,
      selectedPromoterDate,
    )

    setPromoterAttendanceRecords((currentRecords) => ({
      ...currentRecords,
      [attendanceRecordKey]: {
        status: 'Present',
        markedAt: new Date().toISOString(),
      },
    }))
  }

  const openPromoterLeaveDialog = () => {
    if (!selectedSupervisorPromoter) {
      return
    }

    setPromoterLeaveFormData({
      leaveType: '',
      reason: '',
    })
    setShowPromoterLeaveDialog(true)
  }

  const handlePromoterLeaveSubmit = (e) => {
    e.preventDefault()

    if (!selectedSupervisorPromoter) {
      return
    }

    if (!promoterLeaveFormData.leaveType || !promoterLeaveFormData.reason) {
      alert('Please fill all required fields')
      return
    }

    const attendanceRecordKey = getPromoterAttendanceRecordKey(
      selectedSupervisorPromoter.id,
      selectedPromoterDate,
    )

    setPromoterAttendanceRecords((currentRecords) => ({
      ...currentRecords,
      [attendanceRecordKey]: {
        status: 'Leave',
        leaveType: promoterLeaveFormData.leaveType,
        reason: promoterLeaveFormData.reason,
        markedAt: new Date().toISOString(),
      },
    }))

    setShowPromoterLeaveDialog(false)
    setPromoterLeaveFormData({
      leaveType: '',
      reason: '',
    })
  }

  if (isRSM) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">RSM Attendance</h1>
            <p className="mt-2 max-w-3xl text-gray-600">
              Manage daily attendance through a calendar view. Mark today&apos;s check-in and check-out,
              review leave requests, highlight week-off days, and track paid leave balance in one place.
            </p>
          </div>

          <div className="rounded-2xl bg-[#433228] p-4 text-white shadow-sm">
            <p className="text-sm text-white/80">RSM timing</p>
            <p className="mt-1 text-lg font-semibold">Check in 11:00 AM</p>
            <p className="text-sm text-white/80">Check out 9:00 PM</p>
          </div>
        </div>

        {(locationError || timeError || error) && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="font-medium text-destructive">{locationError || timeError || error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Available paid leaves</CardDescription>
              <CardTitle className="text-3xl">{leaveBalances.availablePaidLeaves}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Remaining from {leaveBalances.totalPaidLeaves} total paid leave days.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Taken paid leaves</CardDescription>
              <CardTitle className="text-3xl">{leaveBalances.takenPaidLeaves}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Calculated from approved paid leave requests.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Week off dates</CardDescription>
              <CardTitle className="text-3xl">{selectedWeekOffDates.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {selectedWeekOffDates.length > 0
                  ? selectedWeekOffDates
                      .map((d) => format(parseISO(d), 'dd MMM'))
                      .join(', ')
                  : 'No week off dates selected yet.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Leave requests</CardDescription>
              <CardTitle className="text-3xl">{leaveRequestItems.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {pendingLeaveRequestsCount} pending and {approvedLeaveRequestsCount} approved requests.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-gray-50/70">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Attendance Calendar</CardTitle>
                  <CardDescription>
                    Leave requests and week off days are highlighted on the monthly calendar.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarMonth((currentMonth) => subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="min-w-40 text-center text-sm font-semibold text-gray-900">
                    {format(calendarMonth, 'MMMM yyyy')}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarMonth((currentMonth) => addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 text-xs">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Present</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">Checked in</span>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">Leave</span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">Week off</span>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                {SUPERVISOR_WEEK_LABELS.map((dayLabel) => (
                  <div key={dayLabel} className="py-2">
                    {dayLabel}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {supervisorCalendarDays.map((day) => (
                  <button
                    key={day.date.toISOString()}
                    type="button"
                    onClick={() => {
                      setSelectedDate(day.date)
                      setNewWeekOffDate(format(day.date, 'yyyy-MM-dd'))
                    }}
                    className={`min-h-[108px] rounded-2xl border p-2 text-left transition ${getSupervisorDayStyles(
                      day.tone,
                      day.isCurrentMonth,
                      day.isSelected,
                      day.isCurrentDay,
                    )}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-sm font-semibold ${day.isCurrentDay ? 'text-[#433228]' : ''}`}>
                        {format(day.date, 'd')}
                      </span>
                      {day.isCurrentDay && (
                        <span className="rounded-full bg-[#433228]/10 px-2 py-0.5 text-[10px] font-medium text-[#433228]">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-[11px]">
                      {day.label && (
                        <span className={`inline-flex rounded-full px-2 py-1 font-medium ${getSupervisorChipStyles(day.tone)}`}>
                          {day.label}
                        </span>
                      )}

                      {day.hasClockInRecord && (
                        <p className="truncate text-gray-600">
                          In: {format(attendanceClockInDate, 'hh:mm a')}
                        </p>
                      )}

                      {day.hasClockOutRecord && (
                        <p className="truncate text-gray-600">
                          Out: {format(attendanceClockOutDate, 'hh:mm a')}
                        </p>
                      )}

                      {day.leaveRequest?.status && (
                        <p className="truncate capitalize text-gray-600">
                          {day.leaveRequest.status}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Actions</CardTitle>
                <CardDescription>GPS is required for both attendance actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {isClockedIn ? 'Clocked in' : 'Waiting for check-in'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {clockInTime
                          ? `Check-in at ${new Date(clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'You can mark today\'s attendance from this panel.'}
                      </p>
                    </div>
                    <CheckCircle2 className={`h-5 w-5 ${isClockedIn ? 'text-emerald-600' : 'text-gray-400'}`} />
                  </div>

                  <div className="mt-4 grid gap-3">
                    <Button
                      onClick={handleClockInClick}
                      disabled={loading || isClockedIn}
                      className={isClockedIn ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-[#433228] hover:bg-[#5a4238]'}
                      variant={isClockedIn ? 'outline' : 'default'}
                    >
                      Mark Check In
                    </Button>

                    <Button
                      onClick={handleClockOut}
                      disabled={loading || !isClockedIn || !!clockOutTime}
                      variant={clockOutTime ? 'outline' : 'secondary'}
                      className={clockOutTime ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200' : ''}
                    >
                      {clockOutTime ? 'Check Out Completed' : 'Mark Check Out'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openLeaveRequestDialog(selectedDate)}
                      disabled={!selectedDateAllowsLeaveRequest}
                    >
                      Request Leave
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed p-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <MapPin className="h-4 w-4 text-[#433228]" />
                    Location status
                  </div>
                  {location.latitude && location.longitude ? (
                    <p className="mt-2 font-mono text-xs">
                      Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                    </p>
                  ) : (
                    <p className="mt-2">Waiting for GPS coordinates. Enable location access if needed.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selected Date</CardTitle>
                <CardDescription>{format(selectedDate, 'EEEE, dd MMMM yyyy')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDateSummary?.leaveRequest ? (
                  <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-900">
                    <p className="font-semibold">{selectedDateSummary.leaveRequest.leaveType}</p>
                    <p className="mt-1 capitalize">
                      Status: {selectedDateSummary.leaveRequest.status || 'Pending'}
                    </p>
                    <p className="mt-1">
                      {getInclusiveDayCount(
                        selectedDateSummary.leaveRequest.startDate,
                        selectedDateSummary.leaveRequest.endDate,
                      )} day leave request
                    </p>
                    {selectedDateSummary.leaveRequest.reason && (
                      <p className="mt-2 text-rose-800">
                        Reason: {selectedDateSummary.leaveRequest.reason}
                      </p>
                    )}
                  </div>
                ) : selectedDateSummary?.hasClockOutRecord ? (
                  <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                    <p className="font-semibold">Attendance completed</p>
                    <p className="mt-1">
                      In: {new Date(clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="mt-1">
                      Out: {new Date(clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : selectedDateSummary?.hasClockInRecord ? (
                  <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">Checked in for the day</p>
                    <p className="mt-1">
                      Check-in time: {new Date(clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="mt-1">Check-out is still pending.</p>
                  </div>
                ) : selectedDateSummary?.isWeekOffDay ? (
                  <div className="rounded-xl bg-sky-50 p-4 text-sm text-sky-900">
                    <p className="font-semibold">Week off</p>
                    <p className="mt-1">
                      {format(selectedDate, 'dd MMM yyyy')} is marked as a week off date.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                    No attendance, leave, or week-off event is mapped to this date yet.
                  </div>
                )}

                {!selectedDateIsToday && (
                  <p className="text-xs text-gray-500">
                    Check-in and check-out can only be marked for today. You can still plan a leave request for future dates.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Week Off Dates</CardTitle>
                <CardDescription>Pick custom dates to mark as week off. Tip: click a day on the calendar to auto-fill the date below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rsm-week-off-date" className="text-xs text-gray-600">
                    Select a date
                  </Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="rsm-week-off-date"
                      type="date"
                      value={newWeekOffDate}
                      onChange={(e) => setNewWeekOffDate(e.target.value)}
                      className="sm:flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        handleAddWeekOffDate(newWeekOffDate)
                        setNewWeekOffDate('')
                      }}
                      disabled={!newWeekOffDate || selectedWeekOffDates.includes(newWeekOffDate)}
                    >
                      Add Date
                    </Button>
                  </div>
                </div>

                {selectedWeekOffDates.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedWeekOffDates.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900"
                      >
                        {format(parseISO(d), 'dd MMM yyyy')}
                        <button
                          type="button"
                          onClick={() => handleRemoveWeekOffDate(d)}
                          className="text-sky-700 hover:text-sky-900"
                          aria-label={`Remove ${d}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No week off dates selected yet.</p>
                )}

                <Button
                  onClick={handleSupervisorWeekOffSubmit}
                  disabled={loading || selectedWeekOffDates.length === 0}
                  className="w-full"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Save Week Off
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Leave Request History</CardTitle>
                <CardDescription>Track submitted leave requests and approval status.</CardDescription>
              </div>
              <Button type="button" onClick={() => openLeaveRequestDialog(selectedDate)}>
                <Calendar className="mr-2 h-4 w-4" />
                New Leave Request
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {leaveRequestItems.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequestsPagination.paginatedItems.map((request, index) => (
                      <TableRow key={request.id || index}>
                        <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{request.leaveType}</TableCell>
                        <TableCell>{getInclusiveDayCount(request.startDate, request.endDate)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getLeaveStatusBadge(request.status)}`}>
                            {request.status || 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={request.reason}>
                          {request.reason || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePaginationControls {...leaveRequestsPagination} />
              </>
            ) : (
              <div className="py-10 text-center text-gray-500">
                <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No leave requests submitted yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showLeaveRequestDialog} onOpenChange={setShowLeaveRequestDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLeaveRequestSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={leaveFormData.startDate}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={leaveFormData.endDate}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                  min={leaveFormData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Select
                  id="leaveType"
                  value={leaveFormData.leaveType}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
                  required
                >
                  <option value="">Select leave type</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  value={leaveFormData.reason}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                  placeholder="Please provide a reason for your leave request"
                  rows={4}
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowLeaveRequestDialog(false)
                    setLeaveFormData({
                      startDate: '',
                      endDate: '',
                      leaveType: '',
                      reason: '',
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (isSupervisor) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supervisor Attendance</h1>
            <p className="mt-2 max-w-3xl text-gray-600">
              Manage daily attendance through a calendar view. Mark today&apos;s check-in and check-out,
              review leave requests, highlight week-off days, and track paid leave balance in one place.
            </p>
          </div>

          <div className="rounded-2xl bg-[#433228] p-4 text-white shadow-sm">
            <p className="text-sm text-white/80">Supervisor timing</p>
            <p className="mt-1 text-lg font-semibold">Check in 9:00 AM - 9:35 AM</p>
            <p className="text-sm text-white/80">Check out 7:30 PM - 11:50 PM</p>
          </div>
        </div>

        <Tabs defaultValue="supervisor-attendance" className="space-y-6">
          <TabsList className="grid w-full gap-2 md:max-w-xl md:grid-cols-2">
            <TabsTrigger value="supervisor-attendance">Supervisor Attendance</TabsTrigger>
            <TabsTrigger value="promoter-attendance">Promoter Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="supervisor-attendance" className="space-y-6">
            {(locationError || timeError || error) && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="font-medium text-destructive">{locationError || timeError || error}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Available paid leaves</CardDescription>
                  <CardTitle className="text-3xl">{leaveBalances.availablePaidLeaves}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Remaining from {leaveBalances.totalPaidLeaves} total paid leave days.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Taken paid leaves</CardDescription>
                  <CardTitle className="text-3xl">{leaveBalances.takenPaidLeaves}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Calculated from approved paid leave requests.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Week off dates</CardDescription>
                  <CardTitle className="text-3xl">{selectedWeekOffDates.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {selectedWeekOffDates.length > 0
                      ? selectedWeekOffDates
                          .map((d) => format(parseISO(d), 'dd MMM'))
                          .join(', ')
                      : 'No week off dates selected yet.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Leave requests</CardDescription>
                  <CardTitle className="text-3xl">{leaveRequestItems.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {pendingLeaveRequestsCount} pending and {approvedLeaveRequestsCount} approved requests.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
              <Card className="overflow-hidden">
                <CardHeader className="border-b bg-gray-50/70">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Attendance Calendar</CardTitle>
                      <CardDescription>
                        Leave requests and week off days are highlighted on the monthly calendar.
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCalendarMonth((currentMonth) => subMonths(currentMonth, 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="min-w-40 text-center text-sm font-semibold text-gray-900">
                        {format(calendarMonth, 'MMMM yyyy')}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCalendarMonth((currentMonth) => addMonths(currentMonth, 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 text-xs">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Present</span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">Checked in</span>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">Leave</span>
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">Week off</span>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {SUPERVISOR_WEEK_LABELS.map((dayLabel) => (
                      <div key={dayLabel} className="py-2">
                        {dayLabel}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {supervisorCalendarDays.map((day) => (
                      <button
                        key={day.date.toISOString()}
                        type="button"
                        onClick={() => {
                          setSelectedDate(day.date)
                          setNewWeekOffDate(format(day.date, 'yyyy-MM-dd'))
                        }}
                        className={`min-h-[108px] rounded-2xl border p-2 text-left transition ${getSupervisorDayStyles(
                          day.tone,
                          day.isCurrentMonth,
                          day.isSelected,
                          day.isCurrentDay,
                        )}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-sm font-semibold ${day.isCurrentDay ? 'text-[#433228]' : ''}`}>
                            {format(day.date, 'd')}
                          </span>
                          {day.isCurrentDay && (
                            <span className="rounded-full bg-[#433228]/10 px-2 py-0.5 text-[10px] font-medium text-[#433228]">
                              Today
                            </span>
                          )}
                        </div>

                        <div className="mt-3 space-y-1 text-[11px]">
                          {day.label && (
                            <span className={`inline-flex rounded-full px-2 py-1 font-medium ${getSupervisorChipStyles(day.tone)}`}>
                              {day.label}
                            </span>
                          )}

                          {day.hasClockInRecord && (
                            <p className="truncate text-gray-600">
                              In: {format(attendanceClockInDate, 'hh:mm a')}
                            </p>
                          )}

                          {day.hasClockOutRecord && (
                            <p className="truncate text-gray-600">
                              Out: {format(attendanceClockOutDate, 'hh:mm a')}
                            </p>
                          )}

                          {day.leaveRequest?.status && (
                            <p className="truncate capitalize text-gray-600">
                              {day.leaveRequest.status}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Today&apos;s Actions</CardTitle>
                    <CardDescription>GPS is required for both attendance actions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl border bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {isClockedIn ? 'Clocked in' : 'Waiting for check-in'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {clockInTime
                              ? `Check-in at ${new Date(clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              : 'You can mark today\'s attendance from this panel.'}
                          </p>
                        </div>
                        <CheckCircle2 className={`h-5 w-5 ${isClockedIn ? 'text-emerald-600' : 'text-gray-400'}`} />
                      </div>

                      <div className="mt-4 grid gap-3">
                        <Button
                          onClick={handleClockInClick}
                          disabled={loading || isClockedIn}
                          className={isClockedIn ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-[#433228] hover:bg-[#5a4238]'}
                          variant={isClockedIn ? 'outline' : 'default'}
                        >
                          Mark Check In
                        </Button>

                        <Button
                          onClick={handleClockOut}
                          disabled={loading || !isClockedIn || !!clockOutTime}
                          variant={clockOutTime ? 'outline' : 'secondary'}
                          className={clockOutTime ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200' : ''}
                        >
                          {clockOutTime ? 'Check Out Completed' : 'Mark Check Out'}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openLeaveRequestDialog(selectedDate)}
                          disabled={!selectedDateAllowsLeaveRequest}
                        >
                          Request Leave
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-dashed p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        <MapPin className="h-4 w-4 text-[#433228]" />
                        Location status
                      </div>
                      {location.latitude && location.longitude ? (
                        <p className="mt-2 font-mono text-xs">
                          Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                        </p>
                      ) : (
                        <p className="mt-2">Waiting for GPS coordinates. Enable location access if needed.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Selected Date</CardTitle>
                    <CardDescription>{format(selectedDate, 'EEEE, dd MMMM yyyy')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedDateSummary?.leaveRequest ? (
                      <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-900">
                        <p className="font-semibold">{selectedDateSummary.leaveRequest.leaveType}</p>
                        <p className="mt-1 capitalize">
                          Status: {selectedDateSummary.leaveRequest.status || 'Pending'}
                        </p>
                        <p className="mt-1">
                          {getInclusiveDayCount(
                            selectedDateSummary.leaveRequest.startDate,
                            selectedDateSummary.leaveRequest.endDate,
                          )} day leave request
                        </p>
                        {selectedDateSummary.leaveRequest.reason && (
                          <p className="mt-2 text-rose-800">
                            Reason: {selectedDateSummary.leaveRequest.reason}
                          </p>
                        )}
                      </div>
                    ) : selectedDateSummary?.hasClockOutRecord ? (
                      <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                        <p className="font-semibold">Attendance completed</p>
                        <p className="mt-1">
                          In: {new Date(clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="mt-1">
                          Out: {new Date(clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ) : selectedDateSummary?.hasClockInRecord ? (
                      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                        <p className="font-semibold">Checked in for the day</p>
                        <p className="mt-1">
                          Check-in time: {new Date(clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="mt-1">Check-out is still pending.</p>
                      </div>
                    ) : selectedDateSummary?.isWeekOffDay ? (
                      <div className="rounded-xl bg-sky-50 p-4 text-sm text-sky-900">
                        <p className="font-semibold">Week off</p>
                        <p className="mt-1">
                          {format(selectedDate, 'dd MMM yyyy')} is marked as a week off date.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                        No attendance, leave, or week-off event is mapped to this date yet.
                      </div>
                    )}

                    {!selectedDateIsToday && (
                      <p className="text-xs text-gray-500">
                        Check-in and check-out can only be marked for today. You can still plan a leave request for future dates.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Week Off Dates</CardTitle>
                    <CardDescription>Pick custom dates to mark as week off. Tip: click a day on the calendar to auto-fill the date below.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="supervisor-week-off-date" className="text-xs text-gray-600">
                        Select a date
                      </Label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                          id="supervisor-week-off-date"
                          type="date"
                          value={newWeekOffDate}
                          onChange={(e) => setNewWeekOffDate(e.target.value)}
                          className="sm:flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            handleAddWeekOffDate(newWeekOffDate)
                            setNewWeekOffDate('')
                          }}
                          disabled={!newWeekOffDate || selectedWeekOffDates.includes(newWeekOffDate)}
                        >
                          Add Date
                        </Button>
                      </div>
                    </div>

                    {selectedWeekOffDates.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedWeekOffDates.map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900"
                          >
                            {format(parseISO(d), 'dd MMM yyyy')}
                            <button
                              type="button"
                              onClick={() => handleRemoveWeekOffDate(d)}
                              className="text-sky-700 hover:text-sky-900"
                              aria-label={`Remove ${d}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No week off dates selected yet.</p>
                    )}

                    <Button
                      onClick={handleSupervisorWeekOffSubmit}
                      disabled={loading || selectedWeekOffDates.length === 0}
                      className="w-full"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Save Week Off
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Leave Request History</CardTitle>
                    <CardDescription>Track submitted leave requests and approval status.</CardDescription>
                  </div>
                  <Button type="button" onClick={() => openLeaveRequestDialog(selectedDate)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    New Leave Request
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {leaveRequestItems.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Leave Type</TableHead>
                          <TableHead>Days</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaveRequestsPagination.paginatedItems.map((request, index) => (
                          <TableRow key={request.id || index}>
                            <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                            <TableCell>{request.leaveType}</TableCell>
                            <TableCell>{getInclusiveDayCount(request.startDate, request.endDate)}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${getLeaveStatusBadge(request.status)}`}>
                                {request.status || 'Pending'}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-xs truncate" title={request.reason}>
                              {request.reason || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <TablePaginationControls {...leaveRequestsPagination} />
                  </>
                ) : (
                  <div className="py-10 text-center text-gray-500">
                    <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>No leave requests submitted yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promoter-attendance" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total promoters</CardDescription>
                  <CardTitle className="text-3xl">{promoterAttendanceRows.length}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Attendance marked</CardDescription>
                  <CardTitle className="text-3xl text-emerald-600">{markedPromotersCount}</CardTitle>
                  <CardDescription className="pt-1">
                    On {format(selectedPromoterDate, 'dd MMM yyyy')}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Pending attendance</CardDescription>
                  <CardTitle className="text-3xl text-amber-600">{pendingPromotersCount}</CardTitle>
                  <CardDescription className="pt-1">
                    On {format(selectedPromoterDate, 'dd MMM yyyy')}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Leave applied</CardDescription>
                  <CardTitle className="text-3xl text-rose-600">{leaveAppliedCount}</CardTitle>
                  <CardDescription className="pt-1">
                    On {format(selectedPromoterDate, 'dd MMM yyyy')}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
              <Card className="overflow-hidden">
                <CardHeader className="border-b bg-gray-50/70">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Promoter Attendance Calendar</CardTitle>
                      <CardDescription>
                        Select a promoter and date, then mark attendance from the calendar view.
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPromoterCalendarMonth((currentMonth) => subMonths(currentMonth, 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="min-w-40 text-center text-sm font-semibold text-gray-900">
                        {format(promoterCalendarMonth, 'MMMM yyyy')}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPromoterCalendarMonth((currentMonth) => addMonths(currentMonth, 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 text-xs">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Marked Present</span>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">Leave Applied</span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">No Marking</span>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {SUPERVISOR_WEEK_LABELS.map((dayLabel) => (
                      <div key={dayLabel} className="py-2">
                        {dayLabel}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {promoterCalendarDays.map((day) => (
                      <button
                        key={day.date.toISOString()}
                        type="button"
                        onClick={() => setSelectedPromoterDate(day.date)}
                        className={`min-h-[108px] rounded-2xl border p-2 text-left transition ${getSupervisorDayStyles(
                          day.tone,
                          day.isCurrentMonth,
                          day.isSelected,
                          day.isCurrentDay,
                        )}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-sm font-semibold ${day.isCurrentDay ? 'text-[#433228]' : ''}`}>
                            {format(day.date, 'd')}
                          </span>
                          {day.isCurrentDay && (
                            <span className="rounded-full bg-[#433228]/10 px-2 py-0.5 text-[10px] font-medium text-[#433228]">
                              Today
                            </span>
                          )}
                        </div>

                        <div className="mt-3 space-y-1 text-[11px]">
                          {day.label && (
                            <span className={`inline-flex rounded-full px-2 py-1 font-medium ${getSupervisorChipStyles(day.tone)}`}>
                              {day.label}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mark Promoter Attendance</CardTitle>
                    <CardDescription>Select a promoter, choose a date from the calendar, then mark attendance.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="promoterAttendanceSearch">Promoter</Label>
                      <Input
                        id="promoterAttendanceSearch"
                        list="promoterAttendanceOptions"
                        value={promoterSearchQuery}
                        onChange={(e) => handlePromoterPickerChange(e.target.value)}
                        placeholder="Search promoter by name or code"
                      />
                      <datalist id="promoterAttendanceOptions">
                        {filteredSupervisorPromoters.map((promoter) => (
                          <option key={promoter.id} value={getPromoterOptionLabel(promoter)} />
                        ))}
                      </datalist>
                    </div>

                    {promoterSearchQuery && !selectedSupervisorPromoter && filteredSupervisorPromoters.length === 0 && (
                      <p className="text-sm text-amber-700">No promoter found for this name or code.</p>
                    )}

                    <div className="rounded-xl border bg-gray-50 p-4">
                      <p className="text-sm font-medium text-gray-900">Selected date</p>
                      <p className="mt-1 text-sm text-gray-600">{format(selectedPromoterDate, 'EEEE, dd MMMM yyyy')}</p>
                    </div>

                    {selectedSupervisorPromoter && (
                      <div className="rounded-xl border bg-gray-50 p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {selectedSupervisorPromoter.name} ({selectedSupervisorPromoter.code})
                            </p>
                            <p className="text-sm text-gray-600">
                              Area: {selectedSupervisorPromoter.area} | Distributor: {selectedPromoterDetails?.distributorName} | Allocated Shop: {selectedPromoterDetails?.allocatedShopName}
                            </p>
                          </div>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              selectedPromoterAttendanceRecord?.status === 'Leave'
                                ? 'bg-rose-100 text-rose-700'
                                : selectedPromoterAttendanceRecord?.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {selectedPromoterAttendanceRecord?.status === 'Leave'
                              ? 'Leave Applied'
                              : selectedPromoterAttendanceRecord?.status === 'Present'
                              ? 'Attendance Marked'
                              : 'Not Marked'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-3 md:grid-cols-2">
                      <Button
                        type="button"
                        onClick={handlePromoterAttendanceMark}
                        disabled={!selectedPromoterId}
                        className="w-full bg-[#433228] hover:bg-[#5a4238]"
                      >
                        Mark Attendance
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={openPromoterLeaveDialog}
                        disabled={!selectedPromoterId}
                        className="w-full"
                      >
                        Apply Leave
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Selected Date Summary</CardTitle>
                    <CardDescription>{format(selectedPromoterDate, 'EEEE, dd MMMM yyyy')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedSupervisorPromoter ? (
                      selectedPromoterAttendanceRecord?.status === 'Leave' ? (
                        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-900">
                          <p className="font-semibold">{selectedPromoterAttendanceRecord.leaveType || 'Leave Applied'}</p>
                          <p className="mt-1">Reason: {selectedPromoterAttendanceRecord.reason}</p>
                          <p className="mt-1">
                            Applied at{' '}
                            {new Date(selectedPromoterAttendanceRecord.markedAt).toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                        </div>
                      ) : selectedPromoterAttendanceRecord ? (
                        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                          <p className="font-semibold">Attendance marked</p>
                          <p className="mt-1">
                            Marked at{' '}
                            {new Date(selectedPromoterAttendanceRecord.markedAt).toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                          Attendance has not been marked for this promoter on the selected date yet.
                        </div>
                      )
                    ) : (
                      <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                        Select a promoter to review attendance on the calendar.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Selected Date Promoter Attendance</CardTitle>
                <CardDescription>
                  Review which promoter attendance has already been marked for {format(selectedPromoterDate, 'dd MMM yyyy')}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Promoter Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Marked At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoterAttendanceRows.map((promoter) => (
                      <TableRow key={promoter.id}>
                        <TableCell className="font-medium">{promoter.name}</TableCell>
                        <TableCell>{promoter.code}</TableCell>
                        <TableCell>{promoter.area}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              promoter.attendanceStatus === 'Present'
                                ? 'bg-emerald-100 text-emerald-700'
                                : promoter.attendanceStatus === 'Leave'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {promoter.attendanceStatus}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {promoter.attendanceStatus === 'Leave'
                            ? `${promoterAttendanceRecords[getPromoterAttendanceRecordKey(promoter.id, selectedPromoterDate)]?.leaveType || 'Leave'}${promoterAttendanceRecords[getPromoterAttendanceRecordKey(promoter.id, selectedPromoterDate)]?.reason ? ` - ${promoterAttendanceRecords[getPromoterAttendanceRecordKey(promoter.id, selectedPromoterDate)]?.reason}` : ''}`
                            : promoter.attendanceStatus === 'Present'
                            ? 'Attendance marked'
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {promoter.markedAt
                            ? new Date(promoter.markedAt).toLocaleTimeString([], {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showPromoterLeaveDialog} onOpenChange={setShowPromoterLeaveDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Apply Promoter Leave</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePromoterLeaveSubmit} className="space-y-4">
              <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">
                  {selectedSupervisorPromoter
                    ? `${selectedSupervisorPromoter.name} (${selectedSupervisorPromoter.code})`
                    : 'No promoter selected'}
                </p>
                <p className="mt-1">Date: {format(selectedPromoterDate, 'EEEE, dd MMMM yyyy')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promoterLeaveType">Leave Type *</Label>
                <Select
                  id="promoterLeaveType"
                  value={promoterLeaveFormData.leaveType}
                  onChange={(e) => setPromoterLeaveFormData({ ...promoterLeaveFormData, leaveType: e.target.value })}
                  required
                >
                  <option value="">Select leave type</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promoterLeaveReason">Reason *</Label>
                <Textarea
                  id="promoterLeaveReason"
                  value={promoterLeaveFormData.reason}
                  onChange={(e) => setPromoterLeaveFormData({ ...promoterLeaveFormData, reason: e.target.value })}
                  placeholder="Enter leave reason"
                  rows={4}
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPromoterLeaveDialog(false)
                    setPromoterLeaveFormData({
                      leaveType: '',
                      reason: '',
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Apply Leave</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showClockInModal} onOpenChange={handleCloseClockInModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Capture Selfie for Clock In</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {!modalSelfiePreview ? (
                <>
                  {!modalShowCamera ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Please capture a selfie to complete clock-in
                      </p>
                      <Button
                        type="button"
                        onClick={startModalCamera}
                        className="w-full"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Start Camera
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <video
                        ref={modalVideoRef}
                        autoPlay
                        className="w-full rounded-lg"
                        style={{ maxHeight: '400px' }}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={captureModalSelfie}
                          className="flex-1"
                        >
                          Capture Photo
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setModalShowCamera(false)
                            if (modalVideoRef.current?.srcObject) {
                              modalVideoRef.current.srcObject.getTracks().forEach(track => track.stop())
                            }
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <img
                    src={modalSelfiePreview}
                    alt="Selfie Preview"
                    className="w-full rounded-lg max-h-64 object-cover mx-auto"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setModalSelfiePreview(null)
                        setModalSelfie(null)
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Retake
                    </Button>
                    <Button
                      type="button"
                      onClick={handleClockInSubmit}
                      className="flex-1 bg-[#433228] hover:bg-[#5a4238]"
                    >
                      Submit & Clock In
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showLeaveRequestDialog} onOpenChange={setShowLeaveRequestDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLeaveRequestSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={leaveFormData.startDate}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={leaveFormData.endDate}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                  min={leaveFormData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Select
                  id="leaveType"
                  value={leaveFormData.leaveType}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
                  required
                >
                  <option value="">Select leave type</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  value={leaveFormData.reason}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                  placeholder="Please provide a reason for your leave request"
                  rows={4}
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowLeaveRequestDialog(false)
                    setLeaveFormData({
                      startDate: '',
                      endDate: '',
                      leaveType: '',
                      reason: '',
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 mt-2">
          {isPromoter
            ? 'Clock in between 8:00 AM - 9:30 AM and clock out between 10:00 AM - 11:00 AM (Selfie + GPS Required)'
            : isSupervisor 
            ? 'Clock in between 9:00 AM - 9:35 AM (Selfie + GPS Required) and clock out between 7:30 PM - 11:50 PM (GPS Required)'
            : 'Clock in at 11:00 AM and clock out at 9:00 PM'
          }
        </p>
      </div>

      {(locationError || timeError || error) && (
        <Card className="border-destructive mb-6">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">{locationError || timeError || error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="clock" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clock">
            <Clock className="mr-2 h-4 w-4" />
            Clock In/Out
          </TabsTrigger>
          <TabsTrigger value="leave">
            <Calendar className="mr-2 h-4 w-4" />
            Leave Requests
          </TabsTrigger>
          <TabsTrigger value="weekoff">
            <CalendarDays className="mr-2 h-4 w-4" />
            Week Off
          </TabsTrigger>
        </TabsList>

        {/* Clock In/Out Tab */}
        <TabsContent value="clock" className="space-y-6">



      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Status</CardTitle>
          <CardDescription>Track your clock in and clock out events for today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Attendance Filters */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex items-end gap-4">
            <div className="space-y-2 w-48">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateFilters.startDate}
                onChange={(e) => setDateFilters({ ...dateFilters, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2 w-48">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateFilters.endDate}
                onChange={(e) => setDateFilters({ ...dateFilters, endDate: e.target.value })}
              />
            </div>
            <div className="flex gap-2 mb-0.5 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateFilters({ startDate: '', endDate: '' })}
              >
                Clear Filters
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-[#433228] hover:bg-[#5a4238]"
                onClick={() => {
                  alert('Export functionality to be implemented')
                }}
              >
                Export
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Designated Window</TableHead>
                <TableHead>Actual Time</TableHead>
                <TableHead>Photo</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Clock In Row */}
              <TableRow>
                <TableCell className="font-medium">Clock In</TableCell>
                <TableCell>
                  {isPromoter 
                    ? '8:00 AM - 9:30 AM' 
                    : isSupervisor 
                    ? '9:00 AM - 9:35 AM' 
                    : '11:00 AM'
                  }
                </TableCell>
                <TableCell>
                  {clockInTime ? new Date(clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                </TableCell>
                <TableCell>
                  {status?.clockInSelfie ? (
                    <img 
                      src={status.clockInSelfie} 
                      alt="Clock In" 
                      className="h-10 w-10 rounded-md object-cover border border-gray-200 shadow-sm" 
                    />
                  ) : (
                    <span className="text-gray-400">No Photo</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={handleClockInClick}
                    disabled={loading || isClockedIn}
                    size="sm"
                    className={isClockedIn ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : "bg-[#433228] hover:bg-[#5a4238]"}
                    variant={isClockedIn ? "outline" : "default"}
                  >
                    {isClockedIn ? 'Completed' : 'Clock In'}
                  </Button>
                </TableCell>
              </TableRow>

              {/* Clock Out Row */}
              <TableRow>
                <TableCell className="font-medium">Clock Out</TableCell>
                <TableCell>
                  {isPromoter 
                    ? '10:00 AM - 11:00 AM' 
                    : isSupervisor 
                    ? '7:30 PM - 11:50 PM' 
                    : '9:00 PM'
                  }
                </TableCell>
                <TableCell>
                  {clockOutTime ? new Date(clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                </TableCell>
                <TableCell>
                  {status?.clockOutSelfie ? (
                    <img 
                      src={status.clockOutSelfie} 
                      alt="Clock Out" 
                      className="h-10 w-10 rounded-md object-cover border border-gray-200 shadow-sm" 
                    />
                  ) : (
                    <span className="text-gray-400">No Photo</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={handleClockOut}
                    disabled={loading || !isClockedIn || !!clockOutTime || (isPromoter && !selfie)}
                    size="sm"
                    variant={clockOutTime ? "outline" : "secondary"}
                    className={clockOutTime ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200" : ""}
                  >
                    {clockOutTime ? 'Completed' : !isClockedIn ? 'Waiting' : 'Clock Out'}
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Selfie Capture for Promoter - Visible only when Clocked In but not yet Clocked Out */}
          {isPromoter && isClockedIn && !clockOutTime && (
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="h-5 w-5 text-[#433228]" />
                <h3 className="font-semibold text-gray-900">Required: Capture Selfie for Clock Out</h3>
              </div>
              
              <div className="max-w-md mx-auto">
                {!selfiePreview ? (
                  <>
                    {!showCamera ? (
                      <Button
                        type="button"
                        onClick={startCamera}
                        variant="outline"
                        className="w-full h-24 border-dashed border-2 flex flex-col gap-2"
                      >
                        <Camera className="h-8 w-8 text-gray-400" />
                        <span>Open Camera to Capture Photo</span>
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative rounded-lg overflow-hidden border-2 border-[#433228]">
                          <video ref={videoRef} autoPlay className="w-full" style={{ maxHeight: '300px' }} />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={captureSelfie}
                            className="flex-1 bg-[#433228] hover:bg-[#5a4238]"
                          >
                            Capture Photo
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setShowCamera(false)
                              if (videoRef.current?.srcObject) {
                                videoRef.current.srcObject.getTracks().forEach(track => track.stop())
                              }
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3 text-center">
                    <img 
                      src={selfiePreview} 
                      alt="Selfie Preview" 
                      className="w-full rounded-lg border-2 border-green-500 max-h-48 object-cover shadow-md mx-auto" 
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          setSelfiePreview(null)
                          setSelfie(null)
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Retake Photo
                      </Button>
                      <div className="flex-1 flex items-center justify-center text-sm font-medium text-green-600">
                        ✓ Photo Captured
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {location.latitude && location.longitude && (
        <Card>
          <CardHeader>
            <CardTitle>Location Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">GPS coordinates captured:</p>
            <p className="text-sm font-mono">
              Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

        </TabsContent>

        {/* Leave Requests Tab */}
        <TabsContent value="leave" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Leave Requests</CardTitle>
                  <CardDescription>Submit and track your leave requests</CardDescription>
                </div>
                <Button onClick={() => setShowLeaveRequestDialog(true)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Request Leave
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {leaveRequests && leaveRequests.length > 0 ? (
                <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequestsPagination.paginatedItems.map((request, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{request.leaveType}</TableCell>
                        <TableCell className="max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getLeaveStatusBadge(request.status)}`}>
                            {request.status || 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {request.appliedOn ? new Date(request.appliedOn).toLocaleDateString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePaginationControls {...leaveRequestsPagination} />
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No leave requests submitted yet</p>
                  <p className="text-sm mt-2">Click "Request Leave" to submit a new request</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Week Off Tab */}
        <TabsContent value="weekoff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Week Off Selection</CardTitle>
              <CardDescription>Select your weekly off days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {weekDays.map((day) => {
                  const isSelected = selectedWeekOffDays.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleWeekOffDayToggle(day)}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-center
                        ${isSelected 
                          ? 'bg-blue-100 border-blue-500 text-blue-800 font-semibold' 
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }
                      `}
                    >
                      <div className="text-lg">{day}</div>
                      {isSelected && (
                        <div className="text-xs mt-1">✓ Selected</div>
                      )}
                    </button>
                  )
                })}
              </div>
              
              {selectedWeekOffDays.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Selected Week Off Days:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedWeekOffDays.map((day) => (
                      <span key={day} className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleWeekOffSubmit} 
                disabled={loading || selectedWeekOffDays.length === 0}
                className="w-full"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Save Week Off
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Clock In Selfie Modal for Supervisor and Promoter */}
      <Dialog open={showClockInModal} onOpenChange={handleCloseClockInModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Capture Selfie for Clock In</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!modalSelfiePreview ? (
              <>
                {!modalShowCamera ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Please capture a selfie to complete clock-in
                    </p>
                    <Button
                      type="button"
                      onClick={startModalCamera}
                      className="w-full"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Start Camera
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <video 
                      ref={modalVideoRef} 
                      autoPlay 
                      className="w-full rounded-lg" 
                      style={{ maxHeight: '400px' }} 
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={captureModalSelfie}
                        className="flex-1"
                      >
                        Capture Photo
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setModalShowCamera(false)
                          if (modalVideoRef.current?.srcObject) {
                            modalVideoRef.current.srcObject.getTracks().forEach(track => track.stop())
                          }
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <img 
                  src={modalSelfiePreview} 
                  alt="Selfie Preview" 
                  className="w-full rounded-lg max-h-64 object-cover mx-auto" 
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setModalSelfiePreview(null)
                      setModalSelfie(null)
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Retake
                  </Button>
                  <Button
                    type="button"
                    onClick={handleClockInSubmit}
                    className="flex-1 bg-[#433228] hover:bg-[#5a4238]"
                  >
                    Submit & Clock In
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Request Dialog */}
      <Dialog open={showLeaveRequestDialog} onOpenChange={setShowLeaveRequestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLeaveRequestSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={leaveFormData.startDate}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={leaveFormData.endDate}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                min={leaveFormData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type *</Label>
              <Select
                id="leaveType"
                value={leaveFormData.leaveType}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
                required
              >
                <option value="">Select leave type</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Earned Leave">Earned Leave</option>
                <option value="Personal Leave">Personal Leave</option>
                <option value="Emergency Leave">Emergency Leave</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                value={leaveFormData.reason}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                placeholder="Please provide a reason for your leave request"
                rows={4}
                required
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowLeaveRequestDialog(false)
                  setLeaveFormData({
                    startDate: '',
                    endDate: '',
                    leaveType: '',
                    reason: '',
                  })
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Attendance
