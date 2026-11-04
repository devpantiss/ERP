import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEmployeeMonthReport, employeeDataMonths, shiftMonth } from '../src/features/employee-performance/employeeReportModel.js';
const table = (records = []) => ({ byId: Object.fromEntries(records.map((row, index) => [row.id || index, row])) });
const employee = { id: 'e', projectIds: ['p1', 'p2'], joinedOn: '2024-01-01' };
const fixture = (patch = {}) => Object.fromEntries(Object.entries({ attendance: [], enrollments: [], candidates: [], tourRequests: [], batches: [], exposureVisits: [], placementDrives: [], users: [], leaveRequests: [], salaries: [], reimbursements: [], ...patch }).map(([key, value]) => [key, table(value)]));
const options = { today: '2026-11-04' };

test('monthly attendance excludes other employees/projects/months and missing data is not absence', () => {
  const db = fixture({ attendance: [
    { id: 'a', subjectType: 'EMPLOYEE', subjectId: 'e', projectId: 'p1', date: '2026-05-20', status: 'PRESENT' },
    { id: 'b', subjectType: 'EMPLOYEE', subjectId: 'e', projectId: 'p1', date: '2026-05-21', status: 'ABSENT' },
    { id: 'c', subjectType: 'EMPLOYEE', subjectId: 'other', projectId: 'p1', date: '2026-05-22', status: 'PRESENT' },
    { id: 'd', subjectType: 'EMPLOYEE', subjectId: 'e', projectId: 'p2', date: '2026-05-23', status: 'PRESENT' },
    { id: 'f', subjectType: 'EMPLOYEE', subjectId: 'e', projectId: 'p1', date: '2026-06-01', status: 'PRESENT' },
  ] });
  const report = buildEmployeeMonthReport(db, employee, '2026-05', ['p1'], options);
  assert.equal(report.recordedDays, 2); assert.equal(report.attendanceRate, 50); assert.equal(report.absent, 1);
  assert.ok(report.weeks.some((week) => week.warning));
  const empty = buildEmployeeMonthReport(db, employee, '2026-07', ['p1'], options);
  assert.equal(empty.attendanceRate, null); assert.equal(empty.status, 'No records'); assert.equal(empty.warnings.length, 0);
});
test('planned work does not count as completed and hours without session records stay unknown', () => {
  const db = fixture({ batches: [{ id: 'b', trainerEmployeeId: 'e' }], exposureVisits: [{ id: 'v', projectId: 'p1', batchId: 'b', visitDate: '2026-05-10', status: 'APPROVED' }] });
  const report = buildEmployeeMonthReport(db, employee, '2026-05', ['p1'], { ...options, targets: [{ empId: 'e', projectId: 'p1', month: '2026-05', t1Label: 'Training Hours', t1: 100, t2Label: 'Exposure Visits', t2: 2 }] });
  assert.equal(report.metrics['Training Hours'], null); assert.equal(report.metrics['Exposure Visits'], 0);
  assert.equal(report.events.length, 1); assert.equal(report.completedWork, 0);
  assert.equal(report.targets[0].achievement, null); assert.equal(report.targets[1].achievement, 0);
});
test('monthly target achievements use the target project rather than combining other project outcomes', () => {
  const db = fixture({ candidates: [{ id: 'c1', mobilizerEmployeeId: 'e' }, { id: 'c2', mobilizerEmployeeId: 'e' }], enrollments: [{ id: 'r1', candidateId: 'c1', projectId: 'p1', enrolledOn: '2026-05-01', status: 'IN_TRAINING' }, { id: 'r2', candidateId: 'c2', projectId: 'p2', enrolledOn: '2026-05-02', status: 'IN_TRAINING' }] });
  const targets = [{ empId: 'e', projectId: 'p1', month: '2026-05', t1Label: 'Enrolled', t1: 2, t2Label: 'Community Drives', t2: 0 }, { empId: 'e', projectId: 'p2', month: '2026-05', t1Label: 'Enrolled', t1: 1, t2Label: 'Community Drives', t2: 0 }];
  const report = buildEmployeeMonthReport(db, employee, '2026-05', ['p1', 'p2'], { ...options, targets });
  assert.equal(report.metrics.Enrolled, 2);
  assert.equal(report.targets.find((target) => target.projectId === 'p1' && target.label === 'Enrolled').achievement, 50);
  const scoped = buildEmployeeMonthReport(db, employee, '2026-05', ['p1'], { ...options, targets });
  assert.equal(scoped.targets.length, 2); assert.equal(scoped.events.length, 1);
});
test('placement outcomes require completed attributed drives and unique confirmed placed candidates', () => {
  const db = fixture({ candidates: [{ id: 'placed', status: 'PLACED' }, { id: 'pending', status: 'IN_TRAINING' }], placementDrives: [{ id: 'one', projectId: 'p1', placementOfficerEmployeeId: 'e', scheduledOn: '2026-05-20', status: 'COMPLETED', candidateIds: ['placed', 'pending'] }, { id: 'two', projectId: 'p1', placementOfficerEmployeeId: 'e', scheduledOn: '2026-05-22', status: 'COMPLETED', candidateIds: ['placed'] }, { id: 'planned', projectId: 'p1', placementOfficerEmployeeId: 'e', scheduledOn: '2026-05-25', status: 'SCHEDULED', candidateIds: ['pending'] }] });
  const report = buildEmployeeMonthReport(db, employee, '2026-05', ['p1'], options);
  assert.equal(report.metrics['Placed Candidates'], 1); assert.equal(report.metrics['Placement Drives Conducted'], 2);
});
test('approved leave crossing month boundary counts only the selected month and calendar months shift correctly', () => {
  const db = fixture({ leaveRequests: [{ id: 'leave', employeeId: 'e', fromDate: '2026-04-29', toDate: '2026-05-02', status: 'APPROVED' }] });
  assert.equal(buildEmployeeMonthReport(db, employee, '2026-05', ['p1'], options).leaveDays, 2);
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.throws(() => buildEmployeeMonthReport(db, employee, 'invalid', ['p1']), /valid report month/);
  assert.ok(employeeDataMonths(db, employee, ['p1']).includes('2026-05'));
});

test('center incharge reports recognize recorded center attendance even without a personal attendance mark', () => {
  const incharge = { ...employee, roleIds: ['cin'], centerIds: ['center'] };
  const db = fixture({ roles: [{ id: 'cin', code: 'CENTER_INCHARGE' }], attendance: [{ id: 'candidate-mark', subjectType: 'CANDIDATE', subjectId: 'candidate', projectId: 'p1', centerId: 'center', date: '2026-05-01', status: 'PRESENT' }] });
  const report = buildEmployeeMonthReport(db, incharge, '2026-05', ['p1'], options);
  assert.equal(report.metrics['Center Attendance (%)'], 100);
  assert.equal(report.noData, false);
  assert.ok(employeeDataMonths(db, incharge, ['p1']).includes('2026-05'));
});
