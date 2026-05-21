import React, { useEffect, useMemo } from "react";
import Section1 from "../../components/Admin/Dashboard/Section1";
import Section2 from "../../components/Admin/Dashboard/Section2";
import Section3 from "../../components/Admin/Dashboard/Section3";
import { useEmployeeStore } from "../../stores/employeeStore";
import { useProjectStore } from "../../stores/projectStore";
import { selectAdminDashboardData } from "../../stores/selectors/projectSelectors";

const AdminDashboard = () => {
  const projectRecords = useProjectStore((state) => state.records);
  const fetchProjects = useProjectStore((state) => state.fetchAll);
  const employeeRecords = useEmployeeStore((state) => state.records);
  const fetchEmployees = useEmployeeStore((state) => state.fetchAll);
  const dashboardData = useMemo(
    () => selectAdminDashboardData(projectRecords, employeeRecords),
    [employeeRecords, projectRecords]
  );

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, [fetchEmployees, fetchProjects]);

  return (
    <div className="w-full min-w-0 max-w-full bg-transparent space-y-0">
      <Section1
        totalData={dashboardData.totalData}
        lastMonthData={dashboardData.lastMonthData}
        projectCards={dashboardData.projectCards}
      />
      <Section2 roleData={dashboardData.roleData} recentActivity={dashboardData.recentActivity} />
      <Section3 projects={dashboardData.projects} />
    </div>
  );
};

export default AdminDashboard;
