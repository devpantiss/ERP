import { create } from "zustand"
import { createCrudService } from "../services/mockApiClient.js"

const leaveService = createCrudService("leaveRequests")
const tourService = createCrudService("tourRequests")
const reimbursementService = createCrudService("reimbursements")

export const useHrStore = create((set) => ({
  leaves: [],
  tours: [],
  reimbursements: [],
  loading: false,
  error: null,

  async fetchLeaves(query = {}) {
    set({ loading: true, error: null })
    try {
      const response = await leaveService.list({ ...query, include: ["employee"] })
      set({ leaves: response.data, loading: false })
      return response.data
    } catch (error) {
      set({ error: error.message, loading: false })
      return []
    }
  },

  async createLeave(payload, options = {}) {
    const response = await leaveService.create(payload, options)
    set((state) => ({ leaves: [response.data, ...state.leaves] }))
    return response.data
  },

  async fetchTours(query = {}) {
    const response = await tourService.list(query)
    set({ tours: response.data })
    return response.data
  },

  async createTour(payload, options = {}) {
    const response = await tourService.create(payload, options)
    set((state) => ({ tours: [response.data, ...state.tours] }))
    return response.data
  },

  async fetchReimbursements(query = {}) {
    const response = await reimbursementService.list(query)
    set({ reimbursements: response.data })
    return response.data
  },

  async createReimbursement(payload, options = {}) {
    const response = await reimbursementService.create(payload, options)
    set((state) => ({ reimbursements: [response.data, ...state.reimbursements] }))
    return response.data
  },

  async updateReimbursement(id, patch, options = {}) {
    const response = await reimbursementService.update(id, patch, options)
    set((state) => ({
      reimbursements: state.reimbursements.map((claim) =>
        claim.id === id ? { ...claim, ...response.data } : claim
      ),
    }))
    return response.data
  },
}))
