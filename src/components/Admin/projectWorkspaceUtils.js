export function buildProjectSummaries(records, projectKey = "project") {
  return Array.from(
    records.reduce((projects, record) => {
      const projectName = record[projectKey] || "Unassigned Project";
      const current = projects.get(projectName) || {
        id: projectName,
        name: projectName,
        employeeCount: 0,
      };
      projects.set(projectName, {
        ...current,
        employeeCount: current.employeeCount + 1,
      });
      return projects;
    }, new Map()).values()
  );
}
