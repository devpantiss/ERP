import { useState } from "react";
import {
  Layers,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Wrench,
} from "lucide-react";

/* ================= CONFIG ================= */

const MODULE_VIDEO_URL =
  "https://www.youtube.com/embed/dQw4w9WgXcQ";

/* Departments Data */

const DATA = {
  "Mines, Steel & Aluminium": {
    "Center A": {
      "Underground Mining Technician": [
        "Batch A",
        "Batch B",
      ],
    },
  },

  "Power & Green Energy": {
    "Center B": {
      "Solar PV Installer": ["Batch C"],
    },
  },
};

/* Generate Modules */

const generateModules = () =>
  Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Module ${i + 1}`,
  }));

/* ================= MAIN COMPONENT ================= */

export default function TrainerLabsModules() {
  const [dept, setDept] = useState(null);
  const [center, setCenter] = useState(null);
  const [role, setRole] = useState(null);
  const [batch, setBatch] = useState(null);
  const [selectedModule, setSelectedModule] =
    useState(null);

  /* Completed Modules State */

  const [completedData, setCompletedData] =
    useState({
      "Batch A": [1, 2, 3, 4],
      "Batch B": [1, 2],
    });

  const modules = generateModules();

  /* Navigation Reset */

  const goDept = () => {
    setDept(null);
    setCenter(null);
    setRole(null);
    setBatch(null);
    setSelectedModule(null);
  };

  const goCenter = () => {
    setCenter(null);
    setRole(null);
    setBatch(null);
    setSelectedModule(null);
  };

  const goRole = () => {
    setRole(null);
    setBatch(null);
    setSelectedModule(null);
  };

  const goBatch = () => {
    setBatch(null);
    setSelectedModule(null);
  };

  const goModules = () => {
    setSelectedModule(null);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200">

      {/* ================= SIDEBAR ================= */}

      <aside className="w-72 border-r border-slate-800 bg-[#020617]/80 backdrop-blur-xl p-6">

        <div className="flex items-center gap-3 mb-8">
          <Layers className="text-emerald-400" />
          <h1 className="font-semibold text-lg">
            Trainer Labs
          </h1>
        </div>

        <div className="space-y-4 text-sm">

          <SidebarItem
            label={dept || "Department"}
            active={!dept}
            onClick={goDept}
          />

          {dept && (
            <SidebarItem
              label={center || "Center"}
              active={!center}
              onClick={goCenter}
            />
          )}

          {center && (
            <SidebarItem
              label={role || "Job Role"}
              active={!role}
              onClick={goRole}
            />
          )}

          {role && (
            <SidebarItem
              label={batch || "Batch"}
              active={!batch}
              onClick={goBatch}
            />
          )}

          {batch && (
            <SidebarItem
              label={
                selectedModule?.title || "Modules"
              }
              active={!selectedModule}
              onClick={goModules}
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

        {batch && !selectedModule && (
          <ModulesGrid
            batch={batch}
            modules={modules}
            completedData={completedData}
            onSelect={setSelectedModule}
          />
        )}

        {selectedModule && (
          <ModuleDetails
            module={selectedModule}
            batch={batch}
            completedData={completedData}
            setCompletedData={setCompletedData}
          />
        )}

      </main>

    </div>
  );
}

/* ================= MODULE GRID ================= */

function ModulesGrid({
  batch,
  modules,
  completedData,
  onSelect,
}) {
  const completed = completedData[batch] || [];

  return (
    <section className="max-w-6xl mx-auto">

      <h2 className="text-2xl font-semibold mb-6">
        Modules — {batch}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">

        {modules.map((m) => {
          const done = completed.includes(m.id);

          return (
            <div
              key={m.id}
              onClick={() => onSelect(m)}
              className={`
                p-4 rounded-xl border text-center
                cursor-pointer transition
                ${
                  done
                    ? "border-emerald-400 bg-emerald-400/10"
                    : "border-slate-800 hover:border-emerald-400 hover:bg-slate-900"
                }
              `}
            >
              {done ? (
                <CheckCircle2 className="mx-auto text-emerald-400 mb-2" />
              ) : (
                <BookOpen className="mx-auto text-slate-400 mb-2" />
              )}

              <span className="text-xs">
                {m.title}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ================= MODULE DETAILS ================= */

function ModuleDetails({
  module,
  batch,
  completedData,
  setCompletedData,
}) {
  const [showUpload, setShowUpload] = useState(false);

  const completed =
    completedData[batch]?.includes(module.id);

  const markCompleted = () => {
    setCompletedData((prev) => {
      const prevBatch = prev[batch] || [];

      return {
        ...prev,
        [batch]: [...new Set([...prevBatch, module.id])],
      };
    });

    setShowUpload(false);
  };

  return (
    <section className="max-w-6xl mx-auto space-y-6">

      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-semibold">
            {module.title}
          </h2>
          <p className="text-sm text-slate-400">
            Batch — {batch}
          </p>
        </div>

        {completed && (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 />
            Completed
          </div>
        )}

      </div>

      {/* VIDEO */}

      <Card title="Lab Demonstration Video">
        <iframe
          className="w-full h-[380px] rounded-lg"
          src={MODULE_VIDEO_URL}
          allowFullScreen
        />
      </Card>

      {/* TOOLS */}

      <Card title="Tools & Equipment">
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <Wrench size={16} /> Safety Helmet
          </li>
          <li className="flex gap-2">
            <Wrench size={16} /> Gloves
          </li>
          <li className="flex gap-2">
            <Wrench size={16} /> Measuring Tools
          </li>
        </ul>
      </Card>

      {/* INSTRUCTIONS */}

      <Card title="Practical Instructions">
        <ul className="space-y-2 text-sm">
          <li>Step 1 — Prepare workspace</li>
          <li>Step 2 — Arrange tools</li>
          <li>Step 3 — Perform activity</li>
        </ul>
      </Card>

      {!completed && (
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 text-black font-medium hover:bg-emerald-400 transition"
        >
          <CheckCircle2 size={18} />
          Mark Completed
        </button>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSubmit={markCompleted}
        />
      )}
    </section>
  );
}

/* ================= UPLOAD MODAL ================= */

function UploadModal({ onClose, onSubmit }) {
  const [classImage, setClassImage] = useState(null);
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
          Upload proof to complete module
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
            onClick={onSubmit}
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
  const [preview, setPreview] = useState(null);

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

        <div className="h-36 rounded-xl border border-dashed border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-emerald-400 transition">

          {!preview && (
            <span className="text-xs text-slate-400">
              Click to Upload
            </span>
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

/* ================= COMMON ================= */

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

function SelectionGrid({ title, options, onSelect }) {
  return (
    <section className="max-w-6xl mx-auto">

      <h2 className="text-2xl font-semibold mb-6">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {options.map((item) => (
          <button
            key={item}
            onClick={() => onSelect(item)}
            className="p-5 rounded-xl border border-slate-800 hover:border-emerald-400 hover:bg-slate-900 transition text-left"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={18} className="text-emerald-400" />
              <span>{item}</span>
            </div>
          </button>
        ))}

      </div>
    </section>
  );
}

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
