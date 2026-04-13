import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { ArrowUp, ArrowDown, Users, TrendingUp } from 'lucide-react'
import { MOCK_SUPERVISOR_DASHBOARD } from '../../data/mockData'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'

const SupervisorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(MOCK_SUPERVISOR_DASHBOARD)
  const promotersPagination = useTablePagination(dashboardData.promoters)

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
            <CardTitle className="text-sm font-medium">Today's Purchase</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardData.performance.todayPurchase.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-xs mt-1">
              {dashboardData.performance.purchaseChange > 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={dashboardData.performance.purchaseChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(dashboardData.performance.purchaseChange)}%
              </span>
              <span className="text-gray-500 ml-1">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardData.performance.todaySales.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-xs mt-1">
              {dashboardData.performance.salesChange > 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={dashboardData.performance.salesChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(dashboardData.performance.salesChange)}%
              </span>
              <span className="text-gray-500 ml-1">vs yesterday</span>
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
