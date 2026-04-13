import { useState, useEffect, useRef } from 'react'
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
import { Clock, Camera, Calendar, CalendarDays } from 'lucide-react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

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
  
  // Date Filters
  const [dateFilters, setDateFilters] = useState({
    startDate: '',
    endDate: '',
  })
  const leaveRequestsPagination = useTablePagination(leaveRequests || [])

  // Time windows based on role
  const isSupervisor = user?.role === 'Supervisor'
  const isPromoter = user?.role === 'Promoter'
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
