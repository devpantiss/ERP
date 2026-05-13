import { memo, useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { exportTableToPdf } from "../../utils/export/tableExportUtils";

/**
 * ExportPDFButton — reusable PDF export for any data table.
 *
 * Props:
 *   title     — PDF document title (shown at top of page)
 *   columns   — Array<string>  column headers, e.g. ["Name","Center","Status"]
 *   data      — Array<Array>   rows of cell values matching columns order
 *   fileName  — string         output file name (without .pdf)
 *   accent    — "violet"|"emerald"|"cyan"|"yellow"|"red"|"amber"  (default: "violet")
 */
const ACCENT_MAP = {
  violet:  { btn: "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border-violet-500/20", head: [139, 92, 246] },
  emerald: { btn: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20", head: [16, 185, 129] },
  cyan:    { btn: "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20", head: [6, 182, 212] },
  yellow:  { btn: "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/20", head: [234, 179, 8] },
  red:     { btn: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20", head: [239, 68, 68] },
  amber:   { btn: "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20", head: [245, 158, 11] },
};

function ExportPDFButton({
  title = "Report",
  columns = [],
  data = [],
  fileName = "report",
  accent = "violet",
}) {
  const style = ACCENT_MAP[accent] || ACCENT_MAP.violet;
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const exportColumns = columns.map((column, index) => ({
        key: String(index),
        header: column,
      }));
      const rows = data.map((row) =>
        row.reduce((record, value, index) => {
          record[index] = value;
          return record;
        }, {})
      );

      await exportTableToPdf({
        title,
        columns: exportColumns,
        rows,
        moduleName: title,
        fileName,
        accentColor: style.head,
      });
      toast.success("PDF export downloaded.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to export PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${style.btn}`}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
      Export PDF
    </button>
  );
}

export default memo(ExportPDFButton);
