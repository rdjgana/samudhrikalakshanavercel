import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import { CheckCircle, XCircle, AlertCircle, DollarSign, TrendingUp, FileText } from 'lucide-react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

// Mock Final Approval Data - Pending approvals from HR
const MOCK_FINAL_SALARY_APPROVALS = [
  { id: 1, employeeName: 'Gokul', category: 'Management', noOfDays: 30, basic: 50000, totalSalary: 50000, submittedBy: 'HR', submittedDate: '2026-01-25', status: 'Pending', processingStatus: 'Pending HR Manager Approval' },
  { id: 2, employeeName: 'Rajesh Kumar', category: 'RSM', noOfDays: 30, basic: 40000, totalSalary: 40000, submittedBy: 'HR', submittedDate: '2026-01-25', status: 'Pending', processingStatus: 'Pending HR Manager Approval' },
]

const MOCK_FINAL_EXPENSE_APPROVALS = [
  { id: 1, employeeName: 'Rajesh Kumar', travelledFrom: 'Chennai', travelledTo: 'Madurai', ta: 2000, da: 1500, amount: 5000, submittedBy: 'HR', submittedDate: '2026-01-25', status: 'Pending', processingStatus: 'Pending HR Manager Approval' },
  { id: 2, employeeName: 'Mohan Raj', travelledFrom: 'Madurai', travelledTo: 'Tirunelveli', ta: 1800, da: 1200, amount: 4000, submittedBy: 'HR', submittedDate: '2026-01-25', status: 'Pending', processingStatus: 'Pending HR Manager Approval' },
]

const MOCK_FINAL_INCENTIVE_APPROVALS = [
  { id: 1, employeeName: 'Rajesh Kumar', category: 'RSM', primaryTarget: 1500000, primaryAchieved: 1125000, secondaryTarget: 1200000, secondaryAchieved: 960000, incentiveAmount: 25000, submittedBy: 'HR', submittedDate: '2026-01-25', status: 'Pending', processingStatus: 'Pending HR Manager Approval' },
  { id: 2, employeeName: 'Priya Menon', category: 'ASM', primaryTarget: 1200000, primaryAchieved: 1080000, secondaryTarget: 1000000, secondaryAchieved: 850000, incentiveAmount: 20000, submittedBy: 'HR', submittedDate: '2026-01-25', status: 'Pending', processingStatus: 'Pending HR Manager Approval' },
]

const HRManagerFinalApprovals = () => {
  const [salaryApprovals, setSalaryApprovals] = useState(MOCK_FINAL_SALARY_APPROVALS)
  const [expenseApprovals, setExpenseApprovals] = useState(MOCK_FINAL_EXPENSE_APPROVALS)
  const [incentiveApprovals, setIncentiveApprovals] = useState(MOCK_FINAL_INCENTIVE_APPROVALS)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [approvalType, setApprovalType] = useState('') // 'salary', 'expense', 'incentive'

  const handleApprove = (type, id) => {
    if (type === 'salary') {
      setSalaryApprovals(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'Approved', processingStatus: 'Ready for Accounts', approvedDate: new Date().toISOString() } : item
      ))
      alert('Salary approved successfully!')
    } else if (type === 'expense') {
      setExpenseApprovals(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'Approved', processingStatus: 'Ready for Accounts', approvedDate: new Date().toISOString() } : item
      ))
      alert('Expense approved successfully!')
    } else if (type === 'incentive') {
      setIncentiveApprovals(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'Approved', processingStatus: 'Ready for Accounts', approvedDate: new Date().toISOString() } : item
      ))
      alert('Incentive approved successfully!')
    }
  }

  const handleSendToAccounts = (type, id) => {
    const patch = { processingStatus: 'Sent to Accounts', sentToAccountsDate: new Date().toISOString() }
    if (type === 'salary') {
      setSalaryApprovals(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)))
    } else if (type === 'expense') {
      setExpenseApprovals(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)))
    } else if (type === 'incentive') {
      setIncentiveApprovals(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)))
    }
    alert('Sent to Accounts for processing!')
  }

  const handleReject = (type, item) => {
    setSelectedItem(item)
    setApprovalType(type)
    setShowRejectDialog(true)
  }

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    if (approvalType === 'salary') {
      setSalaryApprovals(prev => prev.map(item => 
        item.id === selectedItem.id ? { ...item, status: 'Rejected', processingStatus: 'Rejected by HR Manager', rejectionReason, rejectedDate: new Date().toISOString() } : item
      ))
    } else if (approvalType === 'expense') {
      setExpenseApprovals(prev => prev.map(item => 
        item.id === selectedItem.id ? { ...item, status: 'Rejected', processingStatus: 'Rejected by HR Manager', rejectionReason, rejectedDate: new Date().toISOString() } : item
      ))
    } else if (approvalType === 'incentive') {
      setIncentiveApprovals(prev => prev.map(item => 
        item.id === selectedItem.id ? { ...item, status: 'Rejected', processingStatus: 'Rejected by HR Manager', rejectionReason, rejectedDate: new Date().toISOString() } : item
      ))
    }

    setShowRejectDialog(false)
    setRejectionReason('')
    setSelectedItem(null)
    setApprovalType('')
    alert('Request rejected successfully!')
  }

  const pendingSalaryCount = salaryApprovals.filter(a => a.status === 'Pending').length
  const pendingExpenseCount = expenseApprovals.filter(a => a.status === 'Pending').length
  const pendingIncentiveCount = incentiveApprovals.filter(a => a.status === 'Pending').length
  const accountsQueueCount = [
    ...salaryApprovals,
    ...expenseApprovals,
    ...incentiveApprovals,
  ].filter((a) => a.processingStatus === 'Ready for Accounts').length
  const salaryApprovalsPagination = useTablePagination(salaryApprovals)
  const expenseApprovalsPagination = useTablePagination(expenseApprovals)
  const incentiveApprovalsPagination = useTablePagination(incentiveApprovals)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Final Approvals</h1>
        <p className="text-gray-600 mt-2">Review and provide final approval for salaries, expenses, and incentives</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <DollarSign className="h-5 w-5" />
              Pending Salary Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{pendingSalaryCount}</div>
            <p className="text-sm text-yellow-600 mt-2">Awaiting final approval</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <FileText className="h-5 w-5" />
              Pending Expense Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{pendingExpenseCount}</div>
            <p className="text-sm text-blue-600 mt-2">Awaiting final approval</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="h-5 w-5" />
              Pending Incentive Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{pendingIncentiveCount}</div>
            <p className="text-sm text-green-600 mt-2">Awaiting final approval</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <AlertCircle className="h-5 w-5" />
              Ready for Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{accountsQueueCount}</div>
            <p className="text-sm text-purple-600 mt-2">Approved and pending dispatch</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="salary" className="w-full">
        <TabsList>
          <TabsTrigger value="salary">
            Salary Approvals ({pendingSalaryCount})
          </TabsTrigger>
          <TabsTrigger value="expense">
            Expense Approvals ({pendingExpenseCount})
          </TabsTrigger>
          <TabsTrigger value="incentive">
            Incentive Approvals ({pendingIncentiveCount})
          </TabsTrigger>
        </TabsList>

        {/* Salary Approvals Tab */}
        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#433228]" />
                Salary Final Approvals
              </CardTitle>
              <CardDescription>Review and approve salary requests submitted by HR</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">No. of Days</TableHead>
                    <TableHead className="text-right">Basic (₹)</TableHead>
                    <TableHead className="text-right">Total Salary (₹)</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Accounts Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryApprovalsPagination.paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.employeeName}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">{item.noOfDays}</TableCell>
                      <TableCell className="text-right">₹{item.basic.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        ₹{item.totalSalary.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>{item.submittedBy}</TableCell>
                      <TableCell>{new Date(item.submittedDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-700">{item.processingStatus}</span>
                      </TableCell>
                      <TableCell>
                        {item.status === 'Pending' && (
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApprove('salary', item.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleReject('salary', item)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {item.status === 'Approved' && item.processingStatus === 'Ready for Accounts' && (
                          <Button
                            size="sm"
                            className="bg-[#433228] hover:bg-[#5a4238] text-white"
                            onClick={() => handleSendToAccounts('salary', item.id)}
                          >
                            Send to Accounts
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {salaryApprovals.length > 0 && <TablePaginationControls {...salaryApprovalsPagination} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Approvals Tab */}
        <TabsContent value="expense">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#433228]" />
                Expense Final Approvals
              </CardTitle>
              <CardDescription>Review and approve expense requests submitted by HR</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Travelled From</TableHead>
                    <TableHead>Travelled To</TableHead>
                    <TableHead className="text-right">TA (₹)</TableHead>
                    <TableHead className="text-right">DA (₹)</TableHead>
                    <TableHead className="text-right">Total Amount (₹)</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Accounts Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseApprovalsPagination.paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.employeeName}</TableCell>
                      <TableCell>{item.travelledFrom}</TableCell>
                      <TableCell>{item.travelledTo}</TableCell>
                      <TableCell className="text-right">₹{(item.ta || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">₹{(item.da || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>{item.submittedBy}</TableCell>
                      <TableCell>{new Date(item.submittedDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-700">{item.processingStatus}</span>
                      </TableCell>
                      <TableCell>
                        {item.status === 'Pending' && (
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApprove('expense', item.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleReject('expense', item)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {item.status === 'Approved' && item.processingStatus === 'Ready for Accounts' && (
                          <Button
                            size="sm"
                            className="bg-[#433228] hover:bg-[#5a4238] text-white"
                            onClick={() => handleSendToAccounts('expense', item.id)}
                          >
                            Send to Accounts
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {expenseApprovals.length > 0 && <TablePaginationControls {...expenseApprovalsPagination} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incentive Approvals Tab */}
        <TabsContent value="incentive">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#433228]" />
                Incentive Final Approvals
              </CardTitle>
              <CardDescription>Review and approve incentive requests submitted by HR</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Primary Target (₹)</TableHead>
                    <TableHead className="text-right">Primary Achieved (₹)</TableHead>
                    <TableHead className="text-right">Secondary Target (₹)</TableHead>
                    <TableHead className="text-right">Secondary Achieved (₹)</TableHead>
                    <TableHead className="text-right">Incentive Amount (₹)</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Accounts Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incentiveApprovalsPagination.paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.employeeName}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">₹{item.primaryTarget.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">₹{item.primaryAchieved.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">₹{item.secondaryTarget.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">₹{item.secondaryAchieved.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        ₹{item.incentiveAmount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>{item.submittedBy}</TableCell>
                      <TableCell>{new Date(item.submittedDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-700">{item.processingStatus}</span>
                      </TableCell>
                      <TableCell>
                        {item.status === 'Pending' && (
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApprove('incentive', item.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleReject('incentive', item)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {item.status === 'Approved' && item.processingStatus === 'Ready for Accounts' && (
                          <Button
                            size="sm"
                            className="bg-[#433228] hover:bg-[#5a4238] text-white"
                            onClick={() => handleSendToAccounts('incentive', item.id)}
                          >
                            Send to Accounts
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {incentiveApprovals.length > 0 && <TablePaginationControls {...incentiveApprovalsPagination} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Approval Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm"><strong>Employee:</strong> {selectedItem.employeeName}</p>
                <p className="text-sm"><strong>Type:</strong> {approvalType === 'salary' ? 'Salary' : approvalType === 'expense' ? 'Expense' : 'Incentive'}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason *</label>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false)
              setRejectionReason('')
              setSelectedItem(null)
              setApprovalType('')
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReject}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HRManagerFinalApprovals
