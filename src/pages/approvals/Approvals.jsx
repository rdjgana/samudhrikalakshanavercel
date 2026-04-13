import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import {
  fetchWorkPlanApprovals,
  fetchTargetApprovals,
  fetchLeaveApprovals,
  fetchClaimApprovals,
  fetchOrderApprovals,
  processApproval,
} from '../../store/slices/approvalsSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

const Approvals = () => {
  const dispatch = useDispatch()
  const {
    workPlanApprovals,
    targetApprovals,
    leaveApprovals,
    claimApprovals,
    orderApprovals,
    loading,
  } = useSelector((state) => state.approvals)

  const [selectedApproval, setSelectedApproval] = useState(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState('')
  const [comment, setComment] = useState('')
  
  // Filter states for each tab
  const [workPlanFilters, setWorkPlanFilters] = useState({
    status: 'all',
    category: 'all',
    search: '',
    startDate: '',
    endDate: '',
  })
  
  const [targetFilters, setTargetFilters] = useState({
    status: 'all',
    search: '',
    month: '',
  })
  
  const [leaveFilters, setLeaveFilters] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
  })
  
  const [claimFilters, setClaimFilters] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
  })
  
  const [orderFilters, setOrderFilters] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    dispatch(fetchWorkPlanApprovals({}))
    dispatch(fetchTargetApprovals({}))
    dispatch(fetchLeaveApprovals({}))
    dispatch(fetchClaimApprovals({}))
    dispatch(fetchOrderApprovals({}))
  }, [dispatch])

  const handleAction = (approval, type, approvalType) => {
    setSelectedApproval({ ...approval, approvalType })
    setActionType(type)
    setShowActionDialog(true)
  }

  const handleSubmitAction = async () => {
    if (!comment.trim()) {
      alert('Please enter a comment')
      return
    }

    await dispatch(
      processApproval({
        type: selectedApproval.approvalType || 'work-plan',
        id: selectedApproval.id,
        action: actionType,
        comment,
      })
    )

    setShowActionDialog(false)
    setComment('')
    setSelectedApproval(null)
  }

  // Filter functions
  const filterWorkPlanApprovals = (approvals, role) => {
    return approvals
      .filter(a => a.role === role)
      .filter(a => {
        if (workPlanFilters.status !== 'all' && a.status !== workPlanFilters.status) return false
        if (workPlanFilters.category !== 'all' && a.category !== workPlanFilters.category) return false
        if (workPlanFilters.search && !a.employeeName.toLowerCase().includes(workPlanFilters.search.toLowerCase())) return false
        if (workPlanFilters.startDate && new Date(a.date) < new Date(workPlanFilters.startDate)) return false
        if (workPlanFilters.endDate && new Date(a.date) > new Date(workPlanFilters.endDate)) return false
        return true
      })
  }

  const filterTargetApprovals = (approvals) => {
    return approvals.filter(a => {
      if (targetFilters.status !== 'all' && a.status !== targetFilters.status) return false
      if (targetFilters.search && !a.employeeName.toLowerCase().includes(targetFilters.search.toLowerCase())) return false
      if (targetFilters.month && a.month !== targetFilters.month) return false
      return true
    })
  }

  const filterLeaveApprovals = (approvals) => {
    return approvals.filter(a => {
      if (leaveFilters.status !== 'all' && a.status !== leaveFilters.status) return false
      if (leaveFilters.search && !a.employeeName.toLowerCase().includes(leaveFilters.search.toLowerCase())) return false
      if (leaveFilters.startDate && new Date(a.date) < new Date(leaveFilters.startDate)) return false
      if (leaveFilters.endDate && new Date(a.date) > new Date(leaveFilters.endDate)) return false
      return true
    })
  }

  const filterClaimApprovals = (approvals) => {
    return approvals.filter(a => {
      if (claimFilters.status !== 'all' && a.status !== claimFilters.status) return false
      if (claimFilters.search && !a.entityName.toLowerCase().includes(claimFilters.search.toLowerCase())) return false
      if (claimFilters.startDate && new Date(a.date) < new Date(claimFilters.startDate)) return false
      if (claimFilters.endDate && new Date(a.date) > new Date(claimFilters.endDate)) return false
      return true
    })
  }

  const filterOrderApprovals = (approvals) => {
    return approvals.filter(a => {
      if (orderFilters.status !== 'all' && a.status !== orderFilters.status) return false
      if (orderFilters.search && !a.entityName.toLowerCase().includes(orderFilters.search.toLowerCase())) return false
      if (orderFilters.startDate && new Date(a.date) < new Date(orderFilters.startDate)) return false
      if (orderFilters.endDate && new Date(a.date) > new Date(orderFilters.endDate)) return false
      return true
    })
  }

  const filteredAsmWorkPlans = useMemo(
    () => (workPlanApprovals ? filterWorkPlanApprovals(workPlanApprovals, 'ASM') : []),
    [workPlanApprovals, workPlanFilters],
  )
  const filteredSoWorkPlans = useMemo(
    () => (workPlanApprovals ? filterWorkPlanApprovals(workPlanApprovals, 'SO') : []),
    [workPlanApprovals, workPlanFilters],
  )
  const filteredSupervisorWorkPlans = useMemo(
    () => (workPlanApprovals ? filterWorkPlanApprovals(workPlanApprovals, 'Supervisor') : []),
    [workPlanApprovals, workPlanFilters],
  )
  const filteredBdmWorkPlans = useMemo(
    () => (workPlanApprovals ? filterWorkPlanApprovals(workPlanApprovals, 'BDM') : []),
    [workPlanApprovals, workPlanFilters],
  )
  const filteredTargetRows = useMemo(
    () => (targetApprovals ? filterTargetApprovals(targetApprovals) : []),
    [targetApprovals, targetFilters],
  )
  const filteredLeaveRows = useMemo(
    () => (leaveApprovals ? filterLeaveApprovals(leaveApprovals) : []),
    [leaveApprovals, leaveFilters],
  )
  const filteredClaimRows = useMemo(
    () => (claimApprovals ? filterClaimApprovals(claimApprovals) : []),
    [claimApprovals, claimFilters],
  )
  const filteredOrderRows = useMemo(
    () => (orderApprovals ? filterOrderApprovals(orderApprovals) : []),
    [orderApprovals, orderFilters],
  )

  const asmWorkPlanPagination = useTablePagination(filteredAsmWorkPlans)
  const soWorkPlanPagination = useTablePagination(filteredSoWorkPlans)
  const supervisorWorkPlanPagination = useTablePagination(filteredSupervisorWorkPlans)
  const bdmWorkPlanPagination = useTablePagination(filteredBdmWorkPlans)
  const targetApprovalsPagination = useTablePagination(filteredTargetRows)
  const leaveApprovalsPagination = useTablePagination(filteredLeaveRows)
  const claimApprovalsPagination = useTablePagination(filteredClaimRows)
  const orderApprovalsPagination = useTablePagination(filteredOrderRows)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-600 mt-2">Review and approve/reject requests</p>
      </div>

      <Tabs defaultValue="work-plan" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="work-plan">Work Plan</TabsTrigger>
          <TabsTrigger value="target">Target</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="claim">Claim</TabsTrigger>
          <TabsTrigger value="order">Order</TabsTrigger>
        </TabsList>

        <TabsContent value="work-plan">
          <Card>
            <CardHeader>
              <CardTitle>Work Plan Approvals</CardTitle>
              <CardDescription>Category-wise for ASMs, SOs, Supervisors, BDMs</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Work Plan Filters */}
              <div className="mb-6 space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Search Employee</Label>
                    <Input
                      placeholder="Search by name..."
                      value={workPlanFilters.search}
                      onChange={(e) => setWorkPlanFilters({ ...workPlanFilters, search: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={workPlanFilters.status}
                      onChange={(e) => setWorkPlanFilters({ ...workPlanFilters, status: e.target.value })}
                    >
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={workPlanFilters.category}
                      onChange={(e) => setWorkPlanFilters({ ...workPlanFilters, category: e.target.value })}
                    >
                      <option value="all">All Categories</option>
                      <option value="Face Care">Face Care</option>
                      <option value="Body Care">Body Care</option>
                      <option value="Hair Care">Hair Care</option>
                      <option value="Personal Care">Personal Care</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={workPlanFilters.startDate}
                      onChange={(e) => setWorkPlanFilters({ ...workPlanFilters, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={workPlanFilters.endDate}
                      onChange={(e) => setWorkPlanFilters({ ...workPlanFilters, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWorkPlanFilters({ status: 'all', category: 'all', search: '', startDate: '', endDate: '' })}
                >
                  Clear Filters
                </Button>
              </div>

              <Tabs defaultValue="asm" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="asm">ASMs</TabsTrigger>
                  <TabsTrigger value="so">SOs</TabsTrigger>
                  <TabsTrigger value="supervisor">Supervisors</TabsTrigger>
                  <TabsTrigger value="bdm">BDMs</TabsTrigger>
                </TabsList>

                {/* ASM Tab */}
                <TabsContent value="asm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workPlanApprovals && filteredAsmWorkPlans.length > 0 ? (
                        asmWorkPlanPagination.paginatedItems.map((approval) => (
                          <TableRow key={approval.id}>
                            <TableCell>{approval.employeeName}</TableCell>
                            <TableCell>{approval.category}</TableCell>
                            <TableCell>{new Date(approval.date).toLocaleDateString()}</TableCell>
                            <TableCell>{approval.status}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAction(approval, 'approve', 'work-plan')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(approval, 'edit', 'work-plan')}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(approval, 'change', 'work-plan')}
                                >
                                  Change
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleAction(approval, 'reject', 'work-plan')}
                                >
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500">
                            No ASM work plan approvals pending
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {filteredAsmWorkPlans.length > 0 && (
                    <TablePaginationControls {...asmWorkPlanPagination} />
                  )}
                </TabsContent>

                {/* SO Tab */}
                <TabsContent value="so">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workPlanApprovals && filteredSoWorkPlans.length > 0 ? (
                        soWorkPlanPagination.paginatedItems.map((approval) => (
                          <TableRow key={approval.id}>
                            <TableCell>{approval.employeeName}</TableCell>
                            <TableCell>{approval.category}</TableCell>
                            <TableCell>{new Date(approval.date).toLocaleDateString()}</TableCell>
                            <TableCell>{approval.status}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAction(approval, 'approve', 'work-plan')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(approval, 'edit', 'work-plan')}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(approval, 'change', 'work-plan')}
                                >
                                  Change
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleAction(approval, 'reject', 'work-plan')}
                                >
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500">
                            No SO work plan approvals pending
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {filteredSoWorkPlans.length > 0 && (
                    <TablePaginationControls {...soWorkPlanPagination} />
                  )}
                </TabsContent>

                {/* Supervisor Tab */}
                <TabsContent value="supervisor">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workPlanApprovals && filteredSupervisorWorkPlans.length > 0 ? (
                        supervisorWorkPlanPagination.paginatedItems.map((approval) => (
                          <TableRow key={approval.id}>
                            <TableCell>{approval.employeeName}</TableCell>
                            <TableCell>{approval.category}</TableCell>
                            <TableCell>{new Date(approval.date).toLocaleDateString()}</TableCell>
                            <TableCell>{approval.status}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAction(approval, 'approve', 'work-plan')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(approval, 'edit', 'work-plan')}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(approval, 'change', 'work-plan')}
                                >
                                  Change
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleAction(approval, 'reject', 'work-plan')}
                                >
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500">
                            No Supervisor work plan approvals pending
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {filteredSupervisorWorkPlans.length > 0 && (
                    <TablePaginationControls {...supervisorWorkPlanPagination} />
                  )}
                </TabsContent>

                {/* BDM Tab */}
                <TabsContent value="bdm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workPlanApprovals && filteredBdmWorkPlans.length > 0 ? (
                        bdmWorkPlanPagination.paginatedItems.map((approval) => (
                          <TableRow key={approval.id}>
                            <TableCell>{approval.employeeName}</TableCell>
                            <TableCell>{approval.category}</TableCell>
                            <TableCell>{new Date(approval.date).toLocaleDateString()}</TableCell>
                            <TableCell>{approval.status}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAction(approval, 'approve', 'work-plan')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(approval, 'edit', 'work-plan')}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(approval, 'change', 'work-plan')}
                                >
                                  Change
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleAction(approval, 'reject', 'work-plan')}
                                >
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500">
                            No BDM work plan approvals pending
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {filteredBdmWorkPlans.length > 0 && (
                    <TablePaginationControls {...bdmWorkPlanPagination} />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="target">
          <Card>
            <CardHeader>
              <CardTitle>Target Approvals</CardTitle>
              <CardDescription>Monthly-wise for ASMs, SOs, Supervisors, BDMs</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Target Filters */}
              <div className="mb-6 space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Search Employee</Label>
                    <Input
                      placeholder="Search by name..."
                      value={targetFilters.search}
                      onChange={(e) => setTargetFilters({ ...targetFilters, search: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={targetFilters.status}
                      onChange={(e) => setTargetFilters({ ...targetFilters, status: e.target.value })}
                    >
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Input
                      type="month"
                      value={targetFilters.month}
                      onChange={(e) => setTargetFilters({ ...targetFilters, month: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetFilters({ status: 'all', search: '', month: '' })}
                >
                  Clear Filters
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targetApprovals && filteredTargetRows.length > 0 ? (
                    targetApprovalsPagination.paginatedItems.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>{approval.employeeName}</TableCell>
                      <TableCell>{approval.month}</TableCell>
                      <TableCell>{approval.status}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(approval, 'approve', 'target')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(approval, 'change', 'target')}
                          >
                            Change
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(approval, 'reject', 'target')}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">
                        No target approvals pending
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {filteredTargetRows.length > 0 && (
                <TablePaginationControls {...targetApprovalsPagination} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave">
          <Card>
            <CardHeader>
              <CardTitle>Leave Approvals</CardTitle>
              <CardDescription>Day-wise leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Leave Filters */}
              <div className="mb-6 space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Search Employee</Label>
                    <Input
                      placeholder="Search by name..."
                      value={leaveFilters.search}
                      onChange={(e) => setLeaveFilters({ ...leaveFilters, search: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={leaveFilters.status}
                      onChange={(e) => setLeaveFilters({ ...leaveFilters, status: e.target.value })}
                    >
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={leaveFilters.startDate}
                      onChange={(e) => setLeaveFilters({ ...leaveFilters, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={leaveFilters.endDate}
                      onChange={(e) => setLeaveFilters({ ...leaveFilters, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLeaveFilters({ status: 'all', search: '', startDate: '', endDate: '' })}
                >
                  Clear Filters
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveApprovals && filteredLeaveRows.length > 0 ? (
                    leaveApprovalsPagination.paginatedItems.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>{approval.employeeName}</TableCell>
                      <TableCell>{new Date(approval.date).toLocaleDateString()}</TableCell>
                      <TableCell>{approval.reason}</TableCell>
                      <TableCell>{approval.status}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(approval, 'approve', 'leave')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(approval, 'reject', 'leave')}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No leave approvals pending
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {filteredLeaveRows.length > 0 && (
                <TablePaginationControls {...leaveApprovalsPagination} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claim">
          <Card>
            <CardHeader>
              <CardTitle>Claim Approvals</CardTitle>
              <CardDescription>Day-wise for SS, Distributor, Shop</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Claim Filters */}
              <div className="mb-6 space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Search Entity</Label>
                    <Input
                      placeholder="Search by name..."
                      value={claimFilters.search}
                      onChange={(e) => setClaimFilters({ ...claimFilters, search: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={claimFilters.status}
                      onChange={(e) => setClaimFilters({ ...claimFilters, status: e.target.value })}
                    >
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={claimFilters.startDate}
                      onChange={(e) => setClaimFilters({ ...claimFilters, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={claimFilters.endDate}
                      onChange={(e) => setClaimFilters({ ...claimFilters, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setClaimFilters({ status: 'all', search: '', startDate: '', endDate: '' })}
                >
                  Clear Filters
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claimApprovals && filteredClaimRows.length > 0 ? (
                    claimApprovalsPagination.paginatedItems.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>{approval.entityName}</TableCell>
                      <TableCell>{new Date(approval.date).toLocaleDateString()}</TableCell>
                      <TableCell>{approval.amount}</TableCell>
                      <TableCell>{approval.status}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(approval, 'approve', 'claim')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(approval, 'reject', 'claim')}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No claim approvals pending
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {filteredClaimRows.length > 0 && (
                <TablePaginationControls {...claimApprovalsPagination} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order">
          <Card>
            <CardHeader>
              <CardTitle>Order Approvals</CardTitle>
              <CardDescription>Day-wise for SS, Distributor, Shop</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Order Filters */}
              <div className="mb-6 space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Search Entity</Label>
                    <Input
                      placeholder="Search by name..."
                      value={orderFilters.search}
                      onChange={(e) => setOrderFilters({ ...orderFilters, search: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={orderFilters.status}
                      onChange={(e) => setOrderFilters({ ...orderFilters, status: e.target.value })}
                    >
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={orderFilters.startDate}
                      onChange={(e) => setOrderFilters({ ...orderFilters, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={orderFilters.endDate}
                      onChange={(e) => setOrderFilters({ ...orderFilters, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOrderFilters({ status: 'all', search: '', startDate: '', endDate: '' })}
                >
                  Clear Filters
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderApprovals && filteredOrderRows.length > 0 ? (
                    orderApprovalsPagination.paginatedItems.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>{approval.entityName}</TableCell>
                      <TableCell>{new Date(approval.date).toLocaleDateString()}</TableCell>
                      <TableCell>{approval.amount}</TableCell>
                      <TableCell>{approval.status}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(approval, 'approve', 'order')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(approval, 'reject', 'order')}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No order approvals pending
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {filteredOrderRows.length > 0 && (
                <TablePaginationControls {...orderApprovalsPagination} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve'}
              {actionType === 'reject' && 'Reject'}
              {actionType === 'change' && 'Change'} Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Comment *</Label>
              <Textarea
                placeholder="Enter your comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAction} disabled={loading || !comment.trim()}>
              {loading ? 'Processing...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Approvals
