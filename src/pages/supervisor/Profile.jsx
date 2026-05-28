import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { MOCK_SUPERVISOR_PROMOTERS } from '../../data/mockData'
import { User, Calendar, FileText, AlertCircle, LogOut } from 'lucide-react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

const Profile = () => {
  const { user } = useSelector((state) => state.auth)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [showResignationDialog, setShowResignationDialog] = useState(false)
  const [resignationData, setResignationData] = useState({
    resignationDate: '',
    noticePeriod: '',
    reason: '',
  })
  const [resignationStatus, setResignationStatus] = useState(null) // null, 'pending', 'approved', 'rejected'
  const [submittedResignationData, setSubmittedResignationData] = useState(null)
  const [leaveData, setLeaveData] = useState({
    promoterId: '',
    startDate: '',
    endDate: '',
    reason: '',
    type: 'Casual Leave',
  })
  const [leaves, setLeaves] = useState([
    {
      id: 1,
      promoterId: 1,
      promoterName: 'Kavitha Rani',
      promoterCode: 'PROM001',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      days: 3,
      type: 'Casual Leave',
      reason: 'Personal work',
      status: 'Pending',
      appliedAt: '2024-01-10',
    },
    {
      id: 2,
      promoterId: 2,
      promoterName: 'Selvi Murugan',
      promoterCode: 'PROM002',
      startDate: '2024-01-20',
      endDate: '2024-01-20',
      days: 1,
      type: 'Sick Leave',
      reason: 'Medical appointment',
      status: 'Approved',
      appliedAt: '2024-01-18',
    },
  ])
  const leavesPagination = useTablePagination(leaves)

  const handleAddLeave = () => {
    if (!leaveData.promoterId || !leaveData.startDate || !leaveData.endDate || !leaveData.reason) {
      alert('Please fill all required fields')
      return
    }

    const start = new Date(leaveData.startDate)
    const end = new Date(leaveData.endDate)
    
    if (end < start) {
      alert('End date must be after start date')
      return
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    const promoter = MOCK_SUPERVISOR_PROMOTERS.find(p => p.id === parseInt(leaveData.promoterId))

    const newLeave = {
      id: Date.now(),
      promoterId: parseInt(leaveData.promoterId),
      promoterName: promoter?.name || 'Unknown',
      promoterCode: promoter?.code || '',
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      days,
      type: leaveData.type,
      reason: leaveData.reason,
      status: 'Pending',
      appliedAt: new Date().toISOString().split('T')[0],
    }

    setLeaves(prev => [newLeave, ...prev])
    setShowLeaveDialog(false)
    setLeaveData({
      promoterId: '',
      startDate: '',
      endDate: '',
      reason: '',
      type: 'Casual Leave',
    })
    alert('Leave request added successfully!')
  }

  const handleApproveLeave = (leaveId) => {
    setLeaves(prev => prev.map(leave => 
      leave.id === leaveId ? { ...leave, status: 'Approved' } : leave
    ))
  }

  const handleRejectLeave = (leaveId) => {
    setLeaves(prev => prev.map(leave => 
      leave.id === leaveId ? { ...leave, status: 'Rejected' } : leave
    ))
  }

  const handleSubmitResignation = () => {
    if (!resignationData.resignationDate || !resignationData.noticePeriod || !resignationData.reason) {
      alert('Please fill all required fields')
      return
    }

    const noticePeriodDays = parseInt(resignationData.noticePeriod)
    if (isNaN(noticePeriodDays) || noticePeriodDays < 0) {
      alert('Please enter a valid notice period in days')
      return
    }

    // Store submitted data before resetting form
    setSubmittedResignationData({ ...resignationData })
    
    // Set resignation status to pending
    setResignationStatus('pending')
    setShowResignationDialog(false)
    
    // Reset form
    setResignationData({
      resignationDate: '',
      noticePeriod: '',
      reason: '',
    })
    
    alert('Resignation request submitted successfully! Awaiting approval.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Supervisor details and promoter leave management</p>
      </div>

      {/* Supervisor Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Supervisor Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold">{user?.name || 'Supervisor User'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-semibold">{user?.role || 'Supervisor'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{user?.email || 'supervisor@example.com'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Supervisor ID</p>
              <p className="font-semibold">{user?.supervisorId || 'SUP001'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resignation Section */}
      <Card className="border-2 border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertCircle className="h-5 w-5" />
            Resignation
          </CardTitle>
          <CardDescription className="text-orange-700">
            Submit your resignation request with notice period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resignationStatus ? (
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Resignation Status</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    resignationStatus === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : resignationStatus === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {resignationStatus === 'approved' ? 'Approved' : 
                     resignationStatus === 'rejected' ? 'Rejected' : 
                     'Pending Approval'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Resignation Date</p>
                    <p className="font-semibold">{submittedResignationData?.resignationDate ? new Date(submittedResignationData.resignationDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Notice Period</p>
                    <p className="font-semibold">{submittedResignationData?.noticePeriod ? `${submittedResignationData.noticePeriod} days` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Reason</p>
                    <p className="font-semibold truncate">{submittedResignationData?.reason || 'N/A'}</p>
                  </div>
                </div>
              </div>
              {resignationStatus === 'pending' && (
                <p className="text-sm text-orange-700 italic">
                  Your resignation request is pending approval. You will be notified once it's reviewed.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="mb-4">
                <LogOut className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                <p className="text-gray-700 mb-2">No resignation request submitted</p>
                <p className="text-sm text-gray-500">Click the button below to submit your resignation</p>
              </div>
              <Button
                onClick={() => setShowResignationDialog(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                size="lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Submit Resignation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promoter Leave Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Promoter Leave Management
          </CardTitle>
          <CardDescription>Manage leave requests from promoters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setShowLeaveDialog(true)}
            className="bg-[#433228] hover:bg-[#5a4238]"
          >
            Add Leave Request
          </Button>

          {leaves.length > 0 ? (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promoter</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leavesPagination.paginatedItems.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.promoterName}</TableCell>
                    <TableCell>{leave.promoterCode}</TableCell>
                    <TableCell>{leave.type}</TableCell>
                    <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{leave.days} day(s)</TableCell>
                    <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {leave.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(leave.appliedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {leave.status === 'Pending' && (
                        <>
                          {leave.days <= 2 ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleApproveLeave(leave.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleRejectLeave(leave.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 italic">
                              Cannot approve/reject (more than 2 days)
                            </span>
                          )}
                        </>
                      )}
                      {leave.status !== 'Pending' && (
                        <span className="text-xs text-gray-500">No action</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePaginationControls {...leavesPagination} />
            </>
          ) : (
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No leave requests yet</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Add Leave Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Promoter Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Promoter *</Label>
              <Select
                value={leaveData.promoterId}
                onChange={(e) => setLeaveData({ ...leaveData, promoterId: e.target.value })}
              >
                <option value="">Select Promoter</option>
                {MOCK_SUPERVISOR_PROMOTERS.map((promoter) => (
                  <option key={promoter.id} value={promoter.id}>
                    {promoter.name} ({promoter.code})
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Leave Type *</Label>
              <Select
                value={leaveData.type}
                onChange={(e) => setLeaveData({ ...leaveData, type: e.target.value })}
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Emergency Leave">Emergency Leave</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={leaveData.startDate}
                  onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={leaveData.endDate}
                  onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })}
                  min={leaveData.startDate}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                placeholder="Enter reason for leave..."
                value={leaveData.reason}
                onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLeave} className="bg-[#433228] hover:bg-[#5a4238]">
              Add Leave Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resignation Dialog */}
      <Dialog open={showResignationDialog} onOpenChange={setShowResignationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-900">
              <LogOut className="h-5 w-5" />
              Submit Resignation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resignationDate">Resignation Date *</Label>
              <Input
                id="resignationDate"
                type="date"
                value={resignationData.resignationDate}
                onChange={(e) => setResignationData({ ...resignationData, resignationDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noticePeriod">Notice Period (Days) *</Label>
              <Input
                id="noticePeriod"
                type="number"
                placeholder="Enter notice period in days"
                value={resignationData.noticePeriod}
                onChange={(e) => setResignationData({ ...resignationData, noticePeriod: e.target.value })}
                min="0"
                required
              />
              <p className="text-xs text-gray-500">Enter the number of days for your notice period</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Resignation *</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for your resignation..."
                value={resignationData.reason}
                onChange={(e) => setResignationData({ ...resignationData, reason: e.target.value })}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowResignationDialog(false)
                setResignationData({
                  resignationDate: '',
                  noticePeriod: '',
                  reason: '',
                })
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitResignation}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Submit Resignation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Profile
