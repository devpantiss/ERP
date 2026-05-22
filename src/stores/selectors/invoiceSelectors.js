import { FileText, GraduationCap, Megaphone, Briefcase, Utensils } from "lucide-react"
import { mockDb } from "../../mock-db/index.js"

const STATUS_LABELS = {
  SUBMITTED: "Pending",
  UNDER_REVIEW: "Pending",
  APPROVED: "Approved",
  PAID: "Paid",
  REJECTED: "Rejected",
}

function monthKey(date) {
  return date ? date.slice(0, 7) : "2026-05"
}

function monthLabel(key) {
  const [year, month] = key.split("-")
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(Number(year), Number(month) - 1, 1))
}

function invoiceType(category) {
  if (/food|boarding/i.test(category)) return "Food Billing"
  if (/trainer|training/i.test(category)) return "Trainer Salary"
  if (/mobil/i.test(category)) return "Mobilizer Comm."
  if (/placement/i.test(category)) return "Placement Salary"
  return "Operations Billing"
}

function typeEvidence(type, invoice, attendancePct) {
  const map = {
    "Food Billing": { label: "Attendance Log", value: `${attendancePct}% attendance`, icon: Utensils, color: "emerald" },
    "Trainer Salary": { label: "Training Log", value: "Central training evidence attached", icon: GraduationCap, color: "purple" },
    "Mobilizer Comm.": { label: "Mobilization Proof", value: "Candidate outreach records attached", icon: Megaphone, color: "yellow" },
    "Placement Salary": { label: "Offer Letters", value: "Placement records attached", icon: Briefcase, color: "cyan" },
  }
  return map[type] || { label: "Invoice Packet", value: invoice.category, icon: FileText, color: "blue" }
}

export function selectInvoiceRows(invoices) {
  return invoices.map((invoice) => {
    const project = mockDb.projects.byId[invoice.projectId]
    const center = mockDb.centers.byId[invoice.centerId]
    const manager = center?.managerEmployeeId ? mockDb.employees.byId[center.managerEmployeeId] : null
    const key = monthKey(invoice.raisedOn)
    const attendanceRows = Object.values(mockDb.attendance.byId).filter((entry) => entry.centerId === invoice.centerId)
    const attendancePct = attendanceRows.length
      ? Math.round((attendanceRows.filter((entry) => entry.status === "PRESENT").length / attendanceRows.length) * 100)
      : 76
    const type = invoiceType(invoice.category)

    return {
      ...invoice,
      type,
      project: project?.name || "-",
      projectId: invoice.projectId,
      center: center?.district || center?.name || "-",
      adminName: manager ? `${manager.firstName} ${manager.lastName}` : "Project Admin",
      monthKey: key,
      month: monthLabel(key),
      amount: invoice.amount,
      status: STATUS_LABELS[invoice.status] || invoice.status,
      raisedOn: invoice.raisedOn,
      dueOn: invoice.dueOn,
      details: { students: attendanceRows.length || 0, rate: invoice.amount, attendance: attendancePct },
      notes: invoice.notes || "",
      evidence: typeEvidence(type, invoice, attendancePct),
      category: type === "Food Billing" ? "Food" : type === "Operations Billing" ? "Others" : type,
      sourceCategory: invoice.category,
      billName: invoice.vendorName,
      fileName: `${invoice.id}.pdf`,
      description: `${invoice.category} - ${center?.name || "Center"}`,
    }
  })
}

export function selectInvoiceApprovalRows(invoices) {
  return selectInvoiceRows(invoices).map((invoice) => {
    const approved = ["Approved", "Paid"].includes(invoice.status)
    return {
      ...invoice,
      adminReady: true,
      superAdminStatus: approved ? "Approved" : invoice.status === "Rejected" ? "Returned" : "Pending Review",
    }
  })
}

export function selectInvoiceMonthData(invoices) {
  return selectInvoiceRows(invoices).reduce((months, invoice) => {
    const current = months[invoice.monthKey] || { activeStudents: 0, attendancePct: 0, boardingCapacity: 0, count: 0 }
    return {
      ...months,
      [invoice.monthKey]: {
        activeStudents: current.activeStudents + (invoice.details.students || 0),
        attendancePct: Math.round((current.attendancePct * current.count + invoice.details.attendance) / (current.count + 1)),
        boardingCapacity: current.boardingCapacity + Math.max(invoice.details.students || 0, 40),
        count: current.count + 1,
      },
    }
  }, {})
}

export { monthLabel as getInvoiceMonthLabel }
