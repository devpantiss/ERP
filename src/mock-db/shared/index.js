export const grievances = [
  { id: "GRV-0001", raisedByType: "CANDIDATE", raisedById: "CND-0001", projectId: "PRJ-0001", centerId: "CTR-0001", category: "Training", priority: "Medium", summary: "Requested extra practical lab hours", status: "OPEN", assignedToEmployeeId: "EMP-0007" },
  { id: "GRV-0002", raisedByType: "EMPLOYEE", raisedById: "EMP-0003", projectId: "PRJ-0001", centerId: "CTR-0001", category: "Operations", priority: "Low", summary: "Transport vendor delay", status: "IN_REVIEW", assignedToEmployeeId: "EMP-0007" },
]

export const notifications = [
  { id: "NOT-0001", recipientUserId: "USR-0003", title: "Attendance pending for ANG-ELEC-101", entityType: "Batch", entityId: "BTH-0001", readAt: null },
  { id: "NOT-0002", recipientUserId: "USR-0005", title: "Placement drive scheduled with Tata Motors", entityType: "PlacementDrive", entityId: "DRV-0001", readAt: null },
]

export const auditLogs = [
  { id: "AUD-0001", actorUserId: "USR-0001", action: "CREATE", entityType: "Project", entityId: "PRJ-0001", createdAt: "2026-05-20T10:00:00+05:30" },
  { id: "AUD-0002", actorUserId: "USR-0002", action: "APPROVE", entityType: "LeaveRequest", entityId: "LEV-0001", createdAt: "2026-05-20T12:00:00+05:30" },
]

export const fileUploads = [
  { id: "FIL-0001", ownerType: "Candidate", ownerId: "CND-0001", fileName: "aadhaar-card.pdf", mimeType: "application/pdf", url: "/mock-files/aadhaar-card.pdf" },
  { id: "FIL-0002", ownerType: "Invoice", ownerId: "INV-0001", fileName: "catering-invoice.pdf", mimeType: "application/pdf", url: "/mock-files/catering-invoice.pdf" },
]

export const testimonials = [
  { id: "TST-0001", candidateId: "CND-0004", projectId: "PRJ-0003", centerId: "CTR-0003", quote: "The training helped me secure my first formal job.", status: "APPROVED" },
]

export const sharedDomain = { grievances, notifications, auditLogs, fileUploads, testimonials }

