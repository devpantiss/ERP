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
  PackageCheck,
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
  Upload,
} from "lucide-react";
import SlidePanel from "../../components/common/SlidePanel";
import TableExportActions from "../../components/common/TableExportActions";
import { useProjectStore } from "../../stores/projectStore";
import { selectAdminProjectReports } from "../../stores/selectors/projectSelectors";
import { findCertificateRecord } from "../../utils/certificationDocuments";

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

const KIT_ITEM_CONFIG = [
  { key: "safetyKit", label: "Safety Kit" },
  { key: "shoes", label: "Shoes" },
  { key: "uniform", label: "Uniform" },
  { key: "trainingKit", label: "Training Kit" },
];

const INSURANCE_STATUSES = ["Active", "Expiring Soon", "Pending", "Expired"];

const CERTIFICATION_STATUSES = ["Pending", "Certified", "Failed"];

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

const PROJECT_POPUP_THEMES = {
  violet: {
    drawerBorder: "border-violet-500/25",
    icon: "border-violet-400/25 bg-violet-500/10 text-violet-200",
    downloadHover: "hover:border-violet-400/35 hover:bg-violet-500/15",
    sectionLabel: "text-violet-300",
  },
  red: {
    drawerBorder: "border-red-500/30",
    icon: "border-red-400/30 bg-red-500/10 text-red-200",
    downloadHover: "hover:border-red-400/40 hover:bg-red-500/15",
    sectionLabel: "text-red-300",
  },
};

const ENROLLMENT_SAMPLE_PDF =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
const enrollmentSampleImage = (seed) =>
  `https://i.pravatar.cc/420?img=${(seed % 70) + 1}`;

const ENROLLMENT_DOCUMENT_FIELDS = [
  { key: "aadhaar", label: "Aadhaar Card" },
  { key: "qualification", label: "Qualification Certificate" },
  { key: "experience", label: "Experience Certificate" },
  { key: "license", label: "Operator / Driving License" },
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
    const sourceCandidates = center.normalizedCandidatesByBatch?.[parsed.label] || [];
    const candidateRecords = Array.from({ length: sourceCandidates.length || parsed.size }, (_, learnerIndex) => {
      const sourceCandidate = sourceCandidates[learnerIndex];
      const candidateName = sourceCandidate?.name || buildCandidateName(center, index, learnerIndex);
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
      const qualificationLevel = ["10th Pass", "12th Pass", "ITI", "Diploma", "Graduate"][
        (placementSeed + learnerIndex) % 5
      ];
      const qualificationTrade = ["Electrical", "Fitter", "Welder", "Logistics", "Solar O&M"][
        (placementSeed + learnerIndex) % 5
      ];
      const qualificationInstitute = [
        "ITI Angul",
        "Govt Polytechnic Odisha",
        "CBSE Board",
        "Skill Development Center",
      ][(placementSeed + learnerIndex) % 4];
      const qualificationYear = String(2019 + ((placementSeed + learnerIndex) % 6));
      const aadharLastFour = String(2000 + ((placementSeed + learnerIndex) % 7800));
      const isOperatorCandidate = center.jobRoles[
        (learnerIndex + index) % center.jobRoles.length
      ]?.toLowerCase().includes("operator");
      const enrollmentDocuments = {
        aadhaar: {
          name: `${candidateName.replace(/\s+/g, "-").toLowerCase()}-aadhaar.pdf`,
          type: "application/pdf",
          url: ENROLLMENT_SAMPLE_PDF,
        },
        qualification: {
          name: `${candidateName.replace(/\s+/g, "-").toLowerCase()}-qualification.jpg`,
          type: "image/jpeg",
          url: enrollmentSampleImage(placementSeed + learnerIndex + 12),
        },
        experience:
          learnerIndex % 3 === 0
            ? null
            : {
                name: `${candidateName.replace(/\s+/g, "-").toLowerCase()}-experience.pdf`,
                type: "application/pdf",
                url: ENROLLMENT_SAMPLE_PDF,
              },
        license: isOperatorCandidate
          ? {
              name: `${candidateName.replace(/\s+/g, "-").toLowerCase()}-license.jpg`,
              type: "image/jpeg",
              url: enrollmentSampleImage(placementSeed + learnerIndex + 28),
            }
          : null,
      };

      return {
        id: sourceCandidate?.id || `${center.id}-${parsed.id}-candidate-${learnerIndex + 1}`,
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
        jobRole: sourceCandidate?.jobRole || center.jobRoles[(learnerIndex + index) % center.jobRoles.length],
        phone: sourceCandidate?.phone || `+91 98${String(70000000 + placementSeed + learnerIndex).slice(-8)}`,
        aadharNumber: `XXXX-XXXX-${aadharLastFour}`,
        dateOfBirth: `199${learnerIndex % 6}-0${(learnerIndex % 8) + 1}-15`,
        gender: sourceCandidate?.gender || (learnerIndex % 2 === 0 ? "Male" : "Female"),
        qualificationLevel,
        qualificationTrade,
        qualificationInstitute,
        qualificationYear,
        experienceYears: String(learnerIndex % 5),
        currentlyEmployed: learnerIndex % 4 === 0 ? "Yes" : "No",
        address: `${12 + learnerIndex}, ${sourceCandidate?.district || center.location} main road, Odisha`,
        livePhoto: enrollmentSampleImage(placementSeed + learnerIndex),
        liveLocation: {
          lat: 20.2961 + learnerIndex / 1000,
          lng: 85.8245 + index / 1000,
          accuracy: 20 + (learnerIndex % 12),
          place: `${center.location}, Odisha`,
        },
        enrollmentDocuments,
        mobilizer: sourceCandidate?.mobilizer || ["Priya Mishra", "Vikram Singh", "Rajan Nayak", "Sunita Patra"][
          (placementSeed + learnerIndex) % 4
        ],
        enrollmentDate: sourceCandidate?.enrollmentDate || new Date(
          Date.now() - (22 + learnerIndex + index * 3) * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        enrollmentStatus:
          sourceCandidate?.enrollmentStatus ||
          (learnerIndex % 7 === 0
            ? "Pending"
            : learnerIndex % 11 === 0
            ? "Rejected"
            : "Approved"),
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

export default function AdminProjectManagement({ readOnly = false, theme = "violet" }) {
  const projectRecords = useProjectStore((state) => state.records);
  const fetchProjects = useProjectStore((state) => state.fetchAll);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const projectSnapshots = useMemo(
    () => selectAdminProjectReports(projectRecords).map(buildProjectSnapshot),
    [projectRecords]
  );

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

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

  return (
    <EnterpriseProjectDashboard
      portfolio={portfolio}
      projectSnapshots={projectSnapshots}
      selectedProject={selectedProject}
      activeCenter={activeCenter}
      selectedBatch={selectedBatch}
      rankedCenters={rankedCenters}
      readOnly={readOnly}
      theme={theme}
      onProjectSelect={handleProjectSelect}
      onCenterSelect={handleCenterSelect}
      onBatchSelect={setSelectedBatchId}
      onBack={handleBack}
    />
  );

}

function EnterpriseProjectDashboard({
  projectSnapshots,
  selectedProject,
  activeCenter,
  selectedBatch,
  rankedCenters,
  readOnly,
  theme,
  onProjectSelect,
  onCenterSelect,
  onBatchSelect,
  onBack,
}) {
  const pageThemeClass = theme === "red" ? "super-admin-project-theme" : "";

  return (
    <div className={`enterprise-project-page space-y-6 text-white ${pageThemeClass}`}>
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
          readOnly={readOnly}
          onBack={onBack}
          onCenterSelect={onCenterSelect}
        />
      ) : (
        <EnterpriseCenterView
          project={selectedProject}
          center={activeCenter}
          centers={rankedCenters}
          selectedBatch={selectedBatch}
          readOnly={readOnly}
          theme={theme}
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

function EnterpriseProjectView({ project, centers, readOnly, onBack, onCenterSelect }) {
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

      {readOnly ? <SuperAdminProjectStaffSection project={project} /> : null}

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

function SuperAdminProjectStaffSection({ project }) {
  const incharge = project.projectIncharge;
  const employees = project.associatedEmployees || [];
  const supportEmployees = employees.filter((employee) => employee.id !== incharge?.id);
  const activeCount = employees.filter((employee) => employee.status === "ACTIVE").length;

  return (
    <section className="enterprise-project-shell rounded-[26px] border border-white/10 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-300">
            Project Governance
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Admin / Project Incharge</h3>
          <p className="mt-1 text-sm text-slate-400">
            Project incharge and employees associated with this project.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right sm:grid-cols-3">
          <EnterpriseMiniStat label="Employees" value={employees.length} />
          <EnterpriseMiniStat label="Active" value={activeCount} />
          <EnterpriseMiniStat label="Centers" value={project.centerCount} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)]">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.06] p-4">
          <div className="flex items-start gap-3">
            <EmployeeAvatar name={incharge?.name || "Unassigned"} highlight />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{incharge?.name || "Unassigned"}</p>
              <p className="mt-1 text-xs font-semibold text-red-200">
                {incharge?.designation || "Project Admin"}
              </p>
              <p className="mt-3 text-xs text-slate-400">{incharge?.employeeCode || "No employee mapped"}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs">
            <ProjectStaffMeta label="Email" value={incharge?.email || "—"} />
            <ProjectStaffMeta label="Phone" value={incharge?.phone || "—"} />
            <ProjectStaffMeta label="Status" value={formatEmployeeStatus(incharge?.status)} tone="text-emerald-300" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr] gap-3 border-b border-white/10 bg-[#0f172a] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <span>Employee</span>
            <span>Role</span>
            <span>Status</span>
          </div>
          <div className="max-h-[360px] divide-y divide-white/10 overflow-auto">
            {supportEmployees.map((employee) => (
              <div
                key={employee.id}
                className="grid grid-cols-[1.2fr_1fr_0.8fr] items-center gap-3 px-4 py-3 text-sm transition hover:bg-red-500/[0.05]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <EmployeeAvatar name={employee.name} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{employee.name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{employee.employeeCode}</p>
                  </div>
                </div>
                <span className="truncate text-xs font-semibold text-slate-300">{employee.designation}</span>
                <span className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${getEmployeeStatusClass(employee.status)}`}>
                  {formatEmployeeStatus(employee.status)}
                </span>
              </div>
            ))}
            {!supportEmployees.length ? (
              <div className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                No supporting employees are mapped to this project yet.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmployeeAvatar({ name, highlight = false }) {
  const initials = String(name || "NA")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${
      highlight
        ? "border-red-400/30 bg-red-500/15 text-red-100"
        : "border-white/10 bg-white/[0.05] text-slate-200"
    }`}>
      {initials || "NA"}
    </div>
  );
}

function ProjectStaffMeta({ label, value, tone = "text-slate-300" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className={`truncate text-right font-semibold ${tone}`}>{value}</span>
    </div>
  );
}

function formatEmployeeStatus(status) {
  if (status === "ACTIVE") return "Active";
  if (status === "ON_LEAVE") return "On Leave";
  return status || "Unassigned";
}

function getEmployeeStatusClass(status) {
  if (status === "ACTIVE") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  if (status === "ON_LEAVE") return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  return "border-slate-500/20 bg-slate-500/10 text-slate-300";
}

function EnterpriseCenterView({
  project,
  center,
  centers,
  selectedBatch,
  readOnly,
  theme,
  onBack,
  onCenterSelect,
  onBatchSelect,
}) {
  const galleryItems = useMemo(
    () => buildProjectGalleryItems(project, center, selectedBatch),
    [project, center, selectedBatch]
  );
  const placementDrives = useMemo(
    () => buildCenterPlacementDriveRows(project, center, selectedBatch),
    [project, center, selectedBatch]
  );
  const exposureVisits = useMemo(
    () => buildCenterExposureVisitRows(project, center, selectedBatch),
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
          readOnly={readOnly}
          onCenterSelect={onCenterSelect}
          onBatchSelect={onBatchSelect}
        />
      ) : null}

      <CenterOperationsEvidenceSections
        placementDrives={placementDrives}
        exposureVisits={exposureVisits}
      />

      <ProjectGallerySection
        items={galleryItems}
        project={project}
        center={center}
        selectedBatch={selectedBatch}
        theme={theme}
      />

    </div>
  );
}

function buildCenterPlacementDriveRows(project, center, selectedBatch) {
  const batches = selectedBatch ? [selectedBatch] : center.batchSnapshots.slice(0, 4);

  return batches.map((batch, index) => {
    const batchCandidates = Array.isArray(batch.candidateRecords) ? batch.candidateRecords : [];
    const batchLabel = batch.label || batch.name || `Batch ${index + 1}`;
    const trade = batch.jobRole || batch.trade || project.sector || "Training";
    const candidateCount = Number(batch.size) || batchCandidates.length || 0;
    const eligibleCandidates = batchCandidates.filter(
      (candidate) => candidate.placementStatus !== "Not Yet Eligible"
    );
    const placedCandidates = batchCandidates.filter(
      (candidate) => candidate.placementStatus === "Placed"
    );
    const seed = project.name.length + center.name.length + index * 11;
    const company = COMPANY_NAMES[seed % COMPANY_NAMES.length];

    return {
      id: `${project.id}-${center.id}-${batch.id}-drive`,
      company,
      driveName: `${company} Hiring Drive`,
      batch: batchLabel,
      trade,
      date: formatDate(new Date(Date.now() - (index * 8 + 6) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
      officer: ["Meera Das", "Pooja Patel", "Bikash Naik", "Sonal Behera"][seed % 4],
      participated: Math.max(eligibleCandidates.length, Math.round(candidateCount * 0.34)),
      selected: placedCandidates.length,
      salary: placedCandidates.length
        ? Math.round(placedCandidates.reduce((sum, candidate) => sum + (Number(candidate.salary) || 0), 0) / placedCandidates.length)
        : 0,
      status: placedCandidates.length ? "Completed" : "Scheduled",
      documents: [
        {
          key: "invitation",
          label: "Employer Invitation",
          name: `${company.toLowerCase().replace(/\s+/g, "-")}-drive-invitation.pdf`,
          type: "application/pdf",
          url: ENROLLMENT_SAMPLE_PDF,
          uploadedOn: formatDate(new Date(Date.now() - (index * 8 + 9) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
        },
        {
          key: "attendance",
          label: "Candidate Attendance Sheet",
          name: `${batchLabel.toLowerCase().replace(/\s+/g, "-")}-drive-attendance.jpg`,
          type: "image/jpeg",
          url: PROJECT_GALLERY_ASSETS[(seed + 4) % PROJECT_GALLERY_ASSETS.length].src,
          uploadedOn: formatDate(new Date(Date.now() - (index * 8 + 6) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
        },
        {
          key: "selection",
          label: "Selection List",
          name: `${company.toLowerCase().replace(/\s+/g, "-")}-selection-list.pdf`,
          type: "application/pdf",
          url: ENROLLMENT_SAMPLE_PDF,
          uploadedOn: formatDate(new Date(Date.now() - (index * 8 + 5) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
        },
      ],
    };
  });
}

function buildCenterExposureVisitRows(project, center, selectedBatch) {
  const batches = selectedBatch ? [selectedBatch] : center.batchSnapshots.slice(0, 4);

  return batches.map((batch, index) => {
    const batchLabel = batch.label || batch.name || `Batch ${index + 1}`;
    const trade = batch.jobRole || batch.trade || project.sector || "training";
    const seed = center.name.length * 5 + batchLabel.length + index * 17;
    const industry = COMPANY_NAMES[(seed + 3) % COMPANY_NAMES.length];
    const proofCount = 2 + (seed % 4);
    const candidateCount = Number(batch.size) || batch.candidateRecords?.length || 0;
    const attended = Math.min(candidateCount, Math.round(candidateCount * (0.72 + (seed % 12) / 100)));

    return {
      id: `${project.id}-${center.id}-${batch.id}-exposure`,
      industry,
      trainer: batch.trainer || ["Sneha Mohanty", "Rahul Nayak", "Anita Patel", "Rakesh Sahu"][seed % 4],
      batch: batchLabel,
      trade,
      date: formatDate(new Date(Date.now() - (index * 10 + 12) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
      location: `${industry} unit, ${center.location}`,
      attended,
      candidates: candidateCount,
      proofs: proofCount,
      status: index % 3 === 2 ? "Review Pending" : "Submitted",
      notes: `Students observed ${trade.toLowerCase()} workflows, safety practices, and site readiness expectations.`,
      documents: [
        {
          key: "permission",
          label: "Visit Permission Letter",
          name: `${industry.toLowerCase().replace(/\s+/g, "-")}-permission.pdf`,
          type: "application/pdf",
          url: ENROLLMENT_SAMPLE_PDF,
          uploadedOn: formatDate(new Date(Date.now() - (index * 10 + 16) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
        },
        {
          key: "attendance",
          label: "Visit Attendance Sheet",
          name: `${batchLabel.toLowerCase().replace(/\s+/g, "-")}-visit-attendance.jpg`,
          type: "image/jpeg",
          url: PROJECT_GALLERY_ASSETS[(seed + 2) % PROJECT_GALLERY_ASSETS.length].src,
          uploadedOn: formatDate(new Date(Date.now() - (index * 10 + 12) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
        },
        {
          key: "photos",
          label: "Geo-tagged Proof Image",
          name: `${industry.toLowerCase().replace(/\s+/g, "-")}-visit-proof.jpg`,
          type: "image/jpeg",
          url: PROJECT_GALLERY_ASSETS[(seed + 5) % PROJECT_GALLERY_ASSETS.length].src,
          uploadedOn: formatDate(new Date(Date.now() - (index * 10 + 11) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
        },
        {
          key: "report",
          label: "Trainer Visit Report",
          name: `${batchLabel.toLowerCase().replace(/\s+/g, "-")}-trainer-report.pdf`,
          type: "application/pdf",
          url: ENROLLMENT_SAMPLE_PDF,
          uploadedOn: formatDate(new Date(Date.now() - (index * 10 + 10) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
        },
      ],
    };
  });
}

function CenterOperationsEvidenceSections({ placementDrives, exposureVisits }) {
  const [documentContext, setDocumentContext] = useState(null);

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <ProjectDetailMiniSection
          eyebrow="Placement Operations"
          title="Placement Drives"
          subtitle="Drive-wise employer, batch, participation, and selection details."
          icon={Briefcase}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Drive</th>
                <th className="px-4 py-3 font-medium">Batch / Trade</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Participation</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {placementDrives.map((drive) => (
                <tr key={drive.id} className="transition hover:bg-violet-500/[0.06]">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">{drive.driveName}</p>
                    <p className="mt-1 text-xs text-slate-500">Officer: {drive.officer}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-slate-300">{drive.batch}</p>
                    <p className="mt-1 text-xs text-slate-500">{drive.trade}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{drive.date}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-cyan-300">{drive.participated} attended</p>
                    <p className="mt-1 text-xs text-emerald-300">{drive.selected} selected{drive.salary ? ` • ₹${formatNumber(drive.salary)}` : ""}</p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusChip status={drive.status} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setDocumentContext({ type: "Placement Drive", title: drive.driveName, subtitle: `${drive.batch} • ${drive.company}`, record: drive, documents: drive.documents })}
                      className="inline-flex items-center gap-2 rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-500/20"
                    >
                      <FileText size={13} />
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </ProjectDetailMiniSection>

        <ProjectDetailMiniSection
          eyebrow="Training Exposure"
          title="Exposure Visits"
          subtitle="Industry visit, trainer, attendance, proof, and notes summary."
          icon={MapPin}
        >
          <div className="space-y-3">
            {exposureVisits.map((visit) => (
              <article key={visit.id} className="rounded-2xl border border-white/10 bg-[#0b1220]/70 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{visit.industry}</p>
                  <p className="mt-1 text-xs text-slate-500">{visit.location}</p>
                </div>
                <StatusChip status={visit.status} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <MiniDetail label="Trainer" value={visit.trainer} />
                <MiniDetail label="Batch / Trade" value={`${visit.batch} / ${visit.trade}`} />
                <MiniDetail label="Visit Date" value={visit.date} />
                <MiniDetail label="Attendance" value={`${visit.attended}/${visit.candidates}`} tone="text-cyan-300" />
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-400">{visit.notes}</p>
                <button
                  type="button"
                  onClick={() => setDocumentContext({ type: "Exposure Visit", title: visit.industry, subtitle: `${visit.batch} • ${visit.trainer}`, record: visit, documents: visit.documents })}
                  className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200 transition hover:border-violet-300/50 hover:bg-violet-500/20"
                >
                  <FileText size={13} />
                  View details
                </button>
              </div>
              </article>
            ))}
          </div>
        </ProjectDetailMiniSection>
      </div>

      <OperationsDocumentPanel
        context={documentContext}
        onClose={() => setDocumentContext(null)}
      />
    </>
  );
}

function OperationsDocumentPanel({ context, onClose }) {
  const documents = context?.documents || [];
  const [activeKey, setActiveKey] = useState("");

  useEffect(() => {
    setActiveKey(documents[0]?.key || "");
  }, [context, documents]);

  const activeDocument = documents.find((document) => document.key === activeKey) || documents[0];

  return (
    <SlidePanel open={!!context} onClose={onClose} title={context?.title || "Uploaded Documents"} width="3xl">
      {context ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-violet-400/15 bg-violet-500/[0.06] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200">
              Zoho Projects Style Document Review
            </p>
            <p className="mt-2 text-sm font-semibold text-white">{context.type}</p>
            <p className="mt-1 text-xs text-slate-400">{context.subtitle}</p>
          </div>

          <div className="flex gap-2 overflow-x-auto border-b border-white/10">
            {documents.map((document) => (
              <button
                key={document.key}
                type="button"
                onClick={() => setActiveKey(document.key)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
                  activeDocument?.key === document.key
                    ? "border-violet-400 text-violet-200"
                    : "border-transparent text-slate-500 hover:text-white"
                }`}
              >
                <FileText size={14} />
                {document.label}
              </button>
            ))}
          </div>

          {activeDocument ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{activeDocument.label}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {activeDocument.name} • Uploaded {activeDocument.uploadedOn}
                  </p>
                </div>
                <a
                  href={activeDocument.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-violet-400/35 hover:bg-violet-500/15 hover:text-white"
                >
                  <ExternalLink size={13} />
                  Open file
                </a>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#020617] p-3">
                {isEnrollmentPdf(activeDocument) ? (
                  <iframe
                    src={activeDocument.url}
                    title={activeDocument.label}
                    className="h-[clamp(260px,calc(100vh-31rem),520px)] w-full rounded-xl bg-white"
                  />
                ) : (
                  <img
                    src={activeDocument.url}
                    alt={activeDocument.label}
                    className="max-h-[clamp(260px,calc(100vh-31rem),520px)] w-full rounded-xl object-contain"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
              No uploaded documents are linked yet.
            </div>
          )}
        </div>
      ) : null}
    </SlidePanel>
  );
}

function ProjectDetailMiniSection({ eyebrow, title, subtitle, icon: Icon, children }) {
  return (
    <section className="enterprise-project-shell rounded-[26px] border border-white/10 p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200">{eyebrow}</p>
          <h3 className="mt-1 text-xl font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function MiniDetail({ label, value, tone = "text-white/80" }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-1 text-xs font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function StatusChip({ status }) {
  const className =
    status === "Completed" || status === "Submitted"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : status === "Scheduled"
      ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
      : "border-amber-500/20 bg-amber-500/10 text-amber-300";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {status}
    </span>
  );
}

function ProjectGallerySection({ items, project, center, selectedBatch, theme = "violet" }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [previewItem, setPreviewItem] = useState(null);
  const popupTheme = PROJECT_POPUP_THEMES[theme] || PROJECT_POPUP_THEMES.violet;

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

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPreviewItem(item)}
            className="group relative aspect-[4/3] overflow-hidden rounded-[20px] border border-white/10 bg-slate-950 text-left shadow-[0_18px_50px_rgba(2,6,23,0.28)] transition hover:-translate-y-0.5 hover:border-violet-400/40"
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

      <GalleryImageModal item={previewItem} theme={popupTheme} onClose={() => setPreviewItem(null)} />
    </section>
  );
}

function GalleryImageModal({ item, theme, onClose }) {
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
        className={`relative flex h-full w-full max-w-[560px] flex-col border-l ${theme.drawerBorder} bg-[#080d1a] text-white shadow-[-24px_0_70px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0b1220] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${theme.icon}`}>
              <Eye size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {item.projectName} • {item.centerName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={item.src}
              download
              className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-xs font-semibold text-slate-200 transition ${theme.downloadHover} hover:text-white`}
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
            <div className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] ${theme.sectionLabel}`}>
              <FileText size={14} />
              Event details
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <GalleryMetaRow label="Captured on" value={item.capturedOn} />
              <GalleryMetaRow label="Category" value={item.category} />
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

function normalizeSubmittedEnrollmentForProject(candidate, index) {
  const documents = candidate.documents || {};
  return {
    ...candidate,
    id: candidate.id || `submitted-${index + 1}`,
    name: candidate.name || `Submitted Candidate ${index + 1}`,
    candidateCode: candidate.candidateCode || `SUB-${String(index + 1).padStart(3, "0")}`,
    jobRole: candidate.jobRole || candidate.jobrole || "Not Assigned",
    phone: candidate.phone || "-",
    mobilizer: candidate.mobilizer || "Mobilizer Submission",
    enrollmentDate: candidate.enrollmentDate || new Date().toISOString().split("T")[0],
    enrollmentStatus: candidate.status || candidate.enrollmentStatus || "Pending",
    aadharNumber: candidate.aadharNumber || candidate.aadhaar || "-",
    dateOfBirth: candidate.dateOfBirth || candidate.dob || "-",
    gender: candidate.gender || "-",
    qualificationLevel: candidate.qualificationLevel || candidate.qualification || "-",
    qualificationTrade: candidate.qualificationTrade || "-",
    qualificationInstitute: candidate.qualificationInstitute || "-",
    qualificationYear: candidate.qualificationYear || "-",
    experienceYears: candidate.experienceYears || candidate.experience || "0 Years",
    currentlyEmployed: candidate.currentlyEmployed || "-",
    address: candidate.address || "-",
    livePhoto: candidate.livePhoto || candidate.image,
    liveLocation: candidate.liveLocation,
    enrollmentDocuments: {
      aadhaar: documents.aadhaar || (candidate.aadhaarFile ? { name: "Aadhaar", url: candidate.aadhaarFile } : null),
      qualification: documents.qualification || (candidate.qualificationFile ? { name: "Qualification", url: candidate.qualificationFile } : null),
      experience: documents.experience || null,
      license: documents.license || (candidate.licenceFile ? { name: "License", url: candidate.licenceFile } : null),
    },
  };
}

function getEnrollmentDocumentUrl(file) {
  return typeof file === "string" ? file : file?.url;
}

function isEnrollmentPdf(file) {
  const url = getEnrollmentDocumentUrl(file) || "";
  const type = typeof file === "string" ? "" : file?.type || "";
  return type.includes("pdf") || url.includes("application/pdf") || url.toLowerCase().includes(".pdf");
}

function getCandidateSeed(candidate, index = 0) {
  const digits = String(candidate.id || candidate.candidateCode || "").replace(/\D/g, "");
  return Number(digits.slice(-3)) || index + 1;
}

function buildKitIssuedState(candidate, index) {
  const seed = getCandidateSeed(candidate, index);
  return {
    safetyKit: seed % 5 !== 1,
    shoes: seed % 4 !== 2,
    uniform: seed % 6 !== 3,
    trainingKit: seed % 3 !== 1,
  };
}

function getKitStatus(issued) {
  const count = KIT_ITEM_CONFIG.filter((item) => issued[item.key]).length;
  if (count === KIT_ITEM_CONFIG.length) return "Completed";
  if (count === 0) return "Pending";
  return "Partial";
}

function getKitStatusClass(status) {
  if (status === "Completed") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  if (status === "Partial") return "border-amber-500/25 bg-amber-500/10 text-amber-300";
  return "border-slate-500/25 bg-slate-500/10 text-slate-300";
}

function buildInsuranceRecord(candidate, index) {
  const seed = getCandidateSeed(candidate, index);
  const status = INSURANCE_STATUSES[seed % INSURANCE_STATUSES.length];
  return {
    provider: ["LIC Group Cover", "ICICI Lombard", "New India Assurance", "HDFC ERGO"][seed % 4],
    policyNo: status === "Pending" ? "" : `POL-OD-${88300 + seed}`,
    coverage: status === "Pending" ? "" : 200000 + (seed % 4) * 50000,
    startDate: status === "Pending" ? "" : `2026-04-${String((seed % 20) + 1).padStart(2, "0")}`,
    endDate: status === "Expired" ? "2026-05-10" : status === "Expiring Soon" ? "2026-05-29" : "2027-04-30",
    nominee: ["Mother", "Father", "Spouse", "Guardian"][seed % 4],
    status,
  };
}

function getInsuranceStatusClass(status) {
  if (status === "Active") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  if (status === "Expiring Soon") return "border-amber-500/25 bg-amber-500/10 text-amber-300";
  if (status === "Expired") return "border-red-500/25 bg-red-500/10 text-red-300";
  return "border-slate-500/25 bg-slate-500/10 text-slate-300";
}

function buildCertificationRecord(candidate, index) {
  const certified = candidate.trainingProgress >= 85 && candidate.attendanceRate >= 80;
  const superAdminCertificate = findCertificateRecord(candidate);
  return {
    status: certified ? "Certified" : "Pending",
    certificateId: certified ? `CERT-${candidate.candidateCode || getCandidateSeed(candidate, index)}` : "",
    certifiedOn: certified ? "2026-04-18" : "",
    certificateFile: superAdminCertificate,
  };
}

function CandidateRosterTabs({
  selectedBatch,
  project,
  center,
  centers,
  batches,
  readOnly = false,
  onCenterSelect,
  onBatchSelect,
}) {
  const [activeTab, setActiveTab] = useState("training");
  const enrollmentCandidates = useMemo(
    () => selectedBatch.candidateRecords.map(normalizeSubmittedEnrollmentForProject),
    [selectedBatch]
  );
  const [verificationState, setVerificationState] = useState(() => {
    const initial = {};
    selectedBatch.candidateRecords.forEach((c) => {
      initial[c.id] = c.isVerified;
    });
    return initial;
  });
  const [enrollmentState, setEnrollmentState] = useState(() => {
    const initial = {};
    enrollmentCandidates.forEach((c) => {
      initial[c.id] = c.enrollmentStatus;
    });
    return initial;
  });

  useEffect(() => {
    const initial = {};
    const enrollmentInitial = {};
    selectedBatch.candidateRecords.forEach((c) => {
      initial[c.id] = c.isVerified;
    });
    enrollmentCandidates.forEach((c) => {
      enrollmentInitial[c.id] = c.enrollmentStatus;
    });
    setVerificationState(initial);
    setEnrollmentState(enrollmentInitial);
  }, [selectedBatch, enrollmentCandidates]);

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
    { key: "kit", label: "Kit Distribution", icon: PackageCheck },
    { key: "insurance", label: "Insurance", icon: ShieldCheck },
    ...(!readOnly ? [{ key: "certification", label: "Certification", icon: Award }] : []),
  ];
  const pendingEnrollments = enrollmentCandidates.filter(
    (candidate) => enrollmentState[candidate.id] === "Pending"
  ).length;

  return (
    <section className="enterprise-project-shell rounded-[26px] border border-white/10 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Candidate Roster</h3>
          <p className="mt-1 text-sm text-slate-400">
            {enrollmentCandidates.length} candidates in{" "}
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
        <div className="flex flex-wrap gap-2">
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
          candidates={enrollmentCandidates}
          project={project}
          center={center}
          batchLabel={selectedBatch.label}
          enrollmentState={enrollmentState}
          readOnly={readOnly}
          onUpdateEnrollmentStatus={updateEnrollmentStatus}
        />
      ) : activeTab === "training" ? (
        <TrainingDetailTable
          candidates={selectedBatch.candidateRecords}
          project={project}
          center={center}
          batchLabel={selectedBatch.label}
        />
      ) : activeTab === "placements" ? (
        <PlacementsTable
          candidates={selectedBatch.candidateRecords}
          project={project}
          center={center}
          batchLabel={selectedBatch.label}
          verificationState={verificationState}
          readOnly={readOnly}
          onToggleVerification={toggleVerification}
        />
      ) : activeTab === "kit" ? (
        <KitDistributionTable
          candidates={selectedBatch.candidateRecords}
          project={project}
          center={center}
          batchLabel={selectedBatch.label}
          readOnly={readOnly}
        />
      ) : activeTab === "insurance" ? (
        <InsuranceDetailsTable
          candidates={selectedBatch.candidateRecords}
          project={project}
          center={center}
          batchLabel={selectedBatch.label}
          readOnly={readOnly}
        />
      ) : (
        <CertificationTable
          candidates={selectedBatch.candidateRecords}
          project={project}
          center={center}
          batchLabel={selectedBatch.label}
          readOnly={readOnly}
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

function TrainingDetailTable({ candidates, project, center, batchLabel }) {
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
      { key: "centerName", header: "Center", exportValue: () => center.name },
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
    [project.name, center.name, batchLabel]
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
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Center</th>
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
                  <p className="text-slate-300">{center.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{center.location}</p>
                </td>
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

function KitDistributionTable({ candidates, project, center, batchLabel, readOnly = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [issuedState, setIssuedState] = useState(() =>
    Object.fromEntries(candidates.map((candidate, index) => [candidate.id, buildKitIssuedState(candidate, index)]))
  );
  const [proofState, setProofState] = useState({});

  useEffect(() => {
    setIssuedState(Object.fromEntries(candidates.map((candidate, index) => [candidate.id, buildKitIssuedState(candidate, index)])));
    setProofState({});
  }, [candidates]);

  const rows = useMemo(
    () =>
      candidates.map((candidate) => ({
        ...candidate,
        issued: issuedState[candidate.id] || {},
        proofImage: proofState[candidate.id]?.url || "",
        proofImageName: proofState[candidate.id]?.name || "",
        status: getKitStatus(issuedState[candidate.id] || {}),
      })),
    [candidates, issuedState, proofState]
  );
  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return rows.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.candidateCode.toLowerCase().includes(query) ||
        candidate.jobRole.toLowerCase().includes(query);
      const matchesStatus = !statusFilter || candidate.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);
  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Student" },
      { key: "candidateCode", header: "Candidate Code" },
      { key: "projectName", header: "Project", exportValue: () => project.name },
      { key: "centerName", header: "Center", exportValue: () => center.location },
      { key: "batchLabel", header: "Batch", exportValue: () => batchLabel },
      ...KIT_ITEM_CONFIG.map((item) => ({
        key: item.key,
        header: item.label,
        exportValue: (candidate) => (candidate.issued[item.key] ? "Issued" : "Pending"),
      })),
      {
        key: "proofImage",
        header: "Proof Image",
        exportValue: (candidate) => candidate.proofImageName || "Not uploaded",
      },
      { key: "status", header: "Status" },
    ],
    [batchLabel, center.location, project.name]
  );

  const toggleItem = (candidateId, itemKey) => {
    setIssuedState((current) => ({
      ...current,
      [candidateId]: {
        ...(current[candidateId] || {}),
        [itemKey]: !current[candidateId]?.[itemKey],
      },
    }));
  };

  const uploadProofImage = (candidateId, file) => {
    if (!file) return;
    setProofState((current) => ({
      ...current,
      [candidateId]: {
        name: file.name,
        url: URL.createObjectURL(file),
      },
    }));
  };

  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search kit distribution..."
        resultCount={filteredRows.length}
        onClear={() => {
          setSearchTerm("");
          setStatusFilter("");
        }}
      >
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["Completed", "Partial", "Pending"]} />
        <TableExportActions
          moduleName="Kit Distribution"
          fileName="kit_distribution"
          columns={exportColumns}
          rows={filteredRows}
          company={{ name: "Pantiss ERP", logo: "/activity.png" }}
        />
      </TableToolbar>
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[1340px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Center</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              {KIT_ITEM_CONFIG.map((item) => (
                <th key={item.key} className="px-4 py-3 font-medium">{item.label}</th>
              ))}
              <th className="px-4 py-3 font-medium">Proof Image</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredRows.map((candidate) => (
              <tr key={candidate.id} className="align-top transition hover:bg-violet-500/[0.06]">
                <td className="px-4 py-4">
                  <p className="font-medium text-white">{candidate.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{candidate.candidateCode}</p>
                </td>
                <td className="px-4 py-4 text-slate-300">{project.name}</td>
                <td className="px-4 py-4 text-slate-300">{center.location}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
                    {batchLabel}
                  </span>
                </td>
                {KIT_ITEM_CONFIG.map((item) => (
                  <td key={item.key} className="px-4 py-4">
                    <label className={`inline-flex items-center gap-2 text-xs font-semibold text-slate-300 ${readOnly ? "" : "cursor-pointer"}`}>
                      {readOnly ? (
                        <span className={`h-2.5 w-2.5 rounded-full ${candidate.issued[item.key] ? "bg-emerald-400" : "bg-slate-500"}`} />
                      ) : (
                        <input
                          type="checkbox"
                          checked={Boolean(candidate.issued[item.key])}
                          onChange={() => toggleItem(candidate.id, item.key)}
                          className="h-4 w-4 rounded border-slate-600 bg-[#0b1220] accent-violet-500"
                        />
                      )}
                      {candidate.issued[item.key] ? "Issued" : "Pending"}
                    </label>
                  </td>
                ))}
                <td className="px-4 py-4">
                  <KitProofUploadCell candidate={candidate} readOnly={readOnly} onUpload={uploadProofImage} />
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getKitStatusClass(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </td>
              </tr>
            ))}
            {!filteredRows.length && (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-sm font-bold text-slate-500">
                  No kit records match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KitProofUploadCell({ candidate, readOnly = false, onUpload }) {
  if (readOnly) {
    return candidate.proofImage ? (
      <div className="flex items-center gap-3">
        <img
          src={candidate.proofImage}
          alt=""
          className="h-12 w-12 rounded-lg border border-white/10 object-cover"
        />
        <p className="max-w-36 truncate text-xs font-semibold text-white/80">{candidate.proofImageName}</p>
      </div>
    ) : (
      <span className="text-xs font-semibold text-slate-500">Not uploaded</span>
    );
  }

  return (
    <div className="min-w-48">
      {candidate.proofImage ? (
        <div className="flex items-center gap-3">
          <img
            src={candidate.proofImage}
            alt=""
            className="h-12 w-12 rounded-lg border border-white/10 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white/80">{candidate.proofImageName}</p>
            <label className="mt-1 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-violet-200 transition hover:text-violet-100">
              <Upload size={12} />
              Replace
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => onUpload(candidate.id, event.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      ) : (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-xs font-black text-violet-200 transition hover:bg-violet-500/15">
          <Upload size={14} />
          Upload Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => onUpload(candidate.id, event.target.files?.[0])}
          />
        </label>
      )}
    </div>
  );
}

function InsuranceDetailsTable({ candidates, project, center, batchLabel, readOnly = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [insuranceState, setInsuranceState] = useState(() =>
    Object.fromEntries(candidates.map((candidate, index) => [candidate.id, buildInsuranceRecord(candidate, index)]))
  );

  useEffect(() => {
    setInsuranceState(Object.fromEntries(candidates.map((candidate, index) => [candidate.id, buildInsuranceRecord(candidate, index)])));
  }, [candidates]);

  const rows = useMemo(
    () => candidates.map((candidate) => ({ ...candidate, insurance: insuranceState[candidate.id] || {} })),
    [candidates, insuranceState]
  );
  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return rows.filter((candidate) => {
      const record = candidate.insurance;
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.candidateCode.toLowerCase().includes(query) ||
        String(record.policyNo || "").toLowerCase().includes(query) ||
        String(record.provider || "").toLowerCase().includes(query);
      const matchesStatus = !statusFilter || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);
  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Student" },
      { key: "candidateCode", header: "Candidate Code" },
      { key: "projectName", header: "Project", exportValue: () => project.name },
      { key: "centerName", header: "Center", exportValue: () => center.location },
      { key: "batchLabel", header: "Batch", exportValue: () => batchLabel },
      { key: "provider", header: "Provider", exportValue: (candidate) => candidate.insurance.provider },
      { key: "policyNo", header: "Policy No.", exportValue: (candidate) => candidate.insurance.policyNo || "Pending" },
      { key: "coverage", header: "Coverage", type: "number", exportValue: (candidate) => Number(candidate.insurance.coverage || 0) },
      { key: "startDate", header: "Start Date", exportValue: (candidate) => candidate.insurance.startDate || "-" },
      { key: "endDate", header: "End Date", exportValue: (candidate) => candidate.insurance.endDate || "-" },
      { key: "nominee", header: "Nominee", exportValue: (candidate) => candidate.insurance.nominee },
      { key: "status", header: "Status", exportValue: (candidate) => candidate.insurance.status },
    ],
    [batchLabel, center.location, project.name]
  );

  const updateInsurance = (candidateId, field, value) => {
    setInsuranceState((current) => ({
      ...current,
      [candidateId]: {
        ...(current[candidateId] || {}),
        [field]: value,
      },
    }));
  };

  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search insurance records..."
        resultCount={filteredRows.length}
        onClear={() => {
          setSearchTerm("");
          setStatusFilter("");
        }}
      >
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={INSURANCE_STATUSES} />
        <TableExportActions
          moduleName="Insurance Details"
          fileName="insurance_details"
          columns={exportColumns}
          rows={filteredRows}
          company={{ name: "Pantiss ERP", logo: "/activity.png" }}
        />
      </TableToolbar>
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[1540px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Policy No.</th>
              <th className="px-4 py-3 font-medium">Coverage</th>
              <th className="px-4 py-3 font-medium">Start</th>
              <th className="px-4 py-3 font-medium">End</th>
              <th className="px-4 py-3 font-medium">Nominee</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredRows.map((candidate) => (
              <tr key={candidate.id} className="align-top transition hover:bg-violet-500/[0.06]">
                <td className="px-4 py-4">
                  <p className="font-medium text-white">{candidate.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{candidate.candidateCode}</p>
                </td>
                <td className="px-4 py-4 text-slate-300">
                  <p>{project.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{center.location}</p>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
                    {batchLabel}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {readOnly ? (
                    <span className="text-xs font-bold text-slate-300">{candidate.insurance.provider || "—"}</span>
                  ) : (
                    <input
                      value={candidate.insurance.provider || ""}
                      onChange={(event) => updateInsurance(candidate.id, "provider", event.target.value)}
                      className="w-44 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-xs font-bold text-white outline-none focus:border-violet-400/50"
                    />
                  )}
                </td>
                <td className="px-4 py-4">
                  {readOnly ? (
                    <span className="text-xs font-bold text-slate-300">{candidate.insurance.policyNo || "Pending"}</span>
                  ) : (
                    <input
                      value={candidate.insurance.policyNo || ""}
                      onChange={(event) => updateInsurance(candidate.id, "policyNo", event.target.value)}
                      placeholder="Policy no."
                      className="w-36 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-xs font-bold text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50"
                    />
                  )}
                </td>
                <td className="px-4 py-4">
                  {readOnly ? (
                    <span className="text-xs font-bold text-slate-300">
                      {candidate.insurance.coverage ? `₹${formatNumber(candidate.insurance.coverage)}` : "—"}
                    </span>
                  ) : (
                    <input
                      type="number"
                      value={candidate.insurance.coverage || ""}
                      onChange={(event) => updateInsurance(candidate.id, "coverage", event.target.value)}
                      className="w-32 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-xs font-bold text-white outline-none focus:border-violet-400/50"
                    />
                  )}
                </td>
                <td className="px-4 py-4">
                  {readOnly ? (
                    <span className="text-xs font-bold text-slate-300">{candidate.insurance.startDate ? formatDate(candidate.insurance.startDate) : "—"}</span>
                  ) : (
                    <input
                      type="date"
                      value={candidate.insurance.startDate || ""}
                      onChange={(event) => updateInsurance(candidate.id, "startDate", event.target.value)}
                      className="w-36 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-xs font-bold text-white outline-none focus:border-violet-400/50"
                    />
                  )}
                </td>
                <td className="px-4 py-4">
                  {readOnly ? (
                    <span className="text-xs font-bold text-slate-300">{candidate.insurance.endDate ? formatDate(candidate.insurance.endDate) : "—"}</span>
                  ) : (
                    <input
                      type="date"
                      value={candidate.insurance.endDate || ""}
                      onChange={(event) => updateInsurance(candidate.id, "endDate", event.target.value)}
                      className="w-36 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-xs font-bold text-white outline-none focus:border-violet-400/50"
                    />
                  )}
                </td>
                <td className="px-4 py-4">
                  {readOnly ? (
                    <span className="text-xs font-bold text-slate-300">{candidate.insurance.nominee || "—"}</span>
                  ) : (
                    <input
                      value={candidate.insurance.nominee || ""}
                      onChange={(event) => updateInsurance(candidate.id, "nominee", event.target.value)}
                      className="w-28 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-xs font-bold text-white outline-none focus:border-violet-400/50"
                    />
                  )}
                </td>
                <td className="px-4 py-4">
                  {readOnly ? (
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${getInsuranceStatusClass(candidate.insurance.status || "Pending")}`}>
                      {candidate.insurance.status || "Pending"}
                    </span>
                  ) : (
                    <select
                      value={candidate.insurance.status || "Pending"}
                      onChange={(event) => updateInsurance(candidate.id, "status", event.target.value)}
                      className={`w-36 rounded-xl border px-3 py-2 text-xs font-black outline-none ${getInsuranceStatusClass(candidate.insurance.status || "Pending")}`}
                    >
                      {INSURANCE_STATUSES.map((status) => (
                        <option key={status} value={status} className="bg-[#0f172a] text-white">
                          {status}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
            {!filteredRows.length && (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-sm font-bold text-slate-500">
                  No insurance records match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProgressValue({ value }) {
  const tone = value >= 85 ? "bg-emerald-400" : value >= 70 ? "bg-sky-400" : "bg-amber-400";
  return (
    <div className="min-w-28">
      <p className="font-black text-white">{value}%</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function CertificationTable({ candidates, project, center, batchLabel, readOnly = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [certState, setCertState] = useState(() =>
    Object.fromEntries(candidates.map((candidate, index) => [candidate.id, buildCertificationRecord(candidate, index)]))
  );

  useEffect(() => {
    setCertState(Object.fromEntries(candidates.map((candidate, index) => [candidate.id, buildCertificationRecord(candidate, index)])));
  }, [candidates]);

  const rows = useMemo(
    () => candidates.map((candidate) => ({ ...candidate, certification: certState[candidate.id] || {} })),
    [candidates, certState]
  );
  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return rows.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.candidateCode.toLowerCase().includes(query) ||
        candidate.jobRole.toLowerCase().includes(query) ||
        String(candidate.certification.certificateId || "").toLowerCase().includes(query);
      const matchesStatus = !statusFilter || candidate.certification.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);
  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Student" },
      { key: "candidateCode", header: "Candidate Code" },
      { key: "projectName", header: "Project", exportValue: () => project.name },
      { key: "centerName", header: "Center", exportValue: () => center.name },
      { key: "batchLabel", header: "Batch", exportValue: () => batchLabel },
      { key: "jobRole", header: "Job Role" },
      { key: "attendanceRate", header: "Attendance %", type: "number" },
      { key: "trainingProgress", header: "Module %", type: "number" },
      { key: "status", header: "Certification Status", exportValue: (candidate) => candidate.certification.status },
      { key: "certificateId", header: "Certificate ID", exportValue: (candidate) => candidate.certification.certificateId || "-" },
      { key: "certifiedOn", header: "Certified On", exportValue: (candidate) => candidate.certification.certifiedOn || "-" },
      { key: "certificateFile", header: "Certificate File", exportValue: (candidate) => candidate.certification.certificateFile?.name || "Not uploaded" },
    ],
    [batchLabel, center.name, project.name]
  );

  const updateCertification = (candidateId, field, value) => {
    setCertState((current) => {
      const next = { ...(current[candidateId] || {}), [field]: value };
      if (field === "status" && value === "Certified" && !next.certifiedOn) {
        next.certifiedOn = new Date().toISOString().split("T")[0];
      }
      if (field === "status" && value !== "Certified") {
        next.certificateId = "";
        next.certifiedOn = "";
        next.certificateFile = null;
      }
      return { ...current, [candidateId]: next };
    });
  };

  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search certifications..."
        resultCount={filteredRows.length}
        onClear={() => {
          setSearchTerm("");
          setStatusFilter("");
        }}
      >
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={CERTIFICATION_STATUSES} />
        <TableExportActions
          moduleName="Certification"
          fileName="certification"
          columns={exportColumns}
          rows={filteredRows}
          company={{ name: "Pantiss ERP", logo: "/activity.png" }}
        />
      </TableToolbar>
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[1540px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Center</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Attendance</th>
              <th className="px-4 py-3 font-medium">Module</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Certificate ID</th>
              <th className="px-4 py-3 font-medium">Certified On</th>
              <th className="px-4 py-3 font-medium">Super Admin Certificate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredRows.map((candidate) => {
              const disabled = candidate.certification.status !== "Certified";
              return (
                <tr key={candidate.id} className="align-top transition hover:bg-violet-500/[0.06]">
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{candidate.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{candidate.candidateCode}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{project.name}</td>
                  <td className="px-4 py-4">
                    <p className="text-slate-300">{center.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{center.location}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
                      {batchLabel}
                    </span>
                  </td>
                  <td className="px-4 py-4"><ProgressValue value={candidate.attendanceRate} /></td>
                  <td className="px-4 py-4"><ProgressValue value={candidate.trainingProgress} /></td>
                  <td className="px-4 py-4">
                    {readOnly ? (
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${getTrainingStatusMeta(candidate.certification.status || "Pending").badgeClass}`}>
                        {candidate.certification.status || "Pending"}
                      </span>
                    ) : (
                      <select
                        value={candidate.certification.status || "Pending"}
                        onChange={(event) => updateCertification(candidate.id, "status", event.target.value)}
                        className="w-36 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-xs font-black text-white outline-none focus:border-violet-400/50"
                      >
                        {CERTIFICATION_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {readOnly ? (
                      <span className="text-xs font-bold text-slate-300">{candidate.certification.certificateId || "—"}</span>
                    ) : (
                      <input
                        value={candidate.certification.certificateId || ""}
                        onChange={(event) => updateCertification(candidate.id, "certificateId", event.target.value)}
                        disabled={disabled}
                        placeholder="Certificate no."
                        className="w-44 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-xs font-bold text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50 disabled:cursor-not-allowed disabled:opacity-45"
                      />
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {readOnly ? (
                      <span className="text-xs font-bold text-slate-300">
                        {candidate.certification.certifiedOn ? formatDate(candidate.certification.certifiedOn) : "—"}
                      </span>
                    ) : (
                      <input
                        type="date"
                        value={candidate.certification.certifiedOn || ""}
                        onChange={(event) => updateCertification(candidate.id, "certifiedOn", event.target.value)}
                        disabled={disabled}
                        className="w-36 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-xs font-bold text-white outline-none focus:border-violet-400/50 disabled:cursor-not-allowed disabled:opacity-45"
                      />
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {candidate.certification.certificateFile ? (
                      <div className="min-w-52 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                        <div className="flex items-start gap-2">
                          <FileText size={14} className="mt-0.5 shrink-0 text-emerald-300" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-black text-white">
                              {candidate.certification.certificateFile.name}
                            </p>
                            <p className="mt-1 text-[11px] font-bold text-emerald-200/75">
                              Uploaded by {candidate.certification.certificateFile.uploadedBy || "Super Admin"} on {candidate.certification.certificateFile.uploadedOn}
                            </p>
                          </div>
                        </div>
                        <a
                          href={candidate.certification.certificateFile.url}
                          download={candidate.certification.certificateFile.name}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/20 px-3 py-2 text-xs font-black text-emerald-200 transition hover:bg-emerald-500/15"
                        >
                          <Download size={13} />
                          Download
                        </a>
                      </div>
                    ) : (
                      <span className="inline-flex min-w-52 items-center justify-center rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-xs font-black text-white/35">
                        Awaiting Super Admin upload
                      </span>
                    )}
                    {candidate.certification.certificateFile?.uploadedOn && (
                      <p className="mt-1 text-[11px] font-bold text-emerald-300">Ready to download</p>
                    )}
                  </td>
                </tr>
              );
            })}
            {!filteredRows.length && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm font-bold text-slate-500">
                  No certification records match the current filters.
                </td>
              </tr>
            )}
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
  readOnly = false,
  onUpdateEnrollmentStatus,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [previewEnrollmentDoc, setPreviewEnrollmentDoc] = useState(null);
  const [viewEnrollmentCandidate, setViewEnrollmentCandidate] = useState(null);

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
      { key: "aadharNumber", header: "Aadhaar" },
      { key: "dateOfBirth", header: "DOB", type: "date" },
      { key: "gender", header: "Gender" },
      { key: "qualificationLevel", header: "Qualification" },
      { key: "qualificationTrade", header: "Trade" },
      { key: "qualificationInstitute", header: "Institute" },
      { key: "qualificationYear", header: "Passing Year" },
      { key: "experienceYears", header: "Experience" },
      { key: "currentlyEmployed", header: "Currently Employed" },
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
      <div className="max-h-[620px] overflow-auto">
        <table className="w-full min-w-[1960px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[260px]" />
            <col className="w-[250px]" />
            <col className="w-[190px]" />
            <col className="w-[150px]" />
            <col className="w-[160px]" />
            <col className="w-[270px]" />
            <col className="w-[160px]" />
            <col className="w-[250px]" />
            <col className="w-[140px]" />
            <col className="w-[140px]" />
            <col className="w-[190px]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-5 py-3.5 font-medium">Candidate</th>
              <th className="px-5 py-3.5 font-medium">Project / Center</th>
              <th className="px-5 py-3.5 font-medium">Job Role</th>
              <th className="px-5 py-3.5 font-medium">Aadhaar</th>
              <th className="px-5 py-3.5 font-medium">DOB / Gender</th>
              <th className="px-5 py-3.5 font-medium">Qualification</th>
              <th className="px-5 py-3.5 font-medium">Experience</th>
              <th className="px-5 py-3.5 font-medium">Documents</th>
              <th className="px-5 py-3.5 font-medium">Submitted</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredCandidates.map((candidate) => {
              const status = enrollmentState[candidate.id] || candidate.enrollmentStatus;
              return (
                <tr key={candidate.id} className="align-top transition hover:bg-violet-500/[0.06]">
                  <td className="px-5 py-5">
                    <div className="flex items-start gap-3">
                      {candidate.livePhoto ? (
                        <img
                          src={candidate.livePhoto}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-xl border border-white/10 object-cover"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{candidate.name}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">{candidate.candidateCode}</p>
                        <p className="mt-2 truncate text-xs text-slate-500">{candidate.phone}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">Mobilizer: {candidate.mobilizer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5">
                    <p className="line-clamp-2 font-medium leading-5 text-slate-200">{project.name}</p>
                    <p className="mt-2 text-xs text-slate-500">{center.name}</p>
                    <span className="mt-2 inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
                      {batchLabel}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    <span className="inline-flex rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold leading-5 text-slate-200">
                      {candidate.jobRole}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-slate-300">{candidate.aadharNumber || "—"}</td>
                  <td className="px-5 py-5">
                    <p className="text-slate-300">{candidate.dateOfBirth || "—"}</p>
                    <p className="mt-1 text-xs text-slate-500">{candidate.gender || "—"}</p>
                  </td>
                  <td className="px-5 py-5">
                    <p className="font-medium text-slate-200">{candidate.qualificationLevel || "—"}</p>
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <p className="truncate">{candidate.qualificationTrade || "—"}</p>
                      <p className="truncate">{candidate.qualificationInstitute || "—"}</p>
                      <p>{candidate.qualificationYear || "—"}</p>
                    </div>
                  </td>
                  <td className="px-5 py-5">
                    <p className="text-slate-300">{formatEnrollmentExperience(candidate.experienceYears)}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Employed: {candidate.currentlyEmployed || "—"}
                    </p>
                  </td>
                  <td className="px-5 py-5">
                    <div className="grid grid-cols-2 gap-2">
                      {ENROLLMENT_DOCUMENT_FIELDS.map((field) => {
                        const file = candidate.enrollmentDocuments?.[field.key];
                        const available = Boolean(getEnrollmentDocumentUrl(file));
                        return (
                          <button
                            key={field.key}
                            type="button"
                            disabled={!available}
                            onClick={() =>
                              setPreviewEnrollmentDoc({
                                label: field.label,
                                file,
                                candidate,
                              })
                            }
                            className={`inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold ${
                              available
                                ? "border-violet-400/20 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
                                : "cursor-not-allowed border-white/10 text-slate-600"
                            }`}
                          >
                            <FileText size={12} />
                            <span className="truncate">{field.label.split(" ")[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-5 text-slate-300">{candidate.enrollmentDate}</td>
                  <td className="px-5 py-5">
                    <EnrollmentStatusBadge status={status} />
                  </td>
                  <td className="px-5 py-5 text-right">
                    <div className="inline-flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => setViewEnrollmentCandidate(candidate)}
                        className="inline-flex w-full min-w-24 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                      >
                        <Eye size={13} />
                        View
                      </button>
                      {!readOnly && status === "Pending" ? (
                        <>
                        <button
                          type="button"
                          onClick={() => onUpdateEnrollmentStatus(candidate.id, "Approved")}
                          className="inline-flex w-full min-w-24 items-center justify-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          <CheckCircle size={13} />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateEnrollmentStatus(candidate.id, "Rejected")}
                          className="inline-flex w-full min-w-24 items-center justify-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <EnrollmentCandidatePanel
        candidate={viewEnrollmentCandidate}
        projectName={project.name}
        centerName={center.name}
        batchLabel={batchLabel}
        onClose={() => setViewEnrollmentCandidate(null)}
        onPreviewDocument={setPreviewEnrollmentDoc}
      />
      <EnrollmentDocumentPreview
        preview={previewEnrollmentDoc}
        onClose={() => setPreviewEnrollmentDoc(null)}
      />
    </div>
  );
}

function formatEnrollmentExperience(value) {
  if (!value) return "0 Years";
  return String(value).toLowerCase().includes("year") ? value : `${value} Years`;
}

function EnrollmentCandidatePanel({
  batchLabel,
  candidate,
  centerName,
  onClose,
  onPreviewDocument,
  projectName,
}) {
  return (
    <SlidePanel open={!!candidate} onClose={onClose} title="Enrollment Details" width="xl">
      {candidate ? (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            {candidate.livePhoto ? (
              <img
                src={candidate.livePhoto}
                alt=""
                className="h-20 w-20 rounded-xl border border-white/10 object-cover"
              />
            ) : null}
            <div>
              <h3 className="text-xl font-semibold text-white">{candidate.name}</h3>
              <p className="mt-1 text-sm text-violet-300">{candidate.jobRole}</p>
              <p className="mt-1 text-xs text-slate-500">
                {candidate.candidateCode} • {candidate.phone}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Project", projectName],
              ["Center", centerName],
              ["Batch", batchLabel],
              ["Mobilizer", candidate.mobilizer],
              ["Aadhaar", candidate.aadharNumber],
              ["Date of Birth", candidate.dateOfBirth],
              ["Gender", candidate.gender],
              ["Qualification", candidate.qualificationLevel],
              ["Trade / Discipline", candidate.qualificationTrade],
              ["Institute / Board", candidate.qualificationInstitute],
              ["Year of Passing", candidate.qualificationYear],
              ["Experience", formatEnrollmentExperience(candidate.experienceYears)],
              ["Currently Employed", candidate.currentlyEmployed],
              ["Address", candidate.address],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-sm text-slate-200">{value || "—"}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Uploaded Documents
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {ENROLLMENT_DOCUMENT_FIELDS.map((field) => {
                const file = candidate.enrollmentDocuments?.[field.key];
                const available = Boolean(getEnrollmentDocumentUrl(file));
                return (
                  <button
                    key={field.key}
                    type="button"
                    disabled={!available}
                    onClick={() => onPreviewDocument({ label: field.label, file, candidate })}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                      available
                        ? "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                        : "cursor-not-allowed border-white/10 text-slate-600"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <FileText size={15} />
                      {field.label}
                    </span>
                    <span className="text-xs">{available ? "Preview" : "Missing"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {candidate.liveLocation ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
              <p className="flex items-center gap-2 font-semibold text-white">
                <MapPin size={15} />
                Captured Location
              </p>
              <p className="mt-2">{candidate.liveLocation.place || "Location captured during enrollment"}</p>
              <p className="mt-1 text-xs text-slate-500">
                {candidate.liveLocation.lat}, {candidate.liveLocation.lng}
                {candidate.liveLocation.accuracy
                  ? ` • Accuracy +/-${Math.round(candidate.liveLocation.accuracy)} m`
                  : ""}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </SlidePanel>
  );
}

function EnrollmentDocumentPreview({ onClose, preview }) {
  const fileUrl = getEnrollmentDocumentUrl(preview?.file);

  return (
    <SlidePanel open={!!preview} onClose={onClose} title={preview?.label || "Document Preview"} width="xl">
      {preview ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-white">{preview.candidate?.name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {preview.candidate?.candidateCode} • {preview.file?.name || preview.label}
            </p>
          </div>
          {fileUrl ? (
            isEnrollmentPdf(preview.file) ? (
              <iframe
                src={fileUrl}
                title={preview.label}
                className="h-[70vh] w-full rounded-xl border border-white/10 bg-white"
              />
            ) : (
              <img
                src={fileUrl}
                alt={preview.label}
                className="max-h-[70vh] w-full rounded-xl border border-white/10 object-contain"
              />
            )
          ) : (
            <div className="rounded-xl border border-white/10 p-10 text-center text-slate-500">
              No preview available.
            </div>
          )}
        </div>
      ) : null}
    </SlidePanel>
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
  center,
  batchLabel,
  verificationState,
  readOnly = false,
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
      { key: "centerName", header: "Center", exportValue: () => center.name },
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
    [project.name, center.name, batchLabel, verificationState]
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
          <table className="w-full min-w-[1400px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Student Name</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Center</th>
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
                    <p className="text-slate-300">{center.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{center.location}</p>
                  </td>
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
                      {readOnly ? (
                        <span className={`h-2.5 w-2.5 rounded-full ${verificationState[candidate.id] ? "bg-emerald-400" : "bg-slate-500"}`} />
                      ) : (
                        <VerificationToggle
                          isVerified={verificationState[candidate.id]}
                          onToggle={() => onToggleVerification(candidate.id)}
                        />
                      )}
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
