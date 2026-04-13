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

// Mock Salary Data
const MOCK_SALARY_DATA = [
  {
    category: "RSM",
    employeeName: "Rajesh Kumar",
    noOfDays: 30,
    basic: 50000,
    totalSalary: 50000,
  },
  {
    category: "ASM",
    employeeName: "Priya Menon",
    noOfDays: 28,
    basic: 45000,
    totalSalary: 42000,
  },
  {
    category: "Super Stockist",
    employeeName: "Suresh Babu",
    noOfDays: 30,
    basic: 38000,
    totalSalary: 38000,
  },
  {
    category: "Distributer",
    employeeName: "Karthik",
    noOfDays: 29,
    basic: 34000,
    totalSalary: 32867,
  },
  {
    category: "Supervisor",
    employeeName: "Mohan Raj",
    noOfDays: 30,
    basic: 28000,
    totalSalary: 28000,
  },
  {
    category: "Promoter",
    employeeName: "Kavitha Rani",
    noOfDays: 27,
    basic: 18000,
    totalSalary: 16200,
  },
  {
    category: "SO",
    employeeName: "Arun Balaji",
    noOfDays: 30,
    basic: 32000,
    totalSalary: 32000,
  },
];

// Mock Expenses Data
const MOCK_EXPENSES_DATA = [
  {
    id: 1,
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
  const [incentiveView, setIncentiveView] = useState("category"); // 'category' or 'consolidated'
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIncentiveCategory, setSelectedIncentiveCategory] =
    useState("");
  const [expenses, setExpenses] = useState(MOCK_EXPENSES_DATA);

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
  // Total expenses calculated for potential future use (e.g., summary display)
  const totalExpenses = expenses.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  // Suppress unused variable warning - may be used for summary display
  void totalExpenses;
  const totalIncentive = MOCK_INCENTIVE_DATA.reduce(
    (sum, item) => sum + item.incentiveAmount,
    0,
  );

  const categoryWiseIncentive = MOCK_INCENTIVE_DATA.filter(
    (item) =>
      !selectedIncentiveCategory || item.category === selectedIncentiveCategory,
  );

  const consolidatedIncentive = MOCK_INCENTIVE_DATA.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = {
        category: item.category,
        totalEmployees: 0,
        totalPrimaryTarget: 0,
        totalPrimaryAchieved: 0,
        totalSecondaryTarget: 0,
        totalSecondaryAchieved: 0,
        totalIncentive: 0,
      };
    }
    acc[item.category].totalEmployees++;
    acc[item.category].totalPrimaryTarget += item.primaryTarget;
    acc[item.category].totalPrimaryAchieved += item.primaryAchieved;
    acc[item.category].totalSecondaryTarget += item.secondaryTarget;
    acc[item.category].totalSecondaryAchieved += item.secondaryAchieved;
    acc[item.category].totalIncentive += item.incentiveAmount;
    return acc;
  }, {});

  const consolidatedSalaryRows = useMemo(
    () => Object.values(consolidatedSalary),
    [consolidatedSalary],
  );
  const consolidatedIncentiveRows = useMemo(
    () => Object.values(consolidatedIncentive),
    [consolidatedIncentive],
  );

  const categoryWiseSalaryPagination = useTablePagination(categoryWiseSalary);
  const consolidatedSalaryPagination = useTablePagination(consolidatedSalaryRows);
  const expensesPagination = useTablePagination(expenses);
  const categoryWiseIncentivePagination = useTablePagination(categoryWiseIncentive);
  const consolidatedIncentivePagination = useTablePagination(consolidatedIncentiveRows);

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
    ];
    const data = categoryWiseSalary.map((item) => ({
      Category: item.category,
      "Employee Name": item.employeeName,
      "No. of Days": item.noOfDays,
      "Basic (₹)": `₹${item.basic.toLocaleString("en-IN")}`,
      "Total Salary (₹)": `₹${item.totalSalary.toLocaleString("en-IN")}`,
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

  const handleDownloadExpenses = (format = "csv") => {
    if (expenses.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = [
      "Employee Name",
      "Travelled From",
      "Travelled To",
      "Target Achieved %",
      "TA (₹)",
      "DA (₹)",
      "Total Amount (₹)",
      "Status",
    ];
    const data = expenses.map((item) => ({
      "Employee Name": item.employeeName,
      "Travelled From": item.travelledFrom,
      "Travelled To": item.travelledTo,
      "Target Achieved %": `${(item.targetAchievedPercentage || 0).toFixed(2)}%`,
      "TA (₹)": `₹${(item.ta || 0).toLocaleString("en-IN")}`,
      "DA (₹)": `₹${(item.da || 0).toLocaleString("en-IN")}`,
      "Total Amount (₹)": `₹${item.amount.toLocaleString("en-IN")}`,
      Status: item.status,
    }));

    const filename = `Expenses_Report_${new Date().toISOString().split("T")[0]}.${format}`;

    if (format === "csv") {
      const csvContent = convertToCSV(data, headers);
      downloadCSV(csvContent, filename);
    } else {
      downloadXLSX(data, headers, filename);
    }
  };

  const handleDownloadCategoryWiseIncentive = (format = "csv") => {
    if (categoryWiseIncentive.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = [
      "Category",
      "Employee Name",
      "Primary Target (₹)",
      "Primary Achieved (₹)",
      "Secondary Target (₹)",
      "Secondary Achieved (₹)",
      "Incentive Amount (₹)",
    ];
    const data = categoryWiseIncentive.map((item) => ({
      Category: item.category,
      "Employee Name": item.employeeName,
      "Primary Target (₹)": `₹${item.primaryTarget.toLocaleString("en-IN")}`,
      "Primary Achieved (₹)": `₹${item.primaryAchieved.toLocaleString("en-IN")}`,
      "Secondary Target (₹)": `₹${item.secondaryTarget.toLocaleString("en-IN")}`,
      "Secondary Achieved (₹)": `₹${item.secondaryAchieved.toLocaleString("en-IN")}`,
      "Incentive Amount (₹)": `₹${item.incentiveAmount.toLocaleString("en-IN")}`,
    }));

    const filename = `Category_Wise_Incentive_${new Date().toISOString().split("T")[0]}.${format}`;

    if (format === "csv") {
      const csvContent = convertToCSV(data, headers);
      downloadCSV(csvContent, filename);
    } else {
      downloadXLSX(data, headers, filename);
    }
  };

  const handleDownloadConsolidatedIncentive = (format = "csv") => {
    const consolidatedData = Object.values(consolidatedIncentive);
    if (consolidatedData.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = [
      "Category",
      "Total Employees",
      "Total Primary Target (₹)",
      "Total Primary Achieved (₹)",
      "Total Secondary Target (₹)",
      "Total Secondary Achieved (₹)",
      "Total Incentive (₹)",
    ];
    const data = consolidatedData.map((item) => ({
      Category: item.category,
      "Total Employees": item.totalEmployees,
      "Total Primary Target (₹)": `₹${item.totalPrimaryTarget.toLocaleString("en-IN")}`,
      "Total Primary Achieved (₹)": `₹${item.totalPrimaryAchieved.toLocaleString("en-IN")}`,
      "Total Secondary Target (₹)": `₹${item.totalSecondaryTarget.toLocaleString("en-IN")}`,
      "Total Secondary Achieved (₹)": `₹${item.totalSecondaryAchieved.toLocaleString("en-IN")}`,
      "Total Incentive (₹)": `₹${item.totalIncentive.toLocaleString("en-IN")}`,
    }));

    // Add grand total row
    data.push({
      Category: "Grand Total",
      "Total Employees": "",
      "Total Primary Target (₹)": `₹${MOCK_INCENTIVE_DATA.reduce((sum, item) => sum + item.primaryTarget, 0).toLocaleString("en-IN")}`,
      "Total Primary Achieved (₹)": `₹${MOCK_INCENTIVE_DATA.reduce((sum, item) => sum + item.primaryAchieved, 0).toLocaleString("en-IN")}`,
      "Total Secondary Target (₹)": `₹${MOCK_INCENTIVE_DATA.reduce((sum, item) => sum + item.secondaryTarget, 0).toLocaleString("en-IN")}`,
      "Total Secondary Achieved (₹)": `₹${MOCK_INCENTIVE_DATA.reduce((sum, item) => sum + item.secondaryAchieved, 0).toLocaleString("en-IN")}`,
      "Total Incentive (₹)": `₹${totalIncentive.toLocaleString("en-IN")}`,
    });

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
                View salary by category or consolidated view
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
                        <option value="Super Stockist">Super Stockist</option>
                        <option value="Distributer">Distributer</option>
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
                              <TableCell>{item.employeeName}</TableCell>
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
                Track and approve travel expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end mb-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadExpenses("csv")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadExpenses("xlsx")}
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
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Travelled From</TableHead>
                      <TableHead>Travelled To</TableHead>
                      <TableHead className="text-right">Target Achieved %</TableHead>
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
                          {(expensesPagination.page - 1) * expensesPagination.pageSize + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {expense.employeeName}
                        </TableCell>
                        <TableCell>{expense.travelledFrom}</TableCell>
                        <TableCell>{expense.travelledTo}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${
                            (expense.targetAchievedPercentage || 0) >= 90
                              ? "text-green-600"
                              : (expense.targetAchievedPercentage || 0) >= 75
                              ? "text-blue-600"
                              : "text-orange-600"
                          }`}>
                            {(expense.targetAchievedPercentage || 0).toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={expense.ta || 0}
                            onChange={(e) => handleUpdateTA(expense.id, e.target.value)}
                            className="w-24 text-right"
                            min="0"
                            step="1"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={expense.da || 0}
                            onChange={(e) => handleUpdateDA(expense.id, e.target.value)}
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
                            className={`px-2 py-1 rounded-full text-xs ${
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
                              className="bg-[#433228] hover:bg-[#5a4238] text-white"
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
                {expenses.length > 0 && <TablePaginationControls {...expensesPagination} />}
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
                View incentive by category or consolidated view
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    variant={
                      incentiveView === "category" ? "default" : "outline"
                    }
                    onClick={() => setIncentiveView("category")}
                    className={
                      incentiveView === "category"
                        ? "bg-[#433228] hover:bg-[#5a4238] text-white"
                        : ""
                    }
                  >
                    Category Wise
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

                {incentiveView === "category" && (
                  <>
                    <div className="space-y-2">
                      <Label>Filter by Category</Label>
                      <Select
                        value={selectedIncentiveCategory}
                        onChange={(e) =>
                          setSelectedIncentiveCategory(e.target.value)
                        }
                      >
                        <option value="">All Categories</option>
                        <option value="RSM">RSM</option>
                        <option value="ASM">ASM</option>
                        <option value="SO">SO</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Promoter">Promoter</option>
                      </Select>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">
                          Category Wise Incentive
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDownloadCategoryWiseIncentive("csv")
                            }
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download CSV
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDownloadCategoryWiseIncentive("xlsx")
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
                          {categoryWiseIncentivePagination.paginatedItems.map((item, index) => (
                            <TableRow key={`${item.category}-${item.employeeName}-${index}`}>
                              <TableCell className="text-muted-foreground tabular-nums">
                                {(categoryWiseIncentivePagination.page - 1) * categoryWiseIncentivePagination.pageSize + index + 1}
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.category}
                              </TableCell>
                              <TableCell>{item.employeeName}</TableCell>
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
                                ₹
                                {item.secondaryAchieved.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                ₹{item.incentiveAmount.toLocaleString("en-IN")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {categoryWiseIncentive.length > 0 && (
                        <TablePaginationControls {...categoryWiseIncentivePagination} />
                      )}
                    </div>
                  </>
                )}

                {incentiveView === "consolidated" && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">
                        Consolidated Incentive
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadConsolidatedIncentive("csv")
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadConsolidatedIncentive("xlsx")
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
                        {consolidatedIncentivePagination.paginatedItems.map(
                          (item, index) => (
                            <TableRow key={item.category}>
                              <TableCell className="text-muted-foreground tabular-nums">
                                {(consolidatedIncentivePagination.page - 1) * consolidatedIncentivePagination.pageSize + index + 1}
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.category}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.totalEmployees}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹
                                {item.totalPrimaryTarget.toLocaleString(
                                  "en-IN",
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹
                                {item.totalPrimaryAchieved.toLocaleString(
                                  "en-IN",
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹
                                {item.totalSecondaryTarget.toLocaleString(
                                  "en-IN",
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹
                                {item.totalSecondaryAchieved.toLocaleString(
                                  "en-IN",
                                )}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                ₹{item.totalIncentive.toLocaleString("en-IN")}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                        <TableRow className="font-semibold bg-gray-50">
                          <TableCell />
                          <TableCell colSpan={6}>Grand Total</TableCell>
                          <TableCell className="text-right text-green-600">
                            ₹{totalIncentive.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    {consolidatedIncentiveRows.length > 0 && (
                      <TablePaginationControls {...consolidatedIncentivePagination} />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRSalaryExpenses;
