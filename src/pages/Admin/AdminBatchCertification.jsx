import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Award, Eye, FileText, Filter, Search, Upload, X } from "lucide-react";
import { SA_PROJECTS } from "../SuperAdmin/superAdminData";

const certificationStatuses = ["Pending", "Certified", "Failed"];

function seedBatches() {
  return SA_PROJECTS.flatMap((project) =>
    project.centers.flatMap((center) =>
      center.batches.map((batch) => ({
        project: project.name,
        center: center.name,
        id: batch.id,
        label: batch.label,
        jobRole: batch.jobRole,
        trainer: batch.trainer,
        students: batch.candidates.map((candidate, index) => ({
          ...candidate,
          certificateId:
            candidate.moduleCompletion >= 80 && candidate.attendance >= 75
              ? `CERT-${batch.id}-${String(index + 1).padStart(3, "0")}`
              : "",
          certificationStatus:
            candidate.moduleCompletion >= 85 && candidate.attendance >= 80
              ? "Certified"
              : "Pending",
          certifiedOn: candidate.moduleCompletion >= 85 && candidate.attendance >= 80 ? "2026-04-18" : "",
          certificateFile: null,
        })),
      }))
    )
  );
}

export default function AdminBatchCertification() {
  const [batches, setBatches] = useState(seedBatches);
  const [selectedBatchId, setSelectedBatchId] = useState(seedBatches()[0]?.id || "");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [previewCertificate, setPreviewCertificate] = useState(null);

  const selectedBatch = batches.find((batch) => batch.id === selectedBatchId) || batches[0];
  const batchOptions = batches.map((batch) => ({
    value: batch.id,
    label: `${batch.project} / ${batch.center} / ${batch.label}`,
  }));

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!selectedBatch) return [];

    return selectedBatch.students.filter((student) => {
      const matchesStatus = statusFilter === "All" || student.certificationStatus === statusFilter;
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query) ||
        student.course.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [search, selectedBatch, statusFilter]);

  const summary = useMemo(() => {
    const students = selectedBatch?.students || [];
    return certificationStatuses.reduce(
      (acc, status) => ({
        ...acc,
        [status]: students.filter((student) => student.certificationStatus === status).length,
      }),
      { total: students.length }
    );
  }, [selectedBatch]);

  const updateStudentCertification = (studentId, field, value) => {
    setBatches((current) =>
      current.map((batch) => {
        if (batch.id !== selectedBatch.id) return batch;

        return {
          ...batch,
          students: batch.students.map((student) => {
            if (student.id !== studentId) return student;
            const nextStudent = { ...student, [field]: value };

            if (field === "certificationStatus" && value === "Certified" && !nextStudent.certifiedOn) {
              nextStudent.certifiedOn = new Date().toISOString().split("T")[0];
            }
            if (field === "certificationStatus" && value !== "Certified") {
              nextStudent.certificateId = "";
              nextStudent.certifiedOn = "";
              nextStudent.certificateFile = null;
            }

            return nextStudent;
          }),
        };
      })
    );
  };

  const uploadCertificate = (studentId, file) => {
    if (!file) return;

    const certificateFile = {
      name: file.name,
      type: file.type || "application/octet-stream",
      url: URL.createObjectURL(file),
      uploadedOn: new Date().toISOString().split("T")[0],
    };

    updateStudentCertification(studentId, "certificateFile", certificateFile);
  };

  if (!selectedBatch) {
    return (
      <section className="rounded-2xl border border-slate-700 bg-[#111827] p-8 text-white">
        No batches available for certification updates.
      </section>
    );
  }

  return (
    <section className="space-y-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10 text-violet-300">
              <Award size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-100">Batch Certification</h1>
              <p className="mt-1 text-sm text-white/55">
                Update student certification status batch-wise after assessment verification.
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[420px]">
          <SummaryCard label="Students" value={summary.total} />
          <SummaryCard label="Pending" value={summary.Pending || 0} tone="text-amber-300" />
          <SummaryCard label="Certified" value={summary.Certified || 0} tone="text-emerald-300" />
        </div>
      </div>

      <section className="rounded-2xl border border-slate-700 bg-[#111827] p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(320px,1fr)_180px_minmax(240px,0.7fr)] lg:items-end">
          <SelectField
            label="Project / Center / Batch"
            value={selectedBatch.id}
            onChange={(value) => {
              setSelectedBatchId(value);
              setStatusFilter("All");
              setSearch("");
            }}
            options={batchOptions}
          />
          <SelectField
            label="Certification Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={["All", ...certificationStatuses].map((status) => ({ value: status, label: status }))}
          />
          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
              Search Student
            </span>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, ID, or course"
                className="w-full rounded-xl border border-slate-700 bg-[#0b1220] py-3 pl-10 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60"
              />
            </div>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-700 bg-[#111827]">
        <div className="flex flex-col gap-3 border-b border-slate-700/70 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-300">{selectedBatch.project}</p>
            <h2 className="mt-1 text-lg font-black text-white">
              {selectedBatch.center} · {selectedBatch.label}
            </h2>
            <p className="mt-1 text-xs font-bold text-white/45">
              {selectedBatch.jobRole} · Trainer: {selectedBatch.trainer}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-black text-white/60">
            <Filter size={14} className="text-violet-300" />
            {filteredStudents.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ minWidth: 1420 }}>
            <thead className="bg-[#0b1220] text-xs font-black uppercase tracking-[0.14em] text-white/45">
              <tr>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Course</th>
                <th className="px-5 py-4">Attendance</th>
                <th className="px-5 py-4">Module</th>
                <th className="px-5 py-4">Training Status</th>
                <th className="px-5 py-4">Certification Status</th>
                <th className="px-5 py-4">Certificate ID</th>
                <th className="px-5 py-4">Certified On</th>
                <th className="px-5 py-4">Certificate Upload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <p className="font-black text-white">{student.name}</p>
                    <p className="mt-1 font-mono text-xs text-white/40">{student.id}</p>
                  </td>
                  <td className="px-5 py-4 text-white/70">{student.course}</td>
                  <td className="px-5 py-4">
                    <ProgressValue value={student.attendance} />
                  </td>
                  <td className="px-5 py-4">
                    <ProgressValue value={student.moduleCompletion} />
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-slate-700 bg-[#0b1220] px-2.5 py-1 text-xs font-black text-white/65">
                      {student.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={student.certificationStatus}
                      onChange={(event) => updateStudentCertification(student.id, "certificationStatus", event.target.value)}
                      className="w-full min-w-36 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-xs font-black text-white outline-none transition focus:border-violet-400/60"
                    >
                      {certificationStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <input
                      value={student.certificateId}
                      onChange={(event) => updateStudentCertification(student.id, "certificateId", event.target.value)}
                      disabled={student.certificationStatus !== "Certified"}
                      placeholder="Certificate no."
                      className="w-full min-w-40 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-xs font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 disabled:cursor-not-allowed disabled:opacity-45"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <input
                      type="date"
                      value={student.certifiedOn}
                      onChange={(event) => updateStudentCertification(student.id, "certifiedOn", event.target.value)}
                      disabled={student.certificationStatus !== "Certified"}
                      className="w-full min-w-36 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-xs font-bold text-white outline-none transition focus:border-violet-400/60 disabled:cursor-not-allowed disabled:opacity-45"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <CertificateUploadCell
                      student={student}
                      onUpload={uploadCertificate}
                      onPreview={(certificate) => setPreviewCertificate({ ...certificate, student })}
                    />
                  </td>
                </tr>
              ))}
              {!filteredStudents.length && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm font-bold text-white/45">
                    No students match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {previewCertificate && (
        <CertificatePreviewOverlay certificate={previewCertificate} onClose={() => setPreviewCertificate(null)} />
      )}
    </section>
  );
}

function CertificateUploadCell({ student, onUpload, onPreview }) {
  const disabled = student.certificationStatus !== "Certified";

  return (
    <div className="min-w-56">
      {student.certificateFile ? (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
          <div className="flex items-start gap-2">
            <FileText size={16} className="mt-0.5 shrink-0 text-emerald-300" />
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-white">{student.certificateFile.name}</p>
              <p className="mt-1 text-[11px] font-bold text-emerald-200/75">
                Uploaded {student.certificateFile.uploadedOn}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onPreview(student.certificateFile)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/20 px-3 py-2 text-xs font-black text-emerald-200 transition hover:bg-emerald-500/15"
            >
              <Eye size={13} />
              Preview
            </button>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-black text-white/70 transition hover:border-white/20 hover:text-white">
              <Upload size={13} />
              Replace
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(event) => onUpload(student.id, event.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      ) : (
        <label
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black transition ${
            disabled
              ? "cursor-not-allowed border-slate-700 bg-[#0b1220] text-white/30"
              : "cursor-pointer border-violet-400/25 bg-violet-500/10 text-violet-200 hover:bg-violet-500/15"
          }`}
        >
          <Upload size={14} />
          Upload Certificate
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={disabled}
            className="hidden"
            onChange={(event) => onUpload(student.id, event.target.files?.[0])}
          />
        </label>
      )}
      {disabled && <p className="mt-2 text-[11px] font-bold text-white/35">Available after status is Certified.</p>}
    </div>
  );
}

function CertificatePreviewOverlay({ certificate, onClose }) {
  const isImage = certificate.type?.startsWith("image/");

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/60" onMouseDown={onClose}>
      <aside
        className="h-full w-full max-w-4xl overflow-y-auto border-l border-slate-700 bg-[#111827] p-6 shadow-2xl shadow-black/70"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-700/70 pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-300">Certificate Preview</p>
            <h2 className="mt-1 text-2xl font-black text-white">{certificate.student.name}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">{certificate.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close certificate preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#0b1220] p-4">
          {isImage ? (
            <img src={certificate.url} alt={certificate.name} className="max-h-[72vh] w-full rounded-xl object-contain" />
          ) : (
            <iframe title={certificate.name} src={certificate.url} className="h-[72vh] w-full rounded-xl border border-slate-700 bg-white" />
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
}

function SummaryCard({ label, value, tone = "text-white" }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#111827] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className={`mt-1 text-xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

function ProgressValue({ value }) {
  const tone = value >= 85 ? "bg-emerald-400" : value >= 70 ? "bg-sky-400" : "bg-amber-400";
  return (
    <div className="min-w-28">
      <p className="font-black text-white">{value}%</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-violet-400/60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
