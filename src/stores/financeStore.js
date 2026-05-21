import { create } from "zustand"
import { financeService } from "../services/index.js"

export const useFinanceStore = create((set) => ({
  invoices: [],
  loading: false,
  error: null,

  async fetchInvoices(query = {}) {
    set({ loading: true, error: null })
    try {
      const response = await financeService.invoices.list(query)
      set({ invoices: response.data, loading: false })
      return response.data
    } catch (error) {
      set({ loading: false, error: error.message })
      return []
    }
  },

  async updateInvoice(id, patch) {
    set((state) => ({
      invoices: state.invoices.map((invoice) => (invoice.id === id ? { ...invoice, ...patch } : invoice)),
    }))
    const response = await financeService.invoices.update(id, patch)
    return response.data
  },
}))
