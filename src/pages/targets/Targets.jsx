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
import {
  MOCK_SS_LIST,
  MOCK_HIERARCHY,
  MOCK_SUPERVISOR_PROMOTERS,
  MOCK_SHOPS,
  MOCK_DASHBOARD_DATA,
} from '../../data/mockData'
import { Target, Plus, Eye, Download, Pencil } from 'lucide-react'
import * as XLSX from 'xlsx'

const FILTER_CATEGORIES = ['ASM', 'SO', 'Supervisor', 'SS', 'Distributor', 'Promoter']
const SUPERVISOR_FILTER_CATEGORIES = ['Distributor', 'Promoter']
const RSM_ASSIGNABLE_ROLES = ['supervisor', 'distributor']

const formatRoleCategory = (role) => {
  if (!role) return '—'
  const map = {
    rsm: 'RSM',
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

  const isRSM = user?.role === 'RSM'
  const isSupervisor = user?.role === 'Supervisor'
  const canAssign = ['RSM', 'ASM', 'SO', 'Supervisor'].includes(user?.role)
  const supervisorId = user?.supervisorId || 1
  const today = new Date()
  const currentMonthValue = today.toISOString().slice(0, 7)
  const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const nextMonthValue = nextMonthDate.toISOString().slice(0, 7)
  const canAccessNextMonth = today.getDate() >= 26
  const currentMonthLabel = new Date(`${currentMonthValue}-01`).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
  const availableFilterCategories = isSupervisor ? SUPERVISOR_FILTER_CATEGORIES : FILTER_CATEGORIES

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
  const [selectedPromoter, setSelectedPromoter] = useState(null)
  const [targetData, setTargetData] = useState({
    primary: '',
    secondary: '',
    month: currentMonthValue,
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
  const isEditingRsmSelfTarget = isRSM && formatRoleCategory(editingTarget?.role) === 'RSM'

  useEffect(() => {
    dispatch(fetchHierarchy())
  }, [dispatch])

  useEffect(() => {
    if (isSupervisor && selectedMemberType) {
      setSelectedRole(selectedMemberType)
      setSelectedUserId('')
      setSelectedShopId('')
      setSelectedPromoter(null)
    }
  }, [selectedMemberType, isSupervisor])

  useEffect(() => {
    if (isSupervisor && selectedMemberType === 'promoter' && selectedUserId) {
      const promoter = supervisorPromoters.find((p) => p.id === parseInt(selectedUserId, 10))
      setSelectedPromoter(promoter || null)
      if (promoter) {
        const promoterShop = MOCK_SHOPS.find((shop) => shop.distributorId === promoter.distributorId)
        setSelectedShopId(promoterShop ? String(promoterShop.id) : '')
      } else {
        setSelectedShopId('')
      }
    }
    if (isSupervisor && selectedMemberType === 'promoter' && !selectedUserId) {
      setSelectedPromoter(null)
      setSelectedShopId('')
    }
  }, [selectedUserId, selectedMemberType, isSupervisor, supervisorPromoters])

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
      if (isSupervisor && !['Distributor', 'Promoter'].includes(formatRoleCategory(target.role))) {
        return false
      }
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
  }, [assignedTargets, isSupervisor, tableFilters])

  const rsmSelfTarget = useMemo(() => {
    const currentUserTarget = assignedTargets.find((target) => {
      return (
        target.month === currentMonthValue &&
        formatRoleCategory(target.role) === 'RSM' &&
        String(target.userId) === String(user?.id)
      )
    })

    if (currentUserTarget) {
      return currentUserTarget
    }

    return {
      id: `rsm-${currentMonthValue}`,
      role: 'RSM',
      userId: user?.id || 1,
      userName: user?.name || 'RSM User',
      month: currentMonthValue,
      primary: MOCK_DASHBOARD_DATA.currentMonth.primary.target,
      secondary: MOCK_DASHBOARD_DATA.currentMonth.secondary.target,
      delegationType: 'direct',
      assignedBy: 'HR',
      assignedAt: new Date().toISOString(),
    }
  }, [assignedTargets, currentMonthValue, user?.id, user?.name])

  const rsmDelegatedTargets = useMemo(() => {
    return assignedTargets.filter((target) => {
      const targetCategory = formatRoleCategory(target.role)

      return (
        target.month === currentMonthValue &&
        ['Supervisor', 'Distributor'].includes(targetCategory) &&
        String(target.assignedById) === String(user?.id)
      )
    })
  }, [assignedTargets, currentMonthValue, user?.id])
  const rsmSupervisorTargetsCount = rsmDelegatedTargets.filter(
    (target) => formatRoleCategory(target.role) === 'Supervisor',
  ).length
  const rsmDistributorTargetsCount = rsmDelegatedTargets.filter(
    (target) => formatRoleCategory(target.role) === 'Distributor',
  ).length

  const displayTargets = isRSM ? [rsmSelfTarget] : filteredTargets
  const targetsTablePagination = useTablePagination(displayTargets)
  const rsmDelegatedTargetsPagination = useTablePagination(rsmDelegatedTargets)

  const handleDownloadTable = (format = 'csv') => {
    if (displayTargets.length === 0) {
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
    const data = displayTargets.map((item) => ({
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
    const dateRange = isRSM
      ? currentMonthValue
      : tableFilters.startDate && tableFilters.endDate
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
        if (!selectedUserId || !selectedShopId || !selectedPromoter) {
          alert('Please select promoter')
          return
        }
      } else if (!selectedMemberType || !selectedUserId) {
        alert('Please select member type and member')
        return
      }
      if (!targetData.secondary) {
        alert('Please enter secondary target')
        return
      }
    } else if (isRSM) {
      if (!isEditingRsmSelfTarget) {
        if (!selectedRole || !selectedUserId) {
          alert('Please select role and user')
          return
        }
        if (!RSM_ASSIGNABLE_ROLES.includes(selectedRole)) {
          alert('RSM can assign targets only to supervisor and distributor')
          return
        }
      }
    } else if (!isRSM && (!selectedRole || !selectedUserId)) {
      alert('Please select a role and user')
      return
    }

    const assignmentRole = isSupervisor
      ? selectedMemberType
      : isRSM
        ? (isEditingRsmSelfTarget ? 'RSM' : selectedRole)
        : selectedRole
    const finalUserId = isRSM
      ? (isEditingRsmSelfTarget
          ? String(editingTarget?.userId || user?.id || 1)
          : selectedUserId)
      : isSupervisor && selectedMemberType === 'promoter' && selectedPromoter
        ? selectedPromoter.id.toString()
        : selectedUserId
    const finalUserName = isRSM
      ? (isEditingRsmSelfTarget
          ? editingTarget?.userName || user?.name || 'RSM User'
          : getSelectedUserName())
      : isSupervisor && selectedMemberType === 'promoter' && selectedPromoter
        ? selectedPromoter.name
        : getSelectedUserName()
    const targetId =
      editingTarget?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const result = await dispatch(
      assignTarget({
        id: targetId,
        role: assignmentRole,
        userId: finalUserId,
        userName: finalUserName,
        assignedAt: editingTarget?.assignedAt,
        assignedBy: isRSM
          ? isEditingRsmSelfTarget
            ? editingTarget?.assignedBy || 'HR'
            : user?.name || 'RSM User'
          : editingTarget?.assignedBy,
        assignedById: isRSM && !isEditingRsmSelfTarget ? user?.id : editingTarget?.assignedById,
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
        setSelectedPromoter(null)
      } else {
        setSelectedRole('')
      }
      setSelectedUserId('')
      setTargetData({
        primary: '',
        secondary: '',
        month: currentMonthValue,
      })
      setTimeout(() => {
        dispatch(clearSuccessMessage())
      }, 5000)
    }
  }

  const handleEdit = (target) => {
    setEditingTarget(target)
    if (isRSM) {
      setSelectedRole(formatRoleCategory(target.role) === 'RSM' ? 'RSM' : target.role || '')
      setSelectedUserId(String(target.userId || user?.id || ''))
    } else if (isSupervisor) {
      setSelectedMemberType(target.role || '')
      setSelectedRole(target.role || '')
    } else {
      setSelectedRole(target.role || '')
    }
    setSelectedUserId(target.userId ? String(target.userId) : '')
    setTargetData({
      primary: target.primary || '',
      secondary: target.secondary || '',
      month: isRSM ? currentMonthValue : target.month || currentMonthValue,
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
      {isRSM ? (
        isEditingRsmSelfTarget ? (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700">Assigned To</span>
                <span className="text-base font-semibold text-gray-900">
                  {editingTarget?.userName || user?.name || 'RSM User'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700">Assigned By</span>
                <span className="text-base font-semibold text-green-700">
                  {editingTarget?.assignedBy || 'HR'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                This target is assigned by HR for the current month. You can update primary and secondary targets, but the month stays fixed.
              </p>
            </CardContent>
          </Card>
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
                <option value="supervisor">Supervisor</option>
                <option value="distributor">Distributor</option>
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
        )
      ) : isSupervisor ? (
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
                  setSelectedPromoter(null)
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
                <Label>Select Promoter *</Label>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">Select Promoter</option>
                  {getUsersByRole().map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.code ? `(${member.code})` : ''}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          {selectedMemberType === 'promoter' && selectedPromoter && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Selected Promoter:</span>
                  <span className="text-base font-semibold text-green-700">
                    {selectedPromoter.name} ({selectedPromoter.code})
                  </span>
                </div>
                {selectedPromoter.area && (
                  <p className="text-xs text-gray-600 mt-1">Area: {selectedPromoter.area}</p>
                )}
              </CardContent>
            </Card>
          )}
          {selectedMemberType === 'promoter' && selectedShopId && (
            <div className="space-y-2">
              <Label>Shop (Auto populated)</Label>
              <Input
                value={MOCK_SHOPS.find((shop) => shop.id === parseInt(selectedShopId, 10))?.name || ''}
                disabled
              />
            </div>
          )}
          {selectedMemberType === 'promoter' && selectedUserId && !selectedShopId && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-4">
                <p className="text-sm text-yellow-700">
                  No shop found for this promoter.
                </p>
              </CardContent>
            </Card>
          )}
          {selectedMemberType === 'distributor' && selectedUserId && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <p className="text-sm text-blue-700">
                  User details appear here to help verify distributor coverage before assigning target.
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

      <div className="space-y-2">
        <Label htmlFor="assign-month">Month *</Label>
        {isRSM && isEditingRsmSelfTarget ? (
          <>
            <Input id="assign-month" value={currentMonthLabel} disabled />
            <p className="text-xs text-gray-500">
              Only the current month is displayed for the RSM assigned target and it cannot be edited.
            </p>
          </>
        ) : (
          <>
            <Select
              id="assign-month"
              value={targetData.month}
              onChange={(e) => setTargetData({ ...targetData, month: e.target.value })}
              disabled={!canAccessNextMonth}
            >
              <option value={currentMonthValue}>
                {new Date(`${currentMonthValue}-01`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </option>
              {canAccessNextMonth && (
                <option value={nextMonthValue}>
                  {new Date(`${nextMonthValue}-01`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </option>
              )}
            </Select>
            <p className="text-xs text-gray-500">
              {canAccessNextMonth
                ? 'Current month is default. Next month is accessible from day 26 onwards.'
                : 'Current month is fixed for target assignment. Next month opens from day 26 onwards.'}
            </p>
          </>
        )}
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
          <p className="text-gray-600 mt-2">
            {isRSM
              ? 'View the current month target assigned by HR and assign current month targets to supervisor or distributor.'
              : 'Assign and manage sales targets'}
          </p>
        </div>
        {canAssign && (
          <Button
            onClick={() => {
              setEditingTarget(null)
              if (isRSM) {
                setSelectedRole('')
                setSelectedUserId('')
              }
              setShowAssignDialog(true)
            }}
            className="bg-[#433228] hover:bg-[#5a4238] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign Target
          </Button>
        )}
      </div>

      {isRSM ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#433228]" />
                HR Assigned To RSM
              </CardTitle>
              <CardDescription>Current month target assigned by HR to the RSM</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Primary Target</TableHead>
                    <TableHead className="text-right">Secondary Target</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targetsTablePagination.paginatedItems.map((target) => (
                    <TableRow key={target.id}>
                      <TableCell>
                        {new Date(`${target.month}-01`).toLocaleDateString('en-IN', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </TableCell>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(target)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#433228]" />
                RSM Assigned To Supervisors And Distributors
              </CardTitle>
              <CardDescription>
                Current month targets assigned by the RSM to both supervisors and distributors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rsmDelegatedTargets.length > 0 ? (
                <div>
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">Supervisor Targets</p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {rsmSupervisorTargetsCount}
                      </p>
                    </div>
                    <div className="rounded-lg border bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">Distributor Targets</p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {rsmDistributorTargetsCount}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {rsmDelegatedTargets.length} assigned target
                      {rsmDelegatedTargets.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Target For</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Primary Target</TableHead>
                        <TableHead className="text-right">Secondary Target</TableHead>
                        <TableHead>Assigned Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rsmDelegatedTargetsPagination.paginatedItems.map((target) => (
                        <TableRow key={target.id}>
                          <TableCell className="font-medium">
                            {formatRoleCategory(target.role)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {target.userName}
                          </TableCell>
                          <TableCell>
                            {new Date(`${target.month}-01`).toLocaleDateString('en-IN', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </TableCell>
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(target)}
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {rsmDelegatedTargets.length > 0 && (
                    <TablePaginationControls {...rsmDelegatedTargetsPagination} />
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No supervisor or distributor targets assigned by RSM for the current month.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
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
                    {availableFilterCategories.map((cat) => (
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

            {displayTargets.length > 0 ? (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {displayTargets.length} of {displayTargets.length} target
                    {displayTargets.length !== 1 ? 's' : ''}
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
                        <TableCell>
                          {new Date(`${target.month}-01`).toLocaleDateString('en-IN', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </TableCell>
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
                {displayTargets.length > 0 && (
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
      )}

      <Dialog
        open={showAssignDialog}
        onOpenChange={(open) => {
          setShowAssignDialog(open)
          if (!open) {
            setEditingTarget(null)
            if (isSupervisor) {
              setSelectedMemberType('')
              setSelectedShopId('')
              setSelectedPromoter(null)
            } else {
              setSelectedRole('')
            }
            setSelectedUserId('')
            setTargetData({
              primary: '',
              secondary: '',
              month: currentMonthValue,
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
                (isRSM
                  ? (!isEditingRsmSelfTarget && (!selectedRole || !selectedUserId))
                  : isSupervisor
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
