import { mockDb } from "../../mock-db/index.js"
import { denormalize } from "../../mock-db/shared/normalize.js"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const LONG_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#22d3ee", "#f43f5e"]

const rows = (entity) => denormalize(mockDb[entity] || { byId: {}, allIds: [] })
const money = (amount) => Number(amount || 0)
const monthKey = (date) => (date ? date.slice(0, 7) : "Unscheduled")
const monthLabel = (key) => {
  const [, month] = String(key).split("-")
  const index = Number(month) - 1
  return MONTHS[index] || key
}
const longMonthLabel = (key) => {
  const [year, month] = String(key).split("-")
  const index = Number(month) - 1
  return `${LONG_MONTHS[index] || key} ${year || ""}`.trim()
}
const percent = (part, total) => (total ? Math.round((part / total) * 100) : 0)
const inCrores = (amount) => Number((money(amount) / 10000000).toFixed(2))
const inLakhsLabel = (amount) => `₹${(money(amount) / 100000).toFixed(1)} L`
const formatCr = (amount) => `₹${inCrores(amount).toFixed(2)} Cr`

function groupByMonth(records, dateField) {
  return records.reduce((acc, record) => {
    const key = monthKey(record[dateField])
    acc[key] = acc[key] || []
    acc[key].push(record)
    return acc
  }, {})
}

function sortMonthKeys(keys) {
  return [...keys].sort((a, b) => String(a).localeCompare(String(b)))
}

function candidatesForDrive(drive, candidatesById) {
  return (drive.candidateIds || []).map((id) => candidatesById[id]).filter(Boolean)
}

function getPrimaryEmployee(roleCode) {
  const rolesById = mockDb.roles.byId
  return rows("employees").find((employee) =>
    (employee.roleIds || []).some((roleId) => rolesById[roleId]?.code === roleCode),
  )
}

export function selectAdminReportAnalytics() {
  const enrollments = rows("enrollments")
  const attendance = rows("attendance")
  const centers = rows("centers")
  const companies = rows("companies")
  const candidates = rows("candidates")
  const candidatesById = mockDb.candidates.byId
  const drives = rows("placementDrives")

  const enrollmentByMonth = groupByMonth(enrollments, "enrolledOn")
  const driveByMonth = groupByMonth(drives, "scheduledOn")
  const monthKeys = sortMonthKeys(new Set([...Object.keys(enrollmentByMonth), ...Object.keys(driveByMonth)]))

  const enrollmentData = monthKeys.map((key) => ({ month: monthLabel(key), enrolled: enrollmentByMonth[key]?.length || 0 }))
  const placementData = monthKeys.map((key) => {
    const monthDrives = driveByMonth[key] || []
    const mappedCandidates = monthDrives.flatMap((drive) => candidatesForDrive(drive, candidatesById))
    const placed = mappedCandidates.filter((candidate) => candidate.status === "PLACED").length
    return { month: monthLabel(key), rate: percent(placed, mappedCandidates.length) }
  })

  const trainingHours = centers.map((center) => {
    const centerAttendance = attendance.filter((record) => record.centerId === center.id && record.status === "PRESENT")
    return { center: center.district || center.name, hours: centerAttendance.length * 8 }
  })

  const sectorCounts = companies.map((company) => {
    const count = drives
      .filter((drive) => drive.companyId === company.id)
      .reduce((total, drive) => total + (drive.candidateIds?.length || 0), 0)
    return { sector: company.sector || "Other", count }
  })
  const sectorTotals = sectorCounts.reduce((acc, row) => ({ ...acc, [row.sector]: (acc[row.sector] || 0) + row.count }), {})
  const sectorData = Object.entries(sectorTotals).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length],
  }))

  const totalPlaced = candidates.filter((candidate) => candidate.status === "PLACED").length

  return {
    enrollmentData,
    placementData,
    trainingHours,
    sectorData,
    summary: [
      { label: "Total Enrollments", value: enrollments.length.toLocaleString("en-IN"), change: "Live" },
      { label: "Placement Rate", value: `${percent(totalPlaced, candidates.length)}%`, change: "Derived" },
      { label: "Training Hours", value: `${trainingHours.reduce((sum, item) => sum + item.hours, 0).toLocaleString("en-IN")}h`, change: "Attendance" },
      { label: "Active Sectors", value: Object.keys(sectorTotals).length.toString(), change: "Registry" },
    ],
  }
}

export function selectEnterpriseFinanceAnalytics() {
  const projects = rows("projects")
  const centers = rows("centers")
  const fundingAgencies = rows("fundingAgencies")
  const invoices = rows("invoices")
  const procurements = rows("procurements")
  const reimbursements = rows("reimbursements")
  const salaries = rows("salaries")
  const revenue = rows("revenue")
  const candidates = rows("candidates")
  const attendance = rows("attendance")

  const totalRevenue = revenue.reduce((sum, item) => sum + money(item.amount), 0)
  const invoiceSpend = invoices.reduce((sum, item) => sum + money(item.amount), 0)
  const procurementCommitment = procurements.reduce((sum, item) => sum + money(item.estimatedAmount), 0)
  const salaryBurn = salaries.reduce((sum, item) => sum + money(item.grossAmount), 0)
  const reimbursementClaims = reimbursements.reduce((sum, item) => sum + money(item.amount), 0)
  const totalSpend = invoiceSpend + procurementCommitment + salaryBurn + reimbursementClaims
  const placed = candidates.filter((candidate) => candidate.status === "PLACED").length
  const placementRoi = percent(placed * 180000, Math.max(totalSpend, 1))

  const monthKeys = sortMonthKeys(
    new Set([
      ...revenue.map((item) => monthKey(item.recognizedOn)),
      ...invoices.map((item) => monthKey(item.raisedOn)),
      ...procurements.map(() => "2026-05"),
      ...salaries.map((item) => item.month),
    ]),
  )

  const grantFlow = monthKeys.map((key) => {
    const allocation = revenue.filter((item) => monthKey(item.recognizedOn) === key).reduce((sum, item) => sum + money(item.amount), 0)
    const invoiceActual = invoices.filter((item) => monthKey(item.raisedOn) === key).reduce((sum, item) => sum + money(item.amount), 0)
    const salaryActual = salaries.filter((item) => item.month === key).reduce((sum, item) => sum + money(item.grossAmount), 0)
    const procurementActual = key === "2026-05" ? procurementCommitment : 0
    return { p: monthLabel(key), month: monthLabel(key), allocation: inCrores(allocation), spends: inCrores(invoiceActual + salaryActual + procurementActual), actual: inCrores(invoiceActual + salaryActual + procurementActual) }
  })

  const fundingSources = fundingAgencies.map((agency) => {
    const agencyProjects = projects.filter((project) => project.fundingAgencyId === agency.id)
    const projectIds = agencyProjects.map((project) => project.id)
    const allocated = revenue.filter((item) => projectIds.includes(item.projectId)).reduce((sum, item) => sum + money(item.amount), 0)
    const utilized =
      invoices.filter((item) => projectIds.includes(item.projectId)).reduce((sum, item) => sum + money(item.amount), 0) +
      procurements.filter((item) => projectIds.includes(item.projectId)).reduce((sum, item) => sum + money(item.estimatedAmount), 0)
    return {
      id: agency.id,
      name: agency.name,
      total: inCrores(Math.max(allocated, utilized)),
      utilized: inCrores(utilized),
      status: agencyProjects.some((project) => project.status === "ACTIVE") ? "Active" : "Monitoring",
      type: agency.type,
    }
  })

  const grantDistributionTotal = fundingSources.reduce((sum, source) => sum + source.total, 0)
  const grantDistribution = fundingSources.map((source) => ({
    name: source.type === "CSR" ? "CSR Funding" : source.name,
    value: percent(source.total, grantDistributionTotal),
  }))

  const transactions = [
    ...invoices.map((invoice) => ({
      id: invoice.id,
      desc: `${invoice.category} - ${mockDb.centers.byId[invoice.centerId]?.district || "Center"}`,
      amount: inLakhsLabel(invoice.amount),
      date: invoice.raisedOn,
      status: invoice.status === "APPROVED" ? "Approved" : "Pending",
    })),
    ...procurements.map((item) => ({
      id: item.id,
      desc: item.itemName,
      amount: inLakhsLabel(item.estimatedAmount),
      date: "2026-05-01",
      status: item.status === "APPROVED" ? "Approved" : "Pending",
    })),
    ...reimbursements.map((claim) => ({
      id: claim.id,
      desc: claim.category,
      amount: inLakhsLabel(claim.amount),
      date: claim.submittedOn,
      status: claim.status === "APPROVED" ? "Approved" : "Pending",
    })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)))

  const alerts = [
    ...invoices.filter((invoice) => invoice.status !== "APPROVED").map((invoice) => ({
      id: invoice.id,
      type: "Invoice Review",
      msg: `${invoice.category} claim for ${mockDb.projects.byId[invoice.projectId]?.name || invoice.projectId} awaits approval`,
      time: invoice.raisedOn,
    })),
    ...procurements.filter((item) => item.status !== "APPROVED").map((item) => ({
      id: item.id,
      type: "Procurement",
      msg: `${item.itemName} procurement is ${item.status.toLowerCase().replace("_", " ")}`,
      time: "Open",
    })),
  ].slice(0, 3)

  const placementGoal = Math.min(100, percent(placed, Math.max(candidates.length, 1)) + 60)
  const roadmap = [
    { label: "Placement Strategic Goal", val: placementGoal, color: "bg-amber-600" },
    { label: "Center Operational Coverage", val: percent(centers.filter((center) => center.status === "ACTIVE").length, centers.length), color: "bg-emerald-600" },
    { label: "Grant Utilization", val: percent(totalSpend, Math.max(totalRevenue, totalSpend, 1)), color: "bg-blue-600" },
    { label: "Attendance Capture", val: percent(attendance.filter((row) => row.status === "PRESENT").length, Math.max(attendance.length, 1)), color: "bg-violet-600" },
  ]

  return {
    kpis: [
      { label: "Global Grant Value", value: formatCr(Math.max(totalRevenue, totalSpend)), sub: `${fundingAgencies.length} Funding Sources` },
      { label: "Placement ROI", value: `${placementRoi}%`, sub: `${placed} placed candidates` },
      { label: "Operational Centers", value: centers.length.toString(), sub: `${new Set(centers.map((center) => center.state)).size} State Node` },
      { label: "System Uptime", value: "99.98%", sub: "Mock API service healthy" },
    ],
    grantKpis: [
      { label: "Total Fund corpus", value: formatCr(Math.max(totalRevenue, totalSpend)), sub: "Normalized revenue + commitments" },
      { label: "Disbursed amount", value: formatCr(totalRevenue), sub: "Recognized revenue" },
      { label: "Pending Claims", value: formatCr(invoices.filter((item) => item.status !== "APPROVED").reduce((sum, item) => sum + money(item.amount), 0) + reimbursementClaims), sub: "Invoice/reimbursement queue" },
      { label: "Operational Burn", value: formatCr(salaryBurn + invoiceSpend), sub: "Salary + invoice base" },
    ],
    grantFlow,
    fundingSources,
    grantDistribution,
    transactions,
    alerts,
    roadmap,
  }
}

export function selectRevenueWorkflows() {
  const salaryByEmployee = rows("salaries").reduce((acc, salary) => {
    acc[salary.employeeId] = acc[salary.employeeId] || []
    acc[salary.employeeId].push(salary)
    return acc
  }, {})

  const trainer = getPrimaryEmployee("TRAINER")
  const trainerSalaries = salaryByEmployee[trainer?.id] || []
  const trainerMonthly = trainerSalaries.reduce((acc, salary) => {
    const attended = rows("attendance").filter((row) => row.subjectType === "EMPLOYEE" && row.subjectId === trainer.id && monthKey(row.date) === salary.month && row.status === "PRESENT").length
    const visits = rows("exposureVisits").filter((visit) => (trainer.assignedBatchIds || []).includes(visit.batchId) && monthKey(visit.visitDate) === salary.month).length
    acc[salary.month] = { hoursClocked: Math.max(attended * 8, salary.attendanceDays * 8), visitsCompleted: visits }
    return acc
  }, {})

  const mobilizers = rows("employees").filter((employee) => (employee.roleIds || []).some((roleId) => mockDb.roles.byId[roleId]?.code === "MOBILIZER"))
  const mobilizerCandidates = rows("candidates")
  const tours = rows("tourRequests")
  const mobilizerKeys = sortMonthKeys(new Set([...mobilizerCandidates.map(() => "2026-05"), ...tours.map((tour) => monthKey(tour.fromDate))]))
  const mobilizerMonthly = mobilizerKeys.reduce((acc, key) => {
    acc[key] = {
      candidates: mobilizerCandidates
        .filter((candidate) => mobilizers.some((employee) => employee.id === candidate.mobilizerEmployeeId))
        .map((candidate) => ({
          name: `${candidate.firstName} ${candidate.lastName}`,
          date: key === "2026-05" ? "2026-05-01" : key,
          status: candidate.status === "DRAFT" ? "Pending" : "Enrolled",
        })),
      drives: tours
        .filter((tour) => monthKey(tour.fromDate) === key)
        .map((tour) => ({ name: tour.purpose, date: tour.fromDate, location: tour.destination })),
    }
    return acc
  }, {})

  const drives = rows("placementDrives")
  const placementMonthly = sortMonthKeys(new Set(drives.map((drive) => monthKey(drive.scheduledOn)))).reduce((acc, key) => {
    const monthDrives = drives.filter((drive) => monthKey(drive.scheduledOn) === key)
    acc[key] = {
      placed: monthDrives.reduce((count, drive) => count + candidatesForDrive(drive, mockDb.candidates.byId).filter((candidate) => candidate.status === "PLACED").length, 0),
      drivesCompleted: monthDrives.filter((drive) => drive.status === "COMPLETED").length,
    }
    return acc
  }, {})

  const invoiceRows = (prefix, employeeId) =>
    (salaryByEmployee[employeeId] || []).map((salary, index) => ({
      id: `${prefix}-${salary.id}`,
      month: longMonthLabel(salary.month),
      amount: salary.grossAmount,
      status: salary.status === "APPROVED" ? "Paid" : "Approved",
      raisedOn: `${salary.month}-01`,
      sort: index,
    }))

  return {
    trainer: { monthlyData: trainerMonthly, invoices: invoiceRows("INV-T", trainer?.id) },
    placement: { monthlyData: placementMonthly, invoices: rows("invoices").map((invoice) => ({ id: `INV-P-${invoice.id}`, month: longMonthLabel(monthKey(invoice.raisedOn)), amount: invoice.amount, status: invoice.status === "APPROVED" ? "Paid" : "Approved", raisedOn: invoice.raisedOn })) },
    mobilizer: { monthlyData: mobilizerMonthly, invoices: mobilizers.flatMap((employee) => invoiceRows("INV-M", employee.id)) },
  }
}
