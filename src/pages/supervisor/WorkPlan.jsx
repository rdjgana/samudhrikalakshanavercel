import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Send, CheckCircle } from 'lucide-react'
import { isValidPartialDecimal } from '../../lib/decimalInput'

const WORK_PLAN_PURPOSE_OPTIONS = [
  'Area visit',
  'Distributor visit',
  'New Shop visit',
  'Primary Sales',
  'Secondary Sales',
  'Stock Verification',
  'Promoter Appointment',
]

const WorkPlan = () => {
  const user = useSelector((state) => state.auth.user)
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  const currentYear = new Date().getFullYear()
  const currentMonthNum = new Date().getMonth() + 1

  const [selectedPeriod, setSelectedPeriod] = useState('period1') // period1, period2, period3
  const [workPlans, setWorkPlans] = useState({
    period1: [], // 1-10
    period2: [], // 11-20
    period3: [], // 21-31
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedDate, setSubmittedDate] = useState(null)

  const [formData, setFormData] = useState({
    date: '',
    fromPlace: '',
    fromPurpose: '',
    toPlace: '',
    toPurpose: '',
    kmCover: '',
    kmTravelAllowance: '',
    details: '',
  })

  const getPeriodDates = (period) => {
    switch (period) {
      case 'period1':
        return { start: 1, end: 10, label: '1st - 10th' }
      case 'period2':
        return { start: 11, end: 20, label: '11th - 20th' }
      case 'period3':
        return { start: 21, end: 31, label: '21st - 31st' }
      default:
        return { start: 1, end: 10, label: '1st - 10th' }
    }
  }

  // Get days that already have plans
  const getPlannedDays = (period) => {
    return workPlans[period].map(plan => plan.day)
  }

  // Check if a day is already planned
  const isDayPlanned = (period, day) => {
    return workPlans[period].some(plan => plan.day === day)
  }

  // Generate array of days for the period
  const getDaysInPeriod = (period) => {
    const { start, end } = getPeriodDates(period)
    const days = []
    for (let i = start; i <= end; i++) {
      days.push(i)
    }
    return days
  }

  const handleAddPlan = () => {
    if (
      !formData.date ||
      !formData.fromPlace ||
      !formData.fromPurpose ||
      !formData.toPlace ||
      !formData.toPurpose ||
      formData.kmCover === '' ||
      formData.kmTravelAllowance === ''
    ) {
      alert(
        'Please fill all required fields: Date, From Place, From Purpose, To Place, To Purpose, KM cover, and KM travel cover allowance',
      )
      return
    }
    const km = parseFloat(formData.kmCover, 10)
    if (Number.isNaN(km) || km < 0) {
      alert('Please enter a valid KM cover (0 or more)')
      return
    }
    const allowance = parseFloat(formData.kmTravelAllowance, 10)
    if (Number.isNaN(allowance) || allowance < 0) {
      alert('Please enter a valid KM travel cover allowance (₹, 0 or more)')
      return
    }

    const selectedDate = new Date(formData.date)
    const day = selectedDate.getDate()

    // Validate date is within selected period
    const periodDates = getPeriodDates(selectedPeriod)
    if (day < periodDates.start || day > periodDates.end) {
      alert(`Date must be between ${periodDates.start} and ${periodDates.end} of the month`)
      return
    }

    // Check if day is already planned
    if (isDayPlanned(selectedPeriod, day)) {
      alert(`Day ${day} already has a planned activity. Please choose a different day or delete the existing plan first.`)
      return
    }

    const newPlan = {
      id: Date.now(),
      date: formData.date,
      day: day,
      fromPlace: formData.fromPlace,
      fromPurpose: formData.fromPurpose,
      toPlace: formData.toPlace,
      toPurpose: formData.toPurpose,
      kmCover: km,
      kmTravelAllowance: allowance,
      details: formData.details || '',
      createdAt: new Date().toISOString(),
    }

    setWorkPlans(prev => ({
      ...prev,
      [selectedPeriod]: [...prev[selectedPeriod], newPlan].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      ),
    }))

    // Reset form
    setFormData({
      date: '',
      fromPlace: '',
      fromPurpose: '',
      toPlace: '',
      toPurpose: '',
      kmCover: '',
      kmTravelAllowance: '',
      details: '',
    })
  }

  const handleDeletePlan = (period, planId) => {
    setWorkPlans(prev => ({
      ...prev,
      [period]: prev[period].filter(plan => plan.id !== planId),
    }))
  }

  // Check if work plan is already submitted
  useEffect(() => {
    const submittedPlans = JSON.parse(localStorage.getItem('submittedWorkPlans') || '[]')
    const userPlan = submittedPlans.find(
      plan => plan.employeeName === user?.name && plan.month === currentMonth && plan.status === 'Pending'
    )
    if (userPlan) {
      setIsSubmitted(true)
      setSubmittedDate(userPlan.submittedDate)
      // Load submitted plan data
      setWorkPlans({
        period1: userPlan.period1 || [],
        period2: userPlan.period2 || [],
        period3: userPlan.period3 || [],
      })
    }
  }, [user, currentMonth])

  const handleSubmitWorkPlan = () => {
    const totalActivities = workPlans.period1.length + workPlans.period2.length + workPlans.period3.length
    
    if (totalActivities === 0) {
      alert('Please add at least one activity before submitting the work plan')
      return
    }

    const submittedWorkPlan = {
      id: Date.now(),
      employeeName: user?.name || 'Supervisor',
      employeeRole: 'Supervisor',
      submittedDate: new Date().toISOString(),
      month: currentMonth,
      status: 'Pending',
      period1: workPlans.period1,
      period2: workPlans.period2,
      period3: workPlans.period3,
    }

    // Get existing submitted work plans
    const submittedPlans = JSON.parse(localStorage.getItem('submittedWorkPlans') || '[]')
    
    // Remove any existing pending plan for this user and month
    const filteredPlans = submittedPlans.filter(
      plan => !(plan.employeeName === user?.name && plan.month === currentMonth && plan.status === 'Pending')
    )
    
    // Add new submitted plan
    filteredPlans.push(submittedWorkPlan)
    localStorage.setItem('submittedWorkPlans', JSON.stringify(filteredPlans))

    setIsSubmitted(true)
    setSubmittedDate(submittedWorkPlan.submittedDate)
    alert('Work plan submitted successfully! It will be reviewed by HR.')
  }

  const periodDates = getPeriodDates(selectedPeriod)

  const workPlanPeriod1Pagination = useTablePagination(workPlans.period1)
  const workPlanPeriod2Pagination = useTablePagination(workPlans.period2)
  const workPlanPeriod3Pagination = useTablePagination(workPlans.period3)

  const totalActivities = workPlans.period1.length + workPlans.period2.length + workPlans.period3.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Plan</h1>
          <p className="text-gray-600 mt-2">Plan activities for {currentMonth} - 3 periods</p>
        </div>
        {isSubmitted ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">Work Plan Submitted</p>
              <p className="text-xs text-green-600">
                Submitted on {submittedDate ? new Date(submittedDate).toLocaleDateString('en-IN') : ''}
              </p>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleSubmitWorkPlan}
            disabled={totalActivities === 0}
            className="bg-[#433228] hover:bg-[#5a4238] text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Work Plan
          </Button>
        )}
      </div>

      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="period1">Period 1 (1-10)</TabsTrigger>
          <TabsTrigger value="period2">Period 2 (11-20)</TabsTrigger>
          <TabsTrigger value="period3">Period 3 (21-31)</TabsTrigger>
        </TabsList>

        {['period1', 'period2', 'period3'].map((period) => {
          const dates = getPeriodDates(period)
          const periodPagination =
            period === 'period1'
              ? workPlanPeriod1Pagination
              : period === 'period2'
                ? workPlanPeriod2Pagination
                : workPlanPeriod3Pagination
          return (
            <TabsContent key={period} value={period}>
              <Card>
                <CardHeader>
                  <CardTitle>Period {period.slice(-1)}: {dates.label} {currentMonth}</CardTitle>
                  <CardDescription>Plan activities for days {dates.start} to {dates.end}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Days Status Overview - Clickable Days */}
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-3">Select Day to Add Plan ({dates.start} to {dates.end})</h3>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {getDaysInPeriod(period).map((day) => {
                        const isPlanned = isDayPlanned(period, day)
                        const dateString = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        
                        return (
                          <button
                            key={day}
                            type="button"
                            disabled={isPlanned || isSubmitted}
                            onClick={() => {
                              if (!isPlanned && !isSubmitted) {
                                setFormData({ ...formData, date: dateString })
                              }
                            }}
                            className={`
                              flex items-center justify-center h-12 rounded-lg border-2 font-semibold transition-all
                              ${isPlanned 
                                ? 'bg-green-100 border-green-500 text-green-800 cursor-not-allowed opacity-75' 
                                : 'bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                              }
                              ${formData.date === dateString ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-300' : ''}
                            `}
                          >
                            <div className="text-center">
                              <div className="text-lg">{day}</div>
                              {isPlanned && (
                                <div className="text-[10px] leading-none">✓ Planned</div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex gap-4 mt-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                        <span className="text-gray-600">Available (Click to select)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
                        <span className="text-gray-600">Already Planned</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-100 border-2 border-blue-600 rounded"></div>
                        <span className="text-gray-600">Selected</span>
                      </div>
                    </div>
                  </div>

                  {/* Add Work Plan Form */}
                  <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                    <h3 className="font-semibold">Add Activity</h3>
                    
                    {/* Date - Selected from grid above */}
                    <div className="space-y-2">
                      <Label>Selected Date *</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={formData.date}
                          readOnly
                          className="bg-gray-100 cursor-not-allowed"
                          required
                        />
                        {formData.date && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({ ...formData, date: '' })}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-blue-600">
                        {formData.date 
                          ? `Day ${new Date(formData.date).getDate()} selected - Fill in the details below` 
                          : 'Click on an available day above to select a date'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                      <div className="space-y-2">
                        <Label>KM cover *</Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          placeholder="e.g. 12.5"
                          value={formData.kmCover}
                          onChange={(e) => {
                            const v = e.target.value
                            if (isValidPartialDecimal(v)) {
                              setFormData({ ...formData, kmCover: v })
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>KM travel cover allowance (₹) *</Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          placeholder="e.g. 500"
                          value={formData.kmTravelAllowance}
                          onChange={(e) => {
                            const v = e.target.value
                            if (isValidPartialDecimal(v)) {
                              setFormData({ ...formData, kmTravelAllowance: v })
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* From Place & Purpose */}
                    <div className="border-l-4 border-blue-500 pl-4 space-y-3">
                      <h4 className="font-medium text-blue-700">From Place</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Place Name *</Label>
                          <Input
                            type="text"
                            placeholder="Enter starting place"
                            value={formData.fromPlace}
                            onChange={(e) => setFormData({ ...formData, fromPlace: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Purpose of Visit *</Label>
                          <Select
                            value={formData.fromPurpose}
                            onChange={(e) => setFormData({ ...formData, fromPurpose: e.target.value })}
                            required
                          >
                            <option value="">Select Purpose</option>
                            {WORK_PLAN_PURPOSE_OPTIONS.map((purpose) => (
                              <option key={`from-${purpose}`} value={purpose}>
                                {purpose}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* To Place & Purpose */}
                    <div className="border-l-4 border-green-500 pl-4 space-y-3">
                      <h4 className="font-medium text-green-700">To Place</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Place Name *</Label>
                          <Input
                            type="text"
                            placeholder="Enter destination place"
                            value={formData.toPlace}
                            onChange={(e) => setFormData({ ...formData, toPlace: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Purpose of Visit *</Label>
                          <Select
                            value={formData.toPurpose}
                            onChange={(e) => setFormData({ ...formData, toPurpose: e.target.value })}
                            required
                          >
                            <option value="">Select Purpose</option>
                            {WORK_PLAN_PURPOSE_OPTIONS.map((purpose) => (
                              <option key={`to-${purpose}`} value={purpose}>
                                {purpose}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <Label>Additional Details</Label>
                      <Textarea
                        placeholder="Enter any additional details about the travel plan..."
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleAddPlan}
                      className="w-full bg-[#433228] hover:bg-[#5a4238]"
                      disabled={isSubmitted}
                    >
                      Add Activity
                    </Button>
                    {isSubmitted && (
                      <p className="text-xs text-orange-600 text-center">
                        Work plan is submitted. Cannot add or modify activities.
                      </p>
                    )}
                  </div>

                  {/* Work Plans List */}
                  {workPlans[period].length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Planned Activities</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Day</TableHead>
                            <TableHead>KM cover</TableHead>
                            <TableHead>Travel allowance (₹)</TableHead>
                            <TableHead>From Place</TableHead>
                            <TableHead>From Purpose</TableHead>
                            <TableHead>To Place</TableHead>
                            <TableHead>To Purpose</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {periodPagination.paginatedItems.map((plan) => (
                            <TableRow key={plan.id}>
                              <TableCell>{new Date(plan.date).toLocaleDateString()}</TableCell>
                              <TableCell className="font-medium">{plan.day}</TableCell>
                              <TableCell className="text-sm">
                                {plan.kmCover != null ? `${plan.kmCover} km` : '—'}
                              </TableCell>
                              <TableCell className="text-sm font-medium">
                                {plan.kmTravelAllowance != null && plan.kmTravelAllowance !== ''
                                  ? `₹${Number(plan.kmTravelAllowance).toLocaleString('en-IN')}`
                                  : '—'}
                              </TableCell>
                              <TableCell>
                                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 font-medium">
                                  {plan.fromPlace}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm">{plan.fromPurpose}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 font-medium">
                                  {plan.toPlace}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm">{plan.toPurpose}</TableCell>
                              <TableCell className="max-w-xs truncate">{plan.details || '-'}</TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeletePlan(period, plan.id)}
                                  disabled={isSubmitted}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {workPlans[period].length > 0 && (
                        <TablePaginationControls {...periodPagination} />
                      )}
                    </div>
                  ) : (
                    <Card className="bg-gray-50">
                      <CardContent className="pt-6">
                        <p className="text-center text-gray-500">No activities planned for this period yet</p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

export default WorkPlan
