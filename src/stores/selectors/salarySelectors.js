import { mockDb } from "../../mock-db/index.js"
import { denormalize } from "../../mock-db/shared/normalize.js"

const STATUS_LABELS = {
  SUBMITTED: "Pending",
  UNDER_REVIEW: "Pending",
  APPROVED: "Approved",
  PAID: "Paid",
  REJECTED: "Rejected",
}

export function selectSalaryRows(salaries) {
  return salaries.map((salary, index) => {
    const employee = salary.employee || mockDb.employees.byId[salary.employeeId]
    const project = salary.project || mockDb.projects.byId[salary.projectId]
    const center = employee?.centerIds?.[0] ? mockDb.centers.byId[employee.centerIds[0]] : null
    const attendance = Math.round(((salary.attendanceDays || 0) / 26) * 100)
    const target1 = employee?.designation === "Placement Officer" ? 40 : employee?.designation === "Mobilizer" ? 80 : 120
    const achievement1 = Math.max(0, Math.round(target1 * attendance / 100) - (index % 4))
    const target2 = employee?.designation === "Placement Officer" ? 30 : 80
    const achievement2 = Math.max(0, Math.round(target2 * attendance / 100) - (index % 3))

    return {
      ...salary,
      employee: employee ? `${employee.firstName} ${employee.lastName}` : "Employee",
      employeeId: salary.employeeId,
      role: employee?.designation || "Employee",
      center: center?.name || "-",
      project: project?.name || "-",
      projectId: project?.id || salary.projectId,
      month: salary.month,
      amount: salary.grossAmount,
      baseSalary: salary.grossAmount,
      targetKPI: target1,
      achievedKPI: achievement1,
      deductions: salary.deductions || 600,
      bonus: salary.bonus || (achievement1 >= target1 ? 1500 : 0),
      status: STATUS_LABELS[salary.status] || salary.status,
      attendance,
      target1,
      target2,
      achievement1,
      achievement2,
      salaryApproved: salary.status === "APPROVED" || salary.status === "PAID",
      bonusApproved: Boolean(salary.bonusApproved),
    }
  })
}

export function selectSalaryByRole(salaries, roleLabel) {
  return selectSalaryRows(salaries).filter((salary) => salary.role === roleLabel)
}

export function selectSalaryHistoryForEmployee(salaries, employeeId) {
  const rows = selectSalaryRows(salaries).filter((salary) => salary.employeeId === employeeId)
  if (rows.length) return Object.fromEntries(rows.map((row) => [row.month, row]))

  const employee = mockDb.employees.byId[employeeId]
  const base = employee?.designation === "Placement Officer" ? 36000 : employee?.designation === "Trainer" ? 32000 : 26000
  return Object.fromEntries(
    ["2026-05", "2026-04", "2026-03"].map((month, index) => [
      month,
      {
        month,
        baseSalary: base,
        targetKPI: 30,
        achievedKPI: 24 + index * 2,
        deductions: 500,
        bonus: index === 2 ? 1500 : 0,
        status: index === 0 ? "Pending" : "Paid",
      },
    ])
  )
}

export function selectProjectCardsFromSalaries(salaries) {
  const rows = selectSalaryRows(salaries)
  return denormalize(mockDb.projects).map((project) => {
    const projectRows = rows.filter((row) => row.projectId === project.id)
    return {
      ...project,
      name: project.name,
      employeeCount: projectRows.length,
    }
  }).filter((project) => project.employeeCount > 0)
}

