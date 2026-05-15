import Pagination from "../../components/common/Pagination";
import SlidePanel from "../../components/common/SlidePanel";
import { useState, useMemo } from "react";
import { CheckCircle, XCircle, Calendar, FileText, Eye, X, ZoomIn, ShieldCheck, Upload, AlertCircle, Clock } from "lucide-react";

const DOC_FIELDS = [
  { key: "permission", label: "Permission Letter" },
  { key: "attendance", label: "Attendance Sheet" },
  { key: "report", label: "Visit Report" },
  { key: "photos", label: "Visit Photos" },
  { key: "feedback", label: "Industry Feedback" },
];

const sampleDoc = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80";

const buildVisits = () =>
  Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    trainer: ["Aditya Sahu", "Deepak Kumar", "Suresh Naik", "Rahul Sharma", "Amit Panda"][i % 5],
    industry: ["Tata Power Substation", "JSW Steel Plant", "Aditya Aluminium Ltd", "Odisha Hydro Power Corp", "L&T Construction Yard"][i % 5],
    spocName: ["Rajesh Mishra", "Priya Sahu", "Amit Das", "Sonal Behera"][i % 4],
    project: ["PMKVY", "CSR - Tata Steel", "DDUGKY", "State Skill Mission"][i % 4],
    batch: `BATCH-${101 + (i % 3)}`,
    trade: ["Electrical", "Fitter", "Safety", "Welder"][i % 4],
    date: `2026-03-${String((i % 28) + 1).padStart(2, "0")}`,
    candidates: 30,
    attended: 26,
    status: i % 4 === 0 ? "Planned" : i % 4 === 1 ? "Approved" : i % 4 === 2 ? "Completed" : "Submitted",
    docs: {
      permission: i % 2 === 0 ? { url: sampleDoc, verified: false } : null,
      attendance: i % 3 === 0 ? { url: sampleDoc, verified: false } : null,
      report: i % 4 === 0 ? { url: sampleDoc, verified: false } : null,
      photos: i % 3 === 0 ? { url: sampleDoc, verified: false } : null,
      feedback: i % 5 === 0 ? { url: sampleDoc, verified: false } : null,
    },
  }));

const MONTHS = ["January", "February", "March", "April", "May", "June"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ================= DOC PREVIEW MODAL ================= */

function DocPreviewModal({ visit, onClose, onVerifyDoc, onVerifyAll }) {
  const [activeTab, setActiveTab] = useState(DOC_FIELDS.find((f) => visit.docs[f.key])?.key || "permission");
  const [zoomedDoc, setZoomedDoc] = useState(null);

  const uploadedCount = DOC_FIELDS.filter((f) => visit.docs[f.key]).length;
  const verifiedCount = DOC_FIELDS.filter((f) => visit.docs[f.key]?.verified).length;
  const allUploaded = uploadedCount === DOC_FIELDS.length;
  const allVerified = verifiedCount === DOC_FIELDS.length;
  const activeDoc = visit.docs[activeTab];

  return (
    <>
    <SlidePanel open={true} onClose={onClose} title={`${visit.trainer} — Visit Documents`} width="xl">
        <p className="text-xs text-white/60 mb-4">
          {visit.industry} • {visit.batch} • {visit.trade} • {visit.date}
        </p>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-white/60 bg-transparent px-2.5 py-1 rounded-lg">
            {verifiedCount}/{DOC_FIELDS.length} verified
          </span>
        </div>

        {/* Document Tabs */}
        <div className="flex border-b border-slate-700 mb-4 overflow-x-auto">
          {DOC_FIELDS.map((f) => {
            const doc = visit.docs[f.key];
            return (
              <button key={f.key} onClick={() => setActiveTab(f.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === f.key ? "border-violet-400 text-violet-400" : "border-transparent text-white/60 hover:text-white/90"
                }`}>
                {doc?.verified ? <ShieldCheck size={13} className="text-emerald-400" /> : doc ? <Eye size={13} className="text-yellow-400" /> : <Clock size={13} className="text-slate-600" />}
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto">
          {activeDoc ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-violet-400" />
                  <span className="text-sm text-white/80">{DOC_FIELDS.find((f) => f.key === activeTab)?.label}</span>
                  {activeDoc.verified ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center gap-1"><ShieldCheck size={10} /> Verified</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center gap-1"><AlertCircle size={10} /> Needs Review</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setZoomedDoc(activeDoc.url)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-transparent text-white/80 hover:bg-slate-700 transition">
                    <ZoomIn size={13} /> Full Screen
                  </button>
                  {!activeDoc.verified && (
                    <button onClick={() => onVerifyDoc(visit.id, activeTab)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 transition font-medium">
                      <ShieldCheck size={13} /> Verify This Document
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-[#020617] border border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:border-violet-500/30 transition relative group"
                onClick={() => setZoomedDoc(activeDoc.url)}>
                <img src={activeDoc.url} alt={`${activeTab} document`} className="w-full max-h-[380px] object-contain" />
                <div className="absolute inset-0 bg-transparent/0 group-hover:bg-transparent/20 transition flex items-center justify-center">
                  <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
                {activeDoc.verified && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-medium flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Type", value: DOC_FIELDS.find((f) => f.key === activeTab)?.label },
                  { label: "Upload Date", value: visit.date },
                  { label: "Verification", value: activeDoc.verified ? "Admin Verified" : "Awaiting Review", cls: activeDoc.verified ? "text-emerald-400" : "text-yellow-400" },
                ].map((m) => (
                  <div key={m.label} className="bg-transparent border border-white/[0.08] rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 uppercase">{m.label}</p>
                    <p className={`text-xs mt-0.5 ${m.cls || "text-white/80"}`}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center mb-4">
                <Upload size={24} className="text-slate-500" />
              </div>
              <h4 className="text-sm font-medium text-white/60">Document Not Uploaded</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                The trainer has not yet uploaded the <strong className="text-white/60">{DOC_FIELDS.find((f) => f.key === activeTab)?.label}</strong> for this visit.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            {DOC_FIELDS.map((f) => {
              const d = visit.docs[f.key];
              return (
                <span key={f.key} className={`flex items-center gap-1 ${d?.verified ? "text-emerald-400" : d ? "text-yellow-400" : "text-slate-600"}`}>
                  {d?.verified ? <ShieldCheck size={11} /> : d ? <Eye size={11} /> : <Clock size={11} />}
                  {f.label.split(" ")[0]}
                </span>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm bg-slate-700 text-white/80 rounded-lg hover:bg-slate-600 transition">Close</button>
            {allVerified ? (
              <span className="px-5 py-2 text-sm rounded-lg font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <ShieldCheck size={14} /> All Verified
              </span>
            ) : allUploaded ? (
              <button onClick={() => onVerifyAll(visit.id)}
                className="px-5 py-2 text-sm rounded-lg font-medium bg-violet-500 text-white hover:bg-violet-400 transition flex items-center gap-1.5">
                <ShieldCheck size={14} /> Verify All Remaining
              </button>
            ) : (
              <span className="px-5 py-2 text-sm rounded-lg font-medium bg-transparent text-slate-500">
                {uploadedCount}/{DOC_FIELDS.length} docs uploaded
              </span>
            )}
          </div>
        </div>
    </SlidePanel>
    {zoomedDoc && (
      <SlidePanel open={true} onClose={() => setZoomedDoc(null)} title="Document Preview" width="xl">
        <img src={zoomedDoc} alt="Document preview" className="max-h-[80vh] w-full rounded-xl object-contain" />
      </SlidePanel>
    )}
    </>
  );
}

/* ================= CALENDAR ================= */

function CalendarView({ visits }) {
  const [month, setMonth] = useState(2);
  const year = 2026;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const visitsByDate = {};
  visits.forEach((v) => {
    const d = new Date(v.date);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const key = d.getDate();
      if (!visitsByDate[key]) visitsByDate[key] = [];
      visitsByDate[key].push(v);
    }
  });

  return (
    <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-violet-400 flex items-center gap-2"><Calendar size={16} /> Exposure Visit Calendar</h3>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
          className="bg-transparent border border-slate-700 text-sm text-white/90 px-3 py-1 rounded-lg">
          {MONTHS.map((m, i) => <option key={i} value={i}>{m} 2026</option>)}
        </select>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d) => <div key={d} className="text-xs text-slate-500 text-center py-1">{d}</div>)}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dayVisits = visitsByDate[day] || [];
          return (
            <div key={day} className={`min-h-[60px] p-1 border border-white/[0.08] rounded-lg ${dayVisits.length ? "bg-violet-500/5" : ""}`}>
              <span className="text-xs text-white/60">{day}</span>
              {dayVisits.map((v) => (
                <div key={v.id} className={`mt-0.5 text-[9px] px-1 py-0.5 rounded truncate ${
                  v.status === "Planned" ? "bg-yellow-500/10 text-yellow-400" : v.status === "Approved" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                }`}>
                  {v.trainer.split(" ")[0]}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */

export default function AdminExposureVisitApprovals() {
  const [visits, setVisits] = useState(buildVisits);
  const [trainerFilter, setTrainerFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [previewVisit, setPreviewVisit] = useState(null);

  const trainers = ["All", ...new Set(visits.map((v) => v.trainer))];

  const filtered = useMemo(() => {
    return visits.filter((v) => {
      const matchTrainer = trainerFilter === "All" || v.trainer === trainerFilter;
      const matchStatus = statusFilter === "All" || v.status === statusFilter;
      return matchTrainer && matchStatus;
    });
  }, [visits, trainerFilter, statusFilter]);

  const approve = (id) => setVisits((prev) => prev.map((v) => v.id === id ? { ...v, status: "Approved" } : v));
  const reject = (id) => setVisits((prev) => prev.map((v) => v.id === id ? { ...v, status: "Rejected" } : v));

  const verifyDoc = (visitId, docKey) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId ? { ...v, docs: { ...v.docs, [docKey]: { ...v.docs[docKey], verified: true } } } : v
      )
    );
    setPreviewVisit((prev) =>
      prev && prev.id === visitId
        ? { ...prev, docs: { ...prev.docs, [docKey]: { ...prev.docs[docKey], verified: true } } }
        : prev
    );
  };

  const verifyAll = (visitId) => {
    const updateDocs = (v) => {
      if (v.id !== visitId) return v;
      const newDocs = { ...v.docs };
      DOC_FIELDS.forEach((f) => { if (newDocs[f.key]) newDocs[f.key] = { ...newDocs[f.key], verified: true }; });
      return { ...v, docs: newDocs };
    };
    setVisits((prev) => prev.map(updateDocs));
    setPreviewVisit((prev) => prev ? updateDocs(prev) : prev);
  };

  const summary = useMemo(() => ({
    total: visits.length,
    planned: visits.filter((v) => v.status === "Planned").length,
    approved: visits.filter((v) => v.status === "Approved").length,
    completed: visits.filter((v) => v.status === "Completed").length,
  }), [visits]);

  const getDocStatus = (v) => {
    const uploaded = DOC_FIELDS.filter((f) => v.docs[f.key]).length;
    const verified = DOC_FIELDS.filter((f) => v.docs[f.key]?.verified).length;
    return { uploaded, verified };
  };

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered?.slice(start, start + itemsPerPage) || [];
  }, [filtered, currentPage]);
  const totalPages = Math.ceil((filtered?.length || 0) / itemsPerPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Exposure Visit Approvals</h1>
        <p className="text-sm text-white/60 mt-1">Approve trainer exposure visits, review documents and verify completion</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: summary.total, cls: "text-slate-100" },
          { label: "Awaiting Approval", value: summary.planned, cls: "text-yellow-400" },
          { label: "Approved", value: summary.approved, cls: "text-blue-400" },
          { label: "Completed", value: summary.completed, cls: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#111827] border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-white/60">{s.label}</p>
            <p className={`text-xl font-semibold mt-1 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <CalendarView visits={visits} />

      <div className="flex flex-wrap items-center gap-3">
        <select value={trainerFilter} onChange={(e) => setTrainerFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90">
          {trainers.map((t) => <option key={t} value={t}>{t === "All" ? "All Trainers" : t}</option>)}
        </select>
        <div className="flex gap-2">
          {["All", "Planned", "Approved", "Completed", "Submitted"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${statusFilter === s ? "bg-violet-500 text-white" : "bg-[#111827] text-white/60 border border-slate-700"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-[#0b1220] text-white/60 text-xs">
              <tr>
                <th className="p-4 text-left">Trainer</th>
                <th className="p-4 text-left">Industry</th>
                <th className="p-4 text-left">Batch / Trade</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-center">Attendance</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Docs</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
            {paginatedData.map((v) => {
                const ds = getDocStatus(v);
                return (
                  <tr key={v.id} className="border-t border-slate-700/50 hover:bg-transparent/30 transition">
                    <td className="p-4 text-violet-400 font-medium">{v.trainer}</td>
                    <td className="p-4 text-white/80">{v.industry}</td>
                    <td className="p-4 text-white/60">{v.batch} / {v.trade}</td>
                    <td className="p-4 text-white/60">{v.date}</td>
                    <td className="p-4 text-center text-white/80">{v.attended}/{v.candidates}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        v.status === "Planned" ? "bg-yellow-500/10 text-yellow-400"
                        : v.status === "Approved" ? "bg-blue-500/10 text-blue-400"
                        : v.status === "Completed" ? "bg-indigo-500/10 text-indigo-400"
                        : v.status === "Rejected" ? "bg-red-500/10 text-red-400"
                        : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => setPreviewVisit(v)}
                        className={`flex items-center gap-1.5 mx-auto px-2.5 py-1 text-xs rounded-lg transition cursor-pointer ${
                          ds.verified === DOC_FIELDS.length && ds.uploaded === DOC_FIELDS.length
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : ds.uploaded > 0
                            ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                            : "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20"
                        }`}>
                        {ds.verified === DOC_FIELDS.length && ds.uploaded === DOC_FIELDS.length ? (
                          <><ShieldCheck size={12} /> All OK</>
                        ) : ds.uploaded > 0 ? (
                          <><Eye size={12} /> {ds.verified}/{ds.uploaded}</>
                        ) : (
                          <><Clock size={12} /> None</>
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {v.status === "Planned" && (
                          <>
                            <button onClick={() => approve(v.id)} className="p-1.5 rounded-lg hover:bg-emerald-500/10" title="Approve"><CheckCircle size={15} className="text-emerald-400" /></button>
                            <button onClick={() => reject(v.id)} className="p-1.5 rounded-lg hover:bg-red-500/10" title="Reject"><XCircle size={15} className="text-red-400" /></button>
                          </>
                        )}
                        <button onClick={() => setPreviewVisit(v)}
                          className="p-1.5 rounded-lg hover:bg-violet-500/10" title="Review Documents">
                          <FileText size={15} className="text-violet-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {previewVisit && (
        <DocPreviewModal
          visit={previewVisit}
          onClose={() => setPreviewVisit(null)}
          onVerifyDoc={verifyDoc}
          onVerifyAll={verifyAll}
        />
      )}
    </div>
  );
}
