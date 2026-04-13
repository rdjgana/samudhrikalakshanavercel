import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { MOCK_SUPERVISOR_PROMOTERS } from '../../data/mockData'
import { AlertCircle, Calendar } from 'lucide-react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

// Mock salary data
const MOCK_SUPERVISOR_SALARY = {
  fixedSalary: 35000,
  fixedTA: 5000, // Transport Allowance
  workingDays: 26,
  targetAchievement: 75, // Percentage
  da: 0, // Daily Allowance - ₹0 until 80% target achieved
  incentives: 8500,
}

const MOCK_PROMOTER_SALARIES = {
  1: { fixedSalary: 18000, fixedTA: 3000, workingDays: 24, targetAchievement: 82, da: 500, incentives: 3200 },
  2: { fixedSalary: 18000, fixedTA: 3000, workingDays: 25, targetAchievement: 78, da: 0, incentives: 2800 },
  3: { fixedSalary: 18000, fixedTA: 3000, workingDays: 23, targetAchievement: 85, da: 600, incentives: 3500 },
  4: { fixedSalary: 18000, fixedTA: 3000, workingDays: 26, targetAchievement: 88, da: 700, incentives: 3800 },
}

const SalaryExpenses = () => {
  const [selectedPromoter, setSelectedPromoter] = useState('')
  const [showDiscrepancyDialog, setShowDiscrepancyDialog] = useState(false)
  const [discrepancyType, setDiscrepancyType] = useState('')
  const [discrepancyText, setDiscrepancyText] = useState('')
  const [discrepancies, setDiscrepancies] = useState([])
  const [showNoticePeriodDialog, setShowNoticePeriodDialog] = useState(false)
  const [noticePeriodType, setNoticePeriodType] = useState('') // 'supervisor' or 'promoter'
  const [noticePeriodPromoter, setNoticePeriodPromoter] = useState('')
  const [noticePeriodReason, setNoticePeriodReason] = useState('')
  const [noticePeriods, setNoticePeriods] = useState([])
  const noticePeriodsPagination = useTablePagination(noticePeriods)
  const discrepanciesPagination = useTablePagination(discrepancies)

  const supervisorSalary = MOCK_SUPERVISOR_SALARY
  const targetAchievement = supervisorSalary.targetAchievement
  const daAmount = targetAchievement >= 80 ? 500 : 0 // DA = ₹0 until 80% target achieved

  const handleReportDiscrepancy = () => {
    if (!discrepancyType || !discrepancyText.trim()) {
      alert('Please select discrepancy type and provide details')
      return
    }

    const newDiscrepancy = {
      id: Date.now(),
      type: discrepancyType,
      text: discrepancyText,
      date: new Date().toISOString(),
      status: 'Pending',
    }

    setDiscrepancies(prev => [newDiscrepancy, ...prev])
    setShowDiscrepancyDialog(false)
    setDiscrepancyType('')
    setDiscrepancyText('')
    alert('Discrepancy reported successfully!')
  }

  const handleSubmitNoticePeriod = () => {
    if (!noticePeriodType) {
      alert('Please select notice period type')
      return
    }

    if (noticePeriodType === 'promoter' && !noticePeriodPromoter) {
      alert('Please select a promoter')
      return
    }

    if (!noticePeriodReason.trim()) {
      alert('Please provide a reason for notice period')
      return
    }

    const noticeDays = noticePeriodType === 'supervisor' ? 60 : 30
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + noticeDays)

    const newNoticePeriod = {
      id: Date.now(),
      type: noticePeriodType,
      promoterId: noticePeriodType === 'promoter' ? noticePeriodPromoter : null,
      promoterName: noticePeriodType === 'promoter' 
        ? MOCK_SUPERVISOR_PROMOTERS.find(p => p.id === parseInt(noticePeriodPromoter))?.name 
        : null,
      reason: noticePeriodReason,
      noticeDays: noticeDays,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'Active',
      submittedAt: new Date().toISOString(),
    }

    setNoticePeriods(prev => [newNoticePeriod, ...prev])
    setShowNoticePeriodDialog(false)
    setNoticePeriodType('')
    setNoticePeriodPromoter('')
    setNoticePeriodReason('')
    alert(`Notice period submitted successfully! ${noticeDays}-day notice period will end on ${endDate.toLocaleDateString()}`)
  }

  const calculateDaysRemaining = (endDate) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const selectedPromoterSalary = selectedPromoter 
    ? MOCK_PROMOTER_SALARIES[parseInt(selectedPromoter)] 
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Salary & Expenses</h1>
        <p className="text-gray-600 mt-2">View salary details and report discrepancies</p>
      </div>

      {/* Supervisor Salary Card */}
      <Card>
        <CardHeader>
          <CardTitle>My Salary - Current Month</CardTitle>
          <CardDescription>Fixed salary, allowances, and incentives</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Fixed Salary</p>
              <p className="text-xl font-bold">₹{supervisorSalary.fixedSalary.toLocaleString('en-IN')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Fixed TA</p>
              <p className="text-xl font-bold">₹{supervisorSalary.fixedTA.toLocaleString('en-IN')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Working Days</p>
              <p className="text-xl font-bold">{supervisorSalary.workingDays}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Target Achievement</p>
              <p className={`text-xl font-bold ${targetAchievement >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                {targetAchievement}%
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Daily Allowance (DA)</p>
                  {targetAchievement < 80 && (
                    <span className="text-xs text-yellow-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      DA = ₹0 until 80% target
                    </span>
                  )}
                </div>
                <p className={`text-xl font-bold ${daAmount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  ₹{daAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500">
                  {targetAchievement < 80 
                    ? `Current: ${targetAchievement}% (Need 80% for DA)`
                    : 'DA unlocked at 80% target achievement'
                  }
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Incentives</p>
                <p className="text-xl font-bold text-green-600">
                  ₹{supervisorSalary.incentives.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">Total Salary</p>
              <p className="text-2xl font-bold text-[#433228]">
                ₹{(supervisorSalary.fixedSalary + supervisorSalary.fixedTA + daAmount + supervisorSalary.incentives).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <p className="text-gray-600">
                <strong>Notice Period:</strong> <span className="font-semibold text-[#433228]">60 days</span> for Supervisor
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setNoticePeriodType('supervisor')
                  setShowNoticePeriodDialog(true)
                }}
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

      {/* Promoter Salary View */}
      <Card>
        <CardHeader>
          <CardTitle>Promoter Salary Details</CardTitle>
          <CardDescription>View salary and expense details for individual promoters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Promoter</Label>
            <Select
              value={selectedPromoter}
              onChange={(e) => setSelectedPromoter(e.target.value)}
            >
              <option value="">Select Promoter</option>
              {MOCK_SUPERVISOR_PROMOTERS.map((promoter) => (
                <option key={promoter.id} value={promoter.id}>
                  {promoter.name} ({promoter.code})
                </option>
              ))}
            </Select>
          </div>

          {selectedPromoterSalary && (
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <h3 className="font-semibold">
                {MOCK_SUPERVISOR_PROMOTERS.find(p => p.id === parseInt(selectedPromoter))?.name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Fixed Salary</p>
                  <p className="text-lg font-bold">₹{selectedPromoterSalary.fixedSalary.toLocaleString('en-IN')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Fixed TA</p>
                  <p className="text-lg font-bold">₹{selectedPromoterSalary.fixedTA.toLocaleString('en-IN')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Working Days</p>
                  <p className="text-lg font-bold">{selectedPromoterSalary.workingDays}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Target Achievement</p>
                  <p className={`text-lg font-bold ${selectedPromoterSalary.targetAchievement >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedPromoterSalary.targetAchievement}%
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Daily Allowance (DA)</p>
                  <p className={`text-lg font-bold ${selectedPromoterSalary.da > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    ₹{selectedPromoterSalary.da.toLocaleString('en-IN')}
                  </p>
                  {selectedPromoterSalary.targetAchievement < 80 && (
                    <p className="text-xs text-yellow-600">
                      DA = ₹0 until 80% target (Current: {selectedPromoterSalary.targetAchievement}%)
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Incentives</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{selectedPromoterSalary.incentives.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Total Salary</p>
                  <p className="text-xl font-bold text-[#433228]">
                    ₹{(selectedPromoterSalary.fixedSalary + selectedPromoterSalary.fixedTA + selectedPromoterSalary.da + selectedPromoterSalary.incentives).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <p className="text-gray-500">
                    <strong>Notice Period:</strong> <span className="font-semibold text-[#433228]">30 days</span> for Promoter
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setNoticePeriodType('promoter')
                    setNoticePeriodPromoter(selectedPromoter)
                    setShowNoticePeriodDialog(true)
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Submit Notice Period for {MOCK_SUPERVISOR_PROMOTERS.find(p => p.id === parseInt(selectedPromoter))?.name}
                </Button>
              </div>
            </div>
          )}

          {selectedPromoter && !selectedPromoterSalary && (
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">Salary data not available for selected promoter</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Notice Periods */}
      {noticePeriods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notice Periods</CardTitle>
            <CardDescription>Active and completed notice periods</CardDescription>
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
                      <TableCell className="font-medium capitalize">{notice.type}</TableCell>
                      <TableCell>{notice.promoterName || 'Supervisor (Self)'}</TableCell>
                      <TableCell>{notice.noticeDays} days</TableCell>
                      <TableCell>{new Date(notice.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(notice.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${isActive ? 'text-orange-600' : 'text-green-600'}`}>
                          {isActive ? `${daysRemaining} days` : 'Completed'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          isActive 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
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
              {noticePeriodType === 'supervisor' 
                ? 'Submit a 60-day notice period for yourself (Supervisor)'
                : 'Submit a 30-day notice period for the selected Promoter'}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notice Period Type *</Label>
              <Select
                value={noticePeriodType}
                onChange={(e) => {
                  setNoticePeriodType(e.target.value)
                  if (e.target.value === 'supervisor') {
                    setNoticePeriodPromoter('')
                  }
                }}
                disabled={!!noticePeriodType}
              >
                <option value="">Select Type</option>
                <option value="supervisor">Supervisor (60 days)</option>
                <option value="promoter">Promoter (30 days)</option>
              </Select>
            </div>

            {noticePeriodType === 'promoter' && (
              <div className="space-y-2">
                <Label>Select Promoter *</Label>
                <Select
                  value={noticePeriodPromoter}
                  onChange={(e) => setNoticePeriodPromoter(e.target.value)}
                  required
                >
                  <option value="">Select Promoter</option>
                  {MOCK_SUPERVISOR_PROMOTERS.map((promoter) => (
                    <option key={promoter.id} value={promoter.id}>
                      {promoter.name} ({promoter.code})
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {noticePeriodType && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold">Notice Period Details:</p>
                    <p className="mt-1">
                      • Duration: <strong>{noticePeriodType === 'supervisor' ? '60 days' : '30 days'}</strong>
                    </p>
                    <p>
                      • Start Date: <strong>{new Date().toLocaleDateString()}</strong>
                    </p>
                    <p>
                      • End Date: <strong>
                        {new Date(new Date().setDate(new Date().getDate() + (noticePeriodType === 'supervisor' ? 60 : 30))).toLocaleDateString()}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                setNoticePeriodType('')
                setNoticePeriodPromoter('')
                setNoticePeriodReason('')
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitNoticePeriod} 
              className="bg-[#433228] hover:bg-[#5a4238]"
              disabled={!noticePeriodType || (noticePeriodType === 'promoter' && !noticePeriodPromoter) || !noticePeriodReason.trim()}
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
                onChange={(e) => setDiscrepancyType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="Salary">Salary</option>
                <option value="TA">Transport Allowance (TA)</option>
                <option value="DA">Daily Allowance (DA)</option>
                <option value="Incentives">Incentives</option>
              </Select>
            </div>
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
            <Button variant="outline" onClick={() => setShowDiscrepancyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReportDiscrepancy} className="bg-[#433228] hover:bg-[#5a4238]">
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SalaryExpenses
