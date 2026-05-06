import { useMemo, useState } from "react";
import {
  ApprovalToggle,
  DataTable,
  ProjectCards,
  WorkspaceHeader,
} from "../../components/Admin/ProjectWorkspace";
import { buildProjectSummaries } from "../../components/Admin/projectWorkspaceUtils";
import { EMPLOYEES, SALARY_APPROVALS } from "./adminPortalData";

const employeeProjectByName = EMPLOYEES.reduce((map, employee) => {
  map[employee.name] = employee.project;
  return map;
}, {});

const buildSalaryRows = () =>
  SALARY_APPROVALS.map((item, index) => {
    const target1 = item.target;
    const target2 = item.role === "Placement Officer" ? 40 + index * 2 : 80 + index * 4;
    const achievement1 = item.achievement;
    const achievement2 = Math.max(Math.round(target2 * (item.attendance / 100)) - (index % 3), 0);

    return {
      ...item,
      project: employeeProjectByName[item.employee] || "Unassigned Project",
      target1,
      target2,
      achievement1,
      achievement2,
      salaryApproved: item.status === "Approved",
      bonusApproved: false,
    };
  });

export default function AdminSalaryApprovals() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [salaryRows, setSalaryRows] = useState(buildSalaryRows);

  const projects = useMemo(() => buildProjectSummaries(salaryRows), [salaryRows]);
  const projectRows = useMemo(
    () =>
      selectedProject
        ? salaryRows.filter((row) => row.project === selectedProject.name)
        : [],
    [salaryRows, selectedProject]
  );

  const updateApproval = (id, key, value) => {
    setSalaryRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    );
  };

  const columns = [
    {
      key: "employee",
      label: "Employee Name",
      cellClassName: "p-4",
      render: (row) => (
        <div>
          <p className="font-medium text-white/90">{row.employee}</p>
          <p className="mt-1 text-xs text-white/45">{row.role}</p>
        </div>
      ),
    },
    { key: "center", label: "Center" },
    {
      key: "attendance",
      label: "Attendance %",
      render: (row) => `${row.attendance}%`,
    },
    { key: "target1", label: "Target 1 (T1)" },
    { key: "target2", label: "Target 2 (T2)" },
    { key: "achievement1", label: "Achievement 1 (A1)" },
    { key: "achievement2", label: "Achievement 2 (A2)" },
    {
      key: "cumulative",
      label: "Cumulative Achievement (%)",
      render: (row) => {
        const cumulative = Math.min(row.achievement1 + row.achievement2, 100);
        return (
          <div className="min-w-[170px]">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-white/45">A1 + A2</span>
              <span className="font-semibold text-white">{cumulative}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${
                  cumulative >= 90 ? "bg-emerald-400" : cumulative >= 70 ? "bg-sky-400" : "bg-amber-400"
                }`}
                style={{ width: `${cumulative}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "salaryApproved",
      label: "Salary Approval",
      render: (row) => (
        <ApprovalToggle
          checked={row.salaryApproved}
          onChange={(value) => updateApproval(row.id, "salaryApproved", value)}
        />
      ),
    },
    {
      key: "bonusApproved",
      label: "Bonus Approval",
      render: (row) => (
        <ApprovalToggle
          checked={row.bonusApproved}
          onChange={(value) => updateApproval(row.id, "bonusApproved", value)}
        />
      ),
    },
  ];

  return (
    <section className="space-y-6 text-white">
      <WorkspaceHeader
        title={selectedProject ? `${selectedProject.name} Salary` : "Salary Approvals"}
        subtitle={
          selectedProject
            ? "Review attendance, targets, achievements, and release decisions for this project."
            : "Select a project to open its salary approval table."
        }
        selectedProject={selectedProject}
        onBack={() => setSelectedProject(null)}
      />

      {selectedProject ? (
        <DataTable columns={columns} rows={projectRows} minWidth="1320px" />
      ) : (
        <ProjectCards projects={projects} onSelect={setSelectedProject} />
      )}
    </section>
  );
}
