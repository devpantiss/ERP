import { analyticsDomain } from "./analytics/index.js"
import { authDomain } from "./auth/index.js"
import { financeDomain } from "./finance/index.js"
import { hrDomain } from "./hr/index.js"
import { mobilizationDomain } from "./mobilization/index.js"
import { operationsDomain } from "./operations/index.js"
import { placementDomain } from "./placement/index.js"
import { sharedDomain } from "./shared/index.js"
import { createMockDomain, assertReferences } from "./shared/normalize.js"
import { trainingDomain } from "./training/index.js"

export { roleAccessMatrix, canAccess, getRoleScopes } from "./shared/access-control.js"
export { ENTITY_STATUS, ROLE_CODES } from "./shared/enums.js"
export { entityDependencyGraph, relationshipMap } from "./shared/relationships.js"
export { schemas } from "./shared/schemas.js"

const records = {
  ...authDomain,
  ...hrDomain,
  ...operationsDomain,
  ...trainingDomain,
  ...placementDomain,
  ...mobilizationDomain,
  ...financeDomain,
  ...sharedDomain,
  ...analyticsDomain,
}

export const mockDb = createMockDomain(records)

export const referenceChecks = [
  { entity: "users", field: "employeeId", target: "employees", optional: true },
  { entity: "users", field: "roleIds", target: "roles", many: true },
  { entity: "roles", field: "permissionIds", target: "permissions", many: true },
  { entity: "employees", field: "roleIds", target: "roles", many: true },
  { entity: "employees", field: "projectIds", target: "projects", many: true },
  { entity: "employees", field: "centerIds", target: "centers", many: true },
  { entity: "employees", field: "assignedBatchIds", target: "batches", many: true },
  { entity: "projects", field: "fundingAgencyId", target: "fundingAgencies" },
  { entity: "projects", field: "schoolId", target: "schools" },
  { entity: "centers", field: "projectId", target: "projects" },
  { entity: "centers", field: "managerEmployeeId", target: "employees" },
  { entity: "batches", field: "projectId", target: "projects" },
  { entity: "batches", field: "centerId", target: "centers" },
  { entity: "batches", field: "trainerEmployeeId", target: "employees" },
  { entity: "candidates", field: "mobilizerEmployeeId", target: "employees" },
  { entity: "enrollments", field: "candidateId", target: "candidates" },
  { entity: "enrollments", field: "projectId", target: "projects" },
  { entity: "enrollments", field: "centerId", target: "centers" },
  { entity: "enrollments", field: "batchId", target: "batches" },
  { entity: "placementDrives", field: "companyId", target: "companies" },
  { entity: "placementDrives", field: "projectId", target: "projects" },
  { entity: "placementDrives", field: "centerId", target: "centers" },
  { entity: "placementDrives", field: "placementOfficerEmployeeId", target: "employees" },
  { entity: "placementDrives", field: "candidateIds", target: "candidates", many: true },
  { entity: "assessments", field: "candidateId", target: "candidates" },
  { entity: "certifications", field: "assessmentId", target: "assessments" },
]

export function validateMockDb() {
  return assertReferences(mockDb, referenceChecks)
}
