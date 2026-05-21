import { mockDb } from "../mock-db/index.js"
import { createCrudService } from "./mockApiClient.js"
import { denormalize } from "../mock-db/shared/normalize.js"

export const dashboardService = {
  ...createCrudService("dashboardMetrics"),
  async getEnterpriseSummary({ currentUser } = {}) {
    const [metrics, projects, centers, candidates, drives] = await Promise.all([
      createCrudService("dashboardMetrics").list({ currentUser }),
      createCrudService("projects").list({ currentUser }),
      createCrudService("centers").list({ currentUser }),
      createCrudService("candidates").list({ currentUser }),
      createCrudService("placementDrives").list({ currentUser }),
    ])

    return {
      data: {
        metrics: metrics.data,
        totals: {
          projects: projects.meta.count,
          centers: centers.meta.count,
          candidates: candidates.meta.count,
          placementDrives: drives.meta.count,
          companies: denormalize(mockDb.companies).length,
        },
      },
    }
  },
}
