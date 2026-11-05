import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus, ReceiptText } from "lucide-react";
import SlidePanel from "../../components/common/SlidePanel";
import { mockDb, getRoleScopes } from "../../mock-db";
import { useAuthStore } from "../../stores/authStore";
import { useProjectExecutionStore } from "./projectExecutionStore";
import { trancheReleaseStatus, invoiceDeadlineFlag, money, PHASES, projectActuals, usedProjectBudget } from "./projectFinanceModel";
import "../../pages/ProjectLead/ProjectLead.css";
import "../../components/monitoring/monitoring.css";
import "./projectFinance.css";

export default function ProjectFinancialPanel({ projectId, financeQueue = false }) {
  const path = useLocation().pathname;
  const session = useAuthStore((state) => state.currentUser);
  const user = session || mockDb.users.byId[path.startsWith("/super-admin") ? "USR-0001" : path.startsWith("/center-incharge") ? "USR-0007" : "USR-0002"];
  const scopes = getRoleScopes(user, mockDb);
  const vertical = scopes.roleCodes.includes("SUPER_ADMIN") && scopes.schoolIds.includes(mockDb.projects.byId[projectId]?.schoolId);
  const lead = scopes.roleCodes.includes("PROJECT_HEAD") && scopes.projectIds.includes(projectId);
  const plan = useProjectExecutionStore((state) => state.plans[projectId]);
  const invoices = useProjectExecutionStore((state) => state.invoices);
  const expenses = useProjectExecutionStore((state) => state.expenses[projectId]);
  const [panel, setPanel] = useState(null);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);
  useEffect(() => {
    if (!panel) return;
    const trigger = document.activeElement;
    formRef.current?.querySelector("input, select, button")?.focus();
    return () => { if (trigger?.isConnected) trigger.focus(); };
  }, [panel]);
  const containFocus = (event) => {
    if (event.key !== "Tab") return;
    const controls = [...formRef.current.querySelectorAll("input, select, button, textarea")].filter((element) => !element.disabled && element.tabIndex >= 0);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  const used = usedProjectBudget(mockDb, projectId, expenses || []);
  const actuals = projectActuals(mockDb, projectId);
  const project = mockDb.projects.byId[projectId];
  const open = (type, tranche) => { setPanel({ type, tranche }); setError(""); setDraft(type === "expense" ? { amount: "", description: "", paidOn: "" } : { reference: "", file: null }); };
  const save = async (event) => {
    event.preventDefault(); setError(""); setSaving(true);
    try {
      const store = useProjectExecutionStore.getState();
      if (panel.type === "expense") store.recordExpense(projectId, draft, user);
      else {
        let attachment;
        if (draft.file) {
          if (draft.file.size > 2 * 1024 * 1024) throw new Error("Choose an attachment smaller than 2 MB.");
          const url = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error("Could not read the invoice attachment.")); reader.readAsDataURL(draft.file); });
          attachment = { name: draft.file.name, url };
        }
        store.raiseInvoice(projectId, panel.tranche.id, panel.type, { reference: draft.reference, attachment }, user);
      }
      setMessage(panel.type === "vertical" ? "Tranche invoice submitted to the Finance queue." : panel.type === "lead" ? "Tranche invoice raised to the Vertical Head." : "Project financial records saved."); setPanel(null);
    } catch (issue) { setError(issue.message); } finally { setSaving(false); }
  };
  const filteredTranches = (plan?.tranches || []).filter((tranche) => !financeQueue || invoices[`${projectId}:${tranche.id}`]?.financeSubmittedAt);
  return <section className="lead-workspace financial-project" aria-label="Project budget and tranche invoices">
    <header className="financial-section-title"><div><p className="lead-eyebrow">{financeQueue ? "Finance division / Received invoices" : "Project financials"}</p><h2>{financeQueue ? project?.name : "Budget & payment tranches"}</h2><p>{financeQueue ? "Tranche invoices submitted by the Vertical Head." : "Allotted budget, recorded expenditure, and invoice deadlines."}</p></div>{vertical && plan && !financeQueue && <div className="financial-actions"><button onClick={() => open("expense")}><Plus size={15} />Record expense</button></div>}</header>
    {plan?.demo && <p className="lead-notice">Demo project financials · Sample budgets, expenses and invoice handoffs for this project. Release readiness uses the project’s recorded learner outcomes.</p>}
    {message && <p className="lead-notice" role="status">{message}</p>}
    {!financeQueue && <><div className="financial-budget-grid">{[["Project valuation", plan ? money(plan.valuation) : "Not configured"], ["Allotted budget", plan ? money(plan.budget) : "Not configured"], ["Budget used", money(used)], ["Remaining budget", plan ? money(Number(plan.budget) - used) : "Not configured"]].map(([label, value]) => <div key={label}><p>{label}</p><strong>{value}</strong></div>)}</div>{plan && <><progress className="financial-budget-progress" aria-label="Budget utilization" value={Math.min(used, Number(plan.budget))} max={Number(plan.budget)} /><p className={used > Number(plan.budget) ? "lead-error" : "lead-notice"}>{(used / Number(plan.budget) * 100).toFixed(1)}% used{used > Number(plan.budget) ? ` · Over budget by ${money(used - Number(plan.budget))}` : ""}</p></>}<p className="lead-notice">Used budget includes paid invoices, reimbursements, salaries and recorded expenses. Tranche income is excluded.</p></>}
    {!plan && <p className="lead-notice">No financial plan was recorded when this project was created. Budgets and payment tranche schedules are entered only during project creation.</p>}
    {!!filteredTranches.length && <div className="monitoring-table"><table><caption className="sr-only">Tranche invoice schedule and workflow</caption><thead><tr>{["Tranche / Amount", "Release conditions", "Project Lead → Vertical Head", "Vertical Head → Finance", "Status / Action"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{filteredTranches.map((tranche) => {
      const invoice = invoices[`${projectId}:${tranche.id}`] || {};
      const release = trancheReleaseStatus(tranche, actuals);
      const flag = invoiceDeadlineFlag(tranche, invoice, undefined, Number(plan.warningDays));
      return <tr key={tranche.id}><td><strong>{tranche.label}</strong><small>{money(tranche.amount)}</small></td><td><span className={`lead-status ${release.met ? "" : "monitoring-warning"}`}>{release.label}</span>{release.conditions.map((condition, index) => <small key={index} className="financial-capitalize">{condition.phase}: {condition.actual} / {condition.target} · {condition.met ? "Met" : "Pending"}</small>)}</td><td>{tranche.leadDueOn}<small>{invoice.leadRaisedAt ? `Raised ${invoice.leadRaisedAt.slice(0, 10)} · ${invoice.leadReference}` : "Awaiting Project Lead"}</small>{invoice.leadAttachment && <a href={invoice.leadAttachment.url} download={invoice.leadAttachment.name}>Download invoice</a>}</td><td>{tranche.financeDueOn}<small>{invoice.financeSubmittedAt ? `Submitted ${invoice.financeSubmittedAt.slice(0, 10)} · ${invoice.financeReference}` : "Awaiting Vertical Head submission"}</small>{invoice.financeAttachment && <a href={invoice.financeAttachment.url} download={invoice.financeAttachment.name}>Download finance invoice</a>}</td><td>{flag && <span className={`lead-status ${flag.severity === "Deadline missed" ? "monitoring-overdue" : "monitoring-warning"}`}>{flag.severity}</span>}<small>{flag?.detail || (invoice.financeSubmittedAt ? "Submitted to Finance" : "On schedule")}</small>{!financeQueue && lead && !invoice.leadRaisedAt && <button disabled={!release.met} onClick={() => open("lead", tranche)}><ReceiptText size={14} />Raise to Vertical Head</button>}{!financeQueue && vertical && invoice.leadRaisedAt && !invoice.financeSubmittedAt && <button disabled={!release.met} onClick={() => open("vertical", tranche)}><ReceiptText size={14} />Raise Invoice to Finance</button>}</td></tr>;
    })}</tbody></table></div>}
    {financeQueue && !filteredTranches.length && <p className="lead-notice">No tranche invoices submitted to Finance for this project.</p>}
    {plan && !financeQueue && <div className="financial-milestones">{PHASES.map((phase) => { const milestone = plan.milestones?.[phase]; return <div key={phase}><p className="financial-capitalize">{phase}</p><strong>{actuals[phase]} / {milestone?.target || "Not set"}</strong><small>{milestone?.dueOn ? `Target date: ${milestone.dueOn}` : "No target deadline set"}</small></div>; })}</div>}
    {!!expenses?.length && !financeQueue && <details className="lead-notice"><summary>Recorded expenses ({expenses.length})</summary>{expenses.map((expense) => <p key={expense.id}>{expense.paidOn} · {expense.description} · {money(expense.amount)}</p>)}</details>}
    <SlidePanel open={!!panel} onClose={() => { if (!saving) setPanel(null); }} title={panel?.type === "expense" ? "Record project expense" : panel?.type === "lead" ? "Raise invoice to Vertical Head" : "Raise invoice to Finance"} width="2xl">
      {panel && <form ref={formRef} role="dialog" aria-modal="true" aria-label={panel.type === "expense" ? "Record project expense" : "Raise tranche invoice"} onKeyDown={containFocus} onSubmit={save} className="financial-form">{panel.type === "expense" ? <><label>Expense description<input required value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label><label>Amount paid (₹)<input type="number" min="0.01" step="0.01" required value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} /></label><label>Payment date<input type="date" required value={draft.paidOn} onChange={(event) => setDraft({ ...draft, paidOn: event.target.value })} /></label><p className="lead-notice">Record a paid expense not already present in the invoice or reimbursement records.</p></> : <><p>{panel.tranche.label} · {money(panel.tranche.amount)}</p><label>Invoice reference<input required value={draft.reference} onChange={(event) => setDraft({ ...draft, reference: event.target.value })} /></label><label>Invoice attachment (optional)<input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(event) => setDraft({ ...draft, file: event.target.files?.[0] })} /></label><p className="lead-notice">This records the invoice handoff in the ERP. Files up to 2 MB.</p></>}{error && <p className="lead-error" role="alert">{error}</p>}<footer className="financial-actions"><button type="button" onClick={() => setPanel(null)} disabled={saving}>Cancel</button><button className="lead-primary" disabled={saving}>{saving ? "Saving…" : panel.type === "vertical" ? "Submit to Finance" : panel.type === "lead" ? "Raise invoice" : "Save"}</button></footer></form>}
    </SlidePanel>
  </section>;
}
