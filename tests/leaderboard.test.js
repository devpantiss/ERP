import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLeaderboard } from '../src/features/leaderboard/leaderboardModel.js';
const table = (rows) => ({ byId: Object.fromEntries(rows.map((row) => [row.id, row])) });
const roles = [{ id: 'mob', code: 'MOBILIZER' }, { id: 'plc', code: 'PLACEMENT_OFFICER' }, { id: 'trn', code: 'TRAINER' }, { id: 'cin', code: 'CENTER_INCHARGE' }, { id: 'head', code: 'PROJECT_HEAD' }];
const employees = [
  { id: 'm', firstName: 'Mobilizer', lastName: 'One', roleIds: ['mob'], projectIds: ['p1'], centerIds: ['c1'], status: 'ACTIVE' },
  { id: 'p', firstName: 'Placement', lastName: 'One', roleIds: ['plc'], projectIds: ['p1'], centerIds: ['c1'], status: 'ACTIVE' },
  { id: 't', firstName: 'Trainer', lastName: 'One', roleIds: ['trn'], projectIds: ['p2'], centerIds: ['c2'], status: 'ACTIVE' },
  { id: 'c', firstName: 'Center', lastName: 'One', roleIds: ['cin'], projectIds: ['p1'], centerIds: ['c1'], status: 'ACTIVE' },
  { id: 'h', firstName: 'Head', lastName: 'One', roleIds: ['head'], projectIds: ['p1'], centerIds: ['c1'], status: 'ACTIVE' },
];
const db = {
  roles: table(roles), centers: table([{ id: 'c1', projectId: 'p1' }, { id: 'c2', projectId: 'p2' }]),
  candidates: table([{ id: 'a', mobilizerEmployeeId: 'm' }, { id: 'b', mobilizerEmployeeId: 'm' }]),
  enrollments: table([{ id: 'e1', projectId: 'p1', centerId: 'c1', candidateId: 'a', enrolledOn: '2026-05-01' }, { id: 'e2', projectId: 'p1', centerId: 'c1', candidateId: 'b', enrolledOn: '2026-05-02' }]),
  attendance: table([{ id: 'a1', subjectType: 'CANDIDATE', subjectId: 'a', projectId: 'p1', centerId: 'c1', date: '2026-05-03', status: 'PRESENT' }]),
};
const target = (empId, projectId, label, amount) => ({ empId, projectId, month: '2026-05', t1Label: label, t1: amount, t2Label: 'Unused', t2: 0 });
const targets = [target('m','p1','Enrolled',2), target('p','p1','Placed Candidates',1), target('t','p2','Training Hours',20), target('c','p1','Center Attendance (%)',90)];
const base = { db, employees, targets, projectIds: ['p1','p2'], today: '2026-11-04' };

test('cumulative ranking normalizes target completion, shares ties and leaves unknown measurements unranked', () => {
  const rows = buildLeaderboard(base);
  assert.equal(rows.length, 4); // Project Heads are not a delivery segment.
  assert.equal(rows.find((row) => row.id === 'm').score, 100);
  assert.equal(rows.find((row) => row.id === 'c').score, 100);
  assert.equal(rows.find((row) => row.id === 'm').rank, 1);
  assert.equal(rows.find((row) => row.id === 'c').rank, 1);
  assert.equal(rows.find((row) => row.id === 'p').rank, 3);
  assert.equal(rows.find((row) => row.id === 't').rank, null);
  assert.equal(rows.find((row) => row.id === 't').reason, 'Incomplete target measurements');
});
test('rank restarts within role/center segments and excludes other project assignments', () => {
  const scoped = buildLeaderboard({ ...base, projectIds: ['p1'], role: 'PLACEMENT_OFFICER' });
  assert.deepEqual(scoped.map((row) => row.id), ['p']); assert.equal(scoped[0].rank, 1);
  const centered = buildLeaderboard({ ...base, projectIds: ['p1'], centerId: 'c1' });
  assert.equal(centered.length, 3); assert.ok(centered.every((row) => row.projectIds.includes('p1')));
  assert.deepEqual(buildLeaderboard({ ...base, projectIds: [] }), []);
});
test('unallocated multi-center project targets do not become center performance by assumption', () => {
  const multiCenterDb = { ...db, centers: table([{ id: 'c1', projectId: 'p1' }, { id: 'c2', projectId: 'p1' }]) };
  const multi = { ...employees[0], centerIds: ['c1','c2'] };
  const rows = buildLeaderboard({ ...base, db: multiCenterDb, employees: [multi], centerId: 'c1' });
  assert.equal(rows[0].rank, null); assert.equal(rows[0].reason, 'Center targets not allocated');
});
test('monthly period filters do not reuse a different month\'s measured target', () => {
  const rows = buildLeaderboard({ ...base, month: '2026-06' });
  assert.ok(rows.every((row) => row.rank === null));
});

test('missing attendance does not decide a target-score tie; complete attendance can break it', () => {
  const marked = (employeeId, prefix, statuses) => statuses.map((status, index) => ({ id: `${prefix}${index}`, subjectType: 'EMPLOYEE', subjectId: employeeId, projectId: 'p1', centerId: 'c1', date: `2026-05-0${index + 1}`, status }));
  const known = marked('m', 'm', ['PRESENT','PRESENT','PRESENT']);
  const partial = buildLeaderboard({ ...base, db: { ...db, attendance: table([...Object.values(db.attendance.byId), ...known]) } });
  assert.equal(partial.find((row) => row.id === 'm').rank, partial.find((row) => row.id === 'c').rank);
  const complete = buildLeaderboard({ ...base, db: { ...db, attendance: table([...Object.values(db.attendance.byId), ...known, ...marked('c', 'c', ['PRESENT','PRESENT','ABSENT'])]) } });
  assert.equal(complete.find((row) => row.id === 'm').rank, 1);
  assert.equal(complete.find((row) => row.id === 'c').rank, 2);
});
