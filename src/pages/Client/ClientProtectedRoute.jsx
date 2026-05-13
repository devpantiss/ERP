import { Navigate, Outlet } from "react-router-dom";

export default function ClientProtectedRoute() {
  let hasSession = false;

  try {
    const session = JSON.parse(localStorage.getItem("clientSession") || "null");
    hasSession = Boolean(session?.id && session?.email);
  } catch {
    hasSession = false;
  }

  return hasSession ? <Outlet /> : <Navigate to="/client-login" replace />;
}
