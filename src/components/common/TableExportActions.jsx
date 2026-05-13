import { memo } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useTableExport } from "../../hooks/useTableExport";

function ExportButton({ disabled, icon, label, loading, onClick, tone = "blue" }) {
  const toneClass =
    tone === "green"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
      : "border-sky-500/25 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-55 ${toneClass}`}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
      <span>{label}</span>
    </button>
  );
}

function TableExportActions({
  columns,
  rows,
  selectedRows = [],
  moduleName,
  fileName,
  company,
  canExport = true,
  exportScope = "all",
  showSelectedToggle = false,
  onScopeChange,
  className = "",
}) {
  const { exportPdf, exportExcel, exporting, isExporting } = useTableExport({
    columns,
    rows,
    selectedRows,
    moduleName,
    fileName,
    company,
    canExport,
    exportScope,
  });

  if (!canExport) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {showSelectedToggle && (
        <div className="inline-flex h-10 overflow-hidden rounded-lg border border-slate-700 bg-[#0b1220] text-sm">
          <button
            type="button"
            onClick={() => onScopeChange?.("all")}
            className={`px-3 transition ${exportScope === "all" ? "bg-slate-700 text-white" : "text-white/60 hover:text-white"}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onScopeChange?.("selected")}
            className={`px-3 transition ${exportScope === "selected" ? "bg-slate-700 text-white" : "text-white/60 hover:text-white"}`}
          >
            Selected ({selectedRows.length})
          </button>
        </div>
      )}

      <ExportButton
        onClick={exportPdf}
        loading={exporting === "pdf"}
        disabled={isExporting}
        icon={<FileText size={15} />}
        label="Export PDF"
        tone="blue"
      />

      <ExportButton
        onClick={exportExcel}
        loading={exporting === "excel"}
        disabled={isExporting}
        icon={<FileSpreadsheet size={15} />}
        label="Export Excel"
        tone="green"
      />

      <Download size={15} className="hidden text-white/35 sm:block" aria-hidden="true" />
    </div>
  );
}

export default memo(TableExportActions);
