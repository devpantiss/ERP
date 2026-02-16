import { useState } from "react";
import {
  FlaskConical,
  Upload,
  Eye,
  Image,
  Camera,
} from "lucide-react";

/* ===================== CONFIG ===================== */

const LAB_TYPES = [
  "Electrical Lab",
  "Welding Lab",
  "Solar Lab",
];

const MODULES = [
  "Module 1",
  "Module 2",
  "Module 3",
];

const BATCHES = [
  "Batch A",
  "Batch B",
  "Batch C",
];

/* ===================== MAIN ===================== */

export default function TrainerLabERP() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const [form, setForm] = useState({
    lab: "",
    module: "",
    batch: "",
    students: "",
    equipment: "",
    outcome: "",
    labImages: [],
    activityImages: [],
    selfie: [],
  });

  const handleChange = (key, value) =>
    setForm({ ...form, [key]: value });

  const handleImages = (key, files) => {
    const previews = Array.from(files).map((f) =>
      URL.createObjectURL(f)
    );

    setForm({
      ...form,
      [key]: previews,
    });
  };

  const handleSubmit = () => {
    const newSession = {
      ...form,
      id: Date.now(),
    };

    setSessions([newSession, ...sessions]);
  };

  return (
    <div className="p-8 bg-[#020617] min-h-screen text-slate-200 space-y-6">

      <h1 className="text-2xl font-semibold">
        Lab Activity ERP
      </h1>

      <Form
        form={form}
        handleChange={handleChange}
        handleImages={handleImages}
        onSubmit={handleSubmit}
      />

      <Table sessions={sessions} onView={setSelectedSession} />

      {selectedSession && (
        <Modal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}

    </div>
  );
}

/* ===================== FORM ===================== */

function Form({ form, handleChange, handleImages, onSubmit }) {
  return (
    <div className="bg-[#020617]/60 border border-slate-800 rounded-xl p-6 space-y-6">

      <h3 className="text-lg font-semibold">
        Conduct Lab Session
      </h3>

      {/* DROPDOWNS */}
      <div className="grid md:grid-cols-3 gap-4">

        <Select
          label="Lab Type"
          options={LAB_TYPES}
          value={form.lab}
          onChange={(v) => handleChange("lab", v)}
        />

        <Select
          label="Module"
          options={MODULES}
          value={form.module}
          onChange={(v) => handleChange("module", v)}
        />

        <Select
          label="Batch"
          options={BATCHES}
          value={form.batch}
          onChange={(v) => handleChange("batch", v)}
        />

      </div>

      <div className="grid md:grid-cols-2 gap-4">

        <Input
          label="Students Present"
          value={form.students}
          onChange={(v) => handleChange("students", v)}
        />

        <Input
          label="Equipment Used"
          value={form.equipment}
          onChange={(v) => handleChange("equipment", v)}
        />

      </div>

      <Input
        label="Learning Outcome"
        value={form.outcome}
        onChange={(v) => handleChange("outcome", v)}
      />

      {/* IMAGE UPLOADS */}
      <div className="grid md:grid-cols-3 gap-4">

        <UploadCard
          label="Lab Photos"
          icon={<Image />}
          images={form.labImages}
          onUpload={(files) => handleImages("labImages", files)}
        />

        <UploadCard
          label="Activity Photos"
          icon={<Image />}
          images={form.activityImages}
          onUpload={(files) => handleImages("activityImages", files)}
        />

        <UploadCard
          label="Trainer Selfie"
          icon={<Camera />}
          images={form.selfie}
          onUpload={(files) => handleImages("selfie", files)}
        />

      </div>

      <button
        onClick={onSubmit}
        className="px-6 py-2 bg-emerald-500 text-black rounded-md font-medium"
      >
        Submit Session
      </button>

    </div>
  );
}

/* ===================== UPLOAD CARD ===================== */

function UploadCard({ label, icon, images, onUpload }) {
  return (
    <div>

      <p className="text-xs text-slate-400 mb-1">
        {label}
      </p>

      <label className="relative cursor-pointer group">

        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />

        <div className="h-36 rounded-xl border border-dashed border-slate-700 bg-[#020617]/60 flex items-center justify-center overflow-hidden group-hover:border-emerald-400 transition">

          {images.length === 0 && (
            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-emerald-400">

              {icon}
              <span className="text-xs">
                Click to Upload
              </span>

            </div>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-1 w-full h-full p-1">
              {images.slice(0, 4).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="w-full h-full object-cover rounded"
                />
              ))}
            </div>
          )}

        </div>

      </label>

    </div>
  );
}

/* ===================== TABLE ===================== */

function Table({ sessions, onView }) {
  return (
    <div className="bg-[#020617]/60 border border-slate-800 rounded-xl p-6">

      <h3 className="text-lg font-semibold mb-4">
        Session History
      </h3>

      <table className="w-full text-sm">

        <thead className="text-slate-400 border-b border-slate-700">
          <tr>
            <th>Lab</th>
            <th>Module</th>
            <th>Batch</th>
            <th>Images</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-b border-slate-800">

              <td>{s.lab}</td>
              <td>{s.module}</td>
              <td>{s.batch}</td>

              <td>
                <div className="flex gap-1">

                  {[...s.labImages, ...s.activityImages, ...s.selfie]
                    .slice(0, 3)
                    .map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className="w-10 h-10 rounded object-cover border border-slate-700"
                      />
                    ))}

                </div>
              </td>

              <td>
                <button
                  onClick={() => onView(s)}
                  className="text-emerald-400"
                >
                  <Eye size={16} />
                </button>
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

/* ===================== MODAL ===================== */

function Modal({ session, onClose }) {
  const allImages = [
    ...session.labImages,
    ...session.activityImages,
    ...session.selfie,
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

      <div className="bg-[#020617] border border-slate-800 rounded-xl p-6 w-full max-w-2xl">

        <h3 className="text-lg font-semibold mb-4">
          Session Preview
        </h3>

        <div className="grid grid-cols-3 gap-2">

          {allImages.map((img, i) => (
            <img
              key={i}
              src={img}
              className="w-full h-32 object-cover rounded"
            />
          ))}

        </div>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-slate-700 rounded-md"
        >
          Close
        </button>

      </div>

    </div>
  );
}

/* ===================== INPUT ===================== */

function Input({ label, value, onChange }) {
  return (
    <div>

      <label className="text-xs text-slate-400">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-md bg-[#020617] border border-slate-700"
      />

    </div>
  );
}

function Select({ label, options, value, onChange }) {
  return (
    <div>

      <label className="text-xs text-slate-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-md bg-[#020617] border border-slate-700"
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>

    </div>
  );
}
