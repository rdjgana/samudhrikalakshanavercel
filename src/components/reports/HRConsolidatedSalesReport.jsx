import { useCallback, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useTablePagination } from "../../hooks/useTablePagination";
import TablePaginationControls from "../common/TablePaginationControls";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Download, FileText, RotateCcw } from "lucide-react";
import { parseBaDailySalesSheet, readSalesReportWorkbook } from "../../utils/parseBaDailySalesXlsx";
import salesReportAssetUrl from "../../assets/salesreport.xlsx?url";

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatInr(amount, { zeroAsDash = true } = {}) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n === 0) return zeroAsDash ? "—" : "₹0";
  return `₹${n.toLocaleString("en-IN")}`;
}

function convertToCSV(data, headers) {
  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? "";
        const str = String(value);
        // Escape commas and quotes in values
        if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
        return str;
      })
      .join(","),
  );
  return [headers.join(","), ...csvRows].join("\n");
}

function downloadCSV(csvContent, filename) {
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
}

function downloadXLSX(data, headers, filename) {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((row) => {
      const obj = {};
      for (const h of headers) obj[h] = row[h] ?? "";
      return obj;
    }),
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, filename);
}

/**
 * Consolidated sales report (Excel-driven):
 * - Loads `salesreport.xlsx`
 * - Parses the `Total` sheet (same layout as promoter daily sales)
 * - Aggregates by (supervisor, town, outlet) -> bills (= sum Present) + total sales (= sum Row total)
 */
const HRConsolidatedSalesReport = () => {
  const [loadState, setLoadState] = useState("idle"); // idle | loading | ready | error
  const [loadError, setLoadError] = useState("");
  const [parsed, setParsed] = useState(null);

  const [filters, setFilters] = useState({
    supervisor: "all",
    town: "all",
    outlet: "all",
  });

  const loadWorkbook = useCallback(async () => {
    setLoadState("loading");
    setLoadError("");
    try {
      const res = await fetch(salesReportAssetUrl);
      if (!res.ok) throw new Error(`Could not load salesreport.xlsx (${res.status})`);
      const buf = await res.arrayBuffer();
      const wb = readSalesReportWorkbook(buf);
      const sheetName = wb.Sheets["Total"] ? "Total" : wb.SheetNames?.[wb.SheetNames.length - 1];
      const ws = wb.Sheets[sheetName];
      if (!ws) throw new Error(`No sheet found for consolidated sales (tried: ${sheetName}).`);

      const parsedTotal = parseBaDailySalesSheet(ws);
      if (!parsedTotal?.rows?.length) {
        throw new Error("No consolidated rows found in the selected sheet.");
      }
      setParsed(parsedTotal);
      setLoadState("ready");
    } catch (e) {
      setParsed(null);
      setLoadError(e?.message || "Failed to load consolidated sales");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    loadWorkbook();
  }, [loadWorkbook]);

  const supervisorOptions = useMemo(() => {
    const rows = parsed?.rows ?? [];
    return Array.from(
      new Set(rows.map((r) => String(r.supervisor ?? "").trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [parsed]);

  const townOptions = useMemo(() => {
    const rows = parsed?.rows ?? [];
    return Array.from(
      new Set(rows.map((r) => String(r.town ?? "").trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [parsed]);

  const outletOptions = useMemo(() => {
    const rows = parsed?.rows ?? [];
    return Array.from(
      new Set(rows.map((r) => String(r.outlet ?? "").trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [parsed]);

  const filteredRows = useMemo(() => {
    const rows = parsed?.rows ?? [];
    const { supervisor, town, outlet } = filters;
    return rows.filter((r) => {
      if (supervisor !== "all" && r.supervisor !== supervisor) return false;
      if (town !== "all" && r.town !== town) return false;
      if (outlet !== "all" && r.outlet !== outlet) return false;
      return true;
    });
  }, [parsed, filters]);

  const consolidatedRows = useMemo(() => {
    // Aggregate by outlet-shop name and city/town, so HR can see totals per shop.
    const map = new Map();
    for (const r of filteredRows) {
      const supervisor = String(r.supervisor ?? "").trim();
      const town = String(r.town ?? "").trim();
      const outlet = String(r.outlet ?? "").trim();
      const key = `${supervisor}::${town}::${outlet}`;

      const prev = map.get(key);
      const bills = toNumber(r.present);
      const sales = toNumber(r.rowTotal);
      if (!prev) {
        map.set(key, {
          supervisor: supervisor || "—",
          town: town || "—",
          outlet: outlet || "—",
          bills,
          totalSales: sales,
        });
      } else {
        prev.bills += bills;
        prev.totalSales += sales;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalSales - a.totalSales);
  }, [filteredRows]);

  const pagination = useTablePagination(consolidatedRows);

  const grandTotalSales = useMemo(
    () => consolidatedRows.reduce((s, r) => s + toNumber(r.totalSales), 0),
    [consolidatedRows],
  );
  const grandTotalBills = useMemo(
    () => consolidatedRows.reduce((s, r) => s + toNumber(r.bills), 0),
    [consolidatedRows],
  );

  const exportDisabled = !parsed || consolidatedRows.length === 0;

  const exportCsv = useCallback(() => {
    if (exportDisabled) return;
    const headers = ["Supervisor", "Town", "Shop", "Bills", "Total Sales (₹)"];
    const data = consolidatedRows.map((r) => ({
      Supervisor: r.supervisor,
      Town: r.town,
      Shop: r.outlet,
      Bills: r.bills,
      "Total Sales (₹)": r.totalSales,
    }));
    const csv = convertToCSV(data, headers);
    const filename = `Consolidated_Sales_Report_${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csv, filename);
  }, [exportDisabled, consolidatedRows]);

  const exportXlsx = useCallback(() => {
    if (exportDisabled) return;
    const headers = ["Supervisor", "Town", "Shop", "Bills", "Total Sales (₹)"];
    const data = consolidatedRows.map((r) => ({
      Supervisor: r.supervisor,
      Town: r.town,
      Shop: r.outlet,
      Bills: r.bills,
      "Total Sales (₹)": r.totalSales,
    }));
    const filename = `Consolidated_Sales_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    downloadXLSX(data, headers, filename);
  }, [exportDisabled, consolidatedRows]);

  if (loadState === "loading" || loadState === "idle") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consolidated sales report</CardTitle>
          <CardDescription>Loading workbook from salesreport.xlsx…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loadState === "error") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consolidated sales report</CardTitle>
          <CardDescription>Could not load salesreport.xlsx</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-red-600">{loadError}</p>
          <Button
            type="button"
            onClick={loadWorkbook}
            className="bg-[#433228] hover:bg-[#5a4238]"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#433228]" />
          Consolidated Sales Report
        </CardTitle>
        <CardDescription>
          Loaded from <span className="font-medium">salesreport.xlsx</span> (Total sheet).
          Summarized by outlet/shop with bills (= sum Present) and total sales (= sum Row total).
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50 md:flex-row md:flex-wrap md:items-end md:justify-between">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full md:flex-1">
            <div className="space-y-2">
              <Label>Supervisor (SS)</Label>
              <Select
                value={filters.supervisor}
                onChange={(e) => setFilters((p) => ({ ...p, supervisor: e.target.value }))}
              >
                <option value="all">All supervisors</option>
                {supervisorOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Town / Distributor</Label>
              <Select
                value={filters.town}
                onChange={(e) => setFilters((p) => ({ ...p, town: e.target.value }))}
              >
                <option value="all">All towns</option>
                {townOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Shop (Outlet)</Label>
              <Select
                value={filters.outlet}
                onChange={(e) => setFilters((p) => ({ ...p, outlet: e.target.value }))}
              >
                <option value="all">All shops</option>
                {outletOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exportDisabled}
              onClick={exportCsv}
              className="border-[#433228]/40"
            >
              <Download className="h-4 w-4 mr-2 shrink-0" />
              CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exportDisabled}
              onClick={exportXlsx}
              className="border-[#433228]/40"
            >
              <Download className="h-4 w-4 mr-2 shrink-0" />
              XLSX
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadWorkbook}
              className="border-[#433228]/40"
            >
              <RotateCcw className="h-4 w-4 mr-2 shrink-0" />
              Reload file
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border bg-[#433228]/5 px-4 py-3">
          <span className="text-gray-700 font-medium">Total sales (filtered)</span>
          <span className="text-lg font-bold text-[#433228] tabular-nums">
            {formatInr(grandTotalSales, { zeroAsDash: false })}
          </span>
          <span className="text-sm text-gray-600">
            Bills: <span className="font-medium tabular-nums">{grandTotalBills}</span>
          </span>
        </div>

        <div className="rounded-md border overflow-x-auto max-h-[70vh] overflow-y-auto">
          <Table className="min-w-max text-sm">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="whitespace-nowrap min-w-[9rem]">Supervisor</TableHead>
                <TableHead className="whitespace-nowrap min-w-[9rem]">Shop</TableHead>
                <TableHead className="whitespace-nowrap min-w-[8rem]">Town / Distributor</TableHead>
                <TableHead className="whitespace-nowrap min-w-[6rem] text-right">
                  Bills
                </TableHead>
                <TableHead className="whitespace-nowrap min-w-[10rem] text-right">
                  Total sales (₹)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedItems.map((row) => (
                <TableRow key={`${row.supervisor}-${row.outlet}-${row.town}`}>
                  <TableCell className="whitespace-nowrap">{row.supervisor}</TableCell>
                  <TableCell className="whitespace-nowrap font-medium">{row.outlet}</TableCell>
                  <TableCell className="whitespace-nowrap">{row.town}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.bills || 0}</TableCell>
                  <TableCell className="text-right font-semibold text-[#433228] tabular-nums">
                    {formatInr(row.totalSales, { zeroAsDash: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {consolidatedRows.length > 0 && (
          <div className="print:hidden">
            <TablePaginationControls {...pagination} />
          </div>
        )}

        {consolidatedRows.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No consolidated sales rows match the selected filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HRConsolidatedSalesReport;

