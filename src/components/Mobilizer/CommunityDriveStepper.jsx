import { useState } from "react";
import SlidePanel from "../../components/common/SlidePanel";
import Step1EventDetails from "./Dashboard/CommunitySteps/Step1";
import Step2Location from "./Dashboard/CommunitySteps/Step2";
import Step4Review from "./Dashboard/CommunitySteps/Step4";

const STEPS = ["Event Details", "Location", "Review & Submit"];

export default function CommunityEventStepper({ onSubmit, onClose }) {
  const [step, setStep] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

  const [formData, setFormData] = useState({
    eventName: "",
    project: "",
    block: "",
    gpName: "",
    eventDate: "",
    participants: "",
    location: "", // TEXT PLACE NAME ONLY
  });

  const update = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  /* ===================== SUBMIT ===================== */

  const handleSubmit = () => {
    const payload = {
      id: Date.now(),
      name: formData.eventName,
      project: formData.project,
      block: formData.block,
      gp: formData.gpName,
      date: formData.eventDate,
      participants: Number(formData.participants),
      location: formData.location,

      // Table workflow fields
      status: "Pending",
      image: null,
      video: null,
      lat: null,
      lng: null,
      timestamp: null,
    };

    console.log("Final Submission:", payload);

    if (onSubmit) onSubmit(payload);
  };

  return (
    <SlidePanel open={true} onClose={onClose} title="Community Awareness Programme Entry" width="4xl">
      {/* PROGRESS HEADER */}
      <div className="flex items-center gap-4 mb-6 border-b border-yellow-400/20 pb-6">
        {STEPS.map((label, index) => (
          <div key={index} className="flex items-center gap-4">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                ${
                  index <= step
                    ? "bg-yellow-400 text-black"
                    : "bg-[#111827] border border-yellow-400/30 text-white/60"
                }`}
            >
              {index + 1}
            </div>

            <span
              className={`text-sm ${
                index === step ? "text-yellow-400" : "text-white/60"
              }`}
            >
              {label}
            </span>

            {index < STEPS.length - 1 && (
              <div className="w-10 h-[2px] bg-yellow-400/20" />
            )}
          </div>
        ))}
      </div>

      {/* BODY */}
      <div className="bg-transparent border border-yellow-400/20 rounded-2xl p-6">

          {step === 0 && (
            <Step1EventDetails
              value={formData}
              update={update}
              onValidChange={setCanProceed}
            />
          )}

          {step === 1 && (
            <Step2Location
              value={formData}
              update={update}
              onValidChange={setCanProceed}
            />
          )}

          {step === 2 && (
            <Step4Review
              value={formData}
              onValidChange={() => setCanProceed(true)}
            />
          )}

        </div>

        {/* FOOTER */}
        <div className="flex justify-between mt-8 border-t border-yellow-400/20 pt-6">
          <button
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className="px-6 py-2 border border-yellow-400/30 rounded-md
            text-yellow-400 hover:bg-yellow-400/10 disabled:opacity-40 cursor-pointer"
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              disabled={!canProceed}
              onClick={() => {
                setCanProceed(false);
                setStep(step + 1);
              }}
              className="px-8 py-2 bg-yellow-400 text-black
              rounded-md font-semibold hover:bg-yellow-300 disabled:opacity-40 cursor-pointer"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={() => {
                handleSubmit();
                onClose();
              }}
              className="px-8 py-2 bg-yellow-400 text-black
              rounded-md font-semibold hover:bg-yellow-300 cursor-pointer"
            >
              Submit
            </button>
          )}
        </div>

    </SlidePanel>
  );
}
