import { useState, useMemo, useRef } from "react";

/* ===================== CONFIG ===================== */

const BATCHES = ["BATCH-101", "BATCH-102", "BATCH-103", "BATCH-104"];
const TRADES = ["Electrical", "Fitter", "Safety", "Welder"];
const TYPES = ["Theory", "Practical", "Viva", "Mock Final"];

/* ===================== GENERATE DUMMY DATA ===================== */

function generateAssessments() {
  const list = [];

  for (let i = 1; i <= 20; i++) {
    list.push({
      id: i,
      batch: BATCHES[Math.floor(Math.random() * BATCHES.length)],
      trade: TRADES[Math.floor(Math.random() * TRADES.length)],
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
      date: `${10 + (i % 15)} Feb 2026`,
      totalMarks: 100,
      passingMarks: 40,
      students: 30,
      status: "Scheduled",
      questionnaire: null,
    });
  }

  return list;
}

/* ===================== MAIN COMPONENT ===================== */

export default function TrainerInternalAssessments() {
  const [assessments, setAssessments] = useState(generateAssessments());
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  /* ===================== SUMMARY ===================== */

  const summary = useMemo(() => {
    return {
      total: assessments.length,
      scheduled: assessments.filter(a => a.status === "Scheduled").length,
      conducted: assessments.filter(a => a.status === "Conducted").length,
      submitted: assessments.filter(a => a.status === "Submitted").length,
      approved: assessments.filter(a => a.status === "Approved").length,
    };
  }, [assessments]);

  const filteredData =
    filter === "All"
      ? assessments
      : assessments.filter(a => a.status === filter);

  return (
    <>
      <section className="mt-8 p-8 rounded-2xl bg-[#111827] border border-slate-700">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-100">
            Internal Assessments
          </h2>

          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#0f172a] border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200"
            >
              <option value="All">All</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Conducted">Conducted</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-md bg-emerald-500 text-black font-medium hover:bg-emerald-400 transition"
            >
              + Create Assessment
            </button>
          </div>
        </div>

        {/* SUMMARY STRIP */}
        <div className="grid grid-cols-5 gap-6 mb-6">
          <SummaryCard label="Total" value={summary.total} />
          <SummaryCard label="Scheduled" value={summary.scheduled} />
          <SummaryCard label="Conducted" value={summary.conducted} />
          <SummaryCard label="Submitted" value={summary.submitted} />
          <SummaryCard label="Approved" value={summary.approved} />
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#0f172a] border-b border-slate-700 text-slate-400">
              <tr>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Trade</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Questionnaire</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700">
              {filteredData.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/60 transition">
                  <td className="px-4 py-3 text-slate-200">{a.batch}</td>
                  <td className="px-4 py-3 text-slate-400">{a.trade}</td>
                  <td className="px-4 py-3 text-slate-400">{a.type}</td>
                  <td className="px-4 py-3 text-slate-400">{a.date}</td>

                  <td className="px-4 py-3">
                    {a.questionnaire ? (
                      <a
                        href={a.questionnaire}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline text-xs"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="text-slate-500 text-xs">
                        Not Uploaded
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>

                  <td className="px-4 py-3 space-x-2">
                    {a.status === "Scheduled" && (
                      <button
                        onClick={() =>
                          setAssessments(prev =>
                            prev.map(item =>
                              item.id === a.id
                                ? { ...item, status: "Conducted" }
                                : item
                            )
                          )
                        }
                        className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-md"
                      >
                        Mark Conducted
                      </button>
                    )}

                    {a.status === "Conducted" && (
                      <button
                        onClick={() => setSelected(a)}
                        className="px-3 py-1 text-xs bg-slate-800 border border-slate-600 text-slate-300 rounded-md"
                      >
                        Enter Marks
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <CreateAssessmentModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) =>
            setAssessments(prev => [
              ...prev,
              { ...data, id: Date.now(), status: "Scheduled" },
            ])
          }
        />
      )}

      {/* MARKS MODAL */}
      {selected && (
        <MarksModal
          assessment={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

/* ===================== CREATE MODAL ===================== */

function CreateAssessmentModal({ onClose, onCreate }) {
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    batch: BATCHES[0],
    trade: TRADES[0],
    type: TYPES[0],
    date: "",
    totalMarks: 100,
    passingMarks: 40,
    questionnaire: null,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    setForm(prev => ({ ...prev, questionnaire: fileURL }));
  };

  const handleSubmit = () => {
    if (!form.date || !form.questionnaire) return;
    onCreate(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-6 w-full max-w-lg">

        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Create Assessment
        </h3>

        {["batch", "trade", "type"].map(field => (
          <select
            key={field}
            value={form[field]}
            onChange={(e) =>
              setForm({ ...form, [field]: e.target.value })
            }
            className="w-full mb-3 bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200"
          >
            {(field === "batch" ? BATCHES : field === "trade" ? TRADES : TYPES)
              .map(item => (
                <option key={item}>{item}</option>
              ))}
          </select>
        ))}

        <input
          type="date"
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
          className="w-full mb-3 bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200"
        />

        <input
          type="file"
          accept="application/pdf"
          ref={fileRef}
          onChange={handleFileChange}
          className="w-full mb-4 text-slate-300 text-sm"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-emerald-500 text-black rounded-md"
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
}

/* ===================== MARKS MODAL ===================== */

function MarksModal({ assessment, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg text-slate-100 mb-4">
          Marks Entry - {assessment.batch}
        </h3>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-emerald-500 text-black rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ===================== SMALL COMPONENTS ===================== */

function SummaryCard({ label, value }) {
  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Scheduled: "bg-yellow-500/20 text-yellow-400",
    Conducted: "bg-blue-500/20 text-blue-400",
    Submitted: "bg-indigo-500/20 text-indigo-400",
    Approved: "bg-emerald-500/20 text-emerald-400",
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}
