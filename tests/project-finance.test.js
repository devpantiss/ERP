import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyFinancialPlan, validateFinancialPlan, invoiceDeadlineFlag, advanceTrancheInvoice, previousAttendanceWeek, usedProjectBudget } from '../src/features/project-finance/projectFinanceModel.js';
import { buildOperationalAlerts } from '../src/components/monitoring/monitoringData.js';
const project = { id: 'p', name: 'Project', startDate: '2026-01-01', endDate: '2026-12-31', status: 'ACTIVE' };
const plan = () => ({ ...emptyFinancialPlan(), valuation: 100000, budget: 80000, tranches: [{ id: 't1', label: 'Tranche 1', amount: 40000, leadDueOn: '2026-11-10', financeDueOn: '2026-11-15' }, { id: 't2', label: 'Tranche 2', amount: 60000, leadDueOn: '2026-12-10', financeDueOn: '2026-12-15' }] });
const base = { projects: [project], batches: [], employees: [], attendance: [], today: '2026-11-04' };

test('financial plans balance tranche revenue and validate both handoff dates against project timeline', () => {
  assert.equal(validateFinancialPlan(plan(), project), '');
  const wrongTotal = plan(); wrongTotal.tranches[0].amount = 39999.99;
  assert.match(validateFinancialPlan(wrongTotal, project), /add up/);
  const reversed = plan(); reversed.tranches[0].leadDueOn = '2026-11-20';
  assert.match(validateFinancialPlan(reversed, project), /on or before/);
  const outside = plan(); outside.tranches[0].leadDueOn = '2025-12-30';
  assert.match(validateFinancialPlan(outside, project), /within/);
});
test('tranche invoices warn near the current stage deadline, turn red after it, and clear after Finance handoff', () => {
  const tranche = plan().tranches[0];
  assert.equal(invoiceDeadlineFlag(tranche, {}, '2026-11-02', 7), null);
  assert.equal(invoiceDeadlineFlag(tranche, {}, '2026-11-03', 7).severity, 'Warning');
  assert.equal(invoiceDeadlineFlag(tranche, {}, '2026-11-10', 7).severity, 'Warning');
  assert.equal(invoiceDeadlineFlag(tranche, {}, '2026-11-11', 7).severity, 'Deadline missed');
  const leadInvoice = advanceTrancheInvoice({}, 'lead', { reference: 'PL-1', actorId: 'lead', at: '2026-11-09T10:00:00Z' });
  assert.equal(invoiceDeadlineFlag(tranche, leadInvoice, '2026-11-11', 7).stage, 'Finance submission');
  assert.equal(invoiceDeadlineFlag(tranche, leadInvoice, '2026-11-16', 7).severity, 'Deadline missed');
  const submitted = advanceTrancheInvoice(leadInvoice, 'vertical', { reference: 'VH-1', actorId: 'head' });
  assert.equal(invoiceDeadlineFlag(tranche, submitted, '2026-11-20', 7), null);
  assert.throws(() => advanceTrancheInvoice({}, 'vertical', { reference: 'VH-1', actorId: 'head' }), /Project Lead/);
  assert.throws(() => advanceTrancheInvoice(submitted, 'vertical', { reference: 'VH-2', actorId: 'head' }), /already/);
});
test('both invoice stages and delayed delivery milestones feed the project alert model', () => {
  const value = plan();
  value.milestones = { enrollment: { target: 10, dueOn: '2026-11-01' }, training: { target: 8, dueOn: '2026-11-01' }, placement: { target: 5, dueOn: '2026-11-15' } };
  const alerts = buildOperationalAlerts({ ...base, plans: { p: value }, progress: { p: { enrollment: 9, training: 8, placement: 0 } } });
  assert.ok(alerts.some((item) => item.category === 'Invoice' && item.stage === 'Project Lead invoice' && item.severity === 'Warning'));
  assert.deepEqual(alerts.filter((item) => item.category === 'Delivery').map((item) => item.id), ['delivery-p-enrollment']);
  const raised = { 'p:t1': { leadRaisedAt: '2026-11-04T10:00:00Z' } };
  const next = buildOperationalAlerts({ ...base, today: '2026-11-16', plans: { p: value }, invoices: raised });
  assert.ok(next.some((item) => item.category === 'Invoice' && item.stage === 'Finance submission' && item.severity === 'Deadline missed'));
});
test('weekly attendance uses the last complete Monday-Sunday week and flags strictly below 70 percent', () => {
  assert.deepEqual(previousAttendanceWeek('2026-11-04'), { start: '2026-10-26', end: '2026-11-01' });
  assert.deepEqual(previousAttendanceWeek('2026-11-02'), { start: '2026-10-26', end: '2026-11-01' });
  const employee = { id: 'e', firstName: 'Test', lastName: 'Person', centerIds: ['c'] };
  const attendance = ['2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30'].map((date, index) => ({ subjectType: 'EMPLOYEE', subjectId: 'e', date, status: index < 3 ? 'PRESENT' : 'ABSENT' }));
  const alerts = buildOperationalAlerts({ ...base, employees: [employee], attendance });
  assert.ok(alerts.some((item) => item.severity === 'Warning' && /60.0%/.test(item.detail)));
  assert.equal(buildOperationalAlerts({ ...base, employees: [employee], attendance: attendance.map((row, index) => ({ ...row, status: index < 4 ? 'PRESENT' : 'ABSENT' })) }).filter((item) => item.category === 'Performance').length, 0);
  assert.equal(buildOperationalAlerts({ ...base, employees: [employee], attendance: attendance.map((row) => ({ ...row, date: '2026-11-02' })) }).filter((item) => item.category === 'Performance').length, 0);
});
test('budget used counts paid expenditure and recorded expenses, excluding revenue and unapproved bills', () => {
  const db = { invoices: { byId: { one: { projectId: 'p', amount: 100, status: 'PAID' }, two: { projectId: 'p', amount: 400, status: 'SUBMITTED' }, other: { projectId: 'other', amount: 1000, status: 'PAID' } } }, reimbursements: { byId: { one: { projectId: 'p', totalAmount: 50, status: 'PAID' } } }, salaries: { byId: { salary: { projectId: 'p', grossAmount: 75, status: 'PAID' } } }, revenue: { byId: { grant: { projectId: 'p', amount: 50000 } } } };
  assert.equal(usedProjectBudget(db, 'p', [{ amount: 25.25 }]), 250.25);
});
