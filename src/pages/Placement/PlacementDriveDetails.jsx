import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

/* ===================== DUMMY DATA ===================== */

function generateDrives() {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    type: i % 2 === 0 ? "Single Company" : "Multiple Companies",
    companies:
      i % 2 === 0
        ? "Tata Steel"
        : "Tata Steel, JSW, Aditya Aluminium",
    salary: "₹15,000 - ₹22,000",
    recruitmentLocation: "Odisha",
    driveLocation: "Khurda Center",
    date: `2026-02-${10 + i}`,
    status: i % 3 === 0 ? "Approved" : "Planned",
    placedStudents: [],
  }));
}

/* ===================== MAIN ===================== */

export default function PlacementDrivesPage({ role = "placement" }) {
  const navigate = useNavigate();

  const [drives, setDrives] = useState(generateDrives());
  const [activeDrive, setActiveDrive] = useState(null);

  const [filter, setFilter] = useState("All");

  const [students, setStudents] = useState([
    {
      name: "",
      designation: "",
      company: "",
      salary: "",
      offerLetter: null,
    },
  ]);

  const [placementMeta, setPlacementMeta] = useState({
    project: "",
    center: "",
    batch: "",
  });

  /* ================= SUMMARY ================= */

  const summary = useMemo(() => {
    return {
      total: drives.length,
      planned: drives.filter(d => d.status === "Planned").length,
      approved: drives.filter(d => d.status === "Approved").length,
      completed: drives.filter(d => d.status === "Completed").length,
      placed: drives.reduce(
        (acc, d) => acc + (d.placedStudents?.length || 0),
        0
      ),
    };
  }, [drives]);

  /* ================= FILTERED ================= */

  const filteredDrives = useMemo(() => {
    if (filter === "All") return drives;
    return drives.filter(d => d.status === filter);
  }, [drives, filter]);

  /* ================= ACTIONS ================= */

  function approveDrive(id) {
    if (role !== "admin") return;

    setDrives(prev =>
      prev.map(d =>
        d.id === id ? { ...d, status: "Approved" } : d
      )
    );
  }

  function openPlacementModal(drive) {
    if (role !== "placement") return;

    setActiveDrive(drive);
    setStudents([
      {
        name: "",
        designation: "",
        company: "",
        salary: "",
        offerLetter: null,
      },
    ]);
  }

  function handleCompleteSubmit() {
    setDrives(prev =>
      prev.map(d =>
        d.id === activeDrive.id
          ? {
              ...d,
              status: "Completed",
              placedStudents: students,
              meta: placementMeta,
            }
          : d
      )
    );

    setActiveDrive(null);
  }

  /* ================= UI ================= */

  return (
    <>
      <section className="p-8 rounded-2xl bg-[#111827] border border-cyan-500/30">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-100">
            Placement Drives
          </h2>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-5 gap-6 mb-6">
          <SummaryCard label="Total" value={summary.total} />
          <SummaryCard label="Planned" value={summary.planned} />
          <SummaryCard label="Approved" value={summary.approved} />
          <SummaryCard label="Completed" value={summary.completed} />
          <SummaryCard label="Candidates Placed" value={summary.placed} />
        </div>

        {/* FILTER + ADD BUTTON */}
        <div className="flex justify-between items-center mb-4">

          {/* FILTER BUTTONS */}
          <div className="flex gap-2">
            {["All", "Planned", "Approved", "Completed"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-md border ${
                  filter === f
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                    : "bg-[#020617] text-slate-400 border-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={() =>
              navigate("/placement-officer/placement-drives/new")
            }
            className="px-4 py-2 text-sm bg-cyan-500 text-black rounded-md font-medium"
          >
            + Add Placement Drive
          </button>

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-[#020617] text-slate-400">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Companies</th>
                <th className="p-3">Salary</th>
                <th className="p-3">Recruitment Location</th>
                <th className="p-3">Drive Location</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDrives.map(d => (
                <tr key={d.id} className="border-t border-slate-700">

                  <td className="p-3">{d.type}</td>
                  <td className="p-3">{d.companies}</td>
                  <td className="p-3">{d.salary}</td>
                  <td className="p-3">{d.recruitmentLocation}</td>
                  <td className="p-3">{d.driveLocation}</td>
                  <td className="p-3">{d.date}</td>

                  <td className="p-3">
                    <StatusBadge status={d.status} />
                  </td>

                  <td className="p-3 space-x-2">

                    {role === "admin" && d.status === "Planned" && (
                      <button
                        onClick={() => approveDrive(d.id)}
                        className="btn-blue"
                      >
                        Approve
                      </button>
                    )}

                    {role === "placement" && d.status === "Approved" && (
                      <button
                        onClick={() => openPlacementModal(d)}
                        className="btn-green"
                      >
                        Mark Completed
                      </button>
                    )}

                    {role === "placement" && d.status === "Planned" && (
                      <span className="text-yellow-400 text-xs">
                        Awaiting Admin Approval
                      </span>
                    )}

                    {d.status === "Completed" && (
                      <span className="text-emerald-400 text-xs">
                        Completed
                      </span>
                    )}

                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </section>

      {/* ================= MODAL ================= */}

      {activeDrive && (
        <PlacementModal
          drive={activeDrive}
          students={students}
          setStudents={setStudents}
          placementMeta={placementMeta}
          setPlacementMeta={setPlacementMeta}
          onClose={() => setActiveDrive(null)}
          onSubmit={handleCompleteSubmit}
        />
      )}

      {/* ================= STYLES ================= */}

      <style>{`

        .input {
          width: 100%;
          padding: 8px 10px;
          border-radius: 6px;
          background: #020617;
          border: 1px solid #475569;
          color: #e2e8f0;
          font-size: 13px;
        }

        .upload {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px dashed #475569;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          background: #020617;
          padding: 8px;
        }

        .btn-blue {
          padding: 4px 10px;
          font-size: 12px;
          background: rgba(59,130,246,0.2);
          color: #60a5fa;
          border-radius: 6px;
        }

        .btn-green {
          padding: 4px 10px;
          font-size: 12px;
          background: rgba(34,197,94,0.2);
          color: #34d399;
          border-radius: 6px;
        }

      `}</style>
    </>
  );
}

/* ===================== MODAL ===================== */

function PlacementModal({
  drive,
  students,
  setStudents,
  placementMeta,
  setPlacementMeta,
  onClose,
  onSubmit,
}) {

  function updateStudent(index, field, value) {
    const copy = [...students];
    copy[index][field] = value;
    setStudents(copy);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-[#020617] border border-cyan-500/30 rounded-2xl p-6 w-full max-w-5xl">

        <h3 className="text-lg font-semibold mb-4">
          Placement List — {drive.companies}
        </h3>

        {/* META */}
        <div className="grid md:grid-cols-3 gap-4 mb-6 bg-[#111827] p-4 rounded-xl border border-slate-700">

          <Input
            label="Project"
            value={placementMeta.project}
            onChange={(v) =>
              setPlacementMeta({ ...placementMeta, project: v })
            }
          />

          <Input
            label="Center"
            value={placementMeta.center}
            onChange={(v) =>
              setPlacementMeta({ ...placementMeta, center: v })
            }
          />

          <Input
            label="Batch Number"
            value={placementMeta.batch}
            onChange={(v) =>
              setPlacementMeta({ ...placementMeta, batch: v })
            }
          />

        </div>

        {/* STUDENTS */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto">

          {students.map((s, i) => (
            <div key={i} className="grid md:grid-cols-5 gap-3 bg-[#111827] p-4 rounded-lg border border-slate-700">

              <input
                className="input"
                placeholder="Student Name"
                value={s.name}
                onChange={(e) =>
                  updateStudent(i, "name", e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Designation"
                value={s.designation}
                onChange={(e) =>
                  updateStudent(i, "designation", e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Company"
                value={s.company}
                onChange={(e) =>
                  updateStudent(i, "company", e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Salary"
                value={s.salary}
                onChange={(e) =>
                  updateStudent(i, "salary", e.target.value)
                }
              />

              <label className="upload">
                Upload Offer
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    updateStudent(
                      i,
                      "offerLetter",
                      e.target.files[0]
                    )
                  }
                />
              </label>

            </div>
          ))}

        </div>

        <button
          onClick={() =>
            setStudents([
              ...students,
              {
                name: "",
                designation: "",
                company: "",
                salary: "",
                offerLetter: null,
              },
            ])
          }
          className="mt-4 text-xs text-cyan-400"
        >
          + Add Student
        </button>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 rounded-md"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-emerald-500 text-black rounded-md"
          >
            Submit Placement
          </button>

        </div>

      </div>
    </div>
  );
}

/* ===================== SMALL COMPONENTS ===================== */

function SummaryCard({ label, value }) {
  return (
    <div className="bg-[#020617] border border-slate-700 rounded-xl p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-xl font-semibold text-cyan-400 mt-1">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Planned: "bg-yellow-500/20 text-yellow-400",
    Approved: "bg-blue-500/20 text-blue-400",
    Completed: "bg-emerald-500/20 text-emerald-400",
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-slate-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input mt-1"
      />
    </div>
  );
}
