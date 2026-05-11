import { memo } from "react";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const handleExport = () => {
    const doc = new jsPDF({ orientation: data[0]?.length > 6 ? "landscape" : "portrait" });

    // Title
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text(title, 14, 18);

    // Subtitle
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Exported on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}  •  ${data.length} records`, 14, 25);

    autoTable(doc, {
      startY: 30,
      head: [columns],
      body: data,
      styles: {
        fontSize: 8.5,
        cellPadding: 3.5,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        textColor: [40, 40, 40],
      },
      headStyles: {
        fillColor: style.head,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });

    doc.save(`${fileName}.pdf`);
  };

  return (
    <button
      onClick={handleExport}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-150 ${style.btn}`}
    >
      <FileDown size={15} />
      Export PDF
    </button>
  );
}

export default memo(ExportPDFButton);
