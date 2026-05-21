import { create } from "zustand"
import { dashboardService } from "../services/index.js"

export const useDashboardStore = create((set) => ({
  summary: null,
  metrics: [],
  loading: false,
  error: null,
  lastFetchedAt: null,

  async fetchSummary(query = {}) {
    set({ loading: true, error: null })
    try {
      const response = await dashboardService.getEnterpriseSummary(query)
      set({ summary: response.data, metrics: response.data.metrics, loading: false, lastFetchedAt: Date.now() })
      return response.data
    } catch (error) {
      set({ error: error.message, loading: false })
      return null
    }
  },
}))
