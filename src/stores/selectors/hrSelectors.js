import { mockDb } from "../../mock-db/index.js"

const STATUS_LABELS = {
  DRAFT: "Draft",
  SUBMITTED: "Pending Admin Review",
  UNDER_REVIEW: "Pending Admin Review",
  ADMIN_APPROVED: "Pending Super Admin Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PAID: "Paid",
  CLOSED: "Closed",
}

export const LEAVE_TYPES = ["Casual Leave", "Sick Leave", "Earned Leave"]

export function selectLeaveRows(leaves) {
  return leaves.map((leave) => {
    const employee = leave.employee || mockDb.employees.byId[leave.employeeId]
    const role = employee?.designation || "Employee"
    return {
      ...leave,
      role,
      employee: employee ? `${employee.firstName} ${employee.lastName}` : "Employee",
      type: leave.type || "Casual Leave",
      from: leave.fromDate,
      to: leave.toDate,
      days: diffDays(leave.fromDate, leave.toDate),
      status: STATUS_LABELS[leave.status] || leave.status,
      appliedOn: leave.appliedOn || leave.createdAt?.slice(0, 10) || "-",
      approver: leave.approverEmployeeId ? formatEmployee(leave.approverEmployeeId) : "Admin Office",
    }
  })
}

export function getLeaveBalances(leaves, employeeId) {
  const rows = selectLeaveRows(leaves).filter((leave) => !employeeId || leave.employeeId === employeeId)
  return LEAVE_TYPES.map((type) => {
    const quota = type === "Earned Leave" ? 18 : 12
    const used = rows.filter((leave) => leave.type === type && leave.status === "Approved").reduce((sum, leave) => sum + leave.days, 0)
    const pending = rows.filter((leave) => leave.type === type && leave.status.includes("Pending")).reduce((sum, leave) => sum + leave.days, 0)
    return { type, quota, used, pending, left: Math.max(0, quota - used - pending) }
  })
}

export function selectReimbursementRows(reimbursements) {
  return reimbursements.map((claim) => ({
    ...claim,
    id: claim.id,
    claimTitle: claim.claimTitle || claim.category || "Reimbursement Claim",
    dateRange: claim.dateRange || claim.submittedOn || "-",
    totalAmount: claim.totalAmount || claim.amount || 0,
    status: claim.status === "SUBMITTED" || claim.status === "UNDER_REVIEW" ? "Pending" : STATUS_LABELS[claim.status] || claim.status,
    submittedOn: claim.submittedOn || claim.createdAt?.slice(0, 10) || "-",
    claimNote: claim.claimNote || claim.category || "-",
    bills: claim.bills || [{ date: claim.submittedOn || "-", desc: claim.category || "Claim", amount: claim.amount || 0, mode: "Online" }],
  }))
}

export function selectTourRows(tours) {
  return tours.map((tour) => ({
    ...tour,
    id: tour.id,
    title: tour.title || tour.purpose || "Tour Request",
    startDate: tour.startDate || tour.fromDate,
    endDate: tour.endDate || tour.toDate,
    estimate: tour.estimate || tour.estimatedAmount || 0,
    status: tour.status === "SUBMITTED" || tour.status === "UNDER_REVIEW" ? "Pending" : STATUS_LABELS[tour.status] || tour.status,
    submittedOn: tour.submittedOn || tour.createdAt?.slice(0, 10) || "-",
  }))
}

export function diffDays(from, to) {
  if (!from || !to) return 0
  const start = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0
  return Math.round((end - start) / 86400000) + 1
}

function formatEmployee(employeeId) {
  const employee = mockDb.employees.byId[employeeId]
  return employee ? `${employee.firstName} ${employee.lastName}` : "Admin Office"
}
