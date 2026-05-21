import { create } from "zustand"
import { candidateService } from "../services/index.js"
import { createAsyncSlice } from "./storeUtils.js"

export const useCandidateStore = create((set, get) => ({
  ...createAsyncSlice(candidateService)(set, get),
  async fetchLifecycle(query = {}) {
    set({ loading: true, error: null })
    const response = await candidateService.listLifecycle(query)
    const byId = Object.fromEntries(response.data.map((record) => [record.id, record]))
    set({ records: response.data, byId, loading: false, lastFetchedAt: Date.now() })
    return response.data
  },
  async createLifecycle(payload, options = {}) {
    const tempId = payload.id || `TMP-${Date.now()}`
    const optimistic = { ...payload, id: tempId, optimistic: true }
    set((state) => ({ records: [optimistic, ...state.records], byId: { ...state.byId, [tempId]: optimistic } }))
    const response = await candidateService.createLifecycle(payload, options)
    set((state) => {
      const nextById = { ...state.byId }
      delete nextById[tempId]
      nextById[response.data.id] = response.data
      return {
        records: state.records.map((record) => (record.id === tempId ? response.data : record)),
        byId: nextById,
      }
    })
    return response.data
  },
}))
