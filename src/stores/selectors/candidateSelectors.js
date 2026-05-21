import { mockDb } from "../../mock-db/index.js"
import { denormalize } from "../../mock-db/shared/normalize.js"

const STATUS_LABELS = {
  MOBILIZED: "Pending",
  ENROLLED: "Pending",
  IN_TRAINING: "Approved",
  ASSESSED: "Approved",
  CERTIFIED: "Approved",
  PLACED: "Approved",
  DROPPED: "Rejected",
  APPROVED: "Approved",
  REJECTED: "Rejected",
}

export function toCandidateLifecycleRow(candidate) {
  const enrollment =
    candidate.enrollment ||
    denormalize(mockDb.enrollments).find((record) => record.candidateId === candidate.id)
  const batch = enrollment ? mockDb.batches.byId[enrollment.batchId] : null
  const center = enrollment ? mockDb.centers.byId[enrollment.centerId] : null
  const project = enrollment ? mockDb.projects.byId[enrollment.projectId] : null
  const mobilizer = candidate.mobilizerEmployeeId ? mockDb.employees.byId[candidate.mobilizerEmployeeId] : null
  const files = denormalize(mockDb.fileUploads).filter((file) => file.ownerType === "Candidate" && file.ownerId === candidate.id)
  const normalizeFile = (file) => file ? { ...file, name: file.fileName, type: file.mimeType } : null
  const fallbackDocuments = candidate.documents || {}
  const documentUrl = (key) => fallbackDocuments[key]?.url || fallbackDocuments[key] || null
  const isEnrolled = ["IN_TRAINING", "ASSESSED", "CERTIFIED", "PLACED"].includes(candidate.status)

  return {
    ...candidate,
    name: [candidate.firstName, candidate.lastName].filter(Boolean).join(" "),
    mobilizer: mobilizer ? `${mobilizer.firstName} ${mobilizer.lastName}` : "Unassigned",
    school: project?.name || "Not Assigned",
    center: center?.name || "Not Assigned",
    centerId: center?.id || null,
    project: project?.name || "Not Assigned",
    projectId: project?.id || null,
    batch: batch?.code || "Not Assigned",
    batchId: batch?.id || null,
    jobrole: batch?.trade || "Not Assigned",
    enrollmentDate: enrollment?.enrolledOn || "-",
    qualification: candidate.qualification || "Not Captured",
    qualificationTrade: batch?.trade || "-",
    qualificationInstitute: candidate.qualificationInstitute || "-",
    qualificationYear: candidate.qualificationYear || "-",
    aadhaar: candidate.aadhaar || "XXXX-XXXX-MOCK",
    dob: candidate.dob || "-",
    experience: candidate.experience || "Not Captured",
    currentlyEmployed: candidate.currentlyEmployed || "No",
    address: candidate.address || `${candidate.district}, Odisha`,
    status: STATUS_LABELS[candidate.status] || candidate.status,
    verified: candidate.status !== "MOBILIZED" && candidate.status !== "REJECTED",
    enrolled: isEnrolled,
    image: candidate.image || `https://i.pravatar.cc/400?u=${candidate.id}`,
    liveLocation: candidate.liveLocation || { place: `${candidate.district} training cluster` },
    documents: {
      aadhaar: normalizeFile(files.find((file) => file.fileName.toLowerCase().includes("aadhaar"))) || fallbackDocuments.aadhaar || null,
      qualification: normalizeFile(files.find((file) => file.fileName.toLowerCase().includes("qualification"))) || fallbackDocuments.qualification || null,
      experience: normalizeFile(files.find((file) => file.fileName.toLowerCase().includes("experience"))) || fallbackDocuments.experience || null,
      license: normalizeFile(files.find((file) => file.fileName.toLowerCase().includes("license"))) || fallbackDocuments.license || null,
    },
    aadhaarFile: documentUrl("aadhaar") || "/mock-files/aadhaar-card.pdf",
    qualificationFile: documentUrl("qualification") || "/certificate.jpg",
    licenceFile: documentUrl("license") || "/mock-files/aadhaar-card.pdf",
  }
}

export function selectCandidateLifecycle(records = denormalize(mockDb.candidates)) {
  return records.map(toCandidateLifecycleRow)
}
