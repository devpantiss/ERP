import Pagination from "../../components/common/Pagination";
import SlidePanel from "../../components/common/SlidePanel";
import { useState, useMemo } from "react";
import { Eye } from "lucide-react";

const EVENTS = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  name: `Community Awareness ${i + 1}`,
  mobilizer: ["Priya Mishra", "Vikram Singh", "Rajan Nayak", "Sunita Patra", "Manoj Sahu"][i % 5],
  project: ["Skill India", "Green Jobs", "Rural Employment"][i % 3],
  block: ["Jajpur", "Dharmasala", "Sukinda", "Danagadi"][i % 4],
  gp: ["Binjharpur GP", "Jajpur Road GP", "Dharmasala GP", "Sukinda GP"][i % 4],
  participants: Math.floor(Math.random() * 50) + 20,
  location: `Community Hall ${i + 1}`,
  date: `2026-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
  status: i % 3 === 0 ? "Completed" : "Pending",
  image: i % 3 === 0 ? `https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=200` : null,
}));

export default function AdminCommunityEvents() {
  const [search, setSearch] = useState("");
  const [mobFilter, setMobFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [previewImage, setPreviewImage] = useState(null);

  const mobilizers = ["All", ...new Set(EVENTS.map((e) => e.mobilizer))];

  const filtered = useMemo(() => {
    return EVENTS.filter((e) => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchMob = mobFilter === "All" || e.mobilizer === mobFilter;
      const matchStatus = statusFilter === "All" || e.status === statusFilter;
      return matchSearch && matchMob && matchStatus;
    });
  }, [search, mobFilter, statusFilter]);

  const totalParticipants = filtered.reduce((s, e) => s + e.participants, 0);
  const completedCount = filtered.filter((e) => e.status === "Completed").length;

  
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
        <h1 className="text-2xl font-semibold text-slate-100">Community Events</h1>
        <p className="text-sm text-white/60 mt-1">Track community-level events conducted by mobilizers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-white/60">Total Events</p>
          <p className="text-xl font-semibold text-violet-400 mt-1">{filtered.length}</p>
        </div>
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-white/60">Completed</p>
          <p className="text-xl font-semibold text-emerald-400 mt-1">{completedCount}</p>
        </div>
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-white/60">Total Participants</p>
          <p className="text-xl font-semibold text-cyan-400 mt-1">{totalParticipants}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input placeholder="Search event..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90 focus:border-violet-400 outline-none" />
        <select value={mobFilter} onChange={(e) => setMobFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90">
          {mobilizers.map((m) => <option key={m} value={m}>{m === "All" ? "All Mobilizers" : m}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90">
          <option value="All">All Status</option><option>Completed</option><option>Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="bg-[#0b1220] text-white/60 text-xs">
              <tr>
                <th className="p-4 text-left">Event</th>
                <th className="p-4 text-left">Mobilizer</th>
                <th className="p-4 text-left">Project</th>
                <th className="p-4 text-left">Block / GP</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-center">Participants</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Evidence</th>
              </tr>
            </thead>
            <tbody>
            {paginatedData.map((e) => (
                <tr key={e.id} className="border-t border-slate-700/50 hover:bg-transparent/30 transition">
                  <td className="p-4 font-medium text-white/90">{e.name}</td>
                  <td className="p-4 text-violet-400">{e.mobilizer}</td>
                  <td className="p-4 text-white/60">{e.project}</td>
                  <td className="p-4 text-white/60">{e.block} / {e.gp}</td>
                  <td className="p-4 text-white/60">{e.date}</td>
                  <td className="p-4 text-center text-white/80">{e.participants}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${e.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {e.image ? (
                      <img src={e.image} onClick={() => setPreviewImage(e.image)}
                        className="w-12 h-8 rounded cursor-pointer border border-slate-700 mx-auto object-cover hover:scale-110 transition" />
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Image Preview */}
      <SlidePanel open={!!previewImage} onClose={() => setPreviewImage(null)} title="Details" width="lg">
          <img src={previewImage} className="max-w-xl rounded-lg" />
      </SlidePanel>
    </div>
  );
}
