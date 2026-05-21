import { create } from "zustand"
import { projectService } from "../services/index.js"
import { createAsyncSlice } from "./storeUtils.js"

export const useProjectStore = create((set, get) => ({
  ...createAsyncSlice(projectService)(set, get),
  activeWorkspace: null,
  async fetchWorkspace(projectId, query = {}) {
    set({ loading: true, error: null })
    const response = await projectService.getProjectWorkspace(projectId, query)
    set({ activeWorkspace: response.data, loading: false })
    return response.data
  },
}))
