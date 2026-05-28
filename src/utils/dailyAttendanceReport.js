/**
 * Parse "Daily Attendance" workbook (DailyAttendance.xlsx) into tabular rows.
 * Supports FEB-style (Department / Designation) and MAR+ style (Outlet / Location) header rows.
 * Handles rows with leading empty S.NO / SUPERVISOR cells and fills blank shop/location from the row above.
 */

const MONTH_ABBREV = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

function normalizeHeader(cell) {
  return String(cell ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Build { normalizedHeader: columnIndex } from header row */
function headerIndexMap(headerRow) {
  const map = {};
  headerRow.forEach((cell, idx) => {
    const key = normalizeHeader(cell);
    if (key) map[key] = idx;
  });
  return map;
}

function colIdx(map, ...aliases) {
  for (const a of aliases) {
    const k = normalizeHeader(a);
    if (k in map) return map[k];
  }
  for (const key of Object.keys(map)) {
    for (const a of aliases) {
      if (key.includes(normalizeHeader(a))) return map[key];
    }
  }
  return -1;
}

function cell(row, idx) {
  if (idx < 0) return "";
  const v = row[idx];
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function numish(v) {
  if (v === "" || v === undefined || v === null) return "";
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}

/** Excel serial date → local Date (UTC midnight for that calendar day). */
export function excelSerialToLocalDate(serial) {
  const n = Number(serial);
  if (!Number.isFinite(n) || n < 1) return null;
  const utcMs = (n - 25569) * 86400 * 1000;
  return new Date(utcMs);
}

function formatYmd(d) {
  if (!d || Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse sheet tab like MAR'26 → { year: 2026, month: 3 } (month 1–12). */
export function parseSheetMonthYear(sheetName) {
  const s = String(sheetName).replace(/\s/g, "");
  const m = s.match(/^([A-Z]{3})['']?(\d{2})$/i);
  if (!m) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const mon = m[1].toUpperCase();
  const idx = MONTH_ABBREV.indexOf(mon);
  const yy = parseInt(m[2], 10);
  return {
    year: 2000 + yy,
    month: idx >= 0 ? idx + 1 : 1,
  };
}

/** First index after daily grid (summary columns). */
function getDayGridEndIndex(h, dayStart, map) {
  const iPresent = colIdx(
    map,
    "present days",
    "total present days",
  );
  const iAbsent = colIdx(map, "absent days", "total absent days");
  const iPaidLeave = colIdx(map, "paid leave");
  const iWo = colIdx(
    map,
    "no. of wo",
    "no of wo",
    "no. holidays",
    "no holidays",
  );
  const iTotal = colIdx(
    map,
    "total payable days",
    "total working days",
  );
  const iOt = colIdx(map, "ot days");
  const candidates = [iPresent, iAbsent, iPaidLeave, iWo, iTotal, iOt].filter(
    (i) => typeof i === "number" && i > dayStart,
  );
  if (candidates.length) return Math.min(...candidates);
  for (let j = dayStart + 1; j < h.length; j++) {
    const t = normalizeHeader(h[j]);
    if (
      t.includes("present") ||
      t.includes("absent") ||
      t === "lop"
    ) {
      return j;
    }
  }
  return h.length;
}

/**
 * Build metadata for each calendar day column (label + ISO date for filtering).
 */
function buildDayColumnMeta(h, dayStart, dayEnd, sheetYear, sheetMonth) {
  const cols = [];
  if (dayEnd <= dayStart) return cols;

  const firstRaw = h[dayStart];
  const firstN =
    typeof firstRaw === "number"
      ? firstRaw
      : Number(String(firstRaw ?? "").trim());

  const useSerial =
    Number.isFinite(firstN) && firstN > 40000;

  if (useSerial) {
    for (let c = dayStart; c < dayEnd; c++) {
      const raw = h[c];
      const sn =
        typeof raw === "number" ? raw : Number(String(raw ?? "").trim());
      let dateIso = null;
      let label = String(raw ?? "").trim();
      if (Number.isFinite(sn) && sn > 40000) {
        const dt = excelSerialToLocalDate(sn);
        dateIso = formatYmd(dt);
        if (dt && !Number.isNaN(dt.getTime())) {
          label = `${dt.getDate()}/${dt.getMonth() + 1}`;
        }
      }
      cols.push({ colIndex: c, label, dateIso });
    }
    return cols;
  }

  /* Consecutive calendar days (FEB-style 26,27,…,1,2,…) */
  const firstDom =
    Number.isFinite(firstN) && firstN >= 1 && firstN <= 31
      ? firstN
      : 1;
  const start = new Date(sheetYear, sheetMonth - 1, firstDom);
  if (Number.isNaN(start.getTime())) return cols;
  for (let i = 0; i < dayEnd - dayStart; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateIso = formatYmd(d);
    const dom = d.getDate();
    const label = `${dom}/${d.getMonth() + 1}`;
    cols.push({ colIndex: dayStart + i, label, dateIso });
  }
  return cols;
}

/** Keep day columns whose ISO date falls in [startIso, endIso] inclusive. */
export function filterDayColumnsByRange(dayColumns, startIso, endIso) {
  if (!dayColumns?.length || !startIso || !endIso) return dayColumns ?? [];
  return dayColumns.filter((col) => {
    if (!col.dateIso) return true;
    return col.dateIso >= startIso && col.dateIso <= endIso;
  });
}

/** First column index of daily grid: Excel serial dates or calendar day numbers (1–31) */
function getDayOrSummaryStartIndex(headerRow) {
  for (let j = 0; j < headerRow.length; j++) {
    const v = headerRow[j];
    const n = typeof v === "number" ? v : Number(String(v).trim());
    if (Number.isFinite(n) && n > 40000) return j;
  }
  for (let j = 0; j < headerRow.length; j++) {
    const v = headerRow[j];
    const n = typeof v === "number" ? v : Number(String(v).trim());
    if (Number.isFinite(n) && n >= 1 && n <= 31) return j;
  }
  return Math.min(5, headerRow.length);
}

/**
 * Trim leading/trailing empty cells in the meta region, then map to
 * sno, supervisor, promoter (BA), shop (outlet/dept), location.
 */
function parseMetaFromRowSlice(metaCells) {
  const raw = metaCells.map((c) => String(c ?? "").trim());
  while (raw.length && raw[0] === "") raw.shift();
  while (raw.length && raw[raw.length - 1] === "") raw.pop();
  const parts = raw;

  let sno = "";
  let supervisor = "";
  let promoterName = "";
  let shop = "";
  let location = "";

  if (parts.length === 0) {
    return { sno, supervisor, promoterName, shop, location };
  }
  if (parts.length === 1) {
    promoterName = parts[0];
    return { sno, supervisor, promoterName, shop, location };
  }
  if (parts.length === 2) {
    if (/^\d+$/.test(parts[0])) {
      sno = parts[0];
      promoterName = parts[1];
    } else {
      promoterName = parts[0];
      shop = parts[1];
    }
    return { sno, supervisor, promoterName, shop, location };
  }
  if (parts.length === 4 && /^\d+$/.test(parts[0])) {
    sno = parts[0];
    promoterName = parts[1];
    shop = parts[2];
    location = parts[3];
    return { sno, supervisor, promoterName, shop, location };
  }

  location = parts[parts.length - 1];
  shop = parts[parts.length - 2];
  promoterName = parts[parts.length - 3];
  const prefix = parts.slice(0, parts.length - 3);

  if (prefix.length === 0) {
    return { sno, supervisor, promoterName, shop, location };
  }
  if (prefix.length === 1) {
    if (/^\d+$/.test(prefix[0])) sno = prefix[0];
    else supervisor = prefix[0];
    return { sno, supervisor, promoterName, shop, location };
  }
  // Two or more prefix cells: first is usually S.NO when numeric
  if (/^\d+$/.test(prefix[0])) {
    sno = prefix[0];
    supervisor = prefix.slice(1).join(" ").trim();
  } else {
    supervisor = prefix.join(" ").trim();
  }
  return { sno, supervisor, promoterName, shop, location };
}

/**
 * @param {string[][]} matrix - sheet as array of rows
 * @param {string} sheetName - workbook tab (e.g. MAR'26) for calendar context
 */
export function parseDailyAttendanceMatrix(matrix, sheetName = "") {
  if (!matrix?.length) return null;

  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(matrix.length, 30); i++) {
    const first = normalizeHeader(matrix[i]?.[0]);
    if (first === "s.no" || first === "s no") {
      headerRowIndex = i;
      break;
    }
  }
  if (headerRowIndex < 0) return null;

  const h = matrix[headerRowIndex];
  const map = headerIndexMap(h);
  const dayStart = getDayOrSummaryStartIndex(h);

  const iPresent = colIdx(
    map,
    "present days",
    "total present days",
  );
  const iAbsent = colIdx(map, "absent days", "total absent days");
  const iPaidLeave = colIdx(map, "paid leave");
  const iWo = colIdx(
    map,
    "no. of wo",
    "no of wo",
    "no. holidays",
    "no holidays",
  );
  const iTotal = colIdx(
    map,
    "total payable days",
    "total working days",
  );
  const iOt = colIdx(map, "ot days");

  const dayEnd = getDayGridEndIndex(h, dayStart, map);
  const { year: sheetYear, month: sheetMonth } = parseSheetMonthYear(sheetName);
  const dayColumns = buildDayColumnMeta(
    h,
    dayStart,
    dayEnd,
    sheetYear,
    sheetMonth,
  );

  const subtitle = String(matrix[1]?.[0] ?? "").trim();

  let carrySupervisor = "";
  let carryShop = "";
  let carryLocation = "";

  const rows = [];
  for (let r = headerRowIndex + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row?.length) continue;

    const firstCell = String(row[0] ?? "").trim();
    if (firstCell.toUpperCase() === "S.NO") {
      carrySupervisor = "";
      carryShop = "";
      carryLocation = "";
      continue;
    }

    const meta = parseMetaFromRowSlice(row.slice(0, dayStart));
    if (!meta.promoterName) continue;
    const pUpper = meta.promoterName.trim().toUpperCase();
    if (
      pUpper === "DEPARTMENT" ||
      pUpper === "DESIGNATION" ||
      pUpper === "BA NAME" ||
      pUpper === "OUTLET" ||
      pUpper === "LOCATION" ||
      pUpper.replace(/\s+/g, " ").includes("EMPLOYEE NAME")
    ) {
      continue;
    }

    if (String(meta.supervisor ?? "").trim().toUpperCase() === "S.NO") {
      continue;
    }

    if (meta.supervisor) {
      if (carrySupervisor && meta.supervisor !== carrySupervisor) {
        carryShop = "";
        carryLocation = "";
      }
      carrySupervisor = meta.supervisor;
    }
    const supervisor = meta.supervisor || carrySupervisor;

    let shop = meta.shop;
    if (shop) carryShop = shop;
    else if (carryShop) shop = carryShop;

    let location = meta.location;
    if (location) carryLocation = location;
    else if (carryLocation) location = carryLocation;

    if (!shop && location) shop = location;

    const snoVal =
      meta.sno !== "" && meta.sno !== undefined
        ? numish(meta.sno)
        : rows.length + 1;

    rows.push({
      sno: snoVal,
      supervisor,
      promoterName: meta.promoterName,
      shop: shop || "—",
      location: location || "—",
      presentDays: numish(cell(row, iPresent)),
      absentDays: numish(cell(row, iAbsent)),
      paidLeave: cell(row, iPaidLeave) === "" ? "—" : numish(cell(row, iPaidLeave)),
      weekOff: cell(row, iWo) === "" ? "—" : numish(cell(row, iWo)),
      totalPayableDays: numish(cell(row, iTotal)),
      otDays:
        iOt >= 0 && cell(row, iOt) !== ""
          ? numish(cell(row, iOt))
          : null,
      dayMarks: dayColumns.map((dc) => cell(row, dc.colIndex)),
    });
  }

  return {
    rows,
    dayColumns,
    sheetTitle: subtitle,
    headerRowIndex,
  };
}

/**
 * @param {import('xlsx').WorkBook} workbook
 * @param {string} sheetName
 * @param {typeof import('xlsx')} XLSX
 */
export function parseDailyAttendanceSheet(workbook, sheetName, XLSX) {
  const ws = workbook.Sheets[sheetName];
  if (!ws) return null;
  const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  const parsed = parseDailyAttendanceMatrix(matrix, sheetName);
  if (!parsed) return null;
  return { ...parsed, sheetName };
}

/**
 * Pick sheet like MAR'26 from ISO date (yyyy-mm-dd).
 * @param {string} isoDate
 * @param {string[]} availableSheets
 */
export function sheetNameForAttendanceDate(isoDate, availableSheets) {
  if (!availableSheets?.length) return null;
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return availableSheets[0];
  const mon = MONTH_ABBREV[d.getMonth()];
  const yy = String(d.getFullYear() % 100).padStart(2, "0");
  const candidate = `${mon}'${yy}`;
  if (availableSheets.includes(candidate)) return candidate;
  const loose = availableSheets.find(
    (s) => s.replace(/\s/g, "").toUpperCase().startsWith(mon),
  );
  return loose ?? availableSheets[0];
}
