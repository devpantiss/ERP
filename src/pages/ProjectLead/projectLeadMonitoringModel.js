// Aggregate existing browser records without copying or changing the lead's data.
export function readProjectLeadMonitoring({ storage, projects, centers, leads }) {
  const records = [], teams = [], errors = [];
  const projectIds = new Set(projects.map((project) => project.id));
  const centerMap = new Map(centers.filter((center) => projectIds.has(center.projectId)).map((center) => [center.id, center]));
  try {
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      const operation = /^pantiss:project-lead:([^:]+):(visits|reports|audits)$/.exec(key || "");
      const team = /^pantiss:team-setup:([^:]+):([^:]+)$/.exec(key || "");
      if (!operation && !team) continue;
      const ownerId = (operation || team)[1];
      const lead = leads.find((person) => person.userId === ownerId);
      if (!lead) continue;
      let value;
      try { value = JSON.parse(storage.getItem(key)); } catch { errors.push(key); continue; }
      if (operation) {
        if (!Array.isArray(value)) { errors.push(key); continue; }
        value.forEach((record) => {
          if (!record || typeof record !== 'object' || !record.id) return;
          const center = centerMap.get(record.centerId);
          if (!center || !lead.projectIds.includes(center.projectId) || (record.projectId && record.projectId !== center.projectId)) return;
          records.push({ ...record, kind: operation[2], projectId: center.projectId, ownerId, employeeId: lead.employeeId, monitoringId: `${key}:${record.id}` });
        });
      } else {
        const center = centerMap.get(team[2]);
        if (!center || !lead.projectIds.includes(center.projectId)) continue;
        const setup = value?.team || value;
        if (!setup || typeof setup !== 'object' || ['incharge','trainers','mobilizers','placement'].some((lane) => !Array.isArray(setup[lane]))) { errors.push(key); continue; }
        teams.push({ id:key, kind:'teams', centerId:center.id, projectId:center.projectId, ownerId, employeeId:lead.employeeId, setup, updatedAt:value.updatedAt || null });
      }
    }
  } catch { errors.push('storage-unavailable'); }
  records.sort((a,b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
  return { records, teams, errors };
}
