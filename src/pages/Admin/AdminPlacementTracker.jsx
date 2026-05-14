import Pagination from "../../components/common/Pagination";
import SlidePanel from "../../components/common/SlidePanel";
import { useState, useMemo } from "react";
import { FileText, CheckCircle, Clock, X, Eye, Upload, ZoomIn, ShieldCheck, AlertCircle } from "lucide-react";

const PROJECTS = ["All", "PMKVY", "CSR - Tata Steel", "DDUGKY", "DMF Keonjhar"];
const COMPANIES = ["All", "Tata Steel", "Adani", "L&T", "JSW", "Vedanta"];
const CENTERS = ["All", "Angul", "Jharsuguda", "Kalahandi", "Keonjhar"];
const DOC_FIELDS = [
  { key: "offer", label: "Offer Letter" },
  { key: "m1", label: "M1 Salary Slip" },
  { key: "m2", label: "M2 Salary Slip" },
  { key: "m3", label: "M3 Salary Slip" },
  { key: "bank", label: "Bank Account Details" },
];

const sampleDocs = {
  offer: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
  m1: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
  m2: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
  m3: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
  bank: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
};

const buildStudents = () =>
  Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `Student ${i + 1}`,
    batch: `BATCH-${101 + (i % 5)}`,
    project: ["PMKVY", "CSR - Tata Steel", "DDUGKY", "DMF Keonjhar"][i % 4],
    center: ["Angul", "Jharsuguda", "Kalahandi", "Keonjhar"][i % 4],
    company: ["Tata Steel", "Adani", "L&T", "JSW", "Vedanta"][i % 5],
    designation: ["Technician", "Operator", "Safety Officer", "Fitter"][i % 4],
    salary: 18000 + (i % 5) * 3000,
    joiningDate: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`,
    docs: {
      offer: i % 2 === 0 ? { url: sampleDocs.offer, verified: false } : null,
      m1: i % 3 === 0 ? { url: sampleDocs.m1, verified: false } : null,
      m2: i % 4 === 0 ? { url: sampleDocs.m2, verified: false } : null,
      m3: i % 5 === 0 ? { url: sampleDocs.m3, verified: false } : null,
      bank: i % 2 === 0 ? { url: sampleDocs.bank, verified: false } : null,
    },
  }));

/* ================= HELPERS ================= */

const getStudentStatus = (s) => {
  const uploaded = DOC_FIELDS.filter((f) => s.docs[f.key]);
  if (uploaded.length === 0) return "no-docs";
  const allVerified = uploaded.length === DOC_FIELDS.length && uploaded.every((f) => s.docs[f.key]?.verified);
  if (allVerified) return "verified";
  if (uploaded.some((f) => s.docs[f.key]?.verified)) return "partial";
  return "pending";
};

/* ================= PREVIEW MODAL ================= */

function DocPreviewModal({ student, onClose, onVerifyDoc, onVerifyAll }) {
  const [activeTab, setActiveTab] = useState(DOC_FIELDS.find((f) => student.docs[f.key])?.key || "offer");
  const [zoomedDoc, setZoomedDoc] = useState(null);

  const uploadedCount = DOC_FIELDS.filter((f) => student.docs[f.key]).length;
  const verifiedCount = DOC_FIELDS.filter((f) => student.docs[f.key]?.verified).length;
  const allUploaded = uploadedCount === DOC_FIELDS.length;
  const allVerified = verifiedCount === DOC_FIELDS.length;
  const activeDoc = student.docs[activeTab];

  return (
    <>
      <SlidePanel open={true} onClose={onClose} title={`${student.name} — Document Verification`} width="xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">{student.name} — Document Verification</h3>
            <p className="text-xs text-white/60 mt-0.5">
              {student.company} • {student.designation} • ₹{student.salary}/mo • {student.batch}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/60 bg-transparent px-2.5 py-1 rounded-lg">
              {verifiedCount}/{DOC_FIELDS.length} verified
            </span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700 text-white/60 hover:text-white transition">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Document Tabs */}
        <div className="flex border-b border-slate-700 px-4 overflow-x-auto">
          {DOC_FIELDS.map((f) => {
            const doc = student.docs[f.key];
            return (
              <button
                key={f.key}
                onClick={() => setActiveTab(f.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap
                  ${activeTab === f.key
                    ? "border-violet-400 text-violet-400"
                    : "border-transparent text-white/60 hover:text-white/90"
                  }`}
              >
                {doc?.verified ? (
                  <ShieldCheck size={13} className="text-emerald-400" />
                ) : doc ? (
                  <Eye size={13} className="text-yellow-400" />
                ) : (
                  <Clock size={13} className="text-slate-600" />
                )}
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeDoc ? (
            <div className="space-y-4">
              {/* Document Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-violet-400" />
                  <span className="text-sm text-white/80">
                    {DOC_FIELDS.find((f) => f.key === activeTab)?.label}
                  </span>
                  {activeDoc.verified ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                      <ShieldCheck size={10} /> Verified
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center gap-1">
                      <AlertCircle size={10} /> Needs Review
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomedDoc(activeDoc.url)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-transparent text-white/80 hover:bg-slate-700 transition"
                  >
                    <ZoomIn size={13} /> Full Screen
                  </button>
                  {!activeDoc.verified && (
                    <button
                      onClick={() => onVerifyDoc(student.id, activeTab)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 transition cursor-pointer font-medium"
                    >
                      <ShieldCheck size={13} /> Verify This Document
                    </button>
                  )}
                </div>
              </div>

              {/* Document Preview */}
              <div
                className="bg-[#020617] border border-slate-700 rounded-xl overflow-hidden cursor-pointer
                hover:border-violet-500/30 transition relative group"
                onClick={() => setZoomedDoc(activeDoc.url)}
              >
                <img
                  src={activeDoc.url}
                  alt={`${activeTab} document`}
                  className="w-full max-h-[380px] object-contain"
                />
                <div className="absolute inset-0 bg-transparent/0 group-hover:bg-transparent/20 transition flex items-center justify-center">
                  <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
                {activeDoc.verified && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-medium flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified
                  </div>
                )}
              </div>

              {/* Document metadata */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-transparent border border-white/[0.08] rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase">Type</p>
                  <p className="text-xs text-white/80 mt-0.5">{DOC_FIELDS.find((f) => f.key === activeTab)?.label}</p>
                </div>
                <div className="bg-transparent border border-white/[0.08] rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase">Upload Date</p>
                  <p className="text-xs text-white/80 mt-0.5">28 Feb 2026</p>
                </div>
                <div className="bg-transparent border border-white/[0.08] rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase">Verification</p>
                  <p className={`text-xs mt-0.5 ${activeDoc.verified ? "text-emerald-400" : "text-yellow-400"}`}>
                    {activeDoc.verified ? "Admin Verified" : "Awaiting Review"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center mb-4">
                <Upload size={24} className="text-slate-500" />
              </div>
              <h4 className="text-sm font-medium text-white/60">Document Not Uploaded</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                The placement officer has not yet uploaded the{" "}
                <strong className="text-white/60">{DOC_FIELDS.find((f) => f.key === activeTab)?.label}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            {DOC_FIELDS.map((f) => {
              const d = student.docs[f.key];
              return (
                <span key={f.key} className={`flex items-center gap-1 ${d?.verified ? "text-emerald-400" : d ? "text-yellow-400" : "text-slate-600"}`}>
                  {d?.verified ? <ShieldCheck size={11} /> : d ? <Eye size={11} /> : <Clock size={11} />}
                  {f.key.toUpperCase()}
                </span>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm bg-slate-700 text-white/80 rounded-lg hover:bg-slate-600 transition">
              Close
            </button>
            {allVerified ? (
              <span className="px-5 py-2 text-sm rounded-lg font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <ShieldCheck size={14} /> All Documents Verified
              </span>
            ) : allUploaded ? (
              <button
                onClick={() => onVerifyAll(student.id)}
                className="px-5 py-2 text-sm rounded-lg font-medium bg-violet-500 text-white hover:bg-violet-400 transition cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck size={14} /> Verify All Remaining
              </button>
            ) : (
              <span className="px-5 py-2 text-sm rounded-lg font-medium bg-transparent text-slate-500">
                {uploadedCount}/{DOC_FIELDS.length} documents uploaded
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

/* ================= MAIN COMPONENT ================= */

export default function AdminPlacementTracker() {
  const [students, setStudents] = useState(buildStudents);
  const [batchFilter, setBatchFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [centerFilter, setCenterFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [jobRoleFilter, setJobRoleFilter] = useState("All");
  const [verifyFilter, setVerifyFilter] = useState("All");
  const [previewStudent, setPreviewStudent] = useState(null);

  const batches = ["All", ...new Set(students.map((s) => s.batch))];
  const jobRoles = ["All", ...new Set(students.map((s) => s.designation))];

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchBatch = batchFilter === "All" || s.batch === batchFilter;
      const matchProject = projectFilter === "All" || s.project === projectFilter;
      const matchCenter = centerFilter === "All" || s.center === centerFilter;
      const matchCompany = companyFilter === "All" || s.company === companyFilter;
      const matchJobRole = jobRoleFilter === "All" || s.designation === jobRoleFilter;
      const status = getStudentStatus(s);
      const matchVerify =
        verifyFilter === "All" ||
        (verifyFilter === "Verified" && status === "verified") ||
        (verifyFilter === "Pending" && status !== "verified");
      return matchBatch && matchProject && matchCenter && matchCompany && matchJobRole && matchVerify;
    });
  }, [students, batchFilter, projectFilter, centerFilter, companyFilter, jobRoleFilter, verifyFilter]);

  const totalPlaced = filtered.length;
  const totalVerified = filtered.filter((s) => getStudentStatus(s) === "verified").length;
  const avgSalary = Math.round(filtered.reduce((s, st) => s + st.salary, 0) / (filtered.length || 1));
  const docsPending = filtered.filter((s) => getStudentStatus(s) !== "verified").length;

  /* Verify a single document */
  const verifyDoc = (studentId, docKey) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, docs: { ...s.docs, [docKey]: { ...s.docs[docKey], verified: true } } }
          : s
      )
    );
    /* Also update the modal's student reference */
    setPreviewStudent((prev) =>
      prev && prev.id === studentId
        ? { ...prev, docs: { ...prev.docs, [docKey]: { ...prev.docs[docKey], verified: true } } }
        : prev
    );
  };

  /* Verify all remaining uploaded documents */
  const verifyAll = (studentId) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const newDocs = { ...s.docs };
        DOC_FIELDS.forEach((f) => {
          if (newDocs[f.key]) newDocs[f.key] = { ...newDocs[f.key], verified: true };
        });
        return { ...s, docs: newDocs };
      })
    );
    setPreviewStudent((prev) => {
      if (!prev || prev.id !== studentId) return prev;
      const newDocs = { ...prev.docs };
      DOC_FIELDS.forEach((f) => {
        if (newDocs[f.key]) newDocs[f.key] = { ...newDocs[f.key], verified: true };
      });
      return { ...prev, docs: newDocs };
    });
  };

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered?.slice(start, start + itemsPerPage) || [];
  }, [filtered, currentPage]);
  const totalPages = Math.ceil((filtered?.length || 0) / itemsPerPage);

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Placement Tracker</h1>
        <p className="text-sm text-white/60 mt-1">Review uploaded documents and verify student placement details</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Placed", value: totalPlaced, cls: "text-violet-400" },
          { label: "Verified", value: totalVerified, cls: "text-emerald-400" },
          { label: "Avg. Salary", value: `₹${avgSalary}`, cls: "text-cyan-400" },
          { label: "Pending Review", value: docsPending, cls: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#111827] border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-white/60">{s.label}</p>
            <p className={`text-xl font-semibold mt-1 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={batchFilter} onChange={(e) => { setBatchFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90">
          {batches.map((b) => <option key={b} value={b}>{b === "All" ? "All Batches" : b}</option>)}
        </select>
        <select value={projectFilter} onChange={(e) => { setProjectFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90">
          {PROJECTS.map((p) => <option key={p} value={p}>{p === "All" ? "All Projects" : p}</option>)}
        </select>
        <select value={centerFilter} onChange={(e) => { setCenterFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90">
          {CENTERS.map((c) => <option key={c} value={c}>{c === "All" ? "All Centers" : c}</option>)}
        </select>
        <select value={companyFilter} onChange={(e) => { setCompanyFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90">
          {COMPANIES.map((c) => <option key={c} value={c}>{c === "All" ? "All Companies" : c}</option>)}
        </select>
        <select value={jobRoleFilter} onChange={(e) => { setJobRoleFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90">
          {jobRoles.map((role) => <option key={role} value={role}>{role === "All" ? "All Job Roles" : role}</option>)}
        </select>
        <div className="flex gap-2">
          {["All", "Verified", "Pending"].map((v) => (
            <button key={v} onClick={() => { setVerifyFilter(v); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${verifyFilter === v ? "bg-violet-500 text-white" : "bg-[#111827] text-white/60 border border-slate-700"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-full bg-[#111827] border border-slate-700 rounded-xl overflow-hidden">
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full text-sm min-w-[1300px]">
            <thead className="bg-[#0b1220] text-white/60 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">Center</th>
                <th className="p-4 text-left">Batch</th>
                <th className="p-4 text-left">Company</th>
                <th className="p-4 text-left">Designation</th>
                <th className="p-4 text-left">Salary</th>
                <th className="p-4 text-left">Joining</th>
                {DOC_FIELDS.map((f) => (
                  <th key={f.key} className="p-4 text-center">{f.key === "bank" ? "Bank" : f.label.split(" ")[0]}</th>
                ))}
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
            {paginatedData.map((s) => {
                const status = getStudentStatus(s);
                return (
                  <tr key={s.id} className="border-t border-slate-700/50 hover:bg-transparent/30 transition">
                    <td className="p-4 font-medium text-white/90">{s.name}</td>
                    <td className="p-4 text-white/60">{s.center}</td>
                    <td className="p-4 text-white/60">{s.batch}</td>
                    <td className="p-4 text-white/80">{s.company}</td>
                    <td className="p-4 text-white/60">{s.designation}</td>
                    <td className="p-4 text-green-400">₹{s.salary}</td>
                    <td className="p-4 text-white/60">{s.joiningDate}</td>
                    {DOC_FIELDS.map((f) => {
                      const doc = s.docs[f.key];
                      return (
                        <td key={f.key} className="p-4 text-center">
                          {doc ? (
                            <button
                              onClick={() => setPreviewStudent(s)}
                              className={`group flex items-center justify-center gap-1 mx-auto px-2 py-1 rounded-md transition cursor-pointer ${
                                doc.verified
                                  ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                              }`}
                              title={doc.verified ? `${f.label}: Verified` : `${f.label}: Click to review`}
                            >
                              {doc.verified ? <ShieldCheck size={12} /> : <Eye size={12} />}
                              <span className="text-[10px]">{doc.verified ? "OK" : "View"}</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-600 flex items-center justify-center gap-1"><Clock size={12} /></span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-4 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        status === "verified" ? "bg-emerald-500/10 text-emerald-400"
                        : status === "partial" ? "bg-blue-500/10 text-blue-400"
                        : "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {status === "verified" ? "Verified" : status === "partial" ? "Partial" : "Pending"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setPreviewStudent(s)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition"
                      >
                        Review Docs
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewStudent && (
        <DocPreviewModal
          student={previewStudent}
          onClose={() => setPreviewStudent(null)}
          onVerifyDoc={verifyDoc}
          onVerifyAll={verifyAll}
        />
      )}
    </div>
  );
}
