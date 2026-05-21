import { ROLE_CODES } from "../shared/enums.js"

export const permissions = [
  { id: "PER-0001", resource: "*", action: "create" },
  { id: "PER-0002", resource: "*", action: "read" },
  { id: "PER-0003", resource: "*", action: "update" },
  { id: "PER-0004", resource: "*", action: "delete" },
  { id: "PER-0005", resource: "*", action: "approve" },
  { id: "PER-0006", resource: "*", action: "export" },
]

export const roles = [
  { id: "ROL-0001", code: ROLE_CODES.SUPER_ADMIN, name: "Super Admin", scopeType: "GLOBAL", permissionIds: permissions.map((p) => p.id) },
  { id: "ROL-0002", code: ROLE_CODES.ADMIN, name: "Admin", scopeType: "PROJECT", permissionIds: ["PER-0001", "PER-0002", "PER-0003", "PER-0005", "PER-0006"] },
  { id: "ROL-0003", code: ROLE_CODES.TRAINER, name: "Trainer", scopeType: "BATCH", permissionIds: ["PER-0002", "PER-0003", "PER-0006"] },
  { id: "ROL-0004", code: ROLE_CODES.MOBILIZER, name: "Mobilizer", scopeType: "CENTER", permissionIds: ["PER-0001", "PER-0002", "PER-0003"] },
  { id: "ROL-0005", code: ROLE_CODES.PLACEMENT_OFFICER, name: "Placement Officer", scopeType: "PROJECT", permissionIds: ["PER-0001", "PER-0002", "PER-0003", "PER-0006"] },
  { id: "ROL-0006", code: ROLE_CODES.CLIENT, name: "Client", scopeType: "PROJECT", permissionIds: ["PER-0002", "PER-0006"] },
  { id: "ROL-0007", code: ROLE_CODES.EXECUTIVE, name: "Executive", scopeType: "GLOBAL", permissionIds: ["PER-0002", "PER-0006"] },
]

export const users = [
  { id: "USR-0001", employeeId: "EMP-0008", roleIds: ["ROL-0001"], email: "superadmin@pantiss.org", passwordHash: "mock-only", status: "ACTIVE", lastLoginAt: "2026-05-20T08:40:00+05:30" },
  { id: "USR-0002", employeeId: "EMP-0007", roleIds: ["ROL-0002"], email: "admin.angul@pantiss.org", passwordHash: "mock-only", status: "ACTIVE", lastLoginAt: "2026-05-20T09:10:00+05:30" },
  { id: "USR-0003", employeeId: "EMP-0001", roleIds: ["ROL-0003"], email: "trainer.angul@pantiss.org", passwordHash: "mock-only", status: "ACTIVE", lastLoginAt: "2026-05-20T10:00:00+05:30" },
  { id: "USR-0004", employeeId: "EMP-0003", roleIds: ["ROL-0004"], email: "mobilizer.angul@pantiss.org", passwordHash: "mock-only", status: "ACTIVE", lastLoginAt: "2026-05-20T10:20:00+05:30" },
  { id: "USR-0005", employeeId: "EMP-0002", roleIds: ["ROL-0005"], email: "placement.angul@pantiss.org", passwordHash: "mock-only", status: "ACTIVE", lastLoginAt: "2026-05-20T11:00:00+05:30" },
  { id: "USR-0006", employeeId: null, roleIds: ["ROL-0006"], projectIds: ["PRJ-0002"], email: "client.tata@pantiss.org", passwordHash: "mock-only", status: "ACTIVE", lastLoginAt: "2026-05-20T11:30:00+05:30" },
]

export const authDomain = { permissions, roles, users }
