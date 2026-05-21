import { mockDb } from "../../mock-db/index.js"
import { denormalize } from "../../mock-db/shared/normalize.js"

const SECTOR_TO_SEGMENT = {
  Automotive: "Manufacturing",
  Manufacturing: "Mining, Steel & Aluminium",
  Healthcare: "Healthcare",
}

const STATUS_LABELS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SCHEDULED: "Approved",
  IN_PROGRESS: "Approved",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

export const PLACEMENT_SEGMENTS = [
  "Mining, Steel & Aluminium",
  "Shipping & Logistics",
  "Power & Green Energy",
  "Green Jobs",
  "Construction Tech & Infra Equipment",
  "Furniture & Fittings",
  "Healthcare",
  "Manufacturing",
]

export const LOCATION_TYPES = ["Odisha", "India", "International"]

export function selectCompanyRows(companies) {
  return companies.map((company) => ({
    ...company,
    companyName: company.name,
    segment: SECTOR_TO_SEGMENT[company.sector] || company.sector || "General",
    locationType: company.city === "Bhubaneswar" || company.city === "Angul" ? "Odisha" : "India",
    location: company.city || "-",
    website: company.website || "https://example.com",
    spoc: company.spoc || "Placement Desk",
    contact: company.contact || "9876543210",
    loi: company.loi || null,
    loiExpiry: company.loiExpiry || null,
    mou: company.mou || null,
    status: STATUS_LABELS[company.status] || company.status,
  }))
}

export function selectPlacementDriveRows(drives) {
  return drives.map((drive) => ({
    ...drive,
    eventName: drive.eventName || `${drive.company?.name || "Employer"} Placement Drive`,
    type: drive.candidateIds?.length > 1 ? "Multiple" : "Single",
    companies: drive.company ? [drive.company.name] : [],
    driveLocation: drive.center?.name || "-",
    date: drive.scheduledOn,
    status: STATUS_LABELS[drive.status] || drive.status,
    geo: drive.geo || null,
    eventImages: drive.eventImages || [],
    placedStudents: drive.placedStudents || drive.candidates?.map((candidate) => ({
      name: [candidate.firstName, candidate.lastName].filter(Boolean).join(" "),
      company: drive.company?.name || "-",
      role: drive.batch?.trade || "Trainee",
      salary: drive.offeredCtc ? Math.round(drive.offeredCtc / 12) : "",
      joiningDate: "",
    })) || [],
  }))
}

const DOC_FIELDS = ["offer", "m1", "m2", "m3", "bank"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
const CHART_COLORS = ["#06b6d4", "#22d3ee", "#67e8f9", "#0891b2", "#0ea5e9"]

function getEnrollment(candidateId) {
  return denormalize(mockDb.enrollments).find((enrollment) => enrollment.candidateId === candidateId)
}

function getInitialPlacementDocs(rowIndex) {
  const documents = Object.fromEntries(DOC_FIELDS.map((field) => [field, null]))
  if (rowIndex % 2 === 0) {
    documents.offer = { url: "/certificate.jpg", verified: false }
    documents.bank = { url: "/passbook.jpeg", verified: false }
  }
  if (rowIndex % 3 === 0) documents.m1 = { url: "/certificate.jpg", verified: false }
  if (rowIndex % 4 === 0) documents.m2 = { url: "/certificate.jpg", verified: false }
  if (rowIndex % 5 === 0) documents.m3 = { url: "/certificate.jpg", verified: false }
  return documents
}

export function selectPlacementCandidateRows(drives) {
  return drives.flatMap((drive, driveIndex) =>
    (drive.candidates || []).map((candidate, candidateIndex) => {
      const rowIndex = driveIndex + candidateIndex
      const enrollment = getEnrollment(candidate.id)
      const batch = enrollment ? mockDb.batches.byId[enrollment.batchId] : null
      const center = drive.center || (enrollment ? mockDb.centers.byId[enrollment.centerId] : null)
      const project = drive.project || (enrollment ? mockDb.projects.byId[enrollment.projectId] : null)
      const salary = drive.offeredCtc ? Math.round(drive.offeredCtc / 12) : 0

      return {
        id: `${drive.id}-${candidate.id}`,
        driveId: drive.id,
        candidateId: candidate.id,
        name: [candidate.firstName, candidate.lastName].filter(Boolean).join(" "),
        project: project?.name || "Not Assigned",
        projectId: project?.id || null,
        center: center?.name || "Not Assigned",
        centerId: center?.id || null,
        batch: batch?.code || "Not Assigned",
        batchId: batch?.id || null,
        company: drive.company?.name || "Not Assigned",
        companyId: drive.company?.id || null,
        designation: batch?.trade || "Trainee",
        salary,
        joiningDate: drive.scheduledOn || "",
        docs: getInitialPlacementDocs(rowIndex),
        status: STATUS_LABELS[drive.status] || drive.status,
      }
    })
  )
}

export function selectJobOpeningRows(drives) {
  return drives.map((drive) => {
    const firstCandidate = drive.candidates?.[0]
    const enrollment = firstCandidate ? getEnrollment(firstCandidate.id) : null
    const batch = enrollment ? mockDb.batches.byId[enrollment.batchId] : null
    const center = drive.center || (enrollment ? mockDb.centers.byId[enrollment.centerId] : null)
    const project = drive.project || (enrollment ? mockDb.projects.byId[enrollment.projectId] : null)
    const company = drive.company || mockDb.companies.byId[drive.companyId]
    const salary = drive.offeredCtc ? Math.round(drive.offeredCtc / 12) : 0
    const status = drive.status === "COMPLETED" || drive.status === "CANCELLED" ? "Closed" : "Open"

    return {
      id: drive.id,
      company: company?.name || "Not Assigned",
      companyId: company?.id || null,
      role: batch?.trade || "Trainee",
      location: center?.district || company?.city || "Not Assigned",
      district: center?.district || company?.city || "Not Assigned",
      state: center?.state || "Odisha",
      country: "India",
      segment: SECTOR_TO_SEGMENT[company?.sector] || company?.sector || "General",
      project: project?.name || "Not Assigned",
      salary,
      eligibility: `${batch?.trade || "Relevant trade"} candidates from ${project?.name || "assigned project"}.`,
      description: `${company?.name || "Employer"} drive linked to ${center?.name || "assigned center"}.`,
      vacancies: Math.max(drive.candidateIds?.length || 0, 1),
      status,
      scheduledOn: drive.scheduledOn,
      candidateCount: drive.candidateIds?.length || 0,
    }
  })
}

export function selectOpeningGeoRows(openings) {
  return openings.map((opening) => ({
    country: opening.country,
    state: opening.state,
    district: opening.district,
    vacancies: opening.vacancies,
  }))
}

export function selectOpeningAnalytics(openings) {
  const totalVacancies = openings.reduce((sum, opening) => sum + opening.vacancies, 0)
  const companies = new Set(openings.map((opening) => opening.company)).size
  const avgSalary = openings.reduce((sum, opening) => sum + opening.salary, 0) / (openings.length || 1)
  const placed = openings.reduce((sum, opening) => sum + opening.candidateCount, 0)
  const conversion = totalVacancies ? Math.round((placed / totalVacancies) * 100) : 0

  return {
    vacancies: totalVacancies,
    companies,
    avgSalary: Math.round(avgSalary),
    conversion,
  }
}

function countBy(records, key) {
  return records.reduce((acc, record) => {
    const value = record[key] || "Not Assigned"
    acc[value] = (acc[value] || 0) + record.vacancies
    return acc
  }, {})
}

function toTopRows(records, key, valueKey = "value") {
  return Object.entries(countBy(records, key))
    .map(([name, value]) => ({ name, [valueKey]: value, value, growth: Math.max(-9, Math.min(32, value * 3 - 6)) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

export function selectOpeningTrendData(openings) {
  const companies = toTopRows(openings, "company").map((row) => row.name).slice(0, 4)
  const roles = toTopRows(openings, "role").map((row) => row.name).slice(0, 4)

  const monthlyCompanyData = MONTHS.map((month, index) => {
    const row = { month }
    companies.forEach((company) => {
      const total = openings.filter((opening) => opening.company === company).reduce((sum, opening) => sum + opening.vacancies, 0)
      row[company] = Math.max(0, Math.round(total * ((index + 1) / MONTHS.length)))
    })
    return row
  })

  const roleTrendData = MONTHS.map((month, index) => {
    const row = { month }
    roles.forEach((role) => {
      const total = openings.filter((opening) => opening.role === role).reduce((sum, opening) => sum + opening.vacancies, 0)
      row[role] = Math.max(0, Math.round(total * ((index + 2) / (MONTHS.length + 1))))
    })
    return row
  })

  return {
    companies,
    roles,
    colors: CHART_COLORS,
    monthlyCompanyData,
    roleTrendData,
    industryData: toTopRows(openings, "segment"),
    salaryData: toTopRows(openings, "role", "salary").map((row) => ({
      role: row.name,
      salary: Math.round(
        openings
          .filter((opening) => opening.role === row.name)
          .reduce((sum, opening, _, roleOpenings) => sum + opening.salary / roleOpenings.length, 0)
      ),
    })),
    funnelData: [
      { stage: "Enrolled", value: denormalize(mockDb.enrollments).length },
      { stage: "Trained", value: denormalize(mockDb.candidates).filter((candidate) => ["ASSESSED", "CERTIFIED", "PLACED"].includes(candidate.status)).length },
      { stage: "Certified", value: denormalize(mockDb.candidates).filter((candidate) => ["CERTIFIED", "PLACED"].includes(candidate.status)).length },
      { stage: "Interviewed", value: openings.reduce((sum, opening) => sum + opening.candidateCount, 0) },
      { stage: "Placed", value: denormalize(mockDb.candidates).filter((candidate) => candidate.status === "PLACED").length },
    ],
  }
}

export function selectPlacementTrendRows(openings, tab) {
  if (tab === "joining") return toTopRows(openings, "company")
  if (tab === "segment") return toTopRows(openings, "segment")
  if (tab === "location") return toTopRows(openings, "district")
  if (tab === "role") return toTopRows(openings, "role")
  return []
}

export function selectCompanyRetentionRows(openings) {
  return toTopRows(openings, "company").map((row) => ({
    name: row.name,
    retention: Math.min(98, 70 + row.value * 4),
  }))
}
