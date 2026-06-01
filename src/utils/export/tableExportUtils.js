const DEFAULT_COMPANY = {
  name: "ERP Report",
  logo: "",
};

const DATE_FORMAT = "dd mmm yyyy";
const DATE_TIME_FORMAT = "dd mmm yyyy hh:mm AM/PM";

export function slugifyFileName(value = "report") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "report";
}

export function normalizeExportColumns(columns = []) {
  return columns
    .map((column) => {
      if (typeof column === "string") {
        return {
          key: column,
          header: column,
          type: "string",
        };
      }

      return {
        type: "string",
        ...column,
        header: column.header || column.label || column.key,
      };
    })
    .filter((column) => column.key && column.header && !column.hidden && column.export !== false);
}

export function getNestedValue(row, key) {
  if (!key) return "";
  return String(key)
    .split(".")
    .reduce((value, part) => (value == null ? undefined : value[part]), row);
}

export function formatExportValue(value, column, row) {
  if (typeof column.exportValue === "function") return column.exportValue(row);
  if (typeof column.formatter === "function") return column.formatter(value, row);
  if (value == null) return "";

  if (column.type === "date" || column.type === "datetime") {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }

  if (column.type === "number" || column.type === "currency" || column.type === "percent") {
    const number = Number(value);
    return Number.isNaN(number) ? value : number;
  }

  if (Array.isArray(value)) return value.join(", ");
  return value;
}

export function buildExportRows({ columns = [], rows = [] }) {
  const normalizedColumns = normalizeExportColumns(columns);

  return rows.map((row) =>
    normalizedColumns.map((column) => {
      const rawValue = getNestedValue(row, column.key);
      return formatExportValue(rawValue, column, row);
    })
  );
}

export function getRowsForExport({ rows = [], selectedRows = [], exportScope = "all" }) {
  return exportScope === "selected" ? selectedRows : rows;
}

export function formatDateTime(value = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function printableValue(value, column) {
  if (value instanceof Date) {
    return formatDateTime(value);
  }

  if (column.type === "currency" && typeof value === "number") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: column.currency || "INR",
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (column.type === "percent" && typeof value === "number") {
    return `${value}%`;
  }

  return value == null ? "" : String(value);
}

export async function exportTableToExcel({
  columns,
  rows,
  moduleName = "Report",
  fileName,
  company = DEFAULT_COMPANY,
  generatedAt = new Date(),
}) {
  const [{ default: ExcelJS }, { saveAs }] = await Promise.all([import("exceljs"), import("file-saver")]);
  const exportColumns = normalizeExportColumns(columns);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = company.name || DEFAULT_COMPANY.name;
  workbook.created = generatedAt;

  const worksheet = workbook.addWorksheet(String(moduleName).slice(0, 31) || "Report", {
    views: [{ state: "frozen", ySplit: 3 }],
  });

  worksheet.mergeCells(1, 1, 1, exportColumns.length || 1);
  worksheet.getCell(1, 1).value = company.name || DEFAULT_COMPANY.name;
  worksheet.getCell(1, 1).font = { bold: true, size: 14 };

  worksheet.mergeCells(2, 1, 2, exportColumns.length || 1);
  worksheet.getCell(2, 1).value = `${moduleName} | Exported ${formatDateTime(generatedAt)} | ${rows.length} records`;
  worksheet.getCell(2, 1).font = { size: 10, color: { argb: "FF64748B" } };

  worksheet.addRow(exportColumns.map((column) => column.header));
  const headerRow = worksheet.getRow(3);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" },
  };
  headerRow.alignment = { vertical: "middle" };

  const bodyRows = buildExportRows({ columns: exportColumns, rows });
  bodyRows.forEach((values) => worksheet.addRow(values));

  exportColumns.forEach((column, index) => {
    const excelColumn = worksheet.getColumn(index + 1);
    excelColumn.numFmt =
      column.excelFormat ||
      (column.type === "date" ? DATE_FORMAT : column.type === "datetime" ? DATE_TIME_FORMAT : undefined);

    if (column.type === "currency") excelColumn.numFmt = column.excelFormat || '"Rs."#,##0.00';
    if (column.type === "percent") excelColumn.numFmt = column.excelFormat || '0"%"';

    const maxLength = Math.max(
      String(column.header).length,
      ...bodyRows.map((row) => String(printableValue(row[index], column)).length)
    );
    excelColumn.width = Math.min(Math.max(maxLength + 3, column.minWidth || 12), column.maxWidth || 42);
  });

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
      cell.alignment = {
        vertical: "middle",
        wrapText: true,
        horizontal: rowNumber === 3 ? "center" : "left",
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${slugifyFileName(fileName || moduleName)}.xlsx`
  );
}

export async function exportWorkbookToExcel({
  sheets = [],
  fileName,
  company = DEFAULT_COMPANY,
  generatedAt = new Date(),
}) {
  const [{ default: ExcelJS }, { saveAs }] = await Promise.all([import("exceljs"), import("file-saver")]);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = company.name || DEFAULT_COMPANY.name;
  workbook.created = generatedAt;

  sheets.forEach((sheet, sheetIndex) => {
    const exportColumns = normalizeExportColumns(sheet.columns);
    const worksheet = workbook.addWorksheet(String(sheet.name || `Sheet ${sheetIndex + 1}`).slice(0, 31), {
      views: [{ state: "frozen", ySplit: 3 }],
    });
    const rows = sheet.rows || [];

    worksheet.mergeCells(1, 1, 1, exportColumns.length || 1);
    worksheet.getCell(1, 1).value = company.name || DEFAULT_COMPANY.name;
    worksheet.getCell(1, 1).font = { bold: true, size: 14 };

    worksheet.mergeCells(2, 1, 2, exportColumns.length || 1);
    worksheet.getCell(2, 1).value = `${sheet.name || "Report"} | Exported ${formatDateTime(generatedAt)} | ${rows.length} records`;
    worksheet.getCell(2, 1).font = { size: 10, color: { argb: "FF64748B" } };

    worksheet.addRow(exportColumns.map((column) => column.header));
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };
    headerRow.alignment = { vertical: "middle" };

    const bodyRows = buildExportRows({ columns: exportColumns, rows });
    bodyRows.forEach((values) => worksheet.addRow(values));

    exportColumns.forEach((column, index) => {
      const excelColumn = worksheet.getColumn(index + 1);
      excelColumn.numFmt =
        column.excelFormat ||
        (column.type === "date" ? DATE_FORMAT : column.type === "datetime" ? DATE_TIME_FORMAT : undefined);

      if (column.type === "currency") excelColumn.numFmt = column.excelFormat || '"Rs."#,##0.00';
      if (column.type === "percent") excelColumn.numFmt = column.excelFormat || '0"%"';

      const maxLength = Math.max(
        String(column.header).length,
        ...bodyRows.map((row) => String(printableValue(row[index], column)).length)
      );
      excelColumn.width = Math.min(Math.max(maxLength + 3, column.minWidth || 12), column.maxWidth || 42);
    });

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
        cell.alignment = {
          vertical: "middle",
          wrapText: true,
          horizontal: rowNumber === 3 ? "center" : "left",
        };
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${slugifyFileName(fileName || "workbook")}.xlsx`
  );
}

export async function imageUrlToDataUrl(url) {
  if (!url) return "";
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

function getImageFormat(dataUrl = "") {
  if (dataUrl.startsWith("data:image/jpeg")) return "JPEG";
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  return "";
}

export async function exportTableToPdf({
  columns,
  rows,
  moduleName = "Report",
  fileName,
  company = DEFAULT_COMPANY,
  generatedAt = new Date(),
  orientation,
  accentColor = [37, 99, 235],
}) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const exportColumns = normalizeExportColumns(columns);
  const bodyRows = buildExportRows({ columns: exportColumns, rows }).map((row) =>
    row.map((value, index) => printableValue(value, exportColumns[index]))
  );

  const doc = new jsPDF({
    orientation: orientation || (exportColumns.length > 6 ? "landscape" : "portrait"),
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const exportedAt = formatDateTime(generatedAt);
  const logoDataUrl = await imageUrlToDataUrl(company.logo);
  const logoFormat = getImageFormat(logoDataUrl);

  autoTable(doc, {
    head: [exportColumns.map((column) => column.header)],
    body: bodyRows,
    startY: 92,
    margin: { top: 92, right: margin, bottom: 48, left: margin },
    tableWidth: "auto",
    styles: {
      fontSize: exportColumns.length > 8 ? 7 : 8,
      cellPadding: 5,
      overflow: "linebreak",
      valign: "middle",
      lineColor: [226, 232, 240],
      lineWidth: 0.4,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: accentColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: 0,
    didDrawPage: () => {
      if (logoDataUrl && logoFormat) {
        doc.addImage(logoDataUrl, logoFormat, margin, 24, 34, 34, undefined, "FAST");
      }

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(moduleName, logoDataUrl && logoFormat ? margin + 44 : margin, 38);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`${company.name || DEFAULT_COMPANY.name} | Exported ${exportedAt} | ${rows.length} records`, logoDataUrl && logoFormat ? margin + 44 : margin, 54);

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 34, pageWidth - margin, pageHeight - 34);
    },
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(`Page ${page} of ${totalPages}`, pageWidth - margin, pageHeight - 18, { align: "right" });
  }

  doc.save(`${slugifyFileName(fileName || moduleName)}.pdf`);
}
