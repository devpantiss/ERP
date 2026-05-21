export const batches = [
  { id: "BTH-0001", projectId: "PRJ-0001", centerId: "CTR-0001", trainerEmployeeId: "EMP-0001", code: "ANG-ELEC-101", trade: "Electrical Technician", capacity: 40, startDate: "2026-01-08", endDate: "2026-06-30", status: "ACTIVE" },
  { id: "BTH-0002", projectId: "PRJ-0002", centerId: "CTR-0002", trainerEmployeeId: "EMP-0004", code: "JSG-WELD-201", trade: "Industrial Welding", capacity: 36, startDate: "2026-02-01", endDate: "2026-07-31", status: "ACTIVE" },
  { id: "BTH-0003", projectId: "PRJ-0003", centerId: "CTR-0003", trainerEmployeeId: "EMP-0004", code: "KLD-GDA-301", trade: "General Duty Assistant", capacity: 45, startDate: "2026-01-15", endDate: "2026-06-20", status: "ACTIVE" },
]

export const candidates = [
  { id: "CND-0001", firstName: "Sasmita", lastName: "Nayak", phone: "+91 90000 00001", gender: "Female", district: "Angul", mobilizerEmployeeId: "EMP-0003", status: "IN_TRAINING" },
  { id: "CND-0002", firstName: "Deepak", lastName: "Sahu", phone: "+91 90000 00002", gender: "Male", district: "Angul", mobilizerEmployeeId: "EMP-0003", status: "ASSESSED" },
  { id: "CND-0003", firstName: "Monalisa", lastName: "Mohanty", phone: "+91 90000 00003", gender: "Female", district: "Jharsuguda", mobilizerEmployeeId: "EMP-0003", status: "IN_TRAINING" },
  { id: "CND-0004", firstName: "Rajesh", lastName: "Majhi", phone: "+91 90000 00004", gender: "Male", district: "Kalahandi", mobilizerEmployeeId: "EMP-0006", status: "PLACED" },
  { id: "CND-0005", firstName: "Priyanka", lastName: "Behera", phone: "+91 90000 00005", gender: "Female", district: "Kalahandi", mobilizerEmployeeId: "EMP-0006", status: "CERTIFIED" },
]

export const enrollments = [
  { id: "ENR-0001", candidateId: "CND-0001", projectId: "PRJ-0001", centerId: "CTR-0001", batchId: "BTH-0001", enrolledOn: "2026-01-10", status: "IN_TRAINING" },
  { id: "ENR-0002", candidateId: "CND-0002", projectId: "PRJ-0001", centerId: "CTR-0001", batchId: "BTH-0001", enrolledOn: "2026-01-10", status: "ASSESSED" },
  { id: "ENR-0003", candidateId: "CND-0003", projectId: "PRJ-0002", centerId: "CTR-0002", batchId: "BTH-0002", enrolledOn: "2026-02-03", status: "IN_TRAINING" },
  { id: "ENR-0004", candidateId: "CND-0004", projectId: "PRJ-0003", centerId: "CTR-0003", batchId: "BTH-0003", enrolledOn: "2026-01-18", status: "PLACED" },
  { id: "ENR-0005", candidateId: "CND-0005", projectId: "PRJ-0003", centerId: "CTR-0003", batchId: "BTH-0003", enrolledOn: "2026-01-18", status: "CERTIFIED" },
]

export const attendance = [
  { id: "ATD-0001", subjectType: "CANDIDATE", subjectId: "CND-0001", projectId: "PRJ-0001", centerId: "CTR-0001", batchId: "BTH-0001", date: "2026-05-20", status: "PRESENT", markedByEmployeeId: "EMP-0001" },
  { id: "ATD-0002", subjectType: "CANDIDATE", subjectId: "CND-0002", projectId: "PRJ-0001", centerId: "CTR-0001", batchId: "BTH-0001", date: "2026-05-20", status: "PRESENT", markedByEmployeeId: "EMP-0001" },
  { id: "ATD-0003", subjectType: "EMPLOYEE", subjectId: "EMP-0001", projectId: "PRJ-0001", centerId: "CTR-0001", batchId: "BTH-0001", date: "2026-05-20", status: "PRESENT", markedByEmployeeId: "EMP-0007" },
]

export const assessments = [
  { id: "ASM-0001", candidateId: "CND-0002", batchId: "BTH-0001", assessor: "Sector Skill Council", score: 82, status: "APPROVED" },
  { id: "ASM-0002", candidateId: "CND-0005", batchId: "BTH-0003", assessor: "Healthcare SSC", score: 88, status: "APPROVED" },
]

export const certifications = [
  { id: "CRT-0001", candidateId: "CND-0002", assessmentId: "ASM-0001", certificateNumber: "CERT-2026-0001", issuedOn: "2026-05-15" },
  { id: "CRT-0002", candidateId: "CND-0005", assessmentId: "ASM-0002", certificateNumber: "CERT-2026-0002", issuedOn: "2026-05-18" },
]

export const insurance = [
  { id: "INS-0001", candidateId: "CND-0001", policyNumber: "POL-OD-0001", provider: "New India Assurance", validFrom: "2026-01-10", validTo: "2027-01-09" },
  { id: "INS-0002", candidateId: "CND-0004", policyNumber: "POL-OD-0002", provider: "New India Assurance", validFrom: "2026-01-18", validTo: "2027-01-17" },
]

export const trainingDomain = { batches, candidates, enrollments, attendance, assessments, certifications, insurance }

