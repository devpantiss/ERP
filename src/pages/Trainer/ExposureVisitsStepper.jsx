import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  Building2,
  Users,
  ClipboardList,
  Camera,
  MapPin,
  CheckCircle2,
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  ImageIcon,
} from "lucide-react";

/* ================= CONFIG ================= */

const STORAGE_KEY = "exposure-visit-draft-v2";

const PROJECTS = [
  "PMKVY",
  "CSR - Tata Steel",
  "DDUGKY",
  "State Skill Mission",
];

const TRADES = ["Electrical", "Fitter", "Safety", "Welder"];

/* ================= MAIN ================= */

export default function ExposureVisitEnterprisePro() {
  const webcamRef = useRef(null);

  const [step, setStep] = useState(1);
  const [showCamera, setShowCamera] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);

  const [form, setForm] = useState({
    industry: "",
    spocName: "",
    spocPhone: "",
    project: PROJECTS[0],
    batch: "",
    trade: TRADES[0],
    date: "",
    candidates: "",
    attended: "",
    images: [],
    location: null,
  });

  /* ================= AUTO SAVE ================= */

  useEffect(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) setForm(JSON.parse(draft));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  /* ================= GPS ================= */

  const captureLocation = () => {
    setLoadingGPS(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({
          ...form,
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        });

        setLoadingGPS(false);
      },
      () => setLoadingGPS(false)
    );
  };

  /* ================= IMAGE ================= */

  const handleUpload = (files) => {
    const imgs = Array.from(files).map((f) =>
      URL.createObjectURL(f)
    );

    setForm({
      ...form,
      images: [...form.images, ...imgs],
    });
  };

  const capturePhoto = () => {
    const img = webcamRef.current.getScreenshot();

    setForm({
      ...form,
      images: [...form.images, img],
    });

    setShowCamera(false);
  };

  /* ================= NAVIGATION ================= */

  const next = () => setStep((s) => Math.min(4, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  /* ================= UI ================= */

  return (
    <section className="min-h-screen bg-[#0f172a] text-slate-200 p-8">

      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <Header step={step} />

        {/* FORM */}
        <div className="bg-[#111827] border border-slate-700 rounded-2xl shadow-xl">

          <div className="p-8">

            {step === 1 && (
              <IndustryStep form={form} setForm={setForm} />
            )}

            {step === 2 && (
              <TrainingStep form={form} setForm={setForm} />
            )}

            {step === 3 && (
              <EvidenceStep
                form={form}
                setForm={setForm}
                handleUpload={handleUpload}
                captureLocation={captureLocation}
                loadingGPS={loadingGPS}
                setShowCamera={setShowCamera}
              />
            )}

            {step === 4 && <ReviewStep form={form} />}

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

            {step < 4 ? (
              <button
                onClick={next}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-black rounded-md font-medium"
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-black rounded-md font-semibold">
                Submit <CheckCircle2 size={18} />
              </button>
            )}

          </div>
        </div>
      </div>

      {/* CAMERA */}
      {showCamera && (
        <Modal onClose={() => setShowCamera(false)}>
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
          <button
            onClick={capturePhoto}
            className="w-full mt-4 py-2 bg-emerald-500 text-black rounded"
          >
            Capture Photo
          </button>
        </Modal>
      )}
    </section>
  );
}

/* ================= HEADER ================= */

function Header({ step }) {
  const steps = [
    { icon: Building2, label: "Industry Details" },
    { icon: Users, label: "Training Info" },
    { icon: ImageIcon, label: "Evidence" },
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

function IndustryStep({ form, setForm }) {
  return (
    <FormCard
      title="Industry Information"
      description="Enter the organization details where the visit was conducted"
      icon={Building2}
    >
      <Grid>
        <Input
          label="Industry Name"
          value={form.industry}
          onChange={(v) => setForm({ ...form, industry: v })}
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

function TrainingStep({ form, setForm }) {
  return (
    <FormCard
      title="Training Details"
      description="Provide batch and training related information"
      icon={Users}
    >
      <Grid>
        <Select
          label="Project"
          value={form.project}
          options={PROJECTS}
          onChange={(v) => setForm({ ...form, project: v })}
        />

        <Input
          label="Batch"
          value={form.batch}
          onChange={(v) => setForm({ ...form, batch: v })}
        />

        <Select
          label="Trade"
          value={form.trade}
          options={TRADES}
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

/* ================= STEP 3 ================= */

function EvidenceStep({
  form,
  handleUpload,
  captureLocation,
  loadingGPS,
  setShowCamera,
}) {
  return (
    <FormCard
      title="Evidence & Attendance"
      description="Upload visit photos (optional) and record attendance"
      icon={Camera}
    >
      <Grid>
        <Input label="Total Candidates" />
        <Input label="Attended" />
      </Grid>

      {/* UPLOAD AREA */}
      <div className="mt-6">

        <p className="text-sm mb-2 font-medium">
          Visit Photos (Optional)
        </p>

        <label className="upload-box">
          <input
            type="file"
            multiple
            hidden
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files)}
          />

          <div className="flex flex-col items-center gap-2">
            <UploadCloud size={28} />
            <span>Click to upload images</span>
            <span className="text-xs text-slate-400">
              JPG, PNG up to 10MB
            </span>
          </div>
        </label>

        {/* PREVIEW */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {form.images.map((img, i) => (
            <img
              key={i}
              src={img}
              className="w-24 h-16 object-cover rounded"
            />
          ))}
        </div>

        {/* CAMERA */}
        <button
          onClick={() => setShowCamera(true)}
          className="mt-4 px-4 py-2 bg-slate-700 rounded-md"
        >
          Capture from Camera
        </button>
      </div>

      {/* LOCATION */}
      <div className="mt-6">
        <button
          onClick={captureLocation}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-md"
        >
          <MapPin size={16} />
          {loadingGPS ? "Capturing..." : "Capture Location"}
        </button>

        {form.location && (
          <p className="text-xs text-emerald-400 mt-2">
            Location captured ✓
          </p>
        )}
      </div>
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
            <span className="text-slate-400 capitalize">
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
          <p className="text-xs text-slate-400">
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
      <p className="text-xs text-slate-400 mb-1">{label}</p>
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
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

const Modal = ({ children, onClose }) => (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div
      className="bg-[#111827] p-6 rounded-xl max-w-md w-full border border-slate-700"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

/* ================= GLOBAL INPUT STYLE ================= */

const styles = `
.input {
  width: 100%;
  background: #020617;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 12px;
}

.upload-box {
  border: 1px dashed #334155;
  padding: 24px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  background: #020617;
}
`;

document.head.insertAdjacentHTML(
  "beforeend",
  `<style>${styles}</style>`
);
