import { mockDb } from "../../mock-db/index.js"
import { denormalize } from "../../mock-db/shared/normalize.js"

const STATUS_LABELS = {
  OPEN: "Open",
  IN_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  ESCALATED: "Escalated",
}

export function selectGrievanceRows(grievances) {
  return grievances.map((grievance) => {
    const raisedBy = grievance.raisedByType === "EMPLOYEE"
      ? mockDb.employees.byId[grievance.raisedById]
      : mockDb.candidates.byId[grievance.raisedById]
    const project = grievance.projectId ? mockDb.projects.byId[grievance.projectId] : null
    const center = grievance.centerId ? mockDb.centers.byId[grievance.centerId] : null
    const status = STATUS_LABELS[grievance.status] || grievance.status
    const raisedByName = grievance.raisedBy || (raisedBy
      ? [raisedBy.firstName, raisedBy.lastName].filter(Boolean).join(" ")
      : "Anonymous")

    return {
      ...grievance,
      raisedBy: raisedByName,
      role: raisedBy?.designation || grievance.raisedByType,
      project: project?.name || "-",
      center: center?.name || "-",
      subject: grievance.subject || grievance.summary || grievance.category,
      description: grievance.description || grievance.summary || "-",
      status,
      submittedOn: grievance.submittedOn || grievance.createdAt?.slice(0, 10) || "2026-05-20",
      resolvedOn: status === "Resolved" ? grievance.resolvedOn || "2026-05-21" : null,
      anonymous: grievance.anonymous || false,
      timeline: grievance.timeline || [
        { date: grievance.submittedOn || "2026-05-20", status: "Open", note: "Grievance submitted" },
        ...(status !== "Open" ? [{ date: grievance.updatedAt?.slice(0, 10) || "2026-05-21", status, note: `Status changed to ${status}` }] : []),
      ],
      addressedTo: grievance.addressedTo || "Admin",
      priority: grievance.priority || "Medium",
    }
  })
}

export function selectPeopleDirectory() {
  return denormalize(mockDb.employees).map((employee) => ({
    id: employee.id,
    name: `${employee.firstName} ${employee.lastName}`,
    role: employee.designation,
    email: employee.email,
  }))
}
