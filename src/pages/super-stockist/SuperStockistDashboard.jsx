import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Package, ShoppingCart, FileText, User } from 'lucide-react'

const SuperStockistDashboard = () => {
  const { user } = useSelector((state) => state.auth)

  // Mock data for dashboard
  const currentTurnover = 12500000 // Current Turnover for 25-26
  const currentMonthTurnover = 1050000 // Current Month Turnover
  const lastMonthSales = 980000 // Last Month's Sales

  // Mock performance data for graph
  const performanceData = [
    { month: 'Jan', sales: 850000 },
    { month: 'Feb', sales: 920000 },
    { month: 'Mar', sales: 880000 },
    { month: 'Apr', sales: 950000 },
    { month: 'May', sales: 980000 },
    { month: 'Jun', sales: 1020000 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Super Stockist Dashboard</h1>
        <p className="text-gray-600 mt-2">Financial overview and performance tracking</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#433228]" />
              Current Turnover (25-26)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#433228]">
              ₹{currentTurnover.toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-gray-600 mt-2">Year-to-date turnover</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Current Month Turnover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ₹{currentMonthTurnover.toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })} turnover
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#433228]" />
              Last Month's Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#433228]">
              ₹{lastMonthSales.toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-gray-600 mt-2">Previous month performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Monthly sales performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#433228"
                strokeWidth={2}
                name="Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


    </div>
  )
}

export default SuperStockistDashboard
