import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  CalendarRange,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { PROJECT_REPORTS } from "./adminPortalData";
import SlidePanel from "../../components/common/SlidePanel";

const STAFF_LANES = [
  "Lead Trainer",
  "Placement Officer",
  "Mobilization Lead",
  "Center Operations",
  "MIS and Compliance",
  "Soft Skills Mentor",
  "Lab Coordinator",
  "Hostel and Welfare",
];

const CANDIDATE_FIRST_NAMES = [
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
  "Monalisa",
  "Ritesh",
  "Sweta",
  "Tanmay",
  "Sonali",
  "Abhishek",
  "Rupali",
  "Deepak",
];

const CANDIDATE_LAST_NAMES = [
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
  "Majhi",
  "Samal",
  "Mallick",
  "Swain",
  "Jena",
  "Sahoo",
  "Bhoi",
  "Kisan",
];

const TRAINING_STATUS_ORDER = [
  "Induction",
  "In Progress",
  "Assessment Due",
  "Certified",
];

const PLACEMENT_STATUS_ORDER = [
  "Not Yet Eligible",
  "Employer Mapping",
  "Interview Scheduled",
  "Placed",
];

const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(value);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const average = (values) => {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const parseMetricValue = (value) =>
  Number(String(value).replace(/[^0-9.]/g, "")) || 0;

const parseBatchEntry = (entry, index) => {
  const parts = entry.split(" - ");
  const maybeSize = Number(parts.at(-1));

  return {
    id: `batch-${index + 1}`,
    label:
      parts.length > 1 && !Number.isNaN(maybeSize)
        ? parts.slice(0, -1).join(" - ")
        : entry,
    size: !Number.isNaN(maybeSize) ? maybeSize : 35,
  };
};

const getDurationSummary = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  const totalDays = Math.max(1, Math.round((end - start) / day));
  const elapsedDays = clamp(Math.round((now - start) / day), 0, totalDays);
  const remainingDays = Math.max(0, Math.ceil((end - now) / day));

  return {
    totalDays,
    elapsedDays,
    remainingDays,
    progress: clamp(Math.round((elapsedDays / totalDays) * 100), 0, 100),
  };
};

const getStatusMeta = (status) => {
  if (status === "Active") {
    return {
      badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      accentClass: "text-emerald-300",
      label: "Delivery Live",
    };
  }

  if (status === "Monitoring") {
    return {
      badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-300",
      accentClass: "text-amber-300",
      label: "Leadership Watch",
    };
  }

  return {
    badgeClass: "border-slate-500/20 bg-slate-500/10 text-slate-300",
    accentClass: "text-slate-300",
    label: "Portfolio Review",
  };
};

const getHealthMeta = (score) => {
  if (score >= 85) {
    return {
      label: "High Confidence",
      badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      accentClass: "text-emerald-300",
      barClass: "from-emerald-500 to-cyan-400",
    };
  }

  if (score >= 74) {
    return {
      label: "Watch Closely",
      badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-300",
      accentClass: "text-amber-300",
      barClass: "from-amber-500 to-orange-400",
    };
  }

  return {
    label: "Intervention Required",
    badgeClass: "border-rose-500/20 bg-rose-500/10 text-rose-300",
    accentClass: "text-rose-300",
    barClass: "from-rose-500 to-fuchsia-500",
  };
};

const getRiskMeta = (riskLabel) => {
  if (riskLabel === "Healthy") {
    return {
      badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      accentClass: "text-emerald-300",
    };
  }

  if (riskLabel === "Watch") {
    return {
      badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-300",
      accentClass: "text-amber-300",
    };
  }

  return {
    badgeClass: "border-rose-500/20 bg-rose-500/10 text-rose-300",
    accentClass: "text-rose-300",
  };
};

const getTrainingStatusMeta = (status) => {
  if (status === "Certified") {
    return {
      badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      toneClass: "bg-emerald-500/10 text-emerald-300",
      dotClass: "bg-emerald-400",
    };
  }

  if (status === "Assessment Due") {
    return {
      badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-300",
      toneClass: "bg-amber-500/10 text-amber-300",
      dotClass: "bg-amber-400",
    };
  }

  if (status === "In Progress") {
    return {
      badgeClass: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
      toneClass: "bg-cyan-500/10 text-cyan-300",
      dotClass: "bg-cyan-400",
    };
  }

  return {
    badgeClass: "border-slate-500/20 bg-slate-500/10 text-slate-300",
    toneClass: "bg-slate-500/10 text-slate-300",
    dotClass: "bg-slate-400",
  };
};

const getPlacementStatusMeta = (status) => {
  if (status === "Placed") {
    return {
      badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      toneClass: "bg-emerald-500/10 text-emerald-300",
      dotClass: "bg-emerald-400",
    };
  }

  if (status === "Interview Scheduled") {
    return {
      badgeClass: "border-violet-500/20 bg-violet-500/10 text-violet-300",
      toneClass: "bg-violet-500/10 text-violet-300",
      dotClass: "bg-violet-400",
    };
  }

  if (status === "Employer Mapping") {
    return {
      badgeClass: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
      toneClass: "bg-cyan-500/10 text-cyan-300",
      dotClass: "bg-cyan-400",
    };
  }

  return {
    badgeClass: "border-slate-500/20 bg-slate-500/10 text-slate-300",
    toneClass: "bg-slate-500/10 text-slate-300",
    dotClass: "bg-slate-400",
  };
};

const buildCandidateName = (center, batchIndex, learnerIndex) => {
  const seed =
    center.name.length * 5 +
    center.location.length * 3 +
    batchIndex * 17 +
    learnerIndex * 11;

  const firstName =
    CANDIDATE_FIRST_NAMES[seed % CANDIDATE_FIRST_NAMES.length];
  const lastName =
    CANDIDATE_LAST_NAMES[(seed + center.manager.length) % CANDIDATE_LAST_NAMES.length];

  return `${firstName} ${lastName}`;
};

const buildStatusMix = (records, key, labels, getMeta) =>
  labels
    .map((label) => ({
      label,
      count: records.filter((record) => record[key] === label).length,
      ...getMeta(label),
    }))
    .filter((item) => item.count);

const buildCenterSnapshot = (center, projectName) => {
  const performanceMap = Object.fromEntries(
    center.performanceMetrics.map((metric) => [
      metric.label,
      parseMetricValue(metric.value),
    ])
  );

  const enrollmentAchievement = performanceMap["Enrollment Achievement"] || 0;
  const assessmentPassRate = performanceMap["Assessment Pass Rate"] || 0;
  const placementConversion = performanceMap["Placement Conversion"] || 0;
  const retentionRate = performanceMap["Retention After 90 Days"] || 0;

  const batchSnapshots = center.candidateList.map((entry, index) => {
    const parsed = parseBatchEntry(entry, index);
    const track = center.jobRoles[index % center.jobRoles.length] || "Multi-skill";
    const attendanceRate = clamp(
      center.attendanceRate + 3 - index * 2 + (parsed.size <= 40 ? 1 : -1),
      68,
      98
    );
    const assessmentRate = clamp(assessmentPassRate + 2 - index * 2, 64, 96);
    const readiness = clamp(
      Math.round(
        attendanceRate * 0.42 +
          assessmentRate * 0.34 +
          center.placementRate * 0.24
      ),
      62,
      98
    );
    const mappedCandidates = Math.min(
      parsed.size,
      Math.round((readiness / 100) * parsed.size * 0.62)
    );
    const riskCount = Math.max(0, Math.round((100 - attendanceRate) / 7));
    const candidateRecords = Array.from({ length: parsed.size }, (_, learnerIndex) => {
      const candidateName = buildCandidateName(center, index, learnerIndex);
      const attendanceScore = clamp(
        attendanceRate + 6 - (learnerIndex % 11) * 2 + (learnerIndex % 3),
        58,
        99
      );
      const trainingProgress = clamp(
        readiness - 18 + (learnerIndex % 14) * 3 - Math.floor(learnerIndex / 8) * 2,
        36,
        100
      );

      let trainingStatus = "Induction";

      if (trainingProgress >= 92) {
        trainingStatus = "Certified";
      } else if (trainingProgress >= 78) {
        trainingStatus = "Assessment Due";
      } else if (trainingProgress >= 56) {
        trainingStatus = "In Progress";
      }

      const placementReadiness = clamp(
        Math.round(
          trainingProgress * 0.48 +
            attendanceScore * 0.28 +
            (mappedCandidates / Math.max(parsed.size, 1)) * 100 * 0.24
        ),
        24,
        100
      );

      let placementStatus = "Not Yet Eligible";

      if (
        placementReadiness >= 90 &&
        learnerIndex < Math.round(mappedCandidates * 0.52)
      ) {
        placementStatus = "Placed";
      } else if (
        placementReadiness >= 80 &&
        learnerIndex < Math.round(mappedCandidates * 0.82)
      ) {
        placementStatus = "Interview Scheduled";
      } else if (
        placementReadiness >= 68 &&
        learnerIndex < Math.max(mappedCandidates, Math.round(parsed.size * 0.35))
      ) {
        placementStatus = "Employer Mapping";
      }

      const nextMilestone =
        placementStatus === "Placed"
          ? "Retention check-in"
          : placementStatus === "Interview Scheduled"
          ? "Employer interview panel"
          : placementStatus === "Employer Mapping"
          ? "Shortlist confirmation"
          : trainingStatus === "Assessment Due"
          ? "Assessment slot booking"
          : trainingStatus === "In Progress"
          ? "Module completion review"
          : "Complete induction checklist";

      const trainingMeta = getTrainingStatusMeta(trainingStatus);
      const placementMeta = getPlacementStatusMeta(placementStatus);

      return {
        id: `${center.id}-${parsed.id}-candidate-${learnerIndex + 1}`,
        title: candidateName,
        subtitle: `${parsed.label} / ${track}`,
        meta: `Attendance ${attendanceScore}% / Training ${trainingStatus} / Placement ${placementStatus}`,
        tag: placementStatus,
        toneClass: placementMeta.toneClass,
        description: `${candidateName} is currently mapped to ${nextMilestone.toLowerCase()} in ${parsed.label}.`,
        name: candidateName,
        candidateCode: `${center.location.slice(0, 3).toUpperCase()}-${String(
          learnerIndex + 1
        ).padStart(3, "0")}`,
        jobRole: center.jobRoles[(learnerIndex + index) % center.jobRoles.length],
        attendanceRate: attendanceScore,
        trainingProgress,
        trainingStatus,
        placementReadiness,
        placementStatus,
        nextMilestone,
        trainingMeta,
        placementMeta,
      };
    });
    const trainingStatusMix = buildStatusMix(
      candidateRecords,
      "trainingStatus",
      TRAINING_STATUS_ORDER,
      getTrainingStatusMeta
    );
    const placementStatusMix = buildStatusMix(
      candidateRecords,
      "placementStatus",
      PLACEMENT_STATUS_ORDER,
      getPlacementStatusMeta
    );
    const certifiedCandidates = candidateRecords.filter(
      (record) => record.trainingStatus === "Certified"
    ).length;
    const placedCandidates = candidateRecords.filter(
      (record) => record.placementStatus === "Placed"
    ).length;
    const placementTrackedCandidates = candidateRecords.filter(
      (record) => record.placementStatus !== "Not Yet Eligible"
    ).length;

    return {
      ...parsed,
      track,
      attendanceRate,
      assessmentRate,
      readiness,
      mappedCandidates,
      riskCount,
      mode: index % 2 === 0 ? "Classroom + OJT" : "Employer-facing",
      candidateRecords,
      trainingStatusMix,
      placementStatusMix,
      certifiedCandidates,
      placedCandidates,
      placementTrackedCandidates,
    };
  });

  const jobRoleMix = center.jobRoles.map((role, index) => ({
    id: `${center.id}-role-${index + 1}`,
    title: role,
    learnerLoad: Math.round(center.candidates / Math.max(center.jobRoles.length, 1)),
    demandSignal: clamp(center.placementRate + 6 - index * 5, 58, 95),
  }));

  const trainingOps = Math.max(1, Math.round(center.employees * 0.42));
  const mobilizationOps = Math.max(1, Math.round(center.employees * 0.22));
  const placementOps = Math.max(1, Math.round(center.employees * 0.16));
  const adminOps = Math.max(
    1,
    center.employees - trainingOps - mobilizationOps - placementOps
  );

  const staffingPods = [
    {
      label: "Training Ops",
      value: trainingOps,
      accentClass: "text-violet-300",
      panelClass: "bg-violet-500/10",
      barClass: "bg-violet-500",
    },
    {
      label: "Mobilization",
      value: mobilizationOps,
      accentClass: "text-amber-300",
      panelClass: "bg-amber-500/10",
      barClass: "bg-amber-500",
    },
    {
      label: "Placement",
      value: placementOps,
      accentClass: "text-cyan-300",
      panelClass: "bg-cyan-500/10",
      barClass: "bg-cyan-500",
    },
    {
      label: "Admin and Welfare",
      value: adminOps,
      accentClass: "text-slate-200",
      panelClass: "bg-white/[0.04]",
      barClass: "bg-slate-400",
    },
  ];

  const healthScore = clamp(
    Math.round(
      center.attendanceRate * 0.31 +
        placementConversion * 0.18 +
        center.placementRate * 0.19 +
        assessmentPassRate * 0.18 +
        retentionRate * 0.14 -
        center.grievances * 1.7
    ),
    0,
    99
  );

  const riskLabel =
    healthScore >= 85 && center.grievances <= 2
      ? "Healthy"
      : healthScore >= 74 && center.grievances <= 5
      ? "Watch"
      : "Intervention";

  const mappedCandidates = batchSnapshots.reduce(
    (sum, batch) => sum + batch.mappedCandidates,
    0
  );

  const complianceScore = clamp(
    Math.round(
      center.attendanceRate * 0.34 +
        assessmentPassRate * 0.34 +
        (100 - Math.min(center.grievances * 7, 40)) * 0.32
    ),
    0,
    99
  );

  const employeeRecords = center.employeeList.map((name, index) => ({
    id: `${center.id}-employee-${index + 1}`,
    title: name,
    subtitle: STAFF_LANES[index % STAFF_LANES.length],
    meta: `${projectName} / ${center.location}`,
    tag:
      index === 0
        ? "Critical Path Owner"
        : index < 3
        ? "Execution Pod"
        : "Delivery Support",
    toneClass:
      index === 0
        ? "bg-violet-500/10 text-violet-300"
        : "bg-white/[0.05] text-slate-300",
    description: `${name} is mapped to skilling execution for ${center.name}.`,
  }));

  const batchRecords = batchSnapshots.map((batch) => ({
    id: `${center.id}-${batch.id}`,
    title: batch.label,
    subtitle: `${formatNumber(batch.size)} learners / ${batch.track}`,
    meta: `Attendance ${batch.attendanceRate}% / Assessment ${batch.assessmentRate}% / Ready ${batch.readiness}%`,
    tag: `${batch.mappedCandidates} employer mapped`,
    toneClass: "bg-cyan-500/10 text-cyan-300",
    description: `${batch.riskCount} learner(s) flagged for intervention support.`,
  }));

  const grievanceRecords = center.grievancesList.map((issue, index) => {
    const escalated =
      issue.toLowerCase().includes("pending") ||
      issue.toLowerCase().includes("downtime") ||
      issue.toLowerCase().includes("not functional");

    return {
      id: `${center.id}-grievance-${index + 1}`,
      title: issue,
      subtitle: `Owner: ${
        ["Center Manager", "Ops Desk", "Admin Escalation"][index % 3]
      }`,
      meta: `SLA ${2 + index} day(s) / ${center.location}`,
      tag: escalated ? "Escalated" : index === 0 ? "Open" : "In Progress",
      toneClass: escalated
        ? "bg-rose-500/10 text-rose-300"
        : "bg-amber-500/10 text-amber-300",
      description: `${projectName} governance stack is tracking this item for ${center.name}.`,
    };
  });

  const jobRoleRecords = jobRoleMix.map((role) => ({
    id: role.id,
    title: role.title,
    subtitle: `${role.learnerLoad} learners aligned`,
    meta: `Demand signal ${role.demandSignal}%`,
    tag:
      role.demandSignal >= 85
        ? "High Opportunity"
        : role.demandSignal >= 72
        ? "Steady Demand"
        : "Needs Employer Pull",
    toneClass:
      role.demandSignal >= 85
        ? "bg-emerald-500/10 text-emerald-300"
        : role.demandSignal >= 72
        ? "bg-cyan-500/10 text-cyan-300"
        : "bg-amber-500/10 text-amber-300",
    description: `${role.title} remains one of the delivery lanes for ${center.name}.`,
  }));

  return {
    ...center,
    enrollmentAchievement,
    assessmentPassRate,
    placementConversion,
    retentionRate,
    batchSnapshots,
    jobRoleMix,
    staffingPods,
    healthScore,
    riskLabel,
    mappedCandidates,
    complianceScore,
    capacityPerEmployee: Math.round(center.candidates / Math.max(center.employees, 1)),
    candidateRecords: batchSnapshots.flatMap((batch) => batch.candidateRecords),
    employeeRecords,
    batchRecords,
    grievanceRecords,
    jobRoleRecords,
  };
};

const buildProjectSnapshot = (project) => {
  const centerSnapshots = project.centers.map((center) =>
    buildCenterSnapshot(center, project.name)
  );

  const totalEmployees = centerSnapshots.reduce(
    (sum, center) => sum + center.employees,
    0
  );
  const totalCandidates = centerSnapshots.reduce(
    (sum, center) => sum + center.candidates,
    0
  );
  const totalGrievances = centerSnapshots.reduce(
    (sum, center) => sum + center.grievances,
    0
  );
  const totalBatches = centerSnapshots.reduce(
    (sum, center) => sum + center.batchSnapshots.length,
    0
  );
  const totalMappedCandidates = centerSnapshots.reduce(
    (sum, center) => sum + center.mappedCandidates,
    0
  );
  const avgAttendanceRate = average(
    centerSnapshots.map((center) => center.attendanceRate)
  );
  const avgPlacementRate = average(
    centerSnapshots.map((center) => center.placementRate)
  );
  const avgEnrollmentAchievement = average(
    centerSnapshots.map((center) => center.enrollmentAchievement)
  );
  const avgAssessmentRate = average(
    centerSnapshots.map((center) => center.assessmentPassRate)
  );
  const avgRetentionRate = average(
    centerSnapshots.map((center) => center.retentionRate)
  );

  const healthScore = clamp(
    Math.round(
      avgAttendanceRate * 0.23 +
        avgPlacementRate * 0.23 +
        avgAssessmentRate * 0.18 +
        avgRetentionRate * 0.14 +
        avgEnrollmentAchievement * 0.12 +
        (100 - Math.min(totalGrievances * 3, 36)) * 0.1
    ),
    0,
    99
  );

  const duration = getDurationSummary(project.startDate, project.endDate);
  const topCenter =
    [...centerSnapshots].sort((left, right) => right.healthScore - left.healthScore)[0] ||
    null;
  const watchCenter =
    [...centerSnapshots].sort((left, right) => {
      if (right.grievances !== left.grievances) {
        return right.grievances - left.grievances;
      }
      return left.healthScore - right.healthScore;
    })[0] || null;

  return {
    ...project,
    centers: centerSnapshots,
    centerCount: centerSnapshots.length,
    totalEmployees,
    totalCandidates,
    totalGrievances,
    totalBatches,
    totalMappedCandidates,
    avgAttendanceRate,
    avgPlacementRate,
    avgEnrollmentAchievement,
    avgAssessmentRate,
    avgRetentionRate,
    healthScore,
    duration,
    topCenter,
    watchCenter,
    riskCenters: centerSnapshots.filter(
      (center) => center.riskLabel !== "Healthy"
    ).length,
    activeJobRoles: Array.from(
      new Set(centerSnapshots.flatMap((center) => center.jobRoles))
    ),
    governanceScore: clamp(
      Math.round(
        avgAttendanceRate * 0.33 +
          avgAssessmentRate * 0.32 +
          (100 - Math.min(totalGrievances * 4, 40)) * 0.35
      ),
      0,
      99
    ),
    candidatePerEmployee: Math.round(
      totalCandidates / Math.max(totalEmployees, 1)
    ),
  };
};

export default function AdminProjectManagement() {
  const projectSnapshots = useMemo(
    () => PROJECT_REPORTS.map(buildProjectSnapshot),
    []
  );

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [detailPanel, setDetailPanel] = useState({
    isOpen: false,
    title: "",
    subtitle: "",
    icon: FileText,
    accentClass: "text-violet-300",
    records: [],
    searchQuery: "",
  });

  const selectedProject = useMemo(
    () =>
      projectSnapshots.find((project) => project.id === selectedProjectId) || null,
    [projectSnapshots, selectedProjectId]
  );

  useEffect(() => {
    if (!selectedProject) return;

    setSelectedCenterId((currentValue) => {
      const centerExists = selectedProject.centers.some(
        (center) => center.id === currentValue
      );
      return centerExists ? currentValue : "";
    });
  }, [selectedProject]);

  const activeCenter = useMemo(
    () =>
      selectedProject?.centers.find((center) => center.id === selectedCenterId) || null,
    [selectedCenterId, selectedProject]
  );

  useEffect(() => {
    if (!activeCenter) {
      setSelectedBatchId("");
      return;
    }

    setSelectedBatchId((currentValue) => {
      const batchExists = activeCenter.batchSnapshots.some(
        (batch) => batch.id === currentValue
      );
      return batchExists ? currentValue : activeCenter.batchSnapshots[0]?.id || "";
    });
  }, [activeCenter]);

  const selectedBatch = useMemo(() => {
    if (!activeCenter) return null;

    return (
      activeCenter.batchSnapshots.find((batch) => batch.id === selectedBatchId) ||
      activeCenter.batchSnapshots[0] ||
      null
    );
  }, [activeCenter, selectedBatchId]);

  const rankedCenters = useMemo(
    () =>
      selectedProject
        ? [...selectedProject.centers].sort(
            (left, right) => right.healthScore - left.healthScore
          )
        : [],
    [selectedProject]
  );

  const portfolio = useMemo(() => {
    const centerCount = projectSnapshots.reduce(
      (sum, project) => sum + project.centerCount,
      0
    );
    const learners = projectSnapshots.reduce(
      (sum, project) => sum + project.totalCandidates,
      0
    );
    const employees = projectSnapshots.reduce(
      (sum, project) => sum + project.totalEmployees,
      0
    );
    const mappedCandidates = projectSnapshots.reduce(
      (sum, project) => sum + project.totalMappedCandidates,
      0
    );

    return {
      projects: projectSnapshots.length,
      activeProjects: projectSnapshots.filter(
        (project) => project.status === "Active"
      ).length,
      centerCount,
      learners,
      employees,
      avgPlacementRate: average(
        projectSnapshots.map((project) => project.avgPlacementRate)
      ),
      avgHealthScore: average(
        projectSnapshots.map((project) => project.healthScore)
      ),
      mappedCandidates,
      atRiskProjects: projectSnapshots.filter(
        (project) => project.healthScore < 75 || project.totalGrievances >= 5
      ).length,
    };
  }, [projectSnapshots]);

  const projectStatusMeta = getStatusMeta(selectedProject?.status || "");
  const projectHealthMeta = getHealthMeta(selectedProject?.healthScore || 0);
  const centerHealthMeta = getHealthMeta(activeCenter?.healthScore || 0);
  const centerRiskMeta = getRiskMeta(activeCenter?.riskLabel || "Watch");

  const detailRecords = useMemo(
    () =>
      detailPanel.records.filter((record) =>
        [
          record.title,
          record.subtitle,
          record.meta,
          record.tag,
          record.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(detailPanel.searchQuery.toLowerCase())
      ),
    [detailPanel.records, detailPanel.searchQuery]
  );

  const openDetailPanel = ({
    title,
    subtitle,
    icon,
    accentClass,
    records,
  }) => {
    setDetailPanel({
      isOpen: true,
      title,
      subtitle,
      icon,
      accentClass,
      records,
      searchQuery: "",
    });
  };

  const closeDetailPanel = () => {
    setDetailPanel((currentValue) => ({
      ...currentValue,
      isOpen: false,
      searchQuery: "",
    }));
  };

  const projectScorecard = selectedProject
    ? [
        {
          label: "Enrollment Achievement",
          value: selectedProject.avgEnrollmentAchievement,
          accentClass: "text-cyan-300",
          barClass: "bg-cyan-500",
        },
        {
          label: "Assessment Pass Rate",
          value: selectedProject.avgAssessmentRate,
          accentClass: "text-violet-300",
          barClass: "bg-violet-500",
        },
        {
          label: "Placement Conversion",
          value: selectedProject.avgPlacementRate,
          accentClass: "text-emerald-300",
          barClass: "bg-emerald-500",
        },
        {
          label: "Retention After 90 Days",
          value: selectedProject.avgRetentionRate,
          accentClass: "text-amber-300",
          barClass: "bg-amber-500",
        },
      ]
    : [];

  const currentStep = !selectedProject ? 1 : !activeCenter ? 2 : 3;

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    setSelectedCenterId("");
    setSelectedBatchId("");
  };

  const handleCenterSelect = (centerId) => {
    setSelectedCenterId(centerId);
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setSelectedCenterId("");
      setSelectedBatchId("");
      return;
    }

    if (currentStep === 2) {
      setSelectedProjectId("");
      setSelectedCenterId("");
      setSelectedBatchId("");
    }
  };

  const PanelIcon = detailPanel.icon;

  return (
    <div className="space-y-6 text-white">
      <header className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.18),_transparent_36%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.98))] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.38)]">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-200">
              <FolderKanban size={14} />
              Project Details / Reports
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Skilling project command center with portfolio signals, center
                execution, delivery health, and governance depth.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300">
                This view is designed like an enterprise project intelligence
                surface, but tuned for skilling operations: center performance,
                batches, job roles, staffing, learner outcomes, and grievance
                control in one place.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PortfolioStatCard
              label="Live Programs"
              value={`${portfolio.activeProjects}/${portfolio.projects}`}
              caption={`${portfolio.centerCount} centers under governance right now.`}
              icon={ShieldCheck}
              accentClass="text-emerald-300"
              panelClass="border-emerald-500/15 bg-emerald-500/10"
            />
            <PortfolioStatCard
              label="Learners In Flight"
              value={formatNumber(portfolio.learners)}
              caption={`${formatNumber(
                portfolio.mappedCandidates
              )} learners already aligned to placement pipelines.`}
              icon={Users}
              accentClass="text-cyan-300"
              panelClass="border-cyan-500/15 bg-cyan-500/10"
            />
            <PortfolioStatCard
              label="Portfolio Health"
              value={`${portfolio.avgHealthScore}%`}
              caption={`${portfolio.avgPlacementRate}% weighted placement conversion across the ERP portfolio.`}
              icon={TrendingUp}
              accentClass="text-violet-300"
              panelClass="border-violet-500/15 bg-violet-500/10"
            />
            <PortfolioStatCard
              label="At-Risk Programs"
              value={`${portfolio.atRiskProjects}`}
              caption={`${formatNumber(portfolio.employees)} employees are mapped into project delivery and support lanes.`}
              icon={CircleAlert}
              accentClass="text-amber-300"
              panelClass="border-amber-500/15 bg-amber-500/10"
            />
          </div>
        </div>
      </header>

      <section className="rounded-[28px] border border-white/10 bg-[#0b1220] p-5 shadow-[0_18px_60px_rgba(2,6,23,0.24)]">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Guided Flow
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Select project first, then center, then review performance
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              The page now moves in a clearer order. Users choose the skilling
              project, then the center inside that project, and only after that
              do the detailed performance views appear.
            </p>
          </div>

          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08]"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {selectedProject ? (
            <SelectionChip
              label="Project"
              value={selectedProject.name}
              onClear={() => {
                setSelectedProjectId("");
                setSelectedCenterId("");
                setSelectedBatchId("");
              }}
            />
          ) : null}
          {activeCenter ? (
            <SelectionChip
              label="Center"
              value={activeCenter.name}
              onClear={() => {
                setSelectedCenterId("");
                setSelectedBatchId("");
              }}
            />
          ) : null}
        </div>

        <div className="mt-5">
          {currentStep === 1 ? (
            <GuidedStepSection
              step="Step 1"
              title="Choose the skilling project"
              description="Project cards stay up front so the user can begin with the program itself before deciding which center to inspect."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {projectSnapshots.map((project) => (
                  <ProjectRailCard
                    key={project.id}
                    project={project}
                    isActive={selectedProject?.id === project.id}
                    onClick={() => handleProjectSelect(project.id)}
                  />
                ))}
              </div>
            </GuidedStepSection>
          ) : null}

          {currentStep === 2 && selectedProject ? (
            <GuidedStepSection
              step="Step 2"
              title={`Choose the center inside ${selectedProject.name}`}
              description="After selecting the project, the layout now narrows down to the centers under that program so the user can open the right performance view."
            >
              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <ProjectSelectionSpotlight
                  project={selectedProject}
                  projectHealthMeta={projectHealthMeta}
                  projectStatusMeta={projectStatusMeta}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  {rankedCenters.map((center) => (
                    <CenterBenchmarkCard
                      key={center.id}
                      center={center}
                      isActive={activeCenter?.id === center.id}
                      onClick={() => handleCenterSelect(center.id)}
                    />
                  ))}
                </div>
              </div>
            </GuidedStepSection>
          ) : null}
        </div>
      </section>

      {currentStep === 3 && selectedProject && activeCenter ? (
        <div className="space-y-6">
          <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_34%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(2,6,23,0.98))] p-6 shadow-[0_18px_60px_rgba(2,6,23,0.28)]">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${projectStatusMeta.badgeClass}`}
                  >
                    {projectStatusMeta.label}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${projectHealthMeta.badgeClass}`}
                  >
                    {selectedProject.healthScore}% project health
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${centerHealthMeta.badgeClass}`}
                  >
                    {activeCenter.healthScore}% center health
                  </span>
                  {selectedBatch ? (
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                      Batch focus: {selectedBatch.label}
                    </span>
                  ) : null}
                </div>

                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-white">
                    {activeCenter.name}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                    {activeCenter.name} is the selected delivery center under{" "}
                    {selectedProject.name}. The layout below is now separated
                    into overview, batch and learner clarity, and operations so
                    the center narrative is easier to scan.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <ProjectMetaCard
                    icon={BriefcaseBusiness}
                    label="Project"
                    value={selectedProject.name}
                    caption={selectedProject.fundingAgency}
                  />
                  <ProjectMetaCard
                    icon={MapPin}
                    label="Center"
                    value={activeCenter.location}
                    caption={`Managed by ${activeCenter.manager}`}
                  />
                  <ProjectMetaCard
                    icon={CalendarRange}
                    label="Delivery window"
                    value={`${formatDate(selectedProject.startDate)} to ${formatDate(
                      selectedProject.endDate
                    )}`}
                    caption={`${selectedProject.duration.remainingDays} day(s) remain in this program window.`}
                  />
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-300">
                        Center execution pulse
                      </p>
                      <p className="mt-1 text-3xl font-semibold text-white">
                        {activeCenter.healthScore}%
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-400">
                      <p>{activeCenter.batchSnapshots.length} active batches</p>
                      <p>{activeCenter.complianceScore}% compliance confidence</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${centerHealthMeta.barClass}`}
                      style={{ width: `${activeCenter.healthScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <HeroSignalCard
                    label="Learners"
                    value={formatNumber(activeCenter.candidates)}
                    caption={`${activeCenter.batchSnapshots.length} active batches inside the selected center.`}
                    icon={Users}
                    accentClass="text-amber-300"
                    panelClass="border-white/10 bg-white/[0.03]"
                  />
                  <HeroSignalCard
                    label="Attendance Rate"
                    value={`${activeCenter.attendanceRate}%`}
                    caption={`${activeCenter.enrollmentAchievement}% enrollment achievement in the current center.`}
                    icon={Activity}
                    accentClass="text-violet-300"
                    panelClass="border-white/10 bg-white/[0.03]"
                  />
                  <HeroSignalCard
                    label="Placement Rate"
                    value={`${activeCenter.placementRate}%`}
                    caption={`${formatNumber(
                      activeCenter.mappedCandidates
                    )} learners are already mapped into opportunity pipelines.`}
                    icon={Award}
                    accentClass="text-emerald-300"
                    panelClass="border-white/10 bg-white/[0.03]"
                  />
                  <HeroSignalCard
                    label="Governance Load"
                    value={`${activeCenter.grievances}`}
                    caption={`${activeCenter.riskLabel} risk posture for the selected center.`}
                    icon={CircleAlert}
                    accentClass="text-rose-300"
                    panelClass="border-white/10 bg-white/[0.03]"
                  />
                </div>

                {selectedBatch ? (
                  <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,_rgba(12,22,40,0.92),_rgba(7,14,28,0.96))] p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                          Batch Focus
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {selectedBatch.label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {selectedBatch.track} delivery in {selectedBatch.mode} mode.
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                        {selectedBatch.readiness}% readiness
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <SmallStat
                        label="Learners"
                        value={formatNumber(selectedBatch.size)}
                      />
                      <SmallStat
                        label="Certified"
                        value={formatNumber(selectedBatch.certifiedCandidates)}
                      />
                      <SmallStat
                        label="Placement Active"
                        value={formatNumber(
                          selectedBatch.placementTrackedCandidates
                        )}
                      />
                      <SmallStat
                        label="Placed"
                        value={formatNumber(selectedBatch.placedCandidates)}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[28px] border border-white/10 bg-[#0b1220] p-5 shadow-[0_18px_60px_rgba(2,6,23,0.24)]">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-300">
                  <Target size={18} />
                </div>
                <div>
                  <p className="text-lg font-medium text-white">
                    Delivery compass
                  </p>
                  <p className="text-sm text-slate-400">
                    Project-level outcome signals and leadership context for the
                    selected center.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {projectScorecard.map((signal) => (
                  <SignalMeter
                    key={signal.label}
                    label={signal.label}
                    value={signal.value}
                    accentClass={signal.accentClass}
                    barClass={signal.barClass}
                  />
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <InsightStatRow
                  label="Selected center posture"
                  value={activeCenter.riskLabel}
                  caption={`${activeCenter.healthScore}% health / ${activeCenter.complianceScore}% compliance / ${activeCenter.grievances} active issue(s).`}
                  accentClass={centerRiskMeta.accentClass}
                />
                <InsightStatRow
                  label="Best project center"
                  value={selectedProject.topCenter?.name || "-"}
                  caption={
                    selectedProject.topCenter
                      ? `${selectedProject.topCenter.healthScore}% health and ${selectedProject.topCenter.placementRate}% placement rate.`
                      : "No benchmark available."
                  }
                  accentClass="text-emerald-300"
                />
                <InsightStatRow
                  label="Watch center"
                  value={selectedProject.watchCenter?.name || "-"}
                  caption={
                    selectedProject.watchCenter
                      ? `${selectedProject.watchCenter.grievances} grievance(s) / ${selectedProject.watchCenter.riskLabel}.`
                      : "No watch center available."
                  }
                  accentClass="text-amber-300"
                />
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-[#0b1220] p-5 shadow-[0_18px_60px_rgba(2,6,23,0.24)]">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    Center Switchboard
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    Compare or switch centers without leaving the details view
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    This version keeps center switching compact, so the page
                    stays readable while still giving context inside the selected
                    project.
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${projectStatusMeta.badgeClass}`}
                >
                  {selectedProject.status}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {rankedCenters.map((center) => (
                  <CenterSwitchRow
                    key={center.id}
                    center={center}
                    isActive={activeCenter?.id === center.id}
                    onClick={() => handleCenterSelect(center.id)}
                  />
                ))}
              </div>
            </section>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#0b1220] p-5 shadow-[0_18px_60px_rgba(2,6,23,0.24)]">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  Batch And Learner Clarity
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Batch details and candidate roster for the selected center
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  Batch navigation is separated from the roster itself, so users
                  can first choose the batch and then inspect individual
                  candidates with training and placement indicators.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${centerHealthMeta.badgeClass}`}
                >
                  {activeCenter.healthScore}% health
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${centerRiskMeta.badgeClass}`}
                >
                  {activeCenter.riskLabel}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
              <div className="space-y-4">
                <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-violet-500/10 p-2 text-violet-300">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white">
                        Batch navigator
                      </p>
                      <p className="text-sm text-slate-400">
                        Select one batch to open its learner-level details.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {activeCenter.batchSnapshots.map((batch) => (
                      <BatchNavigatorCard
                        key={batch.id}
                        batch={batch}
                        isActive={selectedBatch?.id === batch.id}
                        onClick={() => setSelectedBatchId(batch.id)}
                      />
                    ))}
                  </div>
                </section>

                {selectedBatch ? (
                  <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-300">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-white">
                          Selected batch snapshot
                        </p>
                        <p className="text-sm text-slate-400">
                          Training and placement stage mix for {selectedBatch.label}.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <SmallStat
                        label="Attendance"
                        value={`${selectedBatch.attendanceRate}%`}
                      />
                      <SmallStat
                        label="Assessment"
                        value={`${selectedBatch.assessmentRate}%`}
                      />
                      <SmallStat
                        label="Mapped"
                        value={formatNumber(selectedBatch.mappedCandidates)}
                      />
                      <SmallStat
                        label="Risk Flags"
                        value={`${selectedBatch.riskCount}`}
                      />
                    </div>

                    <div className="mt-5 space-y-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Training status mix
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedBatch.trainingStatusMix.map((item) => (
                            <StatusCountPill
                              key={item.label}
                              label={item.label}
                              count={item.count}
                              meta={item}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Placement status mix
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedBatch.placementStatusMix.map((item) => (
                            <StatusCountPill
                              key={item.label}
                              label={item.label}
                              count={item.count}
                              meta={item}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                ) : null}
              </div>

              <div className="space-y-4">
                {selectedBatch ? (
                  <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.02))] p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                          Batch Details
                        </p>
                        <h4 className="mt-2 text-2xl font-semibold text-white">
                          {selectedBatch.label}
                        </h4>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                          Candidate list, training status, placement movement,
                          and readiness are grouped here so the batch story is
                          visible in one place.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openDetailPanel({
                            title: "Batch Candidate Roster",
                            subtitle: `${selectedBatch.label} / ${activeCenter.name} / ${selectedProject.name}`,
                            icon: GraduationCap,
                            accentClass: "text-cyan-300",
                            records: selectedBatch.candidateRecords,
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08]"
                      >
                        Open Searchable Roster
                        <ExternalLink size={15} />
                      </button>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <SmallStat
                        label="Learners"
                        value={formatNumber(selectedBatch.size)}
                      />
                      <SmallStat
                        label="Certified"
                        value={formatNumber(selectedBatch.certifiedCandidates)}
                      />
                      <SmallStat
                        label="Placement Active"
                        value={formatNumber(
                          selectedBatch.placementTrackedCandidates
                        )}
                      />
                      <SmallStat
                        label="Placed"
                        value={formatNumber(selectedBatch.placedCandidates)}
                      />
                    </div>
                  </section>
                ) : null}

                {selectedBatch ? (
                  <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-lg font-medium text-white">
                          Candidate roster
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          Learner-level training and placement indicators inside{" "}
                          {selectedBatch.label}.
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                        {selectedBatch.candidateRecords.length} candidates
                      </span>
                    </div>

                    <div className="mt-4 overflow-x-auto rounded-[20px] border border-white/10">
                      <div className="max-h-[560px] overflow-auto">
                        <table className="min-w-[980px] w-full text-left text-sm">
                          <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.18em] text-slate-500">
                            <tr>
                              <th className="px-4 py-3 font-medium">Candidate</th>
                              <th className="px-4 py-3 font-medium">Skill Lane</th>
                              <th className="px-4 py-3 font-medium">Attendance</th>
                              <th className="px-4 py-3 font-medium">Training Status</th>
                              <th className="px-4 py-3 font-medium">Placement Status</th>
                              <th className="px-4 py-3 font-medium">Next Milestone</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {selectedBatch.candidateRecords.map((candidate) => (
                              <tr
                                key={candidate.id}
                                className="align-top transition hover:bg-white/[0.03]"
                              >
                                <td className="px-4 py-4">
                                  <div>
                                    <p className="font-medium text-white">
                                      {candidate.name}
                                    </p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                                      {candidate.candidateCode}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-white">{candidate.jobRole}</p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {selectedBatch.label}
                                  </p>
                                </td>
                                <td className="px-4 py-4">
                                  <InlinePercent value={candidate.attendanceRate} />
                                </td>
                                <td className="px-4 py-4">
                                  <div className="space-y-2">
                                    <StatusBadge
                                      label={candidate.trainingStatus}
                                      meta={candidate.trainingMeta}
                                    />
                                    <p className="text-xs text-slate-500">
                                      Progress {candidate.trainingProgress}%
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="space-y-2">
                                    <StatusBadge
                                      label={candidate.placementStatus}
                                      meta={candidate.placementMeta}
                                    />
                                    <p className="text-xs text-slate-500">
                                      Readiness {candidate.placementReadiness}%
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-slate-300">
                                  {candidate.nextMilestone}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#0b1220] p-5 shadow-[0_18px_60px_rgba(2,6,23,0.24)]">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  Operations And Governance
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Delivery performance, staffing, and operational controls
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  The lower section now keeps execution and governance together
                  so the learner view above stays focused.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-6">
                <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-300">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white">
                        Delivery performance stack
                      </p>
                      <p className="text-sm text-slate-400">
                        Outcome layers for enrollment, assessment, placement,
                        retention, and compliance.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {[
                      {
                        label: "Enrollment Achievement",
                        value: activeCenter.enrollmentAchievement,
                        accentClass: "text-cyan-300",
                        barClass: "bg-cyan-500",
                      },
                      {
                        label: "Assessment Pass Rate",
                        value: activeCenter.assessmentPassRate,
                        accentClass: "text-violet-300",
                        barClass: "bg-violet-500",
                      },
                      {
                        label: "Placement Conversion",
                        value: activeCenter.placementConversion,
                        accentClass: "text-emerald-300",
                        barClass: "bg-emerald-500",
                      },
                      {
                        label: "Retention After 90 Days",
                        value: activeCenter.retentionRate,
                        accentClass: "text-amber-300",
                        barClass: "bg-amber-500",
                      },
                      {
                        label: "Compliance Confidence",
                        value: activeCenter.complianceScore,
                        accentClass: "text-slate-200",
                        barClass: "bg-slate-400",
                      },
                    ].map((signal) => (
                      <SignalMeter
                        key={signal.label}
                        label={signal.label}
                        value={signal.value}
                        accentClass={signal.accentClass}
                        barClass={signal.barClass}
                      />
                    ))}
                  </div>
                </section>

                <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-violet-500/10 p-2 text-violet-300">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white">
                        Workforce deployment
                      </p>
                      <p className="text-sm text-slate-400">
                        Current staffing distribution across execution lanes
                        inside the center.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {activeCenter.staffingPods.map((pod) => (
                      <div
                        key={pod.label}
                        className="rounded-[20px] border border-white/10 bg-black/[0.18] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-xl px-3 py-1 text-xs font-semibold ${pod.panelClass} ${pod.accentClass}`}
                            >
                              {pod.label}
                            </div>
                            <p className="text-sm text-slate-400">
                              {Math.round((pod.value / activeCenter.employees) * 100)}
                              % of center strength
                            </p>
                          </div>
                          <span
                            className={`text-lg font-semibold ${pod.accentClass}`}
                          >
                            {pod.value}
                          </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full ${pod.barClass}`}
                            style={{
                              width: `${Math.round(
                                (pod.value / activeCenter.employees) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="grid gap-6">
                <PreviewPanel
                  title="Key Personnel"
                  caption="Named employees currently anchoring execution inside this center."
                  icon={Users}
                  records={activeCenter.employeeRecords}
                  countLabel={`${activeCenter.employeeRecords.length} profiles`}
                  onViewAll={() =>
                    openDetailPanel({
                      title: "Key Personnel",
                      subtitle: `${activeCenter.name} / ${selectedProject.name}`,
                      icon: Users,
                      accentClass: "text-cyan-300",
                      records: activeCenter.employeeRecords,
                    })
                  }
                />
                <PreviewPanel
                  title="Skill Vertical Coverage"
                  caption="Role demand and learner distribution across job-role lanes."
                  icon={FolderKanban}
                  records={activeCenter.jobRoleRecords}
                  countLabel={`${activeCenter.jobRoleRecords.length} job roles`}
                  onViewAll={() =>
                    openDetailPanel({
                      title: "Skill Vertical Coverage",
                      subtitle: `${activeCenter.name} / ${selectedProject.name}`,
                      icon: FolderKanban,
                      accentClass: "text-violet-300",
                      records: activeCenter.jobRoleRecords,
                    })
                  }
                />
                <PreviewPanel
                  title="Governance Queue"
                  caption="Open issues, infrastructure risks, and operational escalations."
                  icon={CircleAlert}
                  records={activeCenter.grievanceRecords}
                  countLabel={`${activeCenter.grievanceRecords.length} open items`}
                  onViewAll={() =>
                    openDetailPanel({
                      title: "Governance Queue",
                      subtitle: `${activeCenter.name} / ${selectedProject.name}`,
                      icon: CircleAlert,
                      accentClass: "text-amber-300",
                      records: activeCenter.grievanceRecords,
                    })
                  }
                />
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <SlidePanel
        open={detailPanel.isOpen}
        onClose={closeDetailPanel}
        title={detailPanel.title}
        width="lg"
      >
        <div className="flex h-full flex-col bg-[#0a0e17]">
          <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0a0e17] p-6">
            <div className="flex items-start gap-3">
              <div
                className={`rounded-2xl bg-white/[0.04] p-2.5 ${detailPanel.accentClass}`}
              >
                <PanelIcon size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {detailPanel.title}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {detailPanel.subtitle}
                </p>
              </div>
            </div>

            <div className="relative mt-5">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={detailPanel.searchQuery}
                onChange={(event) =>
                  setDetailPanel((currentValue) => ({
                    ...currentValue,
                    searchQuery: event.target.value,
                  }))
                }
                placeholder="Search records..."
                className="w-full rounded-xl border border-white/10 bg-[#0f172a] py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-6 custom-scrollbar">
            {detailRecords.length ? (
              detailRecords.map((record) => (
                <div
                  key={record.id}
                  className="rounded-[22px] border border-white/10 bg-[#111827] p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="text-base font-medium text-white">
                        {record.title}
                      </p>
                      <p className="text-sm text-slate-300">{record.subtitle}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {record.meta}
                      </p>
                    </div>
                    <span
                      className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        record.toneClass || "bg-white/[0.05] text-slate-300"
                      }`}
                    >
                      {record.tag}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {record.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
                <Search size={28} className="text-slate-600" />
                <p className="mt-4 text-base font-medium text-slate-300">
                  No matching records
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Try a different keyword or clear the search box.
                </p>
              </div>
            )}
          </div>
        </div>
      </SlidePanel>
    </div>
  );
}

function PortfolioStatCard({
  label,
  value,
  caption,
  icon: Icon,
  accentClass,
  panelClass,
}) {
  return (
    <div className={`rounded-[22px] border p-5 ${panelClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {label}
          </p>
          <p className={`mt-3 text-3xl font-semibold ${accentClass}`}>{value}</p>
        </div>
        <Icon className={accentClass} size={20} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{caption}</p>
    </div>
  );
}

function SelectionChip({ label, value, onClear }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/[0.06]"
      >
        Change
      </button>
    </div>
  );
}

function GuidedStepSection({ step, title, description, children }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5 border-b border-white/10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
          {step}
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

function ProjectSelectionSpotlight({
  project,
  projectHealthMeta,
  projectStatusMeta,
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.16),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.02))] p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${projectStatusMeta.badgeClass}`}
        >
          {project.status}
        </span>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${projectHealthMeta.badgeClass}`}
        >
          {project.healthScore}% health
        </span>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-semibold text-white">{project.name}</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {project.name} is being delivered under {project.fundingAgency}, with{" "}
          {project.centerCount} center{project.centerCount === 1 ? "" : "s"},{" "}
          {project.totalBatches} active batch
          {project.totalBatches === 1 ? "" : "es"}, and{" "}
          {formatNumber(project.totalCandidates)} learners in motion.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <SmallStat
          label="Placement"
          value={`${project.avgPlacementRate}%`}
        />
        <SmallStat
          label="Attendance"
          value={`${project.avgAttendanceRate}%`}
        />
        <SmallStat
          label="Learners"
          value={formatNumber(project.totalCandidates)}
        />
        <SmallStat
          label="Grievances"
          value={`${project.totalGrievances}`}
        />
      </div>

      <div className="mt-5 rounded-[22px] border border-white/10 bg-black/[0.18] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-300">
              Delivery timeline
            </p>
            <p className="mt-1 text-3xl font-semibold text-white">
              {project.duration.progress}%
            </p>
          </div>
          <div className="text-right text-sm text-slate-400">
            <p>{project.duration.remainingDays} day(s) remaining</p>
            <p>{project.duration.totalDays} total days</p>
          </div>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${projectHealthMeta.barClass}`}
            style={{ width: `${project.duration.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <InsightStatRow
          label="Top center"
          value={project.topCenter?.name || "-"}
          caption={
            project.topCenter
              ? `${project.topCenter.healthScore}% health / ${project.topCenter.placementRate}% placement rate.`
              : "No center benchmark available."
          }
          accentClass="text-emerald-300"
        />
        <InsightStatRow
          label="Watch center"
          value={project.watchCenter?.name || "-"}
          caption={
            project.watchCenter
              ? `${project.watchCenter.grievances} grievance(s) / ${project.watchCenter.riskLabel}.`
              : "No watch center available."
          }
          accentClass="text-amber-300"
        />
      </div>
    </div>
  );
}

function ProjectRailCard({ project, isActive, onClick }) {
  const statusMeta = getStatusMeta(project.status);
  const healthMeta = getHealthMeta(project.healthScore);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[24px] border p-4 text-left transition-all ${
        isActive
          ? "border-violet-500/30 bg-violet-500/10 shadow-[0_12px_30px_rgba(76,29,149,0.14)]"
          : "border-white/10 bg-black/[0.16] hover:border-white/20 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-medium text-white">{project.name}</p>
          <p className="mt-1 text-sm text-slate-400">{project.fundingAgency}</p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
        >
          {project.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <SmallStat label="Centers" value={`${project.centerCount}`} />
        <SmallStat
          label="Learners"
          value={formatNumber(project.totalCandidates)}
        />
        <SmallStat
          label="Placement"
          value={`${project.avgPlacementRate}%`}
        />
        <SmallStat label="Health" value={`${project.healthScore}%`} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Best center
          </p>
          <p className={`mt-1 text-sm font-medium ${healthMeta.accentClass}`}>
            {project.topCenter?.location || "-"}
          </p>
        </div>
        <ChevronRight
          size={16}
          className={isActive ? "text-violet-300" : "text-slate-500"}
        />
      </div>
    </button>
  );
}

function SmallStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-base font-medium text-white">{value}</p>
    </div>
  );
}

function ProjectMetaCard({ icon: Icon, label, value, caption }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white/[0.04] p-2 text-cyan-300">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-base font-medium text-white">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{caption}</p>
        </div>
      </div>
    </div>
  );
}

function HeroSignalCard({
  label,
  value,
  caption,
  icon: Icon,
  accentClass,
  panelClass,
}) {
  return (
    <div className={`rounded-[24px] border p-5 ${panelClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {label}
          </p>
          <p className={`mt-3 text-3xl font-semibold ${accentClass}`}>{value}</p>
        </div>
        <Icon className={accentClass} size={20} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{caption}</p>
    </div>
  );
}

function CenterBenchmarkCard({ center, isActive, onClick }) {
  const healthMeta = getHealthMeta(center.healthScore);
  const riskMeta = getRiskMeta(center.riskLabel);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[24px] border p-5 text-left transition-all ${
        isActive
          ? "border-cyan-500/30 bg-cyan-500/10 shadow-[0_12px_28px_rgba(8,145,178,0.14)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-medium text-white">{center.name}</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
            <MapPin size={14} />
            {center.location}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${healthMeta.badgeClass}`}
        >
          {center.healthScore}%
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <SmallStat label="Attendance" value={`${center.attendanceRate}%`} />
        <SmallStat label="Placement" value={`${center.placementRate}%`} />
        <SmallStat label="Learners" value={formatNumber(center.candidates)} />
        <SmallStat label="Issues" value={`${center.grievances}`} />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Risk posture</span>
          <span className={riskMeta.accentClass}>{center.riskLabel}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${healthMeta.barClass}`}
            style={{ width: `${center.healthScore}%` }}
          />
        </div>
      </div>
    </button>
  );
}

function CenterSwitchRow({ center, isActive, onClick }) {
  const healthMeta = getHealthMeta(center.healthScore);
  const riskMeta = getRiskMeta(center.riskLabel);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[22px] border p-4 text-left transition-all ${
        isActive
          ? "border-cyan-500/30 bg-cyan-500/10 shadow-[0_12px_28px_rgba(8,145,178,0.14)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-medium text-white">{center.name}</p>
          <p className="mt-1 text-sm text-slate-400">
            {center.location} • {center.batchSnapshots.length} batch
            {center.batchSnapshots.length === 1 ? "" : "es"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${healthMeta.badgeClass}`}
          >
            {center.healthScore}%
          </span>
          <ChevronRight
            size={16}
            className={isActive ? "text-cyan-300" : "text-slate-500"}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="rounded-full border border-white/10 bg-black/[0.18] px-3 py-1.5">
          Attendance {center.attendanceRate}%
        </span>
        <span className="rounded-full border border-white/10 bg-black/[0.18] px-3 py-1.5">
          Placement {center.placementRate}%
        </span>
        <span className="rounded-full border border-white/10 bg-black/[0.18] px-3 py-1.5">
          {formatNumber(center.candidates)} learners
        </span>
        <span
          className={`rounded-full border px-3 py-1.5 font-medium ${riskMeta.badgeClass}`}
        >
          {center.riskLabel}
        </span>
      </div>
    </button>
  );
}

function BatchNavigatorCard({ batch, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[22px] border p-4 text-left transition-all ${
        isActive
          ? "border-violet-500/30 bg-violet-500/10 shadow-[0_12px_28px_rgba(109,40,217,0.16)]"
          : "border-white/10 bg-black/[0.18] hover:border-white/20 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-medium text-white">{batch.label}</p>
          <p className="mt-1 text-sm text-slate-400">
            {batch.track} • {batch.mode}
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          {batch.readiness}%
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
          {formatNumber(batch.size)} learners
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
          Attendance {batch.attendanceRate}%
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
          {formatNumber(batch.placedCandidates)} placed
        </span>
      </div>
    </button>
  );
}

function SignalMeter({ label, value, accentClass, barClass }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-300">{label}</p>
        <span className={`text-sm font-semibold ${accentClass}`}>{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function InsightStatRow({ label, value, caption, accentClass }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-black/[0.18] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-xl font-semibold ${accentClass}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{caption}</p>
    </div>
  );
}

function CenterMetricCard({
  label,
  value,
  caption,
  icon: Icon,
  accentClass,
  panelClass,
}) {
  return (
    <div className={`rounded-[22px] border p-5 ${panelClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {label}
          </p>
          <p className={`mt-3 text-3xl font-semibold ${accentClass}`}>{value}</p>
        </div>
        <Icon className={accentClass} size={20} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{caption}</p>
    </div>
  );
}

function InlinePercent({ value, tone = "cyan" }) {
  const toneMap = {
    cyan: "bg-cyan-500/10 text-cyan-300",
    violet: "bg-violet-500/10 text-violet-300",
    emerald: "bg-emerald-500/10 text-emerald-300",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        toneMap[tone] || toneMap.cyan
      }`}
    >
      {value}%
    </span>
  );
}

function StatusBadge({ label, meta }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
      {label}
    </span>
  );
}

function StatusCountPill({ label, count, meta }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${meta.badgeClass}`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
      <span>{label}</span>
      <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] text-current">
        {count}
      </span>
    </span>
  );
}

function PreviewPanel({
  title,
  caption,
  icon: Icon,
  records,
  countLabel,
  onViewAll,
}) {
  const previewRecords = records.slice(0, 3);

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white/[0.04] p-2 text-cyan-300">
            <Icon size={18} />
          </div>
          <div>
            <p className="text-lg font-medium text-white">{title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{caption}</p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
          {countLabel}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {previewRecords.map((record) => (
          <div
            key={record.id}
            className="rounded-[20px] border border-white/10 bg-black/[0.18] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{record.title}</p>
                <p className="mt-1 text-sm text-slate-300">{record.subtitle}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  record.toneClass || "bg-white/[0.05] text-slate-300"
                }`}
              >
                {record.tag}
              </span>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
              {record.meta}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onViewAll}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
      >
        Open Detail View
        <ExternalLink size={15} />
      </button>
    </div>
  );
}
