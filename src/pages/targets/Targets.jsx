import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import {
  fetchHierarchy,
  fetchUserDetails,
  assignTarget,
  clearError,
  clearSuccessMessage,
} from '../../store/slices/targetsSlice'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { MOCK_SS_LIST, MOCK_HIERARCHY, MOCK_SUPERVISOR_PROMOTERS, MOCK_SHOPS } from '../../data/mockData'
import { Target, Plus, Eye, Download, Pencil } from 'lucide-react'
import * as XLSX from 'xlsx'

const FILTER_CATEGORIES = ['ASM', 'SO', 'Supervisor', 'SS', 'Distributor', 'Promoter']

const formatRoleCategory = (role) => {
  if (!role) return '—'
  const map = {
    asm: 'ASM',
    so: 'SO',
    supervisor: 'Supervisor',
    ss: 'SS',
    distributor: 'Distributor',
    promoter: 'Promoter',
  }
  return map[role] || role
}

const convertToCSV = (data, headers) => {
  const csvHeaders = headers.join(',')
  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header] || ''
        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"') || value.includes('\n'))
        ) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(',')
  })
  return [csvHeaders, ...csvRows].join('\n')
}

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

const downloadXLSX = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Target Report')
  XLSX.writeFile(workbook, filename)
}

const Targets = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const {
    hierarchy,
    selectedUser,
    loading,
    error,
    successMessage,
    assignedTargets,
  } = useSelector((state) => state.targets)

  const isSupervisor = user?.role === 'Supervisor'
  const canAssign = ['RSM', 'ASM', 'SO', 'Supervisor'].includes(user?.role)
  const supervisorId = user?.supervisorId || 1

  const supervisorPromoters = useMemo(
    () => (isSupervisor ? MOCK_SUPERVISOR_PROMOTERS : []),
    [isSupervisor],
  )
  const supervisorDistributors = useMemo(
    () =>
      isSupervisor
        ? (MOCK_HIERARCHY.distributors || []).filter(
            (dist) => dist.supervisorId === supervisorId,
          )
        : [],
    [isSupervisor, supervisorId],
  )

  const [selectedRole, setSelectedRole] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedMemberType, setSelectedMemberType] = useState('')
  const [selectedShopId, setSelectedShopId] = useState('')
  const [selectedPromoterForShop, setSelectedPromoterForShop] = useState(null)
  const [targetData, setTargetData] = useState({
    primary: '',
    secondary: '',
    month: new Date().toISOString().slice(0, 7),
  })
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [editingTarget, setEditingTarget] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [tableFilters, setTableFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    dispatch(fetchHierarchy())
  }, [dispatch])

  useEffect(() => {
    if (isSupervisor && selectedMemberType) {
      setSelectedRole(selectedMemberType)
      setSelectedUserId('')
      setSelectedShopId('')
      setSelectedPromoterForShop(null)
    }
  }, [selectedMemberType, isSupervisor])

  useEffect(() => {
    if (isSupervisor && selectedMemberType === 'promoter' && selectedShopId) {
      const selectedShop = MOCK_SHOPS.find((shop) => shop.id === parseInt(selectedShopId, 10))
      if (selectedShop) {
        const promoter = supervisorPromoters.find(
          (p) => p.distributorId === selectedShop.distributorId,
        )
        setSelectedPromoterForShop(promoter || null)
        if (promoter) {
          setSelectedUserId(promoter.id.toString())
        }
      } else {
        setSelectedPromoterForShop(null)
      }
    }
  }, [selectedShopId, selectedMemberType, isSupervisor, supervisorPromoters])

  useEffect(() => {
    if (selectedUserId) {
      dispatch(fetchUserDetails(parseInt(selectedUserId, 10)))
    }
  }, [selectedUserId, dispatch])

  const getUsersByRole = () => {
    if (isSupervisor) {
      if (selectedMemberType === 'promoter') return supervisorPromoters
      if (selectedMemberType === 'distributor') return supervisorDistributors
      return []
    }
    switch (selectedRole) {
      case 'asm':
        return hierarchy.asms || []
      case 'so':
        return hierarchy.sos || []
      case 'supervisor':
        return hierarchy.supervisors || []
      case 'distributor':
        return hierarchy.distributors || []
      case 'promoter':
        return hierarchy.promoters || []
      case 'ss':
        return MOCK_SS_LIST || []
      default:
        return []
    }
  }

  const filteredTargets = useMemo(() => {
    return assignedTargets.filter((target) => {
      if (tableFilters.category) {
        if (formatRoleCategory(target.role) !== tableFilters.category) return false
      }
      if (tableFilters.startDate || tableFilters.endDate) {
        const targetDate = new Date(target.assignedAt)
        if (tableFilters.startDate) {
          const startDate = new Date(tableFilters.startDate)
          if (targetDate < startDate) return false
        }
        if (tableFilters.endDate) {
          const endDate = new Date(tableFilters.endDate)
          endDate.setHours(23, 59, 59, 999)
          if (targetDate > endDate) return false
        }
      }
      return true
    })
  }, [assignedTargets, tableFilters])

  const targetsTablePagination = useTablePagination(filteredTargets)

  const handleDownloadTable = (format = 'csv') => {
    if (filteredTargets.length === 0) {
      alert('No data to download')
      return
    }
    const headers = [
      'Category',
      'Name',
      'Month',
      'Primary Target',
      'Secondary Target',
      'Delegation Type',
      'Assigned Date',
    ]
    const data = filteredTargets.map((item) => ({
      Category: formatRoleCategory(item.role),
      Name: item.userName,
      Month: new Date(item.month + '-01').toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      }),
      'Primary Target': item.primary
        ? `₹${parseInt(item.primary, 10).toLocaleString('en-IN')}`
        : '-',
      'Secondary Target': item.secondary
        ? `₹${parseInt(item.secondary, 10).toLocaleString('en-IN')}`
        : '-',
      'Delegation Type': item.delegationType === 'delegate' ? 'Delegated' : 'Direct',
      'Assigned Date': new Date(item.assignedAt).toLocaleDateString('en-IN'),
    }))
    const dateRange =
      tableFilters.startDate && tableFilters.endDate
        ? `${tableFilters.startDate}_to_${tableFilters.endDate}`
        : 'all_targets'
    const filename = `My_Target_Report_${dateRange}.${format}`

    if (format === 'csv') {
      const csvContent = convertToCSV(data, headers)
      downloadCSV(csvContent, filename)
    } else {
      downloadXLSX(data, filename)
    }
  }

  const handleAssign = async () => {
    if (!targetData.primary && !targetData.secondary) {
      alert('Please enter at least one target value (Primary or Secondary)')
      return
    }

    if (isSupervisor) {
      if (selectedMemberType === 'promoter') {
        if (!selectedShopId || !selectedPromoterForShop) {
          alert('Please select shop to assign target to promoter')
          return
        }
      } else if (!selectedMemberType || !selectedUserId) {
        alert('Please select member type and member')
        return
      }
    } else if (!selectedRole || !selectedUserId) {
      alert('Please select a role and user')
      return
    }

    const assignmentRole = isSupervisor ? selectedMemberType : selectedRole
    const finalUserId =
      isSupervisor && selectedMemberType === 'promoter' && selectedPromoterForShop
        ? selectedPromoterForShop.id.toString()
        : selectedUserId
    const finalUserName =
      isSupervisor && selectedMemberType === 'promoter' && selectedPromoterForShop
        ? selectedPromoterForShop.name
        : getSelectedUserName()

    const result = await dispatch(
      assignTarget({
        id: editingTarget?.id,
        role: assignmentRole,
        userId: finalUserId,
        userName: finalUserName,
        assignedAt: editingTarget?.assignedAt,
        delegationType: 'direct',
        ...targetData,
      }),
    )

    if (assignTarget.fulfilled.match(result)) {
      setShowAssignDialog(false)
      setEditingTarget(null)
      if (isSupervisor) {
        setSelectedMemberType('')
        setSelectedShopId('')
        setSelectedPromoterForShop(null)
      } else {
        setSelectedRole('')
      }
      setSelectedUserId('')
      setTargetData({
        primary: '',
        secondary: '',
        month: new Date().toISOString().slice(0, 7),
      })
      setTimeout(() => {
        dispatch(clearSuccessMessage())
      }, 5000)
    }
  }

  const handleEdit = (target) => {
    setEditingTarget(target)
    if (isSupervisor) {
      setSelectedMemberType(target.role || '')
      setSelectedRole(target.role || '')
    } else {
      setSelectedRole(target.role || '')
    }
    setSelectedUserId(target.userId ? String(target.userId) : '')
    setTargetData({
      primary: target.primary || '',
      secondary: target.secondary || '',
      month: target.month || new Date().toISOString().slice(0, 7),
    })
    setShowAssignDialog(true)
  }

  const getSelectedUserName = () => {
    if (isSupervisor) {
      if (!selectedMemberType || !selectedUserId) return 'Unknown Member'
      if (selectedMemberType === 'promoter') {
        const prom = supervisorPromoters.find((p) => p.id === parseInt(selectedUserId, 10))
        return prom?.name || 'Selected Promoter'
      }
      if (selectedMemberType === 'distributor') {
        const dist = supervisorDistributors.find((d) => d.id === parseInt(selectedUserId, 10))
        return dist?.name || 'Selected Distributor'
      }
      return 'Unknown Member'
    }
    if (!selectedRole || !selectedUserId) return 'Unknown User'
    switch (selectedRole) {
      case 'asm': {
        const asm = hierarchy.asms?.find((a) => a.id === parseInt(selectedUserId, 10))
        return asm?.name || 'Selected ASM'
      }
      case 'so': {
        const so = hierarchy.sos?.find((s) => s.id === parseInt(selectedUserId, 10))
        return so?.name || 'Selected SO'
      }
      case 'supervisor': {
        const sup = hierarchy.supervisors?.find((s) => s.id === parseInt(selectedUserId, 10))
        return sup?.name || 'Selected Supervisor'
      }
      case 'distributor': {
        const dist = hierarchy.distributors?.find((d) => d.id === parseInt(selectedUserId, 10))
        return dist?.name || 'Selected Distributor'
      }
      case 'promoter': {
        const prom = hierarchy.promoters?.find((p) => p.id === parseInt(selectedUserId, 10))
        return prom?.name || 'Selected Promoter'
      }
      case 'ss': {
        const ss = MOCK_SS_LIST.find((s) => s.id === parseInt(selectedUserId, 10))
        return ss?.name || 'Selected SS'
      }
      default:
        return 'Selected User'
    }
  }

  const renderAssignForm = () => (
    <div className="space-y-6">
      {isSupervisor ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Member Type *</Label>
              <Select
                value={selectedMemberType}
                onChange={(e) => {
                  setSelectedMemberType(e.target.value)
                  setSelectedUserId('')
                  setSelectedShopId('')
                  setSelectedPromoterForShop(null)
                }}
                required
              >
                <option value="">Choose Member Type</option>
                <option value="promoter">Promoter</option>
                <option value="distributor">Distributor</option>
              </Select>
            </div>
            {selectedMemberType === 'distributor' && (
              <div className="space-y-2">
                <Label>Select Distributor *</Label>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">Select Distributor</option>
                  {getUsersByRole().map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.code ? `(${member.code})` : ''}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            {selectedMemberType === 'promoter' && (
              <div className="space-y-2">
                <Label>Select Shop *</Label>
                <Select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  required
                >
                  <option value="">Select Shop</option>
                  {MOCK_SHOPS.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          {selectedMemberType === 'promoter' && selectedPromoterForShop && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Associated Promoter:</span>
                  <span className="text-base font-semibold text-green-700">
                    {selectedPromoterForShop.name} ({selectedPromoterForShop.code})
                  </span>
                </div>
                {selectedPromoterForShop.area && (
                  <p className="text-xs text-gray-600 mt-1">Area: {selectedPromoterForShop.area}</p>
                )}
              </CardContent>
            </Card>
          )}
          {selectedMemberType === 'promoter' && selectedShopId && !selectedPromoterForShop && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-4">
                <p className="text-sm text-yellow-700">
                  No promoter found for the selected shop. Please select a different shop.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Role</Label>
            <Select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value)
                setSelectedUserId('')
              }}
            >
              <option value="">Select Role</option>
              <option value="asm">ASM (Area Sales Manager)</option>
              <option value="so">SO (Sales Officer)</option>
              <option value="supervisor">Supervisor</option>
              <option value="ss">SS (Super Stockist)</option>
              <option value="distributor">Distributor</option>
              <option value="promoter">Promoter</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Select User</Label>
            <Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={!selectedRole}
            >
              <option value="">Select User</option>
              {selectedRole && getUsersByRole().length > 0 ? (
                getUsersByRole().map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.code ? `(${u.code})` : ''}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {!selectedRole ? 'Select Role first' : 'No users available'}
                </option>
              )}
            </Select>
          </div>
        </div>
      )}

      {selectedUser && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">User Details:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Distributors:</p>
                <p className="font-medium">{selectedUser.distributorCount || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Shops:</p>
                <p className="font-medium">{selectedUser.shopCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label htmlFor="assign-month">Month *</Label>
        <Input
          id="assign-month"
          type="month"
          value={targetData.month}
          onChange={(e) => setTargetData({ ...targetData, month: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="primary-target">Primary Target — Purchase (₹)</Label>
          <Input
            id="primary-target"
            type="number"
            placeholder="Enter purchase amount"
            value={targetData.primary}
            onChange={(e) => {
              const value =
                e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0)
              setTargetData({ ...targetData, primary: value })
            }}
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondary-target">Secondary Target — Sales (₹)</Label>
          <Input
            id="secondary-target"
            type="number"
            placeholder="Enter sales amount"
            value={targetData.secondary}
            onChange={(e) => {
              const value =
                e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0)
              setTargetData({ ...targetData, secondary: value })
            }}
            min="0"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Enter purchase (primary) and/or sales (secondary) targets for the selected month.
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Target</h1>
          <p className="text-gray-600 mt-2">Assign and manage sales targets</p>
        </div>
        {canAssign && (
          <Button
            onClick={() => {
              setEditingTarget(null)
              setShowAssignDialog(true)
            }}
            className="bg-[#433228] hover:bg-[#5a4238] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign Target
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#433228]" />
            Assigned Targets
          </CardTitle>
          <CardDescription>List of all assigned targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between flex-wrap gap-2">
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
                  onChange={(e) =>
                    setTableFilters({ ...tableFilters, category: e.target.value })
                  }
                >
                  <option value="">All Categories</option>
                  {FILTER_CATEGORIES.map((cat) => (
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
                  onChange={(e) =>
                    setTableFilters({ ...tableFilters, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-end-date">End Date</Label>
                <Input
                  id="filter-end-date"
                  type="date"
                  value={tableFilters.endDate}
                  onChange={(e) =>
                    setTableFilters({ ...tableFilters, endDate: e.target.value })
                  }
                  min={tableFilters.startDate}
                />
              </div>
            </div>
            {(tableFilters.category || tableFilters.startDate || tableFilters.endDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setTableFilters({ category: '', startDate: '', endDate: '' })
                }
              >
                Clear Filters
              </Button>
            )}
          </div>

          {filteredTargets.length > 0 ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredTargets.length} of {assignedTargets.length} target
                  {assignedTargets.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
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
                  {targetsTablePagination.paginatedItems.map((target) => (
                    <TableRow key={target.id}>
                      <TableCell className="font-medium">
                        {formatRoleCategory(target.role)}
                      </TableCell>
                      <TableCell>{target.userName}</TableCell>
                      <TableCell>{target.month}</TableCell>
                      <TableCell className="text-right">
                        {target.primary
                          ? `₹${parseInt(target.primary, 10).toLocaleString('en-IN')}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {target.secondary
                          ? `₹${parseInt(target.secondary, 10).toLocaleString('en-IN')}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            target.delegationType === 'delegate'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {target.delegationType === 'delegate' ? 'Delegated' : 'Direct'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(target.assignedAt).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
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
                          {canAssign && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(target)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredTargets.length > 0 && (
                <TablePaginationControls {...targetsTablePagination} />
              )}
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

      <Dialog
        open={showAssignDialog}
        onOpenChange={(open) => {
          setShowAssignDialog(open)
          if (!open) {
            setEditingTarget(null)
            if (isSupervisor) {
              setSelectedMemberType('')
              setSelectedShopId('')
              setSelectedPromoterForShop(null)
            } else {
              setSelectedRole('')
            }
            setSelectedUserId('')
            setTargetData({
              primary: '',
              secondary: '',
              month: new Date().toISOString().slice(0, 7),
            })
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTarget ? 'Edit Target' : 'Assign Target'}</DialogTitle>
          </DialogHeader>
          {renderAssignForm()}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={
                loading ||
                (isSupervisor
                  ? selectedMemberType === 'promoter'
                    ? !selectedShopId
                    : !selectedUserId
                  : !selectedRole || !selectedUserId)
              }
              className="bg-[#433228] hover:bg-[#5a4238] text-white"
            >
              {loading
                ? editingTarget
                  ? 'Updating...'
                  : 'Assigning...'
                : editingTarget
                  ? 'Update Target'
                  : 'Assign Target'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <p className="mt-1 text-gray-900">
                    {formatRoleCategory(selectedTarget.role)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Name</Label>
                  <p className="mt-1 text-gray-900">{selectedTarget.userName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Month</Label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedTarget.month + '-01').toLocaleDateString('en-IN', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Delegation Type</Label>
                  <p className="mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        selectedTarget.delegationType === 'delegate'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {selectedTarget.delegationType === 'delegate' ? 'Delegated' : 'Direct'}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Primary Target</Label>
                  <p className="mt-1 text-gray-900">
                    {selectedTarget.primary
                      ? `₹${parseInt(selectedTarget.primary, 10).toLocaleString('en-IN')}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">Secondary Target</Label>
                  <p className="mt-1 text-gray-900">
                    {selectedTarget.secondary
                      ? `₹${parseInt(selectedTarget.secondary, 10).toLocaleString('en-IN')}`
                      : '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-semibold text-gray-600">Assigned Date</Label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedTarget.assignedAt).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
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

      {successMessage && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right">
          <Card className="border-green-500 bg-green-50 shadow-lg">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-green-700 font-medium">{successMessage}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right">
          <Card className="border-destructive bg-red-50 shadow-lg">
            <CardContent className="py-4 flex items-center justify-between gap-4">
              <p className="text-destructive font-medium">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearError())}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Targets
