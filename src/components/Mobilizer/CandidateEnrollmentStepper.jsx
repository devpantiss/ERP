import { useState } from "react";
import SlidePanel from "../../components/common/SlidePanel";
import Step1 from "./Dashboard/EnrollmentSteps/Step1";
import Step2 from "./Dashboard/EnrollmentSteps/Step2";
import Step3 from "./Dashboard/EnrollmentSteps/Step3";
import Step4 from "./Dashboard/EnrollmentSteps/Step4";

const STEPS = [
  "Select Job Role & Project",
  "Choose Your Location",
  "Basic Information",
  "Live Photo & Location",
];

export default function CandidateEnrollmentStepper({ onClose, onComplete }) {
  const [step, setStep] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

  const [formData, setFormData] = useState({
    roleProject: { role: "", project: "" },
    address: { lat: null, lng: null },
    basic: { fullName: "", dateOfBirth: null, phoneNumber: "" },
    capture: { photo: "", location: null },
  });

  const update = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <SlidePanel open={true} onClose={onClose} title="Candidate Enrollment" width="4xl">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6 border-b border-yellow-400/20 pb-4">
        <h2 className="text-xl font-semibold text-yellow-400">
          Step {step + 1} of {STEPS.length}
        </h2>

        <div className="flex gap-3">
          <button
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition cursor-pointer
              ${
                step === 0
                  ? "bg-slate-700 text-white/60 cursor-not-allowed"
                  : "border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
              }`}
          >
            ← Back
          </button>

          <button
            disabled={!canProceed}
            onClick={() => {
              if (step === STEPS.length - 1) {
                onComplete?.(formData);
                onClose();
              } else {
                setCanProceed(false);
                setStep(step + 1);
              }
            }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition cursor-pointer
              ${
                canProceed
                  ? "bg-yellow-400 text-black hover:bg-yellow-300"
                  : "bg-slate-700 text-white/60 cursor-not-allowed"
              }`}
          >
            {step === STEPS.length - 1 ? "Submit" : "Next →"}
          </button>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white/90">
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
              value={formData.capture}
              onChange={(v) => update("capture", v)}
              onValidChange={setCanProceed}
            />
          )}
        </div>
      </div>
    </SlidePanel>
  );
}
