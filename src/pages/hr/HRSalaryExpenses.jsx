import { useMemo, useState } from "react";
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
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { FileText, Download, DollarSign, TrendingUp } from "lucide-react";
import * as XLSX from "xlsx";

// Utility function to convert data to CSV
const convertToCSV = (data, headers) => {
  const csvHeaders = headers.join(",");
  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header] || "";
        // Escape commas and quotes in values
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"') || value.includes("\n"))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",");
  });
  return [csvHeaders, ...csvRows].join("\n");
};

// Utility function to download CSV file
const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Utility function to download XLSX file
const downloadXLSX = (data, headers, filename) => {
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  // Generate XLSX file and download
  XLSX.writeFile(workbook, filename);
};

// Mock Salary Data (distributor / super stockist roles excluded from HR salary management)
const MOCK_SALARY_DATA = [
  {
    category: "RSM",
    employeeName: "Rajesh Kumar",
    noOfDays: 30,
    basic: 50000,
    totalSalary: 50000,
    lop: 0,
    leaveCount: 2,
  },
  {
    category: "ASM",
    employeeName: "Priya Menon",
    noOfDays: 28,
    basic: 45000,
    totalSalary: 42000,
    lop: 2,
    leaveCount: 4,
  },
  {
    category: "Supervisor",
    employeeName: "Mohan Raj",
    noOfDays: 30,
    basic: 28000,
    totalSalary: 28000,
    lop: 0,
    leaveCount: 1,
  },
  {
    category: "Promoter",
    employeeName: "Kavitha Rani",
    noOfDays: 27,
    basic: 18000,
    totalSalary: 16200,
    lop: 3,
    leaveCount: 5,
  },
  {
    category: "SO",
    employeeName: "Arun Balaji",
    noOfDays: 30,
    basic: 32000,
    totalSalary: 32000,
    lop: 0,
    leaveCount: 0,
  },
];

const getAttendanceByEmployeeName = (name) => {
  const row = MOCK_SALARY_DATA.find((r) => r.employeeName === name);
  if (!row) return { lop: 0, leaveCount: 0 };
  return { lop: row.lop ?? 0, leaveCount: row.leaveCount ?? 0 };
};

// Mock Expenses Data
const MOCK_EXPENSES_DATA = [
  {
    id: 1,
    category: "RSM",
    employeeName: "Rajesh Kumar",
    travelledFrom: "Chennai",
    travelledTo: "Madurai",
    ta: 2000,
    da: 1500,
    amount: 5000,
    status: "Pending",
    monthlyTarget: 1500000,
    monthlyAchieved: 1125000,
    targetAchievedPercentage: 75.0,
  },
  {
    id: 2,
    category: "ASM",
    employeeName: "Priya Menon",
    travelledFrom: "Coimbatore",
    travelledTo: "Salem",
    ta: 1500,
    da: 1000,
    amount: 3500,
    status: "Approved",
    monthlyTarget: 1200000,
    monthlyAchieved: 1080000,
    targetAchievedPercentage: 90.0,
  },
  {
    id: 3,
    category: "Supervisor",
    employeeName: "Mohan Raj",
    travelledFrom: "Madurai",
    travelledTo: "Tirunelveli",
    ta: 1800,
    da: 1200,
    amount: 4000,
    status: "Pending",
    monthlyTarget: 500000,
    monthlyAchieved: 450000,
    targetAchievedPercentage: 90.0,
  },
  {
    id: 4,
    category: "SO",
    employeeName: "Arun Balaji",
    travelledFrom: "Chennai",
    travelledTo: "Coimbatore",
    ta: 2200,
    da: 800,
    amount: 3000,
    status: "Pending",
    monthlyTarget: 800000,
    monthlyAchieved: 760000,
    targetAchievedPercentage: 95.0,
  },
];

// Mock Incentive Data
const MOCK_INCENTIVE_DATA = [
  {
    category: "RSM",
    employeeName: "Rajesh Kumar",
    primaryTarget: 1500000,
    primaryAchieved: 1125000,
    secondaryTarget: 1200000,
    secondaryAchieved: 960000,
    incentiveAmount: 25000,
  },
  {
    category: "ASM",
    employeeName: "Priya Menon",
    primaryTarget: 1200000,
    primaryAchieved: 1080000,
    secondaryTarget: 1000000,
    secondaryAchieved: 850000,
    incentiveAmount: 20000,
  },
  {
    category: "SO",
    employeeName: "Arun Balaji",
    primaryTarget: 800000,
    primaryAchieved: 720000,
    secondaryTarget: 600000,
    secondaryAchieved: 540000,
    incentiveAmount: 15000,
  },
  {
    category: "Supervisor",
    employeeName: "Mohan Raj",
    primaryTarget: 500000,
    primaryAchieved: 450000,
    secondaryTarget: 400000,
    secondaryAchieved: 360000,
    incentiveAmount: 10000,
  },
  {
    category: "Promoter",
    employeeName: "Kavitha Rani",
    primaryTarget: 300000,
    primaryAchieved: 270000,
    secondaryTarget: 250000,
    secondaryAchieved: 225000,
    incentiveAmount: 5000,
  },
];

const HRSalaryExpenses = () => {
  const [salaryView, setSalaryView] = useState("category"); // 'category' or 'consolidated'
  const [incentiveView, setIncentiveView] = useState("employee"); // 'employee' | 'consolidated' (no category column — category is promoter-only elsewhere)
  const [expensesView, setExpensesView] = useState("category"); // 'category' | 'consolidated'
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState("");
  const [expenses, setExpenses] = useState(MOCK_EXPENSES_DATA);
  const [attendanceDialog, setAttendanceDialog] = useState({
    open: false,
    employeeName: "",
    lop: 0,
    leaveCount: 0,
  });

  const openAttendanceForEmployee = (employeeName) => {
    const { lop, leaveCount } = getAttendanceByEmployeeName(employeeName);
    setAttendanceDialog({
      open: true,
      employeeName,
      lop,
      leaveCount,
    });
  };

  const handleProcessExpense = (expenseId) => {
    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === expenseId ? { ...exp, status: "Approved" } : exp,
      ),
    );
    alert("Expense processed for approval");
  };

  const handleUpdateTA = (expenseId, newTA) => {
    setExpenses((prev) =>
      prev.map((exp) => {
        if (exp.id === expenseId) {
          const ta = parseFloat(newTA) || 0;
          const da = exp.da || 0;
          return {
            ...exp,
            ta,
            amount: ta + da,
          };
        }
        return exp;
      }),
    );
  };

  const handleUpdateDA = (expenseId, newDA) => {
    setExpenses((prev) =>
      prev.map((exp) => {
        if (exp.id === expenseId) {
          const ta = exp.ta || 0;
          const da = parseFloat(newDA) || 0;
          return {
            ...exp,
            da,
            amount: ta + da,
          };
        }
        return exp;
      }),
    );
  };

  const categoryWiseSalary = MOCK_SALARY_DATA.filter(
    (item) => !selectedCategory || item.category === selectedCategory,
  );

  const consolidatedSalary = MOCK_SALARY_DATA.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = {
        category: item.category,
        totalEmployees: 0,
        totalDays: 0,
        totalBasic: 0,
        totalSalary: 0,
      };
    }
    acc[item.category].totalEmployees++;
    acc[item.category].totalDays += item.noOfDays;
    acc[item.category].totalBasic += item.basic;
    acc[item.category].totalSalary += item.totalSalary;
    return acc;
  }, {});

  const totalSalary = MOCK_SALARY_DATA.reduce(
    (sum, item) => sum + item.totalSalary,
    0,
  );

  const employeeWiseIncentive = MOCK_INCENTIVE_DATA;

  const consolidatedIncentiveGrand = useMemo(() => {
    const list = MOCK_INCENTIVE_DATA;
    return {
      totalEmployees: list.length,
      totalPrimaryTarget: list.reduce((s, i) => s + i.primaryTarget, 0),
      totalPrimaryAchieved: list.reduce((s, i) => s + i.primaryAchieved, 0),
      totalSecondaryTarget: list.reduce((s, i) => s + i.secondaryTarget, 0),
      totalSecondaryAchieved: list.reduce((s, i) => s + i.secondaryAchieved, 0),
      totalIncentive: list.reduce((s, i) => s + i.incentiveAmount, 0),
    };
  }, []);

  const filteredExpenses = useMemo(
    () =>
      expenses.filter(
        (e) =>
          !selectedExpenseCategory || e.category === selectedExpenseCategory,
      ),
    [expenses, selectedExpenseCategory],
  );

  const consolidatedExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, item) => {
      const cat = item.category || "Uncategorised";
      if (!acc[cat]) {
        acc[cat] = {
          category: cat,
          claimCount: 0,
          totalTA: 0,
          totalDA: 0,
          totalAmount: 0,
        };
      }
      acc[cat].claimCount += 1;
      acc[cat].totalTA += item.ta || 0;
      acc[cat].totalDA += item.da || 0;
      acc[cat].totalAmount += item.amount || 0;
      return acc;
    }, {});
  }, [filteredExpenses]);

  const consolidatedSalaryRows = useMemo(
    () => Object.values(consolidatedSalary),
    [consolidatedSalary],
  );
  const consolidatedExpenseRows = useMemo(
    () => Object.values(consolidatedExpenses),
    [consolidatedExpenses],
  );

  const consolidatedExpenseTotals = useMemo(() => {
    const rows = consolidatedExpenseRows;
    return {
      claims: rows.reduce((s, r) => s + r.claimCount, 0),
      totalTA: rows.reduce((s, r) => s + r.totalTA, 0),
      totalDA: rows.reduce((s, r) => s + r.totalDA, 0),
      totalAmount: rows.reduce((s, r) => s + r.totalAmount, 0),
    };
  }, [consolidatedExpenseRows]);

  const categoryWiseSalaryPagination = useTablePagination(categoryWiseSalary);
  const consolidatedSalaryPagination = useTablePagination(consolidatedSalaryRows);
  const expensesPagination = useTablePagination(filteredExpenses);
  const consolidatedExpensePagination = useTablePagination(consolidatedExpenseRows);
  const employeeWiseIncentivePagination = useTablePagination(employeeWiseIncentive);

  // Download handlers
  const handleDownloadCategoryWiseSalary = (format = "csv") => {
    if (categoryWiseSalary.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = [
      "Category",
      "Employee Name",
      "No. of Days",
      "Basic (₹)",
      "Total Salary (₹)",
      "LOP (days)",
      "Leave count",
    ];
    const data = categoryWiseSalary.map((item) => ({
      Category: item.category,
      "Employee Name": item.employeeName,
      "No. of Days": item.noOfDays,
      "Basic (₹)": `₹${item.basic.toLocaleString("en-IN")}`,
      "Total Salary (₹)": `₹${item.totalSalary.toLocaleString("en-IN")}`,
      "LOP (days)": item.lop ?? 0,
      "Leave count": item.leaveCount ?? 0,
    }));

    const filename = `Category_Wise_Salary_${new Date().toISOString().split("T")[0]}.${format}`;

    if (format === "csv") {
      const csvContent = convertToCSV(data, headers);
      downloadCSV(csvContent, filename);
    } else {
      downloadXLSX(data, headers, filename);
    }
  };

  const handleDownloadConsolidatedSalary = (format = "csv") => {
    const consolidatedData = Object.values(consolidatedSalary);
    if (consolidatedData.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = [
      "Category",
      "Total Employees",
      "Total Days",
      "Total Basic (₹)",
      "Total Salary (₹)",
    ];
    const data = consolidatedData.map((item) => ({
      Category: item.category,
      "Total Employees": item.totalEmployees,
      "Total Days": item.totalDays,
      "Total Basic (₹)": `₹${item.totalBasic.toLocaleString("en-IN")}`,
      "Total Salary (₹)": `₹${item.totalSalary.toLocaleString("en-IN")}`,
    }));

    // Add grand total row
    data.push({
      Category: "Grand Total",
      "Total Employees": "",
      "Total Days": "",
      "Total Basic (₹)": "",
      "Total Salary (₹)": `₹${totalSalary.toLocaleString("en-IN")}`,
    });

    const filename = `Consolidated_Salary_${new Date().toISOString().split("T")[0]}.${format}`;

    if (format === "csv") {
      const csvContent = convertToCSV(data, headers);
      downloadCSV(csvContent, filename);
    } else {
      downloadXLSX(data, headers, filename);
    }
  };

  const handleDownloadExpensesCategory = (format = "csv") => {
    if (filteredExpenses.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = [
      "Category",
      "Employee Name",
      "Travelled From",
      "Travelled To",
      "Target Achieved %",
      "TA (₹)",
      "DA (₹)",
      "Total Amount (₹)",
      "Status",
    ];
    const data = filteredExpenses.map((item) => ({
      Category: item.category || "",
      "Employee Name": item.employeeName,
      "Travelled From": item.travelledFrom,
      "Travelled To": item.travelledTo,
      "Target Achieved %": `${(item.targetAchievedPercentage || 0).toFixed(2)}%`,
      "TA (₹)": `₹${(item.ta || 0).toLocaleString("en-IN")}`,
      "DA (₹)": `₹${(item.da || 0).toLocaleString("en-IN")}`,
      "Total Amount (₹)": `₹${item.amount.toLocaleString("en-IN")}`,
      Status: item.status,
    }));

    const filename = `Category_Wise_Expenses_${new Date().toISOString().split("T")[0]}.${format}`;

    if (format === "csv") {
      const csvContent = convertToCSV(data, headers);
      downloadCSV(csvContent, filename);
    } else {
      downloadXLSX(data, headers, filename);
    }
  };

  const handleDownloadConsolidatedExpenses = (format = "csv") => {
    const consolidatedData = Object.values(consolidatedExpenses);
    if (consolidatedData.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = [
      "Category",
      "Claims",
      "Total TA (₹)",
      "Total DA (₹)",
      "Total Amount (₹)",
    ];
    const data = consolidatedData.map((item) => ({
      Category: item.category,
      Claims: item.claimCount,
      "Total TA (₹)": `₹${item.totalTA.toLocaleString("en-IN")}`,
      "Total DA (₹)": `₹${item.totalDA.toLocaleString("en-IN")}`,
      "Total Amount (₹)": `₹${item.totalAmount.toLocaleString("en-IN")}`,
    }));

    const grandTA = consolidatedData.reduce((s, r) => s + r.totalTA, 0);
    const grandDA = consolidatedData.reduce((s, r) => s + r.totalDA, 0);
    const grandAmt = consolidatedData.reduce((s, r) => s + r.totalAmount, 0);
    data.push({
      Category: "Grand Total",
      Claims: consolidatedData.reduce((s, r) => s + r.claimCount, 0),
      "Total TA (₹)": `₹${grandTA.toLocaleString("en-IN")}`,
      "Total DA (₹)": `₹${grandDA.toLocaleString("en-IN")}`,
      "Total Amount (₹)": `₹${grandAmt.toLocaleString("en-IN")}`,
    });

    const filename = `Consolidated_Expenses_${new Date().toISOString().split("T")[0]}.${format}`;

    if (format === "csv") {
      const csvContent = convertToCSV(data, headers);
      downloadCSV(csvContent, filename);
    } else {
      downloadXLSX(data, headers, filename);
    }
  };

  const handleDownloadEmployeeWiseIncentive = (format = "csv") => {
    if (employeeWiseIncentive.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = [
      "Employee Name",
      "Primary Target (₹)",
      "Primary Achieved (₹)",
      "Secondary Target (₹)",
      "Secondary Achieved (₹)",
      "Incentive Amount (₹)",
    ];
    const data = employeeWiseIncentive.map((item) => ({
      "Employee Name": item.employeeName,
      "Primary Target (₹)": `₹${item.primaryTarget.toLocaleString("en-IN")}`,
      "Primary Achieved (₹)": `₹${item.primaryAchieved.toLocaleString("en-IN")}`,
      "Secondary Target (₹)": `₹${item.secondaryTarget.toLocaleString("en-IN")}`,
      "Secondary Achieved (₹)": `₹${item.secondaryAchieved.toLocaleString("en-IN")}`,
      "Incentive Amount (₹)": `₹${item.incentiveAmount.toLocaleString("en-IN")}`,
    }));

    const filename = `Employee_Wise_Incentive_${new Date().toISOString().split("T")[0]}.${format}`;

    if (format === "csv") {
      const csvContent = convertToCSV(data, headers);
      downloadCSV(csvContent, filename);
    } else {
      downloadXLSX(data, headers, filename);
    }
  };

  const handleDownloadConsolidatedIncentive = (format = "csv") => {
    const g = consolidatedIncentiveGrand;
    const headers = [
      "Scope",
      "Total Employees",
      "Total Primary Target (₹)",
      "Total Primary Achieved (₹)",
      "Total Secondary Target (₹)",
      "Total Secondary Achieved (₹)",
      "Total Incentive (₹)",
    ];
    const data = [
      {
        Scope: "Consolidated (all)",
        "Total Employees": g.totalEmployees,
        "Total Primary Target (₹)": `₹${g.totalPrimaryTarget.toLocaleString("en-IN")}`,
        "Total Primary Achieved (₹)": `₹${g.totalPrimaryAchieved.toLocaleString("en-IN")}`,
        "Total Secondary Target (₹)": `₹${g.totalSecondaryTarget.toLocaleString("en-IN")}`,
        "Total Secondary Achieved (₹)": `₹${g.totalSecondaryAchieved.toLocaleString("en-IN")}`,
        "Total Incentive (₹)": `₹${g.totalIncentive.toLocaleString("en-IN")}`,
      },
    ];

    const filename = `Consolidated_Incentive_${new Date().toISOString().split("T")[0]}.${format}`;

    if (format === "csv") {
      const csvContent = convertToCSV(data, headers);
      downloadCSV(csvContent, filename);
    } else {
      downloadXLSX(data, headers, filename);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Salary & Expenses</h1>
        <p className="text-gray-600 mt-2">
          Manage salary, expenses, and inventory
        </p>
      </div>

      <Tabs defaultValue="salary" className="w-full">
        <TabsList>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="incentive">Incentive</TabsTrigger>
        </TabsList>

        {/* Salary Tab */}
        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#433228]" />
                Salary Management
              </CardTitle>
              <CardDescription>
                View salary by category or consolidated totals. Click an employee name to see LOP (days) and leave count.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    variant={salaryView === "category" ? "default" : "outline"}
                    onClick={() => setSalaryView("category")}
                    className={
                      salaryView === "category"
                        ? "bg-[#433228] hover:bg-[#5a4238] text-white"
                        : ""
                    }
                  >
                    Category Wise
                  </Button>
                  <Button
                    variant={
                      salaryView === "consolidated" ? "default" : "outline"
                    }
                    onClick={() => setSalaryView("consolidated")}
                    className={
                      salaryView === "consolidated"
                        ? "bg-[#433228] hover:bg-[#5a4238] text-white"
                        : ""
                    }
                  >
                    Consolidated
                  </Button>
                </div>

                {salaryView === "category" && (
                  <>
                    <div className="space-y-2">
                      <Label>Filter by Category</Label>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        <option value="RSM">RSM</option>
                        <option value="ASM">ASM</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Promoter">Promoter</option>
                        <option value="SO">SO</option>
                      </Select>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">
                          Category Wise Salary
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDownloadCategoryWiseSalary("csv")
                            }
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download CSV
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDownloadCategoryWiseSalary("xlsx")
                            }
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download XLSX
                          </Button>
                        </div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-14">S.No</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Employee Name</TableHead>
                            <TableHead className="text-right">
                              No. of Days
                            </TableHead>
                            <TableHead className="text-right">
                              Basic (₹)
                            </TableHead>
                            <TableHead className="text-right">
                              Total Salary (₹)
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryWiseSalaryPagination.paginatedItems.map((item, index) => (
                            <TableRow key={`${item.category}-${item.employeeName}-${index}`}>
                              <TableCell className="text-muted-foreground tabular-nums">
                                {(categoryWiseSalaryPagination.page - 1) * categoryWiseSalaryPagination.pageSize + index + 1}
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.category}
                              </TableCell>
                              <TableCell>
                                <button
                                  type="button"
                                  className="text-left font-medium text-[#433228] hover:underline"
                                  onClick={() =>
                                    openAttendanceForEmployee(item.employeeName)
                                  }
                                >
                                  {item.employeeName}
                                </button>
                              </TableCell>
                              <TableCell className="text-right">
                                {item.noOfDays}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{item.basic.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                ₹{item.totalSalary.toLocaleString("en-IN")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {categoryWiseSalary.length > 0 && (
                        <TablePaginationControls {...categoryWiseSalaryPagination} />
                      )}
                    </div>
                  </>
                )}

                {salaryView === "consolidated" && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">
                        Consolidated Salary
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadConsolidatedSalary("csv")
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadConsolidatedSalary("xlsx")
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download XLSX
                        </Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-14">S.No</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">
                            Total Employees
                          </TableHead>
                          <TableHead className="text-right">
                            Total Days
                          </TableHead>
                          <TableHead className="text-right">
                            Total Basic (₹)
                          </TableHead>
                          <TableHead className="text-right">
                            Total Salary (₹)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consolidatedSalaryPagination.paginatedItems.map(
                          (item, index) => (
                            <TableRow key={item.category}>
                              <TableCell className="text-muted-foreground tabular-nums">
                                {(consolidatedSalaryPagination.page - 1) * consolidatedSalaryPagination.pageSize + index + 1}
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.category}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.totalEmployees}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.totalDays}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{item.totalBasic.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                ₹{item.totalSalary.toLocaleString("en-IN")}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                        <TableRow className="font-semibold bg-gray-50">
                          <TableCell />
                          <TableCell colSpan={4}>Grand Total</TableCell>
                          <TableCell className="text-right text-green-600">
                            ₹{totalSalary.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    {consolidatedSalaryRows.length > 0 && (
                      <TablePaginationControls {...consolidatedSalaryPagination} />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#433228]" />
                Expenses Management
              </CardTitle>
              <CardDescription>
                Category-wise claims or consolidated totals; click an employee name for LOP and leave count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant={expensesView === "category" ? "default" : "outline"}
                    onClick={() => setExpensesView("category")}
                    className={
                      expensesView === "category"
                        ? "bg-[#433228] hover:bg-[#5a4238] text-white"
                        : ""
                    }
                  >
                    Category Wise
                  </Button>
                  <Button
                    variant={
                      expensesView === "consolidated" ? "default" : "outline"
                    }
                    onClick={() => setExpensesView("consolidated")}
                    className={
                      expensesView === "consolidated"
                        ? "bg-[#433228] hover:bg-[#5a4238] text-white"
                        : ""
                    }
                  >
                    Consolidated
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Filter by Category</Label>
                  <Select
                    value={selectedExpenseCategory}
                    onChange={(e) => setSelectedExpenseCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="RSM">RSM</option>
                    <option value="ASM">ASM</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Promoter">Promoter</option>
                    <option value="SO">SO</option>
                  </Select>
                </div>

                {expensesView === "category" && (
                  <>
                    <div className="flex justify-end">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadExpensesCategory("csv")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadExpensesCategory("xlsx")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download XLSX
                        </Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-14">S.No</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Employee Name</TableHead>
                          <TableHead>Travelled From</TableHead>
                          <TableHead>Travelled To</TableHead>
                          <TableHead className="text-right">
                            Target Achieved %
                          </TableHead>
                          <TableHead className="text-right">TA (₹)</TableHead>
                          <TableHead className="text-right">DA (₹)</TableHead>
                          <TableHead className="text-right">
                            Total Amount (₹)
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expensesPagination.paginatedItems.map((expense, index) => (
                          <TableRow key={expense.id}>
                            <TableCell className="text-muted-foreground tabular-nums">
                              {(expensesPagination.page - 1) *
                                expensesPagination.pageSize +
                                index +
                                1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {expense.category || "—"}
                            </TableCell>
                            <TableCell>
                              <button
                                type="button"
                                className="text-left font-medium text-[#433228] hover:underline"
                                onClick={() =>
                                  openAttendanceForEmployee(expense.employeeName)
                                }
                              >
                                {expense.employeeName}
                              </button>
                            </TableCell>
                            <TableCell>{expense.travelledFrom}</TableCell>
                            <TableCell>{expense.travelledTo}</TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`font-medium ${
                                  (expense.targetAchievedPercentage || 0) >= 90
                                    ? "text-green-600"
                                    : (expense.targetAchievedPercentage || 0) >= 75
                                      ? "text-blue-600"
                                      : "text-orange-600"
                                }`}
                              >
                                {(expense.targetAchievedPercentage || 0).toFixed(2)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                value={expense.ta || 0}
                                onChange={(e) =>
                                  handleUpdateTA(expense.id, e.target.value)
                                }
                                className="w-24 text-right"
                                min="0"
                                step="1"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                value={expense.da || 0}
                                onChange={(e) =>
                                  handleUpdateDA(expense.id, e.target.value)
                                }
                                className="w-24 text-right"
                                min="0"
                                step="1"
                              />
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ₹{expense.amount.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${
                                  expense.status === "Approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {expense.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {expense.status === "Pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-[#433228] text-white hover:bg-[#5a4238]"
                                  onClick={() => handleProcessExpense(expense.id)}
                                >
                                  Process for Approval
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredExpenses.length > 0 && (
                      <TablePaginationControls {...expensesPagination} />
                    )}
                  </>
                )}

                {expensesView === "consolidated" && (
                  <div className="mt-2">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-lg">
                        Consolidated expenses (by category)
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadConsolidatedExpenses("csv")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadConsolidatedExpenses("xlsx")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download XLSX
                        </Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-14">S.No</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Claims</TableHead>
                          <TableHead className="text-right">Total TA (₹)</TableHead>
                          <TableHead className="text-right">Total DA (₹)</TableHead>
                          <TableHead className="text-right">
                            Total Amount (₹)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consolidatedExpensePagination.paginatedItems.map(
                          (row, index) => (
                            <TableRow key={row.category}>
                              <TableCell className="text-muted-foreground tabular-nums">
                                {(consolidatedExpensePagination.page - 1) *
                                  consolidatedExpensePagination.pageSize +
                                  index +
                                  1}
                              </TableCell>
                              <TableCell className="font-medium">
                                {row.category}
                              </TableCell>
                              <TableCell className="text-right">
                                {row.claimCount}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{row.totalTA.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{row.totalDA.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                ₹{row.totalAmount.toLocaleString("en-IN")}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                        <TableRow className="bg-gray-50 font-semibold">
                          <TableCell />
                          <TableCell>Grand Total</TableCell>
                          <TableCell className="text-right">
                            {consolidatedExpenseTotals.claims}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{consolidatedExpenseTotals.totalTA.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{consolidatedExpenseTotals.totalDA.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            ₹{consolidatedExpenseTotals.totalAmount.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    {consolidatedExpenseRows.length > 0 && (
                      <TablePaginationControls {...consolidatedExpensePagination} />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incentive Tab */}
        <TabsContent value="incentive">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#433228]" />
                Incentive Management
              </CardTitle>
              <CardDescription>
                Employee-wise incentives (role category is used on the promoter app only). Export employee-wise or consolidated totals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    variant={
                      incentiveView === "employee" ? "default" : "outline"
                    }
                    onClick={() => setIncentiveView("employee")}
                    className={
                      incentiveView === "employee"
                        ? "bg-[#433228] hover:bg-[#5a4238] text-white"
                        : ""
                    }
                  >
                    Employee Wise
                  </Button>
                  <Button
                    variant={
                      incentiveView === "consolidated" ? "default" : "outline"
                    }
                    onClick={() => setIncentiveView("consolidated")}
                    className={
                      incentiveView === "consolidated"
                        ? "bg-[#433228] hover:bg-[#5a4238] text-white"
                        : ""
                    }
                  >
                    Consolidated
                  </Button>
                </div>

                {incentiveView === "employee" && (
                  <div className="mt-4">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-lg">
                        Employee-wise incentive
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadEmployeeWiseIncentive("csv")
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadEmployeeWiseIncentive("xlsx")
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download XLSX
                        </Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-14">S.No</TableHead>
                          <TableHead>Employee Name</TableHead>
                          <TableHead className="text-right">
                            Primary Target (₹)
                          </TableHead>
                          <TableHead className="text-right">
                            Primary Achieved (₹)
                          </TableHead>
                          <TableHead className="text-right">
                            Secondary Target (₹)
                          </TableHead>
                          <TableHead className="text-right">
                            Secondary Achieved (₹)
                          </TableHead>
                          <TableHead className="text-right">
                            Incentive Amount (₹)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employeeWiseIncentivePagination.paginatedItems.map(
                          (item, index) => (
                            <TableRow
                              key={`${item.employeeName}-${item.primaryTarget}-${index}`}
                            >
                              <TableCell className="text-muted-foreground tabular-nums">
                                {(employeeWiseIncentivePagination.page - 1) *
                                  employeeWiseIncentivePagination.pageSize +
                                  index +
                                  1}
                              </TableCell>
                              <TableCell>
                                <button
                                  type="button"
                                  className="text-left font-medium text-[#433228] hover:underline"
                                  onClick={() =>
                                    openAttendanceForEmployee(item.employeeName)
                                  }
                                >
                                  {item.employeeName}
                                </button>
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{item.primaryTarget.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{item.primaryAchieved.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{item.secondaryTarget.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{item.secondaryAchieved.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                ₹{item.incentiveAmount.toLocaleString("en-IN")}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                    {employeeWiseIncentive.length > 0 && (
                      <TablePaginationControls {...employeeWiseIncentivePagination} />
                    )}
                  </div>
                )}

                {incentiveView === "consolidated" && (
                  <div className="mt-4">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-lg">
                        Consolidated incentive (all employees)
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadConsolidatedIncentive("csv")
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadConsolidatedIncentive("xlsx")
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download XLSX
                        </Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-14">S.No</TableHead>
                          <TableHead>Scope</TableHead>
                          <TableHead className="text-right">
                            Total Employees
                          </TableHead>
                          <TableHead className="text-right">
                            Total Primary Target (₹)
                          </TableHead>
                          <TableHead className="text-right">
                            Total Primary Achieved (₹)
                          </TableHead>
                          <TableHead className="text-right">
                            Total Secondary Target (₹)
                          </TableHead>
                          <TableHead className="text-right">
                            Total Secondary Achieved (₹)
                          </TableHead>
                          <TableHead className="text-right">
                            Total Incentive (₹)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="text-muted-foreground tabular-nums">
                            1
                          </TableCell>
                          <TableCell className="font-medium">
                            All employees
                          </TableCell>
                          <TableCell className="text-right">
                            {consolidatedIncentiveGrand.totalEmployees}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹
                            {consolidatedIncentiveGrand.totalPrimaryTarget.toLocaleString(
                              "en-IN",
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹
                            {consolidatedIncentiveGrand.totalPrimaryAchieved.toLocaleString(
                              "en-IN",
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹
                            {consolidatedIncentiveGrand.totalSecondaryTarget.toLocaleString(
                              "en-IN",
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹
                            {consolidatedIncentiveGrand.totalSecondaryAchieved.toLocaleString(
                              "en-IN",
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            ₹
                            {consolidatedIncentiveGrand.totalIncentive.toLocaleString(
                              "en-IN",
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={attendanceDialog.open}
        onOpenChange={(open) =>
          setAttendanceDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attendance summary</DialogTitle>
            <DialogDescription>
              LOP and leave count for payroll (from salary records).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-semibold text-gray-700">Employee:</span>{" "}
              {attendanceDialog.employeeName}
            </p>
            <p>
              <span className="font-semibold text-gray-700">LOP (days):</span>{" "}
              {attendanceDialog.lop}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Leave count:</span>{" "}
              {attendanceDialog.leaveCount}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRSalaryExpenses;
