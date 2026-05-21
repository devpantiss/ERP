import { create } from "zustand"
import { assessmentService } from "../services/index.js"
import { createAsyncSlice } from "./storeUtils.js"

export const useAssessmentStore = create((set, get) => ({
  ...createAsyncSlice(assessmentService)(set, get),
}))
