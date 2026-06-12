import { useMemo, useState } from "react";
import SlidePanel from "../../components/common/SlidePanel";
import {
  Building2,
  Users,
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { selectTrainingCatalog } from "../../stores/selectors/trainingSelectors";

/* ================= MAIN ================= */

export default function ExposureVisitEnterprisePro({ trainerEmployeeId = "EMP-0001", onClose, onSubmit }) {
  const catalog = useMemo(() => selectTrainingCatalog(trainerEmployeeId), [trainerEmployeeId]);
  const initialBatch = catalog.batches[0];
  const initialProject = catalog.projects.find((project) => project.id === initialBatch?.projectId) || catalog.projects[0];

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    companyId: catalog.companies[0]?.id || "",
    spocName: "",
    spocPhone: "",
    projectId: initialProject?.id || "",
    batchId: initialBatch?.id || "",
    trade: initialBatch?.trade || "",
    date: "",
  });

  /* ================= NAVIGATION ================= */

  const next = () => setStep((s) => Math.min(3, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));
  const submit = () => {
    const batch = catalog.batches.find((item) => item.id === form.batchId);
    onSubmit?.({
      projectId: form.projectId || batch?.projectId,
      centerId: batch?.centerId,
      batchId: form.batchId,
      companyId: form.companyId,
      visitDate: form.date,
      status: "SUBMITTED",
      spocName: form.spocName,
      spocPhone: form.spocPhone,
      candidates: 0,
      attended: 0,
      images: [],
      location: null,
    });
    onClose?.();
  };

  /* ================= UI ================= */

  return (
    <>
      <SlidePanel open={true} onClose={onClose} title="Enterprise Exposure Visit" width="4xl">
        <div className="space-y-6">

        {/* HEADER */}
        <Header step={step} />

        {/* FORM */}
        <div className="bg-[#111827] border border-slate-700 rounded-2xl shadow-xl">

          <div className="p-8">

            {step === 1 && (
              <IndustryStep form={form} setForm={setForm} catalog={catalog} />
            )}

            {step === 2 && (
              <TrainingStep form={form} setForm={setForm} catalog={catalog} />
            )}

            {step === 3 && <ReviewStep form={form} />}

          </div>

          {/* STICKY ACTION BAR */}
          <div className="flex justify-between items-center p-6 border-t border-slate-700 bg-[#0b1220] rounded-b-2xl">

            {step > 1 ? (
              <button
                onClick={prev}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-md"
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={next}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-black rounded-md font-medium"
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={submit} className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-black rounded-md font-semibold">
                Submit <CheckCircle2 size={18} />
              </button>
            )}

          </div>
        </div>
      </div>
      </SlidePanel>
    </>
  );
}

/* ================= HEADER ================= */

function Header({ step }) {
  const steps = [
    { icon: Building2, label: "Industry Details" },
    { icon: Users, label: "Training Info" },
    { icon: ClipboardList, label: "Review" },
  ];

  return (
    <div className="space-y-4">

      <h1 className="text-2xl font-semibold">
        Exposure Visit Documentation
      </h1>

      <div className="flex items-center justify-between">

        {steps.map((s, i) => {
          const Icon = s.icon;
          const active = step >= i + 1;

          return (
            <div
              key={i}
              className="flex flex-col items-center flex-1"
            >
              <div
                className={`p-3 rounded-full mb-2 ${
                  active
                    ? "bg-emerald-500 text-black"
                    : "bg-slate-700"
                }`}
              >
                <Icon size={18} />
              </div>

              <span className="text-xs">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= STEP 1 ================= */

function IndustryStep({ form, setForm, catalog }) {
  return (
    <FormCard
      title="Industry Information"
      description="Enter the organization details where the visit was conducted"
      icon={Building2}
    >
      <Grid>
        <Select
          label="Industry"
          value={form.companyId}
          options={catalog.companies}
          onChange={(v) => setForm({ ...form, companyId: v })}
        />

        <Input
          label="SPOC Name"
          value={form.spocName}
          onChange={(v) => setForm({ ...form, spocName: v })}
        />

        <Input
          label="SPOC Phone"
          value={form.spocPhone}
          onChange={(v) => setForm({ ...form, spocPhone: v })}
        />
      </Grid>
    </FormCard>
  );
}

/* ================= STEP 2 ================= */

function TrainingStep({ form, setForm, catalog }) {
  return (
    <FormCard
      title="Training Details"
      description="Provide batch and training related information"
      icon={Users}
    >
      <Grid>
        <Select
          label="Project"
          value={form.projectId}
          options={catalog.projects}
          onChange={(v) => setForm({ ...form, projectId: v })}
        />

        <Select
          label="Batch"
          value={form.batchId}
          options={catalog.batches.map((batch) => ({ id: batch.id, label: batch.label }))}
          onChange={(v) => {
            const batch = catalog.batches.find((item) => item.id === v);
            setForm({ ...form, batchId: v, trade: batch?.trade || form.trade, projectId: batch?.projectId || form.projectId });
          }}
        />

        <Select
          label="Trade"
          value={form.trade}
          options={catalog.trades.map((trade) => ({ id: trade, label: trade }))}
          onChange={(v) => setForm({ ...form, trade: v })}
        />

        <input
          type="date"
          className="input"
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
        />
      </Grid>
    </FormCard>
  );
}

/* ================= REVIEW ================= */

function ReviewStep({ form }) {
  return (
    <FormCard
      title="Review Submission"
      description="Verify the information before final submission"
      icon={ClipboardList}
    >
      <div className="space-y-2 text-sm">

        {Object.entries(form).map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between border-b border-slate-700 py-1"
          >
            <span className="text-white/60 capitalize">
              {k}
            </span>
            <span>{v?.toString()}</span>
          </div>
        ))}

      </div>
    </FormCard>
  );
}

/* ================= UI HELPERS ================= */

function FormCard({ title, description, icon: Icon, children }) {
  return (
    <div className="space-y-6">

      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 rounded">
          <Icon className="text-emerald-400" />
        </div>

        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-xs text-white/60">
            {description}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {children}
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <p className="text-xs text-white/60 mb-1">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="input"
      />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <p className="text-xs text-white/60 mb-1">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}



/* ================= GLOBAL INPUT STYLE ================= */

const styles = `
.input {
  width: 100%;
  background: #020617;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 12px;
}

`;

document.head.insertAdjacentHTML(
  "beforeend",
  `<style>${styles}</style>`
);
