import { useAuthStore } from "../../stores/authStore";
import { mockDb } from "../../mock-db";

export function useCenterIncharge() {
  const session = useAuthStore((state) => state.currentUser);
  const user = session?.roleIds?.includes("ROL-0008") ? session : mockDb.users.byId["USR-0007"];
  return mockDb.employees.byId[user.employeeId];
}
