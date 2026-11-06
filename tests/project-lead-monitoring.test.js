import test from 'node:test';
import assert from 'node:assert/strict';
import { readProjectLeadMonitoring } from '../src/pages/ProjectLead/projectLeadMonitoringModel.js';
const setup = { incharge:['e1'],trainers:[],mobilizers:[],placement:[] };
const storage = (entries) => ({length:entries.length,key:(index) => entries[index][0],getItem:(key) => entries.find(([id]) => id === key)?.[1]});
const base = {projects:[{id:'p'}],centers:[{id:'c',projectId:'p'}],leads:[{userId:'u',employeeId:'lead',projectIds:['p']}]};
test('monitor aggregates saved work by its owner and excludes other projects and inconsistent records', () => {
 const result = readProjectLeadMonitoring({...base,storage:storage([
  ['pantiss:project-lead:u:visits',JSON.stringify([{id:'v',centerId:'c',title:'Visit'},{id:'other',centerId:'outside'},{id:'wrong',centerId:'c',projectId:'outside'}])],
  ['pantiss:project-lead:unassigned:reports',JSON.stringify([{id:'r',centerId:'c'}])],
  ['pantiss:project-lead:u:reports',JSON.stringify([{id:'r',centerId:'c',attachment:{name:'report.pdf',url:'data:application/pdf;base64,eA=='}}])],
  ['pantiss:team-setup:u:c',JSON.stringify({team:setup,updatedAt:'2026-11-06T10:00:00Z'})],
 ])});
 assert.equal(result.records.length,2); assert.equal(result.teams.length,1);
 assert.ok(result.records.every((row) => row.employeeId === 'lead' && row.projectId === 'p'));
 assert.equal(result.records.find((row) => row.kind === 'reports').attachment.name,'report.pdf');
 assert.equal(result.teams[0].updatedAt,'2026-11-06T10:00:00Z');
});
test('legacy team plans remain visible and corrupt records do not hide healthy records', () => {
 const result = readProjectLeadMonitoring({...base,storage:storage([
  ['pantiss:team-setup:u:c',JSON.stringify(setup)],
  ['pantiss:project-lead:u:audits','bad-json'],
  ['pantiss:project-lead:u:visits',JSON.stringify([{id:'v',centerId:'c'}])],
 ])});
 assert.equal(result.teams.length,1); assert.equal(result.teams[0].updatedAt,null);
 assert.equal(result.records.length,1); assert.equal(result.errors.length,1);
 assert.equal(readProjectLeadMonitoring({...base,projects:[],storage:storage([['pantiss:team-setup:u:c',JSON.stringify(setup)]])}).teams.length,0);
});
