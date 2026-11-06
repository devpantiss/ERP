export const PHASES = ["enrollment", "training", "placement"];
export const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value) || 0);
export const toPaise = (value) => Math.round(Number(value) * 100);
export const dayDifference = (date, today) => Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
export const indiaToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export const emptyFinancialPlan = () => ({ valuation: "", budget: "", warningDays: 7, tranches: [] });

export function validateFinancialPlan(plan, project = {}) {
  if (!Number.isSafeInteger(toPaise(plan.valuation)) || toPaise(plan.valuation) <= 0) return "Enter a positive project valuation.";
  if (!Number.isSafeInteger(toPaise(plan.budget)) || toPaise(plan.budget) <= 0) return "Enter a positive allotted budget.";
  if (!Number.isInteger(Number(plan.warningDays)) || Number(plan.warningDays) < 1 || Number(plan.warningDays) > 30) return "Set the warning window between 1 and 30 days.";
  if (!plan.tranches?.length) return "Add at least one payment tranche.";
  if (new Set(plan.tranches.map((tranche) => tranche.id)).size !== plan.tranches.length) return "Tranche identifiers must be unique.";
  let total = 0;
  for (const tranche of plan.tranches) {
    if (!tranche.label?.trim() || !Number.isSafeInteger(toPaise(tranche.amount)) || toPaise(tranche.amount) <= 0) return "Each tranche needs a name and a positive amount.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tranche.leadDueOn || "") || !/^\d{4}-\d{2}-\d{2}$/.test(tranche.financeDueOn || "") || !Number.isFinite(dayDifference(tranche.leadDueOn, tranche.financeDueOn))) return "Set both invoice deadlines for every tranche.";
    if (tranche.leadDueOn > tranche.financeDueOn) return "The Project Lead deadline must be on or before the Finance submission deadline.";
    if ((project.startDate && tranche.leadDueOn < project.startDate) || (project.endDate && tranche.financeDueOn > project.endDate)) return "Tranche deadlines must fall within the project timeline.";
    if (tranche.conditions !== undefined && (!Array.isArray(tranche.conditions) || !tranche.conditions.length || tranche.conditions.some((condition) => !PHASES.includes(condition.phase) || !Number.isInteger(Number(condition.target)) || Number(condition.target) <= 0))) return "Set a positive learner target for every tranche release condition.";
    for (const milestone of tranche.conditions || []) {
      if (milestone.dueOn === undefined) continue; // Read compatibility for plans saved before dated tranche milestones.
      if (!/^\d{4}-\d{2}-\d{2}$/.test(milestone.dueOn) || !Number.isFinite(dayDifference(milestone.dueOn, tranche.leadDueOn))) return "Set a deadline for every tranche milestone.";
      if (milestone.dueOn > tranche.leadDueOn) return "Milestone deadlines must be on or before the Project Lead invoice deadline.";
      if ((project.startDate && milestone.dueOn < project.startDate) || (project.endDate && milestone.dueOn > project.endDate)) return "Milestone deadlines must fall within the project timeline.";
    }
    total += toPaise(tranche.amount);
  }
  if (total !== toPaise(plan.valuation)) return "Tranche amounts must add up to the project valuation.";
  for (const phase of PHASES) {
    const milestone = plan.milestones?.[phase];
    if (!milestone?.target && !milestone?.dueOn) continue;
    if (!Number.isInteger(Number(milestone.target)) || Number(milestone.target) <= 0 || !milestone.dueOn) return `Set a positive target and deadline for ${phase}.`;
    if ((project.startDate && milestone.dueOn < project.startDate) || (project.endDate && milestone.dueOn > project.endDate)) return `${phase} deadline must fall within the project timeline.`;
  }
  return "";
}

export function invoiceDeadlineFlag(tranche, invoice = {}, today = indiaToday(), warningDays = 7) {
  if (invoice.financeSubmittedAt) return null;
  const stage = invoice.leadRaisedAt ? "Finance submission" : "Project Lead invoice";
  const dueOn = invoice.leadRaisedAt ? tranche.financeDueOn : tranche.leadDueOn;
  const days = dayDifference(dueOn, today);
  if (!Number.isFinite(days) || days > warningDays) return null;
  return { severity: days < 0 ? "Deadline missed" : "Warning", date: dueOn, stage, detail: days < 0 ? `${stage} is ${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} overdue.` : days === 0 ? `${stage} is due today.` : `${stage} is due in ${days} ${days === 1 ? "day" : "days"}.` };
}

export function advanceTrancheInvoice(invoice = {}, stage, { reference, actorId, at = new Date().toISOString(), attachment } = {}) {
  if (!reference?.trim() || !actorId) throw new Error("Enter an invoice reference.");
  if (stage === "lead") {
    if (invoice.leadRaisedAt) throw new Error("This tranche has already been raised to the Vertical Head.");
    return { ...invoice, leadReference: reference.trim(), leadRaisedAt: at, leadRaisedBy: actorId, leadAttachment: attachment };
  }
  if (stage === "vertical") {
    if (!invoice.leadRaisedAt) throw new Error("The Project Lead must raise the tranche invoice first.");
    if (invoice.financeSubmittedAt) throw new Error("This invoice is already in the Finance queue.");
    return { ...invoice, financeReference: reference.trim(), financeSubmittedAt: at, financeSubmittedBy: actorId, financeAttachment: attachment };
  }
  throw new Error("Unknown invoice stage.");
}

export function previousAttendanceWeek(today) {
  const date = new Date(`${today}T00:00:00Z`);
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - mondayOffset - 1);
  const end = date.toISOString().slice(0, 10);
  date.setUTCDate(date.getUTCDate() - 6);
  return { start: date.toISOString().slice(0, 10), end };
}

export function projectActuals(db, projectId) {
  const enrollments = Object.values(db.enrollments.byId).filter((item) => item.projectId === projectId && !["CANCELLED", "REJECTED"].includes(item.status));
  const ids = new Set(enrollments.map((item) => item.candidateId));
  const candidates = [...ids].map((id) => db.candidates.byId[id]).filter(Boolean);
  return {
    enrollment: ids.size,
    training: candidates.filter((candidate) => ["ASSESSED", "CERTIFIED", "PLACED", "COMPLETED"].includes(candidate.status)).length,
    placement: candidates.filter((candidate) => candidate.status === "PLACED").length,
  };
}

export function usedProjectBudget(db, projectId, expenses = []) {
  const paidInvoices = Object.values(db.invoices.byId).filter((row) => row.projectId === projectId && row.status?.toUpperCase() === "PAID");
  const paidReimbursements = Object.values(db.reimbursements.byId).filter((row) => row.projectId === projectId && row.status?.toUpperCase() === "PAID");
  const paidSalaries = Object.values(db.salaries?.byId || {}).filter((row) => row.projectId === projectId && row.status?.toUpperCase() === "PAID");
  return [...paidInvoices, ...paidReimbursements, ...paidSalaries, ...expenses].reduce((sum, row) => sum + toPaise(row.paidAmount ?? row.totalAmount ?? row.amount ?? row.grossAmount ?? 0), 0) / 100;
}

// Release rules are fixed with the project plan; outcomes come from project records.
export function trancheReleaseStatus(tranche, actuals) {
  if (!Array.isArray(tranche.conditions) || !tranche.conditions.length) return { met: false, conditions: [], label: "Release conditions not recorded" };
  const conditions = tranche.conditions.map((condition) => ({ ...condition, actual: actuals[condition.phase] ?? 0, met: PHASES.includes(condition.phase) && Number(condition.target) > 0 && (actuals[condition.phase] ?? 0) >= Number(condition.target) }));
  const met = conditions.every((condition) => condition.met);
  return { met, conditions, label: met ? "Conditions met" : "Conditions not met" };
}

export function projectMilestones(plan) {
  const milestones = (plan?.tranches || []).flatMap((tranche) => (tranche.conditions || []).filter((condition) => condition.dueOn).map((condition, index) => ({ ...condition, id: `${tranche.id}-${index}`, trancheId: tranche.id, trancheLabel: tranche.label })));
  if (milestones.length) return milestones;
  // Existing plans retain their original project-level targets without rewriting saved data.
  return PHASES.filter((phase) => plan?.milestones?.[phase]?.dueOn).map((phase) => ({ ...plan.milestones[phase], phase, id: phase }));
}
