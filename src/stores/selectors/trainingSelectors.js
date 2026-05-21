import { mockDb } from "../../mock-db/index.js"
import { denormalize } from "../../mock-db/shared/normalize.js"
import { getEmployeeName, selectEmployeeDirectory } from "./employeeSelectors.js"

const DEFAULT_MODULES = [
  "Orientation",
  "Safety & Compliance",
  "Technical Foundation",
  "Practical Lab",
  "Employability Skills",
  "Assessment Readiness",
]

const MODULE_CATALOG = {
  "Electrical Technician": [
    "Safety & Tools",
    "Basic Electricity",
    "Wiring Standards",
    "Motor Maintenance",
    "Power Distribution",
    "Troubleshooting",
    "Energy Conservation",
  ],
  "Industrial Welding": [
    "Welding Safety",
    "Arc Welding",
    "Gas Welding",
    "TIG/MIG Techniques",
    "Plasma Cutting",
    "Quality Inspection",
    "Steel Fabrication",
  ],
  "General Duty Assistant": [
    "Healthcare Orientation",
    "Patient Safety",
    "Basic Nursing Support",
    "Infection Control",
    "Ward Operations",
    "Emergency Response",
    "Assessment Readiness",
  ],
}

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function getTrainingModules(trade) {
  return MODULE_CATALOG[trade] || DEFAULT_MODULES
}

export function selectTrainerAttendanceRows(
  employees = denormalize(mockDb.employees),
  attendanceRecords = denormalize(mockDb.attendance)
) {
  return selectEmployeeDirectory(employees)
    .filter((employee) => employee.role === "Trainer")
    .map((trainer, index) => {
      const records = attendanceRecords.filter(
        (record) => record.subjectType === "EMPLOYEE" && record.subjectId === trainer.id
      )
      const totalDays = 26
      const presentRecords = records.filter((record) => record.status === "PRESENT").length
      const attendanceRate = records.length
        ? Math.round((presentRecords / records.length) * 100)
        : trainer.status === "On Leave"
          ? 72
          : 92 - index * 3
      const presentDays = Math.max(0, Math.round((attendanceRate / 100) * totalDays))
      const lateDays = records.filter((record) => record.lateMinutes > 0).length || (trainer.status === "On Leave" ? 2 : index + 1)

      return {
        id: trainer.id,
        employeeId: trainer.id,
        name: trainer.name,
        center: trainer.center,
        centerId: trainer.centerId,
        projectId: trainer.projectId,
        avatar: trainer.avatar,
        presentDays,
        totalDays,
        lateDays,
        attendanceRate,
      }
    })
}

export function selectTrainerWeeklyAttendance(trainers = []) {
  return WEEK_DAYS.map((day, index) => {
    const present = trainers.filter((trainer) => trainer.presentDays >= 22 - (index % 3)).length
    return {
      day,
      present,
      absent: Math.max(0, trainers.length - present),
    }
  })
}

export function selectBatchModuleProgress() {
  return denormalize(mockDb.batches).map((batch, index) => {
    const trainer = mockDb.employees.byId[batch.trainerEmployeeId]
    const center = mockDb.centers.byId[batch.centerId]
    const modules = getTrainingModules(batch.trade)
    const completedIndex = batch.status === "COMPLETED" ? modules.length : Math.min(modules.length - 1, 1 + index)
    const progress = Object.fromEntries(
      modules.map((moduleName, moduleIndex) => {
        if (moduleIndex < completedIndex) return [moduleName, "Completed"]
        if (moduleIndex === completedIndex) return [moduleName, "In Progress"]
        return [moduleName, "Scheduled"]
      })
    )

    return {
      id: batch.id,
      batch: batch.code,
      trainer: getEmployeeName(trainer) || "Unassigned",
      trainerEmployeeId: batch.trainerEmployeeId,
      center: center?.district || center?.name || "Unassigned",
      centerId: batch.centerId,
      projectId: batch.projectId,
      trade: batch.trade,
      modules,
      progress,
      status: batch.status,
    }
  })
}

export function selectTrainerPunchLedger(
  attendanceRecords = denormalize(mockDb.attendance),
  trainerEmployeeId = "EMP-0001"
) {
  return attendanceRecords
    .filter((record) => record.subjectType === "EMPLOYEE" && record.subjectId === trainerEmployeeId)
    .reduce((ledger, record) => {
      const sessionKey = record.sessionKey || "s1"
      ledger[record.date] = ledger[record.date] || { sessions: {} }
      ledger[record.date].sessions[sessionKey] = {
        ...(ledger[record.date].sessions[sessionKey] || {}),
        punchIn: record.punchIn,
        punchOut: record.punchOut,
      }
      return ledger
    }, {})
}

export function selectTrainerAttendanceScope(trainerEmployeeId = "EMP-0001") {
  const employee = mockDb.employees.byId[trainerEmployeeId]
  const batch = mockDb.batches.byId[employee?.assignedBatchIds?.[0]]

  return {
    employeeId: trainerEmployeeId,
    projectId: batch?.projectId || employee?.projectIds?.[0],
    centerId: batch?.centerId || employee?.centerIds?.[0],
    batchId: batch?.id || employee?.assignedBatchIds?.[0],
  }
}

export function selectTrainingCatalog(trainerEmployeeId = "EMP-0001") {
  const employee = mockDb.employees.byId[trainerEmployeeId]
  const scopedBatchIds = employee?.assignedBatchIds?.length ? employee.assignedBatchIds : mockDb.batches.allIds
  const batches = scopedBatchIds.map((id) => mockDb.batches.byId[id]).filter(Boolean)

  return {
    projects: denormalize(mockDb.projects).map((project) => ({ id: project.id, label: project.name })),
    batches: batches.map((batch) => ({
      id: batch.id,
      label: batch.code,
      trade: batch.trade,
      projectId: batch.projectId,
      centerId: batch.centerId,
    })),
    companies: denormalize(mockDb.companies).map((company) => ({ id: company.id, label: company.name })),
    trades: [...new Set(batches.map((batch) => batch.trade))],
  }
}

export function selectTrainerAssessmentRows(
  assessments = denormalize(mockDb.assessments),
  trainerEmployeeId = "EMP-0001"
) {
  const catalog = selectTrainingCatalog(trainerEmployeeId)
  const scopedBatchIds = new Set(catalog.batches.map((batch) => batch.id))

  return assessments
    .filter((assessment) => scopedBatchIds.has(assessment.batchId))
    .map((assessment) => {
      const batch = mockDb.batches.byId[assessment.batchId]
      return {
        ...assessment,
        batch: batch?.code || assessment.batchId,
        batchId: assessment.batchId,
        trade: batch?.trade || "Training",
        type: assessment.type || "Mock Final",
        date: assessment.date || assessment.scheduledOn || "2026-05-22",
        totalMarks: assessment.totalMarks || 100,
        passingMarks: assessment.passingMarks || 40,
        status:
          assessment.status === "APPROVED"
            ? "Approved"
            : assessment.status === "SUBMITTED"
              ? "Submitted"
              : assessment.status === "CONDUCTED"
                ? "Conducted"
                : "Scheduled",
        questionnaire: assessment.questionnaire || null,
      }
    })
}

export function selectAssessmentCandidates(batchId) {
  return denormalize(mockDb.enrollments)
    .filter((enrollment) => enrollment.batchId === batchId)
    .map((enrollment) => mockDb.candidates.byId[enrollment.candidateId])
    .filter(Boolean)
    .map((candidate) => ({
      id: candidate.id,
      name: [candidate.firstName, candidate.lastName].filter(Boolean).join(" "),
      marks: "",
    }))
}

export function selectTeachingSessions(trainerEmployeeId = "EMP-0001") {
  const catalog = selectTrainingCatalog(trainerEmployeeId)

  return catalog.batches.flatMap((batch) => {
    const modules = getTrainingModules(batch.trade)
    const studentCount = denormalize(mockDb.enrollments).filter((enrollment) => enrollment.batchId === batch.id).length

    return modules.slice(0, 3).map((moduleName, index) => ({
      id: `${batch.id}-${index}`,
      date: `2026-05-${String(20 - index).padStart(2, "0")}`,
      batch: batch.label,
      topic: moduleName,
      students: studentCount,
      duration: index === 1 ? "4h" : "3h",
    }))
  })
}

export function selectTeachingAttendanceLedger(
  attendanceRecords = denormalize(mockDb.attendance),
  trainerEmployeeId = "EMP-0001"
) {
  return attendanceRecords
    .filter((record) => record.subjectType === "EMPLOYEE" && record.subjectId === trainerEmployeeId && record.sessionKey === "tms")
    .reduce((ledger, record) => {
      ledger[record.date] = {
        punchIn: record.punchIn,
        punchOut: record.punchOut,
      }
      return ledger
    }, {})
}

export function selectExposureVisitRows(visits = denormalize(mockDb.exposureVisits)) {
  return visits.map((visit) => {
    const project = mockDb.projects.byId[visit.projectId]
    const batch = mockDb.batches.byId[visit.batchId]
    const company = mockDb.companies.byId[visit.companyId]
    const enrollmentCount = denormalize(mockDb.enrollments).filter((enrollment) => enrollment.batchId === visit.batchId).length

    return {
      ...visit,
      industry: company?.name || "Industry Partner",
      spocName: company?.contactPerson || "Operations SPOC",
      spocPhone: company?.phone || "+91 90000 00000",
      project: project?.name || visit.projectId,
      batch: batch?.code || visit.batchId,
      trade: batch?.trade || "Training",
      date: visit.visitDate,
      candidates: visit.candidates || enrollmentCount,
      attended: visit.attended || Math.max(0, enrollmentCount - 1),
      status: visit.status === "APPROVED" ? "Approved" : visit.status === "SUBMITTED" ? "Submitted" : visit.status === "COMPLETED" ? "Completed" : "Planned",
      image: visit.image || visit.images?.[0] || null,
    }
  })
}

export function selectTrainerLearningHierarchy(trainerEmployeeId = "EMP-0001", moduleCount = 12) {
  const catalog = selectTrainingCatalog(trainerEmployeeId)
  const departments = {}

  catalog.batches.forEach((batch) => {
    const project = mockDb.projects.byId[batch.projectId]
    const center = mockDb.centers.byId[batch.centerId]
    const department = project?.name || "Training Programs"
    const centerName = center?.name || "Unassigned Center"

    departments[department] = departments[department] || {}
    departments[department][centerName] = departments[department][centerName] || {}
    departments[department][centerName][batch.trade] = departments[department][centerName][batch.trade] || []
    departments[department][centerName][batch.trade].push(batch.label)
  })

  return {
    departments,
    modules: Array.from({ length: moduleCount }, (_, index) => ({ id: index + 1, title: `Module ${index + 1}` })),
  }
}

export function selectTrainerModuleHistory(trainerEmployeeId = "EMP-0001") {
  const catalog = selectTrainingCatalog(trainerEmployeeId)

  return catalog.batches.flatMap((batch, batchIndex) => {
    const project = mockDb.projects.byId[batch.projectId]
    const center = mockDb.centers.byId[batch.centerId]
    const trainer = mockDb.employees.byId[trainerEmployeeId]
    const modules = getTrainingModules(batch.trade)

    return modules.slice(0, 6).map((moduleName, moduleIndex) => ({
      id: `${batch.id}-${moduleIndex}`,
      date: `2026-05-${String(18 + ((batchIndex + moduleIndex) % 10)).padStart(2, "0")}`,
      department: project?.name || "Training Programs",
      center: center?.district || center?.name || "Unassigned",
      jobRole: batch.trade,
      batch: batch.label,
      module: moduleName,
      type: moduleIndex % 2 === 0 ? "Study" : "Lab",
      trainer: getEmployeeName(trainer) || "Trainer",
      totalModules: modules.length,
      photos: ["/activity.png"],
    }))
  })
}
