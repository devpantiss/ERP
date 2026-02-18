import { useMemo, useState } from "react";

/* ================= DUMMY DATA ================= */

const MODULE_HISTORY = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  date: `2026-02-${10 + (i % 10)}`,
  department: "Mines, Steel & Aluminium",
  center: "Angul",
  jobRole: "Underground Mining Technician",
  batch: `BATCH-${101 + (i % 3)}`,
  module: `Module ${i + 1}`,
  type: i % 2 === 0 ? "Study" : "Lab",
  status: "Completed",
  trainer: "Rahul Sharma",
  photos: [
    "https://images.unsplash.com/photo-1581090700227-1e8c7a4dfe2b",
    "https://images.unsplash.com/photo-1581091215367-59ab6b3d8d7c",
  ],
}));

/* ================= COMPONENT ================= */

export default function TrainerModuleHistory() {
  const [preview, setPreview] = useState(null);
  const [filters, setFilters] = useState({
    department: "",
    batch: "",
    type: "",
  });

  /* ================= FILTERED DATA ================= */

  const data = useMemo(() => {
    return MODULE_HISTORY.filter((item) => {
      return (
        (!filters.department ||
          item.department === filters.department) &&
        (!filters.batch || item.batch === filters.batch) &&
        (!filters.type || item.type === filters.type)
      );
    });
  }, [filters]);

  /* ================= UI ================= */

  return (
    <section className="min-h-screen bg-[#0f172a] text-slate-200 p-8">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-semibold">
              Module Completion History
            </h1>
            <p className="text-sm text-slate-400">
              Track study & lab delivery with proof evidence
            </p>
          </div>

        </div>

        {/* FILTER BAR */}
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-4 grid md:grid-cols-4 gap-4">

          <FilterSelect
            label="Department"
            value={filters.department}
            onChange={(v) =>
              setFilters({ ...filters, department: v })
            }
            options={[
              "",
              "Mines, Steel & Aluminium",
            ]}
          />

          <FilterSelect
            label="Batch"
            value={filters.batch}
            onChange={(v) =>
              setFilters({ ...filters, batch: v })
            }
            options={["", "BATCH-101", "BATCH-102", "BATCH-103"]}
          />

          <FilterSelect
            label="Module Type"
            value={filters.type}
            onChange={(v) =>
              setFilters({ ...filters, type: v })
            }
            options={["", "Study", "Lab"]}
          />

        </div>

        {/* TABLE */}
        <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-[#020617] text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Department</th>
                <th className="p-4 text-left">Center</th>
                <th className="p-4 text-left">Job Role</th>
                <th className="p-4 text-left">Batch</th>
                <th className="p-4 text-left">Module</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Photos</th>
                <th className="p-4 text-left">Trainer</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700">

              {data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/60">

                  <td className="p-4">{row.date}</td>
                  <td className="p-4">{row.department}</td>
                  <td className="p-4">{row.center}</td>
                  <td className="p-4">{row.jobRole}</td>
                  <td className="p-4">{row.batch}</td>
                  <td className="p-4 font-medium">{row.module}</td>
                  <td className="p-4">
                    <TypeBadge type={row.type} />
                  </td>

                  <td className="p-4">
                    <StatusBadge status={row.status} />
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      {row.photos.map((p, i) => (
                        <img
                          key={i}
                          src={p}
                          className="w-10 h-10 rounded cursor-pointer border border-slate-600"
                          onClick={() => setPreview(p)}
                        />
                      ))}
                    </div>
                  </td>

                  <td className="p-4 text-slate-400">
                    {row.trainer}
                  </td>

                </tr>
              ))}

            </tbody>
          </table>

        </div>

      </div>

      {/* IMAGE PREVIEW MODAL */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          <img
            src={preview}
            className="max-w-lg rounded-lg"
          />
        </div>
      )}

    </section>
  );
}

/* ================= SMALL COMPONENTS ================= */

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#020617] border border-slate-600 rounded-md px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o}>{o || "All"}</option>
        ))}
      </select>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">
      {status}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span
      className={`px-3 py-1 text-xs rounded-full ${
        type === "Study"
          ? "bg-blue-500/20 text-blue-400"
          : "bg-purple-500/20 text-purple-400"
      }`}
    >
      {type}
    </span>
  );
}
