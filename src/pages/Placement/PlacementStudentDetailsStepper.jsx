import React, { useState } from "react";
import {
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaCheck,
} from "react-icons/fa";

/* ================= MAIN ================= */

export default function PlacementStudentDetailsStepperPage({
  onSubmit,
}) {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    project: "",
    batch: "",
    company: "",
    designation: "",
    salary: "",
    joiningDate: "",
  });

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const submit = () => {
    onSubmit?.(form);
    console.log("Submitted:", form);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-200 p-6">

      {/* ================= PAGE HEADER ================= */}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-cyan-400">
          Enter Candidate Details
        </h1>
        <p className="text-sm text-gray-400">
          Placement Officer / Placements List / New
        </p>
      </div>

      {/* ================= CARD ================= */}

      <div className="bg-[#111827] border border-cyan-900 rounded-xl w-full max-w-4xl p-6 shadow-xl">

        {/* ================= STEPPER ================= */}

        <Stepper step={step} />

        {/* ================= BODY ================= */}

        <div className="mt-8">

          {step === 1 && (
            <StepOne form={form} update={update} />
          )}

          {step === 2 && (
            <StepTwo form={form} update={update} />
          )}

          {step === 3 && (
            <StepThree form={form} update={update} />
          )}

          {step === 4 && <ReviewStep form={form} />}

        </div>

        {/* ================= FOOTER ================= */}

        <div className="flex justify-between mt-10 pt-6 border-t border-gray-800">

          <button
            onClick={prev}
            disabled={step === 1}
            className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 disabled:opacity-40"
          >
            Previous
          </button>

          {step < 4 ? (
            <button
              onClick={next}
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg font-semibold"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submit}
              className="px-5 py-2 bg-green-500 hover:bg-green-400 text-black rounded-lg font-semibold flex items-center gap-2"
            >
              <FaCheck />
              Submit
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

/* ================= STEPPER ================= */

function Stepper({ step }) {
  const steps = ["Candidate", "Placement", "Joining", "Review"];

  return (
    <div className="flex items-center justify-between">

      {steps.map((label, index) => {
        const number = index + 1;
        const active = step >= number;

        return (
          <div key={label} className="flex-1 flex items-center">

            <div className="flex flex-col items-center">

              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold
                  transition
                  ${
                    active
                      ? "bg-cyan-500 text-black"
                      : "bg-gray-700 text-gray-300"
                  }
                `}
              >
                {number}
              </div>

              <span className="text-xs mt-2 text-gray-400">
                {label}
              </span>

            </div>

            {index !== steps.length - 1 && (
              <div
                className={`
                  flex-1 h-[2px]
                  mx-2
                  ${step > number ? "bg-cyan-500" : "bg-gray-700"}
                `}
              />
            )}

          </div>
        );
      })}
    </div>
  );
}

/* ================= STEP 1 ================= */

function StepOne({ form, update }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">

      <Input
        label="Candidate Name"
        value={form.name}
        onChange={(v) => update("name", v)}
        icon={<FaUser />}
      />

      <Input
        label="Project"
        value={form.project}
        onChange={(v) => update("project", v)}
      />

      <Input
        label="Batch"
        value={form.batch}
        onChange={(v) => update("batch", v)}
      />

    </div>
  );
}

/* ================= STEP 2 ================= */

function StepTwo({ form, update }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">

      <Input
        label="Company"
        value={form.company}
        onChange={(v) => update("company", v)}
        icon={<FaBuilding />}
      />

      <Input
        label="Designation"
        value={form.designation}
        onChange={(v) => update("designation", v)}
      />

      <Input
        label="Salary"
        type="number"
        value={form.salary}
        onChange={(v) => update("salary", v)}
      />

    </div>
  );
}

/* ================= STEP 3 ================= */

function StepThree({ form, update }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">

      <Input
        label="Date of Joining"
        type="date"
        value={form.joiningDate}
        onChange={(v) => update("joiningDate", v)}
        icon={<FaCalendarAlt />}
      />

    </div>
  );
}

/* ================= REVIEW ================= */

function ReviewStep({ form }) {
  return (
    <div className="bg-[#020617] border border-cyan-900 rounded-lg p-5 space-y-3 text-sm">

      {Object.entries(form).map(([key, value]) => (
        <div
          key={key}
          className="flex justify-between border-b border-gray-800 pb-2"
        >
          <span className="text-gray-400 capitalize">
            {key}
          </span>

          <span className="text-gray-200 font-medium">
            {value || "-"}
          </span>
        </div>
      ))}

    </div>
  );
}

/* ================= INPUT ================= */

function Input({
  label,
  value,
  onChange,
  type = "text",
  icon,
}) {
  return (
    <div className="space-y-1">

      <label className="text-xs text-gray-400">{label}</label>

      <div className="relative">

        {icon && (
          <div className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-500">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full bg-[#020617]
            border border-gray-700
            rounded-lg
            px-3 py-2
            ${icon ? "pl-9" : ""}
            text-sm
            focus:border-cyan-500
            focus:ring-1 focus:ring-cyan-500
            outline-none
            transition
          `}
        />

      </div>

    </div>
  );
}
