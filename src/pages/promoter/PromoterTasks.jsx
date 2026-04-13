import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
} from "recharts";
import { MOCK_PROMOTER_TARGETS } from "../../data/mockData";
import { Target, TrendingUp, AlertCircle } from "lucide-react";

const PromoterTasks = () => {
  const { user } = useSelector((state) => state.auth);

  // Mock data - in real app, fetch from Redux
  const targetsData = MOCK_PROMOTER_TARGETS;

  // Calculate days remaining in month
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = lastDayOfMonth.getDate() - today.getDate();

  // Calculate daily target requirement for balance
  const primaryDailyTarget =
    daysRemaining > 0
      ? Math.ceil(targetsData.primaryTarget.balance / daysRemaining)
      : 0;
  const secondaryDailyTarget =
    daysRemaining > 0
      ? Math.ceil(targetsData.secondaryTarget.balance / daysRemaining)
      : 0;

  // Target balance data for graph
  const targetBalanceData = [
    {
      name: "Primary Target",
      target: targetsData.primaryTarget.target,
      achieved: targetsData.primaryTarget.achieved,
      balance: targetsData.primaryTarget.balance,
    },
    {
      name: "Secondary Target",
      target: targetsData.secondaryTarget.target,
      achieved: targetsData.secondaryTarget.achieved,
      balance: targetsData.secondaryTarget.balance,
    },
  ];

  // Daily progress data (mock - showing last 7 days)
  const dailyProgressData = [
    { day: "Day 1", primary: 8500, secondary: 6200 },
    { day: "Day 2", primary: 9200, secondary: 6800 },
    { day: "Day 3", primary: 8800, secondary: 6500 },
    { day: "Day 4", primary: 9500, secondary: 7000 },
    { day: "Day 5", primary: 9000, secondary: 6600 },
    { day: "Day 6", primary: 9800, secondary: 7200 },
    { day: "Today", primary: 9200, secondary: 6800 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Target</h1>
        <p className="text-gray-600 mt-2">
          View your assigned targets and track progress
        </p>
      </div>

      {/* Primary Target Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Primary Target - Shop Purchase
          </CardTitle>
          <CardDescription>Target achieved as on date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Target</p>
              <p className="text-2xl font-bold text-gray-700">
                ₹{targetsData.primaryTarget.target.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Achieved</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{targetsData.primaryTarget.achieved.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Balance</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{targetsData.primaryTarget.balance.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Achievement %</p>
              <div className="flex items-center gap-2">
                <p
                  className={`text-2xl font-bold ${
                    targetsData.primaryTarget.percentage >= 80
                      ? "text-green-600"
                      : targetsData.primaryTarget.percentage >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {targetsData.primaryTarget.percentage}%
                </p>
                {targetsData.primaryTarget.percentage >= 80 && (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{targetsData.primaryTarget.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  targetsData.primaryTarget.percentage >= 80
                    ? "bg-green-600"
                    : targetsData.primaryTarget.percentage >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(targetsData.primaryTarget.percentage, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Daily Target Requirement */}
          {daysRemaining > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Daily Target Requirement
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    To achieve balance, you need to achieve{" "}
                    <strong>
                      ₹{primaryDailyTarget.toLocaleString("en-IN")}
                    </strong>{" "}
                    per day for the remaining{" "}
                    <strong>{daysRemaining} days</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary Target Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Secondary Target - MAP (Maximum Achievable Price)
          </CardTitle>
          <CardDescription>Target achieved as on date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Target</p>
              <p className="text-2xl font-bold text-gray-700">
                ₹{targetsData.secondaryTarget.target.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Achieved</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{targetsData.secondaryTarget.achieved.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Balance</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{targetsData.secondaryTarget.balance.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Achievement %</p>
              <div className="flex items-center gap-2">
                <p
                  className={`text-2xl font-bold ${
                    targetsData.secondaryTarget.percentage >= 80
                      ? "text-green-600"
                      : targetsData.secondaryTarget.percentage >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {targetsData.secondaryTarget.percentage.toFixed(2)}%
                </p>
                {targetsData.secondaryTarget.percentage >= 80 && (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{targetsData.secondaryTarget.percentage.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  targetsData.secondaryTarget.percentage >= 80
                    ? "bg-green-600"
                    : targetsData.secondaryTarget.percentage >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(targetsData.secondaryTarget.percentage, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Daily Target Requirement */}
          {daysRemaining > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-purple-800">
                    Daily Target Requirement
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    To achieve balance, you need to achieve{" "}
                    <strong>
                      ₹{secondaryDailyTarget.toLocaleString("en-IN")}
                    </strong>{" "}
                    per day for the remaining{" "}
                    <strong>{daysRemaining} days</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Overview Graph */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Balance to be Achieved - Overview</CardTitle>
          <CardDescription>
            Visual representation of target balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={targetBalanceData}>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                cursor={{ fill: "rgba(67, 50, 40, 0.1)" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
              <Bar
                dataKey="target"
                fill="#9ca3af"
                name="Target"
                radius={[8, 8, 0, 0]}
                barSize={50}
              />
              <Bar
                dataKey="achieved"
                fill="#433228"
                name="Achieved"
                radius={[8, 8, 0, 0]}
                barSize={50}
              />
              <Bar
                dataKey="balance"
                fill="#f59e0b"
                name="Balance"
                radius={[8, 8, 0, 0]}
                barSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Progress Graph */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Daily Progress Trend</CardTitle>
          <CardDescription>Last 7 days performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyProgressData}>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                cursor={{ stroke: "#433228", strokeWidth: 1 }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
              <Line
                type="monotone"
                dataKey="primary"
                stroke="#3b82f6"
                name="Primary Target"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="secondary"
                stroke="#8b5cf6"
                name="Secondary Target"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                Primary Target Summary
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-semibold">
                    ₹{targetsData.primaryTarget.target.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Achieved:</span>
                  <span className="font-semibold text-green-600">
                    ₹
                    {targetsData.primaryTarget.achieved.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-semibold text-orange-600">
                    ₹{targetsData.primaryTarget.balance.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-700 font-semibold">Progress:</span>
                  <span className="font-bold text-lg">
                    {targetsData.primaryTarget.percentage}%
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                Secondary Target Summary
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-semibold">
                    ₹
                    {targetsData.secondaryTarget.target.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Achieved:</span>
                  <span className="font-semibold text-green-600">
                    ₹
                    {targetsData.secondaryTarget.achieved.toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-semibold text-orange-600">
                    ₹
                    {targetsData.secondaryTarget.balance.toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-700 font-semibold">Progress:</span>
                  <span className="font-bold text-lg">
                    {targetsData.secondaryTarget.percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoterTasks;
