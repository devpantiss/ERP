import { Link, useLocation } from "react-router-dom";
import "./employeePerformance.css";

export default function EmployeeReportLink({ employeeId, children, projectId, month, className = "" }) {
  const location = useLocation();
  if (!["/super-admin/", "/project-head/", "/admin/"].some((prefix) => location.pathname.startsWith(prefix))) return <span className={className}>{children}</span>;
  const base = location.pathname.startsWith("/super-admin") ? "/super-admin" : "/project-head";
  const query = new URLSearchParams();
  if (projectId) query.set("projectId", projectId);
  if (month) query.set("month", month);
  const suffix = query.size ? `?${query}` : "";
  return <Link to={`${base}/employees/${encodeURIComponent(employeeId)}/performance${suffix}`} state={{ from: location.pathname + location.search }} className={`employee-report-link ${className}`} aria-label={`View monthly performance report for ${typeof children === "string" ? children : "employee"}`}>{children}</Link>;
}
