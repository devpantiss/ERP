import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  CalendarRange,
  ChevronDown,
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
  BookOpen,
  Briefcase,
  FileDown,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Download,
} from "lucide-react";
import { PROJECT_REPORTS } from "./adminPortalData";
import SlidePanel from "../../components/common/SlidePanel";
import TableExportActions from "../../components/common/TableExportActions";

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

const COMPANY_NAMES = [
  "Tata Steel",
  "Jindal Steel & Power",
  "L&T Construction",
  "Tech Mahindra",
  "Vedanta Resources",
  "NALCO",
  "Hindalco Industries",
  "Adani Group",
  "JSW Steel",
  "Infosys BPO",
  "Wipro Consumer",
  "SAIL Rourkela",
  "NTPC",
  "Bharat Forge",
  "Reliance Industries",
];

const DESIGNATIONS = [
  "Junior Technician",
  "Trainee Electrician",
  "Welding Operator",
  "Solar Panel Installer",
  "Plant Operator",
  "Sales Associate",
  "Data Entry Operator",
  "Hospitality Attendant",
  "Fitter Trainee",
  "General Duty Assistant",
  "Machine Operator",
  "Quality Inspector",
  "Site Supervisor Trainee",
  "Customer Service Rep",
  "Retail Floor Executive",
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
      barClass: "from-emerald-500 to-violet-400",
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
      badgeClass: "border-violet-500/20 bg-violet-500/10 text-violet-300",
      toneClass: "bg-violet-500/10 text-violet-300",
      dotClass: "bg-violet-400",
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
      badgeClass: "border-violet-500/20 bg-violet-500/10 text-violet-300",
      toneClass: "bg-violet-500/10 text-violet-300",
      dotClass: "bg-violet-400",
    };
  }

  return {
    badgeClass: "border-slate-500/20 bg-slate-500/10 text-slate-300",
    toneClass: "bg-slate-500/10 text-slate-300",
    dotClass: "bg-slate-400",
  };
};

const PROJECT_GALLERY_ASSETS = [
  {
    src: "/images/client-gallery/1.png",
    title: "Enrollment documentation",
    category: "Enrollment",
    stage: "Mobilization",
  },
  {
    src: "/images/client-gallery/2.png",
    title: "Classroom delivery",
    category: "Training",
    stage: "Learning",
  },
  {
    src: "/images/client-gallery/3.png",
    title: "Practical lab session",
    category: "Training",
    stage: "Assessment",
  },
  {
    src: "/images/client-gallery/4.png",
    title: "Candidate counselling",
    category: "Enrollment",
    stage: "Verification",
  },
  {
    src: "/images/client-gallery/5.png",
    title: "Employer connect",
    category: "Placements",
    stage: "Interview",
  },
  {
    src: "/images/client-gallery/6.png",
    title: "Certification review",
    category: "Compliance",
    stage: "Evidence",
  },
  {
    src: "/images/client-gallery/7.png",
    title: "Placement readiness",
    category: "Placements",
    stage: "Readiness",
  },
  {
    src: "/images/client-gallery/9.png",
    title: "Center operations",
    category: "Compliance",
    stage: "Monitoring",
  },
];

const buildProjectGalleryItems = (project, center, selectedBatch) =>
  PROJECT_GALLERY_ASSETS.map((asset, index) => ({
    ...asset,
    id: `${center.id}-${selectedBatch?.id || "all"}-gallery-${index}`,
    projectName: project.name,
    centerName: center.name,
    batchLabel: selectedBatch?.label || "All batches",
    location: center.location,
    capturedBy:
      index % 3 === 0
        ? center.manager
        : index % 3 === 1
          ? "Training team"
          : "MIS and placement team",
    capturedOn: formatDate(
      new Date(
        2026,
        (index + center.name.length) % 12,
        4 + ((index * 3 + center.location.length) % 21)
      )
        .toISOString()
        .slice(0, 10)
    ),
  }));

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
        placementReadiness >= 82 &&
        learnerIndex < Math.max(Math.round(mappedCandidates * 0.58), Math.round(parsed.size * 0.18))
      ) {
        placementStatus = "Placed";
      } else if (
        placementReadiness >= 72 &&
        learnerIndex < Math.round(mappedCandidates * 0.82)
      ) {
        placementStatus = "Interview Scheduled";
      } else if (
        placementReadiness >= 60 &&
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

      const totalTrainingDays = clamp(42 + (learnerIndex % 9) * 6, 42, 120);
      const completedTrainingDays = clamp(
        Math.round((trainingProgress / 100) * totalTrainingDays),
        0,
        totalTrainingDays
      );
      const totalTheoryHours = clamp(
        Math.round(completedTrainingDays * 3.2 + (learnerIndex % 5) * 4),
        0,
        Math.round(totalTrainingDays * 3.5)
      );
      const totalPracticalHours = clamp(
        Math.round(completedTrainingDays * 4.8 + (learnerIndex % 7) * 3),
        0,
        Math.round(totalTrainingDays * 5.2)
      );

      const placementSeed =
        center.name.length * 7 + index * 13 + learnerIndex * 19;
      const company =
        COMPANY_NAMES[placementSeed % COMPANY_NAMES.length];
      const designation =
        DESIGNATIONS[(placementSeed + 3) % DESIGNATIONS.length];
      const salary =
        placementStatus === "Placed"
          ? (10000 + ((placementSeed * 137) % 15000)) * 1
          : 0;
      const joiningDateOffset = 14 + (placementSeed % 30);
      const joiningDate =
        placementStatus === "Placed"
          ? new Date(
              Date.now() - joiningDateOffset * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0]
          : null;
      const hasOfferLetter = placementStatus === "Placed";
      const monthsWorked =
        placementStatus === "Placed" ? Math.min(3, Math.floor(joiningDateOffset / 30) + 1) : 0;
      const hasM1 = monthsWorked >= 1;
      const hasM2 = monthsWorked >= 2;
      const hasM3 = monthsWorked >= 3;
      const hasBankStatement = placementStatus === "Placed" && learnerIndex % 3 !== 2;
      const isVerified = placementStatus === "Placed" && learnerIndex % 4 !== 3;

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
        phone: `+91 98${String(70000000 + placementSeed + learnerIndex).slice(-8)}`,
        mobilizer: ["Priya Mishra", "Vikram Singh", "Rajan Nayak", "Sunita Patra"][
          (placementSeed + learnerIndex) % 4
        ],
        enrollmentDate: new Date(
          Date.now() - (22 + learnerIndex + index * 3) * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        enrollmentStatus:
          learnerIndex % 7 === 0
            ? "Pending"
            : learnerIndex % 11 === 0
            ? "Rejected"
            : "Approved",
        attendanceRate: attendanceScore,
        trainingProgress,
        trainingStatus,
        placementReadiness,
        placementStatus,
        nextMilestone,
        trainingMeta,
        placementMeta,
        totalTrainingDays,
        completedTrainingDays,
        totalTheoryHours,
        totalPracticalHours,
        company,
        designation,
        salary,
        joiningDate,
        hasOfferLetter,
        hasM1,
        hasM2,
        hasM3,
        hasBankStatement,
        isVerified,
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
      accentClass: "text-violet-300",
      panelClass: "bg-violet-500/10",
      barClass: "bg-violet-500",
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
    toneClass: "bg-violet-500/10 text-violet-300",
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
        ? "bg-violet-500/10 text-violet-300"
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
          accentClass: "text-violet-300",
          barClass: "bg-violet-500",
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
    setSelectedBatchId("");
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
    <EnterpriseProjectDashboard
      portfolio={portfolio}
      projectSnapshots={projectSnapshots}
      selectedProject={selectedProject}
      activeCenter={activeCenter}
      selectedBatch={selectedBatch}
      rankedCenters={rankedCenters}
      onProjectSelect={handleProjectSelect}
      onCenterSelect={handleCenterSelect}
      onBatchSelect={setSelectedBatchId}
      onBack={handleBack}
      onResetProject={() => {
        setSelectedProjectId("");
        setSelectedCenterId("");
        setSelectedBatchId("");
      }}
      onResetCenter={() => {
        setSelectedCenterId("");
        setSelectedBatchId("");
      }}
    />
  );

  return (
    <div className="admin-project-details space-y-8 text-white">
      <header className="admin-project-hero rounded-[28px] border border-white/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] lg:p-7">
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1.12fr)_minmax(380px,0.88fr)]">
          <div className="flex min-h-full flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="admin-project-kicker inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-200">
                <FolderKanban size={14} />
                Project Details / Reports
              </div>
              <div className="space-y-3">
                <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-white md:text-5xl md:leading-[1.05]">
                  Project intelligence for execution, governance, and learner outcomes.
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base md:leading-7">
                  A focused command surface for portfolio health, center performance,
                  batch movement, staffing, learner progress, and governance risk.
                </p>
              </div>
            </div>

            <ProjectWorkflowStepper currentStep={currentStep} />
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
              accentClass="text-fuchsia-200"
              panelClass="border-white/10 bg-white/[0.035]"
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

      <section className="admin-project-section rounded-[28px] border border-white/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.26)] lg:p-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="admin-project-kicker text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-300">
              Guided Workflow
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Select project first, then center, then review performance
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Start with the program portfolio, narrow into a center, then review
              the operating metrics, learner movement, and governance signals.
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
          <section className="admin-project-focus rounded-[28px] border border-white/10 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.3)] lg:p-7">
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
                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
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
                    {selectedProject.name}. Key delivery signals, batch flow,
                    staffing, and risk posture are consolidated below.
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
                  <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,_rgba(24,24,27,0.94),_rgba(10,10,12,0.96))] p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-300">
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
            <section className="admin-project-section rounded-[28px] border border-white/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.26)] lg:p-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="rounded-2xl bg-violet-500/10 p-2 text-violet-300">
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

            <section className="admin-project-section rounded-[28px] border border-white/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.26)] lg:p-6">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-300">
                    Center Switchboard
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    Compare or switch centers without leaving the details view
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    Switch between centers in the selected project while keeping
                    health, attendance, placement, and risk context visible.
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

          <section className="admin-project-section rounded-[28px] border border-white/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.26)] lg:p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-300">
                  Batch And Learner Clarity
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Batch details and candidate roster for the selected center
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  Select a batch to inspect candidate readiness, training status,
                  placement movement, and the next milestone for each learner.
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
                      <div className="rounded-2xl bg-violet-500/10 p-2 text-violet-300">
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
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-300">
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
                            accentClass: "text-violet-300",
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

          <section className="admin-project-section rounded-[28px] border border-white/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.26)] lg:p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-300">
                  Operations And Governance
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Delivery performance, staffing, and operational controls
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Delivery metrics, staffing distribution, personnel, job-role
                  coverage, and open governance items for the selected center.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-6">
                <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-violet-500/10 p-2 text-violet-300">
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
                        accentClass: "text-violet-300",
                        barClass: "bg-violet-500",
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
                      accentClass: "text-violet-300",
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

function EnterpriseProjectDashboard({
  portfolio,
  projectSnapshots,
  selectedProject,
  activeCenter,
  selectedBatch,
  rankedCenters,
  onProjectSelect,
  onCenterSelect,
  onBatchSelect,
  onBack,
  onResetProject,
  onResetCenter,
}) {
  const mode = !selectedProject ? "Portfolio" : !activeCenter ? "Project" : "Center";

  return (
    <div className="enterprise-project-page space-y-6 text-white">
      <section className="enterprise-project-shell rounded-[28px] border border-white/10 p-6 lg:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200">
              <FolderKanban size={14} />
              Enterprise Project Dashboard
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl md:leading-[1.05]">
              Project details, simplified for operating decisions.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base md:leading-7">
              Move from portfolio health to project execution to center-level
              delivery without losing context.
            </p>
          </div>

          <div className="grid min-w-full gap-3 sm:grid-cols-3 lg:min-w-[460px]">
            <EnterpriseMetric label="Mode" value={mode} caption="Current view" />
            <EnterpriseMetric
              label="Live Programs"
              value={`${portfolio.activeProjects}/${portfolio.projects}`}
              caption="Active portfolio"
            />
            <EnterpriseMetric
              label="Health"
              value={`${portfolio.avgHealthScore}%`}
              caption="Portfolio average"
            />
          </div>
        </div>

      </section>

      {!selectedProject ? (
        <EnterprisePortfolioView
          projects={projectSnapshots}
          onProjectSelect={onProjectSelect}
        />
      ) : !activeCenter ? (
        <EnterpriseProjectView
          project={selectedProject}
          centers={rankedCenters}
          onBack={onBack}
          onCenterSelect={onCenterSelect}
        />
      ) : (
        <EnterpriseCenterView
          project={selectedProject}
          center={activeCenter}
          centers={rankedCenters}
          selectedBatch={selectedBatch}
          onBack={onBack}
          onCenterSelect={onCenterSelect}
          onBatchSelect={onBatchSelect}
        />
      )}
    </div>
  );
}

function EnterprisePortfolioView({ projects, onProjectSelect }) {
  return (
    <div className="space-y-6">
      <section className="enterprise-project-shell rounded-[26px] border border-white/10 p-5">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Projects</h2>
            <p className="mt-1 text-sm text-slate-400">
              Select one project to inspect centers, batches, and delivery health.
            </p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-[20px] border border-white/10">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Centers</th>
                <th className="px-4 py-3 font-medium">Learners</th>
                <th className="px-4 py-3 font-medium">Placement</th>
                <th className="px-4 py-3 font-medium">Health</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {projects.map((project) => (
                <tr key={project.id} className="transition hover:bg-violet-500/[0.06]">
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{project.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{project.fundingAgency}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{project.centerCount}</td>
                  <td className="px-4 py-4 text-slate-300">{formatNumber(project.totalCandidates)}</td>
                  <td className="px-4 py-4 text-slate-300">{project.avgPlacementRate}%</td>
                  <td className="px-4 py-4">
                    <InlineHealth value={project.healthScore} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onProjectSelect(project.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-400"
                    >
                      Open
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function EnterpriseProjectView({ project, centers, onBack, onCenterSelect }) {
  return (
    <div className="space-y-6">
      <section className="enterprise-project-shell rounded-[26px] border border-white/10 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to portfolio
            </button>
            <h2 className="text-3xl font-semibold text-white">{project.name}</h2>
            <p className="mt-2 text-sm text-slate-400">
              {project.fundingAgency} • {formatDate(project.startDate)} to {formatDate(project.endDate)}
            </p>
          </div>
          <InlineHealth value={project.healthScore} label="Project health" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <EnterpriseMetric label="Centers" value={project.centerCount} caption="Delivery locations" />
          <EnterpriseMetric label="Batches" value={project.totalBatches} caption="Active cohorts" />
          <EnterpriseMetric label="Learners" value={formatNumber(project.totalCandidates)} caption="In motion" />
          <EnterpriseMetric label="Placement" value={`${project.avgPlacementRate}%`} caption="Conversion" tone="emerald" />
        </div>
      </section>

      <section className="enterprise-project-shell rounded-[26px] border border-white/10 p-5">
        <h3 className="text-2xl font-semibold text-white">Centers</h3>
        <p className="mt-1 text-sm text-slate-400">
          Choose a center to open the operating dashboard.
        </p>
        <EnterpriseCenterTable centers={centers} onCenterSelect={onCenterSelect} />
      </section>
    </div>
  );
}

function EnterpriseCenterView({
  project,
  center,
  centers,
  selectedBatch,
  onBack,
  onCenterSelect,
  onBatchSelect,
}) {
  const galleryItems = useMemo(
    () => buildProjectGalleryItems(project, center, selectedBatch),
    [project, center, selectedBatch]
  );

  return (
    <div className="space-y-6">
      <section className="enterprise-project-shell rounded-[26px] border border-white/10 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to centers
            </button>
            <h2 className="text-3xl font-semibold text-white">{center.name}</h2>
            <p className="mt-2 text-sm text-slate-400">
              {project.name} • Managed by {center.manager}
            </p>
          </div>
          <InlineHealth value={center.healthScore} label="Center health" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <EnterpriseMetric label="Learners" value={formatNumber(center.candidates)} caption="Current center" />
          <EnterpriseMetric label="Attendance" value={`${center.attendanceRate}%`} caption="Average" />
          <EnterpriseMetric label="Placement" value={`${center.placementRate}%`} caption="Conversion" tone="emerald" />
          <EnterpriseMetric label="Compliance" value={`${center.complianceScore}%`} caption="Confidence" />
          <EnterpriseMetric label="Issues" value={center.grievances} caption={center.riskLabel} tone="amber" />
        </div>
      </section>

      {selectedBatch ? (
        <CandidateRosterTabs
          selectedBatch={selectedBatch}
          project={project}
          center={center}
          centers={centers}
          batches={center.batchSnapshots}
          onCenterSelect={onCenterSelect}
          onBatchSelect={onBatchSelect}
        />
      ) : null}

      <ProjectGallerySection
        items={galleryItems}
        project={project}
        center={center}
        selectedBatch={selectedBatch}
      />

    </div>
  );
}

function ProjectGallerySection({ items, project, center, selectedBatch }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [previewItem, setPreviewItem] = useState(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.category)))],
    [items]
  );
  const visibleItems = useMemo(
    () =>
      activeCategory === "All"
        ? items
        : items.filter((item) => item.category === activeCategory),
    [activeCategory, items]
  );

  return (
    <section className="enterprise-project-shell rounded-[26px] border border-white/10 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
            <Sparkles size={14} />
            Project gallery
          </div>
          <h3 className="mt-3 text-xl font-semibold text-white">Report Evidence Gallery</h3>
          <p className="mt-1 text-sm text-slate-400">
            {project.name} • {center.name}
            {selectedBatch ? ` • ${selectedBatch.label}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                activeCategory === category
                  ? "border-violet-400/40 bg-violet-500 text-white"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid auto-rows-[190px] gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPreviewItem(item)}
            className={`group relative overflow-hidden rounded-[20px] border border-white/10 bg-slate-950 text-left shadow-[0_18px_50px_rgba(2,6,23,0.28)] transition hover:-translate-y-0.5 hover:border-violet-400/40 ${
              index === 0 ? "md:col-span-2 md:row-span-2" : ""
            }`}
          >
            <img
              src={item.src}
              alt={`${item.title} for ${item.centerName}`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <span className="absolute left-3 top-3 rounded-full border border-black/20 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {item.category}
            </span>
            <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
              <Eye size={15} />
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs text-slate-300">
                {item.stage} • {item.capturedOn}
              </p>
            </div>
          </button>
        ))}
      </div>

      <GalleryImageModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </section>
  );
}

function GalleryImageModal({ item, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!item) {
      setVisible(false);
      return undefined;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!item || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end" onClick={onClose}>
      <div
        className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative flex h-full w-full max-w-[560px] flex-col border-l border-violet-500/25 bg-[#080d1a] text-white shadow-[-24px_0_70px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0b1220] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-500/10 text-violet-200">
              <Eye size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {item.projectName} • {item.centerName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={item.src}
              download
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-xs font-semibold text-slate-200 transition hover:border-violet-400/35 hover:bg-violet-500/15 hover:text-white"
            >
              <Download size={14} />
              Download
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-slate-400 transition hover:bg-white/[0.1] hover:text-white"
              aria-label="Close gallery preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-white/10 bg-[#0b1220] px-5 py-2.5">
          <span className="rounded-md border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
            {item.category}
          </span>
          <span className="text-xs text-slate-600">•</span>
          <span className="text-xs font-medium text-slate-400">{item.stage}</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#070b16]">
          <div className="p-5">
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-white/10 bg-black/25 p-3">
              <img
                src={item.src}
                alt={`${item.title} preview`}
                className="max-h-[52vh] w-auto max-w-full rounded-lg object-contain shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#080d1a] p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <GalleryMetaRow label="Captured on" value={item.capturedOn} />
              <GalleryMetaRow label="Batch" value={item.batchLabel} />
              <GalleryMetaRow label="Location" value={item.location} />
              <GalleryMetaRow label="Captured by" value={item.capturedBy} />
              <GalleryMetaRow label="Project" value={item.projectName} />
              <GalleryMetaRow label="Center" value={item.centerName} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 bg-[#0b1220] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1] hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function GalleryMetaRow({ label, value }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function EnterpriseCenterTable({ centers, onCenterSelect }) {
  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Center</th>
            <th className="px-4 py-3 font-medium">Batches</th>
            <th className="px-4 py-3 font-medium">Learners</th>
            <th className="px-4 py-3 font-medium">Attendance</th>
            <th className="px-4 py-3 font-medium">Risk</th>
            <th className="px-4 py-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {centers.map((center) => (
            <tr key={center.id} className="transition hover:bg-violet-500/[0.06]">
              <td className="px-4 py-4">
                <p className="font-medium text-white">{center.name}</p>
                <p className="mt-1 text-xs text-slate-500">{center.location}</p>
              </td>
              <td className="px-4 py-4 text-slate-300">{center.batchSnapshots.length}</td>
              <td className="px-4 py-4 text-slate-300">{formatNumber(center.candidates)}</td>
              <td className="px-4 py-4 text-slate-300">{center.attendanceRate}%</td>
              <td className="px-4 py-4">
                <span className={`rounded-full border px-2.5 py-1 text-xs ${getRiskMeta(center.riskLabel).badgeClass}`}>
                  {center.riskLabel}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onCenterSelect(center.id)}
                  className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-400"
                >
                  Open
                  <ChevronRight size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function EnterpriseBatchTable({ batches, selectedBatch, onBatchSelect }) {
  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Batch</th>
            <th className="px-4 py-3 font-medium">Learners</th>
            <th className="px-4 py-3 font-medium">Attendance</th>
            <th className="px-4 py-3 font-medium">Readiness</th>
            <th className="px-4 py-3 font-medium">Placed</th>
            <th className="px-4 py-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {batches.map((batch) => (
            <tr
              key={batch.id}
              className={`transition ${
                selectedBatch?.id === batch.id ? "bg-violet-500/10" : "hover:bg-violet-500/[0.06]"
              }`}
            >
              <td className="px-4 py-4">
                <p className="font-medium text-white">{batch.label}</p>
                <p className="mt-1 text-xs text-slate-500">{batch.track} • {batch.mode}</p>
              </td>
              <td className="px-4 py-4 text-slate-300">{formatNumber(batch.size)}</td>
              <td className="px-4 py-4 text-slate-300">{batch.attendanceRate}%</td>
              <td className="px-4 py-4"><InlineHealth value={batch.readiness} /></td>
              <td className="px-4 py-4 text-slate-300">{formatNumber(batch.placedCandidates)}</td>
              <td className="px-4 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onBatchSelect(batch.id)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CandidateRosterTabs({
  selectedBatch,
  project,
  center,
  centers,
  batches,
  onCenterSelect,
  onBatchSelect,
}) {
  const [activeTab, setActiveTab] = useState("training");
  const [verificationState, setVerificationState] = useState(() => {
    const initial = {};
    selectedBatch.candidateRecords.forEach((c) => {
      initial[c.id] = c.isVerified;
    });
    return initial;
  });
  const [enrollmentState, setEnrollmentState] = useState(() => {
    const initial = {};
    selectedBatch.candidateRecords.forEach((c) => {
      initial[c.id] = c.enrollmentStatus;
    });
    return initial;
  });

  useEffect(() => {
    const initial = {};
    const enrollmentInitial = {};
    selectedBatch.candidateRecords.forEach((c) => {
      initial[c.id] = c.isVerified;
      enrollmentInitial[c.id] = c.enrollmentStatus;
    });
    setVerificationState(initial);
    setEnrollmentState(enrollmentInitial);
  }, [selectedBatch]);

  const toggleVerification = (candidateId) => {
    setVerificationState((prev) => ({
      ...prev,
      [candidateId]: !prev[candidateId],
    }));
  };
  const updateEnrollmentStatus = (candidateId, status) => {
    setEnrollmentState((prev) => ({
      ...prev,
      [candidateId]: status,
    }));
  };

  const tabs = [
    { key: "enrollment", label: "Enrollment", icon: FileText },
    { key: "training", label: "Training Detail", icon: BookOpen },
    { key: "placements", label: "Placements", icon: Briefcase },
  ];
  const pendingEnrollments = selectedBatch.candidateRecords.filter(
    (candidate) => enrollmentState[candidate.id] === "Pending"
  ).length;

  return (
    <section className="enterprise-project-shell rounded-[26px] border border-white/10 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Candidate Roster</h3>
          <p className="mt-1 text-sm text-slate-400">
            {selectedBatch.candidateRecords.length} candidates in{" "}
            {selectedBatch.label}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-right">
          <EnterpriseMiniStat
            label="Pending"
            value={pendingEnrollments}
          />
          <EnterpriseMiniStat
            label="Placed"
            value={selectedBatch.placedCandidates}
          />
          <EnterpriseMiniStat
            label="Risk"
            value={selectedBatch.riskCount}
          />
        </div>
      </div>

      {/* Selectors row: center + batch dropdowns | tab pills */}
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: center & batch selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Center selector */}
          <div className="relative">
            <MapPin
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-violet-400"
            />
            <select
              value={center.id}
              onChange={(e) => onCenterSelect(e.target.value)}
              className="h-9 appearance-none rounded-xl border border-white/10 bg-white/[0.05] py-1.5 pl-8 pr-9 text-sm font-medium text-white outline-none transition hover:border-violet-400/30 hover:bg-white/[0.08] focus:border-violet-400/40 focus:ring-1 focus:ring-violet-500/30"
            >
              {centers.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  className="bg-[#0f172a] text-white"
                >
                  {c.location}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>

          {/* Batch selector */}
          <div className="relative">
            <GraduationCap
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400"
            />
            <select
              value={selectedBatch.id}
              onChange={(e) => onBatchSelect(e.target.value)}
              className="h-9 appearance-none rounded-xl border border-white/10 bg-white/[0.05] py-1.5 pl-8 pr-9 text-sm font-medium text-white outline-none transition hover:border-violet-400/30 hover:bg-white/[0.08] focus:border-violet-400/40 focus:ring-1 focus:ring-violet-500/30"
            >
              {batches.map((b) => (
                <option
                  key={b.id}
                  value={b.id}
                  className="bg-[#0f172a] text-white"
                >
                  {b.label} — {b.size} learners
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden h-7 w-px bg-white/10 md:block" />

        {/* Right: tab pills */}
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-violet-400/30 bg-violet-500/15 text-violet-200 shadow-[0_0_20px_rgba(124,58,237,0.12)]"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                }`}
              >
                <TabIcon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "enrollment" ? (
        <EnrollmentApprovalTable
          candidates={selectedBatch.candidateRecords}
          project={project}
          center={center}
          batchLabel={selectedBatch.label}
          enrollmentState={enrollmentState}
          onUpdateEnrollmentStatus={updateEnrollmentStatus}
        />
      ) : activeTab === "training" ? (
        <TrainingDetailTable
          candidates={selectedBatch.candidateRecords}
          project={project}
          batchLabel={selectedBatch.label}
        />
      ) : (
        <PlacementsTable
          candidates={selectedBatch.candidateRecords}
          project={project}
          batchLabel={selectedBatch.label}
          verificationState={verificationState}
          onToggleVerification={toggleVerification}
        />
      )}
    </section>
  );
}

function TableToolbar({
  children,
  onClear,
  onSearchChange,
  resultCount,
  searchPlaceholder,
  searchTerm,
}) {
  return (
    <div className="border-b border-white/10 bg-[#0b1220]/80 p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/40 focus:ring-1 focus:ring-violet-500/30"
            />
          </div>
          {children}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {formatNumber(resultCount)} rows
          </span>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-violet-400/30 hover:text-slate-200"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, onChange, options, value }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-[150px] rounded-xl border border-white/10 bg-[#111827] px-3 text-sm font-medium text-slate-200 outline-none transition hover:border-violet-400/30 focus:border-violet-400/40 focus:ring-1 focus:ring-violet-500/30"
    >
      <option value="">{label}</option>
      {options.map((option) => {
        const optionValue = typeof option === "string" ? option : option.value;
        const optionLabel = typeof option === "string" ? option : option.label;
        return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        );
      })}
    </select>
  );
}

function TrainingDetailTable({ candidates, project, batchLabel }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const roleOptions = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.jobRole))).sort(),
    [candidates]
  );
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.candidateCode.toLowerCase().includes(query) ||
        candidate.jobRole.toLowerCase().includes(query);
      const matchesStatus = !statusFilter || candidate.trainingStatus === statusFilter;
      const matchesRole = !roleFilter || candidate.jobRole === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [candidates, searchTerm, statusFilter, roleFilter]);
  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Name" },
      { key: "candidateCode", header: "Candidate Code" },
      { key: "projectName", header: "Project", exportValue: () => project.name },
      { key: "batchLabel", header: "Batch", exportValue: () => batchLabel },
      { key: "jobRole", header: "Job Role" },
      { key: "trainingStatus", header: "Training Status" },
      { key: "completedTrainingDays", header: "Completed Days", type: "number" },
      { key: "totalTrainingDays", header: "Total Days", type: "number" },
      { key: "trainingProgress", header: "Progress %", type: "number" },
      { key: "totalTheoryHours", header: "Theory Hours", type: "number" },
      { key: "totalPracticalHours", header: "Practical Hours", type: "number" },
      { key: "attendanceRate", header: "Attendance %", type: "number" },
    ],
    [project.name, batchLabel]
  );

  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search training candidates..."
        resultCount={filteredCandidates.length}
        onClear={() => {
          setSearchTerm("");
          setStatusFilter("");
          setRoleFilter("");
        }}
      >
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={TRAINING_STATUS_ORDER} />
        <FilterSelect label="Job Role" value={roleFilter} onChange={setRoleFilter} options={roleOptions} />
        <TableExportActions
          moduleName="Training Detail"
          fileName="training_detail"
          columns={exportColumns}
          rows={filteredCandidates}
          company={{ name: "Pantiss ERP", logo: "/activity.png" }}
        />
      </TableToolbar>
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Job Role</th>
              <th className="px-4 py-3 font-medium">Duration Received</th>
              <th className="px-4 py-3 font-medium">Theory Hours</th>
              <th className="px-4 py-3 font-medium">Practical Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredCandidates.map((candidate) => (
              <tr
                key={candidate.id}
                className="align-top transition hover:bg-violet-500/[0.06]"
              >
                <td className="px-4 py-4">
                  <p className="font-medium text-white">{candidate.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {candidate.candidateCode}
                  </p>
                </td>
                <td className="px-4 py-4 text-slate-300">{project.name}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
                    {batchLabel}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-300">
                  {candidate.jobRole}
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-white">
                      {candidate.completedTrainingDays} days
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      of {candidate.totalTrainingDays} days total
                    </p>
                    <div className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                        style={{
                          width: `${Math.round(
                            (candidate.completedTrainingDays /
                              candidate.totalTrainingDays) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300">
                    <BookOpen size={12} />
                    {candidate.totalTheoryHours} hrs
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                    <Target size={12} />
                    {candidate.totalPracticalHours} hrs
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EnrollmentApprovalTable({
  candidates,
  project,
  center,
  batchLabel,
  enrollmentState,
  onUpdateEnrollmentStatus,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const roleOptions = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.jobRole))).sort(),
    [candidates]
  );
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const status = enrollmentState[candidate.id] || candidate.enrollmentStatus;
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.candidateCode.toLowerCase().includes(query) ||
        candidate.phone.toLowerCase().includes(query) ||
        candidate.mobilizer.toLowerCase().includes(query);
      const matchesStatus = !statusFilter || status === statusFilter;
      const matchesRole = !roleFilter || candidate.jobRole === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [candidates, enrollmentState, searchTerm, statusFilter, roleFilter]);
  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Candidate" },
      { key: "candidateCode", header: "Candidate Code" },
      { key: "phone", header: "Phone" },
      { key: "mobilizer", header: "Mobilizer" },
      { key: "projectName", header: "Project", exportValue: () => project.name },
      { key: "centerName", header: "Center", exportValue: () => center.name },
      { key: "batchLabel", header: "Batch", exportValue: () => batchLabel },
      { key: "jobRole", header: "Job Role" },
      { key: "enrollmentDate", header: "Enrolled On", type: "date" },
      {
        key: "enrollmentStatus",
        header: "Status",
        exportValue: (candidate) => enrollmentState[candidate.id] || candidate.enrollmentStatus,
      },
    ],
    [project.name, center.name, batchLabel, enrollmentState]
  );

  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search enrollment candidates..."
        resultCount={filteredCandidates.length}
        onClear={() => {
          setSearchTerm("");
          setStatusFilter("");
          setRoleFilter("");
        }}
      >
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["Pending", "Approved", "Rejected"]} />
        <FilterSelect label="Job Role" value={roleFilter} onChange={setRoleFilter} options={roleOptions} />
        <TableExportActions
          moduleName="Enrollment"
          fileName="enrollment_report"
          columns={exportColumns}
          rows={filteredCandidates}
          company={{ name: "Pantiss ERP", logo: "/activity.png" }}
        />
      </TableToolbar>
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Candidate</th>
              <th className="px-4 py-3 font-medium">Mobilizer</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Center</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Job Role</th>
              <th className="px-4 py-3 font-medium">Enrolled On</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredCandidates.map((candidate) => {
              const status = enrollmentState[candidate.id] || candidate.enrollmentStatus;
              return (
                <tr key={candidate.id} className="align-top transition hover:bg-violet-500/[0.06]">
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{candidate.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {candidate.candidateCode} • {candidate.phone}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{candidate.mobilizer}</td>
                  <td className="px-4 py-4 text-slate-300">{project.name}</td>
                  <td className="px-4 py-4 text-slate-300">{center.name}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
                      {batchLabel}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{candidate.jobRole}</td>
                  <td className="px-4 py-4 text-slate-300">{candidate.enrollmentDate}</td>
                  <td className="px-4 py-4">
                    <EnrollmentStatusBadge status={status} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    {status === "Pending" ? (
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateEnrollmentStatus(candidate.id, "Approved")}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          <CheckCircle size={13} />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateEnrollmentStatus(candidate.id, "Rejected")}
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Reviewed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EnrollmentStatusBadge({ status }) {
  const styles = {
    Approved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    Rejected: "border-red-500/20 bg-red-500/10 text-red-300",
    Pending: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.Pending}`}>
      {status || "Pending"}
    </span>
  );
}

function DocBadge({ available, label, onClick }) {
  if (!available) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/20 bg-slate-500/10 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
        <XCircle size={10} />
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 transition hover:border-emerald-400/40 hover:bg-emerald-500/20 hover:shadow-[0_0_12px_rgba(52,211,153,0.12)]"
    >
      <Eye size={10} className="opacity-70 transition group-hover:opacity-100" />
      {label}
    </button>
  );
}

function DocumentPreviewModal({ isOpen, onClose, documentInfo }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen || !documentInfo) return null;

  const { type, label, candidateName, candidateCode, company, salary, joiningDate } = documentInfo;

  const docMeta = {
    offer: { title: "Offer Letter", fileType: "PDF", icon: "📄", color: "violet" },
    m1: { title: "Month 1 Salary Slip", fileType: "PDF", icon: "📋", color: "blue" },
    m2: { title: "Month 2 Salary Slip", fileType: "PDF", icon: "📋", color: "blue" },
    m3: { title: "Month 3 Salary Slip", fileType: "PDF", icon: "📋", color: "blue" },
    bank: { title: "Bank Statement", fileType: "Image", icon: "🏦", color: "amber" },
  }[type] || { title: label, fileType: "PDF", icon: "📄", color: "violet" };

  const colorAccent = {
    violet: "border-violet-500/30",
    blue: "border-blue-500/30",
    amber: "border-amber-500/30",
  }[docMeta.color] || "border-violet-500/30";

  return (
    <div className="fixed inset-0 z-[9999] flex" onClick={onClose}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Right-side slide panel */}
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col border-l ${colorAccent} bg-[#0a0f1e] shadow-[-20px_0_60px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-lg">
              {docMeta.icon}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{docMeta.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {candidateName} • {candidateCode}
              </p>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.1] hover:text-white"
            >
              <Download size={12} />
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/[0.05] p-1.5 text-slate-400 transition hover:bg-white/[0.1] hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* File type badge */}
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-2.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold text-slate-400">
            <FileText size={10} />
            {docMeta.fileType}
          </span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-500">{company}</span>
        </div>

        {/* Scrollable preview content */}
        <div className="flex-1 overflow-auto">
          <div className="p-5">
            {type === "offer" ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                <div className="border-b border-white/10 pb-4 text-center">
                  <p className="text-base font-bold text-violet-300">{company}</p>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                    Employment Offer Letter
                  </p>
                </div>
                <div className="mt-5 space-y-4 text-[13px] leading-7 text-slate-300">
                  <p>
                    Date:{" "}
                    <span className="text-white">
                      {joiningDate ? formatDate(joiningDate) : "—"}
                    </span>
                  </p>
                  <p>
                    Dear{" "}
                    <span className="font-semibold text-white">{candidateName}</span>,
                  </p>
                  <p>
                    We are pleased to offer you the position of{" "}
                    <span className="font-semibold text-violet-300">
                      {documentInfo.designation}
                    </span>{" "}
                    at {company}. Your starting compensation will be{" "}
                    <span className="font-semibold text-emerald-300">
                      ₹{formatNumber(salary)}
                    </span>{" "}
                    per month.
                  </p>
                  <p>
                    Your tentative joining date is{" "}
                    <span className="text-white">
                      {joiningDate ? formatDate(joiningDate) : "TBD"}
                    </span>
                    . Please report to the HR department on your first day.
                  </p>
                  <p>We look forward to having you on our team.</p>
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">
                      Authorized Signatory
                    </p>
                    <div className="mt-3 h-px w-24 bg-slate-600" />
                    <p className="mt-2 text-xs italic text-slate-400">
                      HR Department, {company}
                    </p>
                  </div>
                </div>
              </div>
            ) : type === "bank" ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="border-b border-white/10 pb-4 text-center">
                    <p className="text-base font-bold text-amber-300">Bank Statement</p>
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                      State Bank of India
                    </p>
                  </div>
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between rounded-lg bg-white/[0.03] px-4 py-2.5 text-sm">
                      <span className="text-slate-400">Account Holder</span>
                      <span className="font-medium text-white">{candidateName}</span>
                    </div>
                    <div className="flex justify-between rounded-lg bg-white/[0.03] px-4 py-2.5 text-sm">
                      <span className="text-slate-400">Account No.</span>
                      <span className="font-medium text-white">
                        XXXX XXXX{" "}
                        {String(candidateCode.replace(/\D/g, ""))
                          .padStart(4, "0")
                          .slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between rounded-lg bg-white/[0.03] px-4 py-2.5 text-sm">
                      <span className="text-slate-400">Employer</span>
                      <span className="font-medium text-white">{company}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <div className="bg-white/[0.04] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Recent Credits
                  </div>
                  {[1, 2, 3].map((m) => (
                    <div
                      key={m}
                      className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm"
                    >
                      <span className="text-slate-400">Month {m} Salary</span>
                      <span className="font-semibold text-emerald-300">
                        + ₹{formatNumber(salary)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-white/10 bg-emerald-500/5 px-4 py-3 text-sm font-semibold">
                    <span className="text-emerald-300">Total Credited</span>
                    <span className="text-emerald-300">₹{formatNumber(salary * 3)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="border-b border-white/10 pb-4 text-center">
                    <p className="text-base font-bold text-blue-300">{company}</p>
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                      Salary Slip — {docMeta.title}
                    </p>
                  </div>
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between rounded-lg bg-white/[0.03] px-4 py-2.5 text-sm">
                      <span className="text-slate-400">Employee</span>
                      <span className="font-medium text-white">{candidateName}</span>
                    </div>
                    <div className="flex justify-between rounded-lg bg-white/[0.03] px-4 py-2.5 text-sm">
                      <span className="text-slate-400">Designation</span>
                      <span className="font-medium text-white">
                        {documentInfo.designation}
                      </span>
                    </div>
                    <div className="flex justify-between rounded-lg bg-white/[0.03] px-4 py-2.5 text-sm">
                      <span className="text-slate-400">Emp. Code</span>
                      <span className="font-medium text-white">{candidateCode}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <div className="bg-white/[0.04] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Earnings
                  </div>
                  <div className="flex justify-between border-t border-white/10 px-4 py-2.5 text-sm">
                    <span className="text-slate-400">Basic Pay</span>
                    <span className="text-white">
                      ₹{formatNumber(Math.round(salary * 0.5))}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 px-4 py-2.5 text-sm">
                    <span className="text-slate-400">HRA</span>
                    <span className="text-white">
                      ₹{formatNumber(Math.round(salary * 0.2))}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 px-4 py-2.5 text-sm">
                    <span className="text-slate-400">DA + Allowances</span>
                    <span className="text-white">
                      ₹{formatNumber(Math.round(salary * 0.3))}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 bg-emerald-500/5 px-4 py-3 text-sm font-semibold">
                    <span className="text-emerald-300">Net Payable</span>
                    <span className="text-emerald-300">₹{formatNumber(salary)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VerificationToggle({ isVerified, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 ${
        isVerified
          ? "border-emerald-500/30 bg-emerald-500/20"
          : "border-slate-500/30 bg-slate-700/50"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full shadow-lg transition-transform duration-200 ${
          isVerified
            ? "translate-x-5 bg-emerald-400"
            : "translate-x-1 bg-slate-400"
        }`}
      />
    </button>
  );
}

function PlacementsTable({
  candidates,
  project,
  batchLabel,
  verificationState,
  onToggleVerification,
}) {
  const [previewDoc, setPreviewDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [docFilter, setDocFilter] = useState("");

  const openDocPreview = (candidate, type, label) => {
    setPreviewDoc({
      type,
      label,
      candidateName: candidate.name,
      candidateCode: candidate.candidateCode,
      company: candidate.company,
      designation: candidate.designation,
      salary: candidate.salary,
      joiningDate: candidate.joiningDate,
    });
  };

  const placedCandidates = candidates.filter(
    (c) => c.placementStatus === "Placed"
  );
  const companyOptions = useMemo(
    () => Array.from(new Set(placedCandidates.map((candidate) => candidate.company))).sort(),
    [placedCandidates]
  );
  const filteredCandidates = useMemo(() => {
    return placedCandidates.filter((candidate) => {
      const query = searchTerm.trim().toLowerCase();
      const isVerified = Boolean(verificationState[candidate.id]);
      const hasAllDocs =
        candidate.hasOfferLetter &&
        candidate.hasM1 &&
        candidate.hasM2 &&
        candidate.hasM3 &&
        candidate.hasBankStatement;
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.candidateCode.toLowerCase().includes(query) ||
        candidate.company.toLowerCase().includes(query) ||
        candidate.designation.toLowerCase().includes(query);
      const matchesCompany = !companyFilter || candidate.company === companyFilter;
      const matchesVerification =
        !verificationFilter ||
        (verificationFilter === "Verified" ? isVerified : !isVerified);
      const matchesDocs =
        !docFilter ||
        (docFilter === "complete" ? hasAllDocs : !hasAllDocs);

      return matchesSearch && matchesCompany && matchesVerification && matchesDocs;
    });
  }, [placedCandidates, searchTerm, companyFilter, verificationFilter, docFilter, verificationState]);
  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Student Name" },
      { key: "candidateCode", header: "Candidate Code" },
      { key: "projectName", header: "Project", exportValue: () => project.name },
      { key: "batchLabel", header: "Batch", exportValue: () => batchLabel },
      { key: "company", header: "Company" },
      { key: "designation", header: "Designation" },
      { key: "salary", header: "Salary", type: "currency" },
      { key: "joiningDate", header: "Joining Date", type: "date" },
      { key: "offer", header: "Offer Letter", exportValue: (candidate) => candidate.hasOfferLetter ? "Available" : "Missing" },
      { key: "m1", header: "M1", exportValue: (candidate) => candidate.hasM1 ? "Available" : "Missing" },
      { key: "m2", header: "M2", exportValue: (candidate) => candidate.hasM2 ? "Available" : "Missing" },
      { key: "m3", header: "M3", exportValue: (candidate) => candidate.hasM3 ? "Available" : "Missing" },
      { key: "bank", header: "Bank Statement", exportValue: (candidate) => candidate.hasBankStatement ? "Available" : "Missing" },
      {
        key: "verification",
        header: "Status",
        exportValue: (candidate) => verificationState[candidate.id] ? "Verified" : "Pending",
      },
    ],
    [project.name, batchLabel, verificationState]
  );

  if (!placedCandidates.length) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-black/20 py-16 text-center">
        <Briefcase size={32} className="text-slate-600" />
        <p className="mt-4 text-base font-medium text-slate-300">
          No placements recorded yet
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Candidates who get placed will appear here with their placement
          details.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
        <TableToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search placements..."
          resultCount={filteredCandidates.length}
          onClear={() => {
            setSearchTerm("");
            setCompanyFilter("");
            setVerificationFilter("");
            setDocFilter("");
          }}
        >
          <FilterSelect label="Company" value={companyFilter} onChange={setCompanyFilter} options={companyOptions} />
          <FilterSelect label="Verification" value={verificationFilter} onChange={setVerificationFilter} options={["Verified", "Pending"]} />
          <FilterSelect
            label="Docs"
            value={docFilter}
            onChange={setDocFilter}
            options={[
              { label: "Complete Docs", value: "complete" },
              { label: "Missing Docs", value: "missing" },
            ]}
          />
          <TableExportActions
            moduleName="Placements"
            fileName="placements_report"
            columns={exportColumns}
            rows={filteredCandidates}
            company={{ name: "Pantiss ERP", logo: "/activity.png" }}
          />
        </TableToolbar>
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full min-w-[1280px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Student Name</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Batch</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Designation</th>
                <th className="px-4 py-3 font-medium">Salary</th>
                <th className="px-4 py-3 font-medium">Joining Date</th>
                <th className="px-4 py-3 font-medium">Offer Letter</th>
                <th className="px-4 py-3 font-medium">M1</th>
                <th className="px-4 py-3 font-medium">M2</th>
                <th className="px-4 py-3 font-medium">M3</th>
                <th className="px-4 py-3 font-medium">Bank Stmt</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCandidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="align-top transition hover:bg-violet-500/[0.06]"
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{candidate.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {candidate.candidateCode}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{project.name}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
                      {batchLabel}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">
                      {candidate.company}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {candidate.designation}
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-emerald-300">
                      ₹{formatNumber(candidate.salary)}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">/month</p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {candidate.joiningDate
                      ? formatDate(candidate.joiningDate)
                      : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <DocBadge
                      available={candidate.hasOfferLetter}
                      label="Offer"
                      onClick={() => openDocPreview(candidate, "offer", "Offer Letter")}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <DocBadge
                      available={candidate.hasM1}
                      label="M1"
                      onClick={() => openDocPreview(candidate, "m1", "M1 Salary Slip")}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <DocBadge
                      available={candidate.hasM2}
                      label="M2"
                      onClick={() => openDocPreview(candidate, "m2", "M2 Salary Slip")}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <DocBadge
                      available={candidate.hasM3}
                      label="M3"
                      onClick={() => openDocPreview(candidate, "m3", "M3 Salary Slip")}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <DocBadge
                      available={candidate.hasBankStatement}
                      label="Bank"
                      onClick={() => openDocPreview(candidate, "bank", "Bank Statement")}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <VerificationToggle
                        isVerified={verificationState[candidate.id]}
                        onToggle={() => onToggleVerification(candidate.id)}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          verificationState[candidate.id]
                            ? "text-emerald-300"
                            : "text-slate-500"
                        }`}
                      >
                        {verificationState[candidate.id]
                          ? "Verified"
                          : "Pending"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        documentInfo={previewDoc}
      />
    </>
  );
}

function EnterpriseMetric({ label, value, caption, tone = "violet" }) {
  const toneClass = {
    violet: "text-violet-200",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
  }[tone] || "text-violet-200";

  return (
    <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{caption}</p>
    </div>
  );
}

function EnterpriseMiniStat({ label, value }) {
  return (
    <div className="min-w-0 rounded-[14px] border border-white/10 bg-black/25 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function InlineHealth({ value, label = "Health" }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
      {label !== "Health" ? `${label}: ` : null}
      {value}%
    </span>
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

function ProjectWorkflowStepper({ currentStep }) {
  const steps = [
    { id: 1, label: "Project", caption: "Portfolio view" },
    { id: 2, label: "Center", caption: "Execution scope" },
    { id: 3, label: "Performance", caption: "Operational detail" },
  ];

  return (
    <div className="admin-project-stepper grid gap-2 rounded-[22px] border border-white/10 bg-black/25 p-2 sm:grid-cols-3">
      {steps.map((step) => {
        const isActive = currentStep === step.id;
        const isComplete = currentStep > step.id;

        return (
          <div
            key={step.id}
            className={`rounded-[18px] border px-3 py-3 transition ${
              isActive
                ? "border-violet-400/30 bg-violet-500/10 text-white"
                : isComplete
                  ? "border-emerald-400/20 bg-emerald-500/10 text-white"
                  : "border-white/0 bg-transparent text-slate-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-violet-400 text-black"
                    : isComplete
                      ? "bg-emerald-400 text-black"
                      : "bg-white/10 text-slate-400"
                }`}
              >
                {step.id}
              </span>
              <p className="text-sm font-medium">{step.label}</p>
            </div>
            <p className="mt-2 pl-8 text-xs text-slate-500">{step.caption}</p>
          </div>
        );
      })}
    </div>
  );
}

function GuidedStepSection({ step, title, description, children }) {
  return (
    <div className="admin-project-subsection rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5 border-b border-white/10 pb-4">
        <p className="admin-project-kicker text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-300">
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
      className={`admin-project-card admin-project-card--rail group relative w-full overflow-hidden rounded-[24px] border p-4 text-left transition-all ${
        isActive
          ? "border-violet-400/40 bg-violet-500/10 shadow-[0_12px_30px_rgba(124,58,237,0.16)]"
          : "border-white/10 bg-black/[0.16] hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/[0.04]"
      }`}
    >
      <div className="admin-project-card__halo" />
      <div className="admin-project-card__surface" />

      <div className="relative flex items-start justify-between gap-3">
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

      <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800/80">
        <span
          className={`block h-full rounded-full bg-gradient-to-r ${healthMeta.barClass}`}
          style={{ width: `${project.healthScore}%` }}
        />
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-3">
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

      <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3">
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
        <div className="rounded-2xl bg-white/[0.04] p-2 text-violet-300">
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
          ? "border-violet-500/30 bg-violet-500/10 shadow-[0_12px_28px_rgba(124,58,237,0.16)]"
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
          ? "border-violet-500/30 bg-violet-500/10 shadow-[0_12px_28px_rgba(124,58,237,0.16)]"
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
            className={isActive ? "text-violet-300" : "text-slate-500"}
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
    cyan: "bg-violet-500/10 text-violet-300",
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
          <div className="rounded-2xl bg-white/[0.04] p-2 text-violet-300">
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
