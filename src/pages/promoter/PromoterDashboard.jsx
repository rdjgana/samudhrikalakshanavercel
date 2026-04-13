import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { MOCK_PROMOTER_DASHBOARD, MOCK_PROMOTER_TARGETS } from '../../data/mockData'
import { TrendingUp, TrendingDown, Calendar, Award, Target } from 'lucide-react'

const PromoterDashboard = () => {
  const { user } = useSelector((state) => state.auth)

  // Mock data - in real app, fetch from Redux
  const dashboardData = MOCK_PROMOTER_DASHBOARD
  const targetsData = MOCK_PROMOTER_TARGETS

  // Previous month sales data for graph
  const previousMonthData = [
    {
      name: 'Sales Achieved',
      value: dashboardData.previousMonth.salesAchieved,
      target: dashboardData.previousMonth.target,
    },
  ]

  // Current month achievement data
  const currentMonthData = [
    {
      name: 'Achieved',
      value: dashboardData.currentMonth.achieved,
      target: dashboardData.currentMonth.target,
    },
  ]

  // Attendance data for pie chart
  const attendanceData = [
    { name: 'Present', value: dashboardData.attendance.daysPresent, color: '#10b981' },
    { name: 'Absent', value: dashboardData.attendance.totalDays - dashboardData.attendance.daysPresent, color: '#ef4444' },
  ]

  // Target balance data for graph
  const targetBalanceData = [
    {
      name: 'Primary Target',
      target: targetsData.primaryTarget.target,
      achieved: targetsData.primaryTarget.achieved,
      balance: targetsData.primaryTarget.balance,
    },
    {
      name: 'Secondary Target',
      target: targetsData.secondaryTarget.target,
      achieved: targetsData.secondaryTarget.achieved,
      balance: targetsData.secondaryTarget.balance,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Promoter Dashboard</h1>
        {user?.shopName ? (
          <p className="text-gray-600 mt-2">
            Welcome, {user?.name} - {user?.shopName}
          </p>
        ) : (
          <p className="text-red-500 mt-2 flex items-center gap-2">
            Please select a Shop from the header to view statistics
          </p>
        )}
      </div>

      {!user?.shopId ? (
        <Card className="border-2 border-dashed border-gray-300 p-12 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <Target className="h-12 w-12 text-gray-400" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-700">No Shop Selected</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                You must select an active shop from the shop selector in the navigation bar to see your performance metrics and targets.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Month Target Achievement */}
          <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Current Month Target Achievement</CardTitle>
          <CardDescription>Progress as on date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Target</p>
              <p className="text-xl font-bold text-gray-700">
                ₹{dashboardData.currentMonth.target.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Achieved</p>
              <p className="text-xl font-bold text-[#433228]">
                ₹{dashboardData.currentMonth.achieved.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Achievement %</p>
              <p className={`text-xl font-bold ${
                dashboardData.currentMonth.achievementPercentage >= 80 
                  ? 'text-green-600' 
                  : dashboardData.currentMonth.achievementPercentage >= 60 
                  ? 'text-yellow-600' 
                  : 'text-red-600'
              }`}>
                {dashboardData.currentMonth.achievementPercentage.toFixed(2)}%
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Days Elapsed</p>
              <p className="text-xl font-bold text-gray-700">
                {dashboardData.currentMonth.daysElapsed} / {dashboardData.currentMonth.daysInMonth}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{dashboardData.currentMonth.achievementPercentage.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  dashboardData.currentMonth.achievementPercentage >= 80 
                    ? 'bg-green-600' 
                    : dashboardData.currentMonth.achievementPercentage >= 60 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(dashboardData.currentMonth.achievementPercentage, 100)}%` }}
              />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200} className="mt-6">
            <LineChart data={currentMonthData}>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
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
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                cursor={{ stroke: '#433228', strokeWidth: 1 }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="achieved" 
                stroke="#433228" 
                name="Achieved" 
                strokeWidth={3}
                dot={{ fill: '#433228', r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#9ca3af" 
                name="Target" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ fill: '#9ca3af', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Previous Month Sales */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Previous Month Sales</CardTitle>
          <CardDescription>Sales achieved in previous month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Sales Achieved</p>
              <p className="text-2xl font-bold text-[#433228]">
                ₹{dashboardData.previousMonth.salesAchieved.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Target</p>
              <p className="text-2xl font-bold text-gray-700">
                ₹{dashboardData.previousMonth.target.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Achievement</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${
                  dashboardData.previousMonth.achievementPercentage >= 100 
                    ? 'text-green-600' 
                    : dashboardData.previousMonth.achievementPercentage >= 80 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
                }`}>
                  {dashboardData.previousMonth.achievementPercentage}%
                </p>
                {dashboardData.previousMonth.achievementPercentage >= 100 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={previousMonthData}>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
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
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                cursor={{ fill: 'rgba(67, 50, 40, 0.1)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar dataKey="value" fill="#433228" name="Sales Achieved" radius={[8, 8, 0, 0]} barSize={60} />
              <Bar dataKey="target" fill="#9ca3af" name="Target" radius={[8, 8, 0, 0]} barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Attendance & Incentive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Attendance
            </CardTitle>
            <CardDescription>Current month attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Days Present</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardData.attendance.daysPresent}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Total Days</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {dashboardData.attendance.totalDays}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Attendance %</span>
                  <span className="font-semibold">{dashboardData.attendance.attendancePercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${dashboardData.attendance.attendancePercentage}%` }}
                  />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Incentive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Incentive Achieved
            </CardTitle>
            <CardDescription>Current month incentive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Incentive Earned</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{dashboardData.incentive.earned.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Target</p>
                  <p className="text-2xl font-bold text-gray-700">
                    ₹{dashboardData.incentive.target.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Achievement %</span>
                  <span className="font-semibold">{dashboardData.incentive.percentage.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${Math.min(dashboardData.incentive.percentage, 100)}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Balance to Achieve</span>
                  <span className="text-lg font-bold text-orange-600">
                    ₹{(dashboardData.incentive.target - dashboardData.incentive.earned).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Balance Graph */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Target Balance Overview
          </CardTitle>
          <CardDescription>Primary and Secondary target balance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={targetBalanceData}>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
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
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                cursor={{ fill: 'rgba(67, 50, 40, 0.1)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar dataKey="target" fill="#9ca3af" name="Target" radius={[8, 8, 0, 0]} barSize={50} />
              <Bar dataKey="achieved" fill="#433228" name="Achieved" radius={[8, 8, 0, 0]} barSize={50} />
              <Bar dataKey="balance" fill="#f59e0b" name="Balance" radius={[8, 8, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Primary Target (Shop Purchase)</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span className="font-bold" style={{ fontSize: 'calc(1rem + 5px)' }}>₹{targetsData.primaryTarget.target.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Achieved:</span>
                  <span className="font-semibold text-green-600">₹{targetsData.primaryTarget.achieved.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance:</span>
                  <span className="font-semibold text-orange-600">₹{targetsData.primaryTarget.balance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span>Progress:</span>
                  <span className="font-bold">{targetsData.primaryTarget.percentage}%</span>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Secondary Target (MAP)</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span className="font-bold" style={{ fontSize: 'calc(1rem + 5px)' }}>₹{targetsData.secondaryTarget.target.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Achieved:</span>
                  <span className="font-semibold text-green-600">₹{targetsData.secondaryTarget.achieved.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance:</span>
                  <span className="font-semibold text-orange-600">₹{targetsData.secondaryTarget.balance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span>Progress:</span>
                  <span className="font-bold">{targetsData.secondaryTarget.percentage.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )}
</div>
  )
}

export default PromoterDashboard
