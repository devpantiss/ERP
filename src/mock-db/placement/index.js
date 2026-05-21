export const companies = [
  { id: "CMP-0001", name: "Tata Motors", sector: "Automotive", city: "Bhubaneswar", status: "ACTIVE" },
  { id: "CMP-0002", name: "Jindal Steel and Power", sector: "Manufacturing", city: "Angul", status: "ACTIVE" },
  { id: "CMP-0003", name: "Apollo Hospitals", sector: "Healthcare", city: "Bhubaneswar", status: "ACTIVE" },
]

export const placementDrives = [
  { id: "DRV-0001", companyId: "CMP-0001", projectId: "PRJ-0001", centerId: "CTR-0001", placementOfficerEmployeeId: "EMP-0002", candidateIds: ["CND-0001", "CND-0002"], scheduledOn: "2026-05-28", status: "SCHEDULED", offeredCtc: 192000 },
  { id: "DRV-0002", companyId: "CMP-0002", projectId: "PRJ-0002", centerId: "CTR-0002", placementOfficerEmployeeId: "EMP-0002", candidateIds: ["CND-0003"], scheduledOn: "2026-06-05", status: "IN_PROGRESS", offeredCtc: 216000 },
  { id: "DRV-0003", companyId: "CMP-0003", projectId: "PRJ-0003", centerId: "CTR-0003", placementOfficerEmployeeId: "EMP-0005", candidateIds: ["CND-0004", "CND-0005"], scheduledOn: "2026-05-18", status: "COMPLETED", offeredCtc: 180000 },
]

export const placementDomain = { companies, placementDrives }

