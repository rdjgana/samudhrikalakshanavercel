import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { ArrowUp, ArrowDown, Users, TrendingUp, Target, CheckCircle2, Clock } from 'lucide-react'
import { MOCK_SUPERVISOR_DASHBOARD } from '../../data/mockData'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  month: 'long',
  year: 'numeric',
})

const formatMonthLabel = (ym) => {
  if (!ym) return ''
  const [y, m] = ym.split('-').map(Number)
  if (!y || !m) return ym
  return MONTH_LABEL_FORMATTER.format(new Date(y, m - 1, 1))
}

const previousMonthKey = (ym) => {
  if (!ym) return ''
  const [y, m] = ym.split('-').map(Number)
  if (!y || !m) return ''
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const currentMonthKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const computeChangePct = (current, previous) => {
  if (!previous) return 0
  const diff = ((current - previous) / previous) * 100
  return Math.round(diff * 10) / 10
}

const SupervisorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(MOCK_SUPERVISOR_DASHBOARD)
  const promotersPagination = useTablePagination(dashboardData.promoters)

  const monthlySales = dashboardData.performance.monthlyAsOnDateSales ?? {}
  const currentMonth = currentMonthKey()
  const sortedMonths = Object.keys(monthlySales).sort()
  const activeMonth = monthlySales[currentMonth]
    ? currentMonth
    : sortedMonths[sortedMonths.length - 1] ?? currentMonth
  const activeMonthSales = monthlySales[activeMonth]
  const previousMonth = previousMonthKey(activeMonth)
  const previousMonthSales = monthlySales[previousMonth]

  const asOnDatePrimarySales =
    activeMonthSales?.primary ??
    dashboardData.performance.asOnDatePrimarySales ??
    dashboardData.performance.todayPurchase
  const asOnDateSecondarySales =
    activeMonthSales?.secondary ??
    dashboardData.performance.asOnDateSecondarySales ??
    dashboardData.performance.todaySales

  const asOnDatePrimaryChange = previousMonthSales
    ? computeChangePct(asOnDatePrimarySales, previousMonthSales.primary)
    : dashboardData.performance.asOnDatePrimaryChange ??
      dashboardData.performance.purchaseChange
  const asOnDateSecondaryChange = previousMonthSales
    ? computeChangePct(asOnDateSecondarySales, previousMonthSales.secondary)
    : dashboardData.performance.asOnDateSecondaryChange ??
      dashboardData.performance.salesChange

  const activeMonthLabel = formatMonthLabel(activeMonth)
  const comparisonLabel = previousMonthSales
    ? `vs ${formatMonthLabel(previousMonth)}`
    : 'vs previous month'
  const assignedTargetAmount =
    dashboardData.targetStatus?.assignedTargetAmount ?? dashboardData.targetStatus?.assignedTargets ?? 0
  const completedTargetAmount =
    dashboardData.targetStatus?.completedTargetAmount ?? dashboardData.targetStatus?.completedTargets ?? 0
  const pendingTargetAmount =
    dashboardData.targetStatus?.pendingTargetAmount ??
    dashboardData.targetStatus?.pendingTargets ??
    Math.max(assignedTargetAmount - completedTargetAmount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor team performance and track daily metrics</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yesterday's Primary Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardData.performance.yesterdayPrimarySales.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-xs mt-1">
              {dashboardData.performance.primaryChange > 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={dashboardData.performance.primaryChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(dashboardData.performance.primaryChange)}%
              </span>
              <span className="text-gray-500 ml-1">vs previous day</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yesterday's Secondary Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardData.performance.yesterdaySecondarySales.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-xs mt-1">
              {dashboardData.performance.secondaryChange > 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={dashboardData.performance.secondaryChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(dashboardData.performance.secondaryChange)}%
              </span>
              <span className="text-gray-500 ml-1">vs previous day</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">As-on Date Primary Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{asOnDatePrimarySales.toLocaleString('en-IN')}</div>
            <p className="text-xs text-gray-500 mt-1">{activeMonthLabel}</p>
            <div className="flex items-center text-xs mt-1">
              {asOnDatePrimaryChange > 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={asOnDatePrimaryChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(asOnDatePrimaryChange)}%
              </span>
              <span className="text-gray-500 ml-1">{comparisonLabel}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">As-on Date Secondary Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{asOnDateSecondarySales.toLocaleString('en-IN')}</div>
            <p className="text-xs text-gray-500 mt-1">{activeMonthLabel}</p>
            <div className="flex items-center text-xs mt-1">
              {asOnDateSecondaryChange > 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={asOnDateSecondaryChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(asOnDateSecondaryChange)}%
              </span>
              <span className="text-gray-500 ml-1">{comparisonLabel}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Promoters</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.teamStatus.activePromoters}</div>
            <p className="text-xs text-gray-500 mt-1">Working today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Promoters</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.teamStatus.inactivePromoters}</div>
            <p className="text-xs text-gray-500 mt-1">Not working today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardData.teamStatus.totalPromoters}</div>
            <p className="text-xs text-gray-500 mt-1">Promoters assigned</p>
          </CardContent>
        </Card>
      </div>

      {/* Target Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Target</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{assignedTargetAmount.toLocaleString('en-IN')}</div>
            <p className="text-xs text-gray-500 mt-1">Total target amount assigned to the team</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Target</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{completedTargetAmount.toLocaleString('en-IN')}</div>
            <p className="text-xs text-gray-500 mt-1">Target amount achieved successfully</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Target</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{pendingTargetAmount.toLocaleString('en-IN')}</div>
            <p className="text-xs text-gray-500 mt-1">Remaining target amount in progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members Status</CardTitle>
          <CardDescription>Real-time status of all assigned promoters</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promoter Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Today's Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotersPagination.paginatedItems.map((promoter) => (
                <TableRow key={promoter.id}>
                  <TableCell className="font-medium">{promoter.name}</TableCell>
                  <TableCell>{promoter.code}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      promoter.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {promoter.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {promoter.todaySales > 0 ? (
                      <span className="font-semibold text-green-600">
                        ₹{promoter.todaySales.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-gray-400">₹0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {dashboardData.promoters.length > 0 && <TablePaginationControls {...promotersPagination} />}
        </CardContent>
      </Card>
    </div>
  )
}

export default SupervisorDashboard
