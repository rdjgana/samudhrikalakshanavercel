import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Award, IndianRupee } from "lucide-react";
import { useTablePagination } from "../../hooks/useTablePagination";
import TablePaginationControls from "../../components/common/TablePaginationControls";

// Mock data
const MOCK_PROMOTER_SALARY = {
  fixedSalary: 18000,
  currentSlab: "Slab 1",
  nextSlab: "Slab 2",
  nextSlabRequirement: 20000,
  incentiveEarned: 12500,
  incentiveType: "Local",
  totalIncentive: 12500,
};

const MOCK_INCENTIVE_BREAKDOWN = [
  { period: "Week 1", amount: 3200, type: "Local" },
  { period: "Week 2", amount: 2800, type: "Local" },
  { period: "Week 3", amount: 3500, type: "Local" },
  { period: "Week 4", amount: 3000, type: "Local" },
];

const PromoterIncentive = () => {
  const salaryData = MOCK_PROMOTER_SALARY;
  const incentiveBreakdownPagination = useTablePagination(MOCK_INCENTIVE_BREAKDOWN);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Salary/Incentive</h1>
        <p className="text-gray-600 mt-2">
          View your salary and incentive details
        </p>
      </div>

      {/* Summary - Total Salary and Total Incentive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Salary</p>
                <p className="text-3xl font-bold text-blue-700">
                  ₹{salaryData.fixedSalary.toLocaleString("en-IN")}
                </p>
              </div>
              <IndianRupee className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Incentive</p>
                <p className="text-3xl font-bold text-green-700">
                  ₹{salaryData.totalIncentive.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Type: {salaryData.incentiveType}
                </p>
              </div>
              <Award className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Salary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            My Salary
          </CardTitle>
          <CardDescription>Current month salary breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Fixed Salary</p>
                <p className="text-2xl font-bold text-[#433228]">
                  ₹{salaryData.fixedSalary.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Slab</p>
                <p className="text-lg font-semibold">
                  {salaryData.currentSlab}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Next Slab</p>
                <p className="text-lg font-semibold">{salaryData.nextSlab}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Requirement: ₹
                  {salaryData.nextSlabRequirement.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incentive Earned */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Incentive Earned = {salaryData.incentiveType}
          </CardTitle>
          <CardDescription>Total incentive earned this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Total Incentive Earned
                  </p>
                  <p className="text-3xl font-bold text-green-700 mt-1">
                    ₹{salaryData.totalIncentive.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Type: {salaryData.incentiveType}
                  </p>
                </div>
                <Award className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Incentive Breakdown</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incentiveBreakdownPagination.paginatedItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.period}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{item.amount.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePaginationControls {...incentiveBreakdownPagination} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoterIncentive;
