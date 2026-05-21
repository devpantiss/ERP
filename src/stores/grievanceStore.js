import { create } from "zustand"
import { grievanceService } from "../services/index.js"
import { createAsyncSlice } from "./storeUtils.js"

export const useGrievanceStore = create((set, get) => ({
  ...createAsyncSlice(grievanceService)(set, get),
}))
