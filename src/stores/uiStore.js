import { create } from "zustand"

export const useUiStore = create((set) => ({
  sidebarCollapsed: false,
  activeModule: "dashboard",
  tableDensity: "comfortable",
  toastQueue: [],

  setSidebarCollapsed(sidebarCollapsed) {
    set({ sidebarCollapsed })
  },
  setActiveModule(activeModule) {
    set({ activeModule })
  },
  setTableDensity(tableDensity) {
    set({ tableDensity })
  },
  pushToast(toast) {
    set((state) => ({ toastQueue: [...state.toastQueue, { id: Date.now(), ...toast }] }))
  },
  dismissToast(id) {
    set((state) => ({ toastQueue: state.toastQueue.filter((toast) => toast.id !== id) }))
  },
}))

