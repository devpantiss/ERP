import { useState } from "react";
import SlidePanel from "../../components/common/SlidePanel";
import {
  Building2,
  MapPin,
  User,
  CheckCircle2,
} from "lucide-react";

/* ================= CONFIG ================= */

const SEGMENTS = [
  "Mining, Steel & Aluminium",
  "Shipping & Logistics",
  "Power & Green Energy",
  "Green Jobs",
  "Construction Tech & Infra Equipment",
  "Furniture & Fittings",
];

const LOCATION_TYPES = ["Odisha", "India", "International"];

const DISTRICTS = ["Khordha", "Cuttack", "Angul", "Sundargarh"];
const STATES = ["Odisha", "Jharkhand", "Gujarat", "Maharashtra"];
const COUNTRIES = ["India", "UAE", "Qatar", "Germany", "Singapore"];

/* ================= STEPS ================= */

const STEPS = [
  { id: 1, title: "Company Info", icon: Building2 },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "SPOC Details", icon: User },
  { id: 4, title: "Review", icon: CheckCircle2 },
];

/* ================= COMPONENT ================= */

export default function PlacementCompanyDatabaseStepper({ onClose }) {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    companyName: "",
    segment: "",
    website: "",
    locationType: "",
    location: "",
    spocName: "",
    contact: "",
    email: "",
  });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleChange = (key, value) =>
    setForm({ ...form, [key]: value });

  /* ================= UI ================= */

  return (
    <SlidePanel open={true} onClose={onClose} title="Company Registration" width="4xl">
      <div className="space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Company Registration
          </h1>
          <p className="text-sm text-white/60">
            Add company partnership details for placement ecosystem
          </p>
        </div>

        {/* ================= STEPPER ================= */}

        <div className="flex items-center justify-between">

          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step >= s.id;

            return (
              <div key={s.id} className="flex-1 flex items-center">

                <div className="flex flex-col items-center text-center">

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border
                    ${
                      active
                        ? "bg-cyan-400 text-black border-cyan-400"
                        : "border-slate-600 text-white/60"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <p className="text-xs mt-2">{s.title}</p>

                </div>

                {i !== STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-2
                    ${
                      step > s.id
                        ? "bg-cyan-400"
                        : "bg-slate-700"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ================= FORM CARD ================= */}

        <div className="bg-[#111827] border border-cyan-500/30 rounded-2xl p-8 shadow-xl">

          {/* STEP 1 */}
          {step === 1 && (
            <StepCompany form={form} handleChange={handleChange} />
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <StepLocation form={form} handleChange={handleChange} />
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <StepSpoc form={form} handleChange={handleChange} />
          )}

          {/* STEP 4 */}
          {step === 4 && <StepReview form={form} />}

          {/* NAVIGATION */}
          <div className="flex justify-between mt-8">

            <button
              disabled={step === 1}
              onClick={prev}
              className="px-4 py-2 bg-slate-700 rounded-md text-sm disabled:opacity-40"
            >
              Back
            </button>

            {step < STEPS.length ? (
              <button
                onClick={next}
                className="px-5 py-2 bg-cyan-500 text-black rounded-md font-medium hover:bg-cyan-400"
              >
                Continue
              </button>
            ) : (
              <button
                className="px-5 py-2 bg-emerald-500 text-black rounded-md font-medium"
              >
                Submit Company
              </button>
            )}
          </div>
        </div>
      </div>
    </SlidePanel>
  );
}

/* ================= STEP COMPONENTS ================= */

function StepCompany({ form, handleChange }) {
  return (
    <div className="space-y-6">

      <h3 className="text-lg font-semibold text-slate-100">
        Company Information
      </h3>

      <div className="grid md:grid-cols-2 gap-6">

        <Input
          label="Company Name"
          value={form.companyName}
          onChange={(v) => handleChange("companyName", v)}
        />

        <Input
          label="Website"
          value={form.website}
          onChange={(v) => handleChange("website", v)}
        />

        <Select
          label="Segment"
          value={form.segment}
          options={SEGMENTS}
          onChange={(v) => handleChange("segment", v)}
        />

      </div>
    </div>
  );
}

function StepLocation({ form, handleChange }) {
  return (
    <div className="space-y-6">

      <h3 className="text-lg font-semibold">Location Details</h3>

      <Select
        label="Location Type"
        value={form.locationType}
        options={LOCATION_TYPES}
        onChange={(v) => handleChange("locationType", v)}
      />

      {form.locationType === "Odisha" && (
        <Select
          label="District"
          value={form.location}
          options={DISTRICTS}
          onChange={(v) => handleChange("location", v)}
        />
      )}

      {form.locationType === "India" && (
        <Select
          label="State"
          value={form.location}
          options={STATES}
          onChange={(v) => handleChange("location", v)}
        />
      )}

      {form.locationType === "International" && (
        <Select
          label="Country"
          value={form.location}
          options={COUNTRIES}
          onChange={(v) => handleChange("location", v)}
        />
      )}
    </div>
  );
}

function StepSpoc({ form, handleChange }) {
  return (
    <div className="space-y-6">

      <h3 className="text-lg font-semibold">SPOC Details</h3>

      <div className="grid md:grid-cols-2 gap-6">

        <Input
          label="SPOC Name"
          value={form.spocName}
          onChange={(v) => handleChange("spocName", v)}
        />

        <Input
          label="Contact Number"
          value={form.contact}
          onChange={(v) => handleChange("contact", v)}
        />

        <Input
          label="Email"
          value={form.email}
          onChange={(v) => handleChange("email", v)}
        />

      </div>
    </div>
  );
}

function StepReview({ form }) {
  return (
    <div className="space-y-4">

      <h3 className="text-lg font-semibold">
        Review Details
      </h3>

      {Object.entries(form).map(([k, v]) => (
        <p key={k} className="text-sm">
          <span className="text-white/60">{k}:</span>{" "}
          <span>{v?.name || v || "-"}</span>
        </p>
      ))}
    </div>
  );
}

/* ================= SMALL UI ================= */

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-white/60">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-[#0f172a] border border-slate-600 rounded-md px-3 py-2 text-sm"
      />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="text-xs text-white/60">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-[#0f172a] border border-slate-600 rounded-md px-3 py-2 text-sm"
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
