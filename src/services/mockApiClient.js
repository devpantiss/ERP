import { getRoleScopes, mockDb } from "../mock-db/index.js"
import { clone, nextId } from "../mock-db/shared/id.js"
import { denormalize } from "../mock-db/shared/normalize.js"

const LATENCY_MS = 140

function delay(payload) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(clone(payload)), LATENCY_MS)
  })
}

function getTable(entityName) {
  const table = mockDb[entityName]
  if (!table) throw new Error(`Unknown mock entity: ${entityName}`)
  return table
}

function matchesFilters(record, filters = {}) {
  return Object.entries(filters).every(([key, expected]) => {
    if (expected === undefined || expected === null || expected === "") return true
    const actual = record[key]
    if (Array.isArray(actual)) return actual.includes(expected)
    if (Array.isArray(expected)) return expected.includes(actual)
    return actual === expected
  })
}

export function applyRoleScope(entityName, records, currentUser) {
  if (!currentUser) return records
  const scopes = getRoleScopes(currentUser, mockDb)
  if (scopes.roleCodes.includes("SUPER_ADMIN") || scopes.roleCodes.includes("EXECUTIVE")) return records

  return records.filter((record) => {
    if (record.projectId) return scopes.projectIds.includes(record.projectId)
    if (record.centerId) return scopes.centerIds.includes(record.centerId)
    if (record.batchId) return scopes.batchIds.includes(record.batchId)
    if (record.employeeId) return record.employeeId === scopes.employeeId || scopes.projectIds.some((id) => record.projectIds?.includes(id))
    if (entityName === "projects") return scopes.projectIds.includes(record.id)
    if (entityName === "centers") return scopes.centerIds.includes(record.id)
    if (entityName === "batches") return scopes.batchIds.includes(record.id) || scopes.centerIds.includes(record.centerId)
    if (entityName === "employees") return scopes.projectIds.some((id) => record.projectIds?.includes(id))
    if (entityName === "candidates") return record.mobilizerEmployeeId === scopes.employeeId || candidateIsInScope(record.id, scopes)
    return true
  })
}

function candidateIsInScope(candidateId, scopes) {
  return denormalize(mockDb.enrollments).some((enrollment) => {
    return (
      enrollment.candidateId === candidateId &&
      (scopes.projectIds.includes(enrollment.projectId) ||
        scopes.centerIds.includes(enrollment.centerId) ||
        scopes.batchIds.includes(enrollment.batchId))
    )
  })
}

export function joinRecord(record, include = []) {
  const joined = { ...record }
  include.forEach((relation) => {
    if (relation === "project" && record.projectId) joined.project = mockDb.projects.byId[record.projectId]
    if (relation === "center" && record.centerId) joined.center = mockDb.centers.byId[record.centerId]
    if (relation === "batch" && record.batchId) joined.batch = mockDb.batches.byId[record.batchId]
    if (relation === "employee" && record.employeeId) joined.employee = mockDb.employees.byId[record.employeeId]
    if (relation === "candidate" && record.candidateId) joined.candidate = mockDb.candidates.byId[record.candidateId]
    if (relation === "company" && record.companyId) joined.company = mockDb.companies.byId[record.companyId]
    if (relation === "roles" && record.roleIds) joined.roles = record.roleIds.map((id) => mockDb.roles.byId[id]).filter(Boolean)
    if (relation === "fundingAgency" && record.fundingAgencyId) joined.fundingAgency = mockDb.fundingAgencies.byId[record.fundingAgencyId]
  })
  return joined
}

export function createCrudService(entityName) {
  return {
    async list({ filters = {}, include = [], currentUser } = {}) {
      const records = applyRoleScope(entityName, denormalize(getTable(entityName)), currentUser)
        .filter((record) => matchesFilters(record, filters))
        .map((record) => joinRecord(record, include))
      return delay({ data: records, meta: { count: records.length, entity: entityName } })
    },

    async getById(id, { include = [], currentUser } = {}) {
      const record = getTable(entityName).byId[id]
      const scoped = record ? applyRoleScope(entityName, [record], currentUser) : []
      return delay({ data: scoped[0] ? joinRecord(scoped[0], include) : null })
    },

    async create(payload, { currentUser } = {}) {
      const table = getTable(entityName)
      const id = payload.id || nextId(entityName, table.allIds)
      const record = { ...payload, id, createdByUserId: currentUser?.id || "SYSTEM", createdAt: new Date().toISOString() }
      table.byId[id] = record
      table.allIds.push(id)
      return delay({ data: clone(record) })
    },

    async update(id, patch, { currentUser } = {}) {
      const table = getTable(entityName)
      if (!table.byId[id]) return delay({ data: null })
      table.byId[id] = { ...table.byId[id], ...patch, updatedByUserId: currentUser?.id || "SYSTEM", updatedAt: new Date().toISOString() }
      return delay({ data: clone(table.byId[id]) })
    },

    async remove(id) {
      const table = getTable(entityName)
      delete table.byId[id]
      table.allIds = table.allIds.filter((recordId) => recordId !== id)
      return delay({ data: { id } })
    },
  }
}
