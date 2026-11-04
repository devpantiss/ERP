import EmployeeLeaderboard from "../../features/leaderboard/EmployeeLeaderboard";
import OperationalAlerts from "../../components/monitoring/OperationalAlerts";
import { useEffect, useMemo, useState } from "react";
import Section1 from "../../components/Admin/Dashboard/Section1";
import Section2 from "../../components/Admin/Dashboard/Section2";
import Section3 from "../../components/Admin/Dashboard/Section3";
import { useEmployeeStore } from "../../stores/employeeStore";
import { useProjectStore } from "../../stores/projectStore";
import { selectAdminDashboardData } from "../../stores/selectors/projectSelectors";

import { useAuthStore } from "../../stores/authStore";
import { mockDb } from "../../mock-db";

const AdminDashboard = ({ level = "project" }) => {
  const isCenter = level === "center";
  const [alertProjectId, setAlertProjectId] = useState("");
  const session = useAuthStore((state) => state.currentUser);
  const currentUser = session || mockDb.users.byId[isCenter ? "USR-0007" : "USR-0002"];
  const projectRecords = useProjectStore((state) => state.records);
  const fetchProjects = useProjectStore((state) => state.fetchAll);
  const employeeRecords = useEmployeeStore((state) => state.records);
  const fetchEmployees = useEmployeeStore((state) => state.fetchAll);
  const dashboardData = useMemo(
    () => selectAdminDashboardData(projectRecords, employeeRecords, currentUser),
    [employeeRecords, projectRecords, currentUser]
  );

  const alertProject = dashboardData.projects.find((project) => project.id === alertProjectId) || dashboardData.projects[0];

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, [fetchEmployees, fetchProjects]);

  return (
    <div className="w-full min-w-0 max-w-full bg-transparent space-y-0">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{isCenter ? "Center Incharge Dashboard" : "Project Head Dashboard"}</h1>
        <p className="mt-2 text-sm text-slate-400">{isCenter ? "Monitor your center’s team, admissions, training and delivery progress." : "Monitor your assigned projects, center teams, admissions and delivery progress."}</p>
      </header>
      {isCenter && <OperationalAlerts level="center" compact />}
      <Section1
        heading={isCenter ? "Center Overview" : "Project Overview"}
        totalData={dashboardData.totalData}
        lastMonthData={dashboardData.lastMonthData}
        projectCards={dashboardData.projectCards}
      />
      {!isCenter && alertProject && <div className="my-6 space-y-4">
        {dashboardData.projects.length > 1 && <div className="lead-workspace"><label>Monitoring project <select aria-label="Monitoring project" value={alertProject.id} onChange={(event) => setAlertProjectId(event.target.value)}>{dashboardData.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label></div>}
        <OperationalAlerts level="project" dashboard projectId={alertProject.id} />
        <EmployeeLeaderboard level="project" projectId={alertProject.id} />
      </div>}
      <Section2 roleData={dashboardData.roleData} recentActivity={dashboardData.recentActivity} />
      <Section3 projects={dashboardData.projects} heading={isCenter ? "Center Status Overview" : "Project Status Overview"} />
    </div>
  );
};

export default AdminDashboard;
