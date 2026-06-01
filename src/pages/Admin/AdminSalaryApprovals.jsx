import { useEffect, useMemo, useState } from "react";
import {
  ApprovalToggle,
  DataTable,
  ProjectCards,
  WorkspaceHeader,
} from "../../components/Admin/ProjectWorkspace";
import { buildSalaryWorkEvidence, SalaryWorkEvidence } from "../shared/salaryWorkEvidence";
import { useSalaryStore } from "../../stores/salaryStore.js";
import {
  selectProjectCardsFromSalaries,
  selectSalaryRows,
} from "../../stores/selectors/salarySelectors.js";
import { History } from "lucide-react";
import SlidePanel from "../../components/common/SlidePanel";
import AuditTrail from "../../components/common/AuditTrail";
import { buildSalaryAuditTrail } from "../../utils/auditTrailHelpers";

export default function AdminSalaryApprovals() {
  const { salaries, fetchSalaries, updateSalary } = useSalaryStore();
  const [selectedProject, setSelectedProject] = useState(null);
  const [auditRow, setAuditRow] = useState(null);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const salaryRows = useMemo(
    () => selectSalaryRows(salaries).map((item, index) => ({
      ...item,
      evidence: buildSalaryWorkEvidence(item, index),
    })),
    [salaries]
  );
  const projects = useMemo(() => selectProjectCardsFromSalaries(salaries), [salaries]);
  const projectRows = useMemo(
    () =>
      selectedProject
        ? salaryRows.filter((row) => row.projectId === selectedProject.id)
        : [],
    [salaryRows, selectedProject]
  );

  const updateApproval = (id, key, value) => {
    const salary = salaryRows.find((row) => row.id === id);
    if (salary?.status === "Paid") return;
    updateSalary(id, key === "salaryApproved" ? { status: value ? "APPROVED" : "SUBMITTED" } : { [key]: value });
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
      key: "evidence",
      label: "Work Done / Proof",
      cellClassName: "p-4 align-top text-white/75",
      render: (row) => <SalaryWorkEvidence evidence={row.evidence} tone="violet" />,
    },
    {
      key: "salaryApproved",
      label: "Salary Approval",
      render: (row) => (
        <ApprovalToggle
          checked={row.salaryApproved}
          onChange={(value) => updateApproval(row.id, "salaryApproved", value)}
          disabled={row.status === "Paid"}
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
          disabled={row.status === "Paid"}
        />
      ),
    },
    {
      key: "audit",
      label: "Audit",
      render: (row) => (
        <button
          onClick={() => setAuditRow(row)}
          className="rounded-lg bg-violet-500/15 p-2 text-violet-300 transition hover:bg-violet-500/25"
          title="Audit Trail"
        >
          <History size={14} />
        </button>
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
        <DataTable columns={columns} rows={projectRows} minWidth="1700px" />
      ) : (
        <ProjectCards projects={projects} onSelect={setSelectedProject} />
      )}

      <SlidePanel
        open={Boolean(auditRow)}
        onClose={() => setAuditRow(null)}
        title="Salary — Audit Trail"
        width="md"
      >
        {auditRow && (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">{auditRow.employee}</p>
              <p className="mt-1 text-xs text-white/45">{auditRow.id} • {auditRow.center} • {auditRow.month}</p>
            </div>
            <AuditTrail entries={buildSalaryAuditTrail(auditRow)} tone="violet" />
          </div>
        )}
      </SlidePanel>
    </section>
  );
}
