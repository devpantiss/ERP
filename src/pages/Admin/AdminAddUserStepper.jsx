import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, User, Briefcase, MapPin, FileCheck } from "lucide-react";

const STEPS = [
  { label: "Role & Center", icon: Briefcase },
  { label: "Personal Info", icon: User },
  { label: "Professional Info", icon: MapPin },
  { label: "Review & Submit", icon: FileCheck },
];

const ROLES = ["Trainer", "Mobilizer", "Placement Officer"];
const CENTERS = ["Angul", "Jajpur", "Kalahandi", "Jharsuguda", "Keonjhar", "Sundargarh"];
const DEPARTMENTS = ["Mining", "Shipping", "Construction", "Power", "IT & ITES", "Healthcare"];

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
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function AdminAddUserStepper() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    role: "", center: "",
    name: "", email: "", phone: "", dob: "", gender: "", address: "",
    department: "", qualification: "", experience: "", joinDate: "",
  });

  const u = (key, val) => setForm({ ...form, [key]: val });

  const canNext = () => {
    if (step === 0) return form.role && form.center;
    if (step === 1) return form.name && form.email && form.phone;
    if (step === 2) return form.department && form.qualification;
    return true;
  };

  const handleSubmit = () => {
    navigate("/admin/user-management");
  };

  return (
    <section className="min-h-screen bg-transparent text-white/90">
      {/* Header */}
      <header className="bg-[#020617] border-b border-violet-400/20 px-6 py-3 flex justify-between items-center">
        <h2 className="font-semibold text-violet-400">Add New User</h2>
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
              <Check size={14} /> Submit
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
              <h3 className="text-lg font-semibold text-violet-400">Assign Role & Center</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <Select label="Role" value={form.role} onChange={(v) => u("role", v)} options={ROLES} />
                <Select label="Center" value={form.center} onChange={(v) => u("center", v)} options={CENTERS} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-violet-400">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Full Name" value={form.name} onChange={(v) => u("name", v)} placeholder="Enter full name" />
                <Input label="Email" value={form.email} onChange={(v) => u("email", v)} type="email" placeholder="user@example.com" />
                <Input label="Phone" value={form.phone} onChange={(v) => u("phone", v)} placeholder="+91 9876543210" />
                <Input label="Date of Birth" value={form.dob} onChange={(v) => u("dob", v)} type="date" />
                <Select label="Gender" value={form.gender} onChange={(v) => u("gender", v)} options={["Male", "Female", "Other"]} />
                <Input label="Address" value={form.address} onChange={(v) => u("address", v)} placeholder="City, State" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-violet-400">Professional Information</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <Select label="Department" value={form.department} onChange={(v) => u("department", v)} options={DEPARTMENTS} />
                <Input label="Qualification" value={form.qualification} onChange={(v) => u("qualification", v)} placeholder="e.g. B.Tech, MBA" />
                <Input label="Experience" value={form.experience} onChange={(v) => u("experience", v)} placeholder="e.g. 5 Years" />
                <Input label="Joining Date" value={form.joinDate} onChange={(v) => u("joinDate", v)} type="date" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-violet-400">Review & Submit</h3>
              <p className="text-sm text-white/60">Please verify all details before submitting.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(form).filter(([,v]) => v).map(([k, v]) => (
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
