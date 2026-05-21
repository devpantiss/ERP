import { mockDb } from "../../mock-db/index.js"
import { denormalize } from "../../mock-db/shared/normalize.js"

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  TRAINER: "Trainer",
  MOBILIZER: "Mobilizer",
  PLACEMENT_OFFICER: "Placement Officer",
  CLIENT: "Client",
  EXECUTIVE: "Executive",
}

const STATUS_LABELS = {
  ACTIVE: "Active",
  ON_LEAVE: "On Leave",
  PROBATION: "Probation",
  EXITED: "Inactive",
  INACTIVE: "Inactive",
}

export function getRoleLabel(roleId) {
  const role = mockDb.roles.byId[roleId]
  return ROLE_LABELS[role?.code] || role?.name || "Employee"
}

export function getRoleIdByLabel(label) {
  return denormalize(mockDb.roles).find((role) => (ROLE_LABELS[role.code] || role.name) === label)?.id
}

export function getEmployeeName(employee) {
  return [employee?.firstName, employee?.lastName].filter(Boolean).join(" ")
}

export function toEmployeeDirectoryRow(employee) {
  const role = getRoleLabel(employee.roleIds?.[0])
  const center = mockDb.centers.byId[employee.centerIds?.[0]]
  const project = mockDb.projects.byId[employee.projectIds?.[0]]
  const candidateCount = denormalize(mockDb.candidates).filter(
    (candidate) => candidate.mobilizerEmployeeId === employee.id
  ).length
  const driveCount = denormalize(mockDb.placementDrives).filter(
    (drive) => drive.placementOfficerEmployeeId === employee.id
  ).length

  return {
    ...employee,
    name: getEmployeeName(employee),
    role,
    center: center?.name || "Unassigned",
    centerId: center?.id || null,
    project: project?.name || "Unassigned",
    projectId: project?.id || null,
    status: STATUS_LABELS[employee.status] || employee.status,
    joinDate: employee.joinedOn,
    avatar: `https://i.pravatar.cc/80?u=${employee.id}`,
    performance: derivePerformance(employee, candidateCount, driveCount),
    candidatesMobilized: candidateCount,
    eventsCompleted: denormalize(mockDb.tourRequests).filter((tour) => tour.employeeId === employee.id).length,
    attendanceRate: deriveAttendanceRate(employee.id),
    placementDrives: driveCount,
  }
}

export function selectEmployeeDirectory(records = denormalize(mockDb.employees)) {
  return records.map(toEmployeeDirectoryRow)
}

export function selectEmployeesByRole(roleLabel, records) {
  return selectEmployeeDirectory(records).filter((employee) => employee.role === roleLabel)
}

export function selectProjectCardsFromEmployees(records) {
  const rows = selectEmployeeDirectory(records)
  const projects = denormalize(mockDb.projects)
  return projects.map((project) => {
    const projectRows = rows.filter((employee) => employee.projectId === project.id)
    const centers = denormalize(mockDb.centers).filter((center) => center.projectId === project.id)
    return {
      ...project,
      employeeCount: projectRows.length,
      employees: projectRows.length,
      activeEmployees: projectRows.filter((employee) => employee.status === "Active").length,
      centers: centers.length,
      name: project.name,
      status: project.status,
    }
  })
}

export function selectUserDirectory() {
  return denormalize(mockDb.users).map((user) => {
    const employee = user.employeeId ? mockDb.employees.byId[user.employeeId] : null
    const row = employee ? toEmployeeDirectoryRow(employee) : null
    return {
      ...user,
      id: user.id,
      employeeId: user.employeeId,
      name: row?.name || user.email,
      email: user.email,
      phone: row?.phone || "-",
      role: user.roleIds?.map(getRoleLabel).join(", ") || "Client",
      center: row?.center || "Client Portal",
      project: row?.project || user.projectIds?.map((id) => mockDb.projects.byId[id]?.name).filter(Boolean).join(", "),
      status: STATUS_LABELS[user.status] || user.status,
      joinDate: row?.joinDate || "-",
      avatar: `https://i.pravatar.cc/80?u=${user.id}`,
    }
  })
}

export function selectRoleOptions() {
  return ["All", ...denormalize(mockDb.roles).map((role) => ROLE_LABELS[role.code] || role.name)]
}

function derivePerformance(employee, candidateCount, driveCount) {
  if (employee.roleIds?.some((roleId) => mockDb.roles.byId[roleId]?.code === "MOBILIZER")) {
    return Math.min(98, 82 + candidateCount * 4)
  }
  if (employee.roleIds?.some((roleId) => mockDb.roles.byId[roleId]?.code === "PLACEMENT_OFFICER")) {
    return Math.min(98, 84 + driveCount * 5)
  }
  return employee.status === "ON_LEAVE" ? 78 : 91
}

function deriveAttendanceRate(employeeId) {
  const entries = denormalize(mockDb.attendance).filter(
    (record) => record.subjectType === "EMPLOYEE" && record.subjectId === employeeId
  )
  if (!entries.length) return 90
  const present = entries.filter((record) => record.status === "PRESENT").length
  return Math.round((present / entries.length) * 100)
}
