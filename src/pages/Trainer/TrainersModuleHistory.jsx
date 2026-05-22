import { useMemo, useState } from "react";
import { ArrowLeft, BarChart3 } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import SlidePanel from "../../components/common/SlidePanel";
import Pagination from "../../components/common/Pagination";
import { useAuthStore } from "../../stores/authStore";
import { selectTrainerModuleHistory } from "../../stores/selectors/trainingSelectors";

/* ================= COMPONENT ================= */

const ROWS_PER_PAGE = 10;

export default function TrainerModuleHistoryEnterprise() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const trainerEmployeeId = currentUser?.employeeId || "EMP-0001";
  const moduleHistory = useMemo(() => selectTrainerModuleHistory(trainerEmployeeId), [trainerEmployeeId]);
  const [view, setView] = useState("table");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  /* ================= FILTERED DATA ================= */

  const filteredData = useMemo(() => {
    let data = moduleHistory;
    if (typeFilter !== "All") data = data.filter((item) => item.type === typeFilter);
    if (selectedBatch) data = data.filter((item) => item.batch === selectedBatch);
    return data;
  }, [moduleHistory, typeFilter, selectedBatch]);

  /* ================= BATCH PROGRESS ================= */

  const batchStats = useMemo(() => {
    const map = {};

    filteredData.forEach((item) => {
      if (!map[item.batch]) map[item.batch] = { completed: 0, total: item.totalModules || 1 };
      map[item.batch].completed++;
    });

    return Object.entries(map).map(([batch, { completed, total }]) => ({
      batch,
      completed,
      total,
      percent: Math.round((completed / total) * 100),
    }));
  }, [filteredData]);

  /* ================= EXPORT EXCEL ================= */

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    XLSX.writeFile(wb, "module_history.xlsx");
  };

  /* ================= EXPORT PDF ================= */

  const exportPDF = () => {
    const doc = new jsPDF();

    const tableData = filteredData.map((m) => [
      m.date,
      m.batch,
      m.module,
      m.type,
      m.trainer,
    ]);

    autoTable(doc, {
      head: [["Date", "Batch", "Module", "Type", "Trainer"]],
      body: tableData,
    });

    doc.save("module_history.pdf");
  };

  /* ================= UI ================= */

  return (
    <section className="min-h-screen bg-[#0f172a] text-white/90 p-8">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center gap-4">

          <div>
          <div className="flex items-center gap-3">
          <BarChart3 className="text-emerald-400" size={22} />
          <h2 className="text-3xl font-semibold">
            Module Progress Overview
          </h2>
        </div>
            <p className="text-sm text-white/60">
              Track completion, evidence & performance
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportExcel}
              className="px-4 py-2 bg-emerald-500 text-black rounded-md"
            >
              Export Excel
            </button>

            <button
              onClick={exportPDF}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Export PDF
            </button>
          </div>

        </div>

        {/* ================= TYPE FILTER ================= */}

        <div className="flex gap-2">
          {["All", "Study", "Lab"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-md text-sm transition
                ${
                  typeFilter === t
                    ? "bg-emerald-500 text-black"
                    : "bg-transparent text-white/80 hover:bg-slate-700"
                }
              `}
            >
              {t === "Study" ? "Theory" : t}
            </button>
          ))}
        </div>

        {/* ================= BATCH PROGRESS ================= */}

        {selectedBatch && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedBatch(null); setCurrentPage(1); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white/90 transition"
            >
              <ArrowLeft size={16} />
              Back to All Batches
            </button>
            <span className="text-sm text-white/50">Showing modules for <span className="text-emerald-400 font-semibold">{selectedBatch}</span></span>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">

          {batchStats.map((b) => (
            <div
              key={b.batch}
              onClick={() => { setSelectedBatch(selectedBatch === b.batch ? null : b.batch); setCurrentPage(1); }}
              className={`bg-[#111827] border rounded-xl p-5 cursor-pointer transition-all
                ${selectedBatch === b.batch
                  ? "border-emerald-400 ring-2 ring-emerald-400/30 scale-[1.02]"
                  : "border-slate-700 hover:border-emerald-500/50"
                }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/60">
                  {b.batch}
                </p>
                {selectedBatch === b.batch && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Active</span>
                )}
              </div>

              <p className="text-xl font-semibold text-emerald-400">
                {b.percent}%
              </p>

              <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${b.percent}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-2">
                {b.completed}/{b.total} modules
              </p>
            </div>
          ))}

        </div>

        {/* ================= VIEW TABS ================= */}

        <div className="flex ring-2 ring-emerald-500 bg-transparent p-1 rounded-lg w-fit">

          {[
            { key: "table", label: "Table" },
            { key: "timeline", label: "Timeline" },
            { key: "gallery", label: "Gallery" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`px-4 py-2 text-sm rounded-md transition
                ${
                  view === tab.key
                    ? "bg-emerald-500 text-black shadow-lg"
                    : "text-white/60 hover:text-white"
                }
              `}
            >
              {tab.label}
            </button>
          ))}

        </div>

        {/* ================= TABLE VIEW ================= */}

        {view === "table" && (
          <>
          <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-[#020617] text-white/60">
                <tr>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Batch</th>
                  <th className="p-4 text-left">Module</th>
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-left">Trainer</th>
                  <th className="p-4 text-left">Photos</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700">

                {filteredData
                .slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE)
                .map((row) => (
                  <tr key={row.id} className="hover:bg-transparent/60">

                    <td className="p-4">{row.date}</td>
                    <td className="p-4">{row.batch}</td>
                    <td className="p-4 font-medium">{row.module}</td>
                    <td className="p-4">{row.type}</td>
                    <td className="p-4">{row.trainer}</td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        {row.photos.map((p, i) => (
                          <img
                            key={i}
                            src={p}
                            className="w-10 h-10 rounded cursor-pointer object-cover"
                            onClick={() => setPreview(p)}
                          />
                        ))}
                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredData.length / ROWS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
          </>
        )}

        {/* ================= TIMELINE VIEW ================= */}

        {view === "timeline" && (
          <div className="space-y-6">

            {filteredData.map((item) => (
              <div key={item.id} className="flex gap-4 items-start">

                <div className="w-3 h-3 mt-2 bg-emerald-500 rounded-full" />

                <div className="bg-[#111827] border border-slate-700 rounded-xl p-4 w-full">

                  <p className="text-sm text-white/60">
                    {item.date}
                  </p>

                  <p className="font-medium">
                    {item.trainer} completed{" "}
                    <span className="text-emerald-400">
                      {item.module}
                    </span>{" "}
                    for {item.batch}
                  </p>

                  <p className="text-xs text-slate-500">
                    {item.type} Session
                  </p>

                </div>
              </div>
            ))}

          </div>
        )}

        {/* ================= GALLERY VIEW ================= */}

        {view === "gallery" && (
          <div className="grid md:grid-cols-4 gap-4">

            {filteredData.flatMap((m) =>
              m.photos.map((p, i) => (
                <img
                  key={`${m.id}-${i}`}
                  src={p}
                  className="w-full h-40 object-cover rounded-lg cursor-pointer"
                  onClick={() => setPreview(p)}
                />
              ))
            )}

          </div>
        )}

      </div>

      <SlidePanel open={!!preview} onClose={() => setPreview(null)} title="Image Preview" width="md">
          <img src={preview} className="w-full rounded-lg" />
      </SlidePanel>

    </section>
  );
}
