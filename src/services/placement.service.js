import { mockDb } from "../mock-db/index.js"
import { createCrudService, joinRecord } from "./mockApiClient.js"

const driveCrud = createCrudService("placementDrives")

export const placementService = {
  companies: createCrudService("companies"),
  drives: driveCrud,
  async listDrives(options = {}) {
    const response = await driveCrud.list({ ...options, include: ["company", "project", "center"] })
    return {
      ...response,
      data: response.data.map((drive) => ({
        ...drive,
        candidates: drive.candidateIds.map((id) => mockDb.candidates.byId[id]).filter(Boolean),
      })),
    }
  },
  async getDrive(id, options = {}) {
    const response = await driveCrud.getById(id, { ...options, include: ["company", "project", "center"] })
    return {
      data: response.data
        ? {
            ...response.data,
            candidates: response.data.candidateIds.map((candidateId) => joinRecord(mockDb.candidates.byId[candidateId], [])).filter(Boolean),
          }
        : null,
    }
  },
}
