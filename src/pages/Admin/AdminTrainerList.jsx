import { useMemo, useState } from "react";
import { BriefcaseBusiness, Mail, Phone, Users } from "lucide-react";
import {
  DataTable,
  ProjectCards,
  WorkspaceHeader,
} from "../../components/Admin/ProjectWorkspace";
import { buildProjectSummaries } from "../../components/Admin/projectWorkspaceUtils";
import { EMPLOYEES } from "./adminPortalData";

const ROLE_STYLES = {
  Trainer: "bg-violet-500/10 text-violet-300 border-violet-400/20",
  "Placement Officer": "bg-sky-500/10 text-sky-300 border-sky-400/20",
  Mobilizer: "bg-amber-500/10 text-amber-300 border-amber-400/20",
};

export default function AdminTrainerList() {
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = useMemo(() => buildProjectSummaries(EMPLOYEES), []);
  const projectEmployees = useMemo(
    () =>
      selectedProject
        ? EMPLOYEES.filter((employee) => employee.project === selectedProject.name)
        : [],
    [selectedProject]
  );

  const columns = [
    {
      key: "name",
      label: "Name",
      cellClassName: "p-4",
      render: (employee) => (
        <div>
          <p className="font-medium text-white/90">{employee.name}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Mail size={12} />
            {employee.email}
          </p>
        </div>
      ),
    },
    { key: "center", label: "Center" },
    {
      key: "role",
      label: "Role",
      render: (employee) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${
            ROLE_STYLES[employee.role] || "border-slate-600 bg-slate-700/50 text-white/70"
          }`}
        >
          {employee.role}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Contact",
      render: (employee) => (
        <span className="inline-flex items-center gap-2 text-white/70">
          <Phone size={13} className="text-violet-400" />
          {employee.phone}
        </span>
      ),
    },
    {
      key: "performance",
      label: "Performance",
      render: (employee) => (
        <div className="flex items-center gap-3">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{ width: `${employee.performance}%` }}
            />
          </div>
          <span className="text-xs text-white/70">{employee.performance}%</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (employee) => (
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
          {employee.status}
        </span>
      ),
    },
  ];

  const allEmployeeColumns = [
    ...columns.slice(0, 2),
    {
      key: "project",
      label: "Project",
      render: (employee) => (
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-200">
          <BriefcaseBusiness size={13} />
          {employee.project}
        </span>
      ),
    },
    ...columns.slice(2),
  ];

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        title={selectedProject ? selectedProject.name : "Employee List"}
        subtitle={
          selectedProject
            ? `${projectEmployees.length} employees assigned to this project.`
            : "Select a project to view its employee directory."
        }
        selectedProject={selectedProject}
        onBack={() => setSelectedProject(null)}
      />

      {selectedProject ? (
        <DataTable columns={columns} rows={projectEmployees} minWidth="980px" />
      ) : (
        <>
          <section className="rounded-2xl border border-slate-700 bg-[#111827] p-5">
            <div className="mb-5 flex flex-col gap-3 border-b border-slate-700 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                  <Users size={14} />
                  All Employees
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white">
                  Complete employee directory
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  View every employee with their role, center, project association, and current status.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                  Total
                </p>
                <p className="text-2xl font-semibold text-white">
                  {EMPLOYEES.length}
                </p>
              </div>
            </div>
            <DataTable columns={allEmployeeColumns} rows={EMPLOYEES} minWidth="1120px" />
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Browse by project
              </h2>
              <p className="mt-1 text-sm text-white/55">
                Open a project card to filter the employee directory to that project.
              </p>
            </div>
            <ProjectCards projects={projects} onSelect={setSelectedProject} />
          </section>
        </>
      )}
    </div>
  );
}
