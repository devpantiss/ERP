import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useEmployeeTargetStore = create(persist((set, get) => ({
  targets: [],
  setTargets(next) {
    const targets = typeof next === "function" ? next(get().targets) : next;
    localStorage.setItem("pantiss:employee-monthly-targets", JSON.stringify({ state: { targets }, version: 0 }));
    set({ targets });
  },
}), { name: "pantiss:employee-monthly-targets" }));

if (typeof window !== "undefined") {
  const sync = (event) => { if (event.key === "pantiss:employee-monthly-targets") useEmployeeTargetStore.persist.rehydrate(); };
  window.addEventListener("storage", sync);
  if (import.meta.hot) import.meta.hot.dispose(() => window.removeEventListener("storage", sync));
}
