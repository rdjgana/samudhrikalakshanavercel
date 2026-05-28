import * as XLSX from "xlsx";

function toNum(v) {
  if (v === "" || v === null || v === undefined) return 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function csvEscape(cell) {
  const str = cell === null || cell === undefined ? "" : String(cell);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function presentPlain(v) {
  if (v === "" || v === null || v === undefined) return "";
  return String(v);
}

/** One cell per product: qty on first line, line ₹ below (same idea as the on-screen table). */
function formatProductCellQtyAndLine(q, lineAmount) {
  const qtyStr = q === "" || q === null || q === undefined ? "" : String(q);
  const amt = Number(lineAmount) || 0;
  if (!qtyStr && !amt) return "";
  if (!amt) return qtyStr;
  if (!qtyStr) return `₹${amt.toLocaleString("en-IN")}`;
  return `${qtyStr}\n₹${amt.toLocaleString("en-IN")}`;
}

/** Array-of-arrays: header, data rows, totals row (optional). */
export function buildPromoterSalesAoa(parsed, filteredRows) {
  if (!parsed?.productColumns?.length) return [["No data"]];

  const head = [
    "S.No",
    "Supervisor",
    "Promoter name",
    "Shop",
    "Town",
    "Present",
    ...parsed.productColumns.map(
      (c) => `${c.name}\n(₹${c.unitPrice.toLocaleString("en-IN")}/unit)`,
    ),
    "Row total (₹)",
  ];

  const dataRows = filteredRows.map((row) => [
    row.sno === "" ? "" : row.sno,
    row.supervisor ?? "",
    row.baName ?? "",
    row.outlet ?? "",
    row.town ?? "",
    presentPlain(row.present),
    ...parsed.productColumns.map((_, i) =>
      formatProductCellQtyAndLine(row.quantities[i], row.lineAmounts?.[i]),
    ),
    row.rowTotal ?? 0,
  ]);

  const qtyTotals = parsed.productColumns.map((_, i) =>
    filteredRows.reduce((s, r) => s + toNum(r.quantities[i]), 0),
  );
  const amtTotals = parsed.productColumns.map((_, i) =>
    filteredRows.reduce((s, r) => s + (Number(r.lineAmounts?.[i]) || 0), 0),
  );
  const grandTotal = filteredRows.reduce((s, r) => s + (Number(r.rowTotal) || 0), 0);

  const totalsRow = [
    "",
    "",
    "",
    "",
    "",
    "Totals (filtered)",
    ...parsed.productColumns.map((_, i) => {
      const qt = qtyTotals[i];
      const at = amtTotals[i];
      if (!qt && !at) return "";
      if (!at) return String(qt);
      return `${qt}\n₹${Number(at).toLocaleString("en-IN")}`;
    }),
    grandTotal,
  ];

  return [head, ...dataRows, totalsRow];
}

export function exportPromoterSalesReportCsv(parsed, filteredRows, filenameBase) {
  const aoa = buildPromoterSalesAoa(parsed, filteredRows);
  const lines = aoa.map((row) => row.map(csvEscape).join(","));
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenameBase}.csv`;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPromoterSalesReportXlsx(parsed, filteredRows, filenameBase) {
  const aoa = buildPromoterSalesAoa(parsed, filteredRows);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${filenameBase}.xlsx`);
}

export function printPromoterSalesReport({
  parsed,
  filteredRows,
  columnTotals,
  grandTotal,
  selectedSheet,
  supervisorFilter,
}) {
  if (!parsed?.productColumns?.length || !filteredRows.length) {
    window.alert("No rows to print for the current filter.");
    return;
  }

  const meta = [
    `<p><strong>Sheet:</strong> ${escapeHtml(selectedSheet)} &nbsp;|&nbsp; <strong>Supervisor filter:</strong> ${escapeHtml(supervisorFilter === "all" ? "All" : supervisorFilter)}</p>`,
    `<p><strong>Total sales (filtered):</strong> ₹${Number(grandTotal).toLocaleString("en-IN")}</p>`,
  ].join("");

  const headerLabels = [
    "S.No",
    "Supervisor",
    "Promoter name",
    "Shop",
    "Town",
    "Present",
    ...parsed.productColumns.map(
      (c) =>
        `${escapeHtml(c.name)}<br/><span class="hdr-mrp">₹${c.unitPrice.toLocaleString("en-IN")}/unit</span>`,
    ),
    "Row total (₹)",
  ];
  const totalColIdx = 6 + parsed.productColumns.length;
  const headCells = headerLabels
    .map((h, idx) => {
      let cls = "print-th print-th-prod";
      if (idx < 6) cls = "print-th print-th-core";
      else if (idx === totalColIdx) cls = "print-th print-th-total";
      return `<th scope="col" class="${cls}">${h}</th>`;
    })
    .join("");

  const bodyRows = filteredRows
    .map((row) => {
      const core = [
        escapeHtml(row.sno === "" ? "—" : String(row.sno)),
        escapeHtml(row.supervisor || "—"),
        escapeHtml(row.baName || "—"),
        escapeHtml(row.outlet || "—"),
        escapeHtml(row.town || "—"),
        escapeHtml(presentPlain(row.present) || "—"),
      ].map(
        (text) => `<td class="print-td print-td-core">${text}</td>`,
      );
      const prodCells = row.quantities.map((q, i) => {
        const line = row.lineAmounts?.[i] ?? 0;
        const qty = q === "" || q === null || q === undefined ? "" : String(q);
        const amt =
          line > 0
            ? `<span class="print-rupee-sub">₹${Number(line).toLocaleString("en-IN")}</span>`
            : "";
        const inner =
          escapeHtml(qty) + (amt ? `<br/>${amt}` : "");
        return `<td class="print-td print-td-prod">${inner}</td>`;
      });
      const totalCell = `<td class="print-td print-td-total">${
        row.rowTotal > 0
          ? `₹${Number(row.rowTotal).toLocaleString("en-IN")}`
          : "—"
      }</td>`;
      return `<tr>${[...core, ...prodCells, totalCell].join("")}</tr>`;
    })
    .join("");

  const footCells = [
    '<td colspan="6" class="print-td print-td-core print-tfoot-label">Product totals (₹) — filtered</td>',
    ...columnTotals.map((t) => {
      const v = t > 0 ? `₹${Number(t).toLocaleString("en-IN")}` : "—";
      return `<td class="print-td print-td-prod print-tfoot-num">${v}</td>`;
    }),
    `<td class="print-td print-td-total print-tfoot-num">₹${Number(grandTotal).toLocaleString("en-IN")}</td>`,
  ].join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=1600"/>
  <title>${escapeHtml(parsed.title)}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; color: #111; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif;
      padding: 10px;
    }
    h1 { font-size: 16px; margin: 0 0 8px; font-weight: 700; }
    .print-meta p { margin: 2px 0 6px; font-size: 12px; }
    .print-table-wrap { width: max-content; max-width: none; }
    table.sales-report {
      border-collapse: collapse;
      table-layout: auto;
      width: max-content;
      max-width: none;
      border: 2px solid #000;
      font-size: 8px;
      font-variant-numeric: tabular-nums;
    }
    .print-th, .print-td {
      border: 1px solid #000;
      padding: 4px 6px;
      vertical-align: top;
      background: #fff;
    }
    .print-th {
      background: #ddd !important;
      font-weight: 600;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .hdr-mrp {
      font-size: 7px;
      color: #222;
      font-weight: 400;
      display: block;
      margin-top: 2px;
    }
    .print-th-core, .print-td-core {
      white-space: nowrap;
    }
    .print-td-core:nth-child(1),
    .print-th-core:nth-child(1) {
      text-align: center;
      min-width: 2.5em;
    }
    .print-td-core:nth-child(4),
    .print-th-core:nth-child(4),
    .print-td-core:nth-child(5),
    .print-th-core:nth-child(5) {
      white-space: normal;
      word-break: break-word;
      max-width: 11em;
    }
    .print-th-prod {
      text-align: center;
      white-space: normal;
      word-break: break-word;
      min-width: 2.8em;
      max-width: 4.5em;
      font-size: 7px;
      line-height: 1.15;
    }
    .print-td-prod {
      text-align: center;
      white-space: nowrap;
      min-width: 2.8em;
      max-width: 5em;
    }
    .print-rupee-sub {
      font-size: 7px;
      color: #222;
      display: block;
      margin-top: 2px;
      font-weight: 500;
    }
    .print-th-total, .print-td-total {
      text-align: right;
      white-space: nowrap;
      min-width: 5em;
      font-weight: 600;
    }
    .print-tfoot-label { font-weight: 700; background: #eee !important; }
    .print-tfoot-num { font-weight: 600; background: #f4f4f4 !important; text-align: right !important; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    @page {
      size: landscape;
      margin: 5mm;
    }
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body { zoom: 0.4; padding: 4px; }
      table.sales-report { font-size: 7px; }
    }
  </style>
</head>
<body>
  <div class="print-root">
    <h1>${escapeHtml(parsed.title)}</h1>
    <div class="print-meta">${meta}</div>
    <div class="print-table-wrap">
      <table class="sales-report">
        <thead><tr>${headCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
        <tfoot><tr>${footCells}</tr></tfoot>
      </table>
    </div>
  </div>
</body>
</html>`;

  /** Large off-screen iframe so wide tables keep real column widths (avoids squashed / merged text in print). */
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("title", "Print: promoter sales report");
  iframe.style.cssText = [
    "position:fixed",
    "left:-4000px",
    "top:0",
    "width:3600px",
    "height:2200px",
    "border:0",
    "opacity:0",
    "pointer-events:none",
    "z-index:-1",
  ].join(";");

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    try {
      iframe.remove();
    } catch {
      /* ignore */
    }
  };

  document.body.appendChild(iframe);

  const iwin = iframe.contentWindow;
  const idoc = iframe.contentDocument || iwin?.document;
  if (!idoc || !iwin) {
    cleanup();
    window.alert("Print could not be prepared. Try Export to Excel, then print from Excel.");
    return;
  }

  idoc.open();
  idoc.write(html);
  idoc.close();

  const runPrint = () => {
    const invoke = () => {
      try {
        iwin.focus();
        iwin.print();
      } catch {
        window.alert("Could not open the print dialog.");
        cleanup();
        return;
      }
      iwin.addEventListener("afterprint", cleanup);
      window.setTimeout(() => {
        if (iframe.parentNode) cleanup();
      }, 120000);
    };
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.setTimeout(invoke, 50);
      });
    });
  };

  window.setTimeout(runPrint, 400);
}

export function buildExportFilenameBase(selectedSheet, supervisorFilter) {
  const safeSheet = String(selectedSheet || "sheet").replace(/[/\\?%*:|"<>]/g, "-");
  const safeSup =
    supervisorFilter === "all"
      ? "all-supervisors"
      : String(supervisorFilter).replace(/[/\\?%*:|"<>]/g, "-").slice(0, 40);
  const d = new Date().toISOString().slice(0, 10);
  return `promoter-sales_${safeSheet}_${safeSup}_${d}`;
}
