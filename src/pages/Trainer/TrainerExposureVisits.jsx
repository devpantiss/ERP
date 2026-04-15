import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SlidePanel from "../../components/common/SlidePanel";
import ExposureVisitEnterprisePro from "./ExposureVisitsStepper";

/* ===================== CONFIG ===================== */

const PROJECTS = [
  "PMKVY",
  "CSR - Tata Steel",
  "DDUGKY",
  "State Skill Mission",
];

const INDUSTRIES = [
  "Tata Power Substation",
  "JSW Steel Plant",
  "Aditya Aluminium Ltd",
  "Odisha Hydro Power Corp",
  "L&T Construction Yard",
];

function generateVisits() {
  const visits = [];

  for (let i = 1; i <= 50; i++) {
    visits.push({
      industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
      spocName: ["Rajesh Mishra", "Priya Sahu", "Amit Das", "Sonal Behera"][
        Math.floor(Math.random() * 4)
      ],
      spocPhone: "9" + Math.floor(100000000 + Math.random() * 900000000),
      project: PROJECTS[Math.floor(Math.random() * PROJECTS.length)],
      batch: `BATCH-${100 + i}`,
      trade: ["Electrical", "Fitter", "Safety", "Welder"][
        Math.floor(Math.random() * 4)
      ],
      date: `${10 + (i % 15)} Feb 2026`,
      candidates: 30,
      attended: 26,
      status: ["Planned", "Approved"][
        Math.floor(Math.random() * 2)
      ],
      image: null,
    });
  }

  return visits;
}

/* ===================== COMPONENT ===================== */

export default function ExposureVisitReportTable() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState(generateVisits());
  const [previewImage, setPreviewImage] = useState(null);
  const fileRefs = useRef({});

  const [showExposureForm, setShowExposureForm] = useState(false);

  /* ===================== FILTERS ===================== */
  const [filterIndustry, setFilterIndustry] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterTrade, setFilterTrade] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      if (filterIndustry && v.industry !== filterIndustry) return false;
      if (filterProject && v.project !== filterProject) return false;
      if (filterTrade && v.trade !== filterTrade) return false;
      if (filterStatus && v.status !== filterStatus) return false;
      return true;
    });
  }, [visits, filterIndustry, filterProject, filterTrade, filterStatus]);

  /* ===================== UPLOAD ===================== */

  const handleUploadClick = (index) => {
    fileRefs.current[index]?.click();
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);

    setVisits((prev) =>
      prev.map((v, i) =>
        i === index
          ? { ...v, image: imageURL, status: "Submitted" }
          : v
      )
    );
  };

  /* ===================== SUMMARY ===================== */

  const summary = useMemo(() => {
    return {
      total: filteredVisits.length,
      planned: filteredVisits.filter((v) => v.status === "Planned").length,
      approved: filteredVisits.filter((v) => v.status === "Approved").length,
      completed: filteredVisits.filter((v) => v.status === "Completed").length,
      submitted: filteredVisits.filter((v) => v.status === "Submitted").length,
    };
  }, [filteredVisits]);

  /* ===================== UI ===================== */

  return (
    <>
      <section
        className="mt-8 rounded-2xl p-8
        bg-[#111827] border border-slate-700"
      >
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-100">
            Exposure Visit Reports
          </h2>

          <button
            onClick={() => setShowExposureForm(true)}
            className="px-4 py-2 rounded-md
            bg-emerald-500 text-black font-medium
            hover:bg-emerald-400 transition"
          >
            + Enter Details
          </button>
        </div>

        {/* ================= SUMMARY STRIP ================= */}
        <div className="grid grid-cols-5 gap-6 mb-6">
          <SummaryCard label="Total" value={summary.total} />
          <SummaryCard label="Planned" value={summary.planned} />
          <SummaryCard label="Approved" value={summary.approved} />
          <SummaryCard label="Completed" value={summary.completed} />
          <SummaryCard label="Submitted" value={summary.submitted} />
        </div>

        {/* ================= FILTERS ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:border-emerald-400/50 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">All Industries</option>
            {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
          </select>

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:border-emerald-400/50 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">All Projects</option>
            {PROJECTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          <select
            value={filterTrade}
            onChange={(e) => setFilterTrade(e.target.value)}
            className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:border-emerald-400/50 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">All Trades</option>
            {["Electrical", "Fitter", "Safety", "Welder"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:border-emerald-400/50 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">All Status</option>
            {["Planned", "Approved", "Completed", "Submitted"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">

            <thead className="bg-[#0f172a] border-b border-slate-700 text-white/60">
              <tr>
                <th className="px-4 py-3">Industry</th>
                <th className="px-4 py-3">Industry SPOC</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Trade</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Documentation</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700">

              {filteredVisits.map((report, index) => (
                <tr
                  key={index}
                  className="hover:bg-transparent/60 transition"
                >
                  <td className="px-4 py-3 text-white/90 font-medium">
                    {report.industry}
                  </td>

                  <td className="px-4 py-3 text-white/60">
                    <div className="flex flex-col">
                      <span className="text-white/80">
                        {report.spocName}
                      </span>
                      <span className="text-xs text-slate-500">
                        {report.spocPhone}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-emerald-400">
                    {report.project}
                  </td>

                  <td className="px-4 py-3 text-white/80">
                    {report.batch}
                  </td>

                  <td className="px-4 py-3 text-white/60">
                    {report.trade}
                  </td>

                  <td className="px-4 py-3 text-white/60">
                    {report.date}
                  </td>

                  <td className="px-4 py-3 text-white/80">
                    {report.attended}/{report.candidates}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={report.status} />
                  </td>

                  <td className="px-4 py-3">

                    {/* PLANNED */}
                    {report.status === "Planned" && (
                      <span className="text-xs text-slate-500">
                        Awaiting Approval
                      </span>
                    )}

                    {/* APPROVED */}
                    {report.status === "Approved" && (
                      <button
                        onClick={() =>
                          setVisits((prev) =>
                            prev.map((v, i) =>
                              i === index
                                ? { ...v, status: "Completed" }
                                : v
                            )
                          )
                        }
                        className="px-3 py-1.5 text-xs rounded-md
                        bg-blue-500/20 text-blue-400
                        hover:bg-blue-500/30 transition"
                      >
                        Mark Completed
                      </button>
                    )}

                    {/* COMPLETED */}
                    {report.status === "Completed" && !report.image && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          ref={(el) =>
                            (fileRefs.current[index] = el)
                          }
                          className="hidden"
                          onChange={(e) =>
                            handleFileChange(e, index)
                          }
                        />

                        <button
                          onClick={() =>
                            handleUploadClick(index)
                          }
                          className="px-3 py-1.5 text-xs rounded-md
                          bg-transparent border border-slate-600
                          text-white/80 hover:bg-slate-700 transition"
                        >
                          Upload Documentation
                        </button>
                      </>
                    )}

                    {/* SUBMITTED */}
                    {report.image && (
                      <img
                        src={report.image}
                        alt="Visit"
                        onClick={() =>
                          setPreviewImage(report.image)
                        }
                        className="w-16 h-12 object-cover rounded-md
                        border border-slate-600 cursor-pointer
                        hover:scale-105 transition"
                      />
                    )}

                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </section>

      <SlidePanel open={!!previewImage} onClose={() => setPreviewImage(null)} title="Visit Documentation" width="lg">
          <img
            src={previewImage}
            alt="Exposure"
            className="w-full rounded-lg"
          />
      </SlidePanel>

      {showExposureForm && (
        <ExposureVisitEnterprisePro onClose={() => setShowExposureForm(false)} />
      )}
    </>
  );
}

/* ===================== SMALL COMPONENTS ===================== */

function SummaryCard({ label, value }) {
  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-5">
      <p className="text-sm text-white/60">{label}</p>
      <p className="text-2xl font-bold text-slate-100 mt-1">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "Planned")
    return <span className="px-3 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Planned</span>;

  if (status === "Approved")
    return <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Approved</span>;

  if (status === "Completed")
    return <span className="px-3 py-1 text-xs rounded-full bg-indigo-500/20 text-indigo-400">Completed</span>;

  if (status === "Submitted")
    return <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Submitted</span>;

  return null;
}