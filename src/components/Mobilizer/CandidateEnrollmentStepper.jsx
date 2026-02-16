import { useState } from "react";
import Step1 from "./Dashboard/EnrollmentSteps/Step1";
import Step2 from "./Dashboard/EnrollmentSteps/Step2";
import Step3 from "./Dashboard/EnrollmentSteps/Step3";
import Step4 from "./Dashboard/EnrollmentSteps/Step4";
import Step5 from "./Dashboard/EnrollmentSteps/Step5";

const STEPS = [
  "Select Job Role & Project",
  "Choose Your Location",
  "Basic Information",
  "Live Photo & Location",
];

export default function CandidateEnrollmentStepper() {
  const [step, setStep] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

  const [formData, setFormData] = useState({
    roleProject: { role: "", project: "" },
    address: { lat: null, lng: null },
    basic: { name: "", dob: "", phone: "" },
    professional: { qualification: "", role: "", project: "" },
    capture: { photo: "", location: null },
  });

  const update = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <section className="min-h-screen bg-[#0b0f14] text-slate-200">
      {/* ================= HEADER ================= */}
      <header className="bg-[#020617] border-b border-yellow-400/20 px-6 py-3 flex justify-between items-center">
        <h2 className="font-semibold text-slate-200">
          Candidate Enrollment
        </h2>

        <div className="flex gap-3">
          <button
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer
              ${
                step === 0
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
              }`}
          >
            ← Back
          </button>

          <button
            disabled={!canProceed}
            onClick={() => {
              setCanProceed(false);
              setStep(step + 1);
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer
              ${
                canProceed
                  ? "bg-yellow-400 text-black hover:bg-yellow-300"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              }`}
          >
            Next →
          </button>
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-yellow-400">
          {STEPS[step]}
        </h1>

        <div className="bg-[#020617] border border-yellow-400/20 rounded-2xl p-6">
          {step === 0 && (
            <Step1
              value={formData.roleProject}
              onChange={(v) => update("roleProject", v)}
              onValidChange={setCanProceed}
            />
          )}

          {step === 1 && (
            <Step2
              value={formData.address}
              onChange={(v) => update("address", v)}
              onValidChange={setCanProceed}
            />
          )}

          {step === 2 && (
            <Step3
              value={formData.basic}
              onChange={(v) => update("basic", v)}
              onValidChange={setCanProceed}
            />
          )}

          {step === 3 && (
            <Step4
              value={formData.professional}
              onChange={(v) => update("professional", v)}
              onValidChange={setCanProceed}
            />
          )}

          {step === 4 && (
            <Step5
              value={formData.capture}
              onChange={(v) => update("capture", v)}
              onValidChange={setCanProceed}
            />
          )}
        </div>
      </div>
    </section>
  );
}
