import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardData } from '../../store/slices/dashboardSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const HRManagerDashboard = () => {
  const dispatch = useDispatch()
  const { previousMonth, currentMonth, yesterday, teamStatus, loading } = useSelector(
    (state) => state.dashboard
  )

  useEffect(() => {
    dispatch(fetchDashboardData())
  }, [dispatch])

  const previousMonthData = [
    {
      name: 'Primary',
      value: previousMonth.primary.value,
      percentage: previousMonth.primary.percentage,
    },
    {
      name: 'Secondary',
      value: previousMonth.secondary.value,
      percentage: previousMonth.secondary.percentage,
    },
  ]

  const currentMonthData = [
    {
      name: 'Primary',
      target: currentMonth.primary.target,
      achieved: currentMonth.primary.achieved,
    },
    {
      name: 'Secondary',
      target: currentMonth.secondary.target,
      achieved: currentMonth.secondary.achieved,
    },
  ]

  const teamStatusData = [
    { role: 'ASM', active: teamStatus.asm.active, inactive: teamStatus.asm.inactive },
    { role: 'SO', active: teamStatus.so.active, inactive: teamStatus.so.inactive },
    { role: 'Supervisor', active: teamStatus.supervisor.active, inactive: teamStatus.supervisor.inactive },
    { role: 'Trainer', active: teamStatus.trainer.active, inactive: teamStatus.trainer.inactive },
    { role: 'Promoter', active: teamStatus.promoter.active, inactive: teamStatus.promoter.inactive },
  ]

  // Pie chart data for Current Month Sales Distribution
  const salesDistributionData = [
    { name: 'Primary', value: currentMonth.primary.achieved, color: '#433228' },
    { name: 'Secondary', value: currentMonth.secondary.achieved, color: '#9ca3af' },
  ]

  const totalSales = currentMonth.primary.achieved + currentMonth.secondary.achieved

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">HR Manager / Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Final approvals, HR oversight, incentive control, and inventory governance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Final Approval Authority</CardTitle>
            <CardDescription>Salary, expenses, and incentives must be approved before Accounts processing</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">HR Oversight & Incentives</CardTitle>
            <CardDescription>Review HR-generated approvals and adjust monthly incentive products or amounts</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900">Content & Inventory Control</CardTitle>
            <CardDescription>Manage product photos, MRP, banners, factory stock, blocked items, and bill edits</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Yesterday's Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Yesterday's Primary Achieved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{yesterday.primary}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Yesterday's Secondary Achieved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{yesterday.secondary}</div>
          </CardContent>
        </Card>
      </div>

      {/* Previous Month Performance */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Previous Month Performance</CardTitle>
          <CardDescription className="text-sm">Primary and Secondary sales achieved</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={previousMonthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                cursor={{ fill: 'rgba(67, 50, 40, 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                fill="#433228" 
                radius={[8, 8, 0, 0]}
                barSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Primary</p>
              <p className="text-xl font-semibold text-gray-900">
                {previousMonth.primary.value} <span className="text-sm font-normal text-gray-500">({previousMonth.primary.percentage}%)</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Secondary</p>
              <p className="text-xl font-semibold text-gray-900">
                {previousMonth.secondary.value} <span className="text-sm font-normal text-gray-500">({previousMonth.secondary.percentage}%)</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Month Sales Distribution - Pie Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Current Month Sales Distribution</CardTitle>
          <CardDescription className="text-sm">Primary vs Secondary sales achieved</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-[#433228]"></div>
                <p className="text-sm font-medium text-gray-700">Primary</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{currentMonth.primary.achieved.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500 mt-1">
                {totalSales > 0 ? ((currentMonth.primary.achieved / totalSales) * 100).toFixed(1) : 0}% of total
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-[#9ca3af]"></div>
                <p className="text-sm font-medium text-gray-700">Secondary</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{currentMonth.secondary.achieved.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500 mt-1">
                {totalSales > 0 ? ((currentMonth.secondary.achieved / totalSales) * 100).toFixed(1) : 0}% of total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Month Target vs Achieved */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Current Month Target vs Achieved</CardTitle>
          <CardDescription className="text-sm">Primary and Secondary targets</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={currentMonthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#9ca3af" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
                dot={{ fill: '#9ca3af', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="achieved" 
                stroke="#433228" 
                strokeWidth={3}
                name="Achieved"
                dot={{ fill: '#433228', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Primary</p>
              <p className="text-xl font-semibold text-gray-900">
                {currentMonth.primary.achieved} <span className="text-sm font-normal text-gray-500">/ {currentMonth.primary.target}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">({currentMonth.primary.percentage}%)</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Secondary</p>
              <p className="text-xl font-semibold text-gray-900">
                {currentMonth.secondary.achieved} <span className="text-sm font-normal text-gray-500">/ {currentMonth.secondary.target}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">({currentMonth.secondary.percentage}%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Team Status (Current Day)</CardTitle>
          <CardDescription className="text-sm">Present and absent team members</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={teamStatusData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="role" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                cursor={{ fill: 'rgba(67, 50, 40, 0.1)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Bar 
                dataKey="active" 
                fill="#433228" 
                name="Present"
                radius={[8, 8, 0, 0]}
                barSize={40}
              />
              <Bar 
                dataKey="inactive" 
                fill="#ef4444" 
                name="Absent"
                radius={[8, 8, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6 pt-4 border-t border-gray-100">
            {teamStatusData.map((item) => (
              <div key={item.role} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">{item.role}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {item.active} <span className="text-sm font-normal text-gray-500">/ {item.active + item.inactive}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Present</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HRManagerDashboard
