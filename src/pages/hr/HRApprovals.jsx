import { useState, useEffect, useMemo } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { CheckCircle, XCircle, Edit, AlertCircle, Eye, Calendar, Trash2, Plus } from 'lucide-react'
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

// Mock Approvals Data
const MOCK_APPROVALS = [
  {
    id: 1,
    type: 'Target',
    employeeName: 'Priya Menon',
    category: 'Body Care',
    date: '2026-01-21',
    status: 'Approved',
    details: 'Monthly target assignment',
  },
  {
    id: 2,
    type: 'Leave',
    employeeName: 'Mohan Raj',
    category: 'Personal',
    date: '2026-01-22',
    status: 'Modified',
    details: 'Leave request for 3 days',
  },
  {
    id: 3,
    type: 'Claim',
    employeeName: 'Karthik Senthil',
    category: 'Expense',
    date: '2026-01-23',
    status: 'Pending',
    details: 'Travel expense claim',
  },
]

// Mock Work Plans for RSM, ASM, and Supervisor (matching Supervisor Work Plan structure)
const MOCK_WORK_PLANS = [
  {
    id: 1,
    employeeName: 'Rajesh Kumar',
    employeeRole: 'RSM',
    submittedDate: '2026-01-15',
    month: 'January 2026',
    status: 'Pending',
    period1: [
      { id: 1, date: '2026-01-05', day: 5, fromPlace: 'Chennai', fromPurpose: 'Area visit', toPlace: 'T Nagar', toPurpose: 'Shop visit', details: 'Visit key shops in T Nagar area' },
      { id: 2, date: '2026-01-08', day: 8, fromPlace: 'Chennai', fromPurpose: 'Distributor visit', toPlace: 'Anna Nagar', toPurpose: 'Primary Sales', details: 'Meet with distributor for sales discussion' },
    ],
    period2: [
      { id: 3, date: '2026-01-12', day: 12, fromPlace: 'Chennai', fromPurpose: 'New Shop visit', toPlace: 'Adyar', toPurpose: 'Secondary Sales', details: 'New shop activation and training' },
    ],
    period3: []
  },
  {
    id: 2,
    employeeName: 'Priya Menon',
    employeeRole: 'ASM',
    submittedDate: '2026-01-16',
    month: 'January 2026',
    status: 'Pending',
    period1: [
      { id: 4, date: '2026-01-06', day: 6, fromPlace: 'Coimbatore', fromPurpose: 'Area visit', toPlace: 'Velachery', toPurpose: 'Stock Verification', details: 'Check stock levels at key locations' },
    ],
    period2: [
      { id: 5, date: '2026-01-10', day: 10, fromPlace: 'Coimbatore', fromPurpose: 'Distributor visit', toPlace: 'Ambattur', toPurpose: 'Promoter Appointment', details: 'Interview and appoint new promoter' },
      { id: 6, date: '2026-01-15', day: 15, fromPlace: 'Coimbatore', fromPurpose: 'Primary Sales', toPlace: 'T Nagar', toPurpose: 'Secondary Sales', details: 'Sales follow-up and target review' },
    ],
    period3: []
  },
  {
    id: 3,
    employeeName: 'Mohan Raj',
    employeeRole: 'Supervisor',
    submittedDate: '2026-01-16',
    month: 'January 2026',
    status: 'Pending',
    period1: [
      { id: 7, date: '2026-01-06', day: 6, fromPlace: 'Chennai', fromPurpose: 'Area visit', toPlace: 'Velachery', toPurpose: 'Stock Verification', details: 'Check stock levels' },
    ],
    period2: [
      { id: 8, date: '2026-01-10', day: 10, fromPlace: 'Chennai', fromPurpose: 'Distributor visit', toPlace: 'Ambattur', toPurpose: 'Promoter Appointment', details: 'Interview new promoter' },
      { id: 9, date: '2026-01-15', day: 15, fromPlace: 'Chennai', fromPurpose: 'Primary Sales', toPlace: 'T Nagar', toPurpose: 'Secondary Sales', details: 'Sales follow-up' },
    ],
    period3: []
  },
  {
    id: 4,
    employeeName: 'Suresh Iyer',
    employeeRole: 'ASM',
    submittedDate: '2026-01-17',
    month: 'January 2026',
    status: 'Approved',
    period1: [
      { id: 10, date: '2026-01-07', day: 7, fromPlace: 'Madurai', fromPurpose: 'Area visit', toPlace: 'City Center', toPurpose: 'Shop visit', details: 'Regular shop visit and sales review' },
    ],
    period2: [],
    period3: []
  },
  {
    id: 5,
    employeeName: 'Karthik Senthil',
    employeeRole: 'Supervisor',
    submittedDate: '2026-01-18',
    month: 'January 2026',
    status: 'Modified',
    period1: [],
    period2: [
      { id: 11, date: '2026-01-14', day: 14, fromPlace: 'Madurai', fromPurpose: 'New Shop visit', toPlace: 'Madurai Central', toPurpose: 'Secondary Sales', details: 'New shop setup' },
    ],
    period3: [
      { id: 12, date: '2026-01-22', day: 22, fromPlace: 'Madurai', fromPurpose: 'Stock Verification', toPlace: 'Tirunelveli', toPurpose: 'Area visit', details: 'Stock check and area coverage' },
    ]
  },
]

const HRApprovals = () => {
  const [approvals, setApprovals] = useState(MOCK_APPROVALS)
  const [workPlans, setWorkPlans] = useState(MOCK_WORK_PLANS)
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [selectedWorkPlan, setSelectedWorkPlan] = useState(null)
  const [modifiedWorkPlan, setModifiedWorkPlan] = useState(null)
  const [showModifyDialog, setShowModifyDialog] = useState(false)
  const [showWorkPlanDialog, setShowWorkPlanDialog] = useState(false)
  const [modificationNotes, setModificationNotes] = useState('')
  const [selectedPeriodForModify, setSelectedPeriodForModify] = useState('period1')

  const filteredWorkPlansForTable = useMemo(
    () => workPlans.filter((plan) => ['RSM', 'ASM', 'Supervisor'].includes(plan.employeeRole)),
    [workPlans],
  )
  const approvalsPagination = useTablePagination(approvals)
  const workPlansTablePagination = useTablePagination(filteredWorkPlansForTable)
  const viewPeriod1Pagination = useTablePagination(selectedWorkPlan?.period1 ?? [])
  const viewPeriod2Pagination = useTablePagination(selectedWorkPlan?.period2 ?? [])
  const viewPeriod3Pagination = useTablePagination(selectedWorkPlan?.period3 ?? [])

  // Load submitted work plans from localStorage (only RSM, ASM, Supervisor)
  useEffect(() => {
    const submittedPlans = JSON.parse(localStorage.getItem('submittedWorkPlans') || '[]')
    if (submittedPlans.length > 0) {
      // Filter only RSM, ASM, and Supervisor roles
      const allowedRoles = ['RSM', 'ASM', 'Supervisor']
      const filteredPlans = submittedPlans.filter(p => allowedRoles.includes(p.employeeRole))
      
      if (filteredPlans.length > 0) {
        // Merge with existing mock data, prioritizing submitted plans
        const existingIds = new Set(workPlans.map(p => p.id))
        const newPlans = filteredPlans.filter(p => !existingIds.has(p.id))
        setWorkPlans(prev => [...prev, ...newPlans])
      }
    }
  }, [])

  const handleApprove = (id) => {
    setApprovals(prev => prev.map(approval => 
      approval.id === id ? { ...approval, status: 'Approved' } : approval
    ))
    alert('Approval granted successfully!')
  }

  const handleReject = (id) => {
    setApprovals(prev => prev.map(approval => 
      approval.id === id ? { ...approval, status: 'Rejected' } : approval
    ))
    alert('Approval rejected!')
  }

  const handleModify = (approval) => {
    setSelectedApproval(approval)
    setShowModifyDialog(true)
  }

  const handleAcceptModified = () => {
    if (!modificationNotes.trim()) {
      alert('Please add modification notes')
      return
    }
    setApprovals(prev => prev.map(approval => 
      approval.id === selectedApproval.id 
        ? { ...approval, status: 'Modified', modificationNotes } 
        : approval
    ))
    setShowModifyDialog(false)
    setModificationNotes('')
    setSelectedApproval(null)
    alert('Modification saved. Please accept the modified approval.')
  }

  const handleAccept = (id) => {
    setApprovals(prev => prev.map(approval => 
      approval.id === id ? { ...approval, status: 'Approved' } : approval
    ))
    alert('Modified approval accepted!')
  }

  // Work Plan handlers
  const handleApproveWorkPlan = (id) => {
    setWorkPlans(prev => prev.map(plan => 
      plan.id === id ? { ...plan, status: 'Approved' } : plan
    ))
    // Update localStorage
    const submittedPlans = JSON.parse(localStorage.getItem('submittedWorkPlans') || '[]')
    const updatedPlans = submittedPlans.map(plan => 
      plan.id === id ? { ...plan, status: 'Approved' } : plan
    )
    localStorage.setItem('submittedWorkPlans', JSON.stringify(updatedPlans))
    alert('Work plan approved successfully!')
  }

  const handleRejectWorkPlan = (id) => {
    setWorkPlans(prev => prev.map(plan => 
      plan.id === id ? { ...plan, status: 'Rejected' } : plan
    ))
    // Update localStorage
    const submittedPlans = JSON.parse(localStorage.getItem('submittedWorkPlans') || '[]')
    const updatedPlans = submittedPlans.map(plan => 
      plan.id === id ? { ...plan, status: 'Rejected' } : plan
    )
    localStorage.setItem('submittedWorkPlans', JSON.stringify(updatedPlans))
    alert('Work plan rejected!')
  }

  const handleModifyWorkPlan = (plan) => {
    setSelectedWorkPlan(plan)
    // Create a copy for modification
    setModifiedWorkPlan({
      ...plan,
      period1: [...(plan.period1 || [])],
      period2: [...(plan.period2 || [])],
      period3: [...(plan.period3 || [])],
    })
    setShowModifyDialog(true)
  }

  const handleDeleteActivity = (period, activityId) => {
    setModifiedWorkPlan(prev => ({
      ...prev,
      [period]: prev[period].filter(activity => activity.id !== activityId)
    }))
  }

  const handleAddActivity = (period) => {
    const periodDates = {
      period1: { start: 1, end: 10 },
      period2: { start: 11, end: 20 },
      period3: { start: 21, end: 31 },
    }
    const dates = periodDates[period]
    const currentYear = new Date().getFullYear()
    const currentMonthNum = new Date().getMonth() + 1
    
    const newActivity = {
      id: Date.now(),
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-${String(dates.start).padStart(2, '0')}`,
      day: dates.start,
      fromPlace: '',
      fromPurpose: '',
      toPlace: '',
      toPurpose: '',
      kmCover: '',
      kmTravelAllowance: '',
      details: '',
    }
    
    setModifiedWorkPlan(prev => ({
      ...prev,
      [period]: [...(prev[period] || []), newActivity]
    }))
  }

  const handleUpdateActivity = (period, activityId, field, value) => {
    setModifiedWorkPlan(prev => ({
      ...prev,
      [period]: prev[period].map(activity => 
        activity.id === activityId 
          ? { ...activity, [field]: value }
          : activity
      )
    }))
  }

  const handleAcceptModifiedWorkPlan = () => {
    if (!modificationNotes.trim()) {
      alert('Please add modification notes')
      return
    }
    
    // Update work plan with modified data
    setWorkPlans(prev => prev.map(plan => 
      plan.id === selectedWorkPlan.id 
        ? { 
            ...modifiedWorkPlan, 
            status: 'Modified', 
            modificationNotes,
            modifiedAt: new Date().toISOString()
          } 
        : plan
    ))
    
    // Update localStorage
    const submittedPlans = JSON.parse(localStorage.getItem('submittedWorkPlans') || '[]')
    const updatedPlans = submittedPlans.map(plan => 
      plan.id === selectedWorkPlan.id 
        ? { 
            ...modifiedWorkPlan, 
            status: 'Modified', 
            modificationNotes,
            modifiedAt: new Date().toISOString()
          } 
        : plan
    )
    localStorage.setItem('submittedWorkPlans', JSON.stringify(updatedPlans))
    
    setShowModifyDialog(false)
    setModificationNotes('')
    setSelectedWorkPlan(null)
    setModifiedWorkPlan(null)
    alert('Modification saved. Please accept the modified work plan.')
  }

  const handleAcceptWorkPlan = (id) => {
    setWorkPlans(prev => prev.map(plan => 
      plan.id === id ? { ...plan, status: 'Approved' } : plan
    ))
    // Update localStorage
    const submittedPlans = JSON.parse(localStorage.getItem('submittedWorkPlans') || '[]')
    const updatedPlans = submittedPlans.map(plan => 
      plan.id === id ? { ...plan, status: 'Approved' } : plan
    )
    localStorage.setItem('submittedWorkPlans', JSON.stringify(updatedPlans))
    alert('Modified work plan accepted!')
  }

  const handleViewWorkPlan = (plan) => {
    setSelectedWorkPlan(plan)
    setShowWorkPlanDialog(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-600 mt-2">Review and manage approval requests</p>
      </div>

      <Tabs defaultValue="all-approvals" className="w-full">
        <TabsList>
          <TabsTrigger value="all-approvals">All Approvals</TabsTrigger>
          <TabsTrigger value="work-plan">Work Plan</TabsTrigger>
        </TabsList>

        {/* All Approvals Tab */}
        <TabsContent value="all-approvals">
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[#433228]" />
            Pending Approvals
          </CardTitle>
          <CardDescription>Approve, modify, reject, or accept approval requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Employee Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvalsPagination.paginatedItems.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell className="font-medium">{approval.type}</TableCell>
                  <TableCell>{approval.employeeName}</TableCell>
                  <TableCell>{approval.category}</TableCell>
                  <TableCell>{new Date(approval.date).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell className="max-w-xs truncate">{approval.details}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      approval.status === 'Approved' 
                        ? 'bg-green-100 text-green-800' 
                        : approval.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : approval.status === 'Modified'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {approval.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {approval.status === 'Pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleApprove(approval.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
                            onClick={() => handleModify(approval)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleReject(approval.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {approval.status === 'Modified' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          onClick={() => handleAccept(approval.id)}
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
          {approvals.length > 0 && <TablePaginationControls {...approvalsPagination} />}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Work Plan Tab */}
        <TabsContent value="work-plan">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#433228]" />
                Work Plans
              </CardTitle>
              <CardDescription>Review and approve work plans submitted by RSM, ASM, and Supervisors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Total Activities</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkPlansForTable.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No work plans found for RSM, ASM, or Supervisor roles.
                      </TableCell>
                    </TableRow>
                  ) : (
                    workPlansTablePagination.paginatedItems.map((plan) => {
                        const totalActivities = (plan.period1?.length || 0) + (plan.period2?.length || 0) + (plan.period3?.length || 0)
                        return (
                          <TableRow key={plan.id}>
                            <TableCell className="font-medium">{plan.employeeName}</TableCell>
                            <TableCell>{plan.employeeRole}</TableCell>
                            <TableCell>{plan.month}</TableCell>
                            <TableCell>{new Date(plan.submittedDate).toLocaleDateString('en-IN')}</TableCell>
                            <TableCell>{totalActivities} activities</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                plan.status === 'Approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : plan.status === 'Rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : plan.status === 'Modified'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {plan.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                  onClick={() => handleViewWorkPlan(plan)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {plan.status === 'Pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 border-green-600 hover:bg-green-50"
                                      onClick={() => handleApproveWorkPlan(plan.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                                      onClick={() => handleModifyWorkPlan(plan)}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Modify
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                      onClick={() => handleRejectWorkPlan(plan.id)}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {plan.status === 'Modified' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                    onClick={() => handleAcceptWorkPlan(plan.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Accept
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                  )}
                </TableBody>
              </Table>
              {filteredWorkPlansForTable.length > 0 && (
                <TablePaginationControls {...workPlansTablePagination} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Work Plan Dialog */}
      <Dialog open={showWorkPlanDialog} onOpenChange={setShowWorkPlanDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Work Plan Schedule - {selectedWorkPlan?.employeeName}</DialogTitle>
          </DialogHeader>
          {selectedWorkPlan && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Employee</p>
                  <p className="text-gray-900">{selectedWorkPlan.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Role</p>
                  <p className="text-gray-900">{selectedWorkPlan.employeeRole}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Month</p>
                  <p className="text-gray-900">{selectedWorkPlan.month}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Submitted Date</p>
                  <p className="text-gray-900">{new Date(selectedWorkPlan.submittedDate).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Period 1: 1st - 10th */}
              {selectedWorkPlan.period1 && selectedWorkPlan.period1.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-lg">Period 1: 1st - 10th</h4>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewPeriod1Pagination.paginatedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{new Date(item.date).toLocaleDateString('en-IN')}</TableCell>
                          <TableCell className="font-medium">{item.day}</TableCell>
                          <TableCell className="text-sm">
                            {item.kmCover != null && item.kmCover !== '' ? `${item.kmCover} km` : '—'}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {item.kmTravelAllowance != null && item.kmTravelAllowance !== ''
                              ? `₹${Number(item.kmTravelAllowance).toLocaleString('en-IN')}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 font-medium">
                              {item.fromPlace}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{item.fromPurpose}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 font-medium">
                              {item.toPlace}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{item.toPurpose}</TableCell>
                          <TableCell className="max-w-xs">{item.details || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {selectedWorkPlan.period1.length > 0 && (
                    <TablePaginationControls {...viewPeriod1Pagination} />
                  )}
                </div>
              )}

              {/* Period 2: 11th - 20th */}
              {selectedWorkPlan.period2 && selectedWorkPlan.period2.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-lg">Period 2: 11th - 20th</h4>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewPeriod2Pagination.paginatedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{new Date(item.date).toLocaleDateString('en-IN')}</TableCell>
                          <TableCell className="font-medium">{item.day}</TableCell>
                          <TableCell className="text-sm">
                            {item.kmCover != null && item.kmCover !== '' ? `${item.kmCover} km` : '—'}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {item.kmTravelAllowance != null && item.kmTravelAllowance !== ''
                              ? `₹${Number(item.kmTravelAllowance).toLocaleString('en-IN')}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 font-medium">
                              {item.fromPlace}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{item.fromPurpose}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 font-medium">
                              {item.toPlace}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{item.toPurpose}</TableCell>
                          <TableCell className="max-w-xs">{item.details || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {selectedWorkPlan.period2.length > 0 && (
                    <TablePaginationControls {...viewPeriod2Pagination} />
                  )}
                </div>
              )}

              {/* Period 3: 21st - 31st */}
              {selectedWorkPlan.period3 && selectedWorkPlan.period3.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-lg">Period 3: 21st - 31st</h4>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewPeriod3Pagination.paginatedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{new Date(item.date).toLocaleDateString('en-IN')}</TableCell>
                          <TableCell className="font-medium">{item.day}</TableCell>
                          <TableCell className="text-sm">
                            {item.kmCover != null && item.kmCover !== '' ? `${item.kmCover} km` : '—'}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {item.kmTravelAllowance != null && item.kmTravelAllowance !== ''
                              ? `₹${Number(item.kmTravelAllowance).toLocaleString('en-IN')}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 font-medium">
                              {item.fromPlace}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{item.fromPurpose}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 font-medium">
                              {item.toPlace}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{item.toPurpose}</TableCell>
                          <TableCell className="max-w-xs">{item.details || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {selectedWorkPlan.period3.length > 0 && (
                    <TablePaginationControls {...viewPeriod3Pagination} />
                  )}
                </div>
              )}

              {(selectedWorkPlan.period1?.length === 0 && selectedWorkPlan.period2?.length === 0 && selectedWorkPlan.period3?.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No activities planned for this work plan.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkPlanDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modify Dialog */}
      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedWorkPlan ? 'Modify Work Plan' : 'Modify Approval Request'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedWorkPlan && modifiedWorkPlan ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Employee</p>
                    <p className="text-gray-900">{modifiedWorkPlan.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Role</p>
                    <p className="text-gray-900">{modifiedWorkPlan.employeeRole}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Month</p>
                    <p className="text-gray-900">{modifiedWorkPlan.month}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Total Activities</p>
                    <p className="text-gray-900">{(modifiedWorkPlan.period1?.length || 0) + (modifiedWorkPlan.period2?.length || 0) + (modifiedWorkPlan.period3?.length || 0)}</p>
                  </div>
                </div>

                <Tabs value={selectedPeriodForModify} onValueChange={setSelectedPeriodForModify}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="period1">Period 1 (1-10)</TabsTrigger>
                    <TabsTrigger value="period2">Period 2 (11-20)</TabsTrigger>
                    <TabsTrigger value="period3">Period 3 (21-31)</TabsTrigger>
                  </TabsList>

                  {['period1', 'period2', 'period3'].map((period) => (
                    <TabsContent key={period} value={period}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">
                            Period {period.slice(-1)}: {period === 'period1' ? '1st - 10th' : period === 'period2' ? '11th - 20th' : '21st - 31st'}
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddActivity(period)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Activity
                          </Button>
                        </div>

                        {modifiedWorkPlan[period] && modifiedWorkPlan[period].length > 0 ? (
                          <div className="space-y-4">
                            {modifiedWorkPlan[period].map((activity) => (
                              <Card key={activity.id} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                      type="date"
                                      value={activity.date}
                                      onChange={(e) => {
                                        const newDate = e.target.value
                                        const day = new Date(newDate).getDate()
                                        handleUpdateActivity(period, activity.id, 'date', newDate)
                                        handleUpdateActivity(period, activity.id, 'day', day)
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Day</Label>
                                    <Input
                                      type="number"
                                      value={activity.day}
                                      readOnly
                                      className="bg-gray-100"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>KM cover *</Label>
                                    <Input
                                      type="text"
                                      inputMode="decimal"
                                      autoComplete="off"
                                      placeholder="km"
                                      value={
                                        activity.kmCover === undefined || activity.kmCover === null
                                          ? ''
                                          : String(activity.kmCover)
                                      }
                                      onChange={(e) => {
                                        const v = e.target.value
                                        if (isValidPartialDecimal(v)) {
                                          handleUpdateActivity(period, activity.id, 'kmCover', v)
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
                                      placeholder="₹"
                                      value={
                                        activity.kmTravelAllowance === undefined ||
                                        activity.kmTravelAllowance === null
                                          ? ''
                                          : String(activity.kmTravelAllowance)
                                      }
                                      onChange={(e) => {
                                        const v = e.target.value
                                        if (isValidPartialDecimal(v)) {
                                          handleUpdateActivity(
                                            period,
                                            activity.id,
                                            'kmTravelAllowance',
                                            v,
                                          )
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>From Place *</Label>
                                    <Input
                                      value={activity.fromPlace}
                                      onChange={(e) => handleUpdateActivity(period, activity.id, 'fromPlace', e.target.value)}
                                      placeholder="Enter from place"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>From Purpose *</Label>
                                    <Select
                                      value={activity.fromPurpose}
                                      onChange={(e) => handleUpdateActivity(period, activity.id, 'fromPurpose', e.target.value)}
                                    >
                                      <option value="">Select Purpose</option>
                                      {WORK_PLAN_PURPOSE_OPTIONS.map((purpose) => (
                                        <option key={purpose} value={purpose}>{purpose}</option>
                                      ))}
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>To Place *</Label>
                                    <Input
                                      value={activity.toPlace}
                                      onChange={(e) => handleUpdateActivity(period, activity.id, 'toPlace', e.target.value)}
                                      placeholder="Enter to place"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>To Purpose *</Label>
                                    <Select
                                      value={activity.toPurpose}
                                      onChange={(e) => handleUpdateActivity(period, activity.id, 'toPurpose', e.target.value)}
                                    >
                                      <option value="">Select Purpose</option>
                                      {WORK_PLAN_PURPOSE_OPTIONS.map((purpose) => (
                                        <option key={purpose} value={purpose}>{purpose}</option>
                                      ))}
                                    </Select>
                                  </div>
                                  <div className="space-y-2 md:col-span-2">
                                    <Label>Details</Label>
                                    <Textarea
                                      value={activity.details || ''}
                                      onChange={(e) => handleUpdateActivity(period, activity.id, 'details', e.target.value)}
                                      placeholder="Enter additional details"
                                      rows={2}
                                    />
                                  </div>
                                  <div className="md:col-span-2 flex justify-end">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteActivity(period, activity.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                            No activities for this period. Click "Add Activity" to add one.
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <div className="space-y-2 border-t pt-4">
                  <Label className="text-sm font-medium">Modification Notes *</Label>
                  <Textarea
                    placeholder="Enter modification notes explaining the changes made..."
                    value={modificationNotes}
                    onChange={(e) => setModificationNotes(e.target.value)}
                    rows={3}
                    required
                  />
                  <p className="text-xs text-orange-600">
                    Note: After modification, the work plan status will change to "Modified" and must be accepted.
                  </p>
                </div>
              </div>
            ) : selectedApproval && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm"><strong>Type:</strong> {selectedApproval.type}</p>
                  <p className="text-sm"><strong>Employee:</strong> {selectedApproval.employeeName}</p>
                  <p className="text-sm"><strong>Details:</strong> {selectedApproval.details}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Modification Notes *</label>
                  <Textarea
                    placeholder="Enter modification notes..."
                    value={modificationNotes}
                    onChange={(e) => setModificationNotes(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <p className="text-xs text-orange-600">
                  Note: After modification, the approval status will change to "Modified" and must be accepted.
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowModifyDialog(false)
              setModificationNotes('')
              setSelectedApproval(null)
              setSelectedWorkPlan(null)
              setModifiedWorkPlan(null)
              setSelectedPeriodForModify('period1')
            }}>
              Cancel
            </Button>
            <Button
              onClick={selectedWorkPlan ? handleAcceptModifiedWorkPlan : handleAcceptModified}
              className="bg-[#433228] hover:bg-[#5a4238] text-white"
              disabled={selectedWorkPlan ? (!modificationNotes.trim() || !modifiedWorkPlan) : !modificationNotes.trim()}
            >
              Save Modification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HRApprovals
