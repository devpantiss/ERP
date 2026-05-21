import { create } from "zustand"
import { exposureVisitService } from "../services/index.js"
import { createAsyncSlice } from "./storeUtils.js"

export const useExposureVisitStore = create((set, get) => ({
  ...createAsyncSlice(exposureVisitService)(set, get),
}))
