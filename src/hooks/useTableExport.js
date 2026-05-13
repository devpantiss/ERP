import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  exportTableToExcel,
  exportTableToPdf,
  getRowsForExport,
  normalizeExportColumns,
} from "../utils/export/tableExportUtils";

export function useTableExport({
  columns = [],
  rows = [],
  selectedRows = [],
  moduleName = "Report",
  fileName,
  company,
  canExport = true,
  exportScope = "all",
  onExportStart,
  onExportSuccess,
  onExportError,
} = {}) {
  const [exporting, setExporting] = useState(null);
  const normalizedColumns = useMemo(() => normalizeExportColumns(columns), [columns]);

  const exportRows = useMemo(
    () => getRowsForExport({ rows, selectedRows, exportScope }),
    [rows, selectedRows, exportScope]
  );

  const runExport = useCallback(
    async (type) => {
      if (!canExport) {
        toast.error("You do not have permission to export this data.");
        return;
      }

      if (!normalizedColumns.length) {
        toast.error("No export columns are configured.");
        return;
      }

      if (!exportRows.length) {
        toast.error(exportScope === "selected" ? "No rows selected for export." : "No records to export.");
        return;
      }

      try {
        setExporting(type);
        onExportStart?.(type);

        if (type === "excel") {
          await exportTableToExcel({
            columns: normalizedColumns,
            rows: exportRows,
            moduleName,
            fileName,
            company,
          });
        } else {
          await exportTableToPdf({
            columns: normalizedColumns,
            rows: exportRows,
            moduleName,
            fileName,
            company,
          });
        }

        toast.success(`${type === "excel" ? "Excel" : "PDF"} export downloaded.`);
        onExportSuccess?.(type);
      } catch (error) {
        console.error(error);
        toast.error(`Unable to export ${type === "excel" ? "Excel" : "PDF"}.`);
        onExportError?.(error, type);
      } finally {
        setExporting(null);
      }
    },
    [
      canExport,
      normalizedColumns,
      exportRows,
      exportScope,
      moduleName,
      fileName,
      company,
      onExportStart,
      onExportSuccess,
      onExportError,
    ]
  );

  return {
    canExport,
    exporting,
    exportRows,
    isExporting: Boolean(exporting),
    exportPdf: () => runExport("pdf"),
    exportExcel: () => runExport("excel"),
  };
}
