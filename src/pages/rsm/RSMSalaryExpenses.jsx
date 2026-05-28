import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { AlertCircle, Calendar } from 'lucide-react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

// Mock RSM salary data
const MOCK_RSM_SALARY = {
  fixedSalary: 75000,
  fixedTA: 12000,
  workingDays: 26,
  targetAchievement: 88,
  da: 1500,
}

const RSM_NOTICE_PERIOD_DAYS = 90

const RSMSalaryExpenses = () => {
  const [showDiscrepancyDialog, setShowDiscrepancyDialog] = useState(false)
  const [discrepancyType, setDiscrepancyType] = useState('')
  const [discrepancyOtherType, setDiscrepancyOtherType] = useState('')
  const [discrepancyText, setDiscrepancyText] = useState('')
  const [discrepancies, setDiscrepancies] = useState([])

  const [showNoticePeriodDialog, setShowNoticePeriodDialog] = useState(false)
  const [noticePeriodReason, setNoticePeriodReason] = useState('')
  const [noticePeriods, setNoticePeriods] = useState([])

  const noticePeriodsPagination = useTablePagination(noticePeriods)
  const discrepanciesPagination = useTablePagination(discrepancies)

  const rsmSalary = MOCK_RSM_SALARY
  const targetAchievement = rsmSalary.targetAchievement
  const daAmount = targetAchievement >= 80 ? rsmSalary.da : 0

  const handleReportDiscrepancy = () => {
    if (!discrepancyType || !discrepancyText.trim()) {
      alert('Please select discrepancy type and provide details')
      return
    }

    if (discrepancyType === 'Others' && !discrepancyOtherType.trim()) {
      alert('Please specify the discrepancy type')
      return
    }

    const resolvedType =
      discrepancyType === 'Others'
        ? `Others: ${discrepancyOtherType.trim()}`
        : discrepancyType

    const newDiscrepancy = {
      id: Date.now(),
      type: resolvedType,
      text: discrepancyText,
      date: new Date().toISOString(),
      status: 'Pending',
    }

    setDiscrepancies((prev) => [newDiscrepancy, ...prev])
    setShowDiscrepancyDialog(false)
    setDiscrepancyType('')
    setDiscrepancyOtherType('')
    setDiscrepancyText('')
    alert('Discrepancy reported successfully!')
  }

  const handleSubmitNoticePeriod = () => {
    if (!noticePeriodReason.trim()) {
      alert('Please provide a reason for notice period')
      return
    }

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + RSM_NOTICE_PERIOD_DAYS)

    const newNoticePeriod = {
      id: Date.now(),
      type: 'rsm',
      reason: noticePeriodReason,
      noticeDays: RSM_NOTICE_PERIOD_DAYS,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'Active',
      submittedAt: new Date().toISOString(),
    }

    setNoticePeriods((prev) => [newNoticePeriod, ...prev])
    setShowNoticePeriodDialog(false)
    setNoticePeriodReason('')
    alert(
      `Notice period submitted successfully! ${RSM_NOTICE_PERIOD_DAYS}-day notice period will end on ${endDate.toLocaleDateString()}`,
    )
  }

  const calculateDaysRemaining = (endDate) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Salary & Expenses</h1>
        <p className="text-gray-600 mt-2">
          View RSM salary details, submit notice period, and report discrepancies.
        </p>
      </div>

      {/* RSM Salary Card */}
      <Card>
        <CardHeader>
          <CardTitle>My Salary - Current Month</CardTitle>
          <CardDescription>Fixed salary, allowances, and DA based on target achievement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Fixed Salary</p>
              <p className="text-xl font-bold">₹{rsmSalary.fixedSalary.toLocaleString('en-IN')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Fixed TA</p>
              <p className="text-xl font-bold">₹{rsmSalary.fixedTA.toLocaleString('en-IN')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Working Days</p>
              <p className="text-xl font-bold">{rsmSalary.workingDays}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Target Achievement</p>
              <p
                className={`text-xl font-bold ${
                  targetAchievement >= 80 ? 'text-green-600' : 'text-yellow-600'
                }`}
              >
                {targetAchievement}%
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-gray-600">Daily Allowance (DA)</p>
                {targetAchievement < 80 && (
                  <span className="text-xs text-yellow-600 flex items-center gap-1 shrink-0">
                    <AlertCircle className="h-3 w-3" />
                    DA = ₹0 until 80% target
                  </span>
                )}
              </div>
              <p
                className={`text-xl font-bold ${
                  daAmount > 0 ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                ₹{daAmount.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500">
                {targetAchievement < 80
                  ? `Current: ${targetAchievement}% (Need 80% for DA)`
                  : 'DA unlocked at 80% target achievement'}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">Total Salary</p>
              <p className="text-2xl font-bold text-[#433228]">
                ₹{(rsmSalary.fixedSalary + rsmSalary.fixedTA + daAmount).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <p className="text-gray-600">
                <strong>Notice Period:</strong>{' '}
                <span className="font-semibold text-[#433228]">{RSM_NOTICE_PERIOD_DAYS} days</span>{' '}
                for RSM
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => setShowNoticePeriodDialog(true)}
                variant="outline"
                className="flex-1"
              >
                Submit Notice Period
              </Button>
              <Button
                onClick={() => setShowDiscrepancyDialog(true)}
                variant="outline"
                className="flex-1"
              >
                Report Discrepancy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notice Periods History */}
      {noticePeriods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notice Period History</CardTitle>
            <CardDescription>Submitted notice periods and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Notice Days</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {noticePeriodsPagination.paginatedItems.map((notice) => {
                  const daysRemaining = calculateDaysRemaining(notice.endDate)
                  const isActive = daysRemaining > 0
                  return (
                    <TableRow key={notice.id}>
                      <TableCell className="font-medium uppercase">{notice.type}</TableCell>
                      <TableCell>RSM (Self)</TableCell>
                      <TableCell>{notice.noticeDays} days</TableCell>
                      <TableCell>{new Date(notice.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(notice.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            isActive ? 'text-orange-600' : 'text-green-600'
                          }`}
                        >
                          {isActive ? `${daysRemaining} days` : 'Completed'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            isActive
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {isActive ? 'Active' : 'Completed'}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <TablePaginationControls {...noticePeriodsPagination} />
          </CardContent>
        </Card>
      )}

      {/* Reported Discrepancies */}
      {discrepancies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reported Discrepancies</CardTitle>
            <CardDescription>Your reported salary/expense discrepancies</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discrepanciesPagination.paginatedItems.map((discrepancy) => (
                  <TableRow key={discrepancy.id}>
                    <TableCell>{new Date(discrepancy.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{discrepancy.type}</TableCell>
                    <TableCell className="max-w-md">{discrepancy.text}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        {discrepancy.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePaginationControls {...discrepanciesPagination} />
          </CardContent>
        </Card>
      )}

      {/* Notice Period Dialog */}
      <Dialog open={showNoticePeriodDialog} onOpenChange={setShowNoticePeriodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Notice Period</DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Submit a {RSM_NOTICE_PERIOD_DAYS}-day notice period for yourself (RSM)
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold">Notice Period Details:</p>
                  <p className="mt-1">
                    • Duration:{' '}
                    <strong>{RSM_NOTICE_PERIOD_DAYS} days</strong>
                  </p>
                  <p>
                    • Start Date: <strong>{new Date().toLocaleDateString()}</strong>
                  </p>
                  <p>
                    • End Date:{' '}
                    <strong>
                      {new Date(
                        new Date().setDate(new Date().getDate() + RSM_NOTICE_PERIOD_DAYS),
                      ).toLocaleDateString()}
                    </strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason for Notice Period *</Label>
              <Textarea
                placeholder="Enter the reason for submitting notice period..."
                value={noticePeriodReason}
                onChange={(e) => setNoticePeriodReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNoticePeriodDialog(false)
                setNoticePeriodReason('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitNoticePeriod}
              className="bg-[#433228] hover:bg-[#5a4238]"
              disabled={!noticePeriodReason.trim()}
            >
              Submit Notice Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discrepancy Dialog */}
      <Dialog open={showDiscrepancyDialog} onOpenChange={setShowDiscrepancyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Discrepancy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Discrepancy Type *</Label>
              <Select
                value={discrepancyType}
                onChange={(e) => {
                  const next = e.target.value
                  setDiscrepancyType(next)
                  if (next !== 'Others') {
                    setDiscrepancyOtherType('')
                  }
                }}
              >
                <option value="">Select Type</option>
                <option value="Salary">Salary</option>
                <option value="TA">Transport Allowance (TA)</option>
                <option value="DA">Daily Allowance (DA)</option>
                <option value="Incentives">Incentives</option>
                <option value="Others">Others</option>
              </Select>
            </div>
            {discrepancyType === 'Others' && (
              <div className="space-y-2">
                <Label htmlFor="rsm-discrepancy-other-type">Specify Discrepancy Type *</Label>
                <Input
                  id="rsm-discrepancy-other-type"
                  type="text"
                  placeholder="Enter discrepancy type"
                  value={discrepancyOtherType}
                  onChange={(e) => setDiscrepancyOtherType(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Details *</Label>
              <Textarea
                placeholder="Describe the discrepancy..."
                value={discrepancyText}
                onChange={(e) => setDiscrepancyText(e.target.value)}
                rows={5}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDiscrepancyDialog(false)
                setDiscrepancyOtherType('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReportDiscrepancy}
              disabled={
                !discrepancyType ||
                !discrepancyText.trim() ||
                (discrepancyType === 'Others' && !discrepancyOtherType.trim())
              }
              className="bg-[#433228] hover:bg-[#5a4238]"
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RSMSalaryExpenses
