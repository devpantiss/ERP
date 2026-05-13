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

export const getStoredClient = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("clientSession") || "null");
    return CLIENT_ACCOUNTS.find((client) => client.id === stored?.id) || CLIENT_ACCOUNTS[0];
  } catch {
    return CLIENT_ACCOUNTS[0];
  }
};
