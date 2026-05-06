import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCog, ChevronLeft, ChevronRight, Check, User, Building2, Layers, FileCheck, CheckCircle2 } from "lucide-react";
import { ALL_USERS } from "./superAdminUsers";

const STEPS = [
  { label: "Select Trainer", icon: User },
  { label: "Assign Center", icon: Building2 },
  { label: "Assign Batches", icon: Layers },
  { label: "Review & Confirm", icon: FileCheck },
];

const CENTERS = ["Angul", "Sundargarh", "Keonjhar", "Jharsuguda", "Kalahandi"];
const BATCHES = ["B-01", "B-02", "B-03", "B-04", "B-05", "B-06", "B-07", "B-08", "B-09", "B-10"];
const TRAINERS = ALL_USERS.filter(u => u.role === "Trainer");

export default function SuperAdminTrainerAssignment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedBatches, setSelectedBatches] = useState([]);

  const toggleBatch = (b) => setSelectedBatches(selectedBatches.includes(b) ? selectedBatches.filter(x => x !== b) : [...selectedBatches, b]);

  const canNext = () => {
    if (step === 0) return selectedTrainer !== null;
    if (step === 1) return selectedCenter !== "";
    if (step === 2) return selectedBatches.length > 0;
    return true;
  };

  const handleSubmit = () => navigate("/super-admin/trainer-assignment");

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3 tracking-tighter">
            <UserCog size={28} className="text-red-500" /> Trainer Assignment
          </h1>
          <p className="text-sm text-white/60 mt-1 uppercase tracking-widest font-bold">Assign batches & centers to trainers</p>
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

      {/* Stepper */}
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

      {/* Content */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        {step === 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-red-400">Select Trainer</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {TRAINERS.map((t) => (
                <button key={t.id} onClick={() => setSelectedTrainer(t)}
                  className={`p-5 rounded-xl text-left border transition ${selectedTrainer?.id === t.id ? "bg-red-500/10 border-red-500/50" : "bg-transparent/50 border-slate-700 hover:border-slate-600"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-black text-white/80">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white/90">{t.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{t.id} • {t.center} • {t.department}</p>
                    </div>
                    {selectedTrainer?.id === t.id && <CheckCircle2 size={18} className="text-red-400" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-red-400">Assign Center</h3>
            <p className="text-xs text-slate-500">Select the center for <span className="text-red-400 font-bold">{selectedTrainer?.name}</span>.</p>
            <div className="grid md:grid-cols-3 gap-3">
              {CENTERS.map(c => (
                <button key={c} onClick={() => setSelectedCenter(c)}
                  className={`px-5 py-4 rounded-xl text-sm font-bold transition border flex items-center gap-3 ${
                    selectedCenter === c ? "bg-blue-500/15 border-blue-500/50 text-blue-400" : "bg-transparent/50 border-slate-700 text-white/60 hover:border-slate-600"
                  }`}>
                  {selectedCenter === c ? <CheckCircle2 size={18} /> : <Building2 size={18} className="text-slate-600" />}
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-red-400">Assign Batches</h3>
            <p className="text-xs text-slate-500">Select the batches for <span className="text-red-400 font-bold">{selectedTrainer?.name}</span> at <span className="text-blue-400 font-bold">{selectedCenter}</span>.</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {BATCHES.map(b => (
                <button key={b} onClick={() => toggleBatch(b)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition border text-center ${
                    selectedBatches.includes(b) ? "bg-red-500/15 border-red-500/50 text-red-400" : "bg-transparent/50 border-slate-700 text-white/60 hover:border-slate-600"
                  }`}>{b}</button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-red-400">Review & Confirm</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-transparent/30 rounded-xl border border-slate-700/50">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Trainer</p>
                <p className="text-sm font-bold text-white/90">{selectedTrainer?.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{selectedTrainer?.id}</p>
              </div>
              <div className="p-4 bg-transparent/30 rounded-xl border border-slate-700/50">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Center</p>
                <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg">{selectedCenter}</span>
              </div>
              <div className="p-4 bg-transparent/30 rounded-xl border border-slate-700/50">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Batches ({selectedBatches.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBatches.map(b => <span key={b} className="px-2.5 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-lg">{b}</span>)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
