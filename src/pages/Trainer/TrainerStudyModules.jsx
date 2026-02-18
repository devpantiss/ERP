import { useState } from "react";
import {
  BookOpen,
  Upload,
  CheckCircle2,
  ChevronRight,
  Layers,
} from "lucide-react";

/* ===================== CONFIG ===================== */

const MODULE_VIDEO_URL =
  "https://www.youtube.com/embed/dQw4w9WgXcQ";

const ACTIVITY_IMAGE = "/activity.png";

/* ===================== DATA ===================== */

const DATA = {
  "Mines, Steel & Aluminium": {
    "Center A": {
      "Underground Mining Technician": [
        "Batch A",
        "Batch B",
      ],
      "Blast Furnace Operator": ["Batch C"],
    },
  },

  "Power & Green Energy": {
    "Center B": {
      "Solar PV Installer": ["Batch D"],
    },
  },
};

const generateModules = () =>
  Array.from({ length: 45 }, (_, i) => ({
    id: i + 1,
    title: `Module ${i + 1}`,
  }));

/* ===================== MAIN COMPONENT ===================== */

export default function TrainerStudyModules() {
  const [dept, setDept] = useState(null);
  const [center, setCenter] = useState(null);
  const [role, setRole] = useState(null);
  const [batch, setBatch] = useState(null);
  const [module, setModule] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const modules = generateModules();

  /* NAVIGATION RESET */

  const goDept = () => {
    setDept(null);
    setCenter(null);
    setRole(null);
    setBatch(null);
    setModule(null);
  };

  const goCenter = () => {
    setCenter(null);
    setRole(null);
    setBatch(null);
    setModule(null);
  };

  const goRole = () => {
    setRole(null);
    setBatch(null);
    setModule(null);
  };

  const goBatch = () => {
    setBatch(null);
    setModule(null);
  };

  const goModule = () => {
    setModule(null);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200">

      {/* ================= SIDEBAR ================= */}

      <aside className="w-72 border-r border-slate-800 bg-[#020617]/80 backdrop-blur-xl p-6">

        <div className="flex items-center gap-3 mb-8">
          <Layers className="text-emerald-400" />
          <h1 className="font-semibold text-lg">
            Trainer LMS
          </h1>
        </div>

        <div className="space-y-4 text-sm">

          <SidebarItem
            label={dept || "Select Department"}
            active={!dept}
            onClick={goDept}
          />

          {dept && (
            <SidebarItem
              label={center || "Select Center"}
              active={!center}
              onClick={goCenter}
            />
          )}

          {center && (
            <SidebarItem
              label={role || "Select Job Role"}
              active={!role}
              onClick={goRole}
            />
          )}

          {role && (
            <SidebarItem
              label={batch || "Select Batch"}
              active={!batch}
              onClick={goBatch}
            />
          )}

          {batch && (
            <SidebarItem
              label={module?.title || "Select Module"}
              active={!module}
              onClick={goModule}
            />
          )}

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="flex-1 overflow-y-auto p-8">

        {!dept && (
          <SelectionGrid
            title="Select Department"
            options={Object.keys(DATA)}
            onSelect={setDept}
          />
        )}

        {dept && !center && (
          <SelectionGrid
            title="Select Center"
            options={Object.keys(DATA[dept])}
            onSelect={setCenter}
          />
        )}

        {center && !role && (
          <SelectionGrid
            title="Select Job Role"
            options={Object.keys(DATA[dept][center])}
            onSelect={setRole}
          />
        )}

        {role && !batch && (
          <SelectionGrid
            title="Select Batch"
            options={DATA[dept][center][role]}
            onSelect={setBatch}
          />
        )}

        {batch && !module && (
          <SelectionGrid
            title={`Modules — ${batch}`}
            options={modules.map((m) => m.title)}
            grid
            onSelect={(title) =>
              setModule(
                modules.find(
                  (m) => m.title === title
                )
              )
            }
          />
        )}

        {module && (
          <ModuleContent
            module={module}
            dept={dept}
            role={role}
            batch={batch}
            onComplete={() => setShowUpload(true)}
          />
        )}

      </main>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
        />
      )}

    </div>
  );
}

/* ================= SIDEBAR ITEM ================= */

function SidebarItem({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
        active
          ? "border-emerald-400 bg-emerald-400/10"
          : "border-slate-800 hover:border-emerald-400 hover:bg-slate-900"
      }`}
    >
      <span>{label}</span>
      <ChevronRight size={16} />
    </div>
  );
}

/* ================= SELECTION GRID ================= */

function SelectionGrid({
  title,
  options,
  onSelect,
  grid,
}) {
  return (
    <section className="max-w-6xl mx-auto">

      <h2 className="text-2xl font-semibold mb-6">
        {title}
      </h2>

      <div
        className={`grid ${
          grid
            ? "grid-cols-3 md:grid-cols-5"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        } gap-4`}
      >
        {options.map((item) => (
          <button
            key={item}
            onClick={() => onSelect(item)}
            className="p-5 rounded-xl bg-[#020617]/60 border border-slate-800 hover:border-emerald-400 hover:bg-slate-900 transition text-left backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <BookOpen
                size={18}
                className="text-emerald-400"
              />
              <span className="font-medium">
                {item}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ================= MODULE CONTENT ================= */

function ModuleContent({
  module,
  dept,
  role,
  batch,
  onComplete,
}) {
  return (
    <section className="max-w-6xl mx-auto space-y-6">

      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-semibold">
            {module.title}
          </h2>
          <p className="text-sm text-slate-400">
            {dept} → {role} → {batch}
          </p>
        </div>

        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 text-black font-medium hover:bg-emerald-400 transition"
        >
          <CheckCircle2 size={18} />
          Mark Completed
        </button>

      </div>

      <Card title="Module Video">
        <iframe
          className="w-full h-[380px] rounded-lg"
          src={MODULE_VIDEO_URL}
          allowFullScreen
        />
      </Card>

      <Card title="Activity Demonstration">
        <img
          src={ACTIVITY_IMAGE}
          alt="Activity"
          className="w-full h-[380px] object-cover rounded-lg"
        />
      </Card>

      <Card title="Quiz">
        <ul className="space-y-2 text-sm text-slate-300">
          <li>
            1. What safety precautions must be
            followed?
          </li>
          <li>
            2. Define the main operational
            procedure.
          </li>
          <li>3. Explain the tools used.</li>
        </ul>
      </Card>

      <Card title="Project Video">
        <iframe
          className="w-full h-[380px] rounded-lg"
          src={MODULE_VIDEO_URL}
          allowFullScreen
        />
      </Card>

    </section>
  );
}

/* ================= CARD ================= */

function Card({ title, children }) {
  return (
    <div className="bg-[#020617]/60 border border-slate-800 backdrop-blur-xl rounded-xl p-6">
      <h3 className="text-sm font-medium text-emerald-400 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ================= UPLOAD MODAL ================= */

function UploadModal({ onClose }) {
  const [classImage, setClassImage] =
    useState(null);
  const [activityImage, setActivityImage] =
    useState(null);
  const [projectImage, setProjectImage] =
    useState(null);

  const isValid =
    classImage && activityImage && projectImage;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">

      <div className="bg-[#020617] border border-slate-800 rounded-2xl p-6 w-full max-w-2xl">

        <h3 className="text-xl font-semibold mb-1">
          Upload Completion Evidence
        </h3>

        <p className="text-sm text-slate-400 mb-6">
          Upload training proof to complete
          module
        </p>

        <div className="grid md:grid-cols-3 gap-4">

          <UploadCard
            label="Class Image"
            setFile={setClassImage}
          />

          <UploadCard
            label="Activity Image"
            setFile={setActivityImage}
          />

          <UploadCard
            label="Project Image"
            setFile={setProjectImage}
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 rounded-md"
          >
            Cancel
          </button>

          <button
            disabled={!isValid}
            className={`px-5 py-2 rounded-md font-medium ${
              isValid
                ? "bg-emerald-500 text-black"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            Submit
          </button>

        </div>

      </div>
    </div>
  );
}

/* ================= UPLOAD CARD ================= */

function UploadCard({ label, setFile }) {
  const [preview, setPreview] =
    useState(null);

  const handleChange = (file) => {
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div>

      <p className="text-xs text-slate-400 mb-1">
        {label}
      </p>

      <label className="relative cursor-pointer group">

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) =>
            handleChange(e.target.files[0])
          }
        />

        <div className="h-36 rounded-xl border border-dashed border-slate-700 bg-[#020617]/60 flex items-center justify-center overflow-hidden group-hover:border-emerald-400 transition">

          {!preview && (
            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-emerald-400">
              <Upload size={26} />
              <span className="text-xs">
                Click to Upload
              </span>
            </div>
          )}

          {preview && (
            <img
              src={preview}
              className="w-full h-full object-cover"
            />
          )}

        </div>

      </label>

    </div>
  );
}
