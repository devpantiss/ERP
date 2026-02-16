import { useState } from "react";
import {
  BookOpen,
  Upload,
  CheckCircle2,
  ChevronRight,
  Layers,
} from "lucide-react";

/* ===================== CONFIG ===================== */

const MODULE_VIDEO_URL = "https://www.youtube.com/embed/dQw4w9WgXcQ";
const ACTIVITY_IMAGE = "/activity.png";

const DEPARTMENTS = {
  "Mines, Steel & Aluminium": [
    "Underground Mining Technician",
    "Blast Furnace Operator",
  ],
  "Furniture Fitting": [
    "Carpentry Technician",
    "Modular Furniture Installer",
  ],
  "Power & Green Energy": [
    "Solar PV Installer",
    "Wind Turbine Technician",
  ],
  "Shipping & Logistics": [
    "Warehouse Executive",
    "Port Operations Assistant",
  ],
  "Construction Tech & Infra Equipments": [
    "Heavy Equipment Operator",
    "Bar Bending Technician",
  ],
  "Green Jobs": [
    "EV Service Technician",
    "Waste Management Executive",
  ],
};

const generateModules = () =>
  Array.from({ length: 45 }, (_, i) => ({
    id: i + 1,
    title: `Module ${i + 1}`,
  }));

/* ===================== MAIN COMPONENT ===================== */

export default function TrainerStudyModules() {
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const modules = generateModules();

  /* STEP NAVIGATION */

  const goToDept = () => {
    setSelectedDept(null);
    setSelectedCourse(null);
    setSelectedModule(null);
  };

  const goToCourse = () => {
    setSelectedCourse(null);
    setSelectedModule(null);
  };

  const goToModule = () => {
    setSelectedModule(null);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200">

      {/* ===================== SIDEBAR ===================== */}

      <aside className="w-72 border-r border-slate-800 bg-[#020617]/80 backdrop-blur-xl p-6">

        <div className="flex items-center gap-3 mb-8">
          <Layers className="text-emerald-400" />
          <h1 className="font-semibold text-lg">Trainer LMS</h1>
        </div>

        <div className="space-y-4 text-sm">

          <SidebarItem
            label={selectedDept || "Select Department"}
            active={!selectedDept}
            onClick={goToDept}
            clickable
          />

          {selectedDept && (
            <SidebarItem
              label={selectedCourse || "Select Course"}
              active={!selectedCourse}
              onClick={goToCourse}
              clickable
            />
          )}

          {selectedCourse && (
            <SidebarItem
              label={selectedModule?.title || "Select Module"}
              active={!selectedModule}
              onClick={goToModule}
              clickable
            />
          )}

        </div>

      </aside>

      {/* ===================== MAIN CONTENT ===================== */}

      <main className="flex-1 overflow-y-auto p-8">

        {!selectedDept && (
          <SelectionGrid
            title="Select Department"
            options={Object.keys(DEPARTMENTS)}
            onSelect={setSelectedDept}
          />
        )}

        {selectedDept && !selectedCourse && (
          <SelectionGrid
            title={`Courses — ${selectedDept}`}
            options={DEPARTMENTS[selectedDept]}
            onSelect={setSelectedCourse}
          />
        )}

        {selectedCourse && !selectedModule && (
          <SelectionGrid
            title={`Modules — ${selectedCourse}`}
            options={modules.map((m) => m.title)}
            grid
            onSelect={(title) =>
              setSelectedModule(
                modules.find((m) => m.title === title)
              )
            }
          />
        )}

        {selectedModule && (
          <ModuleContent
            module={selectedModule}
            dept={selectedDept}
            course={selectedCourse}
            onComplete={() => setShowUpload(true)}
          />
        )}

      </main>

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} />
      )}

    </div>
  );
}

/* ===================== SIDEBAR ITEM ===================== */

function SidebarItem({ label, active, onClick, clickable }) {
  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`flex items-center justify-between p-3 rounded-lg border transition ${
        active
          ? "border-emerald-400 bg-emerald-400/10"
          : "border-slate-800"
      } ${
        clickable
          ? "cursor-pointer hover:border-emerald-400 hover:bg-slate-900"
          : ""
      }`}
    >
      <span>{label}</span>
      <ChevronRight size={16} />
    </div>
  );
}

/* ===================== SELECTION GRID ===================== */

function SelectionGrid({ title, options, onSelect, grid }) {
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
              <BookOpen size={18} className="text-emerald-400" />
              <span className="font-medium">{item}</span>
            </div>
          </button>
        ))}
      </div>

    </section>
  );
}

/* ===================== MODULE CONTENT ===================== */

function ModuleContent({
  module,
  dept,
  course,
  onComplete,
}) {
  return (
    <section className="max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-semibold">
            {module.title}
          </h2>
          <p className="text-sm text-slate-400">
            {dept} → {course}
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

      {/* MODULE VIDEO */}
      <Card title="Module Video">
        <iframe
          className="w-full h-[380px] rounded-lg"
          src={MODULE_VIDEO_URL}
          allowFullScreen
        />
      </Card>

      {/* ACTIVITY IMAGE */}
      <Card title="Activity Demonstration">
        <img
          src={ACTIVITY_IMAGE}
          alt="Activity"
          className="w-full h-[380px] object-cover rounded-lg"
        />
      </Card>

      {/* QUIZ */}
      <Card title="Quiz">
        <ul className="space-y-2 text-sm text-slate-300">
          <li>1. What safety precautions must be followed?</li>
          <li>2. Define the main operational procedure.</li>
          <li>3. Explain the tools used.</li>
        </ul>
      </Card>

      {/* PROJECT VIDEO */}
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

/* ===================== CARD ===================== */

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

/* ===================== UPLOAD MODAL ===================== */

function UploadModal({ onClose }) {
  const [classImage, setClassImage] = useState(null);
  const [activityImage, setActivityImage] = useState(null);
  const [projectImage, setProjectImage] = useState(null);

  const isValid =
    classImage && activityImage && projectImage;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">

      <div className="bg-[#020617] border border-slate-800 rounded-2xl p-6 w-full max-w-2xl">

        <h3 className="text-xl font-semibold mb-1">
          Upload Completion Evidence
        </h3>

        <p className="text-sm text-slate-400 mb-6">
          Upload training proof to complete module
        </p>

        <div className="grid md:grid-cols-3 gap-4">

          <UploadCard label="Class Image" setFile={setClassImage} />
          <UploadCard label="Activity Image" setFile={setActivityImage} />
          <UploadCard label="Project Image" setFile={setProjectImage} />

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

/* ===================== UPLOAD CARD ===================== */

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
          onChange={(e) => handleChange(e.target.files[0])}
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
