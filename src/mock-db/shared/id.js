const counters = {}

export const idPrefixes = {
  users: "USR",
  roles: "ROL",
  permissions: "PER",
  employees: "EMP",
  fundingAgencies: "FAG",
  schools: "SCH",
  projects: "PRJ",
  centers: "CTR",
  batches: "BTH",
  candidates: "CND",
  enrollments: "ENR",
  trainers: "TRN",
  mobilizers: "MOB",
  placementOfficers: "PLO",
  companies: "CMP",
  placementDrives: "DRV",
  attendance: "ATD",
  leaveRequests: "LEV",
  salaries: "SAL",
  reimbursements: "RIM",
  tourRequests: "TOU",
  grievances: "GRV",
  invoices: "INV",
  procurements: "PRC",
  exposureVisits: "EXV",
  notifications: "NOT",
  auditLogs: "AUD",
  fileUploads: "FIL",
  testimonials: "TST",
  insurance: "INS",
  assessments: "ASM",
  certifications: "CRT",
  revenue: "REV",
  dashboardMetrics: "MET",
}

export function nextId(entityName, existingIds = []) {
  const prefix = idPrefixes[entityName]
  if (!prefix) throw new Error(`No ID prefix registered for ${entityName}`)

  const highestExisting = existingIds.reduce((max, id) => {
    const value = Number(String(id).replace(`${prefix}-`, ""))
    return Number.isFinite(value) ? Math.max(max, value) : max
  }, 0)
  counters[entityName] = Math.max(counters[entityName] || 0, highestExisting) + 1

  return `${prefix}-${String(counters[entityName]).padStart(4, "0")}`
}

export function clone(value) {
  return structuredClone(value)
}

