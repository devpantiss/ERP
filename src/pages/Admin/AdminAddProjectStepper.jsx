import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, FileText, MapPin, Users, FileCheck } from "lucide-react";
import { useProjectStore } from "../../stores/projectStore";
import { selectProjectFormOptions } from "../../stores/selectors/projectSelectors";

const STEPS = [
  { label: "Project Details", icon: FileText },
  { label: "Location & Center", icon: MapPin },
  { label: "Batches & Enrollment", icon: Users },
  { label: "Review & Submit", icon: FileCheck },
];

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="text-xs text-white/60 mb-1 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg bg-transparent border border-slate-700 text-sm text-white/90 focus:border-violet-400 outline-none transition" />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs text-white/60 mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg bg-transparent border border-slate-700 text-sm text-white/90 focus:border-violet-400 outline-none">
        <option value="">Select {label}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label className="text-xs text-white/60 mb-1 block">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full px-3 py-2.5 rounded-lg bg-transparent border border-slate-700 text-sm text-white/90 focus:border-violet-400 outline-none resize-none transition" />
    </div>
  );
}

export default function AdminAddProjectStepper() {
  const navigate = useNavigate();
  const projectRecords = useProjectStore((state) => state.records);
  const fetchProjects = useProjectStore((state) => state.fetchAll);
  const createProject = useProjectStore((state) => state.create);
  const options = useMemo(() => selectProjectFormOptions(projectRecords), [projectRecords]);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", scheme: "", sector: "", status: "", startDate: "", endDate: "", description: "",
    center: "", state: "Odisha", district: "", block: "",
    totalBatches: "", batchSize: "", totalEnrollment: "", jobroles: "",
  });

  const u = (key, val) => setForm({ ...form, [key]: val });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const canNext = () => {
    if (step === 0) return form.name && form.scheme && form.sector;
    if (step === 1) return form.center && form.district;
    if (step === 2) return form.totalBatches && form.batchSize;
    return true;
  };

  const handleSubmit = async () => {
    await createProject({
      code: form.name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 16) || "NEW-PRJ",
      name: form.name,
      fundingAgencyId: form.scheme || options.fundingAgencies[0]?.value || "FAG-0001",
      schoolId: form.sector || "SCH-0001",
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status || "PLANNING",
      description: form.description,
      proposedCenterId: form.center,
      enrollmentTarget: Number(form.totalEnrollment || 0),
      batchPlan: {
        totalBatches: Number(form.totalBatches || 0),
        batchSize: Number(form.batchSize || 0),
        jobRoles: form.jobroles,
      },
    });
    navigate("/admin/project-management");
  };

  return (
    <section className="min-h-screen bg-transparent text-white/90">
      {/* Header */}
      <header className="bg-[#020617] border-b border-violet-400/20 px-6 py-3 flex justify-between items-center">
        <h2 className="font-semibold text-violet-400">Add New Project</h2>
        <div className="flex gap-3">
          <button disabled={step === 0} onClick={() => setStep(step - 1)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 ${step === 0 ? "bg-slate-700 text-white/60 cursor-not-allowed" : "border border-violet-400 text-violet-400 hover:bg-violet-400/10 cursor-pointer"}`}>
            <ChevronLeft size={14} /> Back
          </button>
          {step < 3 ? (
            <button disabled={!canNext()} onClick={() => setStep(step + 1)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 ${canNext() ? "bg-violet-500 text-white hover:bg-violet-400 cursor-pointer" : "bg-slate-700 text-white/60 cursor-not-allowed"}`}>
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={handleSubmit}
              className="px-4 py-1.5 rounded-md text-sm font-medium bg-violet-500 text-white hover:bg-violet-400 flex items-center gap-1 cursor-pointer">
              <Check size={14} /> Create Project
            </button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stepper Indicator */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${i <= step ? "text-violet-400" : "text-slate-600"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition ${i < step ? "bg-violet-500 border-violet-500 text-white" : i === step ? "border-violet-400 text-violet-400" : "border-slate-700 text-slate-600"}`}>
                  {i < step ? <Check size={16} /> : <s.icon size={16} />}
                </div>
                <span className="text-xs font-medium hidden md:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${i < step ? "bg-violet-500" : "bg-slate-700"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-[#111827] border border-slate-700 rounded-2xl p-8">
          {step === 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-violet-400">Project Details</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Project Name" value={form.name} onChange={(v) => u("name", v)} placeholder="e.g. PMKVY 4.0 Phase II" />
                <Select label="Funding Agency" value={form.scheme} onChange={(v) => u("scheme", v)} options={options.fundingAgencies} />
                <Select label="Sector" value={form.sector} onChange={(v) => u("sector", v)} options={options.sectors} />
                <Select label="Status" value={form.status} onChange={(v) => u("status", v)} options={options.statuses} />
                <Input label="Start Date" value={form.startDate} onChange={(v) => u("startDate", v)} type="date" />
                <Input label="End Date" value={form.endDate} onChange={(v) => u("endDate", v)} type="date" />
              </div>
              <Textarea label="Description" value={form.description} onChange={(v) => u("description", v)} placeholder="Brief description of the project..." />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-violet-400">Location & Center</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <Select label="Training Center" value={form.center} onChange={(v) => u("center", v)} options={options.centers} />
                <Input label="State" value={form.state} onChange={(v) => u("state", v)} />
                <Input label="District" value={form.district} onChange={(v) => u("district", v)} placeholder="e.g. Angul" />
                <Input label="Block" value={form.block} onChange={(v) => u("block", v)} placeholder="e.g. Talcher" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-violet-400">Batches & Enrollment</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Total Batches" value={form.totalBatches} onChange={(v) => u("totalBatches", v)} type="number" placeholder="e.g. 5" />
                <Input label="Batch Size" value={form.batchSize} onChange={(v) => u("batchSize", v)} type="number" placeholder="e.g. 30" />
                <Input label="Total Enrollment Target" value={form.totalEnrollment} onChange={(v) => u("totalEnrollment", v)} type="number" placeholder="e.g. 150" />
                <Input label="Job Roles" value={form.jobroles} onChange={(v) => u("jobroles", v)} placeholder="e.g. Welder, Fitter, Electrician" />
              </div>
              {form.totalBatches && form.batchSize && (
                <div className="mt-4 p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                  <p className="text-sm text-violet-300">
                    Capacity: <strong>{form.totalBatches} batches × {form.batchSize} candidates = {Number(form.totalBatches) * Number(form.batchSize)} total seats</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-violet-400">Review & Submit</h3>
              <p className="text-sm text-white/60">Please verify all details before creating the project.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(form).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-2 border-b border-white/[0.08]">
                    <span className="text-white/60 capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-white/90">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
