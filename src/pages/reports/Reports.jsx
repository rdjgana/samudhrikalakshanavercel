import { useState } from "react";
import { useTablePagination } from "../../hooks/useTablePagination";
import TablePaginationControls from "../../components/common/TablePaginationControls";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  MOCK_TARGET_VS_SALES_CONSOLIDATED,
  MOCK_TARGET_VS_SALES_CATEGORY_WISE,
  MOCK_TARGET_VS_SALES_EMPLOYEE_WISE,
  MOCK_ATTENDANCE_REPORT,
  MOCK_INCENTIVES_REPORT,
  MOCK_SALARY_REPORT,
  MOCK_EXPENSES_REPORT,
  MOCK_NEW_SHOPS_REPORT,
} from "../../data/mockData";

const Reports = () => {
  // Target vs Sales Filters
  const [targetVsSalesFilters, setTargetVsSalesFilters] = useState({
    startDate: "",
    endDate: "",
    category: "consolidated", // consolidated, category-wise, employee-wise
    type: "both", // both, primary, secondary
    entity: "all", // all, ss, distributor, shop
    employeeRole: "all", // all, asm, so, bdm, supervisor, promoter
  });

  // Attendance Filters
  const [attendanceFilters, setAttendanceFilters] = useState({
    startDate: "",
    endDate: "",
  });

  // Incentives Filters
  const [incentivesFilters, setIncentivesFilters] = useState({
    startDate: "",
    endDate: "",
  });

  // Salary Filters
  const [salaryFilters, setSalaryFilters] = useState({
    startDate: "",
    endDate: "",
  });

  // Expenses Filters
  const [expensesFilters, setExpensesFilters] = useState({
    startDate: "",
    endDate: "",
  });

  // New Shops Filters
  const [newShopsFilters, setNewShopsFilters] = useState({
    startDate: "",
    endDate: "",
  });

  // Get Target vs Sales Data based on category filter
  const getTargetVsSalesData = () => {
    if (targetVsSalesFilters.category === "consolidated") {
      return MOCK_TARGET_VS_SALES_CONSOLIDATED;
    } else if (targetVsSalesFilters.category === "category-wise") {
      return MOCK_TARGET_VS_SALES_CATEGORY_WISE;
    } else if (targetVsSalesFilters.category === "employee-wise") {
      return MOCK_TARGET_VS_SALES_EMPLOYEE_WISE;
    }
    return [];
  };

  const [targetVsSalesData, setTargetVsSalesData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [incentivesData, setIncentivesData] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [expensesData, setExpensesData] = useState(null);
  const [newShopsData, setNewShopsData] = useState(null);

  const targetVsSalesPagination = useTablePagination(targetVsSalesData ?? []);
  const attendancePagination = useTablePagination(attendanceData ?? []);
  const incentivesPagination = useTablePagination(incentivesData ?? []);
  const salaryPagination = useTablePagination(salaryData ?? []);
  const expensesPagination = useTablePagination(expensesData ?? []);
  const newShopsPagination = useTablePagination(newShopsData ?? []);

  const handleGenerateTargetVsSales = () => {
    if (!targetVsSalesFilters.startDate || !targetVsSalesFilters.endDate) {
      alert("Please select date range");
      return;
    }
    setTargetVsSalesData(getTargetVsSalesData());
  };

  const handleGenerateAttendance = () => {
    if (!attendanceFilters.startDate || !attendanceFilters.endDate) {
      alert("Please select date range");
      return;
    }
    setAttendanceData(MOCK_ATTENDANCE_REPORT);
  };

  const handleGenerateIncentives = () => {
    if (!incentivesFilters.startDate || !incentivesFilters.endDate) {
      alert("Please select date range");
      return;
    }
    setIncentivesData(MOCK_INCENTIVES_REPORT);
  };

  const handleGenerateSalary = () => {
    if (!salaryFilters.startDate || !salaryFilters.endDate) {
      alert("Please select date range");
      return;
    }
    setSalaryData(MOCK_SALARY_REPORT);
  };

  const handleGenerateExpenses = () => {
    if (!expensesFilters.startDate || !expensesFilters.endDate) {
      alert("Please select date range");
      return;
    }
    setExpensesData(MOCK_EXPENSES_REPORT);
  };

  const handleGenerateNewShops = () => {
    if (!newShopsFilters.startDate || !newShopsFilters.endDate) {
      alert("Please select date range");
      return;
    }
    setNewShopsData(MOCK_NEW_SHOPS_REPORT);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">KPI Reports</h1>
        <p className="text-gray-600 mt-2">
          Track performance across various metrics and analyze data
        </p>
      </div>

      <Tabs defaultValue="target-vs-sales" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="target-vs-sales">Target vs Sales</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="incentives">Incentives</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="new-shops">New Shops</TabsTrigger>
        </TabsList>

        {/* Target vs Sales Report */}
        <TabsContent value="target-vs-sales">
          <Card>
            <CardHeader>
              <CardTitle>Target vs Sales Report</CardTitle>
              <CardDescription>
                View target vs sales performance with Consolidated,
                Category-wise, or Employee-wise data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={targetVsSalesFilters.startDate}
                    onChange={(e) =>
                      setTargetVsSalesFilters({
                        ...targetVsSalesFilters,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={targetVsSalesFilters.endDate}
                    onChange={(e) =>
                      setTargetVsSalesFilters({
                        ...targetVsSalesFilters,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={targetVsSalesFilters.category}
                    onChange={(e) =>
                      setTargetVsSalesFilters({
                        ...targetVsSalesFilters,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="consolidated">Consolidated</option>
                    <option value="category-wise">Category-wise</option>
                    <option value="employee-wise">Employee-wise</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={targetVsSalesFilters.type}
                    onChange={(e) =>
                      setTargetVsSalesFilters({
                        ...targetVsSalesFilters,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="both">Both Primary & Secondary</option>
                    <option value="primary">Primary Only</option>
                    <option value="secondary">Secondary Only</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Entity</Label>
                  <Select
                    value={targetVsSalesFilters.entity}
                    onChange={(e) =>
                      setTargetVsSalesFilters({
                        ...targetVsSalesFilters,
                        entity: e.target.value,
                      })
                    }
                  >
                    <option value="all">All Entities</option>
                    <option value="ss">Super Stockists (SS)</option>
                    <option value="distributor">Distributors</option>
                    <option value="shop">Shops</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Employee Role</Label>
                  <Select
                    value={targetVsSalesFilters.employeeRole}
                    onChange={(e) =>
                      setTargetVsSalesFilters({
                        ...targetVsSalesFilters,
                        employeeRole: e.target.value,
                      })
                    }
                  >
                    <option value="all">All Roles</option>
                    <option value="asm">ASM</option>
                    <option value="so">SO</option>
                    <option value="bdm">BDM</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="promoter">Promoter</option>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleGenerateTargetVsSales}
                className="bg-[#433228] hover:bg-[#5a4238]"
              >
                Generate Report
              </Button>

              {targetVsSalesData && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                      Report Period:{" "}
                      {new Date(
                        targetVsSalesFilters.startDate,
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        targetVsSalesFilters.endDate,
                      ).toLocaleDateString()}
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Type</TableHead>
                        {targetVsSalesFilters.type === "both" ||
                        targetVsSalesFilters.type === "primary" ? (
                          <>
                            <TableHead>Primary Target</TableHead>
                            <TableHead>Primary Achieved</TableHead>
                            <TableHead>Primary %</TableHead>
                          </>
                        ) : null}
                        {targetVsSalesFilters.type === "both" ||
                        targetVsSalesFilters.type === "secondary" ? (
                          <>
                            <TableHead>Secondary Target</TableHead>
                            <TableHead>Secondary Achieved</TableHead>
                            <TableHead>Secondary %</TableHead>
                          </>
                        ) : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {targetVsSalesPagination.paginatedItems.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {row.entity}
                          </TableCell>
                          <TableCell>{row.entityType}</TableCell>
                          {targetVsSalesFilters.type === "both" ||
                          targetVsSalesFilters.type === "primary" ? (
                            <>
                              <TableCell>
                                ₹{row.primaryTarget.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell>
                                ₹{row.primaryAchieved.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    row.primaryPercentage >= 80
                                      ? "bg-green-100 text-green-800"
                                      : row.primaryPercentage >= 60
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {row.primaryPercentage.toFixed(1)}%
                                </span>
                              </TableCell>
                            </>
                          ) : null}
                          {targetVsSalesFilters.type === "both" ||
                          targetVsSalesFilters.type === "secondary" ? (
                            <>
                              <TableCell>
                                ₹{row.secondaryTarget.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell>
                                ₹{row.secondaryAchieved.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    row.secondaryPercentage >= 80
                                      ? "bg-green-100 text-green-800"
                                      : row.secondaryPercentage >= 60
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {row.secondaryPercentage.toFixed(1)}%
                                </span>
                              </TableCell>
                            </>
                          ) : null}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {targetVsSalesData.length > 0 && (
                    <TablePaginationControls {...targetVsSalesPagination} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Report */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Report</CardTitle>
              <CardDescription>
                Category-wise attendance for ASMs and SOs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={attendanceFilters.startDate}
                    onChange={(e) =>
                      setAttendanceFilters({
                        ...attendanceFilters,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={attendanceFilters.endDate}
                    onChange={(e) =>
                      setAttendanceFilters({
                        ...attendanceFilters,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerateAttendance}
                className="bg-[#433228] hover:bg-[#5a4238]"
              >
                Generate Report
              </Button>

              {attendanceData && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                      Report Period:{" "}
                      {new Date(
                        attendanceFilters.startDate,
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(attendanceFilters.endDate).toLocaleDateString()}
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Days Present</TableHead>
                        <TableHead>Days Absent</TableHead>
                        <TableHead>Total Days</TableHead>
                        <TableHead>Attendance %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendancePagination.paginatedItems.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {row.employee}
                          </TableCell>
                          <TableCell>{row.role}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell>{row.daysPresent}</TableCell>
                          <TableCell>{row.daysAbsent}</TableCell>
                          <TableCell>{row.totalDays}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                row.attendancePercentage >= 90
                                  ? "bg-green-100 text-green-800"
                                  : row.attendancePercentage >= 75
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {row.attendancePercentage}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {attendanceData.length > 0 && (
                    <TablePaginationControls {...attendancePagination} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incentives Report */}
        <TabsContent value="incentives">
          <Card>
            <CardHeader>
              <CardTitle>Incentives Report</CardTitle>
              <CardDescription>
                Category-wise detailed incentives report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={incentivesFilters.startDate}
                    onChange={(e) =>
                      setIncentivesFilters({
                        ...incentivesFilters,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={incentivesFilters.endDate}
                    onChange={(e) =>
                      setIncentivesFilters({
                        ...incentivesFilters,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerateIncentives}
                className="bg-[#433228] hover:bg-[#5a4238]"
              >
                Generate Report
              </Button>

              {incentivesData && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                      Report Period:{" "}
                      {new Date(
                        incentivesFilters.startDate,
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(incentivesFilters.endDate).toLocaleDateString()}
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Target Achieved %</TableHead>
                        <TableHead>Incentive Amount</TableHead>
                        <TableHead>Bonus Amount</TableHead>
                        <TableHead>Total Incentive</TableHead>
                        <TableHead>Employees Eligible</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incentivesPagination.paginatedItems.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {row.category}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                row.targetAchieved >= 80
                                  ? "bg-green-100 text-green-800"
                                  : row.targetAchieved >= 60
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {row.targetAchieved}%
                            </span>
                          </TableCell>
                          <TableCell>
                            ₹{row.incentiveAmount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            ₹{row.bonusAmount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{row.totalIncentive.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>{row.employeesEligible}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {incentivesData.length > 0 && (
                    <TablePaginationControls {...incentivesPagination} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Report */}
        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle>Salary Report</CardTitle>
              <CardDescription>Category-wise salary report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={salaryFilters.startDate}
                    onChange={(e) =>
                      setSalaryFilters({
                        ...salaryFilters,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={salaryFilters.endDate}
                    onChange={(e) =>
                      setSalaryFilters({
                        ...salaryFilters,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerateSalary}
                className="bg-[#433228] hover:bg-[#5a4238]"
              >
                Generate Report
              </Button>

              {salaryData && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                      Report Period:{" "}
                      {new Date(salaryFilters.startDate).toLocaleDateString()} -{" "}
                      {new Date(salaryFilters.endDate).toLocaleDateString()}
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Total Employees</TableHead>
                        <TableHead>Total Salary</TableHead>
                        <TableHead>Average Salary</TableHead>
                        <TableHead>Highest Salary</TableHead>
                        <TableHead>Lowest Salary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salaryPagination.paginatedItems.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {row.category}
                          </TableCell>
                          <TableCell>{row.totalEmployees}</TableCell>
                          <TableCell className="font-semibold">
                            ₹{row.totalSalary.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            ₹{row.averageSalary.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            ₹{row.highestSalary.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            ₹{row.lowestSalary.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {salaryData.length > 0 && (
                    <TablePaginationControls {...salaryPagination} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Report */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expenses Report</CardTitle>
              <CardDescription>
                Category-wise expense claims and approvals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={expensesFilters.startDate}
                    onChange={(e) =>
                      setExpensesFilters({
                        ...expensesFilters,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={expensesFilters.endDate}
                    onChange={(e) =>
                      setExpensesFilters({
                        ...expensesFilters,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerateExpenses}
                className="bg-[#433228] hover:bg-[#5a4238]"
              >
                Generate Report
              </Button>

              {expensesData && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                      Report Period:{" "}
                      {new Date(expensesFilters.startDate).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(expensesFilters.endDate).toLocaleDateString()}
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Total Claims</TableHead>
                        <TableHead>Total Expenses</TableHead>
                        <TableHead>Approved</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Avg Claim</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expensesPagination.paginatedItems.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {row.category}
                          </TableCell>
                          <TableCell>{row.totalClaims}</TableCell>
                          <TableCell className="font-semibold">
                            ₹{row.totalExpenses.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            ₹{row.approvedAmount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            ₹{row.pendingAmount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            ₹{row.averageClaim.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {expensesData.length > 0 && (
                    <TablePaginationControls {...expensesPagination} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Shops Activated Report */}
        <TabsContent value="new-shops">
          <Card>
            <CardHeader>
              <CardTitle>New Shops Activated Report</CardTitle>
              <CardDescription>
                Category-wise new shops activation tracking with work plan date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={newShopsFilters.startDate}
                    onChange={(e) =>
                      setNewShopsFilters({
                        ...newShopsFilters,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={newShopsFilters.endDate}
                    onChange={(e) =>
                      setNewShopsFilters({
                        ...newShopsFilters,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerateNewShops}
                className="bg-[#433228] hover:bg-[#5a4238]"
              >
                Generate Report
              </Button>

              {newShopsData && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                      Report Period:{" "}
                      {new Date(newShopsFilters.startDate).toLocaleDateString()}{" "}
                      - {new Date(newShopsFilters.endDate).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Total Shops Activated: {newShopsData.length}
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shop Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Work Plan Date</TableHead>
                        <TableHead>Activated Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newShopsPagination.paginatedItems.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {row.shopName}
                          </TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell>{row.location}</TableCell>
                          <TableCell>
                            {new Date(row.workPlanDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(row.activatedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                row.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {row.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {newShopsData.length > 0 && (
                    <TablePaginationControls {...newShopsPagination} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
