import { mockDb } from "../mock-db/index.js"
import { createCrudService, joinRecord } from "./mockApiClient.js"
import { denormalize } from "../mock-db/shared/normalize.js"

const candidateCrud = createCrudService("candidates")
const enrollmentCrud = createCrudService("enrollments")

export const candidateService = {
  ...candidateCrud,
  async listLifecycle(options = {}) {
    const response = await candidateCrud.list(options)
    const data = response.data.map((candidate) => {
      const enrollment = denormalize(mockDb.enrollments).find((item) => item.candidateId === candidate.id)
      const assessment = denormalize(mockDb.assessments).find((item) => item.candidateId === candidate.id)
      const certification = denormalize(mockDb.certifications).find((item) => item.candidateId === candidate.id)
      return {
        ...candidate,
        enrollment: enrollment ? joinRecord(enrollment, ["project", "center", "batch"]) : null,
        assessment,
        certification,
      }
    })
    return { ...response, data }
  },
  async createLifecycle(payload, options = {}) {
    const { enrollment, ...candidatePayload } = payload
    const candidateResponse = await candidateCrud.create(candidatePayload, options)
    if (enrollment) {
      await enrollmentCrud.create({ ...enrollment, candidateId: candidateResponse.data.id }, options)
    }

    const lifecycle = await this.listLifecycle({
      filters: { id: candidateResponse.data.id },
      currentUser: options.currentUser,
    })
    return { data: lifecycle.data[0] || candidateResponse.data }
  },
}
