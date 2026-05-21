import { mockDb } from "../../mock-db/index.js"
import { denormalize } from "../../mock-db/shared/normalize.js"

const CANDIDATE_STATUS = {
  MOBILIZED: "Pending",
  IN_TRAINING: "Enrolled",
  ASSESSED: "Enrolled",
  CERTIFIED: "Enrolled",
  PLACED: "Enrolled",
  DROPPED: "Dropped",
}

const PROOF_IMAGES = [
  "/Frames/scene1/frame_0000.webp",
  "/Frames/scene1/frame_0024.webp",
  "/Frames/scene1/frame_0045.webp",
  "/Frames/scene2/frame_0000.webp",
  "/Frames/scene2/frame_0024.webp",
  "/Frames/scene3/frame_0002.webp",
  "/Frames/scene4/frame_0004.webp",
  "/Frames/scene4/frame_0049.webp",
]

const STATUS_LABELS = {
  ACTIVE: "Active",
  MONITORING: "Monitoring",
  PLANNING: "Planning",
  APPROVED: "Approved",
  SUBMITTED: "Submitted",
  COMPLETED: "Completed",
  UNDER_REVIEW: "Submitted",
  SCHEDULED: "Planned",
  IN_PROGRESS: "Approved",
}

function candidateName(candidate) {
  return [candidate.firstName, candidate.lastName].filter(Boolean).join(" ")
}

function getEnrollment(candidateId) {
  return denormalize(mockDb.enrollments).find((enrollment) => enrollment.candidateId === candidateId)
}

function toProjectCard(project) {
  const fundingAgency = mockDb.fundingAgencies.byId[project.fundingAgencyId]
  return {
    ...project,
    fundingAgency: fundingAgency?.shortName || fundingAgency?.name || "-",
    status: project.status === "ACTIVE" ? "Active" : project.status,
  }
}

export function selectSuperAdminProjectHierarchy(projects = denormalize(mockDb.projects)) {
  const enrollments = denormalize(mockDb.enrollments)
  const candidates = denormalize(mockDb.candidates)
  const placedCandidateIds = new Set(candidates.filter((candidate) => candidate.status === "PLACED").map((candidate) => candidate.id))

  return projects.map((project) => {
    const projectCenters = denormalize(mockDb.centers).filter((center) => center.projectId === project.id)
    const centers = projectCenters.map((center) => {
      const centerBatches = denormalize(mockDb.batches).filter((batch) => batch.centerId === center.id)
      const centerEnrollments = enrollments.filter((enrollment) => enrollment.centerId === center.id)
      const centerCandidates = centerEnrollments
        .map((enrollment) => candidates.find((candidate) => candidate.id === enrollment.candidateId))
        .filter(Boolean)
      const dropped = centerCandidates.filter((candidate) => candidate.status === "DROPPED").length
      const enrolled = centerCandidates.filter((candidate) => CANDIDATE_STATUS[candidate.status] === "Enrolled").length
      const batches = centerBatches.map((batch) => {
        const trainer = mockDb.employees.byId[batch.trainerEmployeeId]
        const batchEnrollments = centerEnrollments.filter((enrollment) => enrollment.batchId === batch.id)
        const batchCandidates = batchEnrollments
          .map((enrollment, index) => {
            const candidate = candidates.find((item) => item.id === enrollment.candidateId)
            if (!candidate) return null
            const candidateAttendance = attendanceRate("CANDIDATE", candidate.id)
            const moduleCompletion = candidate.status === "PLACED" || candidate.status === "CERTIFIED"
              ? 100
              : candidate.status === "ASSESSED"
                ? 82
                : candidate.status === "IN_TRAINING"
                  ? 62 + (index % 3) * 8
                  : 20
            const totalTheory = 120
            const totalPractical = 160
            return {
              ...candidate,
              name: candidateName(candidate),
              center: center.district || center.name,
              batch: batch.code,
              project: project.name,
              course: batch.trade,
              enrollmentDate: enrollment.enrolledOn,
              status: CANDIDATE_STATUS[candidate.status] || candidate.status,
              placementStatus: placedCandidateIds.has(candidate.id) ? "Placed" : candidate.status === "DROPPED" ? "Not Placed" : "Pending",
              phone: candidate.phone,
              theoryHours: Math.round((moduleCompletion / 100) * totalTheory),
              totalTheory,
              practicalHours: Math.round((moduleCompletion / 100) * totalPractical),
              totalPractical,
              attendance: candidateAttendance,
              moduleCompletion,
            }
          })
          .filter(Boolean)

        return {
          ...batch,
          label: batch.code,
          jobRole: batch.trade,
          trainer: trainer ? employeeName(trainer) : "-",
          learners: batchCandidates.length,
          status: batch.status === "ACTIVE" ? "Active" : batch.status,
          candidates: batchCandidates,
        }
      })
      const totalModules = Math.max(batches.length * 12, 1)
      const completedModules = batches.reduce((sum, batch) => sum + (batch.status === "Active" ? 8 : 12), 0)

      return {
        ...center,
        name: center.district || center.name,
        fullName: center.name,
        manager: mockDb.employees.byId[center.managerEmployeeId]
          ? employeeName(mockDb.employees.byId[center.managerEmployeeId])
          : "-",
        mobilization: {
          mobilized: centerCandidates.length,
          enrolled,
          dropoffs: dropped,
        },
        batches,
        totalModules,
        completedModules,
      }
    })

    return {
      ...toProjectCard(project),
      centers,
      totalModules: centers.reduce((sum, center) => sum + center.totalModules, 0),
      completedModules: centers.reduce((sum, center) => sum + center.completedModules, 0),
    }
  })
}

export function selectSuperAdminPlacementDrives(drives = denormalize(mockDb.placementDrives)) {
  return drives.map((drive) => {
    const project = mockDb.projects.byId[drive.projectId]
    const center = mockDb.centers.byId[drive.centerId]
    const company = mockDb.companies.byId[drive.companyId]
    const students = (drive.candidateIds || []).map((candidateId) => {
      const candidate = mockDb.candidates.byId[candidateId]
      const enrollment = getEnrollment(candidateId)
      const batch = enrollment ? mockDb.batches.byId[enrollment.batchId] : null
      const status = candidate?.status === "PLACED" ? "Selected" : candidate?.status === "DROPPED" ? "Rejected" : "Pending"
      return {
        id: `${drive.id}-${candidateId}`,
        name: candidate ? candidateName(candidate) : candidateId,
        center: center?.district || center?.name || "-",
        batch: batch?.code || "-",
        course: batch?.trade || "-",
        salary: status === "Selected" && drive.offeredCtc ? Math.round(drive.offeredCtc / 12) : null,
        status,
      }
    })

    return {
      ...drive,
      project: project?.name || "-",
      projectId: project?.id || drive.projectId,
      driveName: `${company?.name || "Company"} Placement Drive`,
      company: company?.name || "-",
      date: drive.scheduledOn,
      participated: students.length,
      selected: students.filter((student) => student.status === "Selected").length,
      students,
    }
  })
}

export function selectMobilizedRows(center) {
  if (!center) return []

  return center.batches.flatMap((batch) =>
    batch.candidates.map((candidate, index) => ({
      id: `MOB-${candidate.id}`,
      name: candidate.name,
      center: center.name,
      batch: candidate.batch,
      course: candidate.course,
      mobilizationDate: candidate.enrollmentDate,
      mobStatus: CANDIDATE_STATUS[candidate.status] || "Pending",
      phone: candidate.phone || `+91 90000 ${String(index + 1).padStart(5, "0")}`,
    }))
  )
}

function employeeName(employee) {
  return [employee.firstName, employee.lastName].filter(Boolean).join(" ")
}

function roleLabel(employee) {
  const role = mockDb.roles.byId[employee.roleIds?.[0]]
  const labels = {
    TRAINER: "Trainer",
    MOBILIZER: "Mobilizer",
    PLACEMENT_OFFICER: "Placement Officer",
    ADMIN: "Admin",
    SUPER_ADMIN: "Super Admin",
  }
  return labels[role?.code] || role?.name || "Employee"
}

function employeeCenter(employee) {
  return mockDb.centers.byId[employee.centerIds?.[0]]
}

function attendanceRate(subjectType, subjectId) {
  const records = denormalize(mockDb.attendance).filter(
    (entry) => entry.subjectType === subjectType && entry.subjectId === subjectId
  )
  if (!records.length) return 90
  return Math.round((records.filter((entry) => entry.status === "PRESENT").length / records.length) * 100)
}

function findEmployeeByRole(id, role, employees) {
  return employees.find((employee) => employee.id === id && roleLabel(employee) === role)
    || employees.find((employee) => roleLabel(employee) === role)
}

function employeeSummary(employee) {
  const center = employeeCenter(employee)
  return {
    id: employee?.id || "-",
    name: employee ? employeeName(employee) : "Unassigned Employee",
    center: center?.district || center?.name || "Unassigned",
  }
}

function formatPercent(value, total) {
  return `${total ? Math.round((value / total) * 100) : 0}%`
}

function formatShortDate(date) {
  if (!date) return "-"
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(date))
}

function statusLabel(status) {
  return STATUS_LABELS[status] || status
}

function proofSet(index, status) {
  if (!["Submitted", "Completed"].includes(status)) return []
  const count = status === "Submitted" ? 3 : 2
  return Array.from({ length: count }, (_, offset) => PROOF_IMAGES[(index + offset) % PROOF_IMAGES.length])
}

function recentAttendanceRows(subjectId) {
  const records = denormalize(mockDb.attendance)
    .filter((entry) => entry.subjectType === "EMPLOYEE" && entry.subjectId === subjectId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  if (records.length) {
    return records.map((record) => ({
      date: formatShortDate(record.date),
      s1: record.status === "PRESENT" ? "P" : "A",
      s2: record.status === "PRESENT" ? "P" : "A",
      s3: record.status === "PRESENT" ? "P" : "A",
    }))
  }

  const rate = attendanceRate("EMPLOYEE", subjectId)
  return ["21 May", "20 May", "19 May", "18 May", "17 May"].map((date, index) => ({
    date,
    s1: rate - index * 3 >= 75 ? "P" : "A",
    s2: rate - index * 2 >= 78 ? "P" : "A",
    s3: rate - index * 4 >= 72 ? "P" : "A",
  }))
}

function weeklyRows(metric, total) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return days.map((day, index) => ({
    day,
    [metric]: Math.max(0, Math.round((total / days.length) + ((index % 3) - 1))),
  }))
}

export function selectMobilizerDetail(employeeId, employees = denormalize(mockDb.employees)) {
  const employee = findEmployeeByRole(employeeId, "Mobilizer", employees)
  const candidates = denormalize(mockDb.candidates).filter((candidate) => candidate.mobilizerEmployeeId === employee?.id)
  const enrolled = candidates.filter((candidate) => CANDIDATE_STATUS[candidate.status] === "Enrolled").length
  const pending = candidates.filter((candidate) => candidate.status === "MOBILIZED").length
  const rejected = candidates.filter((candidate) => candidate.status === "DROPPED" || candidate.status === "REJECTED").length
  const tourRequests = denormalize(mockDb.tourRequests).filter((request) => request.employeeId === employee?.id)

  return {
    employee: employeeSummary(employee),
    kpi: {
      mobilized: candidates.length,
      events: tourRequests.length,
      attendance: `${attendanceRate("EMPLOYEE", employee?.id)}%`,
      enrollmentRate: formatPercent(enrolled, candidates.length),
      enrolled,
      pending,
      rejected,
    },
    enrollmentStatus: [
      { name: "Enrolled", value: enrolled, color: "#ef4444" },
      { name: "Pending", value: pending, color: "#f59e0b" },
      { name: "Rejected", value: rejected, color: "#64748b" },
    ],
    weeklyActivity: weeklyRows("candidates", candidates.length),
    recentEvents: tourRequests.map((request) => {
      const center = mockDb.centers.byId[request.centerId]
      return {
        id: request.id,
        name: request.purpose,
        location: request.destination || center?.district || center?.name || "-",
        date: formatShortDate(request.fromDate),
        participants: candidates.filter((candidate) => candidate.district === center?.district).length || candidates.length,
        status: request.status === "APPROVED" ? "Completed" : "Planned",
      }
    }),
    attendance: recentAttendanceRows(employee?.id),
  }
}

export function selectTrainerDetail(employeeId, employees = denormalize(mockDb.employees)) {
  const employee = findEmployeeByRole(employeeId, "Trainer", employees)
  const batches = denormalize(mockDb.batches).filter((batch) => batch.trainerEmployeeId === employee?.id)
  const visits = denormalize(mockDb.exposureVisits).filter((visit) => batches.some((batch) => batch.id === visit.batchId))
  const totalModules = Math.max(batches.length * 12, 1)
  const modulesCompleted = batches.reduce((sum, batch) => sum + (batch.status === "ACTIVE" ? 8 : 12), 0)
  const attendance = `${attendanceRate("EMPLOYEE", employee?.id)}%`

  return {
    employee: employeeSummary(employee),
    kpi: {
      batchCount: batches.length,
      modulesCompleted,
      totalModules,
      attendance,
      exposureVisits: visits.length,
      batches: batches.map((batch) => ({
        batch: batch.code,
        completed: batch.status === "ACTIVE" ? 8 : 12,
        total: 12,
      })),
      sessionSplit: [
        { name: "Theory", value: batches.length ? 58 : 0, color: "#ef4444" },
        { name: "Lab", value: batches.length ? 42 : 0, color: "#22d3ee" },
      ],
      weekly: weeklyRows("modules", modulesCompleted),
    },
    attendanceRows: recentAttendanceRows(employee?.id),
  }
}

export function selectPlacementOfficerDetail(employeeId, employees = denormalize(mockDb.employees), drives = denormalize(mockDb.placementDrives)) {
  const employee = findEmployeeByRole(employeeId, "Placement Officer", employees)
  const officerDrives = drives.filter((drive) => drive.placementOfficerEmployeeId === employee?.id)
  const placedCandidateIds = new Set(
    denormalize(mockDb.candidates)
      .filter((candidate) => candidate.status === "PLACED")
      .map((candidate) => candidate.id)
  )
  const participants = officerDrives.reduce((sum, drive) => sum + (drive.candidateIds?.length || 0), 0)
  const placed = officerDrives.reduce(
    (sum, drive) => sum + (drive.candidateIds || []).filter((candidateId) => placedCandidateIds.has(candidateId)).length,
    0
  )
  const companyIds = new Set(officerDrives.map((drive) => drive.companyId))
  const sectorCounts = officerDrives.reduce((counts, drive) => {
    const sector = mockDb.companies.byId[drive.companyId]?.sector || "Other"
    counts[sector] = (counts[sector] || 0) + 1
    return counts
  }, {})
  const sectorColors = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#64748b"]
  const monthlyMap = officerDrives.reduce((months, drive) => {
    const month = new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(drive.scheduledOn))
    months[month] = (months[month] || 0) + (drive.candidateIds || []).filter((candidateId) => placedCandidateIds.has(candidateId)).length
    return months
  }, {})
  const avgSalary = officerDrives.length
    ? Math.round(officerDrives.reduce((sum, drive) => sum + (drive.offeredCtc ? drive.offeredCtc / 12 : 0), 0) / officerDrives.length)
    : 0

  return {
    employee: employeeSummary(employee),
    kpi: {
      totalDrives: officerDrives.length,
      studentsPlaced: placed,
      conversionRate: formatPercent(placed, participants),
      avgSalary: avgSalary ? `₹${avgSalary.toLocaleString()}/mo` : "—",
      partnerCompanies: companyIds.size,
      drives: officerDrives.map((drive) => {
        const company = mockDb.companies.byId[drive.companyId]
        return {
          id: drive.id,
          company: company?.name || "-",
          sector: company?.sector || "Other",
          date: formatShortDate(drive.scheduledOn),
          placed: (drive.candidateIds || []).filter((candidateId) => placedCandidateIds.has(candidateId)).length,
          appeared: drive.candidateIds?.length || 0,
          status: drive.status === "COMPLETED" ? "Completed" : "Upcoming",
        }
      }),
      sectorSplit: Object.entries(sectorCounts).map(([name, count], index) => ({
        name,
        value: Number(formatPercent(count, officerDrives.length).replace("%", "")),
        color: sectorColors[index % sectorColors.length],
      })),
      monthly: Object.entries(monthlyMap).map(([m, p]) => ({ m, p })),
    },
  }
}

export function selectExposureVisitReports(projects = denormalize(mockDb.projects)) {
  const projectIds = new Set(projects.map((project) => project.id))
  const enrollments = denormalize(mockDb.enrollments)
  const attendance = denormalize(mockDb.attendance)
  const visits = denormalize(mockDb.exposureVisits)
    .filter((visit) => projectIds.has(visit.projectId))
    .map((visit, index) => {
      const project = mockDb.projects.byId[visit.projectId]
      const center = mockDb.centers.byId[visit.centerId]
      const batch = mockDb.batches.byId[visit.batchId]
      const trainer = batch ? mockDb.employees.byId[batch.trainerEmployeeId] : null
      const company = mockDb.companies.byId[visit.companyId]
      const batchEnrollments = enrollments.filter((enrollment) => enrollment.batchId === visit.batchId)
      const attended = attendance.filter(
        (entry) => entry.batchId === visit.batchId && entry.subjectType === "CANDIDATE" && entry.status === "PRESENT"
      ).length
      const status = statusLabel(visit.status)

      return {
        id: visit.id,
        projectId: visit.projectId,
        industry: company?.name || "Partner Industry",
        spocName: company?.contactName || `${company?.name || "Company"} SPOC`,
        spocPhone: company?.phone || "+91 98765 11000",
        project: project?.name || "-",
        center: center?.district || center?.name || "-",
        trainer: trainer ? employeeName(trainer) : "-",
        batch: batch?.code || "-",
        trade: batch?.trade || "-",
        date: visit.visitDate,
        candidates: batchEnrollments.length,
        attended: ["Submitted", "Completed"].includes(status) ? attended || batchEnrollments.length : 0,
        status,
        location: company?.city || center?.district || "-",
        proofImages: proofSet(index, status),
        notes: `${batch?.trade || "Training"} learners visited ${company?.name || "the partner industry"} for practical exposure and workplace orientation.`,
      }
    })

  const projectStats = projects.map((project) => {
    const projectVisits = visits.filter((visit) => visit.projectId === project.id)
    return {
      projectId: project.id,
      project: project.name,
      visits: projectVisits.length,
      submitted: projectVisits.filter((visit) => visit.status === "Submitted").length,
      proofs: projectVisits.reduce((sum, visit) => sum + visit.proofImages.length, 0),
    }
  })

  return {
    projectStats,
    visits,
    trades: [...new Set(visits.map((visit) => visit.trade).filter(Boolean))],
    statuses: [...new Set(visits.map((visit) => visit.status).filter(Boolean))],
  }
}

export function selectCommunityEngagementReports(projects = denormalize(mockDb.projects)) {
  const projectIds = new Set(projects.map((project) => project.id))
  const candidates = denormalize(mockDb.candidates)
  const requests = denormalize(mockDb.tourRequests)
    .filter((request) => projectIds.has(request.projectId))
    .map((request, index) => {
      const project = mockDb.projects.byId[request.projectId]
      const center = mockDb.centers.byId[request.centerId]
      const mobilizer = mockDb.employees.byId[request.employeeId]
      const mobilized = candidates.filter((candidate) => candidate.mobilizerEmployeeId === request.employeeId)
      const enrolled = mobilized.filter((candidate) => CANDIDATE_STATUS[candidate.status] === "Enrolled").length
      const status = statusLabel(request.status)
      const driveType = request.purpose?.toLowerCase().includes("verification") ? "Candidate Verification" : "Mobilization Camp"

      return {
        id: request.id,
        projectId: request.projectId,
        driveName: request.purpose,
        mobilizer: mobilizer ? employeeName(mobilizer) : "-",
        mobilizerPhone: mobilizer?.phone || "+91 98765 21000",
        project: project?.name || "-",
        center: center?.district || center?.name || "-",
        block: center?.district || "-",
        gp: request.destination || center?.name || "-",
        type: driveType,
        date: request.fromDate,
        participants: Math.max(mobilized.length * 18, mobilized.length),
        leads: Math.max(mobilized.length * 8, mobilized.length),
        enrolled,
        status,
        location: request.destination || center?.district || "-",
        communityPartner: `${center?.district || "Local"} community network`,
        proofImages: proofSet(index + 2, status),
        notes: `${request.purpose} conducted for ${project?.name || "project"} candidate outreach and lifecycle follow-up.`,
      }
    })

  const projectStats = projects.map((project) => {
    const drives = requests.filter((drive) => drive.projectId === project.id)
    return {
      projectId: project.id,
      project: project.name,
      drives: drives.length,
      submitted: drives.filter((drive) => drive.status === "Submitted").length,
      participants: drives.reduce((sum, drive) => sum + drive.participants, 0),
      proofs: drives.reduce((sum, drive) => sum + drive.proofImages.length, 0),
    }
  })

  return {
    projectStats,
    drives: requests,
    blocks: [...new Set(requests.map((drive) => drive.block).filter(Boolean))],
    types: [...new Set(requests.map((drive) => drive.type).filter(Boolean))],
    statuses: [...new Set(requests.map((drive) => drive.status).filter(Boolean))],
  }
}

export function selectOperationalControlProjects(projects = denormalize(mockDb.projects)) {
  return projects.map((project) => {
    const centers = denormalize(mockDb.centers).filter((center) => center.projectId === project.id)
    const batches = denormalize(mockDb.batches).filter((batch) => batch.projectId === project.id)
    const enrollments = denormalize(mockDb.enrollments).filter((enrollment) => enrollment.projectId === project.id)
    const completion = batches.length
      ? Math.round(batches.reduce((sum, batch) => sum + (batch.status === "ACTIVE" ? 72 : 100), 0) / batches.length)
      : 0
    return {
      id: project.id,
      name: project.name,
      status: statusLabel(project.status),
      center: centers.length > 1 ? "Multiple" : centers[0]?.district || centers[0]?.name || "-",
      health: completion >= 85 ? "Excellent" : enrollments.length ? "Good" : "Warning",
    }
  })
}

export function selectCredentialDirectory(employees = denormalize(mockDb.employees)) {
  const staff = employees.filter((employee) => !["Super Admin"].includes(roleLabel(employee)))
  return {
    roles: [...new Set(staff.map((employee) => roleLabel(employee)).filter(Boolean))],
    centers: [...new Set(denormalize(mockDb.centers).map((center) => center.district || center.name))],
    recentCredentials: staff.slice(0, 6).map((employee) => {
      const center = employeeCenter(employee)
      return {
        id: employee.employeeCode || employee.id,
        name: employeeName(employee),
        role: roleLabel(employee),
        center: center?.district || center?.name || "Unassigned",
        created: employee.joinedOn,
        status: employee.status === "ACTIVE" ? "Active" : "Inactive",
      }
    }),
  }
}

export function selectGlobalTrackingData(projects = denormalize(mockDb.projects), employees = denormalize(mockDb.employees)) {
  const centers = denormalize(mockDb.centers)
  const batches = denormalize(mockDb.batches)
  const enrollments = denormalize(mockDb.enrollments)
  const companies = denormalize(mockDb.companies)
  const attendance = denormalize(mockDb.attendance)

  const regions = centers.map((center) => {
    const centerBatches = batches.filter((batch) => batch.centerId === center.id)
    const centerEnrollments = enrollments.filter((enrollment) => enrollment.centerId === center.id)
    const centerEmployees = employees.filter((employee) => employee.centerIds?.includes(center.id))
    const attendanceRows = attendance.filter((entry) => entry.centerId === center.id)
    const progress = centerBatches.length
      ? Math.round(centerBatches.reduce((sum, batch) => sum + (batch.status === "ACTIVE" ? 72 : 100), 0) / centerBatches.length)
      : 0

    return {
      name: center.district || center.name,
      status: center.status === "ACTIVE" ? "Active" : statusLabel(center.status),
      progress,
      activeBatches: centerBatches.filter((batch) => batch.status === "ACTIVE").length,
      users: centerEnrollments.length + centerEmployees.length,
      alert: attendanceRows.some((entry) => entry.status !== "PRESENT") ? "Attendance Alert" : null,
    }
  })

  const mobilized = denormalize(mockDb.candidates).length
  const trainerCount = employees.filter((employee) => roleLabel(employee) === "Trainer").length
  const activeCenters = centers.filter((center) => center.status === "ACTIVE").length

  return {
    totalNodes: centers.length + projects.length + batches.length,
    regions,
    milestones: [
      {
        id: "MILE-001",
        title: "Candidate Lifecycle Coverage",
        target: `${Math.max(mobilized, 1)} Candidates`,
        current: mobilized.toLocaleString("en-IN"),
        pct: mobilized ? 100 : 0,
        status: mobilized ? "On Track" : "In Progress",
      },
      {
        id: "MILE-002",
        title: "Trainer Capacity",
        target: `${Math.max(batches.length, 1)} Batches`,
        current: trainerCount.toLocaleString("en-IN"),
        pct: batches.length ? Math.min(100, Math.round((trainerCount / batches.length) * 100)) : 0,
        status: trainerCount >= batches.length ? "Near Completion" : "In Progress",
      },
      {
        id: "MILE-003",
        title: "Industry Partnerships",
        target: `${Math.max(companies.length + 2, 1)} Companies`,
        current: companies.length.toLocaleString("en-IN"),
        pct: Math.round((companies.length / Math.max(companies.length + 2, 1)) * 100),
        status: "In Progress",
      },
      {
        id: "MILE-004",
        title: "Center Activation",
        target: `${centers.length} Centers`,
        current: activeCenters.toLocaleString("en-IN"),
        pct: centers.length ? Math.round((activeCenters / centers.length) * 100) : 0,
        status: activeCenters === centers.length ? "On Track" : "Expanding",
      },
    ],
    sessions: {
      mobilizers: employees.filter((employee) => roleLabel(employee) === "Mobilizer").length,
      trainers: trainerCount,
      admins: employees.filter((employee) => roleLabel(employee) === "Admin").length,
    },
  }
}

export function selectEnrollmentMonitorData(employees = denormalize(mockDb.employees)) {
  const centers = denormalize(mockDb.centers)
  const enrollments = denormalize(mockDb.enrollments)
  const candidates = denormalize(mockDb.candidates)
  const approvedStatuses = ["IN_TRAINING", "ASSESSED", "CERTIFIED", "PLACED"]
  const approved = candidates.filter((candidate) => approvedStatuses.includes(candidate.status)).length
  const rejected = candidates.filter((candidate) => candidate.status === "DROPPED" || candidate.status === "REJECTED").length
  const pending = candidates.filter((candidate) => candidate.status === "MOBILIZED").length
  const mobilizers = employees.filter((employee) => roleLabel(employee) === "Mobilizer")

  return {
    stats: [
      { label: "Total Enrolled", value: enrollments.length.toLocaleString(), color: "text-red-500" },
      { label: "Approved", value: approved.toLocaleString(), color: "text-emerald-500" },
      { label: "Pending Review", value: pending.toLocaleString(), color: "text-amber-500" },
      { label: "Rejected", value: rejected.toLocaleString(), color: "text-red-500" },
    ],
    centerData: centers.map((center) => {
      const centerEnrollments = enrollments.filter((enrollment) => enrollment.centerId === center.id)
      const centerCandidates = centerEnrollments.map((enrollment) => mockDb.candidates.byId[enrollment.candidateId]).filter(Boolean)
      return {
        center: center.district || center.name,
        total: centerCandidates.length,
        approved: centerCandidates.filter((candidate) => approvedStatuses.includes(candidate.status)).length,
        pending: centerCandidates.filter((candidate) => candidate.status === "MOBILIZED").length,
        rejected: centerCandidates.filter((candidate) => candidate.status === "DROPPED" || candidate.status === "REJECTED").length,
      }
    }),
    mobilizers: mobilizers.map((employee) => {
      const center = employeeCenter(employee)
      const mobilized = candidates.filter((candidate) => candidate.mobilizerEmployeeId === employee.id)
      return {
        id: employee.id,
        name: employeeName(employee),
        center: center?.district || center?.name || "Unassigned",
        status: employee.status === "ACTIVE" ? "Active" : employee.status,
        mobilized: mobilized.length,
        approved: mobilized.filter((candidate) => approvedStatuses.includes(candidate.status)).length,
        pending: mobilized.filter((candidate) => candidate.status === "MOBILIZED").length,
        attendanceRate: `${attendanceRate("EMPLOYEE", employee.id)}%`,
      }
    }),
  }
}

export function selectTrainingMonitorData(employees = denormalize(mockDb.employees)) {
  const centers = denormalize(mockDb.centers)
  const batches = denormalize(mockDb.batches)
  const trainers = employees.filter((employee) => roleLabel(employee) === "Trainer")
  const centerCompletion = centers.map((center) => {
    const centerBatches = batches.filter((batch) => batch.centerId === center.id)
    const completion = centerBatches.length
      ? Math.round(centerBatches.reduce((sum, batch) => sum + (batch.status === "ACTIVE" ? 68 : 100), 0) / centerBatches.length)
      : 0
    return { center: center.district || center.name, completion }
  })
  const avgCompletion = centerCompletion.length
    ? Math.round(centerCompletion.reduce((sum, center) => sum + center.completion, 0) / centerCompletion.length)
    : 0
  const modulesDelivered = batches.length * 8

  return {
    stats: [
      { label: "Training Centers", value: centers.length.toString(), color: "text-blue-500" },
      { label: "Active Trainers", value: trainers.length.toString(), color: "text-emerald-500" },
      { label: "Avg Completion", value: `${avgCompletion}%`, color: "text-red-500" },
      { label: "Modules Delivered", value: modulesDelivered.toString(), color: "text-violet-500" },
    ],
    centerCompletion,
    trainers: trainers.map((employee) => {
      const assignedBatches = batches.filter((batch) => batch.trainerEmployeeId === employee.id)
      const totalModules = Math.max(assignedBatches.length * 12, 1)
      const modulesCompleted = assignedBatches.reduce((sum, batch) => sum + (batch.status === "ACTIVE" ? 8 : 12), 0)
      const center = employeeCenter(employee)
      return {
        id: employee.id,
        name: employeeName(employee),
        center: center?.district || center?.name || "Unassigned",
        status: employee.status === "ACTIVE" ? "Active" : employee.status === "ON_LEAVE" ? "On Leave" : employee.status,
        batchesAssigned: assignedBatches.length,
        modulesCompleted,
        totalModules,
        attendanceRate: `${attendanceRate("EMPLOYEE", employee.id)}%`,
      }
    }),
  }
}

export function selectPlacementMonitorData(employees = denormalize(mockDb.employees), drives = denormalize(mockDb.placementDrives)) {
  const centers = denormalize(mockDb.centers)
  const companies = denormalize(mockDb.companies)
  const officers = employees.filter((employee) => roleLabel(employee) === "Placement Officer")
  const placedCandidateIds = new Set(denormalize(mockDb.candidates).filter((candidate) => candidate.status === "PLACED").map((candidate) => candidate.id))
  const totalParticipants = drives.reduce((sum, drive) => sum + (drive.candidateIds?.length || 0), 0)
  const totalPlaced = drives.reduce((sum, drive) => sum + (drive.candidateIds || []).filter((candidateId) => placedCandidateIds.has(candidateId)).length, 0)

  return {
    stats: [
      { label: "Total Placed", value: totalPlaced.toLocaleString(), color: "text-emerald-500" },
      { label: "Active Drives", value: drives.filter((drive) => drive.status !== "COMPLETED" && drive.status !== "CANCELLED").length.toString(), color: "text-blue-500" },
      { label: "Conversion Rate", value: `${totalParticipants ? Math.round((totalPlaced / totalParticipants) * 100) : 0}%`, color: "text-red-500" },
      { label: "Partner Companies", value: companies.length.toString(), color: "text-violet-500" },
    ],
    centerTargets: centers.map((center) => {
      const centerDrives = drives.filter((drive) => drive.centerId === center.id)
      const target = centerDrives.reduce((sum, drive) => sum + (drive.candidateIds?.length || 0), 0)
      const placed = centerDrives.reduce((sum, drive) => sum + (drive.candidateIds || []).filter((candidateId) => placedCandidateIds.has(candidateId)).length, 0)
      return { center: center.district || center.name, target, placed }
    }),
    officers: officers.map((employee) => {
      const officerDrives = drives.filter((drive) => drive.placementOfficerEmployeeId === employee.id)
      const participants = officerDrives.reduce((sum, drive) => sum + (drive.candidateIds?.length || 0), 0)
      const placed = officerDrives.reduce((sum, drive) => sum + (drive.candidateIds || []).filter((candidateId) => placedCandidateIds.has(candidateId)).length, 0)
      const avgSalary = officerDrives.length
        ? Math.round(officerDrives.reduce((sum, drive) => sum + (drive.offeredCtc ? drive.offeredCtc / 12 : 0), 0) / officerDrives.length)
        : 0
      const center = employeeCenter(employee)
      return {
        id: employee.id,
        name: employeeName(employee),
        center: center?.district || center?.name || "Unassigned",
        totalDrives: officerDrives.length,
        studentsPlaced: placed,
        conversionRate: `${participants ? Math.round((placed / participants) * 100) : 0}%`,
        avgSalary: avgSalary ? `₹${avgSalary.toLocaleString()}/mo` : "—",
      }
    }),
  }
}

export function selectAttendanceMonitorData(employees = denormalize(mockDb.employees)) {
  const staff = employees.filter((employee) => !["Super Admin", "Admin"].includes(roleLabel(employee)))
  const rows = staff.map((employee) => {
    const role = roleLabel(employee)
    const center = employeeCenter(employee)
    const rate = attendanceRate("EMPLOYEE", employee.id)
    return {
      id: employee.id,
      name: employeeName(employee),
      role,
      center: center?.district || center?.name || "Unassigned",
      weekPct: `${rate}%`,
      monthPct: `${Math.max(65, rate - 2)}%`,
      alerts: rate < 80 ? 2 : rate < 90 ? 1 : 0,
      daily: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => ({
        d: day,
        s: rate - index * 2 >= 82 ? "P" : "A",
      })),
    }
  })

  const avgForRole = (role) => {
    const roleRows = rows.filter((row) => row.role === role)
    if (!roleRows.length) return 0
    return Math.round(roleRows.reduce((sum, row) => sum + Number(row.weekPct.replace("%", "")), 0) / roleRows.length)
  }

  return {
    stats: [
      { label: "Avg Trainer Attend.", value: `${avgForRole("Trainer")}%`, color: "text-emerald-500" },
      { label: "Avg Mobilizer Attend.", value: `${avgForRole("Mobilizer")}%`, color: "text-amber-500" },
      { label: "Low Attend. Alerts", value: rows.reduce((sum, row) => sum + row.alerts, 0).toString(), color: "text-red-500" },
      { label: "Today's Sync", value: `${rows.length}/${rows.length}`, color: "text-violet-500" },
    ],
    weeklyData: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => ({
      day,
      trainers: Math.max(70, avgForRole("Trainer") - index),
      students: Math.max(70, attendanceRate("CANDIDATE", "CND-0001") - index),
      mobilizers: Math.max(70, avgForRole("Mobilizer") - index),
    })),
    staff: rows,
  }
}
