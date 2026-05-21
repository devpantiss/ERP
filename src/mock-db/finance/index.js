export const reimbursements = [
  { id: "RIM-0001", employeeId: "EMP-0003", projectId: "PRJ-0001", category: "Travel", amount: 1850, status: "SUBMITTED", submittedOn: "2026-05-19" },
  { id: "RIM-0002", employeeId: "EMP-0001", projectId: "PRJ-0001", category: "Training Material", amount: 4200, status: "APPROVED", submittedOn: "2026-05-17" },
]

export const invoices = [
  { id: "INV-0001", projectId: "PRJ-0001", centerId: "CTR-0001", vendorName: "Sai Catering Services", category: "Food and Boarding", amount: 320000, raisedOn: "2026-05-05", dueOn: "2026-05-30", status: "SUBMITTED" },
  { id: "INV-0002", projectId: "PRJ-0002", centerId: "CTR-0002", vendorName: "Eastern Safety Works", category: "Safety Gear", amount: 96500, raisedOn: "2026-05-08", dueOn: "2026-06-02", status: "APPROVED" },
]

export const revenue = [
  { id: "REV-0001", projectId: "PRJ-0001", centerId: "CTR-0001", sourceType: "TRAINING_GRANT", amount: 850000, recognizedOn: "2026-05-01" },
  { id: "REV-0002", projectId: "PRJ-0003", centerId: "CTR-0003", sourceType: "PLACEMENT_INCENTIVE", amount: 180000, recognizedOn: "2026-05-18" },
]

export const financeDomain = { reimbursements, invoices, revenue }

