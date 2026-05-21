import { createCrudService } from "./mockApiClient.js"

export const employeeService = {
  ...createCrudService("employees"),
  listWithAssignments(options = {}) {
    return createCrudService("employees").list({ ...options, include: ["roles"] })
  },
}
