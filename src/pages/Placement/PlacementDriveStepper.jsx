import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ===================== MAIN ===================== */

export default function NewPlacementDrivePage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [form, setForm] = useState({
    type: "",
    companies: [], // MULTI SELECT
    salary: "",
    jobRoles: "",
    vacancies: "",

    recruitmentLocation: "",
    driveLocation: "",
    date: "",
    time: "",
    contactPerson: "",

    qualification: "",
    ageLimit: "",
    gender: "",
    experience: "",
    documents: "",
  });

  /* ================= VALIDATION ================= */

  function validateStep() {
    if (step === 1) {
      return form.type && form.companies.length && form.salary;
    }
    if (step === 2) {
      return form.recruitmentLocation && form.driveLocation && form.date;
    }
    return true;
  }

  function next() {
    if (!validateStep()) return alert("Please fill required fields");
    setDirection(1);
    setStep(s => s + 1);
  }

  function back() {
    setDirection(-1);
    setStep(s => s - 1);
  }

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    console.log("FINAL DATA", form);
    alert("Placement Drive Created Successfully");
    navigate("/placement-officer/placement-drives");
  }

  function handleDraft() {
    console.log("DRAFT", form);
    alert("Saved as Draft");
  }

  /* ================= UI ================= */

  return (
    <section className="p-8 bg-[#111827] min-h-screen text-slate-200">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-2xl font-semibold mb-6">
          Create Placement Drive
        </h1>

        <Stepper step={step} />

        <div className="bg-[#020617] border border-cyan-500/30 rounded-2xl p-6 mt-6 overflow-hidden">

          <AnimatedContainer step={step} direction={direction}>

            {step === 1 && (
              <Step1 form={form} update={update} />
            )}

            {step === 2 && (
              <Step2 form={form} update={update} />
            )}

            {step === 3 && (
              <Step3 form={form} update={update} />
            )}

            {step === 4 && (
              <Step4 form={form} />
            )}

          </AnimatedContainer>

          {/* FOOTER */}
          <div className="flex justify-between mt-8">

            <div>
              {step > 1 && (
                <button onClick={back} className="btn-secondary">
                  Back
                </button>
              )}
            </div>

            <div className="flex gap-3">

              {step === 4 && (
                <button onClick={handleDraft} className="btn-secondary">
                  Save Draft
                </button>
              )}

              {step < 4 && (
                <button onClick={next} className="btn-primary">
                  Next
                </button>
              )}

              {step === 4 && (
                <button onClick={handleSubmit} className="btn-primary">
                  Submit Drive
                </button>
              )}

            </div>

          </div>

        </div>

      </div>

      <style>{`

        .input {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          background: #020617;
          border: 1px solid #475569;
          color: #e2e8f0;
          font-size: 14px;
        }

        .btn-primary {
          padding: 8px 16px;
          background: #22c55e;
          color: black;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-secondary {
          padding: 8px 16px;
          background: #334155;
          border-radius: 6px;
          font-size: 14px;
        }

        .slide-enter {
          opacity: 0;
          transform: translateX(40px);
        }

        .slide-enter-back {
          opacity: 0;
          transform: translateX(-40px);
        }

        .slide-active {
          opacity: 1;
          transform: translateX(0);
          transition: all 300ms ease;
        }

      `}</style>

    </section>
  );
}

/* ===================== ANIMATION CONTAINER ===================== */

function AnimatedContainer({ children, step, direction }) {
  return (
    <div
      key={step}
      className={`${
        direction === 1 ? "slide-enter" : "slide-enter-back"
      } slide-active`}
    >
      {children}
    </div>
  );
}

/* ===================== STEPPER ===================== */

function Stepper({ step }) {
  const steps = [
    "Drive Details",
    "Location & Schedule",
    "Eligibility",
    "Review",
  ];

  return (
    <div className="flex justify-between items-center relative">

      {steps.map((label, i) => {
        const index = i + 1;
        const completed = step > index;
        const active = step === index;

        return (
          <div key={i} className="flex-1 text-center relative">

            {i !== steps.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-[2px]
                ${step > index ? "bg-cyan-400" : "bg-slate-700"}`}
              />
            )}

            <div
              className={`mx-auto w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold relative z-10
              ${
                completed
                  ? "bg-emerald-400 text-black"
                  : active
                  ? "bg-cyan-400 text-black ring-4 ring-cyan-400/20"
                  : "bg-slate-700"
              }`}
            >
              {completed ? "✓" : index}
            </div>

            <p
              className={`text-xs mt-2 ${
                active ? "text-cyan-400" : "text-slate-400"
              }`}
            >
              {label}
            </p>

          </div>
        );
      })}
    </div>
  );
}

/* ===================== STEP 1 ===================== */

function Step1({ form, update }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">

      <Select
        label="Drive Type"
        value={form.type}
        onChange={v => update("type", v)}
        options={["Single Company", "Multiple Companies"]}
      />

      <CompanyMultiSelect
        selected={form.companies}
        onChange={v => update("companies", v)}
      />

      <Input
        label="Salary Range"
        value={form.salary}
        onChange={v => update("salary", v)}
      />

      <Input
        label="Job Roles"
        value={form.jobRoles}
        onChange={v => update("jobRoles", v)}
      />

      <Input
        label="Number of Vacancies"
        value={form.vacancies}
        onChange={v => update("vacancies", v)}
      />

    </div>
  );
}

/* ===================== STEP 2 ===================== */

function Step2({ form, update }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">

      <Input
        label="Recruitment Location"
        value={form.recruitmentLocation}
        onChange={v => update("recruitmentLocation", v)}
      />

      <Input
        label="Drive Location"
        value={form.driveLocation}
        onChange={v => update("driveLocation", v)}
      />

      <Input
        type="date"
        label="Drive Date"
        value={form.date}
        onChange={v => update("date", v)}
      />

      <Input
        type="time"
        label="Reporting Time"
        value={form.time}
        onChange={v => update("time", v)}
      />

      <Input
        label="Contact Person"
        value={form.contactPerson}
        onChange={v => update("contactPerson", v)}
      />

    </div>
  );
}

/* ===================== STEP 3 ===================== */

function Step3({ form, update }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">

      <Input
        label="Qualification"
        value={form.qualification}
        onChange={v => update("qualification", v)}
      />

      <Input
        label="Age Limit"
        value={form.ageLimit}
        onChange={v => update("ageLimit", v)}
      />

      <Select
        label="Gender Preference"
        value={form.gender}
        onChange={v => update("gender", v)}
        options={["Any", "Male", "Female"]}
      />

      <Input
        label="Experience Required"
        value={form.experience}
        onChange={v => update("experience", v)}
      />

      <Input
        label="Documents Required"
        value={form.documents}
        onChange={v => update("documents", v)}
      />

    </div>
  );
}

/* ===================== STEP 4 ===================== */

function Step4({ form }) {
  return (
    <div className="space-y-3 text-sm">

      {Object.entries(form).map(([k, v]) => (
        <div
          key={k}
          className="flex justify-between border-b border-slate-700 pb-2"
        >
          <span className="text-slate-400 capitalize">
            {k.replace(/([A-Z])/g, " $1")}
          </span>
          <span>
            {Array.isArray(v) ? v.join(", ") : v || "-"}
          </span>
        </div>
      ))}

    </div>
  );
}

/* ===================== MULTI COMPANY SELECT ===================== */

const COMPANY_OPTIONS = [
  "Tata Steel",
  "JSW Steel",
  "Aditya Aluminium",
  "Vedanta",
  "Jindal Steel",
  "Reliance Industries",
  "L&T Construction",
  "Adani Group",
];

function CompanyMultiSelect({ selected = [], onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const filtered = COMPANY_OPTIONS.filter(
    c =>
      c.toLowerCase().includes(query.toLowerCase()) &&
      !selected.includes(c)
  );

  function addCompany(name) {
    if (!name.trim()) return;
    if (selected.includes(name)) return;

    onChange([...selected, name]);
    setQuery("");
    setOpen(false);
  }

  function removeCompany(name) {
    onChange(selected.filter(c => c !== name));
  }

  useEffect(() => {
    function handleClick(e) {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">

      <label className="text-xs text-slate-400">
        Companies
      </label>

      <div
        className="input mt-1 flex flex-wrap gap-2 cursor-text"
        onClick={() => setOpen(true)}
      >

        {selected.map(company => (
          <div
            key={company}
            className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs flex items-center gap-1"
          >
            {company}
            <button
              onClick={() => removeCompany(company)}
              className="text-cyan-200"
            >
              ✕
            </button>
          </div>
        ))}

        <input
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCompany(query);
            }

            if (
              e.key === "Backspace" &&
              !query &&
              selected.length
            ) {
              removeCompany(selected[selected.length - 1]);
            }
          }}
          className="bg-transparent outline-none flex-1 text-sm"
          placeholder="Search or add company..."
        />

      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#020617] border border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">

          {filtered.map(company => (
            <div
              key={company}
              onClick={() => addCompany(company)}
              className="px-3 py-2 text-sm hover:bg-cyan-500/20 cursor-pointer"
            >
              {company}
            </div>
          ))}

          {query && !COMPANY_OPTIONS.includes(query) && (
            <div
              onClick={() => addCompany(query)}
              className="px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
            >
              + Add "{query}"
            </div>
          )}

        </div>
      )}

    </div>
  );
}

/* ===================== INPUTS ===================== */

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-xs text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input mt-1"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs text-slate-400">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input mt-1"
      >
        <option value="">Select</option>
        {options.map(o => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
