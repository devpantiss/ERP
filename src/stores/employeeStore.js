import { create } from "zustand"
import { employeeService } from "../services/index.js"
import { createAsyncSlice } from "./storeUtils.js"

export const useEmployeeStore = create((set, get) => ({
  ...createAsyncSlice(employeeService)(set, get),
  fetchWithAssignments(query = {}) {
    return get().fetchAll({ ...query, include: ["roles"] })
  },
}))
