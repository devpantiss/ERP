import { PROJECT_REPORTS } from "../Admin/adminPortalData";

export const CLIENT_ACCOUNTS = [
  {
    id: "nsdc",
    name: "NSDC",
    email: "client@nsdc.in",
    password: "client123",
    contact: "Ananya Sharma",
    designation: "Program Director",
  },
  {
    id: "tata-steel-foundation",
    name: "Tata Steel Foundation",
    email: "client@tatasteel.org",
    password: "client123",
    contact: "Rohit Verma",
    designation: "CSR Portfolio Lead",
  },
  {
    id: "mord",
    name: "MoRD",
    email: "client@mord.gov.in",
    password: "client123",
    contact: "Meera Iyer",
    designation: "DDU-GKY Reviewer",
  },
];

const parsePercent = (value) => Number(String(value).replace(/[^0-9.]/g, "")) || 0;

const average = (values) => {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const parseBatchEntry = (entry, index) => {
  const [label, sizeText] = entry.split(" - ");
  return {
    id: `batch-${index + 1}`,
    label: label || entry,
    size: Number(sizeText) || 35,
  };
};

const firstNames = [
  "Aarav",
  "Ananya",
  "Rohit",
  "Sneha",
  "Sourav",
  "Pooja",
  "Aman",
  "Nikita",
  "Vikash",
  "Priya",
  "Sasmita",
  "Ayush",
];

const lastNames = [
  "Sahu",
  "Das",
  "Nayak",
  "Patra",
  "Mohanty",
  "Behera",
  "Rout",
  "Mishra",
  "Sethy",
  "Naik",
  "Pradhan",
  "Pattnaik",
];

const companies = [
  "Tata Steel",
  "Jindal Steel & Power",
  "L&T Construction",
  "Tech Mahindra",
  "Vedanta Resources",
  "NALCO",
  "Hindalco Industries",
];

const designations = [
  "Junior Technician",
  "Trainee Electrician",
  "Welding Operator",
  "Sales Associate",
  "Data Entry Operator",
  "Hospitality Attendant",
  "Fitter Trainee",
];

const odishaDistrictPool = ["Angul", "Bolangir", "Jharsuguda", "Khurda", "Cuttack", "Sundargarh"];
const outsideStatePool = ["Telangana", "Karnataka", "Maharashtra", "Gujarat", "Tamil Nadu"];

export const getClientProjects = (clientName) =>
  PROJECT_REPORTS.filter((project) => project.fundingAgency === clientName);

export const getProjectSummary = (project) => {
  const centers = project.centers || [];
  const candidates = centers.reduce((sum, center) => sum + center.candidates, 0);
  const employees = centers.reduce((sum, center) => sum + center.employees, 0);
  const grievances = centers.reduce((sum, center) => sum + center.grievances, 0);
  const placementRate = average(centers.map((center) => center.placementRate));
  const attendanceRate = average(centers.map((center) => center.attendanceRate));
  const enrollmentRate = average(
    centers.flatMap((center) =>
      center.performanceMetrics
        .filter((metric) => metric.label.includes("Enrollment"))
        .map((metric) => parsePercent(metric.value))
    )
  );

  return {
    centers: centers.length,
    candidates,
    employees,
    grievances,
    placementRate,
    attendanceRate,
    enrollmentRate,
    health: average([placementRate, attendanceRate, enrollmentRate]),
  };
};

export const getClientSummary = (projects) => {
  const projectSummaries = projects.map(getProjectSummary);

  return {
    projects: projects.length,
    centers: projectSummaries.reduce((sum, project) => sum + project.centers, 0),
    candidates: projectSummaries.reduce((sum, project) => sum + project.candidates, 0),
    employees: projectSummaries.reduce((sum, project) => sum + project.employees, 0),
    grievances: projectSummaries.reduce((sum, project) => sum + project.grievances, 0),
    placementRate: average(projectSummaries.map((project) => project.placementRate)),
    attendanceRate: average(projectSummaries.map((project) => project.attendanceRate)),
    health: average(projectSummaries.map((project) => project.health)),
  };
};

const clampPercent = (actual, target) => {
  if (!target) return 0;
  return Math.min(100, Math.round((actual / target) * 100));
};

export const buildClientProjectSnapshot = (project) => {
  const centers = project.centers.map((center, centerIndex) => {
    const batches = center.candidateList.map((entry, batchIndex) => {
      const parsed = parseBatchEntry(entry, batchIndex);
      const completedTraining = Math.round(parsed.size * (0.58 + ((centerIndex + batchIndex) % 4) * 0.08));
      const certified = Math.round(completedTraining * (center.attendanceRate / 100));
      const placed = Math.round(parsed.size * (center.placementRate / 100) * (0.72 + (batchIndex % 3) * 0.08));
      const mapped = Math.min(parsed.size, Math.round(placed * 1.22));

      const candidateRecords = Array.from({ length: Math.min(parsed.size, 18) }, (_, learnerIndex) => {
        const seed = centerIndex * 19 + batchIndex * 11 + learnerIndex;
        const isMapped = learnerIndex < mapped;
        const isPlaced = learnerIndex < placed;

        return {
          id: `${center.id}-${parsed.id}-${learnerIndex + 1}`,
          name: `${firstNames[seed % firstNames.length]} ${lastNames[(seed + 3) % lastNames.length]}`,
          code: `${center.location.slice(0, 3).toUpperCase()}-${batchIndex + 1}${String(learnerIndex + 1).padStart(3, "0")}`,
          batch: parsed.label,
          jobRole: center.jobRoles[seed % center.jobRoles.length],
          trainingStatus:
            learnerIndex < certified
              ? "Certified"
              : learnerIndex < completedTraining
                ? "Assessment Due"
                : "In Progress",
          placementStatus: isPlaced
            ? "Placed"
            : isMapped
              ? "Employer Mapped"
              : "Training",
          attendance: Math.max(68, Math.min(99, center.attendanceRate + ((seed % 9) - 4))),
          company: isMapped ? companies[seed % companies.length] : "Not mapped",
          designation: isMapped ? designations[seed % designations.length] : "Pending",
          salary: isPlaced ? 15000 + (seed % 8) * 1800 : 0,
        };
      });

      return {
        ...parsed,
        track: center.jobRoles[batchIndex % center.jobRoles.length],
        attendanceRate: Math.max(70, Math.min(99, center.attendanceRate + ((batchIndex % 3) - 1) * 3)),
        assessmentRate: Math.max(64, Math.min(98, parsePercent(center.performanceMetrics[1]?.value) + ((batchIndex % 4) - 1) * 2)),
        completedTraining,
        certified,
        mapped,
        placed,
        risks: Math.max(0, Math.round(center.grievances / Math.max(center.candidateList.length, 1))),
        candidateRecords,
      };
    });

    const completedTraining = batches.reduce((sum, batch) => sum + batch.completedTraining, 0);
    const certified = batches.reduce((sum, batch) => sum + batch.certified, 0);
    const mapped = batches.reduce((sum, batch) => sum + batch.mapped, 0);
    const placed = batches.reduce((sum, batch) => sum + batch.placed, 0);

    return {
      ...center,
      batches,
      completedTraining,
      certified,
      mapped,
      placed,
      health: average([
        center.attendanceRate,
        center.placementRate,
        parsePercent(center.performanceMetrics[0]?.value),
        parsePercent(center.performanceMetrics[1]?.value),
      ]),
    };
  });

  const summary = getProjectSummary(project);

  return {
    ...project,
    centers,
    summary,
    totalBatches: centers.reduce((sum, center) => sum + center.batches.length, 0),
    completedTraining: centers.reduce((sum, center) => sum + center.completedTraining, 0),
    certified: centers.reduce((sum, center) => sum + center.certified, 0),
    mapped: centers.reduce((sum, center) => sum + center.mapped, 0),
    placed: centers.reduce((sum, center) => sum + center.placed, 0),
  };
};

export const getClientDeliveryMetrics = (projects) => {
  const snapshots = projects.map(buildClientProjectSnapshot);
  const totals = snapshots.reduce(
    (acc, project) => {
      project.centers.forEach((center) => {
        const enrollmentRate = parsePercent(
          center.performanceMetrics.find((metric) => metric.label.includes("Enrollment"))?.value
        ) || 85;
        const assessmentRate = parsePercent(
          center.performanceMetrics.find((metric) => metric.label.includes("Assessment"))?.value
        ) || 82;
        const placementRate = parsePercent(
          center.performanceMetrics.find((metric) => metric.label.includes("Placement"))?.value
        ) || center.placementRate || 70;
        const retentionRate = parsePercent(
          center.performanceMetrics.find((metric) => metric.label.includes("Retention"))?.value
        ) || 65;

        const enrolledTarget = Math.max(center.candidates, Math.round(center.candidates / (enrollmentRate / 100)));
        const mobilizedTarget = Math.round(enrolledTarget * 1.2);
        const mobilized = Math.min(mobilizedTarget, Math.round(center.candidates * 1.16));
        const trainedTarget = center.candidates;
        const certifiedTarget = Math.round(center.candidates * (assessmentRate / 100));
        const placedTarget = Math.round(center.candidates * (placementRate / 100));
        const retentionTarget = Math.round(placedTarget * (retentionRate / 100));
        const retainedWithDocuments = Math.round(center.placed * (retentionRate / 100));

        acc.mobilized.actual += mobilized;
        acc.mobilized.target += mobilizedTarget;
        acc.enrolled.actual += center.candidates;
        acc.enrolled.target += enrolledTarget;
        acc.trained.actual += center.completedTraining;
        acc.trained.target += trainedTarget;
        acc.certified.actual += center.certified;
        acc.certified.target += certifiedTarget;
        acc.placed.actual += center.placed;
        acc.placed.target += placedTarget;
        acc.retention.actual += retainedWithDocuments;
        acc.retention.target += retentionTarget;
      });

      return acc;
    },
    {
      mobilized: { actual: 0, target: 0 },
      enrolled: { actual: 0, target: 0 },
      trained: { actual: 0, target: 0 },
      certified: { actual: 0, target: 0 },
      placed: { actual: 0, target: 0 },
      retention: { actual: 0, target: 0 },
    }
  );

  const metrics = [
    {
      id: "mobilized",
      label: "Total Mobilized",
      helper: "Mobilized candidates against outreach target",
      ...totals.mobilized,
    },
    {
      id: "trained",
      label: "Total Trained",
      helper: "Learners who completed training",
      ...totals.trained,
    },
    {
      id: "placed",
      label: "Total Placed",
      helper: "Placed candidates against placement target",
      ...totals.placed,
    },
    {
      id: "enrolled",
      label: "Total Enrolled",
      helper: "Enrolled candidates against sanctioned target",
      ...totals.enrolled,
    },
    {
      id: "certified",
      label: "Total Certified",
      helper: "Certified candidates against assessment target",
      ...totals.certified,
    },
    {
      id: "retention",
      label: "3 Months Retention",
      helper: "Placed learners with offer letter and 3 salary slips uploaded",
      ...totals.retention,
    },
  ].map((metric) => ({
    ...metric,
    percentage: clampPercent(metric.actual, metric.target),
  }));

  const actual = metrics.reduce((sum, metric) => sum + metric.actual, 0);
  const target = metrics.reduce((sum, metric) => sum + metric.target, 0);

  return {
    actual,
    metrics,
    percentage: clampPercent(actual, target),
    target,
  };
};

const addLocationCount = (map, location, count) => {
  if (!count) return;
  map.set(location, (map.get(location) || 0) + count);
};

export const getClientPlacementGeography = (projects) => {
  const snapshots = projects.map(buildClientProjectSnapshot);
  const odishaDistrictCounts = new Map();
  const outsideStateCounts = new Map();
  let sameDistrict = 0;
  let differentDistrict = 0;
  let outsideState = 0;

  snapshots.forEach((project, projectIndex) => {
    project.centers.forEach((center, centerIndex) => {
      const seed = projectIndex + centerIndex;
      const placed = center.placed || 0;
      const same = Math.round(placed * (0.42 + (seed % 3) * 0.03));
      const different = Math.round(placed * (0.28 + (seed % 2) * 0.04));
      const outside = Math.max(placed - same - different, 0);

      sameDistrict += same;
      differentDistrict += different;
      outsideState += outside;

      addLocationCount(odishaDistrictCounts, center.location, same);

      const firstDistrict = odishaDistrictPool[(seed + 2) % odishaDistrictPool.length];
      const secondDistrict = odishaDistrictPool[(seed + 4) % odishaDistrictPool.length];
      addLocationCount(odishaDistrictCounts, firstDistrict, Math.ceil(different * 0.58));
      addLocationCount(odishaDistrictCounts, secondDistrict, Math.floor(different * 0.42));

      const firstState = outsideStatePool[(seed + 1) % outsideStatePool.length];
      const secondState = outsideStatePool[(seed + 3) % outsideStatePool.length];
      addLocationCount(outsideStateCounts, firstState, Math.ceil(outside * 0.62));
      addLocationCount(outsideStateCounts, secondState, Math.floor(outside * 0.38));
    });
  });

  const local = sameDistrict + differentDistrict;
  const total = local + outsideState;
  const odishaDistricts = Array.from(odishaDistrictCounts, ([location, count]) => ({
    count,
    location,
    type: "Odisha district",
  })).sort((a, b) => b.count - a.count);
  const outsideStates = Array.from(outsideStateCounts, ([location, count]) => ({
    count,
    location,
    type: "Outside Odisha",
  })).sort((a, b) => b.count - a.count);

  return {
    districtSplit: [
      { name: "Same district", value: sameDistrict },
      { name: "Different district in Odisha", value: differentDistrict },
    ],
    localSplit: [
      { name: "Placed locally in Odisha", value: local },
      { name: "Placed outside Odisha", value: outsideState },
    ],
    locationBars: [...odishaDistricts, ...outsideStates],
    totals: {
      differentDistrict,
      local,
      outsideState,
      sameDistrict,
      total,
    },
  };
};

export const getStoredClient = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("clientSession") || "null");
    return CLIENT_ACCOUNTS.find((client) => client.id === stored?.id) || CLIENT_ACCOUNTS[0];
  } catch {
    return CLIENT_ACCOUNTS[0];
  }
};
