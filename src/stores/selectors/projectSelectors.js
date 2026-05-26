import { mockDb } from "../../mock-db/index.js"
import { denormalize } from "../../mock-db/shared/normalize.js"

export function selectProjectDirectory(records = denormalize(mockDb.projects)) {
  return records.map((project) => {
    const fundingAgency = mockDb.fundingAgencies.byId[project.fundingAgencyId]
    const centers = denormalize(mockDb.centers).filter((center) => center.projectId === project.id)
    const batches = denormalize(mockDb.batches).filter((batch) => batch.projectId === project.id)
    const enrollments = denormalize(mockDb.enrollments).filter((enrollment) => enrollment.projectId === project.id)
    const drives = denormalize(mockDb.placementDrives).filter((drive) => drive.projectId === project.id)
    return {
      ...project,
      fundingAgency: fundingAgency?.shortName || fundingAgency?.name || "-",
      centerCount: centers.length,
      batchCount: batches.length,
      candidateCount: enrollments.length,
      placementDriveCount: drives.length,
      centers,
      batches,
      status: project.status === "ACTIVE" ? "Active" : project.status,
    }
  })
}

export function selectCenterDirectory(records = denormalize(mockDb.centers)) {
  return records.map((center) => {
    const project = mockDb.projects.byId[center.projectId]
    const manager = mockDb.employees.byId[center.managerEmployeeId]
    const batches = denormalize(mockDb.batches).filter((batch) => batch.centerId === center.id)
    const enrollments = denormalize(mockDb.enrollments).filter((enrollment) => enrollment.centerId === center.id)
    const trainers = denormalize(mockDb.employees).filter((employee) => employee.centerIds?.includes(center.id) && employee.designation === "Trainer")
    return {
      ...center,
      project: project?.name || "-",
      projects: project ? [project.name] : [],
      manager: manager ? `${manager.firstName} ${manager.lastName}` : "-",
      head: manager ? `${manager.firstName} ${manager.lastName}` : "-",
      location: `${center.district}, ${center.state}`,
      batches: batches.length,
      activeBatches: batches.filter((batch) => batch.status === "ACTIVE").length,
      candidates: enrollments.length,
      currentStrength: enrollments.length,
      totalCapacity: batches.reduce((sum, batch) => sum + (batch.capacity || 0), 0),
      trainers: trainers.length,
      contact: center.contact || "-",
      status: center.status === "ACTIVE" ? "Active" : center.status,
    }
  })
}

export function selectEnrollmentCatalog(records = denormalize(mockDb.projects)) {
  return records.map((project) => {
    const school = mockDb.schools.byId[project.schoolId]
    const centers = denormalize(mockDb.centers)
      .filter((center) => center.projectId === project.id)
      .map((center) => ({
        id: center.id,
        name: center.name,
        batches: denormalize(mockDb.batches)
          .filter((batch) => batch.centerId === center.id)
          .map((batch) => ({
            id: batch.id,
            code: batch.code,
            role: batch.trade,
          })),
      }))

    return {
      id: project.id,
      name: project.name,
      school: school?.name || project.name,
      centers,
    }
  })
}

export function selectAdminProjectReports(records = denormalize(mockDb.projects)) {
  return records.map((project) => {
    const fundingAgency = mockDb.fundingAgencies.byId[project.fundingAgencyId]
    const projectEmployees = denormalize(mockDb.employees).filter((employee) => employee.projectIds?.includes(project.id))
    const projectIncharge = projectEmployees.find((employee) => employee.designation === "Project Admin")
    const centers = denormalize(mockDb.centers)
      .filter((center) => center.projectId === project.id)
      .map((center) => {
        const batches = denormalize(mockDb.batches).filter((batch) => batch.centerId === center.id)
        const enrollments = denormalize(mockDb.enrollments).filter((enrollment) => enrollment.centerId === center.id)
        const employees = denormalize(mockDb.employees).filter((employee) => employee.centerIds?.includes(center.id))
        const grievances = denormalize(mockDb.grievances).filter((grievance) => grievance.centerId === center.id)
        const attendance = denormalize(mockDb.attendance).filter((record) => record.centerId === center.id)
        const present = attendance.filter((record) => record.status === "PRESENT").length
        const attendanceRate = attendance.length ? Math.round((present / attendance.length) * 100) : 88
        const assessments = denormalize(mockDb.assessments).filter((assessment) => batches.some((batch) => batch.id === assessment.batchId))
        const approvedAssessments = assessments.filter((assessment) => assessment.status === "APPROVED").length
        const assessmentPassRate = assessments.length ? Math.round((approvedAssessments / assessments.length) * 100) : 82
        const drives = denormalize(mockDb.placementDrives).filter((drive) => drive.centerId === center.id)
        const placedCandidateIds = new Set(drives.flatMap((drive) => drive.candidateIds || []))
        const placementRate = enrollments.length ? Math.round((placedCandidateIds.size / enrollments.length) * 100) : 0

        return {
          id: center.id,
          name: center.name,
          location: center.district,
          manager: getEmployeeName(mockDb.employees.byId[center.managerEmployeeId]) || "Unassigned",
          jobRoles: [...new Set(batches.map((batch) => batch.trade))],
          employees: employees.length,
          candidates: enrollments.length,
          placementRate,
          attendanceRate,
          grievances: grievances.length,
          performanceMetrics: [
            { label: "Enrollment Achievement", value: `${Math.min(100, Math.round((enrollments.length / Math.max(1, batches.reduce((sum, batch) => sum + batch.capacity, 0))) * 100))}%` },
            { label: "Assessment Pass Rate", value: `${assessmentPassRate}%` },
            { label: "Placement Conversion", value: `${placementRate}%` },
            { label: "Retention After 90 Days", value: `${Math.max(62, placementRate - 7)}%` },
          ],
          employeeList: employees.map(getEmployeeName),
          normalizedCandidatesByBatch: Object.fromEntries(
            batches.map((batch) => {
              const batchEnrollments = enrollments.filter((enrollment) => enrollment.batchId === batch.id)
              return [
                batch.code,
                batchEnrollments
                  .map((enrollment) => {
                    const candidate = mockDb.candidates.byId[enrollment.candidateId]
                    return candidate
                      ? {
                          id: candidate.id,
                          name: [candidate.firstName, candidate.lastName].filter(Boolean).join(" "),
                          phone: candidate.phone,
                          gender: candidate.gender,
                          jobRole: batch.trade,
                          enrollmentDate: enrollment.enrolledOn,
                          enrollmentStatus: enrollment.status,
                          mobilizer: getEmployeeName(mockDb.employees.byId[candidate.mobilizerEmployeeId]),
                          district: candidate.district,
                        }
                      : null
                  })
                  .filter(Boolean),
              ]
            })
          ),
          candidateList: batches.map((batch) => {
            const batchEnrollments = enrollments.filter((enrollment) => enrollment.batchId === batch.id)
            return `${batch.code} - ${batchEnrollments.length || batch.capacity}`
          }),
          grievancesList: grievances.length
            ? grievances.map((grievance) => `${grievance.category} grievance ${grievance.status?.toLowerCase()}`)
            : ["No active grievances"],
        }
      })

    return {
      id: project.id,
      name: project.name,
      fundingAgency: fundingAgency?.shortName || fundingAgency?.name || "-",
      fundingAgencyName: fundingAgency?.name || fundingAgency?.shortName || "-",
      projectIncharge: projectIncharge
        ? {
            id: projectIncharge.id,
            name: getEmployeeName(projectIncharge),
            designation: projectIncharge.designation,
            email: projectIncharge.email,
            phone: projectIncharge.phone,
            employeeCode: projectIncharge.employeeCode,
            status: projectIncharge.status,
          }
        : null,
      associatedEmployees: projectEmployees.map((employee) => ({
        id: employee.id,
        name: getEmployeeName(employee),
        designation: employee.designation,
        email: employee.email,
        phone: employee.phone,
        employeeCode: employee.employeeCode,
        status: employee.status,
        centerIds: employee.centerIds || [],
      })),
      status: project.status === "ACTIVE" ? "Active" : project.status === "MONITORING" ? "Monitoring" : project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      centers,
    }
  })
}

export function selectProjectFormOptions(records = denormalize(mockDb.projects)) {
  return {
    schemes: records.map((project) => ({ value: project.id, label: project.name })),
    centers: denormalize(mockDb.centers).map((center) => ({ value: center.id, label: center.name })),
    sectors: denormalize(mockDb.schools).map((school) => ({ value: school.id, label: school.vertical })),
    statuses: [
      { value: "ACTIVE", label: "Active" },
      { value: "MONITORING", label: "Monitoring" },
      { value: "PLANNING", label: "Planning" },
    ],
    fundingAgencies: denormalize(mockDb.fundingAgencies).map((agency) => ({ value: agency.id, label: agency.name })),
  }
}

export function selectAdminDashboardData(projectRecords = denormalize(mockDb.projects), employeeRecords = denormalize(mockDb.employees)) {
  const projects = selectProjectDirectory(projectRecords)
  const centers = denormalize(mockDb.centers)
  const enrollments = denormalize(mockDb.enrollments)
  const candidates = denormalize(mockDb.candidates)
  const attendance = denormalize(mockDb.attendance)
  const present = attendance.filter((record) => record.status === "PRESENT").length
  const roleCounts = employeeRecords.reduce((acc, employee) => {
    const role = mockDb.roles.byId[employee.roleIds?.[0]]
    const key = role?.name || "Employee"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const roleColor = {
    Trainer: "#10b981",
    Mobilizer: "#facc15",
    "Placement Officer": "#22d3ee",
    Admin: "#8b5cf6",
    "Super Admin": "#a78bfa",
  }
  const projectRows = projects.map((project) => {
    const projectEnrollments = enrollments.filter((enrollment) => enrollment.projectId === project.id)
    const projectAssessments = denormalize(mockDb.assessments).filter((assessment) =>
      project.batches.some((batch) => batch.id === assessment.batchId)
    )
    const certified = denormalize(mockDb.certifications).filter((certification) =>
      projectAssessments.some((assessment) => assessment.id === certification.assessmentId)
    ).length
    const placedIds = new Set(
      denormalize(mockDb.placementDrives)
        .filter((drive) => drive.projectId === project.id)
        .flatMap((drive) => drive.candidateIds || [])
    )
    const capacity = project.batches.reduce((sum, batch) => sum + (batch.capacity || 0), 0)

    return {
      name: project.name,
      center: project.centers[0]?.name || "Unassigned",
      status: project.status,
      progress: capacity ? Math.min(100, Math.round((projectEnrollments.length / capacity) * 100)) : 0,
      enrolled: projectEnrollments.length,
      certified,
      placed: placedIds.size,
    }
  })

  return {
    totalData: {
      totalUsers: employeeRecords.length,
      totalUsersTarget: Math.max(20, employeeRecords.length + 10),
      admissions: candidates.length,
      admissionsTarget: Math.max(50, candidates.length + 20),
      activeCenters: centers.filter((center) => center.status === "ACTIVE").length,
      activeCentersTarget: Math.max(10, centers.length + 3),
      activeProjects: projects.filter((project) => project.status === "Active").length,
      activeProjectsTarget: Math.max(8, projects.length + 3),
      overallAttendance: attendance.length ? Math.round((present / attendance.length) * 100) : 0,
      attendanceTarget: 95,
    },
    lastMonthData: {
      totalUsers: employeeRecords.filter((employee) => employee.joinedOn?.startsWith("2026-05")).length,
      totalUsersTarget: 10,
      admissions: enrollments.filter((enrollment) => enrollment.enrolledOn?.startsWith("2026-05")).length,
      admissionsTarget: 30,
      activeCenters: centers.filter((center) => center.status === "ACTIVE").length,
      activeCentersTarget: centers.length,
      activeProjects: projects.filter((project) => project.status === "Active").length,
      activeProjectsTarget: projects.length,
      overallAttendance: attendance.length ? Math.round((present / attendance.length) * 100) : 0,
      attendanceTarget: 95,
    },
    projectCards: projects.map((project) => ({
      project: project.name,
      center: project.centers[0]?.name || "Unassigned",
      status: project.status,
    })),
    roleData: Object.entries(roleCounts).map(([name, value]) => ({
      name: name === "Placement Officer" ? "Placement Officers" : `${name}s`,
      value,
      color: roleColor[name] || "#94a3b8",
    })),
    recentActivity: [
      ...candidates.slice(-2).map((candidate) => ({
        type: "candidate",
        text: `${candidate.firstName} ${candidate.lastName} entered the candidate lifecycle`,
        time: "Today",
        color: "text-violet-400",
      })),
      ...denormalize(mockDb.placementDrives).slice(-2).map((drive) => ({
        type: "placement",
        text: `${mockDb.companies.byId[drive.companyId]?.name || "Company"} placement drive is ${drive.status?.toLowerCase()}`,
        time: drive.scheduledOn || "Scheduled",
        color: "text-cyan-400",
      })),
      ...denormalize(mockDb.grievances).slice(-2).map((grievance) => ({
        type: "alert",
        text: `${grievance.category} grievance is ${grievance.status?.toLowerCase()}`,
        time: "Open workflow",
        color: "text-red-400",
      })),
    ],
    projects: projectRows,
  }
}

function getEmployeeName(employee) {
  return [employee?.firstName, employee?.lastName].filter(Boolean).join(" ")
}
