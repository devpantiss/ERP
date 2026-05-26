import { useEffect, useState, useMemo } from "react";
import { UserCog, Search, Plus, X, Save, Calendar, Target } from "lucide-react";
import { toast } from "react-toastify";
import { ProjectCard, BackButton, PageHeader, Breadcrumb, usePagination, Pagination } from "./SuperAdminSharedComponents";
import { useEmployeeStore } from "../../stores/employeeStore.js";
import { useProjectStore } from "../../stores/projectStore.js";
import {
  getRoleIdByLabel,
  selectEmployeeDirectory,
} from "../../stores/selectors/employeeSelectors.js";
import { selectProjectDirectory } from "../../stores/selectors/projectSelectors.js";

const STATUS_BADGE = {
  Active: "bg-emerald-500/10 text-emerald-400",
  "On Leave": "bg-amber-500/10 text-amber-400",
  Inactive: "bg-red-500/10 text-red-400",
};

const ROLES = ["Trainer", "Mobilizer", "Placement Officer", "Center Manager"];
const MONTHS = ["2026-04", "2026-03", "2026-02", "2026-01"];
const TARGET_FIELDS_BY_ROLE = {
  Trainer: ["Training Hours", "Exposure Visits"],
  Mobilizer: ["Enrolled", "Community Drives"],
  "Placement Officer": ["Placed Candidates", "Placement Drives Conducted"],
};
const DEFAULT_TARGET_FIELDS = ["Target 1", "Target 2"];

function getTargetLabels(role) {
  return TARGET_FIELDS_BY_ROLE[role] || DEFAULT_TARGET_FIELDS;
}

export default function SuperAdminEmployeeManagement() {
  const { records: employeeRecords, fetchWithAssignments, create: createEmployee } = useEmployeeStore();
  const { records: projectRecords, fetchAll: fetchProjects } = useProjectStore();
  const [projectId, setProjectId] = useState(null);
  const [search, setSearch] = useState("");
  const [targets, setTargets] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(null); // empId
  const [selectedMonth, setSelectedMonth] = useState("2026-04");

  useEffect(() => {
    fetchWithAssignments();
    fetchProjects();
  }, [fetchProjects, fetchWithAssignments]);

  const employees = useMemo(() => selectEmployeeDirectory(employeeRecords), [employeeRecords]);
  const projects = useMemo(() => selectProjectDirectory(projectRecords), [projectRecords]);
  const project = projects.find((p) => p.id === projectId);

  const projectEmployees = useMemo(() => {
    if (!project) return [];
    let list = employees.filter((e) => e.projectId === project.id);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.center.toLowerCase().includes(q));
    }
    return list;
  }, [project, employees, search]);

  const pg = usePagination(projectEmployees);

  const breadcrumb = ["All Projects"];
  if (project) breadcrumb.push(project.name);

  /* ── Add Employee ── */
  const [form, setForm] = useState({ name: "", role: ROLES[0], center: "", joinDate: "", phone: "", email: "" });

  const projectCenters = project ? project.centers : [];

  const handleAddEmployee = () => {
    if (!form.name || !form.center || !form.joinDate) {
      toast.error("Please fill all required fields");
      return;
    }
    const [firstName, ...rest] = form.name.trim().split(" ");
    const selectedCenter = projectCenters.find((center) => center.id === form.center);
    const roleId = getRoleIdByLabel(form.role);
    const newEmp = {
      firstName,
      lastName: rest.join(" ") || "",
      email: form.email,
      phone: form.phone,
      roleIds: roleId ? [roleId] : [],
      projectIds: [project.id],
      centerIds: selectedCenter ? [selectedCenter.id] : [],
      assignedBatchIds: [],
      designation: form.role,
      status: "ACTIVE",
      joinedOn: form.joinDate,
      managerEmployeeId: null,
    };
    createEmployee(newEmp);
    setShowAddModal(false);
    setForm({ name: "", role: ROLES[0], center: "", joinDate: "", phone: "", email: "" });
    toast.success(`${form.name} added successfully`);
  };

  /* ── Target helpers ── */
  const selectedTargetEmployee = showTargetModal
    ? employees.find((e) => e.id === showTargetModal)
    : null;
  const targetLabels = getTargetLabels(selectedTargetEmployee?.role);

  const empTargets = useMemo(() => {
    if (!showTargetModal) return [];
    return targets.filter((t) => t.empId === showTargetModal);
  }, [showTargetModal, targets]);

  const [editT1, setEditT1] = useState("");
  const [editT2, setEditT2] = useState("");

  const openTargetModal = (empId) => {
    setShowTargetModal(empId);
    const existing = targets.find((t) => t.empId === empId && t.month === selectedMonth);
    setEditT1(existing?.t1 ?? "");
    setEditT2(existing?.t2 ?? "");
  };

  const handleSaveTarget = () => {
    if (!selectedTargetEmployee) return;

    setTargets((prev) => {
      const without = prev.filter((t) => !(t.empId === showTargetModal && t.month === selectedMonth));
      return [
        ...without,
        {
          empId: showTargetModal,
          month: selectedMonth,
          role: selectedTargetEmployee.role,
          t1Label: targetLabels[0],
          t2Label: targetLabels[1],
          t1: Number(editT1) || 0,
          t2: Number(editT2) || 0,
        },
      ];
    });
    toast.success(`${selectedTargetEmployee.name}'s target saved`);
  };

  const getEmployeeTarget = (empId) => targets.find((t) => t.empId === empId && t.month === selectedMonth);

  return (
    <div className="space-y-6">
      <PageHeader icon={UserCog} title="Access & Target" subtitle="Project employee access, role mapping, and monthly targets." />
      <Breadcrumb items={breadcrumb} />

      {/* LEVEL 1: Projects */}
      {!project && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const empCount = employees.filter((e) => e.projectId === p.id).length;
            const activeCount = employees.filter((e) => e.projectId === p.id && e.status === "Active").length;
            return (
              <ProjectCard
                key={p.id}
                project={p}
                onClick={() => { setProjectId(p.id); setSearch(""); pg.setPage(1); }}
                stats={[
                  { label: "Employees", value: empCount },
                  { label: "Active", value: activeCount, color: "text-emerald-300" },
                  { label: "Centers", value: p.centerCount },
                ]}
              />
            );
          })}
        </div>
      )}

      {/* LEVEL 2: Employee Table */}
      {project && (
        <>
          <BackButton onClick={() => setProjectId(null)} label="Back to projects" />

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 backdrop-blur-sm">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 border-b border-white/[0.08] p-5 md:flex-row md:items-center md:justify-between">
              <p className="text-sm font-black text-white">{projectEmployees.length} employees</p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-xl border border-slate-700 bg-transparent/40 py-2.5 pl-9 pr-4 text-xs text-white/80 outline-none transition focus:border-red-500 w-56" />
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-500/20 transition hover:opacity-90">
                  <Plus size={14} /> Add Employee
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: 860 }}>
                <colgroup>
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "16%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#0b1220] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Center</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Joining Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Targets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pg.pageData.map((e) => (
                    <tr key={e.id} className="group transition hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-black text-white">{e.name.split(" ").map((n) => n[0]).join("")}</div>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-bold text-white/90">{e.name}</p>
                            <p className="text-[10px] font-mono text-red-500/60">{e.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-white/60">{e.center}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-black text-cyan-400">{e.role}</span>
                      </td>
                      <td className="px-5 py-3.5 text-[11px] font-bold text-slate-500">{e.joinDate}</td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_BADGE[e.status]}`}>{e.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {(() => {
                            const monthTarget = getEmployeeTarget(e.id);
                            const labels = getTargetLabels(e.role);
                            return monthTarget ? (
                              <div className="hidden min-w-0 text-right xl:block">
                                <p className="truncate text-[10px] font-bold text-white/70">
                                  {labels[0]}: <span className="text-white">{monthTarget.t1}</span>
                                </p>
                                <p className="truncate text-[10px] font-bold text-white/70">
                                  {labels[1]}: <span className="text-white">{monthTarget.t2}</span>
                                </p>
                              </div>
                            ) : (
                              <span className="hidden text-[10px] font-black uppercase tracking-widest text-slate-600 xl:inline">No target</span>
                            );
                          })()}
                          <button onClick={() => openTargetModal(e.id)} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-slate-700 opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                            Set Targets
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...pg} />
          </div>
        </>
      )}

      {/* ── Add Employee Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={() => setShowAddModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/50 bg-[#0f172a] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Add Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"><X size={18} /></button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: "Name *", key: "name", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone", key: "phone", type: "text" },
                { label: "Joining Date *", key: "joinDate", type: "date" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} className="w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none transition focus:border-red-500" />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">Role *</label>
                <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none transition focus:border-red-500">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">Center *</label>
                <select value={form.center} onChange={(e) => setForm((p) => ({ ...p, center: e.target.value }))} className="w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none transition focus:border-red-500">
                  <option value="">Select center</option>
                  {projectCenters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:text-white">Cancel</button>
              <button onClick={handleAddEmployee} className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400">
                <Plus size={14} /> Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Monthly Target Panel ── */}
      {showTargetModal && selectedTargetEmployee && (
        <div className="fixed inset-0 z-[9999] flex justify-end" onClick={() => setShowTargetModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className="relative ml-auto flex h-full w-full max-w-xl animate-in slide-in-from-right duration-200 flex-col border-l border-slate-700/70 bg-[#0f172a] shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Monthly Targets</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {selectedTargetEmployee.name} • {selectedTargetEmployee.role}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowTargetModal(null)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white" aria-label="Close target panel"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">Month</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        const existing = targets.find((t) => t.empId === showTargetModal && t.month === e.target.value);
                        setEditT1(existing?.t1 ?? "");
                        setEditT2(existing?.t2 ?? "");
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-[#111827] py-2.5 pl-9 pr-4 text-sm text-white outline-none transition focus:border-red-500"
                    >
                      {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">{targetLabels[0]}</label>
                    <input type="number" min="0" value={editT1} onChange={(e) => setEditT1(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition focus:border-red-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">{targetLabels[1]}</label>
                    <input type="number" min="0" value={editT2} onChange={(e) => setEditT2(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition focus:border-red-500" />
                  </div>
                </div>

                {empTargets.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">History</p>
                    <div className="space-y-2">
                      {empTargets.map((t) => {
                        const labels = [t.t1Label || targetLabels[0], t.t2Label || targetLabels[1]];
                        return (
                          <button
                            type="button"
                            key={t.month}
                            onClick={() => {
                              setSelectedMonth(t.month);
                              setEditT1(t.t1 ?? "");
                              setEditT2(t.t2 ?? "");
                            }}
                            className={`w-full rounded-xl border px-4 py-3 text-left text-xs transition ${t.month === selectedMonth ? "border-red-500/30 bg-red-500/5" : "border-slate-700/50 bg-[#111827] hover:border-slate-600"}`}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className="font-black text-white/90">{t.month}</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{selectedTargetEmployee.role}</span>
                            </div>
                            <div className="grid gap-1 text-slate-400">
                              <span>{labels[0]}: <span className="font-black text-white">{t.t1}</span></span>
                              <span>{labels[1]}: <span className="font-black text-white">{t.t2}</span></span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-white/[0.08] bg-[#0f172a] px-6 py-4">
              <button onClick={() => setShowTargetModal(null)} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:text-white">Cancel</button>
              <button onClick={handleSaveTarget} className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400">
                <Save size={14} /> Save Target
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
