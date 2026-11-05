import test from 'node:test';
import assert from 'node:assert/strict';
import { activeSession, buildOperationalAlerts, readLiveSessions, registerLiveSession, removeLiveSession, SESSION_TTL } from '../src/components/monitoring/monitoringData.js';
const storage = () => { const data = new Map(); return { getItem: (key) => data.get(key) || null, setItem: (key, value) => data.set(key, value) }; };
const base = { projects: [], batches: [], employees: [], attendance: [], today: '2026-11-03' };

test('only unresolved delays are flagged; future, due-today, completed and normal work are excluded', () => {
  const alerts = buildOperationalAlerts({ ...base,
    projects: [{ id: 'p', name: 'Project', endDate: '2026-11-17', status: 'ACTIVE' }, { id: 'done', endDate: '2026-11-01', status: 'COMPLETED' }],
    batches: [{ id: 'b', code: 'Batch', centerId: 'c', projectId: 'p', endDate: '2026-11-01', status: 'ACTIVE' }, { id: 'future', endDate: '2026-12-01' }],
    records: [{ id: 'today', kind: 'audits', title: 'QC', dueDate: '2026-11-03', status: 'Open' }, { id: 'late', kind: 'audits', title: 'Unresolved QC', dueDate: '2026-11-02', status: 'Action Required' }, { id: 'closed', kind: 'audits', dueDate: '2026-11-01', status: 'Closed' }, { id: 'visit', kind: 'visits', title: 'Client', date: '2026-11-04', status: 'Scheduled' }, { id: 'missed', kind: 'visits', title: 'Missed visit', date: '2026-11-01', status: 'Scheduled' }, { id: 'completed', kind: 'visits', date: '2026-11-01', status: 'Completed' }],
  });
  assert.deepEqual(alerts.map((a) => a.id), ['batch-b', 'visit-missed', 'audit-late']);
  assert.ok(alerts.every((alert) => alert.category === 'Delay' && alert.severity === 'Overdue'));
  assert.match(alerts[0].detail, /2 days behind schedule/);
  assert.equal(alerts[0].projectId, 'p');
});
test('employee alerts require measured recent underperformance, not missing or stale data', () => {
  const employee = { id: 'e', firstName: 'Test', lastName: 'Staff', centerIds: ['c'] };
  assert.equal(buildOperationalAlerts({ ...base, employees: [employee] }).length, 0);
  const attendance = ['2026-10-28', '2026-10-29', '2026-10-30'].map((date, i) => ({ subjectType: 'EMPLOYEE', subjectId: 'e', date, status: i ? 'ABSENT' : 'PRESENT' }));
  const alerts = buildOperationalAlerts({ ...base, employees: [employee], attendance });
  assert.equal(alerts.length, 1); assert.match(alerts[0].detail, /33.3%/);
  assert.equal(buildOperationalAlerts({ ...base, employees: [employee], attendance: attendance.map((row) => ({ ...row, date: "2026-11-02" })) }).length, 0);
  assert.match(alerts[0].detail, /weekly 70%/);
  assert.equal(buildOperationalAlerts({ ...base, employees: [{ ...employee, performanceReview: { score: 45, date: '2026-10-20' } }] }).length, 1);
  assert.equal(buildOperationalAlerts({ ...base, employees: [{ ...employee, performanceReview: { score: 45, date: '2026-01-01' } }] }).length, 0);
});
test('live registrations expire and an older broadcaster cannot remove a newer session', () => {
  const db = storage(); registerLiveSession('b', 'one', db, 1000);
  assert.equal(activeSession(readLiveSessions(db).b, 1001), true);
  assert.equal(activeSession(readLiveSessions(db).b, 1000 + SESSION_TTL), false);
  registerLiveSession('b', 'two', db, 2000); removeLiveSession('b', 'one', db);
  assert.equal(readLiveSessions(db).b.sessionId, 'two');
  removeLiveSession('b', 'two', db); assert.equal(readLiveSessions(db).b, undefined);
});
