import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, ChevronLeft, ChevronRight, Check, User, FolderKanban, Building2, FileCheck, CheckCircle2 } from "lucide-react";
import { ALL_USERS } from "./SuperAdminUserManagement";

const STEPS = [
  { label: "Select Officer", icon: User },
  { label: "Assign Projects", icon: FolderKanban },
  { label: "Assign Centers", icon: Building2 },
  { label: "Review & Confirm", icon: FileCheck },
];

const PROJECTS = ["DDU-GKY Phase IV", "PMKVY 4.0", "CSR Skill Program", "State Skill Mission", "World Bank Skills Loan"];
const CENTERS = ["Angul", "Sundargarh", "Keonjhar", "Jharsuguda", "Kalahandi"];
const POS = ALL_USERS.filter(u => u.role === "Placement Officer");

export default function SuperAdminPlacementAssignment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedPO, setSelectedPO] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedCenters, setSelectedCenters] = useState([]);

  const toggle = (item, list, setList) => setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);

  const canNext = () => {
    if (step === 0) return selectedPO !== null;
    if (step === 1) return selectedProjects.length > 0;
    if (step === 2) return selectedCenters.length > 0;
    return true;
  };

  const handleSubmit = () => navigate("/super-admin/placement-assignment");

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3 tracking-tighter">
            <Briefcase size={28} className="text-red-500" /> Placement Officer Assignment
          </h1>
          <p className="text-sm text-white/60 mt-1 uppercase tracking-widest font-bold">Assign projects & centers to placement officers</p>
        </div>
        <div className="flex gap-3">
          <button disabled={step === 0} onClick={() => setStep(step - 1)}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition ${step === 0 ? "bg-transparent text-slate-500 cursor-not-allowed" : "border border-red-500/50 text-red-400 hover:bg-red-500/10 cursor-pointer"}`}>
            <ChevronLeft size={14} /> Back
          </button>
          {step < 3 ? (
            <button disabled={!canNext()} onClick={() => setStep(step + 1)}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition ${canNext() ? "bg-red-600 text-white hover:bg-red-500 cursor-pointer shadow-lg shadow-red-500/20" : "bg-transparent text-slate-500 cursor-not-allowed"}`}>
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="px-5 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-500 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-500/20">
              <Check size={14} /> Confirm Assignment
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? "text-red-400" : "text-slate-600"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ${i < step ? "bg-red-500 border-red-500 text-white" : i === step ? "border-red-400 text-red-400" : "border-slate-700 text-slate-600"}`}>
                {i < step ? <Check size={16} /> : <s.icon size={16} />}
              </div>
              <span className="text-xs font-bold hidden md:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? "bg-red-500" : "bg-slate-700"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        {step === 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-red-400">Select Placement Officer</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {POS.map((po) => (
                <button key={po.id} onClick={() => setSelectedPO(po)}
                  className={`p-5 rounded-xl text-left border transition ${selectedPO?.id === po.id ? "bg-red-500/10 border-red-500/50" : "bg-transparent/50 border-slate-700 hover:border-slate-600"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-black text-white/80">
                      {po.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white/90">{po.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{po.id} • {po.center}</p>
                    </div>
                    {selectedPO?.id === po.id && <CheckCircle2 size={18} className="text-red-400" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-red-400">Assign Projects</h3>
            <p className="text-xs text-slate-500">Select projects for <span className="text-red-400 font-bold">{selectedPO?.name}</span>.</p>
            <div className="grid md:grid-cols-2 gap-3">
              {PROJECTS.map(p => (
                <button key={p} onClick={() => toggle(p, selectedProjects, setSelectedProjects)}
                  className={`px-5 py-4 rounded-xl text-sm font-bold transition border text-left flex items-center gap-3 ${
                    selectedProjects.includes(p) ? "bg-red-500/15 border-red-500/50 text-red-400" : "bg-transparent/50 border-slate-700 text-white/60 hover:border-slate-600"
                  }`}>
                  {selectedProjects.includes(p) ? <CheckCircle2 size={18} /> : <FolderKanban size={18} className="text-slate-600" />}
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-red-400">Assign Centers</h3>
            <p className="text-xs text-slate-500">Select centers for <span className="text-red-400 font-bold">{selectedPO?.name}</span>.</p>
            <div className="grid md:grid-cols-3 gap-3">
              {CENTERS.map(c => (
                <button key={c} onClick={() => toggle(c, selectedCenters, setSelectedCenters)}
                  className={`px-5 py-4 rounded-xl text-sm font-bold transition border flex items-center gap-3 ${
                    selectedCenters.includes(c) ? "bg-blue-500/15 border-blue-500/50 text-blue-400" : "bg-transparent/50 border-slate-700 text-white/60 hover:border-slate-600"
                  }`}>
                  {selectedCenters.includes(c) ? <CheckCircle2 size={18} /> : <Building2 size={18} className="text-slate-600" />}
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-red-400">Review & Confirm</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-transparent/30 rounded-xl border border-slate-700/50">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Officer</p>
                <p className="text-sm font-bold text-white/90">{selectedPO?.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{selectedPO?.id} • {selectedPO?.center}</p>
              </div>
              <div className="p-4 bg-transparent/30 rounded-xl border border-slate-700/50">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Projects ({selectedProjects.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProjects.map(p => <span key={p} className="px-2.5 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-lg">{p}</span>)}
                </div>
              </div>
              <div className="p-4 bg-transparent/30 rounded-xl border border-slate-700/50">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Centers ({selectedCenters.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCenters.map(c => <span key={c} className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg">{c}</span>)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
