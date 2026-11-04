import test from 'node:test';
import assert from 'node:assert/strict';
import { mockDb, canAccess } from '../src/mock-db/index.js';
import { applyRoleScope } from '../src/services/mockApiClient.js';
const rows = (entity) => Object.values(mockDb[entity].byId);

test('Center Incharge cannot see sibling centers even within their project', () => {
  const user = mockDb.users.byId['USR-0007'];
  assert.deepEqual(applyRoleScope('centers', rows('centers'), user).map(c => c.id), ['CTR-0001']);
  assert.equal(applyRoleScope('attendance', [{ projectId: 'PRJ-0001', centerId: 'CTR-OTHER' }], user).length, 0);
  assert.equal(applyRoleScope('invoices', [{ projectId: 'PRJ-0001' }], user).length, 0);
  assert.equal(canAccess('CENTER_INCHARGE', 'invoices', 'approve'), false);
  assert.deepEqual(applyRoleScope('candidates', rows('candidates'), user).map(c => c.id), ['CND-0001', 'CND-0002']);
});
test('Project Head sees all centers of assigned projects', () => {
  const user = mockDb.users.byId['USR-0002'];
  assert.deepEqual(applyRoleScope('centers', [...rows('centers'), { id: 'CTR-OTHER', projectId: 'PRJ-0001' }], user).map(c => c.id), ['CTR-0001', 'CTR-OTHER']);
  assert.equal(canAccess('PROJECT_HEAD', 'invoices', 'approve'), true);
});
test('Vertical Head sees only projects within the assigned vertical', () => {
  assert.deepEqual(applyRoleScope('projects', rows('projects'), mockDb.users.byId['USR-0001']).map(p => p.id), ['PRJ-0001', 'PRJ-0002']);
});
test('Center teams report to Center Incharge, who reports to Project Head', () => {
  for (const employee of rows('employees').filter(e => e.roleIds.some(r => ['ROL-0003', 'ROL-0004', 'ROL-0005'].includes(r)))) {
    const incharge = mockDb.employees.byId[employee.managerEmployeeId];
    assert.ok(incharge.roleIds.includes('ROL-0008'));
    assert.ok(mockDb.employees.byId[incharge.managerEmployeeId].roleIds.includes('ROL-0002'));
  }
});

test('Center Incharge can submit operational records but cannot approve any resource', () => {
  for (const resource of ['invoices', 'procurements', 'testimonials', 'leaveRequests', 'reimbursements']) {
    assert.equal(canAccess('CENTER_INCHARGE', resource, 'create'), true);
    assert.equal(canAccess('CENTER_INCHARGE', resource, 'approve'), false);
  }
  assert.equal(mockDb.roles.byId['ROL-0008'].permissionIds.includes('PER-0005'), false);
});
