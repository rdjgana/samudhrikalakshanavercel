import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import dailyAttendanceUrl from "../../assets/DailyAttendance.xlsx?url";
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  parseDailyAttendanceSheet,
  sheetNameForAttendanceDate,
  filterDayColumnsByRange,
} from "../../utils/dailyAttendanceReport";

function attendanceMarkClass(mark) {
  const m = String(mark ?? "")
    .trim()
    .toUpperCase();
  if (!m)
    return "bg-gray-50 text-gray-400 border border-gray-100 min-h-[1.75rem]";
  if (m === "P")
    return "bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200";
  if (m === "WO")
    return "bg-sky-100 text-sky-900 font-semibold border border-sky-200";
  if (m === "A")
    return "bg-rose-100 text-rose-900 font-semibold border border-rose-200";
  if (m.startsWith("L"))
    return "bg-violet-100 text-violet-900 font-semibold border border-violet-200";
  return "bg-gray-100 text-gray-800 font-medium border border-gray-200";
}

function getDayMark(row, col, fullDayColumns) {
  if (!row.dayMarks?.length) return "";
  const idx = fullDayColumns.findIndex((d) => d.colIndex === col.colIndex);
  if (idx < 0) return "";
  return row.dayMarks[idx] ?? "";
}

/** Strip HD (half-day) from display — not used in this report. */
function displayDayCellMark(mark) {
  const m = String(mark ?? "").trim().toUpperCase();
  if (m === "HD") return "";
  return String(mark ?? "").trim();
}

const SupervisorDailyAttendanceReport = ({ audience = "supervisor" }) => {
  const isHr = audience === "hr";
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [rows, setRows] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const visibleDayColumns = useMemo(() => {
    if (!meta?.dayColumns?.length) return [];
    const filtered = filterDayColumnsByRange(
      meta.dayColumns,
      filters.startDate,
      filters.endDate,
    );
    return filtered.length ? filtered : meta.dayColumns;
  }, [meta?.dayColumns, filters.startDate, filters.endDate]);

  const pagination = useTablePagination(rows ?? []);

  const showOtColumn = useMemo(
    () =>
      (rows ?? []).some(
        (r) => r.otDays !== null && r.otDays !== undefined && r.otDays !== "",
      ),
    [rows],
  );

  const handleGenerate = async () => {
    if (!filters.startDate || !filters.endDate) {
      alert("Please select date range");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(dailyAttendanceUrl);
      if (!res.ok) throw new Error("Could not load attendance file");
      const buf = await res.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheetName = sheetNameForAttendanceDate(
        filters.startDate,
        wb.SheetNames,
      );
      if (!sheetName || !wb.Sheets[sheetName]) {
        throw new Error(
          `No attendance tab found for this month. Available: ${wb.SheetNames.join(", ")}`,
        );
      }
      const parsed = parseDailyAttendanceSheet(wb, sheetName, XLSX);
      if (!parsed?.rows?.length) {
        throw new Error("No attendance rows found in the selected sheet.");
      }
      setRows(parsed.rows);
      setMeta({
        sheetName: parsed.sheetName,
        sheetTitle: parsed.sheetTitle,
        workbookSheets: wb.SheetNames,
        dayColumns: parsed.dayColumns ?? [],
      });
    } catch (e) {
      setRows(null);
      setMeta(null);
      setError(e?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isHr ? "Attendance report" : "Daily attendance report"}
        </CardTitle>
        <CardDescription>
          Loaded from DailyAttendance.xlsx. Each day column shows the mark from
          the sheet (P present, A absent / leave, WO week off, etc.). Day columns
          are limited to your selected date range when dates are available on the
          tab. The workbook tab follows the start date (for example May 2026 uses
          the {"MAY'26"} tab when it exists).
          {isHr ? " HR view includes all promoters and distributors in the file." : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
          <div className="space-y-2">
            <Label>Start date *</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDate: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>End date *</Label>
            <Input
              type="date"
              value={filters.endDate}
              min={filters.startDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, endDate: e.target.value }))
              }
            />
          </div>
        </div>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="bg-[#433228] hover:bg-[#5a4238]"
        >
          {loading ? "Loading…" : "Generate report"}
        </Button>

        {error && (
          <p className="text-sm text-red-600 border border-red-200 rounded-md p-3 bg-red-50">
            {error}
          </p>
        )}

        {rows && meta && (
          <div className="mt-6 space-y-3">
            <div>
              <h3 className="text-lg font-semibold">
                Report period:{" "}
                {new Date(`${filters.startDate}T12:00:00`).toLocaleDateString()}{" "}
                –{" "}
                {new Date(`${filters.endDate}T12:00:00`).toLocaleDateString()}
              </h3>
              <p className="text-sm text-gray-600">
                Workbook tab: <span className="font-medium">{meta.sheetName}</span>
                {meta.sheetTitle ? (
                  <>
                    {" "}
                    — <span className="italic">{meta.sheetTitle}</span>
                  </>
                ) : null}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Day columns follow the workbook grid. Colours:{" "}
              <span className="font-medium text-emerald-800">P</span> present,{" "}
              <span className="font-medium text-rose-800">A</span> absent / leave,{" "}
              <span className="font-medium text-sky-800">WO</span> week off. Other
              codes match the file.
              {visibleDayColumns.length > 0 &&
              meta.dayColumns?.length > visibleDayColumns.length
                ? " Only days inside your selected range are shown."
                : null}
            </p>
            <div className="overflow-x-auto border rounded-md max-h-[70vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-20 bg-white whitespace-nowrap min-w-[3rem] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                      S. No.
                    </TableHead>
                    <TableHead className="sticky left-[3.25rem] z-20 bg-white whitespace-nowrap min-w-[6rem] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                      Supervisor
                    </TableHead>
                    <TableHead className="sticky left-[9.5rem] z-20 bg-white whitespace-nowrap min-w-[7rem] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                      Promoter
                    </TableHead>
                    <TableHead className="whitespace-nowrap min-w-[6rem]">Shop</TableHead>
                    <TableHead className="whitespace-nowrap min-w-[6rem]">
                      Location
                    </TableHead>
                    {visibleDayColumns.map((col) => (
                      <TableHead
                        key={col.colIndex}
                        title={col.dateIso ? `${col.dateIso} (${col.label})` : col.label}
                        className="text-center p-1 min-w-[2.35rem] max-w-[3rem] text-[0.65rem] font-semibold leading-tight text-gray-800 align-bottom border-l border-gray-100"
                      >
                        {col.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-right whitespace-nowrap border-l border-gray-200">
                      Present days
                    </TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      Absent days
                    </TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      Paid leave
                    </TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      Week off
                    </TableHead>
                    {showOtColumn ? (
                      <TableHead className="text-right whitespace-nowrap">
                        OT days
                      </TableHead>
                    ) : null}
                    <TableHead className="text-right whitespace-nowrap">
                      Total days
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.paginatedItems.map((row, index) => (
                    <TableRow key={`${row.sno}-${row.promoterName}-${index}`}>
                      <TableCell className="sticky left-0 z-10 bg-white font-medium min-w-[3rem] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                        {row.sno}
                      </TableCell>
                      <TableCell className="sticky left-[3.25rem] z-10 bg-white min-w-[6rem] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                        {row.supervisor || "—"}
                      </TableCell>
                      <TableCell className="sticky left-[9.5rem] z-10 bg-white min-w-[7rem] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                        {row.promoterName}
                      </TableCell>
                      <TableCell className="min-w-[6rem]">{row.shop}</TableCell>
                      <TableCell className="min-w-[6rem]">{row.location}</TableCell>
                      {visibleDayColumns.map((col) => {
                        const rawMark = getDayMark(row, col, meta.dayColumns);
                        const displayMark = displayDayCellMark(rawMark);
                        return (
                          <TableCell
                            key={col.colIndex}
                            title={
                              col.dateIso
                                ? displayMark
                                  ? `${col.dateIso}: ${displayMark}`
                                  : col.dateIso
                                : displayMark || undefined
                            }
                            className={`p-0.5 text-center text-xs rounded-sm ${attendanceMarkClass(displayMark)}`}
                          >
                            {displayMark || ""}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right border-l border-gray-100">
                        {row.presentDays}
                      </TableCell>
                      <TableCell className="text-right">{row.absentDays}</TableCell>
                      <TableCell className="text-right">{row.paidLeave}</TableCell>
                      <TableCell className="text-right">{row.weekOff}</TableCell>
                      {showOtColumn ? (
                        <TableCell className="text-right">
                          {row.otDays ?? "—"}
                        </TableCell>
                      ) : null}
                      <TableCell className="text-right font-medium">
                        {row.totalPayableDays}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {rows.length > 0 && <TablePaginationControls {...pagination} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupervisorDailyAttendanceReport;
