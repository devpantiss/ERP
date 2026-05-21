import { ROLE_CODES } from "./enums.js"

export const roleAccessMatrix = {
  [ROLE_CODES.SUPER_ADMIN]: {
    scope: "GLOBAL",
    resources: ["*"],
    actions: ["create", "read", "update", "delete", "approve", "export"],
  },
  [ROLE_CODES.ADMIN]: {
    scope: "PROJECT",
    resources: [
      "employees",
      "projects",
      "centers",
      "batches",
      "candidates",
      "attendance",
      "leaveRequests",
      "salaries",
      "invoices",
      "procurements",
      "grievances",
      "dashboardMetrics",
    ],
    actions: ["create", "read", "update", "approve", "export"],
  },
  [ROLE_CODES.TRAINER]: {
    scope: "BATCH",
    resources: ["batches", "candidates", "attendance", "assessments", "exposureVisits", "dashboardMetrics"],
    actions: ["read", "update", "export"],
  },
  [ROLE_CODES.MOBILIZER]: {
    scope: "CENTER",
    resources: ["centers", "candidates", "enrollments", "tourRequests", "reimbursements", "dashboardMetrics"],
    actions: ["create", "read", "update"],
  },
  [ROLE_CODES.PLACEMENT_OFFICER]: {
    scope: "PROJECT",
    resources: ["candidates", "companies", "placementDrives", "revenue", "dashboardMetrics"],
    actions: ["create", "read", "update", "export"],
  },
  [ROLE_CODES.CLIENT]: {
    scope: "PROJECT",
    resources: ["projects", "centers", "batches", "dashboardMetrics", "testimonials", "revenue"],
    actions: ["read", "export"],
  },
  [ROLE_CODES.EXECUTIVE]: {
    scope: "GLOBAL",
    resources: ["projects", "finance", "dashboardMetrics", "auditLogs", "revenue"],
    actions: ["read", "export"],
  },
}

export function canAccess(roleCode, resource, action) {
  const rule = roleAccessMatrix[roleCode]
  if (!rule) return false
  return (rule.resources.includes("*") || rule.resources.includes(resource)) && rule.actions.includes(action)
}

export function getRoleScopes(currentUser, db) {
  const employee = currentUser?.employeeId ? db.employees.byId[currentUser.employeeId] : null
  return {
    userId: currentUser?.id,
    roleCodes: (currentUser?.roleIds || []).map((roleId) => db.roles.byId[roleId]?.code).filter(Boolean),
    employeeId: employee?.id,
    projectIds: employee?.projectIds || currentUser?.projectIds || [],
    centerIds: employee?.centerIds || currentUser?.centerIds || [],
    batchIds: employee?.assignedBatchIds || currentUser?.batchIds || [],
    companyIds: currentUser?.companyIds || [],
  }
}
