import * as XLSX from "xlsx";

function getCell(ws, r, c) {
  const cell = ws[XLSX.utils.encode_cell({ r, c })];
  if (!cell || cell.v === null || cell.v === undefined) return "";
  return cell.v;
}

function normalizeCell(v) {
  if (v === "" || v === null || v === undefined) return "";
  if (typeof v === "string") return v.replace(/\r\n/g, " ").trim();
  return v;
}

function rowHasIdentity(ws, r) {
  for (let c = 0; c <= 5; c++) {
    const v = normalizeCell(getCell(ws, r, c));
    if (v !== "") return true;
  }
  return false;
}

function toNumber(v) {
  if (v === "" || v === null || v === undefined) return 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function displayReportTitle(raw) {
  const asStr =
    raw === null || raw === undefined
      ? ""
      : typeof raw === "string"
        ? raw
        : String(raw);
  const n = normalizeCell(asStr);
  if (!n) return "PROMOTER DAILY SALES DETAILS";
  return n
    .replace(/BA\s+DAILY\s+SALES\s+DETAILS/gi, "PROMOTER DAILY SALES DETAILS")
    .trim();
}

/**
 * Parses one worksheet from salesreport.xlsx (promoter daily sales layout;
 * sheet title "BA DAILY SALES DETAILS" is shown as "PROMOTER DAILY SALES DETAILS").
 * Row index 3: unit MRP (₹) per product; row index 4: product name; row index 5+: data.
 */
export function parseBaDailySalesSheet(ws) {
  if (!ws || !ws["!ref"]) {
    return {
      title: "",
      productColumns: [],
      rows: [],
    };
  }

  const range = XLSX.utils.decode_range(ws["!ref"]);
  let lastProductCol = 5;
  for (let c = 6; c <= range.e.c; c++) {
    const name = normalizeCell(getCell(ws, 4, c));
    if (name !== "") lastProductCol = c;
  }

  const productColumns = [];
  for (let c = 6; c <= lastProductCol; c++) {
    productColumns.push({
      col: c,
      /** MRP / unit price (₹) from the sheet’s numeric header row above product names */
      unitPrice: toNumber(getCell(ws, 3, c)),
      name: normalizeCell(getCell(ws, 4, c)) || `Column ${c + 1}`,
    });
  }

  const rows = [];
  for (let r = 5; r <= range.e.r; r++) {
    if (!rowHasIdentity(ws, r)) continue;

    const sno = getCell(ws, r, 0);
    const headerProbe = normalizeCell(String(sno)).toUpperCase();
    if (headerProbe === "S.NO" || headerProbe === "S.NO.") continue;

    const quantities = productColumns.map(({ col }) => {
      const q = getCell(ws, r, col);
      if (q === "" || q === null || q === undefined) return "";
      if (typeof q === "number" && Number.isFinite(q)) return q;
      const n = Number(q);
      return Number.isFinite(n) ? n : q;
    });

    const lineAmounts = productColumns.map((pc, i) => {
      const qty = toNumber(quantities[i]);
      return Math.round(qty * pc.unitPrice);
    });
    const rowTotal = lineAmounts.reduce((a, b) => a + b, 0);

    rows.push({
      sno,
      supervisor: normalizeCell(getCell(ws, r, 1)),
      // Excel column "BA name" — promoter name in the app
      baName: normalizeCell(getCell(ws, r, 2)),
      outlet: normalizeCell(getCell(ws, r, 3)),
      town: normalizeCell(getCell(ws, r, 4)),
      present: getCell(ws, r, 5),
      quantities,
      lineAmounts,
      rowTotal,
    });
  }

  return {
    title: displayReportTitle(getCell(ws, 0, 0)),
    productColumns,
    rows,
  };
}

export function readSalesReportWorkbook(buffer) {
  return XLSX.read(buffer, { type: "array", cellDates: false });
}
