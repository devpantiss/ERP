import { mockDb } from "../../mock-db";
import { applyRoleScope } from "../../services/mockApiClient";

export function scopedEmployeeRecords(records, user) {
  const projectIds = new Set(applyRoleScope("projects", Object.values(mockDb.projects.byId), user).map((project) => project.id));
  return applyRoleScope("employees", records, user).map((employee) => ({
    ...employee,
    projectIds: (employee.projectIds || []).filter((id) => projectIds.has(id)),
    centerIds: (employee.centerIds || []).filter((id) => projectIds.has(mockDb.centers.byId[id]?.projectId)),
  }));
}
