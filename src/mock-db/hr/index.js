export const employees = [
  { id: "EMP-0001", employeeCode: "PNT-EMP-0001", firstName: "Aditya", lastName: "Sahu", email: "aditya.sahu@pantiss.org", phone: "+91 98765 43210", roleIds: ["ROL-0003"], projectIds: ["PRJ-0001"], centerIds: ["CTR-0001"], assignedBatchIds: ["BTH-0001"], designation: "Trainer", status: "ACTIVE", joinedOn: "2024-04-01", managerEmployeeId: "EMP-0007" },
  { id: "EMP-0002", employeeCode: "PNT-EMP-0002", firstName: "Meera", lastName: "Das", email: "meera.das@pantiss.org", phone: "+91 98765 43211", roleIds: ["ROL-0005"], projectIds: ["PRJ-0001"], centerIds: ["CTR-0001"], assignedBatchIds: [], designation: "Placement Officer", status: "ACTIVE", joinedOn: "2024-05-11", managerEmployeeId: "EMP-0007" },
  { id: "EMP-0003", employeeCode: "PNT-EMP-0003", firstName: "Rahul", lastName: "Pradhan", email: "rahul.pradhan@pantiss.org", phone: "+91 98765 43212", roleIds: ["ROL-0004"], projectIds: ["PRJ-0001"], centerIds: ["CTR-0001"], assignedBatchIds: [], designation: "Mobilizer", status: "ACTIVE", joinedOn: "2024-06-18", managerEmployeeId: "EMP-0007" },
  { id: "EMP-0004", employeeCode: "PNT-EMP-0004", firstName: "Sneha", lastName: "Mohanty", email: "sneha.mohanty@pantiss.org", phone: "+91 98765 43213", roleIds: ["ROL-0003"], projectIds: ["PRJ-0002"], centerIds: ["CTR-0002"], assignedBatchIds: ["BTH-0002"], designation: "Trainer", status: "ON_LEAVE", joinedOn: "2024-07-05", managerEmployeeId: "EMP-0009" },
  { id: "EMP-0005", employeeCode: "PNT-EMP-0005", firstName: "Bikash", lastName: "Naik", email: "bikash.naik@pantiss.org", phone: "+91 98765 43214", roleIds: ["ROL-0005"], projectIds: ["PRJ-0003"], centerIds: ["CTR-0003"], assignedBatchIds: [], designation: "Placement Officer", status: "ACTIVE", joinedOn: "2024-08-15", managerEmployeeId: "EMP-0010" },
  { id: "EMP-0006", employeeCode: "PNT-EMP-0006", firstName: "Sonal", lastName: "Behera", email: "sonal.behera@pantiss.org", phone: "+91 98765 43215", roleIds: ["ROL-0004"], projectIds: ["PRJ-0003"], centerIds: ["CTR-0003"], assignedBatchIds: [], designation: "Mobilizer", status: "ACTIVE", joinedOn: "2024-08-21", managerEmployeeId: "EMP-0010" },
  { id: "EMP-0007", employeeCode: "PNT-EMP-0007", firstName: "Rakesh", lastName: "Swain", email: "rakesh.swain@pantiss.org", phone: "+91 98765 43216", roleIds: ["ROL-0002"], projectIds: ["PRJ-0001"], centerIds: ["CTR-0001"], assignedBatchIds: [], designation: "Project Admin", status: "ACTIVE", joinedOn: "2023-04-01", managerEmployeeId: "EMP-0008" },
  { id: "EMP-0008", employeeCode: "PNT-EMP-0008", firstName: "Ananya", lastName: "Mishra", email: "ananya.mishra@pantiss.org", phone: "+91 98765 43217", roleIds: ["ROL-0001", "ROL-0007"], projectIds: ["PRJ-0001", "PRJ-0002", "PRJ-0003"], centerIds: ["CTR-0001", "CTR-0002", "CTR-0003"], assignedBatchIds: [], designation: "Director - Programs", status: "ACTIVE", joinedOn: "2022-01-10", managerEmployeeId: null },
  { id: "EMP-0009", employeeCode: "PNT-EMP-0009", firstName: "Pradip", lastName: "Nanda", email: "pradip.nanda@pantiss.org", phone: "+91 98765 43218", roleIds: ["ROL-0002"], projectIds: ["PRJ-0002"], centerIds: ["CTR-0002"], assignedBatchIds: [], designation: "Project Admin", status: "ACTIVE", joinedOn: "2023-05-07", managerEmployeeId: "EMP-0008" },
  { id: "EMP-0010", employeeCode: "PNT-EMP-0010", firstName: "Harsha", lastName: "Nayak", email: "harsha.nayak@pantiss.org", phone: "+91 98765 43219", roleIds: ["ROL-0002"], projectIds: ["PRJ-0003"], centerIds: ["CTR-0003"], assignedBatchIds: [], designation: "Project Admin", status: "ACTIVE", joinedOn: "2023-07-12", managerEmployeeId: "EMP-0008" },
]

export const trainers = [
  { id: "TRN-0001", employeeId: "EMP-0001", batchIds: ["BTH-0001"], specialization: "Electrical Technician" },
  { id: "TRN-0002", employeeId: "EMP-0004", batchIds: ["BTH-0002"], specialization: "Industrial Welding" },
]

export const mobilizers = [
  { id: "MOB-0001", employeeId: "EMP-0003", centerIds: ["CTR-0001"], villagesCovered: ["Bantala", "Banarpal", "Chhendipada"] },
  { id: "MOB-0002", employeeId: "EMP-0006", centerIds: ["CTR-0003"], villagesCovered: ["Bhawanipatna", "Junagarh"] },
]

export const placementOfficers = [
  { id: "PLO-0001", employeeId: "EMP-0002", projectIds: ["PRJ-0001"], centerIds: ["CTR-0001"] },
  { id: "PLO-0002", employeeId: "EMP-0005", projectIds: ["PRJ-0003"], centerIds: ["CTR-0003"] },
]

export const leaveRequests = [
  { id: "LEV-0001", employeeId: "EMP-0004", fromDate: "2026-05-20", toDate: "2026-05-22", reason: "Medical", status: "APPROVED", approverEmployeeId: "EMP-0009" },
  { id: "LEV-0002", employeeId: "EMP-0001", fromDate: "2026-05-27", toDate: "2026-05-27", reason: "Family work", status: "SUBMITTED", approverEmployeeId: "EMP-0007" },
]

export const salaries = [
  { id: "SAL-0001", employeeId: "EMP-0001", projectId: "PRJ-0001", month: "2026-05", grossAmount: 32000, attendanceDays: 24, status: "APPROVED" },
  { id: "SAL-0002", employeeId: "EMP-0002", projectId: "PRJ-0001", month: "2026-05", grossAmount: 36000, attendanceDays: 25, status: "SUBMITTED" },
  { id: "SAL-0003", employeeId: "EMP-0003", projectId: "PRJ-0001", month: "2026-05", grossAmount: 26000, attendanceDays: 23, status: "SUBMITTED" },
]

export const hrDomain = { employees, trainers, mobilizers, placementOfficers, leaveRequests, salaries }

