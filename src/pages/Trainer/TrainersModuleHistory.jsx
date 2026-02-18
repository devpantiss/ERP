import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= REAL TRAINING IMAGES ================= */

const TRAINING_IMAGES = [
  "https://images.unsplash.com/photo-1581092921461-eab62e97a780",
  "https://images.unsplash.com/photo-1581091215367-59ab6b3d8d7c",
  "https://images.unsplash.com/photo-1581090700227-1e8c7a4dfe2b",
  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc",
  "https://images.unsplash.com/photo-1581091870622-1e7a3a1e4b9a",
  "https://images.unsplash.com/photo-1581092335397-9583eb92d232",
  "https://images.unsplash.com/photo-1605902711622-cfb43c4437d1",
];

/* ================= DUMMY DATA ================= */

const MODULE_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  date: `2026-02-${10 + (i % 10)}`,
  department: "Mines, Steel & Aluminium",
  center: "Angul",
  jobRole: "Underground Mining Technician",
  batch: `BATCH-${101 + (i % 3)}`,
  module: `Module ${i + 1}`,
  type: i % 2 === 0 ? "Study" : "Lab",
  trainer: "Rahul Sharma",
  photos: [
    TRAINING_IMAGES[i % TRAINING_IMAGES.length],
    TRAINING_IMAGES[(i + 2) % TRAINING_IMAGES.length],
  ],
}));

const TOTAL_MODULES_PER_BATCH = 45;

/* ================= COMPONENT ================= */

export default function TrainerModuleHistoryEnterprise() {
  const [view, setView] = useState("table");
  const [typeFilter, setTypeFilter] = useState("All");
  const [preview, setPreview] = useState(null);

  /* ================= FILTERED DATA ================= */

  const filteredData = useMemo(() => {
    if (typeFilter === "All") return MODULE_HISTORY;
    return MODULE_HISTORY.filter((item) => item.type === typeFilter);
  }, [typeFilter]);

  /* ================= BATCH PROGRESS ================= */

  const batchStats = useMemo(() => {
    const map = {};

    filteredData.forEach((item) => {
      if (!map[item.batch]) map[item.batch] = 0;
      map[item.batch]++;
    });

    return Object.entries(map).map(([batch, completed]) => ({
      batch,
      completed,
      percent: Math.round((completed / TOTAL_MODULES_PER_BATCH) * 100),
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
    <section className="min-h-screen bg-[#0f172a] text-slate-200 p-8">

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
            <p className="text-sm text-slate-400">
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
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }
              `}
            >
              {t === "Study" ? "Theory" : t}
            </button>
          ))}
        </div>

        {/* ================= BATCH PROGRESS ================= */}

        <div className="grid md:grid-cols-3 gap-6">

          {batchStats.map((b) => (
            <div
              key={b.batch}
              className="bg-[#111827] border border-slate-700 rounded-xl p-5"
            >
              <p className="text-sm text-slate-400">
                {b.batch}
              </p>

              <p className="text-xl font-semibold text-emerald-400">
                {b.percent}%
              </p>

              <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${b.percent}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-2">
                {b.completed}/{TOTAL_MODULES_PER_BATCH} modules
              </p>
            </div>
          ))}

        </div>

        {/* ================= VIEW TABS ================= */}

        <div className="flex ring-2 ring-emerald-500 bg-slate-900 p-1 rounded-lg w-fit">

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
                    : "text-slate-400 hover:text-white"
                }
              `}
            >
              {tab.label}
            </button>
          ))}

        </div>

        {/* ================= TABLE VIEW ================= */}

        {view === "table" && (
          <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-[#020617] text-slate-400">
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

                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/60">

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
        )}

        {/* ================= TIMELINE VIEW ================= */}

        {view === "timeline" && (
          <div className="space-y-6">

            {filteredData.map((item) => (
              <div key={item.id} className="flex gap-4 items-start">

                <div className="w-3 h-3 mt-2 bg-emerald-500 rounded-full" />

                <div className="bg-[#111827] border border-slate-700 rounded-xl p-4 w-full">

                  <p className="text-sm text-slate-400">
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

      {/* IMAGE PREVIEW MODAL */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          <img src={preview} className="max-w-lg rounded-lg" />
        </div>
      )}

    </section>
  );
}
