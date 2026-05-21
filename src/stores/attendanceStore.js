import { create } from "zustand"
import { attendanceService } from "../services/index.js"
import { createAsyncSlice } from "./storeUtils.js"

export const useAttendanceStore = create((set, get) => ({
  ...createAsyncSlice(attendanceService)(set, get),
}))
