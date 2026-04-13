import { useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Target, Plus, Eye, Download } from 'lucide-react'
import { MOCK_HIERARCHY, MOCK_SS_LIST, MOCK_SHOPS } from '../../data/mockData'
import * as XLSX from 'xlsx'

const TARGET_CATEGORIES = ['RSM', 'ASM', 'SO', 'Supervisor', 'SS', 'Distributor', 'Shop', 'Promoter']

// Utility function to convert data to CSV
const convertToCSV = (data, headers) => {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || ''
      // Escape commas and quotes in values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  })
  return [csvHeaders, ...csvRows].join('\n')
}

// Utility function to download CSV file
const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Utility function to download XLSX file
const downloadXLSX = (data, headers, filename) => {
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Target Report')
  
  // Generate XLSX file and download
  XLSX.writeFile(workbook, filename)
}

const HRTargetManagement = () => {
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [targetData, setTargetData] = useState({
    category: '',
    userId: '',
    userName: '',
    primaryTarget: '',
    secondaryTarget: '',
    month: new Date().toISOString().slice(0, 7),
    delegationType: 'direct', // 'direct' or 'delegate'
  })
  const [assignedTargets, setAssignedTargets] = useState([])
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [tableFilters, setTableFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
  })

  const getUsersByCategory = () => {
    switch (targetData.category) {
      case 'RSM':
        return [{ id: 1, name: 'Rajesh Kumar', code: 'RSM001' }]
      case 'ASM':
        return MOCK_HIERARCHY.asms || []
      case 'SO':
        return MOCK_HIERARCHY.sos || []
      case 'Supervisor':
        return MOCK_HIERARCHY.supervisors || []
      case 'SS':
        return MOCK_SS_LIST || []
      case 'Distributor':
        return MOCK_HIERARCHY.distributors || []
      case 'Shop':
        return MOCK_SHOPS || []
      case 'Promoter':
        return MOCK_HIERARCHY.promoters || []
      default:
        return []
    }
  }

  const handleAssignTarget = () => {
    if (!targetData.category || !targetData.userId || !targetData.secondaryTarget) {
      alert('Please fill all required fields')
      return
    }
    
    // Ensure primary target is calculated if secondary target exists
    if (targetData.secondaryTarget && !targetData.primaryTarget) {
      const secondaryValue = parseFloat(targetData.secondaryTarget) || 0
      const primaryValue = secondaryValue > 0 ? Math.round(secondaryValue * 0.63) : 0
      setTargetData({ ...targetData, primaryTarget: primaryValue.toString() })
    }

    const newTarget = {
      id: Date.now(),
      ...targetData,
      assignedAt: new Date().toISOString(),
    }

    setAssignedTargets([...assignedTargets, newTarget])
    setShowAssignDialog(false)
    // Reset form
    setTargetData({
      category: '',
      userId: '',
      userName: '',
      primaryTarget: '',
      secondaryTarget: '',
      month: new Date().toISOString().slice(0, 7),
      delegationType: 'direct',
    })
    alert('Target assigned successfully!')
  }

  // Filter assigned targets based on filters
  const filteredTargets = assignedTargets.filter(target => {
    if (tableFilters.category && target.category !== tableFilters.category) return false
    
    if (tableFilters.startDate || tableFilters.endDate) {
      const targetDate = new Date(target.assignedAt)
      
      if (tableFilters.startDate) {
        const startDate = new Date(tableFilters.startDate)
        if (targetDate < startDate) return false
      }
      
      if (tableFilters.endDate) {
        const endDate = new Date(tableFilters.endDate)
        endDate.setHours(23, 59, 59, 999) // Include the entire end date
        if (targetDate > endDate) return false
      }
    }
    
    return true
  })

  const targetsPagination = useTablePagination(filteredTargets)

  const handleDownloadTable = (format = 'csv') => {
    if (filteredTargets.length === 0) {
      alert('No data to download')
      return
    }

    const headers = ['Category', 'Name', 'Month', 'Primary Target', 'Secondary Target', 'Delegation Type', 'Assigned Date']
    const data = filteredTargets.map(item => ({
      Category: item.category,
      Name: item.userName,
      Month: new Date(item.month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      'Primary Target': item.primaryTarget ? `₹${parseInt(item.primaryTarget).toLocaleString('en-IN')}` : '-',
      'Secondary Target': item.secondaryTarget ? `₹${parseInt(item.secondaryTarget).toLocaleString('en-IN')}` : '-',
      'Delegation Type': item.delegationType === 'direct' ? 'Direct' : 'Delegated',
      'Assigned Date': new Date(item.assignedAt).toLocaleDateString('en-IN')
    }))

    const dateRange = tableFilters.startDate && tableFilters.endDate 
      ? `${tableFilters.startDate}_to_${tableFilters.endDate}`
      : 'all_targets'
    const filename = `Target_Management_Report_${dateRange}.${format}`

    if (format === 'csv') {
      const csvContent = convertToCSV(data, headers)
      downloadCSV(csvContent, filename)
    } else {
      downloadXLSX(data, headers, filename)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Target Management</h1>
          <p className="text-gray-600 mt-2">Assign and manage sales targets</p>
        </div>
        <Button
          onClick={() => setShowAssignDialog(true)}
          className="bg-[#433228] hover:bg-[#5a4238] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Assign Target
        </Button>
      </div>

      {/* Assigned Targets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#433228]" />
            Assigned Targets
          </CardTitle>
          <CardDescription>List of all assigned targets</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters Section */}
          <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadTable('csv')}
                  disabled={filteredTargets.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadTable('xlsx')}
                  disabled={filteredTargets.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download XLSX
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-category">Category</Label>
                <Select
                  id="filter-category"
                  value={tableFilters.category}
                  onChange={(e) => setTableFilters({ ...tableFilters, category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {TARGET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-start-date">Start Date</Label>
                <Input
                  id="filter-start-date"
                  type="date"
                  value={tableFilters.startDate}
                  onChange={(e) => setTableFilters({ ...tableFilters, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-end-date">End Date</Label>
                <Input
                  id="filter-end-date"
                  type="date"
                  value={tableFilters.endDate}
                  onChange={(e) => setTableFilters({ ...tableFilters, endDate: e.target.value })}
                  min={tableFilters.startDate}
                />
              </div>
            </div>
            {(tableFilters.category || tableFilters.startDate || tableFilters.endDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTableFilters({ category: '', startDate: '', endDate: '' })}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {filteredTargets.length > 0 ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredTargets.length} of {assignedTargets.length} target{assignedTargets.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">S.No</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Primary Target</TableHead>
                    <TableHead className="text-right">Secondary Target</TableHead>
                    <TableHead>Delegation</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targetsPagination.paginatedItems.map((target, index) => (
                  <TableRow key={target.id}>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {(targetsPagination.page - 1) * targetsPagination.pageSize + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{target.category}</TableCell>
                    <TableCell>{target.userName}</TableCell>
                    <TableCell>{target.month}</TableCell>
                    <TableCell className="text-right">
                      {target.primaryTarget ? `₹${parseInt(target.primaryTarget).toLocaleString('en-IN')}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {target.secondaryTarget ? `₹${parseInt(target.secondaryTarget).toLocaleString('en-IN')}` : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        target.delegationType === 'direct' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {target.delegationType === 'direct' ? 'Direct' : 'Delegated'}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(target.assignedAt).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTarget(target)
                          setShowViewDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredTargets.length > 0 && <TablePaginationControls {...targetsPagination} />}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {tableFilters.category || tableFilters.startDate || tableFilters.endDate 
                ? 'No targets found matching the filters.' 
                : 'No targets assigned yet. Click "Assign Target" to get started.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Target Dialog */}
      <Dialog 
        open={showAssignDialog} 
        onOpenChange={(open) => {
          setShowAssignDialog(open)
          if (!open) {
            // Reset form when dialog closes
            setTargetData({
              category: '',
              userId: '',
              userName: '',
              primaryTarget: '',
              secondaryTarget: '',
              month: new Date().toISOString().slice(0, 7),
              delegationType: 'direct',
            })
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Target</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                id="category"
                value={targetData.category}
                onChange={(e) => {
                  setTargetData({ ...targetData, category: e.target.value, userId: '', userName: '' })
                }}
                required
              >
                <option value="">Select Category</option>
                {TARGET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Select {targetData.category || 'User'} *</Label>
              <Select
                id="user"
                value={targetData.userId}
                onChange={(e) => {
                  const selectedUser = getUsersByCategory().find(u => u.id === parseInt(e.target.value))
                  setTargetData({
                    ...targetData,
                    userId: e.target.value,
                    userName: selectedUser?.name || '',
                  })
                }}
                disabled={!targetData.category}
                required
              >
                <option value="">Select {targetData.category || 'User'}</option>
                {getUsersByCategory().map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.code ? `(${user.code})` : ''}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month *</Label>
              <Input
                id="month"
                type="month"
                value={targetData.month}
                onChange={(e) => setTargetData({ ...targetData, month: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delegation">Delegation Type *</Label>
              <Select
                id="delegation"
                value={targetData.delegationType}
                onChange={(e) => setTargetData({ ...targetData, delegationType: e.target.value })}
                required
              >
                <option value="direct">Direct Assignment (HR assigns to all)</option>
                <option value="delegate">Delegate to RSM (RSM assigns to subordinates)</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="secondary-target">Secondary Target (₹) *</Label>
                <Input
                  id="secondary-target"
                  type="number"
                  placeholder="Enter secondary target"
                  value={targetData.secondaryTarget}
                  onChange={(e) => {
                    const secondaryValue = parseFloat(e.target.value) || 0
                    // Calculate primary target: Secondary - 37% of Secondary = Secondary * 0.63
                    const primaryValue = secondaryValue > 0 ? Math.round(secondaryValue * 0.63) : ''
                    setTargetData({ 
                      ...targetData, 
                      secondaryTarget: e.target.value,
                      primaryTarget: primaryValue.toString()
                    })
                  }}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary-target">Primary Target (₹)</Label>
                <Input
                  id="primary-target"
                  type="number"
                  placeholder="Auto-calculated"
                  value={targetData.primaryTarget}
                  disabled
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">Auto-calculated: Secondary Target - 37%</p>
              </div>
            </div>

            {targetData.delegationType === 'delegate' && targetData.category === 'RSM' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> When delegating to RSM, the RSM will be able to assign the remaining balance to their subordinates (ASM, SO, Supervisor).
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAssignDialog(false)
                // Reset form
                setTargetData({
                  category: '',
                  userId: '',
                  userName: '',
                  primaryTarget: '',
                  secondaryTarget: '',
                  month: new Date().toISOString().slice(0, 7),
                  delegationType: 'direct',
                })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignTarget}
              className="bg-[#433228] hover:bg-[#5a4238] text-white"
            >
              Assign Target
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Target Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Target Details</DialogTitle>
          </DialogHeader>
          {selectedTarget && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Category</Label>
                  <p className="mt-1 text-gray-900">{selectedTarget.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Name</Label>
                  <p className="mt-1 text-gray-900">{selectedTarget.userName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Month</Label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedTarget.month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Delegation Type</Label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedTarget.delegationType === 'direct' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedTarget.delegationType === 'direct' ? 'Direct' : 'Delegated'}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Primary Target</Label>
                  <p className="mt-1 text-gray-900">
                    {selectedTarget.primaryTarget ? `₹${parseInt(selectedTarget.primaryTarget).toLocaleString('en-IN')}` : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Secondary Target</Label>
                  <p className="mt-1 text-gray-900">
                    {selectedTarget.secondaryTarget ? `₹${parseInt(selectedTarget.secondaryTarget).toLocaleString('en-IN')}` : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Assigned Date</Label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedTarget.assignedAt).toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowViewDialog(false)
                setSelectedTarget(null)
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HRTargetManagement
