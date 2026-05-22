import { useEffect, useMemo, useState } from "react";
import {
  AtSign,
  FolderKanban,
  Plus,
  Search,
  SquarePen,
  Trash2,
  UserCog,
  X,
} from "lucide-react";
import MentionInput from "../../components/common/MentionInput";
import { Breadcrumb, PageHeader } from "./SuperAdminSharedComponents";
import { useEmployeeStore } from "../../stores/employeeStore";
import { useProjectStore } from "../../stores/projectStore";
import { selectSuperAdminProjectHierarchy } from "../../stores/selectors/superAdminSelectors";

const emptyProject = {
  name: "",
  fundingAgency: "",
  status: "Active",
  startDate: "",
  endDate: "",
  centerName: "",
  jobRoles: "",
  totalBatchTarget: "",
  plannedBatches: "",
  lead: [],
};

const emptyBatch = {
  label: "",
  jobRole: "",
  trainer: "",
  learners: "",
  status: "Active",
};

const batchStatuses = ["Active", "Verified", "Closed"];

function normalizeBatchStatus(status) {
  if (status === "Completed") return "Closed";
  if (status === "Pending Verification") return "Verified";
  return batchStatuses.includes(status) ? status : "Active";
}

function getAssignedAdmin(projectId, adminUsers) {
  return adminUsers.find((user) => {
    const assignments = user.projectIds || [];
    return assignments.includes(projectId);
  });
}

function seedProjects(projectHierarchy, adminUsers) {
  return projectHierarchy.map((project) => {
    const batches = project.centers.flatMap((center) =>
      center.batches.map((batch) => ({
        ...batch,
        status: normalizeBatchStatus(batch.status),
        center: center.name,
      }))
    );
    const assignedAdmin = getAssignedAdmin(project.id, adminUsers);
    const jobRoles = [...new Set(batches.map((batch) => batch.jobRole).filter(Boolean))];

    return {
      id: project.id,
      name: project.name,
      fundingAgency: project.fundingAgency,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      centerName: project.centers[0]?.name || "Unassigned",
      jobRoles: jobRoles.join(", "),
      totalBatchTarget: project.totalBatchTarget || "",
      plannedBatches: batches.length,
      lead: assignedAdmin ? [assignedAdmin] : [],
      batches,
    };
  });
}

export default function SuperAdminCreateProjects() {
  const { records: projectRecords, fetchAll } = useProjectStore();
  const { records: employees, fetchWithAssignments } = useEmployeeStore();
  useEffect(() => {
    fetchAll();
    fetchWithAssignments();
  }, [fetchAll, fetchWithAssignments]);
  const projectHierarchy = useMemo(() => selectSuperAdminProjectHierarchy(projectRecords), [projectRecords]);
  const adminUsers = useMemo(
    () => employees
      .filter((employee) => employee.designation === "Project Admin")
      .map((employee) => ({
        ...employee,
        name: [employee.firstName, employee.lastName].filter(Boolean).join(" "),
        role: "Admin",
      })),
    [employees]
  );
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects((current) => (current.length ? current : seedProjects(projectHierarchy, adminUsers)));
  }, [adminUsers, projectHierarchy]);

  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [leadFilter, setLeadFilter] = useState("All");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectDraft, setProjectDraft] = useState(emptyProject);
  const [batchProjectId, setBatchProjectId] = useState(null);
  const [batchMode, setBatchMode] = useState("create");
  const [batchDraft, setBatchDraft] = useState(emptyBatch);

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((project) => {
      const leadName = project.lead[0]?.name || "";
      const matchesSearch =
        !q ||
        project.name.toLowerCase().includes(q) ||
        project.fundingAgency.toLowerCase().includes(q) ||
        project.centerName.toLowerCase().includes(q) ||
        leadName.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || project.status === statusFilter;
      const matchesLead = leadFilter === "All" || leadName === leadFilter;
      return matchesSearch && matchesStatus && matchesLead;
    });
  }, [leadFilter, projects, search, statusFilter]);

  const selectedBatchProject = projects.find((project) => project.id === batchProjectId);
  const canSaveProject =
    projectDraft.name &&
    projectDraft.fundingAgency &&
    projectDraft.startDate &&
    projectDraft.endDate &&
    projectDraft.centerName &&
    projectDraft.jobRoles &&
    Number(projectDraft.totalBatchTarget) > 0;
  const canAddBatch =
    batchDraft.label && batchDraft.jobRole && batchDraft.trainer && Number(batchDraft.learners) > 0;

  const updateProjectDraft = (field, value) => {
    setProjectDraft((current) => ({ ...current, [field]: value }));
  };

  const updateBatchDraft = (field, value) => {
    setBatchDraft((current) => ({ ...current, [field]: value }));
  };

  const updateProjectLead = (projectId, lead) => {
    setProjects((current) =>
      current.map((project) => (project.id === projectId ? { ...project, lead } : project))
    );
  };

  const openNewProject = () => {
    setProjectDraft(emptyProject);
    setShowProjectModal(true);
  };

  const saveProject = () => {
    if (!canSaveProject) return;
    const nextProject = {
      ...projectDraft,
      totalBatchTarget: Number(projectDraft.totalBatchTarget),
      plannedBatches: Number(projectDraft.plannedBatches || 0),
      id: `SA-P-${String(Date.now()).slice(-5)}`,
      batches: [],
    };
    setProjects((current) => [nextProject, ...current]);
    setShowProjectModal(false);
  };

  const openBatchModal = (projectId, mode) => {
    setBatchProjectId(projectId);
    setBatchMode(mode);
    setBatchDraft(emptyBatch);
  };

  const addBatch = () => {
    if (!selectedBatchProject || !canAddBatch) return;
    setProjects((current) =>
      current.map((project) => {
        if (project.id !== selectedBatchProject.id) return project;
        return {
          ...project,
          batches: [
            ...project.batches,
            {
              ...batchDraft,
              id: `B-${String(project.batches.length + 1).padStart(3, "0")}`,
              center: project.centerName,
            },
          ],
        };
      })
    );
    setBatchDraft(emptyBatch);
  };

  const removeBatch = (batchId) => {
    if (!selectedBatchProject) return;
    setProjects((current) =>
      current.map((project) => {
        if (project.id !== selectedBatchProject.id) return project;
        return { ...project, batches: project.batches.filter((batch) => batch.id !== batchId) };
      })
    );
  };

  const updateBatchStatus = (batchId, status) => {
    if (!selectedBatchProject) return;
    setProjects((current) =>
      current.map((project) => {
        if (project.id !== selectedBatchProject.id) return project;
        return {
          ...project,
          batches: project.batches.map((batch) =>
            batch.id === batchId ? { ...batch, status } : batch
          ),
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <PageHeader
            icon={FolderKanban}
            title="Create Projects"
            subtitle="Access Control -> Project table -> Project form -> Batch setup"
          />
          <Breadcrumb items={["Super Admin", "Access Control", "Create Projects"]} />
        </div>
        <button
          type="button"
          onClick={openNewProject}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      <section className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_180px_220px_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
              Search Projects
            </span>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setSearch(searchDraft);
                }}
                placeholder="Search by project, agency, center, or admin"
                className="w-full rounded-xl border border-slate-700 bg-[#0b1220] py-3 pl-10 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/60"
              />
            </div>
          </label>
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={["All", "Active", "Monitoring", "Planning"]}
          />
          <SelectField
            label="Project Lead"
            value={leadFilter}
            onChange={setLeadFilter}
            options={["All", ...adminUsers.map((user) => user.name)]}
          />
          <button
            type="button"
            onClick={() => setSearch(searchDraft)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/15"
          >
            <Search size={15} />
            Search
          </button>
        </div>
      </section>

      <section className="overflow-visible rounded-2xl border border-slate-700/50 bg-[#111827]/80">
        <div className="flex flex-col gap-2 border-b border-slate-700/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/85">Projects</h2>
            <p className="mt-1 text-xs text-slate-500">{filteredProjects.length} project records in current view.</p>
          </div>
          <span className="rounded-full border border-slate-700 bg-[#0b1220] px-3 py-1.5 text-xs font-black text-slate-400">
            Batch setup is available from each row
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1360px] text-left text-sm">
            <thead className="bg-[#0b1220] text-xs font-black uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Project</th>
                <th className="px-5 py-4">Funding Agency</th>
                <th className="px-5 py-4">Center</th>
                <th className="px-5 py-4">Training Plan</th>
                <th className="px-5 py-4">Project Lead/Admin</th>
                <th className="px-5 py-4">Timeline</th>
                <th className="px-5 py-4">Batches</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredProjects.map((project) => {
                const learners = project.batches.reduce((sum, batch) => sum + Number(batch.learners || 0), 0);
                const targetMentioned = Number(project.totalBatchTarget || 0);
                return (
                  <tr key={project.id} className="text-slate-300 transition hover:bg-white/[0.025]">
                    <td className="px-5 py-4">
                      <p className="font-black text-white">{project.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{project.id}</p>
                    </td>
                    <td className="px-5 py-4">{project.fundingAgency}</td>
                    <td className="px-5 py-4">
                      {project.centerName}
                    </td>
                    <td className="px-5 py-4">
                      <p className="max-w-[240px] truncate font-bold text-white">{project.jobRoles || "Not set"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Mentioned target {targetMentioned ? targetMentioned.toLocaleString("en-IN") : "Not mentioned"}
                        {project.plannedBatches ? ` · ${project.plannedBatches} planned batch(es)` : ""}
                      </p>
                    </td>
                    <td className="min-w-72 px-5 py-4 align-top">
                      <InlineAdminAssign
                        values={project.lead}
                        people={adminUsers}
                        onChange={(people) => updateProjectLead(project.id, people.slice(-1))}
                      />
                    </td>
                    <td className="px-5 py-4">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-black text-white">{project.batches.length} batch(es)</p>
                      <p className="mt-1 text-xs text-slate-500">{learners.toLocaleString("en-IN")} learners</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-black text-emerald-300">
                        {project.status}
                      </span>
                    </td>
                    <td className="w-44 px-5 py-4 text-right align-top">
                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => openBatchModal(project.id, "edit")}
                          className="inline-flex w-32 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-black text-slate-300 transition hover:bg-white/5 hover:text-white"
                        >
                          <SquarePen size={13} />
                          Manage
                        </button>
                        <button
                          type="button"
                          onClick={() => openBatchModal(project.id, "create")}
                          className="inline-flex w-32 items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300 transition hover:bg-red-500/15"
                        >
                          <Plus size={13} />
                          Add Batch
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filteredProjects.length && (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-sm font-bold text-slate-500">
                    No projects match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showProjectModal && (
        <ProjectModal
          adminUsers={adminUsers}
          project={projectDraft}
          canSave={canSaveProject}
          onClose={() => setShowProjectModal(false)}
          onSave={saveProject}
          onUpdate={updateProjectDraft}
        />
      )}

      {selectedBatchProject && (
        <BatchModal
          project={selectedBatchProject}
          mode={batchMode}
          batch={batchDraft}
          canAdd={canAddBatch}
          onAdd={addBatch}
          onClose={() => setBatchProjectId(null)}
          onRemove={removeBatch}
          onStatusChange={updateBatchStatus}
          onUpdate={updateBatchDraft}
        />
      )}
    </div>
  );
}

function InlineAdminAssign({ values, people, onChange }) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const selected = values[0];
  const query = inputValue.includes("@") ? inputValue.slice(inputValue.lastIndexOf("@") + 1).toLowerCase() : "";
  const filteredPeople = people.filter((person) => {
    if (!showDropdown) return false;
    return (
      person.name.toLowerCase().includes(query) ||
      person.role.toLowerCase().includes(query) ||
      person.email?.toLowerCase().includes(query)
    );
  });

  const assignAdmin = (person) => {
    onChange([person]);
    setInputValue("");
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      {selected && (
        <div className="mb-2 flex items-start justify-between gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-white">{selected.name}</p>
            <p className="mt-0.5 truncate text-[11px] font-bold text-slate-500">{selected.email}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange([])}
            className="rounded-md p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
            aria-label="Remove assigned admin"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <div className="relative">
        <AtSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={inputValue}
          onChange={(event) => {
            const value = event.target.value;
            setInputValue(value);
            setShowDropdown(value.includes("@"));
          }}
          onFocus={() => {
            if (inputValue.includes("@")) setShowDropdown(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setShowDropdown(false), 120);
          }}
          placeholder={selected ? "Type @ to change admin" : "Type @ to assign admin"}
          className="w-full rounded-lg border border-slate-700 bg-[#0b1220] py-2 pl-9 pr-3 text-xs font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/60"
        />
      </div>
      {showDropdown && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-700 bg-[#0f172a] shadow-2xl shadow-black/60">
          {filteredPeople.map((person) => (
            <button
              type="button"
              key={`${person.name}-${person.email}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => assignAdmin(person)}
              className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-red-500/10"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-300">
                <UserCog size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-white">{person.name}</p>
                <p className="mt-0.5 truncate text-[11px] font-bold text-slate-500">{person.role} · {person.email}</p>
              </div>
            </button>
          ))}
          {!filteredPeople.length && (
            <div className="px-3 py-5 text-center text-xs font-bold text-slate-500">
              No Admin users found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectModal({ adminUsers, project, canSave, onClose, onSave, onUpdate }) {
  return (
    <SlideOver title="New Project" subtitle="Create a project shell and assign an Admin lead." onClose={onClose}>
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project Name" value={project.name} onChange={(value) => onUpdate("name", value)} placeholder="PMKVY 5.0" />
          <Field label="Funding Agency" value={project.fundingAgency} onChange={(value) => onUpdate("fundingAgency", value)} placeholder="NSDC" />
          <SelectField label="Status" value={project.status} onChange={(value) => onUpdate("status", value)} options={["Active", "Monitoring", "Planning"]} />
          <Field label="Primary Center" value={project.centerName} onChange={(value) => onUpdate("centerName", value)} placeholder="Angul Training Center" />
          <Field
            label="Job Role/s to be Trained"
            value={project.jobRoles}
            onChange={(value) => onUpdate("jobRoles", value)}
            placeholder="Electrical, Fitter, Solar Technician"
          />
          <Field
            type="number"
            label="Total Batch Target"
            value={project.totalBatchTarget}
            onChange={(value) => onUpdate("totalBatchTarget", value)}
            placeholder="120"
          />
          <Field
            type="number"
            label="Planned Batches"
            value={project.plannedBatches}
            onChange={(value) => onUpdate("plannedBatches", value)}
            placeholder="3"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field type="date" label="Start Date" value={project.startDate} onChange={(value) => onUpdate("startDate", value)} />
            <Field type="date" label="End Date" value={project.endDate} onChange={(value) => onUpdate("endDate", value)} />
          </div>
        </div>

        <MentionInput
          values={project.lead}
          onChange={(people) => onUpdate("lead", people.slice(-1))}
          people={adminUsers}
          placeholder="Type @ to assign an Admin..."
          accentColor="red"
          label="Project Lead / Admin"
        />

        <div className="rounded-xl border border-slate-700/50 bg-[#0b1220] p-4 text-xs font-bold leading-5 text-slate-400">
          Add all job roles in a comma-separated list. Batch setup can later split the total target into individual batches.
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          <FolderKanban size={16} />
          Create Project
        </button>
      </div>
    </SlideOver>
  );
}

function BatchModal({ project, mode, batch, canAdd, onAdd, onClose, onRemove, onStatusChange, onUpdate }) {
  const isCreateMode = mode === "create";

  return (
    <SlideOver title={isCreateMode ? "Create Batch" : "Edit Batch"} subtitle={project.name} onClose={onClose}>
      <div className="space-y-5">
        {isCreateMode ? (
          <div className="rounded-xl border border-slate-700/50 bg-[#0b1220] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">Create Batch</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Batch Label" value={batch.label} onChange={(value) => onUpdate("label", value)} placeholder="Batch 101" />
              <Field label="Job Role" value={batch.jobRole} onChange={(value) => onUpdate("jobRole", value)} placeholder="Electrical" />
              <Field label="Trainer" value={batch.trainer} onChange={(value) => onUpdate("trainer", value)} placeholder="Trainer name" />
              <Field type="number" label="Batch Target" value={batch.learners} onChange={(value) => onUpdate("learners", value)} placeholder="40" />
              <SelectField label="Status" value={batch.status} onChange={(value) => onUpdate("status", value)} options={batchStatuses} />
            </div>
            <button
              type="button"
              onClick={onAdd}
              disabled={!canAdd}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              <Plus size={16} />
              Create Batch
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-700/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0b1220] text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Batch Target</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {project.batches.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-black text-white">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.jobRole} - {item.trainer}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{Number(item.learners).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <select
                        value={normalizeBatchStatus(item.status)}
                        onChange={(event) => onStatusChange(item.id, event.target.value)}
                        className="w-full min-w-36 rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-black text-white outline-none transition focus:border-red-400/60"
                      >
                        {batchStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 px-3 py-2 text-xs font-black text-red-300 transition hover:bg-red-500/10"
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {!project.batches.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm font-bold text-slate-500">
                      No batches added for this project yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SlideOver>
  );
}

function SlideOver({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/55" onMouseDown={onClose}>
      <aside
        className="h-full w-full max-w-2xl overflow-y-auto border-l border-slate-700 bg-[#111827] p-6 shadow-2xl shadow-black/60"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-700/50 pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Zoho Projects Style</p>
            <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-sm font-bold text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/60"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-red-400/60"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue || "Pending";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
