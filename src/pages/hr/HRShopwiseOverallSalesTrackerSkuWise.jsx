import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "hr_shopwise_overall_sales_tracker_sku_wise_v1";

const SKU_LABELS = [
  "GOLD-10 0G",
  "Regular F.Wash",
  "Rose Petals",
  "Orange Peel",
  "Hibiscus Powder",
  "Kasthuri Manjal",
  "Multani Mitti",
  "Aloe Vera Gel GREEN 100Gms",
  "Rose Water 120ml",
  "Goat's Milk Soap",
  "Charcoal Soap",
  "Coconut Oil Soap",
  "Herbal Soap",
  "Six Oil Soap",
  "Gold Soap",
  "Pungam Oil",

  "Avarampoo Shampoo 120ml",
  "Bhringraj Shampoo 120ml",
  "Indigo Henna Shampoo 120ml",
  "Onion-Fenugreek Shampoo 120ml",
  "Flaxseed Shampoo 120ml",
  "Rosemary Shampoo 120ml",
  "Secure Shampoo 320ml",

  "Hair Wash 100gms",
  "Henna Powder",
  "Hibiscus 120ml",
  "Hair Color 10g",
  "Hair Color 20g",

  "Vitamin C Soap",
  "Milk Saffron Soap",
  "Manjistha Soap",

  "Vitamin C Serum",
  "Milk Saffron Serum",
  "Vitamin C Cream",
  "Milk Saffron Cream",

  "Flaxseed Conditioner 120ml",
  "Rosemary Conditioner 120ml",
  "Bhringraj Conditioner 100ml",

  "Aloe Vera White Shampoo 120ml",
  "Bhringraj Shampoo 120ml",
  "Onion-Fenugreek Shampoo 120ml",

  "Napkin L6",
  "Napkin L12",
  "Napkin XL6",
  "Napkin XL12",
  "Napkin XXL6",
  "Napkin XXL12",
];

function buildSkuItems(labels) {
  const seen = new Map();
  return labels.map((label) => {
    const count = (seen.get(label) ?? 0) + 1;
    seen.set(label, count);
    const id = count === 1 ? label : `${label}__${count}`;
    return { id, label };
  });
}

const SKU_ITEMS = buildSkuItems(SKU_LABELS);

function isoToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dayFromIso(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { weekday: "long" });
}

function parseQty(value) {
  if (value === "" || value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function emptySkuMap() {
  return Object.fromEntries(SKU_ITEMS.map((s) => [s.id, 0]));
}

function makeRowId() {
  return crypto?.randomUUID
    ? crypto.randomUUID()
    : `row_${Date.now()}_${Math.random()}`;
}

function createEntryRow({ date } = {}) {
  const d = date ?? "";
  return {
    id: makeRowId(),
    date: d,
    day: d ? dayFromIso(d) : "",
    skus: emptySkuMap(),
  };
}

function normalizeEntryRows(rows, minCount = 0) {
  const normalized = Array.isArray(rows)
    ? rows.map((r) => ({
        id: r.id ?? makeRowId(),
        date: r.date ?? "",
        day: r.day ?? (r.date ? dayFromIso(r.date) : ""),
        skus: { ...emptySkuMap(), ...(r.skus || {}) },
      }))
    : [];

  while (normalized.length < minCount) {
    normalized.push(createEntryRow({ date: "" }));
  }
  return normalized;
}

function sumSkuMap(map) {
  return Object.values(map || {}).reduce((acc, val) => acc + parseQty(val), 0);
}

function escapeCsv(value) {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(rows) {
  return rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
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

const buildInitialState = () => {
  const openingStock = { ...emptySkuMap() };
  // sample values matching screenshot (first two SKU cells)
  // if (SKU_ITEMS[0]) openingStock[SKU_ITEMS[0].id] = 10;
  // if (SKU_ITEMS[1]) openingStock[SKU_ITEMS[1].id] = 12;

  const physicalStock = { ...emptySkuMap() };

  const salesRows = Array.from({ length: 12 }).map((_, i) => {
    const row = createEntryRow({ date: i === 0 ? isoToday() : "" });
    // if (i === 0 && SKU_ITEMS[0]) row.skus[SKU_ITEMS[0].id] = 2;
    return row;
  });

  // Purchase Details section rows (like the sheet)
  const purchaseRows = Array.from({ length: 10 }).map(() =>
    createEntryRow({ date: "" }),
  );

  return {
    meta: { noOfDays: 0 },
    openingStock,
    purchaseRows,
    salesRows,
    physicalStock,
  };
};

function clsx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const HRShopwiseOverallSalesTrackerSkuWise = () => {
  const [data, setData] = useState(buildInitialState);

  const preventWheelNumberChange = (e) => {
    // Prevent accidental value change while scrolling on focused number inputs
    e.currentTarget.blur();
  };

  const selectAllOnFocus = (e) => {
    // Spreadsheet-like: typing replaces the whole value (prevents "044" from "0" + "44")
    e.currentTarget.select();
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;

      const safe = {
        meta: { noOfDays: parseQty(parsed?.meta?.noOfDays) },
        openingStock: { ...emptySkuMap(), ...(parsed.openingStock || {}) },
        physicalStock: { ...emptySkuMap(), ...(parsed.physicalStock || {}) },
        // Keep old saved data but always ensure at least 10 purchase rows are available.
        purchaseRows: normalizeEntryRows(parsed.purchaseRows, 10),
        salesRows:
          normalizeEntryRows(parsed.salesRows, 1).length > 0
            ? normalizeEntryRows(parsed.salesRows, 1)
            : buildInitialState().salesRows,
      };

      setData(safe);
    } catch {
      // ignore corrupted localStorage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore quota errors
    }
  }, [data]);

  const totals = useMemo(() => {
    const totalPurchase = emptySkuMap();
    const totalSales = emptySkuMap();
    const closingStock = emptySkuMap();
    const difference = emptySkuMap();

    for (const row of data.purchaseRows || []) {
      for (const sku of SKU_ITEMS) {
        totalPurchase[sku.id] += parseQty(row?.skus?.[sku.id]);
      }
    }

    for (const row of data.salesRows || []) {
      for (const sku of SKU_ITEMS) {
        totalSales[sku.id] += parseQty(row?.skus?.[sku.id]);
      }
    }

    for (const sku of SKU_ITEMS) {
      const opening = parseQty(data.openingStock?.[sku.id]);
      const purchase = parseQty(totalPurchase[sku.id]);
      const sales = parseQty(totalSales[sku.id]);
      const closing = opening + purchase - sales;
      closingStock[sku.id] = closing;

      const physical = parseQty(data.physicalStock?.[sku.id]);
      difference[sku.id] = physical - closing;
    }

    return { totalPurchase, totalSales, closingStock, difference };
  }, [data]);

  const overallSummary = useMemo(() => {
    const opening = sumSkuMap(data.openingStock);
    const purchase = sumSkuMap(totals.totalPurchase);
    const sales = sumSkuMap(totals.totalSales);
    const closing = sumSkuMap(totals.closingStock);
    const difference = sumSkuMap(totals.difference);
    return { opening, purchase, sales, closing, difference };
  }, [data.openingStock, totals]);

  const setOpening = (skuId, value) => {
    setData((prev) => ({
      ...prev,
      openingStock: { ...prev.openingStock, [skuId]: parseQty(value) },
    }));
  };

  const setPhysical = (skuId, value) => {
    setData((prev) => ({
      ...prev,
      physicalStock: { ...prev.physicalStock, [skuId]: parseQty(value) },
    }));
  };

  const setSaleCell = (rowId, skuId, value) => {
    setData((prev) => ({
      ...prev,
      salesRows: prev.salesRows.map((r) =>
        r.id === rowId
          ? { ...r, skus: { ...r.skus, [skuId]: parseQty(value) } }
          : r,
      ),
    }));
  };

  const setSaleDate = (rowId, value) => {
    setData((prev) => ({
      ...prev,
      salesRows: prev.salesRows.map((r) =>
        r.id === rowId
          ? { ...r, date: value, day: value ? dayFromIso(value) : "" }
          : r,
      ),
    }));
  };

  const setSaleDay = (rowId, value) => {
    setData((prev) => ({
      ...prev,
      salesRows: prev.salesRows.map((r) =>
        r.id === rowId ? { ...r, day: value } : r,
      ),
    }));
  };

  const addSalesRow = () => {
    setData((prev) => ({
      ...prev,
      salesRows: [...prev.salesRows, createEntryRow({ date: isoToday() })],
    }));
  };

  const setPurchaseCell = (rowId, skuId, value) => {
    setData((prev) => ({
      ...prev,
      purchaseRows: prev.purchaseRows.map((r) =>
        r.id === rowId
          ? { ...r, skus: { ...r.skus, [skuId]: parseQty(value) } }
          : r,
      ),
    }));
  };

  const setPurchaseDate = (rowId, value) => {
    setData((prev) => ({
      ...prev,
      purchaseRows: prev.purchaseRows.map((r) =>
        r.id === rowId
          ? { ...r, date: value, day: value ? dayFromIso(value) : "" }
          : r,
      ),
    }));
  };

  const setPurchaseDay = (rowId, value) => {
    setData((prev) => ({
      ...prev,
      purchaseRows: prev.purchaseRows.map((r) =>
        r.id === rowId ? { ...r, day: value } : r,
      ),
    }));
  };

  const addPurchaseRow = () => {
    setData((prev) => ({
      ...prev,
      purchaseRows: [...prev.purchaseRows, createEntryRow({ date: "" })],
    }));
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(buildInitialState());
  };

  const exportToCsv = () => {
    const header = [
      "Section",
      "S.No",
      "Date",
      "Day",
      ...SKU_ITEMS.map((s) => s.label),
    ];
    const rows = [header];

    rows.push([
      "META: NO.OF DAYS",
      "",
      "",
      String(data.meta?.noOfDays ?? 0),
      ...SKU_ITEMS.map(() => ""),
    ]);
    rows.push([
      "Opening Stock",
      "",
      "",
      "",
      ...SKU_ITEMS.map((s) => data.openingStock?.[s.id] ?? 0),
    ]);

    (data.salesRows || []).forEach((r, idx) => {
      rows.push([
        "Daily Sales",
        String(idx + 1),
        r.date ?? "",
        r.day ?? "",
        ...SKU_ITEMS.map((s) => r?.skus?.[s.id] ?? 0),
      ]);
    });

    (data.purchaseRows || []).forEach((r, idx) => {
      rows.push([
        "Purchase Details",
        String(idx + 1),
        r.date ?? "",
        r.day ?? "",
        ...SKU_ITEMS.map((s) => r?.skus?.[s.id] ?? 0),
      ]);
    });

    rows.push(["", "", "", "", ...SKU_ITEMS.map(() => "")]);
    rows.push([
      "REPORT: TOTAL PURCHASE",
      "",
      "",
      "",
      ...SKU_ITEMS.map((s) => totals.totalPurchase?.[s.id] ?? 0),
    ]);
    rows.push([
      "REPORT: TOTAL SALES",
      "",
      "",
      "",
      ...SKU_ITEMS.map((s) => totals.totalSales?.[s.id] ?? 0),
    ]);
    rows.push([
      "REPORT: AUTO CLOSING STOCK",
      "",
      "",
      "",
      ...SKU_ITEMS.map((s) => totals.closingStock?.[s.id] ?? 0),
    ]);
    rows.push([
      "REPORT: PHYSICAL STOCK",
      "",
      "",
      "",
      ...SKU_ITEMS.map((s) => data.physicalStock?.[s.id] ?? 0),
    ]);
    rows.push([
      "REPORT: DIFFERENCE",
      "",
      "",
      "",
      ...SKU_ITEMS.map((s) => totals.difference?.[s.id] ?? 0),
    ]);

    const csv = rowsToCsv(rows);
    downloadCSV(
      csv,
      `Shopwise_Overall_Sales_Tracker_SKU_Wise_${isoToday()}.csv`,
    );
  };

  // Sheet-like layout helpers (sticky left 3 columns + sticky header)
  const leftCellBase =
    "px-3 py-2 text-sm border-r border-gray-300 border-b border-gray-300";
  const skuCellBase =
    "w-24 min-w-24 px-2 py-2 border-r border-gray-300 border-b border-gray-300";

  const cellInputClass =
    "w-24 min-w-24 h-8 rounded-sm border border-gray-300 bg-white px-1.5 text-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[#433228]/30 hover:border-[#433228]/40 transition-colors";
  const dateInputClass =
    "w-32 h-8 rounded-sm border border-gray-300 bg-white px-1.5 text-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[#433228]/30 hover:border-[#433228]/40 transition-colors";

  const stickyLeft1 = "sticky left-0 z-10";
  const stickyLeft2 = "sticky left-16 z-10";
  const stickyLeft3 = "sticky left-[208px] z-10";
  const stickyHeader = "sticky top-0 z-30";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Shopwise Overall Sales Tracker - SKU Wise
          </h1>
          <p className="text-gray-600 mt-1">
            Google-sheet style SKU tracker with live formula calculations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addSalesRow}
            className="px-4 py-2 rounded-md bg-[#433228] hover:bg-[#5a4238] text-white text-sm font-semibold shadow-sm"
          >
            Add Row
          </button>
          <button
            type="button"
            onClick={addPurchaseRow}
            className="px-4 py-2 rounded-md bg-[#433228] hover:bg-[#5a4238] text-white text-sm font-semibold shadow-sm"
          >
            Add Purchase Row
          </button>
          <button
            type="button"
            onClick={exportToCsv}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-sm font-semibold shadow-sm"
          >
            Export to CSV
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="px-4 py-2 rounded-md border border-red-300 bg-white hover:bg-red-50 text-red-700 text-sm font-semibold shadow-sm"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Overall Opening</p>
          <p className="text-lg font-bold text-gray-900">
            {overallSummary.opening}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Overall Purchase</p>
          <p className="text-lg font-bold text-blue-700">
            {overallSummary.purchase}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Overall Sales</p>
          <p className="text-lg font-bold text-amber-700">
            {overallSummary.sales}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Overall Closing</p>
          <p className="text-lg font-bold text-emerald-700">
            {overallSummary.closing}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Overall Difference</p>
          <p
            className={`text-lg font-bold ${overallSummary.difference >= 0 ? "text-green-700" : "text-red-700"}`}
          >
            {overallSummary.difference}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-white to-[#f7f3f1]">
          <div className="text-sm text-gray-700 font-medium">
            Formula: Closing Stock = Opening Stock + Total Purchase − Total
            Sales. Difference = Physical − Closing.
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Sheet title row (like your screenshot) */}
            <div className="bg-[#433228] text-white">
              <div className="grid grid-flow-col auto-cols-max">
                <div
                  className={clsx(
                    "w-16 min-w-16 px-3 py-2 border-r border-gray-700",
                    stickyLeft1,
                    "bg-[#433228]",
                  )}
                />
                <div
                  className={clsx(
                    "w-36 min-w-36 px-3 py-2 border-r border-gray-700",
                    stickyLeft2,
                    "bg-[#433228]",
                  )}
                />
                <div
                  className={clsx(
                    "w-36 min-w-36 px-3 py-2 border-r border-gray-700",
                    stickyLeft3,
                    "bg-[#433228]",
                  )}
                />
                <div
                  className="px-3 py-2 text-sm font-bold tracking-wide text-center"
                  style={{ width: `${SKU_ITEMS.length * 96}px` }}
                >
                  SHOPWISE OVER ALL SALES TRACKER - SKU WISE
                </div>
              </div>
            </div>

            {/* Header */}
            <div className={clsx(stickyHeader, "bg-gray-200")}>
              <div className="grid grid-flow-col auto-cols-max border-b border-gray-300">
                <div
                  className={clsx(
                    "w-16 min-w-16 text-xs font-semibold text-gray-900 px-3 py-3 border-r border-gray-300",
                    stickyLeft1,
                    "bg-gray-200",
                  )}
                >
                  S.no
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 text-xs font-semibold text-gray-900 px-3 py-3 border-r border-gray-300",
                    stickyLeft2,
                    "bg-gray-200",
                  )}
                >
                  Date
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 text-xs font-semibold text-gray-900 px-3 py-3 border-r border-gray-300",
                    stickyLeft3,
                    "bg-gray-200",
                  )}
                >
                  Day
                </div>
                {SKU_ITEMS.map((sku) => (
                  <div
                    key={sku.id}
                    className="w-24 min-w-24 px-2 py-2 text-[11px] leading-4 font-semibold text-gray-900 border-r border-gray-300 whitespace-normal break-words text-center min-h-12 flex items-center justify-center"
                    title={sku.label}
                  >
                    {sku.label}
                  </div>
                ))}
              </div>
            </div>

            {/* OPENING STOCK POSITION (sheet yellow) */}
            <div className="bg-yellow-50">
              <div className="grid grid-flow-col auto-cols-max items-center">
                <div
                  className={clsx(
                    "w-16 min-w-16 bg-yellow-200",
                    leftCellBase,
                    stickyLeft1,
                  )}
                >
                  -
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200 font-semibold",
                    leftCellBase,
                    stickyLeft2,
                  )}
                >
                  OPENING STOCK POSITION
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200",
                    leftCellBase,
                    stickyLeft3,
                  )}
                >
                  -
                </div>
                {SKU_ITEMS.map((sku) => (
                  <div
                    key={sku.id}
                    className={clsx(skuCellBase, "bg-yellow-50")}
                  >
                    <input
                      className={cellInputClass}
                      type="number"
                      value={data.openingStock?.[sku.id] ?? 0}
                      onChange={(e) => setOpening(sku.id, e.target.value)}
                      onWheel={preventWheelNumberChange}
                      onFocus={selectAllOnFocus}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* DAILY SALES (main sheet grid) */}
            <div className="bg-yellow-50 border-t border-[#433228]/15">
              {(data.salesRows || []).map((row, idx) => (
                <div
                  key={row.id}
                  className="grid grid-flow-col auto-cols-max items-center"
                >
                  <div
                    className={clsx(
                      "w-16 min-w-16",
                      idx % 2 === 0 ? "bg-yellow-200" : "bg-[#e7df92]",
                      leftCellBase,
                      stickyLeft1,
                    )}
                  >
                    {idx + 1}
                  </div>
                  <div
                    className={clsx(
                      "w-36 min-w-36",
                      idx % 2 === 0 ? "bg-yellow-200" : "bg-[#e7df92]",
                      leftCellBase,
                      stickyLeft2,
                    )}
                  >
                    <input
                      className={dateInputClass}
                      type="date"
                      value={row.date ?? ""}
                      onChange={(e) => setSaleDate(row.id, e.target.value)}
                    />
                  </div>
                  <div
                    className={clsx(
                      "w-36 min-w-36",
                      idx % 2 === 0 ? "bg-yellow-200" : "bg-[#e7df92]",
                      leftCellBase,
                      stickyLeft3,
                    )}
                  >
                    <input
                      className={clsx(dateInputClass, "w-32")}
                      type="text"
                      value={row.day ?? ""}
                      onChange={(e) => setSaleDay(row.id, e.target.value)}
                      placeholder="Day"
                    />
                  </div>
                  {SKU_ITEMS.map((sku) => (
                    <div
                      key={sku.id}
                      className={clsx(
                        skuCellBase,
                        idx % 2 === 0 ? "bg-yellow-50" : "bg-[#faf8dc]",
                      )}
                    >
                      <input
                        className={cellInputClass}
                        type="number"
                        value={row?.skus?.[sku.id] ?? 0}
                        onChange={(e) =>
                          setSaleCell(row.id, sku.id, e.target.value)
                        }
                        onWheel={preventWheelNumberChange}
                        onFocus={selectAllOnFocus}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* PURCHASE DETAILS (separate section like sheet) */}
            <div className="bg-yellow-50 border-t border-[#433228]/15">
              {/* PURCHASE DETAILS title row (full-width, consistent height) */}
              <div className="bg-[#433228] text-white relative z-0">
                <div className="grid grid-flow-col auto-cols-max h-12 items-center">
                  <div
                    className={clsx(
                      "w-16 min-w-16 h-12 border-r border-gray-700",
                      stickyLeft1,
                      "bg-[#433228]",
                    )}
                  />
                  <div
                    className={clsx(
                      "w-36 min-w-36 h-12 px-3 text-sm font-extrabold tracking-wide border-r border-gray-700 flex items-center",
                      stickyLeft2,
                      "bg-[#433228]",
                    )}
                  >
                    PURCHASE DETAILS
                  </div>
                  <div
                    className={clsx(
                      "w-36 min-w-36 h-12 border-r border-gray-700",
                      stickyLeft3,
                      "bg-[#433228]",
                    )}
                  />
                  <div
                    style={{ width: `${SKU_ITEMS.length * 96}px` }}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Purchase section header row (grey like sheet header) */}
              <div className="bg-gray-200 relative z-10 ">
                <div className="grid grid-flow-col auto-cols-max items-center h-20 ">
                  <div
                    className={clsx(
                      "w-16 min-w-16 h-20 text-xs font-semibold text-gray-900 px-3 border-r border-gray-300 flex items-center",
                      stickyLeft1,
                      "bg-gray-200",
                    )}
                  >
                    S.no
                  </div>
                  <div
                    className={clsx(
                      "w-36 min-w-36 h-20 text-xs font-semibold text-gray-900 px-3 border-r border-gray-300 flex items-center",
                      stickyLeft2,
                      "bg-gray-200",
                    )}
                  >
                    Date
                  </div>
                  <div
                    className={clsx(
                      "w-36 min-w-36 h-20 text-xs font-semibold text-gray-900 px-3 border-r border-gray-300 flex items-center",
                      stickyLeft3,
                      "bg-gray-200",
                    )}
                  >
                    Day
                  </div>
                  {SKU_ITEMS.map((sku) => (
                    <div
                      key={sku.id}
                      className="w-24 min-w-24 px-2 py-2 text-[11px] leading-4 font-semibold text-gray-900 border-r border-gray-300 whitespace-normal break-words text-center min-h-12 flex items-center justify-center"
                      title={sku.label}
                    >
                      {sku.label}
                    </div>
                  ))}
                </div>
              </div>

              {(data.purchaseRows || []).map((row, idx) => (
                <div
                  key={row.id}
                  className="grid grid-flow-col auto-cols-max items-center"
                >
                  <div
                    className={clsx(
                      "w-16 min-w-16",
                      idx % 2 === 0 ? "bg-yellow-200" : "bg-[#e7df92]",
                      leftCellBase,
                      stickyLeft1,
                    )}
                  >
                    {idx + 1}
                  </div>
                  <div
                    className={clsx(
                      "w-36 min-w-36",
                      idx % 2 === 0 ? "bg-yellow-200" : "bg-[#e7df92]",
                      leftCellBase,
                      stickyLeft2,
                    )}
                  >
                    <input
                      className={dateInputClass}
                      type="date"
                      value={row.date ?? ""}
                      onChange={(e) => setPurchaseDate(row.id, e.target.value)}
                    />
                  </div>
                  <div
                    className={clsx(
                      "w-36 min-w-36",
                      idx % 2 === 0 ? "bg-yellow-200" : "bg-[#e7df92]",
                      leftCellBase,
                      stickyLeft3,
                    )}
                  >
                    <input
                      className={clsx(dateInputClass, "w-32")}
                      type="text"
                      value={row.day ?? ""}
                      onChange={(e) => setPurchaseDay(row.id, e.target.value)}
                      placeholder="Day"
                    />
                  </div>
                  {SKU_ITEMS.map((sku) => (
                    <div
                      key={sku.id}
                      className={clsx(
                        skuCellBase,
                        idx % 2 === 0 ? "bg-yellow-50" : "bg-[#faf8dc]",
                      )}
                    >
                      <input
                        className={cellInputClass}
                        type="number"
                        value={row?.skus?.[sku.id] ?? 0}
                        onChange={(e) =>
                          setPurchaseCell(row.id, sku.id, e.target.value)
                        }
                        onWheel={preventWheelNumberChange}
                        onFocus={selectAllOnFocus}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Reports rows (match screenshot naming) */}
            <div className="bg-yellow-50">
              {/* TOTAL PURCHASE SKU WISE */}
              <div className="grid grid-flow-col auto-cols-max items-center">
                <div
                  className={clsx(
                    "w-16 min-w-16 bg-yellow-200",
                    leftCellBase,
                    stickyLeft1,
                  )}
                >
                  -
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200 font-bold",
                    leftCellBase,
                    stickyLeft2,
                  )}
                >
                  TOTAL PURCHASE SKU WISE
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200",
                    leftCellBase,
                    stickyLeft3,
                  )}
                >
                  -
                </div>
                {SKU_ITEMS.map((sku) => (
                  <div
                    key={sku.id}
                    className={clsx(skuCellBase, "bg-yellow-50")}
                  >
                    <div className="w-24 min-w-24 h-8 px-1.5 flex items-center text-sm font-semibold text-gray-900">
                      {totals.totalPurchase?.[sku.id] ?? 0}
                    </div>
                  </div>
                ))}
              </div>

              {/* OPENING STOCK REPORT */}
              <div className="grid grid-flow-col auto-cols-max items-center">
                <div
                  className={clsx(
                    "w-16 min-w-16 bg-yellow-200",
                    leftCellBase,
                    stickyLeft1,
                  )}
                >
                  -
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200 font-bold",
                    leftCellBase,
                    stickyLeft2,
                  )}
                >
                  OPENING STOCK REPORT
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200",
                    leftCellBase,
                    stickyLeft3,
                  )}
                >
                  -
                </div>
                {SKU_ITEMS.map((sku) => (
                  <div
                    key={sku.id}
                    className={clsx(skuCellBase, "bg-yellow-50")}
                  >
                    <div className="w-24 min-w-24 h-8 px-1.5 flex items-center text-sm font-medium text-gray-900">
                      {data.openingStock?.[sku.id] ?? 0}
                    </div>
                  </div>
                ))}
              </div>

              {/* SALES REPORT (Total Sales) */}
              <div className="grid grid-flow-col auto-cols-max items-center">
                <div
                  className={clsx(
                    "w-16 min-w-16 bg-yellow-200",
                    leftCellBase,
                    stickyLeft1,
                  )}
                >
                  -
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200 font-bold",
                    leftCellBase,
                    stickyLeft2,
                  )}
                >
                  SALES REPORT
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200",
                    leftCellBase,
                    stickyLeft3,
                  )}
                >
                  -
                </div>
                {SKU_ITEMS.map((sku) => (
                  <div
                    key={sku.id}
                    className={clsx(skuCellBase, "bg-yellow-50")}
                  >
                    <div className="w-24 min-w-24 h-8 px-1.5 flex items-center text-sm font-medium text-gray-900">
                      {totals.totalSales?.[sku.id] ?? 0}
                    </div>
                  </div>
                ))}
              </div>

              {/* AUTO CLOSING STOCK REPORT */}
              <div className="grid grid-flow-col auto-cols-max items-center">
                <div
                  className={clsx(
                    "w-16 min-w-16 bg-yellow-200",
                    leftCellBase,
                    stickyLeft1,
                  )}
                >
                  -
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200 font-bold",
                    leftCellBase,
                    stickyLeft2,
                  )}
                >
                  AUTO CLOSING STOCK REPORT
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200",
                    leftCellBase,
                    stickyLeft3,
                  )}
                >
                  -
                </div>
                {SKU_ITEMS.map((sku) => (
                  <div
                    key={sku.id}
                    className={clsx(skuCellBase, "bg-yellow-50")}
                  >
                    <div className="w-24 min-w-24 h-8 px-1.5 flex items-center text-sm font-semibold text-gray-900">
                      {totals.closingStock?.[sku.id] ?? 0}
                    </div>
                  </div>
                ))}
              </div>

              {/* PHYSICAL STOCK REPORT BY SUP'S (manual) */}
              <div className="grid grid-flow-col auto-cols-max items-center">
                <div
                  className={clsx(
                    "w-16 min-w-16 bg-yellow-200",
                    leftCellBase,
                    stickyLeft1,
                  )}
                >
                  -
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200 font-bold",
                    leftCellBase,
                    stickyLeft2,
                  )}
                >
                  PHYSICAL STOCK REPORT BY SUP&apos;S
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200",
                    leftCellBase,
                    stickyLeft3,
                  )}
                >
                  -
                </div>
                {SKU_ITEMS.map((sku) => (
                  <div
                    key={sku.id}
                    className={clsx(skuCellBase, "bg-yellow-50")}
                  >
                    <input
                      className={cellInputClass}
                      type="number"
                      value={data.physicalStock?.[sku.id] ?? 0}
                      onChange={(e) => setPhysical(sku.id, e.target.value)}
                      onWheel={preventWheelNumberChange}
                      onFocus={selectAllOnFocus}
                    />
                  </div>
                ))}
              </div>

              {/* DIFFERENCE IN STOCK */}
              <div className="grid grid-flow-col auto-cols-max items-center">
                <div
                  className={clsx(
                    "w-16 min-w-16 bg-yellow-200",
                    leftCellBase,
                    stickyLeft1,
                  )}
                >
                  -
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200 font-bold",
                    overallSummary.difference >= 0
                      ? "text-green-700"
                      : "text-red-700",
                    leftCellBase,
                    stickyLeft2,
                  )}
                >
                  DIFFERENCE IN STOCK
                </div>
                <div
                  className={clsx(
                    "w-36 min-w-36 bg-yellow-200",
                    leftCellBase,
                    stickyLeft3,
                  )}
                >
                  -
                </div>
                {SKU_ITEMS.map((sku) => {
                  const diff = totals.difference?.[sku.id] ?? 0;
                  const diffClass =
                    diff === 0
                      ? "text-gray-900"
                      : diff > 0
                        ? "text-green-700"
                        : "text-red-700";
                  return (
                    <div
                      key={sku.id}
                      className={clsx(skuCellBase, "bg-yellow-50")}
                    >
                      <div
                        className={clsx(
                          "w-24 min-w-24 h-8 px-1.5 flex items-center text-sm font-bold",
                          diffClass,
                        )}
                      >
                        {diff}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRShopwiseOverallSalesTrackerSkuWise;
