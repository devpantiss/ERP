import { useAuthStore } from "../../stores/authStore";
import { mockDb } from "../../mock-db";
import { applyRoleScope } from "../../services/mockApiClient";

export function useProjectLeadScope() {
  const session = useAuthStore((state) => state.currentUser);
  const user = session || mockDb.users.byId["USR-0002"];
  const projects = applyRoleScope("projects", Object.values(mockDb.projects.byId), user);
  const centers = applyRoleScope("centers", Object.values(mockDb.centers.byId), user);
  const employees = applyRoleScope("employees", Object.values(mockDb.employees.byId), user);
  return { user, projects, centers, employees };
}
