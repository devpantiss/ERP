import { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import { Upload, Download } from "lucide-react";

/* ================= CONFIG ================= */

const BATCHES = ["BATCH-101", "BATCH-102", "BATCH-103", "BATCH-104"];
const TRADES = ["Electrical", "Fitter", "Safety", "Welder"];
const TYPES = ["Theory", "Practical", "Viva", "Mock Final"];

/* ================= DUMMY DATA ================= */

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
      status: "Scheduled",
      questionnaire: null,
    });
  }

  return list;
}

/* ================= MAIN COMPONENT ================= */

export default function TrainerInternalAssessments() {
  const [assessments, setAssessments] = useState(generateAssessments());
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  /* SUMMARY */

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

        {/* SUMMARY */}
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
                        className="text-emerald-400 text-xs"
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

/* ================= CREATE MODAL ================= */

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
    fileName: "",
  });

  const isValid =
    form.date &&
    form.questionnaire &&
    form.totalMarks &&
    form.passingMarks;

  const handleFileChange = (file) => {
    if (!file) return;

    const fileURL = URL.createObjectURL(file);

    setForm(prev => ({
      ...prev,
      questionnaire: fileURL,
      fileName: file.name,
    }));
  };

  const handleSubmit = () => {
    if (!isValid) return;
    onCreate(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">

      <div className="w-full max-w-3xl bg-[#0b1220] border border-slate-700 rounded-2xl">

        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-semibold text-slate-100">
            Create Internal Assessment
          </h3>
        </div>

        <div className="p-6 space-y-6">

          <div className="grid md:grid-cols-3 gap-4">

            <FormSelect label="Batch" value={form.batch} options={BATCHES}
              onChange={(v) => setForm({ ...form, batch: v })} />

            <FormSelect label="Trade" value={form.trade} options={TRADES}
              onChange={(v) => setForm({ ...form, trade: v })} />

            <FormSelect label="Type" value={form.type} options={TYPES}
              onChange={(v) => setForm({ ...form, type: v })} />

            <FormInput label="Date" type="date"
              value={form.date}
              onChange={(v) => setForm({ ...form, date: v })} />

          </div>

          <div className="grid md:grid-cols-2 gap-4">

            <FormInput label="Total Marks" type="number"
              value={form.totalMarks}
              onChange={(v) => setForm({ ...form, totalMarks: v })} />

            <FormInput label="Passing Marks" type="number"
              value={form.passingMarks}
              onChange={(v) => setForm({ ...form, passingMarks: v })} />

          </div>

          <label className="block cursor-pointer">

            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              ref={fileRef}
              onChange={(e) => handleFileChange(e.target.files[0])}
            />

            <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-emerald-400 transition">

              {!form.fileName && (
                <>
                  <Upload className="mx-auto text-slate-400 mb-2" size={28} />
                  <p className="text-sm text-slate-400">
                    Upload Questionnaire PDF
                  </p>
                </>
              )}

              {form.fileName && (
                <p className="text-emerald-400">{form.fileName}</p>
              )}

            </div>

          </label>

        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-700">

          <button onClick={onClose} className="px-4 py-2 bg-slate-700 rounded-md">
            Cancel
          </button>

          <button
            disabled={!isValid}
            onClick={handleSubmit}
            className={`px-5 py-2 rounded-md ${
              isValid
                ? "bg-emerald-500 text-black"
                : "bg-slate-700 text-slate-400"
            }`}
          >
            Create
          </button>

        </div>

      </div>
    </div>
  );
}

/* ================= MARKS MODAL ================= */

function MarksModal({ assessment, onClose }) {
  const totalMarks = assessment.totalMarks || 100;
  const passingMarks = assessment.passingMarks || 40;

  const [students, setStudents] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      id: `STD-${100 + i}`,
      name: `Student ${i + 1}`,
      marks: "",
    }))
  );

  const updateMarks = (index, value) => {
    if (value > totalMarks) return;

    setStudents((prev) => {
      const copy = [...prev];
      copy[index].marks = value;
      return copy;
    });
  };

  const getResult = (marks) => {
    if (marks === "") return "-";
    return marks >= passingMarks ? "Pass" : "Fail";
  };

  const exportTemplate = () => {
    const data = students.map((s) => ({
      "Student ID": s.id,
      Name: s.name,
      Marks: "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Marks");

    XLSX.writeFile(wb, "marks_template.xlsx");
  };

  const importExcel = (file) => {
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);

      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const updated = students.map((s) => {
        const match = json.find(
          (row) => row["Student ID"] === s.id
        );

        if (match) {
          return {
            ...s,
            marks: match["Marks"] || "",
          };
        }

        return s;
      });

      setStudents(updated);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">

      <div className="w-full max-w-5xl bg-[#0b1220] border border-slate-700 rounded-2xl">

        <div className="p-6 border-b border-slate-700 flex justify-between">
          <h3 className="text-xl text-slate-100">
            Marks Entry — {assessment.batch}
          </h3>

          <button onClick={onClose} className="px-4 py-2 bg-slate-700 rounded-md">
            Close
          </button>
        </div>

        <div className="flex gap-3 p-4 border-b border-slate-700">

          <button
            onClick={exportTemplate}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm"
          >
            <Download size={16} />
            Export Template
          </button>

          <label className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm cursor-pointer">

            <Upload size={16} />
            Import Excel

            <input
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              onChange={(e) =>
                importExcel(e.target.files[0])
              }
            />

          </label>

        </div>

        <div className="max-h-[400px] overflow-y-auto">

          <table className="w-full text-sm text-left">

            <thead className="bg-[#020617] border-b border-slate-700 text-slate-400">
              <tr>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Marks</th>
                <th className="px-4 py-3">Result</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700">

              {students.map((s, i) => (
                <tr key={s.id}>

                  <td className="px-4 py-3">{s.id}</td>
                  <td className="px-4 py-3">{s.name}</td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={s.marks}
                      onChange={(e) =>
                        updateMarks(i, Number(e.target.value))
                      }
                      className="w-24 bg-slate-800 border border-slate-600 rounded px-2 py-1"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <ResultBadge result={getResult(s.marks)} />
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-700">

          <button className="px-4 py-2 bg-slate-700 rounded-md">
            Save Draft
          </button>

          <button className="px-5 py-2 bg-emerald-500 text-black rounded-md">
            Submit Marks
          </button>

        </div>

      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function FormInput({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200"
      />
    </div>
  );
}

function FormSelect({ label, value, options, onChange }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

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

function ResultBadge({ result }) {
  if (result === "-") return <span className="text-slate-500">-</span>;

  const pass = result === "Pass";

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${
        pass
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-red-500/20 text-red-400"
      }`}
    >
      {result}
    </span>
  );
}
