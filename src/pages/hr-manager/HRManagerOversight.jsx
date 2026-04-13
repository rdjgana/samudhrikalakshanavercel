import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { CheckCircle, XCircle, Eye, AlertCircle, FileText, Calendar, Users } from 'lucide-react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

// Mock HR Approvals Data - All approvals initially sent by HR
const MOCK_HR_APPROVALS = [
  {
    id: 1,
    type: 'Leave',
    employeeName: 'Mohan Raj',
    category: 'Supervisor',
    date: '2026-01-22',
    status: 'Pending Review',
    submittedBy: 'HR',
    submittedDate: '2026-01-22',
    details: 'Leave request for 3 days - Personal',
    hrNotes: 'Approved by HR, pending final review',
  },
  {
    id: 2,
    type: 'Target',
    employeeName: 'Priya Menon',
    category: 'ASM',
    date: '2026-01-21',
    status: 'Pending Review',
    submittedBy: 'HR',
    submittedDate: '2026-01-21',
    details: 'Monthly target assignment - Body Care category',
    hrNotes: 'Target assigned as per performance metrics',
  },
  {
    id: 3,
    type: 'Work Plan',
    employeeName: 'Mohan Raj',
    category: 'Supervisor',
    date: '2026-01-20',
    status: 'Pending Review',
    submittedBy: 'HR',
    submittedDate: '2026-01-20',
    details: 'Work plan for January 2026',
    hrNotes: 'Work plan reviewed and approved by HR',
  },
  {
    id: 4,
    type: 'Claim',
    employeeName: 'Karthik Senthil',
    category: 'SO',
    date: '2026-01-23',
    status: 'Pending Review',
    submittedBy: 'HR',
    submittedDate: '2026-01-23',
    details: 'Travel expense claim - ₹5,000',
    hrNotes: 'Expense verified and approved by HR',
  },
  {
    id: 5,
    type: 'Leave',
    employeeName: 'Kavitha Rani',
    category: 'Promoter',
    date: '2026-01-24',
    status: 'Finalized',
    submittedBy: 'HR',
    submittedDate: '2026-01-24',
    finalizedDate: '2026-01-25',
    details: 'Leave request for 2 days - Medical',
    hrNotes: 'Approved by HR',
    finalNotes: 'Final approval granted',
  },
]

const HRManagerOversight = () => {
  const [approvals, setApprovals] = useState(MOCK_HR_APPROVALS)
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)
  const [finalNotes, setFinalNotes] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'pending', 'finalized'

  const handleView = (approval) => {
    setSelectedApproval(approval)
    setShowViewDialog(true)
  }

  const handleFinalize = (approval) => {
    setSelectedApproval(approval)
    setFinalNotes('')
    setShowFinalizeDialog(true)
  }

  const handleConfirmFinalize = () => {
    if (!finalNotes.trim()) {
      alert('Please provide final notes')
      return
    }

    setApprovals(prev => prev.map(item => 
      item.id === selectedApproval.id 
        ? { 
            ...item, 
            status: 'Finalized', 
            finalizedDate: new Date().toISOString(),
            finalNotes 
          } 
        : item
    ))

    setShowFinalizeDialog(false)
    setFinalNotes('')
    setSelectedApproval(null)
    alert('Approval finalized successfully!')
  }

  const handleReject = (approvalId) => {
    if (window.confirm('Are you sure you want to reject this approval?')) {
      setApprovals(prev => prev.map(item => 
        item.id === approvalId 
          ? { ...item, status: 'Rejected', rejectedDate: new Date().toISOString() } 
          : item
      ))
      alert('Approval rejected successfully!')
    }
  }

  const filteredApprovals = approvals.filter(item => {
    if (filterType === 'pending') return item.status === 'Pending Review'
    if (filterType === 'finalized') return item.status === 'Finalized'
    return true
  })

  const pendingCount = approvals.filter(a => a.status === 'Pending Review').length
  const finalizedCount = approvals.filter(a => a.status === 'Finalized').length
  const filteredApprovalsPagination = useTablePagination(filteredApprovals)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">HR Oversight</h1>
        <p className="text-gray-600 mt-2">Review and finalize all approvals initially sent by HR</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{pendingCount}</div>
            <p className="text-sm text-yellow-600 mt-2">Awaiting final review</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Finalized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{finalizedCount}</div>
            <p className="text-sm text-green-600 mt-2">Completed approvals</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#433228]" />
            HR Approvals Review
          </CardTitle>
          <CardDescription>Review and finalize approvals submitted by HR</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filterType} onValueChange={setFilterType} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All ({approvals.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending Review ({pendingCount})</TabsTrigger>
              <TabsTrigger value="finalized">Finalized ({finalizedCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={filterType} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApprovals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No approvals found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApprovalsPagination.paginatedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.type}</TableCell>
                        <TableCell>{item.employeeName}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>{item.submittedBy}</TableCell>
                        <TableCell>{new Date(item.submittedDate).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Finalized' 
                              ? 'bg-green-100 text-green-800' 
                              : item.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(item)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {item.status === 'Pending Review' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleFinalize(item)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Finalize
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => handleReject(item.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {filteredApprovals.length > 0 && <TablePaginationControls {...filteredApprovalsPagination} />}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approval Details</DialogTitle>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-base">{selectedApproval.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Employee Name</p>
                  <p className="text-base">{selectedApproval.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-base">{selectedApproval.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-base">{new Date(selectedApproval.date).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted By</p>
                  <p className="text-base">{selectedApproval.submittedBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted Date</p>
                  <p className="text-base">{new Date(selectedApproval.submittedDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedApproval.status === 'Finalized' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedApproval.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedApproval.status}
                  </span>
                </div>
                {selectedApproval.finalizedDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Finalized Date</p>
                    <p className="text-base">{new Date(selectedApproval.finalizedDate).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Details</p>
                <p className="text-base bg-gray-50 p-3 rounded-lg">{selectedApproval.details}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">HR Notes</p>
                <p className="text-base bg-blue-50 p-3 rounded-lg">{selectedApproval.hrNotes}</p>
              </div>
              {selectedApproval.finalNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Final Notes</p>
                  <p className="text-base bg-green-50 p-3 rounded-lg">{selectedApproval.finalNotes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finalize Dialog */}
      <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalize Approval</DialogTitle>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm"><strong>Type:</strong> {selectedApproval.type}</p>
                <p className="text-sm"><strong>Employee:</strong> {selectedApproval.employeeName}</p>
                <p className="text-sm"><strong>Details:</strong> {selectedApproval.details}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Final Notes *</label>
                <Textarea
                  placeholder="Enter final notes..."
                  value={finalNotes}
                  onChange={(e) => setFinalNotes(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowFinalizeDialog(false)
              setFinalNotes('')
              setSelectedApproval(null)
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmFinalize}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!finalNotes.trim()}
            >
              Confirm Finalization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HRManagerOversight
