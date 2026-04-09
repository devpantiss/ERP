import Pagination from "../../components/common/Pagination";
import { useState, useMemo } from "react";
import { CheckCircle, XCircle, Eye, FileText, X } from "lucide-react";

const sampleImage = (i) => `https://i.pravatar.cc/400?img=${(i % 70) + 1}`;
const samplePDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const CANDIDATES = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Candidate ${i + 1}`,
  mobilizer: ["Priya Mishra", "Vikram Singh", "Rajan Nayak", "Sunita Patra"][i % 4],
  center: ["Jajpur", "Keonjhar", "Angul", "Kalahandi"][i % 4],
  jobrole: ["Welder", "Fitter", "Electrician", "Safety"][i % 4],
  dob: `199${i % 5}-0${(i % 8) + 1}-15`,
  gender: i % 2 === 0 ? "Male" : "Female",
  phone: `+91 98765${43210 + i}`,
  aadhaar: `XXXX-XXXX-${2000 + i}`,
  qualification: ["10th Pass", "12th Pass", "ITI", "Diploma"][i % 4],
  status: i % 5 === 0 ? "Approved" : i % 5 === 1 ? "Rejected" : "Pending",
  avatar: sampleImage(i),
  aadhaarFile: i % 2 ? samplePDF : sampleImage(i + 10),
  qualificationFile: i % 2 ? sampleImage(i + 20) : samplePDF,
}));

export default function AdminCandidateApprovals() {
  const [candidates, setCandidates] = useState(CANDIDATES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [mobilizerFilter, setMobilizerFilter] = useState("All");
  const [viewCandidate, setViewCandidate] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const mobilizers = ["All", ...new Set(CANDIDATES.map((c) => c.mobilizer))];

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      const matchMob = mobilizerFilter === "All" || c.mobilizer === mobilizerFilter;
      return matchSearch && matchStatus && matchMob;
    });
  }, [candidates, search, statusFilter, mobilizerFilter]);

  const updateStatus = (id, status) => {
    setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    setViewCandidate(null);
  };

  const stats = useMemo(() => ({
    total: candidates.length,
    pending: candidates.filter((c) => c.status === "Pending").length,
    approved: candidates.filter((c) => c.status === "Approved").length,
    rejected: candidates.filter((c) => c.status === "Rejected").length,
  }), [candidates]);

  
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
        <h1 className="text-2xl font-semibold text-slate-100">Candidate Approvals</h1>
        <p className="text-sm text-white/60 mt-1">Approve or enroll candidates mobilized by mobilizers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, cls: "text-slate-100" },
          { label: "Pending", value: stats.pending, cls: "text-yellow-400" },
          { label: "Approved", value: stats.approved, cls: "text-emerald-400" },
          { label: "Rejected", value: stats.rejected, cls: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#111827] border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-white/60">{s.label}</p>
            <p className={`text-xl font-semibold mt-1 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input placeholder="Search candidate..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90 focus:border-violet-400 outline-none" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90">
          <option value="All">All Status</option><option>Pending</option><option>Approved</option><option>Rejected</option>
        </select>
        <select value={mobilizerFilter} onChange={(e) => setMobilizerFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90">
          {mobilizers.map((m) => <option key={m} value={m}>{m === "All" ? "All Mobilizers" : m}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-[#0b1220] text-white/60">
              <tr>
                <th className="p-4 text-left">Candidate</th>
                <th className="p-4 text-left">Mobilizer</th>
                <th className="p-4 text-left">Job Role</th>
                <th className="p-4 text-left">Center</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
            {paginatedData.map((c) => (
                <tr key={c.id} className="border-t border-slate-700/50 hover:bg-transparent/30 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={c.avatar} className="w-8 h-8 rounded-lg border border-slate-700" />
                      <div>
                        <p className="font-medium text-white/90">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-white/60">{c.mobilizer}</td>
                  <td className="p-4 text-white/80">{c.jobrole}</td>
                  <td className="p-4 text-white/60">{c.center}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${c.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : c.status === "Rejected" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setViewCandidate(c)} className="p-1.5 rounded-lg hover:bg-slate-700" title="View"><Eye size={15} className="text-white/60" /></button>
                      {c.status === "Pending" && (
                        <>
                          <button onClick={() => updateStatus(c.id, "Approved")} className="p-1.5 rounded-lg hover:bg-emerald-500/10" title="Approve"><CheckCircle size={15} className="text-emerald-400" /></button>
                          <button onClick={() => updateStatus(c.id, "Rejected")} className="p-1.5 rounded-lg hover:bg-red-500/10" title="Reject"><XCircle size={15} className="text-red-400" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* View Modal */}
      {viewCandidate && (
        <div className="fixed inset-0 bg-transparent/80 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Candidate Details</h3>
              <button onClick={() => setViewCandidate(null)} className="text-white/60 hover:text-white"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img src={viewCandidate.avatar} className="w-16 h-16 rounded-xl border border-slate-700" />
              <div>
                <p className="text-lg font-semibold">{viewCandidate.name}</p>
                <p className="text-sm text-violet-400">{viewCandidate.jobrole}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              {[
                ["Mobilizer", viewCandidate.mobilizer], ["Center", viewCandidate.center],
                ["DOB", viewCandidate.dob], ["Gender", viewCandidate.gender],
                ["Aadhaar", viewCandidate.aadhaar], ["Qualification", viewCandidate.qualification],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b border-white/[0.08]">
                  <span className="text-white/60">{k}</span><span className="text-white/90">{v}</span>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <p className="text-xs text-white/60 mb-2">Documents</p>
              <div className="flex gap-3">
                <button onClick={() => setPreviewFile(viewCandidate.aadhaarFile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-transparent text-white/80 hover:bg-slate-700"><FileText size={13} /> Aadhaar</button>
                <button onClick={() => setPreviewFile(viewCandidate.qualificationFile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-transparent text-white/80 hover:bg-slate-700"><FileText size={13} /> Qualification</button>
              </div>
            </div>
            {viewCandidate.status === "Pending" && (
              <div className="flex gap-3 mt-4">
                <button onClick={() => updateStatus(viewCandidate.id, "Approved")}
                  className="flex-1 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-400">Approve & Enroll</button>
                <button onClick={() => updateStatus(viewCandidate.id, "Rejected")}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-400">Reject</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Preview */}
      {previewFile && (
        <div className="fixed inset-0 bg-transparent/70 z-[60] flex items-center justify-center" onClick={() => setPreviewFile(null)}>
          <div className="bg-[#020617] rounded-xl p-4 max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2"><button onClick={() => setPreviewFile(null)} className="text-white/60 hover:text-white">✕</button></div>
            {previewFile.includes(".pdf") ? <iframe src={previewFile} className="w-full h-[500px]" /> : <img src={previewFile} className="w-full rounded-lg" />}
          </div>
        </div>
      )}
    </div>
  );
}
