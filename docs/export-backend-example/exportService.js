import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export function normalizeColumns(columns = []) {
  return columns
    .filter((column) => column?.key && column?.header && column.export !== false)
    .map((column) => ({
      type: "string",
      ...column,
    }));
}

export function buildMongoFilter({ search, filters = {}, searchableFields = [] }) {
  const mongoFilter = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      mongoFilter[key] = value;
    }
  });

  if (search && searchableFields.length) {
    mongoFilter.$or = searchableFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }

  return mongoFilter;
}

function getValue(row, column) {
  if (typeof column.exportValue === "function") return column.exportValue(row);
  return String(column.key)
    .split(".")
    .reduce((value, part) => (value == null ? undefined : value[part]), row);
}

export async function streamExcelExport({ res, rows, columns, moduleName, fileName }) {
  const exportColumns = normalizeColumns(columns);
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
  const worksheet = workbook.addWorksheet(String(moduleName).slice(0, 31));

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}.xlsx"`);

  worksheet.columns = exportColumns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width || 18,
    style: {
      numFmt: column.excelFormat,
    },
  }));
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).commit();

  for await (const row of rows) {
    worksheet.addRow(
      exportColumns.reduce((record, column) => {
        record[column.key] = getValue(row, column) ?? "";
        return record;
      }, {})
    ).commit();
  }

  await worksheet.commit();
  await workbook.commit();
}

export async function streamPdfExport({ res, rows, columns, moduleName, fileName }) {
  const exportColumns = normalizeColumns(columns);
  const doc = new PDFDocument({
    layout: exportColumns.length > 6 ? "landscape" : "portrait",
    margin: 36,
    size: "A4",
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}.pdf"`);
  doc.pipe(res);

  doc.fontSize(16).text(moduleName, { continued: false });
  doc.fontSize(9).fillColor("#64748b").text(`Exported ${new Date().toLocaleString("en-IN")}`);
  doc.moveDown();

  const startX = doc.page.margins.left;
  const colWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / exportColumns.length;

  function drawHeader() {
    doc.fillColor("#0f172a").fontSize(8).font("Helvetica-Bold");
    exportColumns.forEach((column, index) => {
      doc.text(column.header, startX + index * colWidth, doc.y, { width: colWidth - 4 });
    });
    doc.moveDown();
    doc.font("Helvetica");
  }

  drawHeader();

  for await (const row of rows) {
    if (doc.y > doc.page.height - 60) {
      doc.addPage();
      drawHeader();
    }

    const y = doc.y;
    exportColumns.forEach((column, index) => {
      doc.fillColor("#334155").fontSize(7).text(String(getValue(row, column) ?? ""), startX + index * colWidth, y, {
        width: colWidth - 4,
        height: 28,
      });
    });
    doc.y = y + 30;
  }

  const pageRange = doc.bufferedPageRange();
  for (let i = pageRange.start; i < pageRange.start + pageRange.count; i += 1) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor("#64748b").text(`Page ${i + 1} of ${pageRange.count}`, 36, doc.page.height - 28, {
      align: "right",
    });
  }

  doc.end();
}
