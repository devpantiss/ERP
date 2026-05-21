import { create } from "zustand"
import { placementService } from "../services/index.js"

export const usePlacementStore = create((set, get) => ({
  companies: [],
  drives: [],
  companiesById: {},
  drivesById: {},
  loading: false,
  error: null,
  lastFetchedAt: null,

  async fetchCompanies(query = {}) {
    set({ loading: true, error: null })
    try {
      const response = await placementService.companies.list(query)
      set({
        companies: response.data,
        companiesById: Object.fromEntries(response.data.map((company) => [company.id, company])),
        loading: false,
        lastFetchedAt: Date.now(),
      })
      return response.data
    } catch (error) {
      set({ loading: false, error: error.message })
      return []
    }
  },

  async fetchDrives(query = {}) {
    set({ loading: true, error: null })
    try {
      const response = await placementService.listDrives(query)
      set({
        drives: response.data,
        drivesById: Object.fromEntries(response.data.map((drive) => [drive.id, drive])),
        loading: false,
        lastFetchedAt: Date.now(),
      })
      return response.data
    } catch (error) {
      set({ loading: false, error: error.message })
      return []
    }
  },

  async updateCompany(id, patch) {
    const previous = get().companiesById[id]
    const optimistic = { ...previous, ...patch }
    set((state) => ({
      companies: state.companies.map((company) => (company.id === id ? optimistic : company)),
      companiesById: { ...state.companiesById, [id]: optimistic },
    }))
    const response = await placementService.companies.update(id, patch)
    return response.data
  },

  async updateDrive(id, patch) {
    const previous = get().drivesById[id]
    const optimistic = { ...previous, ...patch }
    set((state) => ({
      drives: state.drives.map((drive) => (drive.id === id ? optimistic : drive)),
      drivesById: { ...state.drivesById, [id]: optimistic },
    }))
    const response = await placementService.drives.update(id, patch)
    return response.data
  },
}))

