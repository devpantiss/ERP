export function createAsyncSlice(service, defaultQuery = {}) {
  return (set, get) => ({
    records: [],
    byId: {},
    filters: {},
    loading: false,
    error: null,
    lastFetchedAt: null,

    async fetchAll(query = {}) {
      set({ loading: true, error: null })
      try {
        const response = await service.list({ ...defaultQuery, ...query, filters: { ...get().filters, ...(query.filters || {}) } })
        const byId = Object.fromEntries(response.data.map((record) => [record.id, record]))
        set({ records: response.data, byId, loading: false, lastFetchedAt: Date.now() })
        return response.data
      } catch (error) {
        set({ loading: false, error: error.message })
        return []
      }
    },

    setFilters(filters) {
      set({ filters })
    },

    async create(payload, options = {}) {
      const tempId = payload.id || `TMP-${Date.now()}`
      const optimistic = { ...payload, id: tempId, optimistic: true }
      set((state) => ({ records: [optimistic, ...state.records], byId: { ...state.byId, [tempId]: optimistic } }))
      const response = await service.create(payload, options)
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

    async update(id, patch, options = {}) {
      const previous = get().byId[id]
      const optimistic = { ...previous, ...patch }
      set((state) => ({
        records: state.records.map((record) => (record.id === id ? optimistic : record)),
        byId: { ...state.byId, [id]: optimistic },
      }))
      const response = await service.update(id, patch, options)
      return response.data
    },
  })
}

