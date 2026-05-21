import { mockDb } from "../mock-db/index.js"
import { createCrudService, joinRecord } from "./mockApiClient.js"

const usersService = createCrudService("users")

export const authService = {
  ...usersService,
  async login(email) {
    const user = Object.values(mockDb.users.byId).find((record) => record.email === email)
    return { data: user ? joinRecord(user, ["roles", "employee"]) : null }
  },
  async getSession(userId = "USR-0001") {
    const user = mockDb.users.byId[userId]
    return { data: user ? joinRecord(user, ["roles", "employee"]) : null }
  },
}
