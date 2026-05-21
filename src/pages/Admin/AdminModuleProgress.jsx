import { useState, useMemo } from "react";
import SlidePanel from "../../components/common/SlidePanel";
import { BarChart3, Search, Filter, Eye, X, CheckCircle2, Clock, PlayCircle, BookOpen, Layers } from "lucide-react";
import { selectBatchModuleProgress } from "../../stores/selectors/trainingSelectors";

/* ===================== COMPONENTS ===================== */

const StatusBadge = ({ status }) => {
  const styles = {
    Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "In Progress": "bg-violet-500/10 text-violet-400 border-violet-500/20",
    Scheduled: "bg-slate-700/30 text-white/60 border-slate-700/50",
  };

  const icons = {
    Completed: <CheckCircle2 size={12} />,
    "In Progress": <PlayCircle size={12} />,
    Scheduled: <Clock size={12} />,
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 w-fit ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

/* ===================== MAIN COMPONENT ===================== */

export default function AdminModuleProgress() {
  const [search, setSearch] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("All");
  const [centerFilter, setCenterFilter] = useState("All");
  const [tradeFilter, setTradeFilter] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState(null);

  const batches = useMemo(() => selectBatchModuleProgress(), []);
  const trainers = ["All", ...new Set(batches.map((b) => b.trainer))];
  const centers = ["All", ...new Set(batches.map((b) => b.center))];
  const trades = ["All", ...new Set(batches.map((b) => b.trade))];

  const filtered = useMemo(() => {
    return batches.filter((b) => {
      const matchSearch = b.batch.toLowerCase().includes(search.toLowerCase()) || 
                          b.trainer.toLowerCase().includes(search.toLowerCase());
      const matchTrainer = trainerFilter === "All" || b.trainer === trainerFilter;
      const matchCenter = centerFilter === "All" || b.center === centerFilter;
      const matchTrade = tradeFilter === "All" || b.trade === tradeFilter;
      return matchSearch && matchTrainer && matchCenter && matchTrade;
    });
  }, [batches, search, trainerFilter, centerFilter, tradeFilter]);

  const stats = useMemo(() => {
    const totalCount = filtered.length;
    let totalProgress = 0;
    filtered.forEach(b => {
      const modules = b.modules;
      const completedCount = Object.values(b.progress).filter(s => s === "Completed").length;
      totalProgress += (completedCount / modules.length) * 100;
    });
    return {
      total: totalCount,
      avg: Math.round(totalProgress / (totalCount || 1)),
      ongoing: filtered.filter(b => Object.values(b.progress).some(s => s === "In Progress")).length
    };
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            <BookOpen size={24} className="text-violet-400" /> Module Progress Tracker
          </h1>
          <p className="text-sm text-white/60 mt-1">Detailed tracking of module completion by batch, center, and job role</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search batch or trainer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#111827] border border-slate-700 text-white/90 text-sm rounded-lg pl-10 pr-4 py-2 w-full md:w-64 focus:border-violet-500 outline-none"
            />
          </div>
          <button className="p-2 bg-[#111827] border border-slate-700 rounded-lg text-white/60 hover:text-white transition">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* ================= SUMMARY STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Active Batches", value: stats.total, icon: Layers, color: "text-violet-400" },
          { label: "Overall Progress", value: `${stats.avg}%`, icon: BarChart3, color: "text-emerald-400" },
          { label: "In-Progress Modules", value: stats.ongoing, icon: PlayCircle, color: "text-cyan-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#111827] border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-transparent/50 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase font-semibold">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= FILTERS ================= */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <label className="text-xs font-medium text-slate-500 uppercase px-1">Center</label>
          <select 
            value={centerFilter} 
            onChange={(e) => setCenterFilter(e.target.value)}
            className="bg-transparent border border-slate-700 text-sm text-white/80 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
          >
            {centers.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <label className="text-xs font-medium text-slate-500 uppercase px-1">Job Role (Trade)</label>
          <select 
            value={tradeFilter} 
            onChange={(e) => setTradeFilter(e.target.value)}
            className="bg-transparent border border-slate-700 text-sm text-white/80 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
          >
            {trades.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <label className="text-xs font-medium text-slate-500 uppercase px-1">Trainer</label>
          <select 
            value={trainerFilter} 
            onChange={(e) => setTrainerFilter(e.target.value)}
            className="bg-transparent border border-slate-700 text-sm text-white/80 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
          >
            {trainers.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* ================= BATCH PROGRESS TABLE ================= */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#0b1220] text-white/60 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Batch Info</th>
                <th className="px-6 py-4 font-semibold">Trainer & Center</th>
                <th className="px-6 py-4 font-semibold">Job Role</th>
                <th className="px-6 py-4 font-semibold">Current Module</th>
                <th className="px-6 py-4 font-semibold">Completion %</th>
                <th className="px-6 py-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((b) => {
                const modules = b.modules;
                const completedCount = Object.values(b.progress).filter(s => s === "Completed").length;
                const progressPct = Math.round((completedCount / modules.length) * 100);
                const currentModule = Object.entries(b.progress).find(([, s]) => s === "In Progress")?.[0] || "All Completed";

                return (
                  <tr key={b.id} className="hover:bg-transparent/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white/90">{b.batch}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {b.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white/90">{b.trainer}</p>
                      <p className="text-xs text-slate-500">{b.center} Center</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-transparent text-white/80 text-[11px] font-medium border border-slate-700">
                        {b.trade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/80">{currentModule}</span>
                        {currentModule !== "All Completed" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-transparent rounded-full overflow-hidden max-w-[100px]">
                          <div 
                            className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-white/60">{progressPct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedBatch(b)}
                        className="p-1.5 text-violet-400 hover:bg-violet-500/10 rounded-lg transition"
                        title="View Detailed Progress"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No batches found matching the filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= DRILL-DOWN MODAL ================= */}
      <SlidePanel open={!!selectedBatch} onClose={() => setSelectedBatch(null)} title="Detailed Progress" width="lg">
        {selectedBatch && (
          <>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <span className="text-violet-400">{selectedBatch.batch}</span> Detailed Progress
                </h3>
                <p className="text-xs text-white/60">
                  {selectedBatch.trade} • {selectedBatch.trainer} • {selectedBatch.center} Center
                </p>
              </div>
              <button 
                onClick={() => setSelectedBatch(null)}
                className="p-2 text-white/60 hover:text-white hover:bg-transparent rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Course Curriculum Breakdown</h4>
                  <div className="text-xs text-slate-500">
                    {Object.values(selectedBatch.progress).filter(s => s === "Completed").length} / {Object.keys(selectedBatch.progress).length} Modules Done
                  </div>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {selectedBatch.modules.map((moduleName, index) => {
                    const status = selectedBatch.progress[moduleName] || "Scheduled";
                    return (
                      <div 
                        key={moduleName}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200
                        ${status === "Completed" ? "bg-emerald-500/5 border-emerald-500/20" : 
                          status === "In Progress" ? "bg-violet-500/5 border-violet-500/30" : 
                          "bg-transparent/20 border-slate-700/50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border
                          ${status === "Completed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : 
                            status === "In Progress" ? "bg-violet-500/20 text-violet-400 border-violet-500/30" : 
                            "bg-slate-700 text-white/60 border-slate-600"}`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className={`text-sm font-semibold transition-colors duration-200
                            ${status === "Completed" ? "text-slate-100" : 
                              status === "In Progress" ? "text-violet-200" : 
                              "text-white/60 group-hover:text-white/80"}`}>
                              {moduleName}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Estimated Duration: 8-10 Hours</p>
                          </div>
                        </div>
                        <StatusBadge status={status} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-700 bg-[#0b1220] rounded-b-2xl flex justify-between items-center text-xs text-slate-500">
              <p>Last updated: Today at 2:45 PM</p>
              <button 
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 bg-transparent hover:bg-slate-700 text-white/90 border border-slate-700 rounded-lg transition font-medium"
              >
                Close
              </button>
            </div>
          </>
        )}
      </SlidePanel>
    </div>
  );
}
