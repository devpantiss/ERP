import { projectActuals } from "./projectFinanceModel.js";

// Finance fixtures belong to the existing mock projects. User-created plans always win.
export function demoProjectFinance(db) {
  const plans = {}, invoices = {}, expenses = {};
  Object.values(db.projects.byId).filter((project) => /^PRJ-000[123]$/.test(project.id)).forEach((project, index) => {
    const actual = projectActuals(db, project.id);
    const valuation = [1200000, 1800000, 1500000][index];
    const phase = actual.enrollment > 0 ? "enrollment" : "training";
    const achieved = Math.max(1, actual[phase]);
    const end = project.endDate;
    const due = (days) => { const date = new Date(`${end}T00:00:00Z`); date.setUTCDate(date.getUTCDate() - days); return date.toISOString().slice(0, 10); };
    const tranches = [
      { id: "demo-mobilization", label: "Mobilization grant", amount: valuation * .3, leadDueOn: due(60), financeDueOn: due(55), conditions: [{ phase, target: achieved }] },
      { id: "demo-training", label: "Training delivery", amount: valuation * .4, leadDueOn: due(30), financeDueOn: due(25), conditions: [{ phase: "enrollment", target: Math.max(1, actual.enrollment) }] },
      { id: "demo-placement", label: "Placement outcomes", amount: valuation * .3, leadDueOn: due(5), financeDueOn: end, conditions: [{ phase: "training", target: Math.max(10, actual.training + 5) }, { phase: "placement", target: Math.max(5, actual.placement + 3) }] },
    ];
    for (const tranche of tranches) tranche.conditions = tranche.conditions.map((condition) => ({ ...condition, dueOn: tranche.leadDueOn }));
    plans[project.id] = { demo: true, valuation, budget: valuation * .8, warningDays: 7, tranches };
    const key = `${project.id}:demo-mobilization`;
    invoices[key] = { projectId: project.id, trancheId: "demo-mobilization", amount: tranches[0].amount, leadReference: `DEMO/PL/${project.code}/01`, leadRaisedAt: `${due(65)}T10:00:00.000Z`, leadRaisedBy: "demo-project-lead" };
    // One completed handoff, one ready handoff, and unmet outcome conditions.
    if (index === 1) Object.assign(invoices[key], { financeReference: `DEMO/VH/${project.code}/01`, financeSubmittedAt: `${due(57)}T10:00:00.000Z`, financeSubmittedBy: "demo-vertical-head" });
    expenses[project.id] = [
      { id: `${project.id}-demo-rent`, description: "Demo · Center rent and utilities", amount: valuation * .12, paidOn: due(90), recordedBy: "demo" },
      { id: `${project.id}-demo-training-cost`, description: "Demo · Training materials and delivery", amount: valuation * .18, paidOn: due(45), recordedBy: "demo" },
    ];
  });
  return { plans, invoices, expenses };
}
