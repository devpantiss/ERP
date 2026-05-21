import { mockDb } from "../mock-db/index.js"
import { createCrudService } from "./mockApiClient.js"
import { denormalize } from "../mock-db/shared/normalize.js"

const projectCrud = createCrudService("projects")

export const projectService = {
  ...projectCrud,
  async getProjectWorkspace(projectId, options = {}) {
    const project = await projectCrud.getById(projectId, { ...options, include: ["fundingAgency"] })
    const centers = denormalize(mockDb.centers).filter((center) => center.projectId === projectId)
    const batches = denormalize(mockDb.batches).filter((batch) => batch.projectId === projectId)
    return { data: { project: project.data, centers, batches } }
  },
}
