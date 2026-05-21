import { useEffect, useMemo } from "react";
import { Globe, Activity, MapPin, Building2, Users, CheckCircle2, Clock, AlertCircle, BarChart3, Layers, Zap } from "lucide-react";
import { useEmployeeStore } from "../../stores/employeeStore";
import { useProjectStore } from "../../stores/projectStore";
import { selectGlobalTrackingData } from "../../stores/selectors/superAdminSelectors";

export default function SuperAdminGlobalTracking() {
  const { records: projects, fetchAll } = useProjectStore();
  const { records: employees, fetchWithAssignments } = useEmployeeStore();

  useEffect(() => {
    fetchAll();
    fetchWithAssignments();
  }, [fetchAll, fetchWithAssignments]);

  const { totalNodes, regions, milestones, sessions } = useMemo(
    () => selectGlobalTrackingData(projects, employees),
    [employees, projects]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Globe size={26} className="text-amber-500" /> Environment Progress Tracking
          </h1>
          <p className="text-sm text-white/60 mt-1">Real-time monitoring of operations across all geographical domains</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-transparent text-white/60 text-xs font-bold border border-slate-700">
             <Zap size={14} className="text-amber-500" /> Total Nodes: {totalNodes}
           </span>
           <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
             <Activity size={14} className="animate-pulse" /> Live Pulse
           </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Region Heat-map/List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111827] border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest mb-6 flex items-center gap-2">
              <MapPin size={18} className="text-amber-500" /> Regional Node Performance
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {regions.map((region) => (
                <div key={region.name} className="p-5 rounded-2xl bg-transparent/20 border border-slate-700/50 hover:bg-transparent/40 transition group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${region.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white/90">{region.name}</p>
                        <p className={`text-[10px] font-bold uppercase ${region.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {region.status}
                        </p>
                      </div>
                    </div>
                    {region.alert && (
                      <div className="p-1 text-red-400" title={region.alert}>
                        <AlertCircle size={16} />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center mb-4">
                    <div className="p-2 rounded-xl bg-transparent/20 border border-slate-700/30">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Batches</p>
                      <p className="text-sm font-bold text-white/80">{region.activeBatches}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-transparent/20 border border-slate-700/30">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Workforce</p>
                      <p className="text-sm font-bold text-white/80">{region.users}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold">
                      <span className="text-slate-500 tracking-tighter">Node Load</span>
                      <span className="text-amber-500">{region.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-amber-500 transition-all duration-700`}
                        style={{ width: `${region.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-4 mt-6 rounded-2xl border border-slate-700 bg-transparent text-xs font-bold text-white/80 hover:bg-transparent transition flex items-center justify-center gap-2">
              <Layers size={16} /> Expand Geographic Data Map
            </button>
          </div>
        </div>

        {/* Right: Global Milestones */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-amber-500" /> Enterprise Milestones
            </h3>
            
            <div className="space-y-6">
              {milestones.map((mile) => (
                <div key={mile.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white/90">{mile.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{mile.current} / {mile.target}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      mile.pct >= 90 ? "bg-emerald-500/10 text-emerald-400" :
                      mile.pct >= 70 ? "bg-blue-500/10 text-blue-400" :
                      "bg-amber-500/10 text-amber-400"
                    }`}>
                      {mile.status}
                    </span>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-transparent">
                      <div 
                        style={{ width: `${mile.pct}%` }} 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          mile.pct >= 90 ? 'bg-emerald-500' : 
                          mile.pct >= 70 ? 'bg-blue-500' : 
                          'bg-amber-500'
                        } transition-all duration-1000`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>{mile.pct}% COMPLETED</span>
                      <span>TARGET Q4 2026</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-3 mt-8 rounded-xl bg-transparent text-xs font-bold text-white/80 hover:bg-slate-700 transition">
              Adjust Strategic Road-map
            </button>
          </div>

          <div className="bg-transparent/20 border border-slate-700/50 rounded-2xl p-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <Activity size={64} className="text-amber-500" />
            </div>
            <h4 className="text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" /> Active Sessions
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Mobilizers Live</span>
                <span className="text-white/90 font-bold">{sessions.mobilizers}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Trainer Feed Active</span>
                <span className="text-white/90 font-bold">{sessions.trainers}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Admin Portals Open</span>
                <span className="text-white/90 font-bold">{sessions.admins}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
