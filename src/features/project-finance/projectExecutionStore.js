import { demoProjectFinance } from "./demoProjectFinance";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockDb, getRoleScopes } from "../../mock-db";
import { projectActuals, trancheReleaseStatus, advanceTrancheInvoice, indiaToday, toPaise, validateFinancialPlan } from "./projectFinanceModel";

function authorizedProject(user, projectId, stage) {
  const scope = getRoleScopes(user, mockDb);
  const project = mockDb.projects.byId[projectId];
  const vertical = scope.roleCodes.includes("SUPER_ADMIN") && scope.schoolIds.includes(project?.schoolId);
  const lead = scope.roleCodes.includes("PROJECT_HEAD") && scope.projectIds.includes(projectId);
  if (!(stage === "vertical" ? vertical : stage === "lead" ? lead : vertical || lead)) throw new Error("This project is outside your role or assigned scope.");
}
const demo = demoProjectFinance(mockDb);
const STORAGE_KEY = "pantiss:project-execution:v1";
function commit(set, get, patch) {
  const next = { ...get(), ...patch };
  // Check persistence before publishing financial changes to the UI.
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { plans: next.plans, invoices: next.invoices, expenses: next.expenses, catalog: next.catalog }, version: 0 }));
  set(patch);
}
const upsert = (entity, record) => {
  if (!mockDb[entity].byId[record.id]) mockDb[entity].allIds.push(record.id);
  mockDb[entity].byId[record.id] = record;
};
export function restoreProjectCatalog(catalog = {}) {
  for (const entry of Object.values(catalog)) {
    upsert("fundingAgencies", entry.agency); upsert("projects", entry.project); upsert("centers", entry.center);
    const lead = mockDb.employees.byId[entry.project.projectHeadEmployeeId];
    if (lead) { lead.projectIds = [...new Set([...lead.projectIds, entry.project.id])]; lead.centerIds = [...new Set([...lead.centerIds, entry.center.id])]; }
  }
}
export const useProjectExecutionStore = create(persist((set, get) => ({
  ...demo, catalog: {},
  raiseInvoice(projectId, trancheId, stage, details, user) {
    authorizedProject(user, projectId, stage);
    const tranche = get().plans[projectId]?.tranches.find((item) => item.id === trancheId);
    if (!tranche) throw new Error("This tranche is no longer available.");
    if (!trancheReleaseStatus(tranche, projectActuals(mockDb, projectId)).met) throw new Error("The tranche release conditions must be met before raising an invoice.");
    const key = `${projectId}:${trancheId}`;
    const invoice = advanceTrancheInvoice(get().invoices[key], stage, { ...details, actorId: user.id });
    commit(set, get, { invoices: { ...get().invoices, [key]: { ...invoice, projectId, trancheId, amount: Number(tranche.amount) } } });
  },
  recordExpense(projectId, expense, user) {
    authorizedProject(user, projectId, "vertical");
    if (!expense.description?.trim() || !expense.paidOn || expense.paidOn > indiaToday() || !Number.isSafeInteger(toPaise(expense.amount)) || toPaise(expense.amount) <= 0) throw new Error("Enter the expense description, payment date and a positive amount.");
    commit(set, get, { expenses: { ...get().expenses, [projectId]: [...(get().expenses[projectId] || []), { ...expense, id: crypto.randomUUID(), recordedBy: user.id }] } });
  },
  registerProject(entry, plan, user) {
    const scopes = getRoleScopes(user, mockDb);
    if (!scopes.roleCodes.includes("SUPER_ADMIN") || !scopes.schoolIds.includes(entry.project.schoolId)) throw new Error("Create projects within your assigned vertical.");
    if (mockDb.projects.byId[entry.project.id] || get().plans[entry.project.id]) throw new Error("Budget and payment tranches can only be entered when creating a new project.");
    if (!plan.tranches?.length || plan.tranches.some((tranche) => !tranche.conditions?.length)) throw new Error("Set release conditions for every payment tranche during project creation.");
    const error = validateFinancialPlan(plan, entry.project); if (error) throw new Error(error);
    commit(set, get, { catalog: { ...get().catalog, [entry.project.id]: entry }, plans: { ...get().plans, [entry.project.id]: plan } });
    restoreProjectCatalog({ [entry.project.id]: entry });
  },
}), { name: STORAGE_KEY, merge: (persisted, current) => {
  const saved = persisted || {};
  const seedIds = new Set(Object.keys(demo.plans).filter((id) => !saved.plans?.[id]));
  return { ...current, ...saved,
    plans: { ...demo.plans, ...saved.plans },
    invoices: { ...Object.fromEntries(Object.entries(demo.invoices).filter(([, invoice]) => seedIds.has(invoice.projectId))), ...saved.invoices },
    expenses: { ...Object.fromEntries(Object.entries(demo.expenses).filter(([id]) => seedIds.has(id))), ...saved.expenses },
  };
}, onRehydrateStorage: () => (state) => { if (state) restoreProjectCatalog(state.catalog); } }));

if (typeof window !== "undefined") {
  const sync = (event) => { if (event.key === STORAGE_KEY) useProjectExecutionStore.persist.rehydrate(); };
  window.addEventListener("storage", sync);
  if (import.meta.hot) import.meta.hot.dispose(() => window.removeEventListener("storage", sync));
}
