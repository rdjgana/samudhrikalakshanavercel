import { useState, useEffect, useMemo } from 'react'
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
import { MOCK_HIERARCHY, MOCK_SHOPS } from '../../data/mockData'

const VISIT_PURPOSE_OPTIONS = [
  'New shop activation',
  'Shop primary sales',
  'Shop secondary sales',
  'Stock verification',
  'Promoter appointment',
]

const STOCK_UPDATE_SCOPES = ['Distributor stock update', 'Shop stock update']

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
    allocatedArea: '',
    distributorId: '',
    shopId: '',
    shopToActivate: '',
    visitPurpose: '',
    stockUpdateScope: '',
    primarySaleAmount: '',
    secondarySaleAmount: '',
    stockUpdateNotes: '',
    details: '',
  })

  const supervisorRecord = useMemo(() => {
    const sid = user?.supervisorId
    const sidNum = sid === '' || sid == null ? NaN : Number(sid)
    return MOCK_HIERARCHY.supervisors.find(
      (s) => (!Number.isNaN(sidNum) && s.id === sidNum) || s.name === user?.name,
    )
  }, [user])

  const allocatedAreas = useMemo(() => {
    if (!supervisorRecord) return []
    const dists = MOCK_HIERARCHY.distributors.filter(
      (d) => d.supervisorId === supervisorRecord.id,
    )
    return [...new Set(dists.map((d) => d.district))].sort()
  }, [supervisorRecord])

  const distributorsInArea = useMemo(() => {
    if (!supervisorRecord || !formData.allocatedArea) return []
    return MOCK_HIERARCHY.distributors.filter(
      (d) =>
        d.supervisorId === supervisorRecord.id &&
        d.district === formData.allocatedArea,
    )
  }, [supervisorRecord, formData.allocatedArea])

  const shopsForSelectedDistributor = useMemo(() => {
    if (!formData.distributorId) return []
    const id = parseInt(formData.distributorId, 10)
    return MOCK_SHOPS.filter((s) => s.distributorId === id)
  }, [formData.distributorId])

  const selectedDistributor = useMemo(
    () =>
      MOCK_HIERARCHY.distributors.find(
        (d) => d.id === parseInt(formData.distributorId, 10),
      ),
    [formData.distributorId],
  )

  const selectedShop = useMemo(
    () => MOCK_SHOPS.find((s) => s.id === parseInt(formData.shopId, 10)),
    [formData.shopId],
  )

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
      !formData.allocatedArea ||
      !formData.distributorId ||
      !formData.visitPurpose
    ) {
      alert('Please fill: date, allocated area, distributor, and purpose of visit')
      return
    }

    if (formData.visitPurpose === 'New shop activation') {
      if (!formData.shopToActivate?.trim()) {
        alert('Enter the shop to activate')
        return
      }
    }

    if (formData.visitPurpose === 'Promoter appointment') {
      if (!formData.shopId) {
        alert('Select a shop for the promoter appointment')
        return
      }
    }

    if (formData.visitPurpose === 'Shop primary sales') {
      if (!formData.shopId) {
        alert('Select a shop for primary sales')
        return
      }
      const amt = parseFloat(formData.primarySaleAmount, 10)
      if (Number.isNaN(amt) || amt <= 0) {
        alert('Enter primary sale amount (greater than 0)')
        return
      }
    }

    if (formData.visitPurpose === 'Shop secondary sales') {
      if (!formData.shopId) {
        alert('Select a shop for secondary sales')
        return
      }
      const amt = parseFloat(formData.secondarySaleAmount, 10)
      if (Number.isNaN(amt) || amt <= 0) {
        alert('Enter secondary sale amount (greater than 0)')
        return
      }
    }

    if (formData.visitPurpose === 'Stock update') {
      if (!formData.stockUpdateScope) {
        alert('Choose Distributor stock update or Shop stock update')
        return
      }
      if (formData.stockUpdateScope === 'Shop stock update' && !formData.shopId) {
        alert('Select a shop for shop stock update')
        return
      }
      if (!formData.stockUpdateNotes?.trim()) {
        alert('Enter stock update / verification notes')
        return
      }
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

    const distName = selectedDistributor?.name || ''
    const shopName =
      formData.visitPurpose === 'New shop activation'
        ? formData.shopToActivate.trim()
        : selectedShop?.name || ''

    let toPurposeSummary = ''
    if (formData.visitPurpose === 'Shop primary sales') {
      toPurposeSummary = `Primary ₹${Number(formData.primarySaleAmount).toLocaleString('en-IN')} @ ${shopName}`
    } else if (formData.visitPurpose === 'Shop secondary sales') {
      toPurposeSummary = `Secondary ₹${Number(formData.secondarySaleAmount).toLocaleString('en-IN')} @ ${shopName}`
    } else if (formData.visitPurpose === 'Stock update') {
      toPurposeSummary = `${formData.stockUpdateScope}${shopName ? ` — ${shopName}` : ` — ${distName}`}`
    } else if (formData.visitPurpose === 'New shop activation') {
      toPurposeSummary = shopName ? `Activate: ${shopName}` : 'New shop activation'
    } else if (formData.visitPurpose === 'Promoter appointment') {
      toPurposeSummary = shopName ? `Promoter appointment @ ${shopName}` : 'Promoter appointment'
    }

    const newPlan = {
      id: Date.now(),
      date: formData.date,
      day: day,
      allocatedArea: formData.allocatedArea,
      distributorId: formData.distributorId,
      distributorName: distName,
      shopId: formData.visitPurpose === 'New shop activation' ? '' : formData.shopId || '',
      shopName,
      visitPurpose: formData.visitPurpose,
      stockUpdateScope: formData.stockUpdateScope || '',
      primarySaleAmount: formData.primarySaleAmount || '',
      secondarySaleAmount: formData.secondarySaleAmount || '',
      stockUpdateNotes: formData.stockUpdateNotes || '',
      fromPlace: `Area: ${formData.allocatedArea}`,
      toPlace: shopName
        ? `Distributor: ${distName} → Shop: ${shopName}`
        : `Distributor: ${distName}`,
      fromPurpose: formData.visitPurpose,
      toPurpose: toPurposeSummary,
      details: [formData.details, formData.stockUpdateNotes]
        .filter(Boolean)
        .join('\n')
        .trim(),
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
      allocatedArea: '',
      distributorId: '',
      shopId: '',
      shopToActivate: '',
      visitPurpose: '',
      stockUpdateScope: '',
      primarySaleAmount: '',
      secondarySaleAmount: '',
      stockUpdateNotes: '',
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
                                setFormData((prev) => ({ ...prev, date: dateString }))
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
                            onClick={() => setFormData((prev) => ({ ...prev, date: '' }))}
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

                    {!supervisorRecord && (
                      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                        No supervisor allocation found for this user. Area and distributor lists will be empty until
                        your profile is linked to a supervisor record.
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2 max-w-xl">
                        <Label>Allocated area (covers) *</Label>
                        <Select
                          value={formData.allocatedArea}
                          disabled={!supervisorRecord || isSubmitted}
                          onChange={(e) => {
                            const allocatedArea = e.target.value
                            setFormData((prev) => ({
                              ...prev,
                              allocatedArea,
                              distributorId: '',
                              shopId: '',
                              shopToActivate: '',
                              visitPurpose: '',
                              stockUpdateScope: '',
                              primarySaleAmount: '',
                              secondarySaleAmount: '',
                              stockUpdateNotes: '',
                            }))
                          }}
                        >
                          <option value="">Select area</option>
                          {allocatedAreas.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2 max-w-xl">
                        <Label>Distributor *</Label>
                        <Select
                          value={formData.distributorId}
                          disabled={!formData.allocatedArea || isSubmitted}
                          onChange={(e) => {
                            const distributorId = e.target.value
                            setFormData((prev) => ({
                              ...prev,
                              distributorId,
                              shopId: '',
                              shopToActivate: '',
                              primarySaleAmount: '',
                              secondarySaleAmount: '',
                              stockUpdateNotes: '',
                            }))
                          }}
                        >
                          <option value="">Select distributor</option>
                          {distributorsInArea.map((d) => (
                            <option key={d.id} value={String(d.id)}>
                              {d.name}
                            </option>
                          ))}
                        </Select>
                        {formData.allocatedArea && distributorsInArea.length === 0 && (
                          <p className="text-xs text-gray-500">No distributors in this area for your allocation.</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2 max-w-xl">
                        <Label>Purpose of visit *</Label>
                        <Select
                          value={formData.visitPurpose}
                          disabled={!formData.distributorId || isSubmitted}
                          onChange={(e) => {
                            const visitPurpose = e.target.value
                            setFormData((prev) => ({
                              ...prev,
                              visitPurpose,
                              stockUpdateScope: '',
                              shopId: '',
                              shopToActivate: '',
                              primarySaleAmount: '',
                              secondarySaleAmount: '',
                              stockUpdateNotes: '',
                            }))
                          }}
                        >
                          <option value="">Select purpose</option>
                          {VISIT_PURPOSE_OPTIONS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    {formData.visitPurpose === 'Stock update' && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 space-y-3">
                        <Label className="text-amber-900">Stock update with verification *</Label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          {STOCK_UPDATE_SCOPES.map((scope) => (
                            <label
                              key={scope}
                              className="flex items-center gap-2 text-sm cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="stockUpdateScope"
                                className="h-4 w-4"
                                checked={formData.stockUpdateScope === scope}
                                disabled={isSubmitted}
                                onChange={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    stockUpdateScope: scope,
                                    shopId: scope === 'Distributor stock update' ? '' : prev.shopId,
                                    stockUpdateNotes: '',
                                  }))
                                }
                              />
                              {scope}
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-amber-800">
                          Distributor: update stock at the selected distributor. Shop: pick a covered shop under that
                          distributor.
                        </p>
                      </div>
                    )}

                    {formData.visitPurpose === 'New shop activation' && (
                      <div className="space-y-2 max-w-xl">
                        <Label htmlFor="shop-to-activate">Shop to activate *</Label>
                        <Input
                          id="shop-to-activate"
                          type="text"
                          placeholder="Enter shop name to activate"
                          value={formData.shopToActivate}
                          disabled={!formData.distributorId || isSubmitted}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, shopToActivate: e.target.value }))
                          }
                        />
                      </div>
                    )}

                    {(formData.visitPurpose === 'Promoter appointment' ||
                      formData.visitPurpose === 'Shop primary sales' ||
                      formData.visitPurpose === 'Shop secondary sales' ||
                      (formData.visitPurpose === 'Stock update' &&
                        formData.stockUpdateScope === 'Shop stock update')) && (
                      <div className="space-y-2 max-w-xl">
                        <Label>
                          {formData.visitPurpose === 'Promoter appointment'
                            ? 'Shop (promoter visit) *'
                            : 'Shop *'}
                        </Label>
                        <Select
                          value={formData.shopId}
                          disabled={!formData.distributorId || shopsForSelectedDistributor.length === 0 || isSubmitted}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, shopId: e.target.value }))
                          }
                        >
                          <option value="">Select shop</option>
                          {shopsForSelectedDistributor.map((s) => (
                            <option key={s.id} value={String(s.id)}>
                              {s.name}
                            </option>
                          ))}
                        </Select>
                        {formData.distributorId && shopsForSelectedDistributor.length === 0 && (
                          <p className="text-xs text-gray-500">No shops mapped to this distributor in mock data.</p>
                        )}
                      </div>
                    )}

                    {formData.visitPurpose === 'Shop primary sales' && (
                      <div className="space-y-2 max-w-xs">
                        <Label>Primary sale amount (₹) *</Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          placeholder="e.g. 15000"
                          value={formData.primarySaleAmount}
                          disabled={isSubmitted}
                          onChange={(e) => {
                            const v = e.target.value
                            if (isValidPartialDecimal(v)) {
                              setFormData((prev) => ({ ...prev, primarySaleAmount: v }))
                            }
                          }}
                        />
                      </div>
                    )}

                    {formData.visitPurpose === 'Shop secondary sales' && (
                      <div className="space-y-2 max-w-xs">
                        <Label>Secondary sale amount (₹) *</Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          placeholder="e.g. 8500"
                          value={formData.secondarySaleAmount}
                          disabled={isSubmitted}
                          onChange={(e) => {
                            const v = e.target.value
                            if (isValidPartialDecimal(v)) {
                              setFormData((prev) => ({ ...prev, secondarySaleAmount: v }))
                            }
                          }}
                        />
                      </div>
                    )}

                    {formData.visitPurpose === 'Stock update' && formData.stockUpdateScope && (
                      <div className="space-y-2 max-w-2xl">
                        <Label>Stock update / verification notes *</Label>
                        <Textarea
                          placeholder="SKUs verified, quantities adjusted, batch numbers, etc."
                          value={formData.stockUpdateNotes}
                          disabled={isSubmitted}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, stockUpdateNotes: e.target.value }))
                          }
                          rows={3}
                        />
                      </div>
                    )}

                    {formData.visitPurpose === 'New shop activation' && (
                      <p className="text-xs text-gray-600 max-w-2xl">
                        Type the shop name you will activate under this distributor. Add address or onboarding notes in
                        Additional details if needed.
                      </p>
                    )}

                    {formData.visitPurpose === 'Promoter appointment' && (
                      <p className="text-xs text-gray-600 max-w-2xl">
                        Shops listed are under the selected distributor. Pick the shop where the promoter appointment
                        will take place.
                      </p>
                    )}

                    <div className="space-y-2">
                      <Label>Additional details</Label>
                      <Textarea
                        placeholder="Route notes, follow-ups, or new shop particulars…"
                        value={formData.details}
                        onChange={(e) => setFormData((prev) => ({ ...prev, details: e.target.value }))}
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
                            <TableHead>Area</TableHead>
                            <TableHead>Distributor</TableHead>
                            <TableHead>Shop</TableHead>
                            <TableHead>Purpose</TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {periodPagination.paginatedItems.map((plan) => {
                            const areaLabel =
                              plan.allocatedArea ||
                              (typeof plan.fromPlace === 'string' && plan.fromPlace.startsWith('Area:')
                                ? plan.fromPlace.replace(/^Area:\s*/, '').trim()
                                : plan.fromPlace || '—')
                            const distLabel =
                              plan.distributorName ||
                              (typeof plan.toPlace === 'string' && plan.toPlace.includes('Distributor:')
                                ? plan.toPlace.split('→')[0]?.replace(/^\s*Distributor:\s*/i, '').trim()
                                : '—')
                            const shopLabel =
                              plan.shopName ||
                              (typeof plan.toPlace === 'string' && plan.toPlace.includes('→')
                                ? plan.toPlace.split('→')[1]?.replace(/^\s*Shop:\s*/i, '').trim()
                                : '')
                            const purposeLabel = plan.visitPurpose || plan.fromPurpose || '—'
                            const summaryLabel =
                              plan.toPurpose ||
                              [plan.fromPurpose, plan.toPurpose].filter(Boolean).join(' → ') ||
                              '—'
                            return (
                            <TableRow key={plan.id}>
                              <TableCell>{new Date(plan.date).toLocaleDateString()}</TableCell>
                              <TableCell className="font-medium">{plan.day}</TableCell>
                              <TableCell className="text-sm max-w-[140px]">{areaLabel}</TableCell>
                              <TableCell className="text-sm max-w-[180px]">{distLabel}</TableCell>
                              <TableCell className="text-sm max-w-[160px]">{shopLabel || '—'}</TableCell>
                              <TableCell className="text-sm whitespace-nowrap">{purposeLabel}</TableCell>
                              <TableCell className="text-sm max-w-[200px]">{summaryLabel}</TableCell>
                              <TableCell className="max-w-xs truncate">{plan.details || '—'}</TableCell>
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
                            )
                          })}
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
