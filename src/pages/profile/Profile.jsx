import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { User, Mail, Phone, MapPin, Building, Briefcase, Calendar, CheckCircle, XCircle, Wallet, Receipt } from 'lucide-react'
import { MOCK_SUPERVISOR_LEAVE_REQUESTS } from '../../data/mockData'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

// HR's own monthly salary breakdown (mock)
const HR_MY_SALARY = {
  fixedSalary: 60000,
  hra: 15000,
  da: 5000,
  conveyance: 3000,
  workingDays: 26,
  noticePeriodDays: 60,
}

// HR's own recent reimbursable expenses (mock)
const HR_MY_EXPENSES = [
  {
    id: 1,
    date: '2026-05-12',
    category: 'Travel',
    description: 'Cab fare for off-site interview drive',
    amount: 1850,
    status: 'Approved',
  },
  {
    id: 2,
    date: '2026-05-18',
    category: 'Internet',
    description: 'Home internet — May broadband bill',
    amount: 1199,
    status: 'Approved',
  },
  {
    id: 3,
    date: '2026-05-22',
    category: 'Office Supplies',
    description: 'Printer cartridges & stationery',
    amount: 2450,
    status: 'Pending',
  },
  {
    id: 4,
    date: '2026-05-25',
    category: 'Food',
    description: 'Team meal during recruitment drive',
    amount: 3200,
    status: 'Pending',
  },
]

const Profile = () => {
  const { user } = useSelector((state) => state.auth)
  const [supervisorLeaves, setSupervisorLeaves] = useState(MOCK_SUPERVISOR_LEAVE_REQUESTS)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedLeaveId, setSelectedLeaveId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const supervisorLeavesPagination = useTablePagination(supervisorLeaves)

  // HR-only personal salary & expense data
  const isHR = user?.role === 'HR'
  const hrSalaryTotal =
    HR_MY_SALARY.fixedSalary +
    HR_MY_SALARY.hra +
    HR_MY_SALARY.da +
    HR_MY_SALARY.conveyance
  const hrExpenseTotals = HR_MY_EXPENSES.reduce(
    (acc, item) => {
      if (item.status === 'Approved') acc.approved += item.amount
      else if (item.status === 'Pending') acc.pending += item.amount
      acc.total += item.amount
      return acc
    },
    { approved: 0, pending: 0, total: 0 }
  )
  const hrExpensesPagination = useTablePagination(HR_MY_EXPENSES)

  const handleApproveLeave = (leaveId) => {
    setSupervisorLeaves(prev => prev.map(leave => 
      leave.id === leaveId 
        ? { ...leave, status: 'Approved', approvedAt: new Date().toISOString().split('T')[0] } 
        : leave
    ))
    alert('Leave request approved successfully!')
  }

  const handleRejectLeave = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    setSupervisorLeaves(prev => prev.map(leave => 
      leave.id === selectedLeaveId 
        ? { 
            ...leave, 
            status: 'Rejected', 
            rejectedAt: new Date().toISOString().split('T')[0],
            rejectionReason: rejectionReason.trim()
          } 
        : leave
    ))
    
    setShowRejectDialog(false)
    setRejectionReason('')
    setSelectedLeaveId(null)
    alert('Leave request rejected successfully!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">View your profile information</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-[#433228] flex items-center justify-center text-white font-semibold text-2xl shadow-lg">
              {user?.name ? (
                user.name.split(' ').length >= 2
                  ? `${user.name.split(' ')[0][0]}${user.name.split(' ')[user.name.split(' ').length - 1][0]}`.toUpperCase()
                  : user.name.substring(0, 2).toUpperCase()
              ) : user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div>
              <CardTitle className="text-2xl">{user?.name || user?.username || 'User'}</CardTitle>
              <CardDescription className="text-base mt-1">{user?.role || 'Employee'}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Your personal details and contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                Full Name
              </div>
              <p className="font-semibold text-gray-900">{user?.name || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4" />
                Employee Code
              </div>
              <p className="font-semibold text-gray-900">{user?.code || user?.username || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                Email Address
              </div>
              <p className="font-semibold text-gray-900">{user?.email || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                Phone Number
              </div>
              <p className="font-semibold text-gray-900">{user?.phone || 'N/A'}</p>
            </div>
            {user?.role && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  Role
                </div>
                <p className="font-semibold text-gray-900">{user.role}</p>
              </div>
            )}
            {user?.area && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  Area/District
                </div>
                <p className="font-semibold text-gray-900">{user.area}</p>
              </div>
            )}
            {user?.shopName && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  Shop Name
                </div>
                <p className="font-semibold text-gray-900">{user.shopName}</p>
              </div>
            )}
            {user?.supervisorId && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  Supervisor ID
                </div>
                <p className="font-semibold text-gray-900">{user.supervisorId}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      {(user?.address || user?.dateOfJoining || user?.qualification) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Additional details about your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user?.address && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    Address
                  </div>
                  <p className="font-semibold text-gray-900">{user.address}</p>
                </div>
              )}
              {user?.dateOfJoining && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    Date of Joining
                  </div>
                  <p className="font-semibold text-gray-900">
                    {new Date(user.dateOfJoining).toLocaleDateString()}
                  </p>
                </div>
              )}
              {user?.qualification && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    Qualification
                  </div>
                  <p className="font-semibold text-gray-900">{user.qualification}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* HR — My Salary & Expenses */}
      {isHR && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                My Salary — Current Month
              </CardTitle>
              <CardDescription>
                Fixed salary, allowances, and notice period — your own pay summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Fixed Salary</p>
                  <p className="text-xl font-bold">
                    ₹{HR_MY_SALARY.fixedSalary.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">HRA</p>
                  <p className="text-xl font-bold">
                    ₹{HR_MY_SALARY.hra.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">DA</p>
                  <p className="text-xl font-bold">
                    ₹{HR_MY_SALARY.da.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Conveyance</p>
                  <p className="text-xl font-bold">
                    ₹{HR_MY_SALARY.conveyance.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Working Days</p>
                  <p className="text-xl font-bold">{HR_MY_SALARY.workingDays}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Notice Period</p>
                  <p className="text-xl font-bold text-[#433228]">
                    {HR_MY_SALARY.noticePeriodDays} days
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">Total Salary</p>
                  <p className="text-2xl font-bold text-[#433228]">
                    ₹{hrSalaryTotal.toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Fixed Salary + HRA + DA + Conveyance
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                My Expenses
              </CardTitle>
              <CardDescription>
                Recent reimbursement claims and their approval status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-xs text-green-700">Approved</p>
                  <p className="text-lg font-bold text-green-700">
                    ₹{hrExpenseTotals.approved.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-xs text-yellow-700">Pending</p>
                  <p className="text-lg font-bold text-yellow-700">
                    ₹{hrExpenseTotals.pending.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-600">Total Claimed</p>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{hrExpenseTotals.total.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hrExpensesPagination.paginatedItems.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{expense.category}</TableCell>
                      <TableCell className="max-w-md text-sm text-gray-700">
                        {expense.description}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            expense.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : expense.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {expense.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePaginationControls {...hrExpensesPagination} />
            </CardContent>
          </Card>
        </>
      )}

      {/* Supervisor Leave Management - Only for RSM */}
      {user?.role === 'RSM' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Supervisor Leave Management
            </CardTitle>
            <CardDescription>Manage leave requests from supervisors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supervisorLeaves.length > 0 ? (
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supervisor</TableHead>
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
                  {supervisorLeavesPagination.paginatedItems.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium">{leave.supervisorName}</TableCell>
                      <TableCell>{leave.supervisorCode}</TableCell>
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
                        {leave.status === 'Pending' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApproveLeave(leave.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedLeaveId(leave.id)
                                setShowRejectDialog(true)
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : leave.status === 'Rejected' && leave.rejectionReason ? (
                          <div className="text-xs text-gray-600 max-w-xs">
                            <p className="font-semibold mb-1">Rejection Reason:</p>
                            <p className="italic">{leave.rejectionReason}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">No action</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePaginationControls {...supervisorLeavesPagination} />
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
      )}

      {/* Reject Leave Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please provide a reason for rejecting this leave request..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectDialog(false)
                setRejectionReason('')
                setSelectedLeaveId(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRejectLeave}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Profile
