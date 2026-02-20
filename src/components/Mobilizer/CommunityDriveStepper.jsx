import { useState } from "react";
import Step1EventDetails from "./Dashboard/CommunitySteps/Step1";
import Step2Location from "./Dashboard/CommunitySteps/Step2";
import Step4Review from "./Dashboard/CommunitySteps/Step4";

const STEPS = ["Event Details", "Location", "Review & Submit"];

export default function CommunityEventStepper({ onSubmit }) {
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
    <section className="min-h-screen bg-[#020617] text-slate-200">
      {/* HEADER */}
      <div className="border-b border-yellow-400/20 bg-[#0b0f14] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-semibold text-yellow-400">
            Community Awareness Programme Entry
          </h1>

          {/* PROGRESS */}
          <div className="mt-6 flex items-center gap-4">
            {STEPS.map((label, index) => (
              <div key={index} className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                    ${
                      index <= step
                        ? "bg-yellow-400 text-black"
                        : "bg-[#111827] border border-yellow-400/30 text-slate-400"
                    }`}
                >
                  {index + 1}
                </div>

                <span
                  className={`text-sm ${
                    index === step ? "text-yellow-400" : "text-slate-400"
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
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="bg-[#0b0f14] border border-yellow-400/20 rounded-2xl p-8">

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
        <div className="flex justify-between mt-8">
          <button
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className="px-6 py-2 border border-yellow-400/30 rounded-md
            text-yellow-400 hover:bg-yellow-400/10 disabled:opacity-40"
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
              rounded-md font-semibold hover:bg-yellow-300 disabled:opacity-40"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-2 bg-yellow-400 text-black
              rounded-md font-semibold hover:bg-yellow-300"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
