import { useState } from "react";
import { ShieldAlert, Settings, Building2, FolderKanban, Users, Database, Globe, Activity, Rocket } from "lucide-react";

/* ===================== MOCK DATA ===================== */

const PROJECTS = [
  { id: "P1", name: "PMKVY 4.0", status: "Active", center: "Multiple", health: "Good" },
  { id: "P2", name: "Tata Steel CSR", status: "Active", center: "Angul", health: "Excellent" },
  { id: "P3", name: "DDUGKY", status: "Paused", center: "Sundargarh", health: "Warning" },
  { id: "P4", name: "State Skill Mission", status: "Active", center: "Keonjhar", health: "Good" },
];

/* ===================== COMPONENT ===================== */

export default function SuperAdminControlCenter() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldAlert size={26} className="text-amber-500" /> Operational Control Center
        </h1>
        <p className="text-sm text-white/60 mt-1">High-level project overrides and system-wide configuration management</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Overrides */}
        <div className="bg-[#111827] border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Settings size={18} className="text-amber-500" /> Global Configurations
          </h3>
          
          <div className="space-y-4">
             {[
               { label: "New Batch Auto-Approval", desc: "Allow trainers to start batches without admin manual check", toggle: false },
               { label: "Public Dashboard Access", desc: "Enable external stakeholder view for performance metrics", toggle: true },
               { label: "Biometric Integration", desc: "Force biometric sync for all training centers", toggle: true },
               { label: "Data Export (CSV/JSON)", desc: "Enable bulk data export for all management roles", toggle: true },
             ].map((opt) => (
               <div key={opt.label} className="flex items-center justify-between p-4 rounded-xl bg-transparent/30 border border-slate-700/50">
                 <div>
                   <p className="text-sm font-bold text-white/90">{opt.label}</p>
                   <p className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</p>
                 </div>
                 <button className={`w-10 h-5 rounded-full relative transition-colors ${opt.toggle ? 'bg-amber-500' : 'bg-slate-700'}`}>
                   <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${opt.toggle ? 'right-1' : 'left-1'}`} />
                 </button>
               </div>
             ))}
          </div>
          
          <button className="w-full py-4 mt-8 bg-transparent hover:bg-slate-700 text-amber-500 font-bold text-xs rounded-xl border border-amber-500/20 transition flex items-center justify-center gap-2">
            <Database size={16} /> Force System-Wide Sync
          </button>
        </div>

        {/* Project Lifecycle Overrides */}
        <div className="bg-[#111827] border border-slate-700/50 rounded-2xl p-6 shadow-xl">
           <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest mb-6 flex items-center gap-2">
             <Rocket size={18} className="text-amber-500" /> Executive Project Management
           </h3>
           
           <div className="space-y-4">
             {PROJECTS.map((project) => (
               <div key={project.id} className="p-4 rounded-xl border border-white/[0.08] hover:border-slate-700 transition group relative">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg bg-transparent text-amber-500`}>
                       <Rocket size={18} />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-white/90">{project.name}</p>
                       <p className="text-[10px] text-slate-500 uppercase font-medium">{project.center} • {project.id}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                       project.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                     }`}>
                       {project.status}
                     </span>
                     <p className={`text-[10px] mt-1 font-bold ${
                       project.health === 'Excellent' ? 'text-emerald-500' : 
                       project.health === 'Good' ? 'text-blue-500' : 'text-red-400'
                     }`}>
                       Health: {project.health}
                     </p>
                   </div>
                 </div>
                 <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="px-3 py-1 rounded-lg bg-transparent text-[10px] font-bold text-white/60 hover:text-white transition">PAUSE</button>
                   <button className="px-3 py-1 rounded-lg bg-transparent text-[10px] font-bold text-white/60 hover:text-white transition">RE-SYNC</button>
                   <button className="px-3 py-1 rounded-lg bg-red-500/10 text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition">TERMINATE</button>
                 </div>
               </div>
             ))}
           </div>
           
           <button className="w-full py-4 mt-6 rounded-2xl border border-slate-700 bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition">
             Initialise New Enterprise Project
           </button>
        </div>
      </div>
    </div>
  );
}
