import Pagination from "../../components/common/Pagination";
import { useState, useMemo } from "react";
import { CheckCircle, XCircle, Eye, MapPin, Calendar } from "lucide-react";

const DRIVES = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Placement Drive ${i + 1}`,
  officer: ["Rahul Patel", "Anjali Mohanty", "Meera Pradhan"][i % 3],
  company: ["Tata Steel", "Adani", "L&T", "JSW", "Vedanta", "Reliance"][i % 6],
  trade: ["Electrical", "Fitter", "Safety", "Welder"][i % 4],
  location: ["Angul", "Jajpur", "Kalahandi", "Jharsuguda"][i % 4],
  date: `2026-03-${String((i % 28) + 1).padStart(2, "0")}`,
  candidates: Math.floor(Math.random() * 30) + 20,
  selected: Math.floor(Math.random() * 15) + 5,
  status: i % 4 === 0 ? "Pending" : i % 4 === 1 ? "Approved" : i % 4 === 2 ? "Completed" : "Rejected",
  image: i % 3 === 0 ? "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200" : null,
}));

export default function AdminPlacementDriveApprovals() {
  const [drives, setDrives] = useState(DRIVES);
  const [statusFilter, setStatusFilter] = useState("All");
  const [officerFilter, setOfficerFilter] = useState("All");
  const [previewImage, setPreviewImage] = useState(null);

  const officers = ["All", ...new Set(DRIVES.map((d) => d.officer))];

  const filtered = useMemo(() => {
    return drives.filter((d) => {
      const matchStatus = statusFilter === "All" || d.status === statusFilter;
      const matchOfficer = officerFilter === "All" || d.officer === officerFilter;
      return matchStatus && matchOfficer;
    });
  }, [drives, statusFilter, officerFilter]);

  const approve = (id) => setDrives((p) => p.map((d) => d.id === id ? { ...d, status: "Approved" } : d));
  const reject = (id) => setDrives((p) => p.map((d) => d.id === id ? { ...d, status: "Rejected" } : d));

  const summary = useMemo(() => ({
    total: drives.length,
    pending: drives.filter((d) => d.status === "Pending").length,
    approved: drives.filter((d) => d.status === "Approved").length,
    completed: drives.filter((d) => d.status === "Completed").length,
  }), [drives]);

  
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
        <h1 className="text-2xl font-semibold text-slate-100">Placement Drive Approvals</h1>
        <p className="text-sm text-white/60 mt-1">Approve placement drives planned by placement officers</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Drives", value: summary.total, cls: "text-slate-100" },
          { label: "Pending", value: summary.pending, cls: "text-yellow-400" },
          { label: "Approved", value: summary.approved, cls: "text-emerald-400" },
          { label: "Completed", value: summary.completed, cls: "text-cyan-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#111827] border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-white/60">{s.label}</p>
            <p className={`text-xl font-semibold mt-1 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={officerFilter} onChange={(e) => setOfficerFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90">
          {officers.map((o) => <option key={o} value={o}>{o === "All" ? "All Officers" : o}</option>)}
        </select>
        <div className="flex gap-2">
          {["All", "Pending", "Approved", "Completed", "Rejected"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${statusFilter === s ? "bg-violet-500 text-white" : "bg-[#111827] text-white/60 border border-slate-700"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="bg-[#0b1220] text-white/60 text-xs">
              <tr>
                <th className="p-4 text-left">Drive</th>
                <th className="p-4 text-left">Officer</th>
                <th className="p-4 text-left">Company</th>
                <th className="p-4 text-left">Trade</th>
                <th className="p-4 text-left">Location</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-center">Candidates</th>
                <th className="p-4 text-center">Selected</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Evidence</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
            {paginatedData.map((d) => (
                <tr key={d.id} className="border-t border-slate-700/50 hover:bg-transparent/30 transition">
                  <td className="p-4 font-medium text-white/90">{d.name}</td>
                  <td className="p-4 text-violet-400">{d.officer}</td>
                  <td className="p-4 text-white/80">{d.company}</td>
                  <td className="p-4 text-white/60">{d.trade}</td>
                  <td className="p-4 text-white/60 flex items-center gap-1"><MapPin size={12} />{d.location}</td>
                  <td className="p-4 text-white/60 flex items-center gap-1"><Calendar size={12} />{d.date}</td>
                  <td className="p-4 text-center text-white/80">{d.candidates}</td>
                  <td className="p-4 text-center text-emerald-400">{d.selected}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${d.status === "Pending" ? "bg-yellow-500/10 text-yellow-400" : d.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : d.status === "Completed" ? "bg-cyan-500/10 text-cyan-400" : "bg-red-500/10 text-red-400"}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {d.image ? <img src={d.image} onClick={() => setPreviewImage(d.image)} className="w-12 h-8 rounded cursor-pointer border border-slate-700 mx-auto object-cover hover:scale-110 transition" /> : <span className="text-xs text-slate-600">—</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {d.status === "Pending" && (
                        <>
                          <button onClick={() => approve(d.id)} className="p-1.5 rounded-lg hover:bg-emerald-500/10"><CheckCircle size={15} className="text-emerald-400" /></button>
                          <button onClick={() => reject(d.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><XCircle size={15} className="text-red-400" /></button>
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

      {previewImage && (
        <div className="fixed inset-0 bg-transparent/80 z-50 flex items-center justify-center" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-w-xl rounded-lg" />
        </div>
      )}
    </div>
  );
}
