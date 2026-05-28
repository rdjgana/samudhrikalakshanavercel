import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useTablePagination } from "../../hooks/useTablePagination";
import TablePaginationControls from "../common/TablePaginationControls";
import {
  parseBaDailySalesSheet,
  readSalesReportWorkbook,
} from "../../utils/parseBaDailySalesXlsx";
import { Printer, FileSpreadsheet, Download } from "lucide-react";
import {
  buildExportFilenameBase,
  exportPromoterSalesReportCsv,
  exportPromoterSalesReportXlsx,
  printPromoterSalesReport,
} from "../../utils/promoterSalesReportExport";
import salesReportAssetUrl from "../../assets/salesreport.xlsx?url";

function formatPresent(v) {
  if (v === "" || v === null || v === undefined) return "—";
  if (typeof v === "number") return String(v);
  return String(v);
}

function formatQty(v) {
  if (v === "" || v === null || v === undefined) return "";
  return String(v);
}

function formatInr(amount, { zeroAsDash = true } = {}) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n === 0) {
    return zeroAsDash ? "—" : "₹0";
  }
  return `₹${n.toLocaleString("en-IN")}`;
}

const SupervisorPromoterSalesReport = ({ audience = "supervisor" }) => {
  const isHr = audience === "hr";
  const [loadState, setLoadState] = useState("idle");
  const [loadError, setLoadError] = useState("");
  const workbookRef = useRef(null);
  const sheetCacheRef = useRef(new Map());

  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [parsed, setParsed] = useState(null);
  const [supervisorFilter, setSupervisorFilter] = useState("all");

  const loadWorkbook = useCallback(async () => {
    setLoadState("loading");
    setLoadError("");
    sheetCacheRef.current = new Map();
    try {
      const res = await fetch(salesReportAssetUrl);
      if (!res.ok) throw new Error(`Could not load file (${res.status})`);
      const buffer = await res.arrayBuffer();
      const wb = readSalesReportWorkbook(buffer);
      workbookRef.current = wb;
      const names = wb.SheetNames || [];
      setSheetNames(names);
      const first = names.includes("26") ? "26" : names[0] || "";
      setSelectedSheet(first);
      setLoadState("ready");
    } catch (e) {
      setLoadError(e?.message || "Failed to load sales report");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    loadWorkbook();
  }, [loadWorkbook]);

  useEffect(() => {
    const wb = workbookRef.current;
    if (!wb || !selectedSheet || loadState !== "ready") return;

    if (!sheetCacheRef.current.has(selectedSheet)) {
      const ws = wb.Sheets[selectedSheet];
      sheetCacheRef.current.set(
        selectedSheet,
        parseBaDailySalesSheet(ws),
      );
    }
    setParsed(sheetCacheRef.current.get(selectedSheet));
    setSupervisorFilter("all");
  }, [selectedSheet, loadState]);

  const supervisorOptions = useMemo(() => {
    if (!parsed?.rows) return [];
    const set = new Set();
    for (const row of parsed.rows) {
      if (row.supervisor) set.add(row.supervisor);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [parsed]);

  const filteredRows = useMemo(() => {
    if (!parsed?.rows) return [];
    if (supervisorFilter === "all") return parsed.rows;
    return parsed.rows.filter((r) => r.supervisor === supervisorFilter);
  }, [parsed, supervisorFilter]);

  const { columnTotals, grandTotal } = useMemo(() => {
    const cols = parsed?.productColumns?.length ?? 0;
    if (!cols || !filteredRows.length) {
      return { columnTotals: [], grandTotal: 0 };
    }
    const columnTotals = Array.from({ length: cols }, () => 0);
    let grandTotal = 0;
    for (const row of filteredRows) {
      grandTotal += row.rowTotal ?? 0;
      const lines = row.lineAmounts ?? [];
      for (let i = 0; i < cols; i++) {
        columnTotals[i] += Number(lines[i]) || 0;
      }
    }
    return { columnTotals, grandTotal };
  }, [parsed, filteredRows]);

  const pagination = useTablePagination(filteredRows);

  const exportDisabled = !parsed || filteredRows.length === 0;

  const handlePrint = useCallback(() => {
    if (exportDisabled || !parsed) return;
    printPromoterSalesReport({
      parsed,
      filteredRows,
      columnTotals,
      grandTotal,
      selectedSheet,
      supervisorFilter,
    });
  }, [
    exportDisabled,
    parsed,
    filteredRows,
    columnTotals,
    grandTotal,
    selectedSheet,
    supervisorFilter,
  ]);

  const handleExportCsv = useCallback(() => {
    if (exportDisabled || !parsed) return;
    exportPromoterSalesReportCsv(
      parsed,
      filteredRows,
      buildExportFilenameBase(selectedSheet, supervisorFilter),
    );
  }, [
    exportDisabled,
    parsed,
    filteredRows,
    selectedSheet,
    supervisorFilter,
  ]);

  const handleExportXlsx = useCallback(() => {
    if (exportDisabled || !parsed) return;
    exportPromoterSalesReportXlsx(
      parsed,
      filteredRows,
      buildExportFilenameBase(selectedSheet, supervisorFilter),
    );
  }, [
    exportDisabled,
    parsed,
    filteredRows,
    selectedSheet,
    supervisorFilter,
  ]);

  if (loadState === "loading" || loadState === "idle") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{isHr ? "Sales report" : "Promoter sales report"}</CardTitle>
          <CardDescription>
            Loading workbook from salesreport.xlsx…
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loadState === "error") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{isHr ? "Sales report" : "Target vs Sales — Promoter daily sales"}</CardTitle>
          <CardDescription>
            {isHr
              ? "Promoter daily sales (same layout as salesreport.xlsx)"
              : "Supervisor view — promoter daily sales (same layout as salesreport.xlsx)"}
          </CardDescription>
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
        <CardTitle>{isHr ? "Sales report" : "Target vs Sales — Promoter daily sales"}</CardTitle>
        <CardDescription>
          Daily sales detail from{" "}
          <span className="font-medium">salesreport.xlsx</span> (the sheet’s
          “BA name” column is the promoter name). Product header row includes
          MRP (₹); qty × MRP gives line amount, row total, and filtered totals
          below. Select a day sheet or Total.
          {isHr
            ? " Filter by supervisor to narrow the view."
            : " Only supervisors can open this report in the app."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50 md:flex-row md:flex-wrap md:items-end print:hidden">
          <div className="space-y-2 min-w-[180px]">
            <Label>Workbook sheet</Label>
            <Select
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
            >
              {sheetNames.map((name) => (
                <option key={name} value={name}>
                  {name === "Total" ? "Total (period)" : `Day ${name}`}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 min-w-[200px]">
            <Label>Supervisor</Label>
            <Select
              value={supervisorFilter}
              onChange={(e) => setSupervisorFilter(e.target.value)}
            >
              <option value="all">All supervisors</option>
              {supervisorOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={loadWorkbook}
            className="md:ml-auto"
          >
            Reload file
          </Button>
        </div>

        {parsed && (
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exportDisabled}
              onClick={handlePrint}
              className="border-[#433228]/40"
            >
              <Printer className="h-4 w-4 mr-2 shrink-0" aria-hidden />
              Print
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exportDisabled}
              onClick={handleExportCsv}
              className="border-[#433228]/40"
            >
              <Download className="h-4 w-4 mr-2 shrink-0" aria-hidden />
              Export CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exportDisabled}
              onClick={handleExportXlsx}
              className="border-[#433228]/40"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 shrink-0" aria-hidden />
              Export Excel
            </Button>
          </div>
        )}

        {parsed && (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border bg-[#433228]/5 px-4 py-3 text-sm">
              <span className="text-gray-700 font-medium">
                Total sales (filtered rows)
              </span>
              <span className="text-lg font-bold text-[#433228] tabular-nums">
                {formatInr(grandTotal, { zeroAsDash: false })}
              </span>
            </div>

            <p className="text-sm text-gray-600 font-medium">{parsed.title}</p>
            <div className="rounded-md border overflow-x-auto max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible">
              <Table className="min-w-max text-sm">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="whitespace-nowrap min-w-[3rem]">
                      S.No
                    </TableHead>
                    <TableHead className="whitespace-nowrap min-w-[7rem]">
                      Supervisors
                    </TableHead>
                    <TableHead className="whitespace-nowrap min-w-[8rem]">
                      Promoter name
                    </TableHead>
                    <TableHead className="whitespace-nowrap min-w-[10rem]">
                      Shop
                    </TableHead>
                    <TableHead className="whitespace-nowrap min-w-[7rem]">
                      Town
                    </TableHead>
                    <TableHead className="whitespace-nowrap min-w-[4rem]">
                      Present
                    </TableHead>
                    {parsed.productColumns.map((col) => (
                      <TableHead
                        key={col.col}
                        className="whitespace-nowrap min-w-[8rem] max-w-[11rem] text-xs font-normal align-bottom"
                        title={`${col.name} — MRP ₹${col.unitPrice.toLocaleString("en-IN")} / unit`}
                      >
                        <span className="line-clamp-3 font-medium">{col.name}</span>
                        <span className="mt-1 block text-[11px] text-gray-600 font-normal tabular-nums">
                          ₹{col.unitPrice.toLocaleString("en-IN")} / unit
                        </span>
                      </TableHead>
                    ))}
                    <TableHead className="whitespace-nowrap min-w-[7rem] text-right">
                      Row total (₹)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.paginatedItems.map((row, idx) => (
                    <TableRow key={`${row.sno}-${row.baName}-${row.outlet}-${idx}`}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {row.sno === "" ? "—" : row.sno}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.supervisor || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.baName || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.outlet || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.town || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatPresent(row.present)}
                      </TableCell>
                      {row.quantities.map((q, i) => {
                        const line = row.lineAmounts?.[i] ?? 0;
                        return (
                          <TableCell
                            key={parsed.productColumns[i].col}
                            className="align-top"
                          >
                            <div className="font-medium tabular-nums">
                              {formatQty(q)}
                            </div>
                            {line > 0 && (
                              <div className="text-xs text-gray-600 tabular-nums mt-0.5">
                                {formatInr(line)}
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right font-semibold text-[#433228] whitespace-nowrap tabular-nums">
                        {row.rowTotal > 0 ? formatInr(row.rowTotal) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {filteredRows.length > 0 && columnTotals.length > 0 && (
                  <TableFooter>
                    <TableRow className="bg-gray-100">
                      <TableCell
                        colSpan={6}
                        className="font-semibold text-gray-800"
                      >
                        Product totals (₹) — all filtered rows
                      </TableCell>
                      {columnTotals.map((t, i) => (
                        <TableCell
                          key={parsed.productColumns[i].col}
                          className="text-right font-semibold tabular-nums"
                        >
                          {t > 0 ? formatInr(t) : "—"}
                        </TableCell>
                      ))}
                      <TableCell className="text-right font-bold text-[#433228] tabular-nums">
                        {formatInr(grandTotal, { zeroAsDash: false })}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </div>
            <div className="print:hidden">
              {filteredRows.length > 0 && (
                <TablePaginationControls {...pagination} />
              )}
            </div>
            {filteredRows.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">
                No rows for this filter.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SupervisorPromoterSalesReport;
