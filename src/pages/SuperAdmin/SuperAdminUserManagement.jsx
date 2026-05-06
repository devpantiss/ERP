import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Users, Search, Plus, Shield, GraduationCap, Briefcase, UserCog,
  Mail, Phone, Building2, CheckCircle2, X, Save, KeyRound, RefreshCcw,
  Send, FolderKanban, MapPin
} from "lucide-react";
import { usePagination, Pagination } from "./SuperAdminSharedComponents";
import { SA_PROJECTS } from "./superAdminData";
import { ALL_USERS } from "./superAdminUsers";

const ROLE_TABS = ["All", "Admin", "Trainer", "Mobilizer", "Placement Officer"];
const EMPLOYEE_ROLES = ["Admin", "Trainer", "Mobilizer", "Placement Officer"];
const ROLE_PREFIX = {
  Admin: "ADM",
  Trainer: "TRN",
  Mobilizer: "MOB",
  "Placement Officer": "PLC",
};

const TRAINER_TRAITS = [
  "Electrical",
  "HEMM",
  "Dumper Operator",
  "Fitter",
  "Welder",
  "Solar Technician",
  "Retail Sales",
  "Data Entry",
  "Healthcare",
  "Construction",
];

const CENTER_OPTIONS = Array.from(
  new Set(SA_PROJECTS.flatMap((project) => project.centers.map((center) => center.name)))
).sort();

const PROJECT_CENTER_MAP = SA_PROJECTS.reduce((acc, project) => {
  acc[project.name] = project.centers.map((center) => center.name);
  return acc;
}, {});

const PROJECT_OPTIONS = Array.from(
  new Set([
    ...SA_PROJECTS.map((project) => project.name),
    ...ALL_USERS.flatMap((user) => user.projects || []),
  ])
);

const ROLE_BADGE = {
  Admin: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Trainer: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Mobilizer: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Placement Officer": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

const STATUS_BADGE = {
  Active: "bg-emerald-500/10 text-emerald-400",
  "On Leave": "bg-amber-500/10 text-amber-500",
  Inactive: "bg-red-500/10 text-red-400",
};

const EMPTY_EMPLOYEE_FORM = {
  name: "",
  role: "Admin",
  email: "",
  phone: "",
};

const inputClass = "w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-white/90 outline-none transition focus:border-red-500";
const selectClass = `${inputClass} cursor-pointer`;

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3);
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let value = "PS@";
  for (let i = 0; i < 8; i += 1) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }
  return value;
}

function generateUserId(role, users) {
  const prefix = `PSU-${ROLE_PREFIX[role] || "USR"}`;
  const maxId = users.reduce((max, user) => {
    if (!String(user.id).startsWith(prefix)) return max;
    const num = Number(String(user.id).split("-").pop());
    return Number.isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `${prefix}-${String(maxId + 1).padStart(3, "0")}`;
}

function inferProjects(user) {
  if (Array.isArray(user.projects) && user.projects.length > 0) return user.projects;
  const matched = SA_PROJECTS.filter((project) =>
    project.centers.some((center) => center.name === user.center)
  ).map((project) => project.name);
  return matched.length > 0 ? [matched[0]] : [];
}

function normalizeUser(user) {
  const projectAssignments = user.projectAssignments || inferProjects(user);
  const centerAssignments = user.centerAssignments || (user.center ? [user.center] : []);
  return {
    ...user,
    projectAssignments,
    centerAssignments,
    loginId: user.loginId || user.id,
    password: user.password || "",
    trait: user.role === "Trainer" ? user.trait || user.department || "" : user.trait || "",
    credentialsSent: Boolean(user.credentialsSent),
  };
}

function getCentersForProjects(projects) {
  const centers = projects.flatMap((project) => PROJECT_CENTER_MAP[project] || CENTER_OPTIONS);
  return Array.from(new Set(centers)).sort();
}

function ModalField({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ===================== COMPONENT ===================== */

export default function SuperAdminUserManagement() {
  const [users, setUsers] = useState(() => ALL_USERS.map(normalizeUser));
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [employeeForm, setEmployeeForm] = useState(EMPTY_EMPLOYEE_FORM);
  const [assignmentDraft, setAssignmentDraft] = useState(null);

  const filtered = useMemo(() => users.filter((u) => {
    const matchTab = activeTab === "All" || u.role === activeTab;
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.projectAssignments.join(" ").toLowerCase().includes(q);
    return matchTab && matchSearch;
  }), [activeTab, search, users]);

  const pg = usePagination(filtered);

  const roleStats = useMemo(() => ([
    { label: "Admins", role: "Admin", icon: Shield, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Trainers", role: "Trainer", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Mobilizers", role: "Mobilizer", icon: UserCog, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Placement Officers", role: "Placement Officer", icon: Briefcase, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  ].map((item) => ({
    ...item,
    count: users.filter((user) => user.role === item.role).length,
  }))), [users]);

  const selectedAssignmentUser = assignmentDraft
    ? users.find((user) => user.id === assignmentDraft.userId)
    : null;
  const availableCenters = assignmentDraft
    ? getCentersForProjects(assignmentDraft.projects)
    : CENTER_OPTIONS;

  const updateEmployeeForm = (key, value) => {
    setEmployeeForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateEmployee = () => {
    const trimmed = {
      name: employeeForm.name.trim(),
      role: employeeForm.role,
      email: employeeForm.email.trim(),
      phone: employeeForm.phone.trim(),
    };

    if (!trimmed.name || !trimmed.role || !trimmed.email || !trimmed.phone) {
      toast.error("Please fill name, role, email and phone number");
      return;
    }

    const id = generateUserId(trimmed.role, users);
    const newUser = normalizeUser({
      id,
      ...trimmed,
      center: "",
      status: "Active",
      joinDate: new Date().toISOString().slice(0, 10),
      projects: [],
      department: trimmed.role === "Trainer" ? "" : "Operations",
      loginId: id,
      password: generatePassword(),
      credentialsSent: false,
    });

    setUsers((prev) => [newUser, ...prev]);
    setEmployeeForm(EMPTY_EMPLOYEE_FORM);
    setShowCreateModal(false);
    toast.success(`${newUser.name} added with generated login credentials`);
  };

  const openAssignmentModal = (user) => {
    setAssignmentDraft({
      userId: user.id,
      projects: [...user.projectAssignments],
      centers: [...user.centerAssignments],
      trait: user.trait || "",
    });
  };

  const setDraftProjects = (projects) => {
    setAssignmentDraft((prev) => {
      const centers = prev.centers.filter((center) => getCentersForProjects(projects).includes(center));
      return { ...prev, projects, centers };
    });
  };

  const toggleDraftValue = (key, value) => {
    setAssignmentDraft((prev) => {
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const handleSaveAssignment = () => {
    if (!selectedAssignmentUser || !assignmentDraft.projects.length || !assignmentDraft.centers.length) {
      toast.error("Please select project and center assignment");
      return;
    }

    if (selectedAssignmentUser.role === "Trainer" && !assignmentDraft.trait) {
      toast.error("Please specify trainer trade");
      return;
    }

    setUsers((prev) => prev.map((user) => {
      if (user.id !== selectedAssignmentUser.id) return user;
      return {
        ...user,
        projects: assignmentDraft.projects,
        projectAssignments: assignmentDraft.projects,
        centerAssignments: assignmentDraft.centers,
        center: assignmentDraft.centers[0] || user.center,
        trait: selectedAssignmentUser.role === "Trainer" ? assignmentDraft.trait : "",
        department: selectedAssignmentUser.role === "Trainer" ? assignmentDraft.trait : user.department,
      };
    }));
    setAssignmentDraft(null);
    toast.success("Project and center assignment saved");
  };

  const handleGenerateAccess = (targetUser) => {
    setUsers((prev) => prev.map((user) => (
      user.id === targetUser.id
        ? {
            ...user,
            loginId: user.loginId || user.id,
            password: generatePassword(),
            credentialsSent: false,
          }
        : user
    )));
    toast.success(`Credentials generated for ${targetUser.name}`);
  };

  const handleSendCredentials = (user) => {
    if (!user.password) {
      toast.error("Generate credentials before sending mail");
      return;
    }

    const subject = encodeURIComponent("Pantiss ERP Login Credentials");
    const body = encodeURIComponent(
      `Hello ${user.name},\n\nYour Pantiss ERP login credentials are:\n\nUser ID: ${user.loginId || user.id}\nPassword: ${user.password}\n\nPlease sign in and update your password after first login.`
    );
    window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`;

    setUsers((prev) => prev.map((item) => (
      item.id === user.id ? { ...item, credentialsSent: true } : item
    )));
    toast.success("Mail draft opened with login credentials");
  };

  return (
    <div className="min-w-0 max-w-full space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex min-w-0 flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3 tracking-tighter">
            <Users size={28} className="text-red-500" /> User Management
          </h1>
          <p className="text-sm text-white/60 mt-1 uppercase tracking-widest font-bold">
            {users.length} registered users across all roles
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-xl shadow-red-500/20 transition hover:opacity-90"
        >
          <Plus size={16} /> Create New User
        </button>
      </div>

      {/* Role Stats Cards */}
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {roleStats.map((s) => (
          <div key={s.label} className="min-w-0 rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.bg}`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{s.label}</p>
                <p className="text-xl font-black text-slate-100">{s.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 backdrop-blur-sm">
        <div className="flex min-w-0 flex-col gap-4 border-b border-white/[0.08] p-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Role Tabs */}
          <div className="flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-xl bg-transparent/30 p-1">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  pg.setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition ${
                  activeTab === tab
                    ? "bg-red-500/20 text-red-400"
                    : "text-slate-500 hover:text-white/80"
                } shrink-0`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-80 xl:w-96">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                pg.setPage(1);
              }}
              className="w-full rounded-xl border border-slate-700 bg-transparent/40 py-2.5 pl-9 pr-4 text-xs text-white/80 outline-none transition focus:border-red-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full table-fixed text-left" style={{ minWidth: 1180 }}>
            <colgroup>
              <col style={{ width: "10%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "21%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "8%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0b1220] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <th className="px-4 py-3.5 align-middle">User ID</th>
                <th className="px-4 py-3.5 align-middle">Name</th>
                <th className="px-4 py-3.5 align-middle">Role</th>
                <th className="px-4 py-3.5 align-middle">Contact</th>
                <th className="px-4 py-3.5 align-middle">Project & Center</th>
                <th className="px-4 py-3.5 align-middle">Login Access</th>
                <th className="px-4 py-3.5 text-center align-middle">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pg.pageData.map((user) => (
                <tr key={user.id} className="group h-[104px] transition hover:bg-white/[0.02]">
                  <td className="px-4 py-4 align-middle text-[11px] font-black text-red-500/80 font-mono truncate">{user.id}</td>
                  <td className="px-4 py-4 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black text-white/80">
                        {initials(user.name)}
                      </div>
                      <span className="truncate text-[13px] font-bold text-white/90 group-hover:text-white transition">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="space-y-1.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${ROLE_BADGE[user.role]}`}>
                        {user.role}
                      </span>
                      {user.role === "Trainer" && user.trait && (
                        <p className="truncate text-[10px] font-bold text-emerald-300/80">{user.trait}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="space-y-1.5 text-xs text-white/60">
                      <p className="flex min-w-0 items-center gap-1.5 truncate"><Mail size={12} className="shrink-0 text-slate-500" /> <span className="truncate">{user.email}</span></p>
                      <p className="flex min-w-0 items-center gap-1.5 truncate"><Phone size={12} className="shrink-0 text-slate-500" /> <span className="truncate">{user.phone}</span></p>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_86px] items-center gap-3">
                      <div className="min-w-0 space-y-2">
                        <div className="flex min-h-6 flex-wrap items-center gap-1.5">
                          {user.projectAssignments.length > 0 ? user.projectAssignments.slice(0, 2).map((project) => (
                            <span key={project} className="max-w-full truncate rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-300">
                              {project}
                            </span>
                          )) : (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Unassigned</span>
                          )}
                          {user.projectAssignments.length > 2 && (
                            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                              +{user.projectAssignments.length - 2}
                            </span>
                          )}
                        </div>
                        <p className="flex min-w-0 items-center gap-1.5 truncate text-[11px] font-bold text-cyan-300/80">
                          <Building2 size={12} className="shrink-0" />
                          <span className="truncate">{user.centerAssignments.length > 0 ? user.centerAssignments.join(", ") : "Center pending"}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAssignmentModal(user)}
                        className="inline-flex h-8 w-[86px] shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-[10px] font-black uppercase text-white/70 transition hover:border-red-500/40 hover:text-white"
                      >
                        Assign
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="grid min-w-0 gap-2">
                      <div className="rounded-lg border border-slate-700/60 bg-[#0b1220] px-3 py-2">
                        <p className="truncate text-[10px] font-mono font-black text-white/80">{user.loginId || "Not generated"}</p>
                        <p className={`mt-0.5 truncate text-[10px] font-bold ${user.password ? "text-emerald-400" : "text-slate-600"}`}>
                          {user.password ? user.password : "Password pending"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleGenerateAccess(user)}
                          className="inline-flex h-7 min-w-0 items-center justify-center gap-1 rounded-lg bg-red-500/10 px-2 text-[10px] font-black uppercase text-red-400 transition hover:bg-red-500/20"
                        >
                          <RefreshCcw size={11} /> {user.password ? "Reset" : "Generate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendCredentials(user)}
                          className={`inline-flex h-7 min-w-0 items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-black uppercase transition ${
                            user.password
                              ? "bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                              : "bg-slate-800 text-slate-600"
                          }`}
                        >
                          <Send size={11} /> Mail
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center align-middle">
                    <div className="flex justify-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_BADGE[user.status]}`}>
                        {user.status}
                      </span>
                    </div>
                    <div className="mt-1.5 flex h-4 justify-center">
                      {user.credentialsSent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300">
                          <CheckCircle2 size={11} /> Sent
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination {...pg} />
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] flex justify-end" onClick={() => setShowCreateModal(false)}>
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
          <aside
            className="relative ml-auto flex h-full w-full max-w-xl animate-in slide-in-from-right duration-200 flex-col border-l border-slate-700/70 bg-[#0f172a] shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-400">Super Admin</p>
                <h3 className="mt-1 text-xl font-black tracking-tight text-white">New Employee</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close new employee panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-5">
              <ModalField label="Name">
                <input
                  type="text"
                  value={employeeForm.name}
                  onChange={(e) => updateEmployeeForm("name", e.target.value)}
                  className={inputClass}
                  autoFocus
                />
              </ModalField>
              <ModalField label="Role">
                <select
                  value={employeeForm.role}
                  onChange={(e) => updateEmployeeForm("role", e.target.value)}
                  className={selectClass}
                >
                  {EMPLOYEE_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </ModalField>
              <ModalField label="Email">
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => updateEmployeeForm("email", e.target.value)}
                  className={inputClass}
                />
              </ModalField>
              <ModalField label="Phone No.">
                <input
                  type="tel"
                  value={employeeForm.phone}
                  onChange={(e) => updateEmployeeForm("phone", e.target.value)}
                  className={inputClass}
                />
              </ModalField>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/[0.08] bg-[#0f172a] px-6 py-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateEmployee}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400"
              >
                <Plus size={15} /> Add Employee
              </button>
            </div>
          </aside>
        </div>
      )}

      {assignmentDraft && selectedAssignmentUser && (
        <div className="fixed inset-0 z-[9999] flex justify-end" onClick={() => setAssignmentDraft(null)}>
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
          <aside
            className="relative ml-auto flex h-full w-full max-w-2xl animate-in slide-in-from-right duration-200 flex-col border-l border-slate-700/70 bg-[#0f172a] shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <FolderKanban size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedAssignmentUser.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {selectedAssignmentUser.role} assignment
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssignmentDraft(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close assignment panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
              {selectedAssignmentUser.role === "Admin" ? (
                <>
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      <FolderKanban size={13} /> Projects
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {PROJECT_OPTIONS.map((project) => {
                        const active = assignmentDraft.projects.includes(project);
                        return (
                          <button
                            type="button"
                            key={project}
                            onClick={() => {
                              const projects = active
                                ? assignmentDraft.projects.filter((item) => item !== project)
                                : [...assignmentDraft.projects, project];
                              setDraftProjects(projects);
                            }}
                            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                              active
                                ? "border-red-500/50 bg-red-500/10 text-red-300"
                                : "border-slate-700 bg-[#111827] text-white/60 hover:border-slate-600"
                            }`}
                          >
                            {active ? <CheckCircle2 size={16} /> : <FolderKanban size={16} className="text-slate-600" />}
                            {project}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      <MapPin size={13} /> Centers
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {availableCenters.map((center) => {
                        const active = assignmentDraft.centers.includes(center);
                        return (
                          <button
                            type="button"
                            key={center}
                            onClick={() => toggleDraftValue("centers", center)}
                            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                              active
                                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                                : "border-slate-700 bg-[#111827] text-white/60 hover:border-slate-600"
                            }`}
                          >
                            {active ? <CheckCircle2 size={16} /> : <Building2 size={16} className="text-slate-600" />}
                            {center}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid gap-5">
                  <ModalField label="Project">
                    <select
                      value={assignmentDraft.projects[0] || ""}
                      onChange={(e) => setAssignmentDraft((prev) => ({
                        ...prev,
                        projects: e.target.value ? [e.target.value] : [],
                        centers: [],
                      }))}
                      className={selectClass}
                    >
                      <option value="">Select project</option>
                      {PROJECT_OPTIONS.map((project) => <option key={project} value={project}>{project}</option>)}
                    </select>
                  </ModalField>
                  <ModalField label="Center">
                    <select
                      value={assignmentDraft.centers[0] || ""}
                      onChange={(e) => setAssignmentDraft((prev) => ({
                        ...prev,
                        centers: e.target.value ? [e.target.value] : [],
                      }))}
                      className={selectClass}
                    >
                      <option value="">Select center</option>
                      {availableCenters.map((center) => <option key={center} value={center}>{center}</option>)}
                    </select>
                  </ModalField>
                  {selectedAssignmentUser.role === "Trainer" && (
                    <ModalField label="Trade">
                      <select
                        value={assignmentDraft.trait}
                        onChange={(e) => setAssignmentDraft((prev) => ({ ...prev, trait: e.target.value }))}
                        className={selectClass}
                      >
                        <option value="">Select trade</option>
                        {TRAINER_TRAITS.map((trait) => <option key={trait} value={trait}>{trait}</option>)}
                      </select>
                    </ModalField>
                  )}
                </div>
              )}

              <div className="rounded-xl border border-slate-700/60 bg-[#0b1220] p-4">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <KeyRound size={13} /> Login Credentials
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-700/60 bg-[#111827] px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">User ID</p>
                    <p className="mt-1 font-mono text-sm font-black text-white">{selectedAssignmentUser.loginId || selectedAssignmentUser.id}</p>
                  </div>
                  <div className="rounded-lg border border-slate-700/60 bg-[#111827] px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</p>
                    <p className={`mt-1 font-mono text-sm font-black ${selectedAssignmentUser.password ? "text-emerald-300" : "text-slate-600"}`}>
                      {selectedAssignmentUser.password || "Pending generation"}
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-white/[0.08] bg-[#0f172a] px-6 py-4 md:flex-row md:items-center md:justify-between">
              <button
                type="button"
                onClick={() => handleGenerateAccess(selectedAssignmentUser)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
              >
                <RefreshCcw size={15} /> Generate ID & Password
              </button>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAssignmentDraft(null)}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignment}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400"
                >
                  <Save size={15} /> Save Assignment
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
