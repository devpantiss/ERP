import { create } from "zustand"
import { financeService } from "../services/index.js"

export const useSalaryStore = create((set) => ({
  salaries: [],
  loading: false,
  error: null,

  async fetchSalaries(query = {}) {
    set({ loading: true, error: null })
    try {
      const response = await financeService.salaries.list({ ...query, include: ["employee", "project"] })
      set({ salaries: response.data, loading: false })
      return response.data
    } catch (error) {
      set({ loading: false, error: error.message })
      return []
    }
  },

  async updateSalary(id, patch) {
    set((state) => ({
      salaries: state.salaries.map((salary) => (salary.id === id ? { ...salary, ...patch } : salary)),
    }))
    const response = await financeService.salaries.update(id, patch)
    return response.data
  },
}))

