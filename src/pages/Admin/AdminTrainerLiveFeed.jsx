import Pagination from "../../components/common/Pagination";
import { useState, useMemo } from "react";
import { Video, ExternalLink, Radio } from "lucide-react";

const LIVE_SESSIONS = [
  { id: "session-001", trainer: "Aditya Sahu", center: "Angul", batch: "BATCH-101", trade: "Electrical", startedAt: "10:15 AM", status: "live", avatar: "https://i.pravatar.cc/40?img=12" },
  { id: "session-002", trainer: "Deepak Kumar", center: "Sundargarh", batch: "BATCH-103", trade: "Welder", startedAt: "09:30 AM", status: "live", avatar: "https://i.pravatar.cc/40?img=14" },
  { id: "session-003", trainer: "Rahul Sharma", center: "Angul", batch: "BATCH-106", trade: "Fitter", startedAt: "11:00 AM", status: "live", avatar: "https://i.pravatar.cc/40?img=8" },
];

const PAST_SESSIONS = [
  { id: "p1", trainer: "Suresh Naik", center: "Kalahandi", batch: "BATCH-105", trade: "Electrical", date: "04 Mar 2026", duration: "1h 45m", avatar: "https://i.pravatar.cc/40?img=15" },
  { id: "p2", trainer: "Amit Panda", center: "Keonjhar", batch: "BATCH-107", trade: "Safety", date: "03 Mar 2026", duration: "2h 10m", avatar: "https://i.pravatar.cc/40?img=18" },
  { id: "p3", trainer: "Aditya Sahu", center: "Angul", batch: "BATCH-101", trade: "Electrical", date: "03 Mar 2026", duration: "1h 30m", avatar: "https://i.pravatar.cc/40?img=12" },
];

export default function AdminTrainerLiveFeed() {
  const [tab, setTab] = useState("live");

  const openViewer = (sessionId) => {
    window.open(`/trainer/live/${sessionId}`, "_blank");
  };

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return PAST_SESSIONS?.slice(start, start + itemsPerPage) || [];
  }, [PAST_SESSIONS, currentPage]);
  const totalPages = Math.ceil((PAST_SESSIONS?.length || 0) / itemsPerPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          <Video size={22} className="text-violet-400" /> Trainer Live Feed
        </h1>
        <p className="text-sm text-white/60 mt-1">Monitor active training sessions in real-time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Radio size={14} className="text-red-400 animate-pulse" />
            <span className="text-xs text-white/60">Currently Live</span>
          </div>
          <p className="text-xl font-semibold text-red-400">{LIVE_SESSIONS.length}</p>
        </div>
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-white/60">Sessions Today</p>
          <p className="text-xl font-semibold text-violet-400 mt-1">{LIVE_SESSIONS.length + 2}</p>
        </div>
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-white/60">Past Sessions (Week)</p>
          <p className="text-xl font-semibold text-slate-100 mt-1">{PAST_SESSIONS.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ key: "live", label: "Live Now" }, { key: "past", label: "Past Sessions" }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-sm rounded-lg transition ${tab === t.key ? "bg-violet-500 text-white" : "bg-[#111827] text-white/60 border border-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Live Grid */}
      {tab === "live" && (
        <div className="grid md:grid-cols-3 gap-4">
          {LIVE_SESSIONS.map((session) => (
            <div key={session.id} className="bg-[#111827] border border-slate-700 rounded-xl overflow-hidden hover:border-violet-500/30 transition">
              {/* Video Placeholder */}
              <div className="relative bg-transparent aspect-video flex items-center justify-center">
                <div className="text-slate-600 flex flex-col items-center gap-2">
                  <Video size={40} />
                  <span className="text-xs">Live Stream</span>
                </div>
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                </div>
                <span className="absolute top-3 right-3 text-xs text-white/60 bg-transparent/60 px-2 py-0.5 rounded">
                  Since {session.startedAt}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img src={session.avatar} className="w-8 h-8 rounded-lg border border-slate-700" />
                  <div>
                    <p className="font-medium text-white/90 text-sm">{session.trainer}</p>
                    <p className="text-xs text-slate-500">{session.center} • {session.batch}</p>
                  </div>
                </div>
                <button onClick={() => openViewer(session.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-violet-500 text-white rounded-lg text-sm font-medium hover:bg-violet-400 transition">
                  <ExternalLink size={14} /> Watch Live
                </button>
              </div>
            </div>
          ))}
          {LIVE_SESSIONS.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-500">No active live sessions right now.</div>
          )}
        </div>
      )}

      {/* Past Sessions */}
      {tab === "past" && (
        <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#0b1220] text-white/60">
              <tr>
                <th className="p-4 text-left">Trainer</th>
                <th className="p-4 text-left">Center</th>
                <th className="p-4 text-left">Batch / Trade</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
            {paginatedData.map((s) => (
                <tr key={s.id} className="border-t border-slate-700/50 hover:bg-transparent/30 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={s.avatar} className="w-8 h-8 rounded-lg border border-slate-700" />
                      <span className="font-medium text-white/90">{s.trainer}</span>
                    </div>
                  </td>
                  <td className="p-4 text-white/60">{s.center}</td>
                  <td className="p-4 text-white/60">{s.batch} / {s.trade}</td>
                  <td className="p-4 text-white/60">{s.date}</td>
                  <td className="p-4 text-white/80">{s.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
