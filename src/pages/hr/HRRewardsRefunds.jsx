import { useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import { Gift, RefreshCw, Plus } from 'lucide-react'

// Mock Rewards Data
const MOCK_REWARDS = [
  {
    id: 1,
    employeeName: 'Rajesh Kumar',
    rewardType: 'Performance Bonus',
    amount: 10000,
    date: '2026-01-15',
    reason: 'Exceeded monthly target',
    status: 'Approved',
  },
  {
    id: 2,
    employeeName: 'Priya Menon',
    rewardType: 'Best Sales Award',
    amount: 5000,
    date: '2026-01-20',
    reason: 'Top performer of the month',
    status: 'Pending',
  },
]

// Mock Refunds Data
const MOCK_REFUNDS = [
  {
    id: 1,
    employeeName: 'Mohan Raj',
    refundType: 'Travel Expense',
    amount: 2500,
    date: '2026-01-18',
    reason: 'Excess travel expense refund',
    status: 'Processed',
  },
  {
    id: 2,
    employeeName: 'Karthik Senthil',
    refundType: 'Advance Refund',
    amount: 5000,
    date: '2026-01-22',
    reason: 'Advance amount refund',
    status: 'Pending',
  },
]

const HRRewardsRefunds = () => {
  const [rewards, setRewards] = useState(MOCK_REWARDS)
  const [refunds, setRefunds] = useState(MOCK_REFUNDS)
  const [showRewardDialog, setShowRewardDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [rewardData, setRewardData] = useState({
    employeeName: '',
    rewardType: '',
    amount: '',
    reason: '',
  })
  const [refundData, setRefundData] = useState({
    employeeName: '',
    refundType: '',
    amount: '',
    reason: '',
  })

  const rewardsPagination = useTablePagination(rewards)
  const refundsPagination = useTablePagination(refunds)

  const handleAddReward = () => {
    if (!rewardData.employeeName || !rewardData.rewardType || !rewardData.amount || !rewardData.reason) {
      alert('Please fill all required fields')
      return
    }

    const newReward = {
      id: Date.now(),
      ...rewardData,
      amount: parseInt(rewardData.amount),
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    }

    setRewards([...rewards, newReward])
    setShowRewardDialog(false)
    setRewardData({
      employeeName: '',
      rewardType: '',
      amount: '',
      reason: '',
    })
    alert('Reward added successfully!')
  }

  const handleAddRefund = () => {
    if (!refundData.employeeName || !refundData.refundType || !refundData.amount || !refundData.reason) {
      alert('Please fill all required fields')
      return
    }

    const newRefund = {
      id: Date.now(),
      ...refundData,
      amount: parseInt(refundData.amount),
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    }

    setRefunds([...refunds, newRefund])
    setShowRefundDialog(false)
    setRefundData({
      employeeName: '',
      refundType: '',
      amount: '',
      reason: '',
    })
    alert('Refund added successfully!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rewards & Refunds</h1>
        <p className="text-gray-600 mt-2">Manage employee rewards and refunds</p>
      </div>

      <Tabs defaultValue="rewards" className="w-full">
        <TabsList>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-[#433228]" />
                    Rewards Management
                  </CardTitle>
                  <CardDescription>Manage employee rewards and incentives</CardDescription>
                </div>
                <Button
                  onClick={() => setShowRewardDialog(true)}
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reward
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">S.No</TableHead>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Reward Type</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewardsPagination.paginatedItems.map((reward, index) => (
                    <TableRow key={reward.id}>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {(rewardsPagination.page - 1) * rewardsPagination.pageSize + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{reward.employeeName}</TableCell>
                      <TableCell>{reward.rewardType}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        ₹{reward.amount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>{new Date(reward.date).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell className="max-w-xs truncate">{reward.reason}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          reward.status === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reward.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {rewards.length > 0 && <TablePaginationControls {...rewardsPagination} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refunds Tab */}
        <TabsContent value="refunds">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-[#433228]" />
                    Refunds Management
                  </CardTitle>
                  <CardDescription>Manage employee refunds and reimbursements</CardDescription>
                </div>
                <Button
                  onClick={() => setShowRefundDialog(true)}
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Refund
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">S.No</TableHead>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Refund Type</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refundsPagination.paginatedItems.map((refund, index) => (
                    <TableRow key={refund.id}>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {(refundsPagination.page - 1) * refundsPagination.pageSize + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{refund.employeeName}</TableCell>
                      <TableCell>{refund.refundType}</TableCell>
                      <TableCell className="text-right font-semibold text-blue-600">
                        ₹{refund.amount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>{new Date(refund.date).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell className="max-w-xs truncate">{refund.reason}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          refund.status === 'Processed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {refund.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {refunds.length > 0 && <TablePaginationControls {...refundsPagination} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Reward Dialog */}
      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reward</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reward-employee">Employee Name *</Label>
              <Input
                id="reward-employee"
                type="text"
                placeholder="Enter employee name"
                value={rewardData.employeeName}
                onChange={(e) => setRewardData({ ...rewardData, employeeName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward-type">Reward Type *</Label>
              <Select
                id="reward-type"
                value={rewardData.rewardType}
                onChange={(e) => setRewardData({ ...rewardData, rewardType: e.target.value })}
                required
              >
                <option value="">Select Reward Type</option>
                <option value="Performance Bonus">Performance Bonus</option>
                <option value="Best Sales Award">Best Sales Award</option>
                <option value="Employee of the Month">Employee of the Month</option>
                <option value="Incentive">Incentive</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward-amount">Amount (₹) *</Label>
              <Input
                id="reward-amount"
                type="number"
                placeholder="Enter reward amount"
                value={rewardData.amount}
                onChange={(e) => setRewardData({ ...rewardData, amount: e.target.value })}
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward-reason">Reason *</Label>
              <Textarea
                id="reward-reason"
                placeholder="Enter reason for reward"
                value={rewardData.reason}
                onChange={(e) => setRewardData({ ...rewardData, reason: e.target.value })}
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRewardDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddReward}
              className="bg-[#433228] hover:bg-[#5a4238] text-white"
            >
              Add Reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="refund-employee">Employee Name *</Label>
              <Input
                id="refund-employee"
                type="text"
                placeholder="Enter employee name"
                value={refundData.employeeName}
                onChange={(e) => setRefundData({ ...refundData, employeeName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refund-type">Refund Type *</Label>
              <Select
                id="refund-type"
                value={refundData.refundType}
                onChange={(e) => setRefundData({ ...refundData, refundType: e.target.value })}
                required
              >
                <option value="">Select Refund Type</option>
                <option value="Travel Expense">Travel Expense</option>
                <option value="Advance Refund">Advance Refund</option>
                <option value="Excess Payment">Excess Payment</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refund-amount">Amount (₹) *</Label>
              <Input
                id="refund-amount"
                type="number"
                placeholder="Enter refund amount"
                value={refundData.amount}
                onChange={(e) => setRefundData({ ...refundData, amount: e.target.value })}
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refund-reason">Reason *</Label>
              <Textarea
                id="refund-reason"
                placeholder="Enter reason for refund"
                value={refundData.reason}
                onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRefund}
              className="bg-[#433228] hover:bg-[#5a4238] text-white"
            >
              Add Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HRRewardsRefunds
