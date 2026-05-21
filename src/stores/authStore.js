import { create } from "zustand"
import { authService } from "../services/index.js"

export const useAuthStore = create((set) => ({
  currentUser: null,
  loading: false,
  error: null,

  async hydrate(userId = "USR-0001") {
    set({ loading: true, error: null })
    try {
      const response = await authService.getSession(userId)
      set({ currentUser: response.data, loading: false })
      return response.data
    } catch (error) {
      set({ error: error.message, loading: false })
      return null
    }
  },

  async login(email) {
    set({ loading: true, error: null })
    const response = await authService.login(email)
    set({ currentUser: response.data, loading: false, error: response.data ? null : "Invalid mock user" })
    return response.data
  },

  logout() {
    set({ currentUser: null })
  },
}))
