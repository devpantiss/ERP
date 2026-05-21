export const fundingAgencies = [
  { id: "FAG-0001", name: "National Skill Development Corporation", shortName: "NSDC", type: "GOVERNMENT", contactEmail: "pmkvy@nsdcindia.org" },
  { id: "FAG-0002", name: "Tata Steel Foundation", shortName: "TSF", type: "CSR", contactEmail: "skills@tatasteelfoundation.org" },
  { id: "FAG-0003", name: "Ministry of Rural Development", shortName: "MoRD", type: "GOVERNMENT", contactEmail: "ddugky@mord.gov.in" },
]

export const schools = [
  { id: "SCH-0001", name: "Pantiss School of Livelihoods", vertical: "Skill Development" },
  { id: "SCH-0002", name: "Pantiss School of Healthcare", vertical: "Healthcare Training" },
]

export const projects = [
  { id: "PRJ-0001", code: "PMKVY-4-OD", name: "PMKVY 4.0 Odisha Skills", fundingAgencyId: "FAG-0001", schoolId: "SCH-0001", startDate: "2025-04-01", endDate: "2026-12-31", status: "ACTIVE" },
  { id: "PRJ-0002", code: "TSF-JSG-26", name: "Tata Steel Foundation Livelihood Program", fundingAgencyId: "FAG-0002", schoolId: "SCH-0001", startDate: "2025-06-15", endDate: "2026-09-30", status: "ACTIVE" },
  { id: "PRJ-0003", code: "DDUGKY-KLD-26", name: "DDUGKY Rural Youth Employment Program", fundingAgencyId: "FAG-0003", schoolId: "SCH-0002", startDate: "2025-01-10", endDate: "2026-11-20", status: "MONITORING" },
]

export const centers = [
  { id: "CTR-0001", projectId: "PRJ-0001", name: "Angul Skill Development Center", district: "Angul", state: "Odisha", managerEmployeeId: "EMP-0007", status: "ACTIVE" },
  { id: "CTR-0002", projectId: "PRJ-0002", name: "Jharsuguda Industrial Training Center", district: "Jharsuguda", state: "Odisha", managerEmployeeId: "EMP-0009", status: "ACTIVE" },
  { id: "CTR-0003", projectId: "PRJ-0003", name: "Kalahandi Livelihood Center", district: "Kalahandi", state: "Odisha", managerEmployeeId: "EMP-0010", status: "ACTIVE" },
]

export const procurements = [
  { id: "PRC-0001", projectId: "PRJ-0001", centerId: "CTR-0001", requestedByEmployeeId: "EMP-0001", itemName: "Electrical toolkits", quantity: 40, estimatedAmount: 96000, status: "UNDER_REVIEW" },
  { id: "PRC-0002", projectId: "PRJ-0002", centerId: "CTR-0002", requestedByEmployeeId: "EMP-0004", itemName: "Welding safety kits", quantity: 35, estimatedAmount: 122500, status: "APPROVED" },
]

export const exposureVisits = [
  { id: "EXV-0001", projectId: "PRJ-0001", centerId: "CTR-0001", batchId: "BTH-0001", companyId: "CMP-0001", visitDate: "2026-05-30", status: "APPROVED" },
  { id: "EXV-0002", projectId: "PRJ-0002", centerId: "CTR-0002", batchId: "BTH-0002", companyId: "CMP-0002", visitDate: "2026-06-04", status: "SUBMITTED" },
]

export const operationsDomain = { fundingAgencies, schools, projects, centers, procurements, exposureVisits }

