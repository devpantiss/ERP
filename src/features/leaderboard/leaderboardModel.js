import { buildEmployeeMonthReport, validMonth } from "../employee-performance/employeeReportModel.js";

export const LEADERBOARD_ROLES = [
  { code: "CENTER_INCHARGE", label: "Center Incharge" },
  { code: "MOBILIZER", label: "Mobilizer" },
  { code: "TRAINER", label: "Trainer" },
  { code: "PLACEMENT_OFFICER", label: "Placement Officer" },
];
const values = (db, table) => Object.values(db[table]?.byId || {});
function centerData(db, centerId) {
  if (!centerId) return db;
  const view = { ...db };
  for (const name of ["attendance", "enrollments", "batches", "tourRequests", "exposureVisits", "placementDrives", "trainingSessions"]) {
    if (!db[name]) continue;
    view[name] = { ...db[name], byId: Object.fromEntries(values(db, name).filter((record) => (record.centerId || db.batches?.byId[record.batchId]?.centerId) === centerId).map((record) => [record.id, record])) };
  }
  return view;
}
export function buildLeaderboard({ db, employees, projectIds, targets = [], invoices = {}, month = "", role = "", centerId = "", today }) {
  const currentMonth = today.slice(0, 7);
  const view = centerData(db, centerId);
  const rows = [];
  for (const employee of employees) {
    if (["INACTIVE", "EXITED"].includes(employee.status)) continue;
    const roleCode = (employee.roleIds || []).map((id) => db.roles.byId[id]?.code).find((code) => LEADERBOARD_ROLES.some((item) => item.code === code));
    if (!roleCode || (role && role !== roleCode)) continue;
    const assignedProjects = (employee.projectIds || []).filter((id) => projectIds.includes(id));
    if (!assignedProjects.length || (centerId && !employee.centerIds?.includes(centerId))) continue;
    const assignedCenters = (employee.centerIds || []).filter((id) => assignedProjects.includes(db.centers?.byId[id]?.projectId));
    const employeeTargets = targets.filter((target) => target.empId === employee.id && validMonth(target.month) && target.month <= currentMonth && (!month || target.month === month) && (target.projectId ? assignedProjects.includes(target.projectId) : employee.projectIds.length === 1) && (!centerId || target.centerId === centerId || (!target.centerId && assignedCenters.length === 1 && assignedCenters[0] === centerId)));
    const months = [...new Set(employeeTargets.map((target) => target.month))];
    const reports = months.map((period) => buildEmployeeMonthReport(view, employee, period, assignedProjects, { targets: employeeTargets, invoices, today }));
    const assigned = reports.flatMap((report) => report.targets).filter((target) => target.target > 0);
    const measured = assigned.filter((target) => target.achievement !== null);
    const complete = assigned.length > 0 && assigned.length === measured.length;
    const score = complete ? Number((measured.reduce((sum, target) => sum + Math.min(target.achievement, 100), 0) / measured.length).toFixed(1)) : null;
    const markedDays = [...new Map(values(view, "attendance").filter((record) => record.subjectType === "EMPLOYEE" && record.subjectId === employee.id && assignedProjects.includes(record.projectId) && record.date <= today && (!month || record.date.startsWith(month)) && ["PRESENT", "LATE", "ABSENT"].includes(record.status)).map((record) => [record.date, record])).values()];
    const attendance = markedDays.length ? Number((markedDays.filter((record) => record.status !== "ABSENT").length / markedDays.length * 100).toFixed(1)) : null;
    rows.push({ id: employee.id, name: `${employee.firstName} ${employee.lastName}`, roleCode, role: LEADERBOARD_ROLES.find((item) => item.code === roleCode).label, centerIds: assignedCenters, projectIds: assignedProjects, score, attendance, recordedDays: markedDays.length, measuredTargets: measured.length, assignedTargets: assigned.length, reason: complete ? "Measured targets" : assigned.length ? "Incomplete target measurements" : centerId && assignedCenters.length > 1 ? "Center targets not allocated" : "No monthly targets", rank: null });
  }
  const scoreGroups = new Map();
  for (const row of rows.filter((item) => item.score !== null)) scoreGroups.set(row.score, [...(scoreGroups.get(row.score) || []), row]);
  const comparableAttendance = new Set([...scoreGroups].filter(([, group]) => group.every((row) => row.recordedDays >= 3 && row.attendance !== null)).map(([score]) => score));
  const tieAttendance = (row) => comparableAttendance.has(row.score) ? row.attendance : -1;
  rows.sort((left, right) => {
    if (left.score === null && right.score === null) return left.name.localeCompare(right.name);
    if (left.score === null) return 1;
    if (right.score === null) return -1;
    return right.score - left.score || tieAttendance(right) - tieAttendance(left) || left.name.localeCompare(right.name);
  });
  let previous = null;
  rows.forEach((row, index) => {
    if (row.score === null) return;
    row.rank = previous && previous.score === row.score && tieAttendance(previous) === tieAttendance(row) ? previous.rank : index + 1;
    previous = row;
  });
  return rows;
}
