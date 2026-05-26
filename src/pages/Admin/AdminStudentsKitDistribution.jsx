import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Image,
  PackageCheck,
  Search,
  Shield,
  Shirt,
  TriangleAlert,
} from "lucide-react";
import TableExportActions from "../../components/common/TableExportActions";

const STUDENTS = Array.from({ length: 18 }, (_, i) => {
  const issued = {
    safetyKit: i % 5 !== 1,
    shoes: i % 4 !== 2,
    uniform: i % 6 !== 3,
    trainingKit: i % 3 !== 1,
  };
  const issuedCount = Object.values(issued).filter(Boolean).length;

  return {
    id: `KIT-${String(i + 1).padStart(3, "0")}`,
    name: `Student ${i + 1}`,
    enrollmentId: `ENR-2026-${1200 + i}`,
    project: ["PMKVY 4.0", "CSR - Tata Steel", "DDUGKY", "DMF Keonjhar"][i % 4],
    center: ["Angul", "Jajpur", "Kalahandi", "Keonjhar"][i % 4],
    batch: `BATCH-${101 + (i % 5)}`,
    issueDate: issuedCount ? `2026-05-${String((i % 18) + 1).padStart(2, "0")}` : "-",
    size: ["S", "M", "L", "XL"][i % 4],
    issued,
    proofImage: "",
    proofImageName: "",
  };
});

const KIT_ITEMS = [
  { key: "safetyKit", label: "Safety Kit", icon: Shield },
  { key: "shoes", label: "Shoes", icon: PackageCheck },
  { key: "uniform", label: "Uniform", icon: Shirt },
  { key: "trainingKit", label: "Training Kit", icon: PackageCheck },
];

function getStatus(student) {
  const issuedCount = KIT_ITEMS.filter((item) => student.issued[item.key]).length;
  if (issuedCount === KIT_ITEMS.length) return "Completed";
  if (issuedCount === 0) return "Pending";
  return "Partial";
}

function StatusPill({ status }) {
  const styles = {
    Completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    Partial: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    Pending: "border-slate-500/25 bg-slate-500/10 text-slate-300",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function AdminStudentsKitDistribution() {
  const [students, setStudents] = useState(STUDENTS);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [centerFilter, setCenterFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const projects = useMemo(() => ["All", ...new Set(students.map((student) => student.project))], [students]);
  const centers = useMemo(() => ["All", ...new Set(students.map((student) => student.center))], [students]);
  const batches = useMemo(() => ["All", ...new Set(students.map((student) => student.batch))], [students]);

  const filteredStudents = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return students.filter((student) => {
      const status = getStatus(student);
      const searchable = [
        student.name,
        student.enrollmentId,
        student.project,
        student.center,
        student.batch,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!needle || searchable.includes(needle)) &&
        (projectFilter === "All" || student.project === projectFilter) &&
        (centerFilter === "All" || student.center === centerFilter) &&
        (batchFilter === "All" || student.batch === batchFilter) &&
        (statusFilter === "All" || status === statusFilter)
      );
    });
  }, [batchFilter, centerFilter, projectFilter, search, statusFilter, students]);

  const stats = useMemo(() => {
    const completed = students.filter((student) => getStatus(student) === "Completed").length;
    const partial = students.filter((student) => getStatus(student) === "Partial").length;
    const pending = students.filter((student) => getStatus(student) === "Pending").length;

    return { total: students.length, completed, partial, pending };
  }, [students]);

  const toggleKitItem = (studentId, itemKey) => {
    setStudents((current) =>
      current.map((student) => {
        if (student.id !== studentId) return student;
        const issued = { ...student.issued, [itemKey]: !student.issued[itemKey] };
        const issuedCount = Object.values(issued).filter(Boolean).length;

        return {
          ...student,
          issued,
          issueDate: issuedCount ? (student.issueDate === "-" ? new Date().toISOString().split("T")[0] : student.issueDate) : "-",
        };
      })
    );
  };

  const uploadProofImage = (studentId, file) => {
    if (!file) return;
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId
          ? {
              ...student,
              proofImage: URL.createObjectURL(file),
              proofImageName: file.name,
            }
          : student
      )
    );
  };

  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Student" },
      { key: "enrollmentId", header: "Enrollment ID" },
      { key: "project", header: "Project" },
      { key: "center", header: "Center" },
      { key: "batch", header: "Batch" },
      { key: "size", header: "Kit Size" },
      {
        key: "safetyKit",
        header: "Safety Kit",
        exportValue: (student) => (student.issued.safetyKit ? "Issued" : "Pending"),
      },
      {
        key: "shoes",
        header: "Shoes",
        exportValue: (student) => (student.issued.shoes ? "Issued" : "Pending"),
      },
      {
        key: "uniform",
        header: "Uniform",
        exportValue: (student) => (student.issued.uniform ? "Issued" : "Pending"),
      },
      {
        key: "trainingKit",
        header: "Training Kit",
        exportValue: (student) => (student.issued.trainingKit ? "Issued" : "Pending"),
      },
      {
        key: "issuedItems",
        header: "Issued Items",
        exportValue: (student) =>
          KIT_ITEMS.filter((item) => student.issued[item.key]).map((item) => item.label).join(", ") || "None",
      },
      { key: "issueDate", header: "Issue Date" },
      { key: "proofImageName", header: "Proof Image", exportValue: (student) => student.proofImageName || "Not uploaded" },
      {
        key: "status",
        header: "Status",
        exportValue: getStatus,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Students Kit Distribution</h1>
          <p className="mt-1 text-sm text-white/60">
            Enter kit issue status and upload handover proof images project-wise.
          </p>
        </div>
        <TableExportActions
          columns={exportColumns}
          rows={filteredStudents}
          moduleName="Students Kit Distribution"
          fileName="students_kit_distribution"
          canExport
          company={{
            name: "Pantiss ERP",
            logo: "/activity.png",
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Students", value: stats.total, icon: PackageCheck, cls: "text-slate-100" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, cls: "text-emerald-300" },
          { label: "Partial", value: stats.partial, icon: TriangleAlert, cls: "text-amber-300" },
          { label: "Pending", value: stats.pending, icon: Clock, cls: "text-slate-300" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-slate-700 bg-[#111827] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-white/60">{stat.label}</p>
                <Icon size={17} className={stat.cls} />
              </div>
              <p className={`mt-2 text-2xl font-semibold ${stat.cls}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[260px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student, enrollment ID, project..."
            className="w-full rounded-lg border border-slate-700 bg-[#111827] py-2 pl-10 pr-3 text-sm text-white/90 outline-none transition focus:border-violet-400"
          />
        </label>
        <select
          value={projectFilter}
          onChange={(event) => setProjectFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-sm text-white/90 outline-none"
        >
          {projects.map((project) => (
            <option key={project} value={project}>
              {project === "All" ? "All Projects" : project}
            </option>
          ))}
        </select>
        <select
          value={centerFilter}
          onChange={(event) => setCenterFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-sm text-white/90 outline-none"
        >
          {centers.map((center) => (
            <option key={center} value={center}>
              {center === "All" ? "All Centers" : center}
            </option>
          ))}
        </select>
        <select
          value={batchFilter}
          onChange={(event) => setBatchFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-sm text-white/90 outline-none"
        >
          {batches.map((batch) => (
            <option key={batch} value={batch}>
              {batch === "All" ? "All Batches" : batch}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-sm text-white/90 outline-none"
        >
          <option>All</option>
          <option>Completed</option>
          <option>Partial</option>
          <option>Pending</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1260px] text-sm">
            <thead className="bg-[#0b1220] text-white/60">
              <tr>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">Project / Center</th>
                <th className="p-4 text-left">Batch</th>
                {KIT_ITEMS.map((item) => (
                  <th key={item.key} className="p-4 text-left">{item.label}</th>
                ))}
                <th className="p-4 text-left">Issue Date</th>
                <th className="p-4 text-left">Proof Image</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-t border-slate-700/50 transition hover:bg-white/[0.02]">
                  <td className="p-4">
                    <p className="font-medium text-white/90">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.enrollmentId}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-white/80">{student.project}</p>
                    <p className="text-xs text-slate-500">{student.center}</p>
                  </td>
                  <td className="p-4 text-white/70">{student.batch}</td>
                  {KIT_ITEMS.map((item) => (
                    <td key={item.key} className="p-4">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={student.issued[item.key]}
                          onChange={() => toggleKitItem(student.id, item.key)}
                          className="h-4 w-4 rounded border-slate-600 bg-[#0b1220] accent-violet-500"
                        />
                        <span className={student.issued[item.key] ? "text-emerald-300" : "text-slate-500"}>
                          {student.issued[item.key] ? "Issued" : "Pending"}
                        </span>
                      </label>
                    </td>
                  ))}
                  <td className="p-4 text-white/70">{student.issueDate}</td>
                  <td className="p-4">
                    <ProofUploadCell student={student} onUpload={uploadProofImage} />
                  </td>
                  <td className="p-4"><StatusPill status={getStatus(student)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProofUploadCell({ student, onUpload }) {
  return (
    <div className="min-w-44">
      {student.proofImage ? (
        <div className="flex items-center gap-3">
          <img
            src={student.proofImage}
            alt=""
            className="h-12 w-12 rounded-lg border border-slate-700 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white/80">{student.proofImageName}</p>
            <label className="mt-1 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-violet-200 hover:text-violet-100">
              Replace
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => onUpload(student.id, event.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      ) : (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15">
          <Image size={14} />
          Upload Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => onUpload(student.id, event.target.files?.[0])}
          />
        </label>
      )}
    </div>
  );
}
