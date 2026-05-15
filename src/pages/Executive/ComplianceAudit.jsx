import { 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  ClipboardList,
  Calendar,
  Layers,
  Activity
} from "lucide-react";

/* ===================== ENTERPRISE MOCK DATA ===================== */

const COMPLIANCE_STATS = [
  { label: "Overall Compliance", value: "94.2%", sub: "Enterprise Score", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Open Audit Items", value: "8", sub: "Priority High/Med", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "ISO-9001 Nodes", value: "24/32", sub: "Recertification Due", icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Compliance Drift", value: "-1.2%", sub: "Monthly Variance", icon: Activity, color: "text-red-500", bg: "bg-red-500/10" },
];

const AUDIT_SCHEDULE = [
  { id: "AUD-201", entity: "Angul Training Hub", type: "NSDC Quality", date: "2026-03-15", status: "Scheduled", auditor: "Dr. S. Mishra" },
  { id: "AUD-205", entity: "Sundargarh Center", type: "Financial Audit", date: "2026-03-22", status: "Upcoming", auditor: "E&Y Team" },
  { id: "AUD-208", entity: "Keonjhar Site", type: "Safety Inspection", date: "2026-03-28", status: "Upcoming", auditor: "State Fire Dept" },
];

const COMPLIANCE_FRAMEWORKS = [
  { name: "NSDC Smarts Portal", code: "NSDC-v4.0", status: "Compliant", progress: 100 },
  { name: "ISO 9001:2015 QMS", code: "ISO-QMS", status: "In-Progress", progress: 78 },
  { name: "Labour Law (EPF/ESI)", code: "LL-COMP", status: "Compliant", progress: 100 },
  { name: "Data Privacy (GDPR/DPB)", code: "PRV-STN", status: "Critical", progress: 42 },
];

/* ===================== COMPONENT ===================== */

export default function ComplianceAudit() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3 tracking-tighter uppercase font-sans">
            <Scale size={28} className="text-blue-500" />
            Governance, Compliance & Audit
          </h1>
          <p className="text-sm text-white/60 mt-1 uppercase tracking-widest font-bold">NSDC/ISO Standards & Enterprise Integrity</p>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2.5 bg-transparent text-white/80 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-700 hover:bg-slate-700 transition">
            Initiate Internal Audit
          </button>
          <button className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">
            Submit Compliance Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {COMPLIANCE_STATS.map((stat) => (
          <div key={stat.label} className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm group relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition duration-500 transform group-hover:scale-110">
              <stat.icon size={96} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
            <h3 className={`text-3xl font-black ${stat.color} mb-2`}>{stat.value}</h3>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Compliance Frameworks Progress */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <ShieldCheck size={18} className="text-emerald-500" /> Standard Adherence Frameworks
          </h3>
          <div className="space-y-8">
            {COMPLIANCE_FRAMEWORKS.map((frame) => (
              <div key={frame.name} className="group cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-[13px] font-bold text-white/90 group-hover:text-blue-400 transition">{frame.name}</h4>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{frame.code}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      frame.status === 'Compliant' ? 'bg-emerald-500/10 text-emerald-400' : 
                      frame.status === 'Critical' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {frame.status}
                    </span>
                  </div>
                </div>
                <div className="relative pt-1">
                  <div className="h-1.5 w-full bg-transparent rounded-full overflow-hidden border border-slate-700/30">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        frame.progress === 100 ? 'bg-emerald-500' : 
                        frame.progress < 50 ? 'bg-red-500' : 'bg-blue-500'
                      }`} 
                      style={{ width: `${frame.progress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] font-bold text-slate-600 uppercase">
                    <span>{frame.progress}% Integrity</span>
                    <span>Reviewed: 2026-02-15</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 mt-8 bg-transparent/50 hover:bg-transparent text-[10px] font-black text-white/60 uppercase tracking-widest rounded-xl transition border border-slate-700/50 flex items-center justify-center gap-2">
            <ClipboardList size={16} /> Audit Configuration Center
          </button>
        </div>

        {/* Audit Schedule */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] flex items-center gap-3">
               <Calendar size={18} className="text-blue-500" /> Executive Audit Pipeline
             </h3>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Next 30 Days</span>
          </div>
          
          <div className="flex-1 space-y-4">
            {AUDIT_SCHEDULE.map((audit) => (
              <div key={audit.id} className="p-4 rounded-2xl bg-transparent/40 border border-white/[0.08] hover:border-blue-500/30 transition group flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-transparent group-hover:bg-blue-600/10 text-slate-500 group-hover:text-blue-400 transition shadow-inner">
                    <ClipboardList size={22} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-white/90 tracking-tight">{audit.entity}</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{audit.type} • {audit.auditor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black text-white/80 font-mono mb-1">{audit.date}</p>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    audit.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-400' : 'bg-transparent text-slate-500'
                  }`}>
                    {audit.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 rounded-2xl bg-transparent/20 border border-slate-700/50">
             <h5 className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-3 flex items-center gap-2">
               <AlertTriangle size={14} /> Critical Non-Compliance Flag
             </h5>
             <p className="text-[11px] text-white/60 leading-relaxed font-medium">
               The "Data Privacy Standards" framework is showing an integrity drift of **58%**. Immediate executive remediation is required by **Quarter End** to maintain ISO status.
             </p>
          </div>
        </div>

      </div>

      {/* ISO/NSDC Standard Registry (Placeholder for table) */}
      <div className="bg-gradient-to-br from-blue-900/10 to-transparent border border-blue-500/10 rounded-2xl p-8 text-center backdrop-blur-sm">
         <h4 className="text-sm font-black text-white/90 uppercase tracking-[0.3em] mb-4">Enterprise Standard Registry V2.0</h4>
         <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium px-4">
           All operational nodes are mapped against the 12-point Quality Compliance Matrix. Automatic data harvesting from center CCTV, Attendance Logs, and Grant Spends ensures near real-time integrity monitoring.
         </p>
         <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-blue-400">100%</span>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uptime audit</span>
            </div>
            <div className="w-px h-10 bg-transparent" />
            <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-emerald-400">ISO-9k</span>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">certified center</span>
            </div>
            <div className="w-px h-10 bg-transparent" />
            <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-violet-400">92%</span>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nsdc smart score</span>
            </div>
         </div>
      </div>

    </div>
  );
}
