import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  MapPin,
  Megaphone,
  Users,
} from "lucide-react";
import {
  ATTENDANCE_OVERVIEW,
  EMPLOYEES,
  PROJECT_REPORTS,
} from "./adminPortalData";

const ROLE_OPTIONS = [
  {
    key: "mobilizer",
    label: "Mobilizer",
    overviewKey: "mobilizers",
    icon: Megaphone,
    employeeRole: "Mobilizer",
    accentClass: "text-amber-300",
    cardClass:
      "border-amber-500/20 bg-gradient-to-br from-amber-500/[0.12] via-[#0f172a] to-[#020617]",
    badgeClass: "bg-amber-500/10 text-amber-300",
    progressClass: "bg-gradient-to-r from-amber-500 to-orange-400",
    stroke: "#f59e0b",
  },
  {
    key: "trainer",
    label: "Trainer",
    overviewKey: "trainers",
    icon: GraduationCap,
    employeeRole: "Trainer",
    accentClass: "text-emerald-300",
    cardClass:
      "border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.12] via-[#0f172a] to-[#020617]",
    badgeClass: "bg-emerald-500/10 text-emerald-300",
    progressClass: "bg-gradient-to-r from-emerald-500 to-cyan-400",
    stroke: "#34d399",
  },
  {
    key: "placement",
    label: "Placement Officer",
    overviewKey: "placementOfficers",
    icon: Briefcase,
    employeeRole: "Placement Officer",
    accentClass: "text-cyan-300",
    cardClass:
      "border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.12] via-[#0f172a] to-[#020617]",
    badgeClass: "bg-cyan-500/10 text-cyan-300",
    progressClass: "bg-gradient-to-r from-cyan-500 to-sky-400",
    stroke: "#22d3ee",
  },
  {
    key: "candidates",
    label: "Candidates",
    overviewKey: "candidates",
    icon: Users,
    accentClass: "text-fuchsia-300",
    cardClass:
      "border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/[0.12] via-[#0f172a] to-[#020617]",
    badgeClass: "bg-fuchsia-500/10 text-fuchsia-300",
    progressClass: "bg-gradient-to-r from-fuchsia-500 to-violet-400",
    stroke: "#a855f7",
  },
];

const HISTORY_DAYS = 7;
const DEFAULT_FOCUS_ROLE_KEY = "candidates";

const FIRST_NAMES = [
  "Aarav",
  "Diya",
  "Rohit",
  "Megha",
  "Nihar",
  "Pallavi",
  "Sanjay",
  "Ananya",
  "Ritika",
  "Sourav",
  "Priyanshi",
  "Debasis",
  "Tapan",
  "Aparna",
  "Kiran",
  "Lopamudra",
  "Rakesh",
  "Madhuri",
  "Harish",
  "Sasmita",
];

const LAST_NAMES = [
  "Sahu",
  "Das",
  "Pradhan",
  "Mohanty",
  "Behera",
  "Naik",
  "Panda",
  "Sahoo",
  "Patel",
  "Swain",
  "Rout",
  "Mishra",
  "Nayak",
  "Majhi",
  "Deo",
];

const LOCATION_SUFFIXES = [
  "Main Gate",
  "Jajpur Road",
  "Academic Block",
  "Workshop Bay",
  "Lab Wing",
  "Hostel Entry",
  "Placement Cell",
  "Admin Lobby",
  "Classroom Corridor",
];

const SCHEDULES = {
  mobilizer: { in: 10 * 60, out: 18 * 60 + 5, lateAfter: 10 * 60 + 15 },
  trainer: { in: 9 * 60, out: 17 * 60, lateAfter: 9 * 60 + 10 },
  placement: { in: 10 * 60, out: 18 * 60 + 15, lateAfter: 10 * 60 + 15 },
  candidates: { in: 9 * 60 + 15, out: 16 * 60 + 30, lateAfter: 9 * 60 + 20 },
};

const formatDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const todayKey = () => formatDateKey(new Date());

const formatDate = (date) =>
  date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDateFromKey = (dateKey) =>
  formatDate(new Date(`${dateKey}T00:00:00`));

const toPercent = (present, total) => {
  if (!total) return 0;
  return Math.round((present / total) * 100);
};

const average = (values) => {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const getHistoryWindow = (count) => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    dates.push(date);
  }

  return dates;
};

const getHistoryWindowKeys = () =>
  getHistoryWindow(HISTORY_DAYS).map((date) => formatDateKey(date));

const hashString = (value) =>
  Array.from(value).reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) % 1000003,
    7
  );

const formatTime24h = (minutesValue) => {
  const minutes = ((minutesValue % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`;
};

const getOffsetDateKey = (offsetDays) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - offsetDays);
  return formatDateKey(date);
};

const DUMMY_HISTORY_BLUEPRINTS = [
  {
    offsetDays: 0,
    roleKey: "trainer",
    projectName: "PMKVY 4.0",
    centerName: "Angul",
    name: "Aditya Sahu",
    code: 1,
    kind: "Employee",
    punchIn: "09:04:00",
    punchOut: "17:11:00",
    location: "Angul Academic Block",
    status: "On-time",
  },
  {
    offsetDays: 1,
    roleKey: "trainer",
    projectName: "PMKVY 4.0",
    centerName: "Angul",
    name: "Aditya Sahu",
    code: 1,
    kind: "Employee",
    punchIn: "09:13:00",
    punchOut: "17:07:00",
    location: "Angul Lab Wing",
    status: "Late",
  },
  {
    offsetDays: 0,
    roleKey: "trainer",
    projectName: "PMKVY 4.0",
    centerName: "Angul",
    name: "Nihar Ranjan",
    code: "TRA-02",
    kind: "Employee",
    punchIn: "09:08:00",
    punchOut: "17:09:00",
    location: "Angul Workshop Bay",
    status: "On-time",
  },
  {
    offsetDays: 2,
    roleKey: "trainer",
    projectName: "DMF Keonjhar",
    centerName: "Keonjhar",
    name: "Amit Panda",
    code: 7,
    kind: "Employee",
    punchIn: "09:21:00",
    punchOut: "17:03:00",
    location: "Keonjhar Lab Wing",
    status: "Late",
  },
  {
    offsetDays: 0,
    roleKey: "placement",
    projectName: "PMKVY 4.0",
    centerName: "Angul",
    name: "Meera Das",
    code: 2,
    kind: "Employee",
    punchIn: "10:03:00",
    punchOut: "18:22:00",
    location: "Angul Placement Cell",
    status: "On-time",
  },
  {
    offsetDays: 1,
    roleKey: "placement",
    projectName: "PMKVY 4.0",
    centerName: "Angul",
    name: "Pallavi Nayak",
    code: "PLA-02",
    kind: "Employee",
    punchIn: "10:19:00",
    punchOut: "18:17:00",
    location: "Angul Admin Lobby",
    status: "Late",
  },
  {
    offsetDays: 0,
    roleKey: "placement",
    projectName: "Shaksham Sundargarh",
    centerName: "Sundargarh",
    name: "Pooja Patel",
    code: 10,
    kind: "Employee",
    punchIn: "10:06:00",
    punchOut: "18:24:00",
    location: "Sundargarh Placement Cell",
    status: "On-time",
  },
  {
    offsetDays: 0,
    roleKey: "mobilizer",
    projectName: "CSR - Tata Steel",
    centerName: "Jharsuguda",
    name: "Rahul Pradhan",
    code: 3,
    kind: "Employee",
    punchIn: "09:58:00",
    punchOut: "18:04:00",
    location: "Jharsuguda Main Gate",
    status: "On-time",
  },
  {
    offsetDays: 1,
    roleKey: "mobilizer",
    projectName: "CSR - Tata Steel",
    centerName: "Jharsuguda",
    name: "Sasmita Deo",
    code: "MOB-02",
    kind: "Employee",
    punchIn: "10:22:00",
    punchOut: "18:01:00",
    location: "Jharsuguda Community Desk",
    status: "Late",
  },
  {
    offsetDays: 2,
    roleKey: "mobilizer",
    projectName: "DDUGKY",
    centerName: "Kalahandi",
    name: "Sonal Behera",
    code: 6,
    kind: "Employee",
    punchIn: "10:05:00",
    punchOut: "18:12:00",
    location: "Kalahandi Main Gate",
    status: "On-time",
  },
  {
    offsetDays: 0,
    roleKey: "candidates",
    projectName: "PMKVY 4.0",
    centerName: "Angul",
    batchLabel: "Batch 101",
    name: "Ananya Das",
    code: "BATCH-101-01",
    kind: "Student",
    punchIn: "09:16:00",
    punchOut: "16:32:00",
    location: "Angul Classroom Corridor",
    status: "On-time",
  },
  {
    offsetDays: 0,
    roleKey: "candidates",
    projectName: "PMKVY 4.0",
    centerName: "Angul",
    batchLabel: "Batch 101",
    name: "Rohit Naik",
    code: "BATCH-101-02",
    kind: "Student",
    punchIn: "09:29:00",
    punchOut: "16:26:00",
    location: "Angul Academic Block",
    status: "Late",
  },
  {
    offsetDays: 0,
    roleKey: "candidates",
    projectName: "PMKVY 4.0",
    centerName: "Angul",
    batchLabel: "Batch 101",
    name: "Diya Panda",
    code: "BATCH-101-03",
    kind: "Student",
    punchIn: "",
    punchOut: "",
    location: "—",
    status: "Absent",
  },
  {
    offsetDays: 1,
    roleKey: "candidates",
    projectName: "PMKVY 4.0",
    centerName: "Angul",
    batchLabel: "Batch 101",
    name: "Ananya Das",
    code: "BATCH-101-01",
    kind: "Student",
    punchIn: "09:20:00",
    punchOut: "16:34:00",
    location: "Angul Classroom Corridor",
    status: "On-time",
  },
  {
    offsetDays: 1,
    roleKey: "candidates",
    projectName: "PMKVY 4.0",
    centerName: "Angul",
    batchLabel: "Batch 101",
    name: "Rohit Naik",
    code: "BATCH-101-02",
    kind: "Student",
    punchIn: "09:31:00",
    punchOut: "16:22:00",
    location: "Angul Workshop Bay",
    status: "Late",
  },
  {
    offsetDays: 0,
    roleKey: "candidates",
    projectName: "PMKVY 4.0",
    centerName: "Angul",
    batchLabel: "Batch 102",
    name: "Sourav Pradhan",
    code: "BATCH-102-01",
    kind: "Student",
    punchIn: "09:18:00",
    punchOut: "16:29:00",
    location: "Angul Classroom Corridor",
    status: "On-time",
  },
  {
    offsetDays: 2,
    roleKey: "candidates",
    projectName: "CSR - Tata Steel",
    centerName: "Jharsuguda",
    batchLabel: "Batch 301",
    name: "Megha Mohanty",
    code: "BATCH-301-01",
    kind: "Student",
    punchIn: "09:24:00",
    punchOut: "16:18:00",
    location: "Jharsuguda Academic Block",
    status: "Late",
  },
];

const buildThumbDataUrl = (name, label, accent) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="0 0 84 84">
      <rect width="84" height="84" rx="16" fill="#111827" />
      <rect x="3" y="3" width="78" height="78" rx="13" fill="none" stroke="${accent}" stroke-width="3" />
      <circle cx="42" cy="33" r="16" fill="${accent}" opacity="0.22" />
      <text x="42" y="39" text-anchor="middle" fill="#f8fafc" font-family="Arial, sans-serif" font-size="16" font-weight="700">${initials}</text>
      <rect x="16" y="56" width="52" height="16" rx="8" fill="${accent}" opacity="0.22" />
      <text x="42" y="67" text-anchor="middle" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" font-weight="700">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const getAttendanceStatusMeta = (status) => {
  if (status === "On-time") {
    return "bg-emerald-500/10 text-emerald-300";
  }

  if (status === "Late") {
    return "bg-rose-500/10 text-rose-300";
  }

  if (status === "Absent") {
    return "bg-slate-500/[0.15] text-slate-300";
  }

  return "bg-amber-500/10 text-amber-300";
};

const buildProjectSummaries = () => {
  const projectMap = new Map();

  ATTENDANCE_OVERVIEW.forEach((entry) => {
    const existing = projectMap.get(entry.project) || {
      project: entry.project,
      centers: [],
    };

    existing.centers.push(entry);
    projectMap.set(entry.project, existing);
  });

  return Array.from(projectMap.values())
    .map((project) => {
      const totals = ROLE_OPTIONS.reduce((roleTotals, role) => {
        const aggregate = project.centers.reduce(
          (summary, center) => {
            const roleData = center[role.overviewKey];

            summary.present += roleData.present;
            summary.total += roleData.total;
            summary.trend = summary.trend.map(
              (value, index) => value + roleData.trend[index]
            );

            return summary;
          },
          { present: 0, total: 0, trend: Array(HISTORY_DAYS).fill(0) }
        );

        roleTotals[role.key] = {
          ...aggregate,
          rate: toPercent(aggregate.present, aggregate.total),
          weeklyAverage: average(aggregate.trend),
        };

        return roleTotals;
      }, {});

      const staffPresent =
        totals.mobilizer.present + totals.trainer.present + totals.placement.present;
      const staffTotal =
        totals.mobilizer.total + totals.trainer.total + totals.placement.total;

      return {
        project: project.project,
        centers: project.centers,
        centerCount: project.centers.length,
        centerNames: project.centers.map((center) => center.center),
        totals,
        staffPresent,
        staffTotal,
        staffRate: toPercent(staffPresent, staffTotal),
        candidateRate: totals.candidates.rate,
      };
    })
    .sort((left, right) => left.project.localeCompare(right.project));
};

const buildOverallRoleMetrics = (projectSummaries) =>
  ROLE_OPTIONS.reduce((summary, role) => {
    const aggregate = projectSummaries.reduce(
      (totals, project) => {
        const roleTotals = project.totals[role.key];

        totals.present += roleTotals.present;
        totals.total += roleTotals.total;
        totals.trend = totals.trend.map(
          (value, index) => value + roleTotals.trend[index]
        );

        return totals;
      },
      { present: 0, total: 0, trend: Array(HISTORY_DAYS).fill(0) }
    );

    summary[role.key] = {
      ...aggregate,
      rate: toPercent(aggregate.present, aggregate.total),
      weeklyAverage: average(aggregate.trend),
    };

    return summary;
  }, {});

const getPresenceForDate = (roleData, selectedDateKey) => {
  const historyIndex = getHistoryWindowKeys().indexOf(selectedDateKey);
  if (historyIndex >= 0 && roleData?.trend?.[historyIndex] !== undefined) {
    return roleData.trend[historyIndex];
  }
  return roleData?.present || 0;
};

const parseCandidateBatch = (entry, index) => {
  const parts = entry.split(" - ");
  const maybeSize = Number(parts.at(-1));

  if (parts.length > 1 && !Number.isNaN(maybeSize)) {
    return {
      id: `batch-${index + 1}`,
      label: parts.slice(0, -1).join(" - "),
      size: maybeSize,
    };
  }

  return {
    id: `batch-${index + 1}`,
    label: entry,
    size: 35,
  };
};

const buildFallbackBatches = (centerName, totalCandidates) => {
  const batchCount =
    totalCandidates <= 40 ? 1 : totalCandidates <= 90 ? 2 : totalCandidates <= 150 ? 3 : 4;
  const baseCount = Math.floor(totalCandidates / batchCount);
  const remainder = totalCandidates % batchCount;

  return Array.from({ length: batchCount }, (_, index) => ({
    id: `${centerName}-batch-${index + 1}`,
    label: `Batch ${String(index + 1).padStart(2, "0")}`,
    size: baseCount + (index < remainder ? 1 : 0),
  }));
};

const getBatchOptionsForCenter = (projectName, centerName, totalCandidates) => {
  const report = PROJECT_REPORTS.find((item) => item.name === projectName);
  const reportCenter = report?.centers.find(
    (center) =>
      center.location === centerName ||
      center.name.toLowerCase().includes(centerName.toLowerCase())
  );

  if (reportCenter?.candidateList?.length) {
    return reportCenter.candidateList.map(parseCandidateBatch);
  }

  return buildFallbackBatches(centerName, totalCandidates);
};

const distributeByBatchSizes = (totalPresent, batchSizes) => {
  const batchTotal = batchSizes.reduce((sum, size) => sum + size, 0);
  if (!batchTotal) return batchSizes.map(() => 0);

  const provisional = batchSizes.map((size, index) => {
    const exact = (totalPresent * size) / batchTotal;
    return {
      index,
      count: Math.floor(exact),
      remainder: exact - Math.floor(exact),
    };
  });

  let remaining = totalPresent - provisional.reduce((sum, item) => sum + item.count, 0);

  provisional
    .sort((left, right) => right.remainder - left.remainder)
    .forEach((item) => {
      if (remaining > 0) {
        item.count += 1;
        remaining -= 1;
      }
    });

  return provisional
    .sort((left, right) => left.index - right.index)
    .map((item) => item.count);
};

const buildSyntheticName = (seedKey, usedNames) => {
  let cursor = 0;

  while (cursor < 200) {
    const seed = hashString(`${seedKey}-${cursor}`);
    const firstName = FIRST_NAMES[seed % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(seed + cursor) % LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;

    if (!usedNames.has(fullName)) {
      usedNames.add(fullName);
      return fullName;
    }

    cursor += 1;
  }

  return `${seedKey.replace(/[^a-z0-9]/gi, "").slice(0, 8)} ${cursor}`;
};

const buildEmployeeRoster = ({
  role,
  projectName,
  centerName,
  totalCount,
}) => {
  const matchingEmployees = EMPLOYEES.filter(
    (employee) =>
      employee.project === projectName &&
      employee.center === centerName &&
      employee.role === role.employeeRole
  );

  const usedNames = new Set(matchingEmployees.map((employee) => employee.name));

  const roster = matchingEmployees.map((employee, index) => ({
    id: `emp-${role.key}-${centerName}-${index + 1}`,
    name: employee.name,
    code: employee.id,
    kind: "Employee",
  }));

  while (roster.length < totalCount) {
    const syntheticIndex = roster.length + 1;
    roster.push({
      id: `emp-${role.key}-${centerName}-${syntheticIndex}`,
      name: buildSyntheticName(
        `${role.key}-${projectName}-${centerName}-${syntheticIndex}`,
        usedNames
      ),
      code: `${role.key.slice(0, 3).toUpperCase()}-${String(syntheticIndex).padStart(
        2,
        "0"
      )}`,
      kind: "Employee",
    });
  }

  return roster.slice(0, totalCount);
};

const buildCandidateRoster = ({
  projectName,
  centerName,
  batchLabel,
  batchSize,
}) => {
  const usedNames = new Set();

  return Array.from({ length: batchSize }, (_, index) => ({
    id: `cand-${centerName}-${batchLabel}-${index + 1}`,
    name: buildSyntheticName(
      `${projectName}-${centerName}-${batchLabel}-${index + 1}`,
      usedNames
    ),
    code: `${batchLabel.replace(/\s+/g, "-").toUpperCase()}-${String(
      index + 1
    ).padStart(2, "0")}`,
    kind: "Student",
  }));
};

const buildLocationLabel = (centerName, seed) =>
  `${centerName} ${LOCATION_SUFFIXES[seed % LOCATION_SUFFIXES.length]}`;

const sortAttendanceRows = (rows) =>
  [...rows].sort((left, right) => {
    if (left.status === "Absent" && right.status !== "Absent") return 1;
    if (left.status !== "Absent" && right.status === "Absent") return -1;
    return left.name.localeCompare(right.name);
  });

const getDummyAttendanceRows = ({
  roleKey,
  projectName,
  centerName,
  batchLabel,
  selectedDateKey,
  accentColor,
}) =>
  DUMMY_HISTORY_BLUEPRINTS.filter((record) => {
    if (record.roleKey !== roleKey) return false;
    if (record.projectName !== projectName) return false;
    if (record.centerName !== centerName) return false;
    if (getOffsetDateKey(record.offsetDays) !== selectedDateKey) return false;

    if (roleKey === "candidates") {
      return record.batchLabel === batchLabel;
    }

    return true;
  }).map((record) => ({
    id: `dummy-${roleKey}-${String(record.code)}-${selectedDateKey}`,
    name: record.name,
    code: record.code,
    kind: record.kind,
    punchIn: record.punchIn || "—",
    punchOut: record.punchOut || "—",
    location: record.location || "—",
    status: record.status,
    inImage: record.punchIn
      ? buildThumbDataUrl(record.name, "IN", accentColor)
      : null,
    outImage: record.punchOut
      ? buildThumbDataUrl(record.name, "OUT", accentColor)
      : null,
  }));

const mergeAttendanceRows = (baseRows, dummyRows) => {
  if (!dummyRows.length) return baseRows;

  const rowsByCode = new Map(baseRows.map((row) => [String(row.code), row]));
  dummyRows.forEach((row) => {
    rowsByCode.set(String(row.code), row);
  });

  return sortAttendanceRows(Array.from(rowsByCode.values()));
};

const buildAttendanceRows = ({
  roster,
  presentCount,
  selectedDateKey,
  roleKey,
  centerName,
  accentColor,
}) => {
  const schedule = SCHEDULES[roleKey];
  const selectedIsToday = selectedDateKey === todayKey();

  const rankedRoster = [...roster]
    .map((person) => ({
      ...person,
      seed: hashString(`${person.id}-${selectedDateKey}-${roleKey}-${centerName}`),
    }))
    .sort((left, right) => left.seed - right.seed);

  const presentIds = new Set(
    rankedRoster.slice(0, Math.min(presentCount, roster.length)).map((person) => person.id)
  );

  const rows = roster.map((person) => {
    const seed = hashString(`${person.id}-${selectedDateKey}-${roleKey}-${centerName}`);
    const isPresent = presentIds.has(person.id);

    if (!isPresent) {
      return {
        id: `${person.id}-${selectedDateKey}`,
        name: person.name,
        code: person.code,
        kind: person.kind,
        punchIn: "—",
        punchOut: "—",
        location: "—",
        status: "Absent",
        inImage: null,
        outImage: null,
      };
    }

    const punchInMinutes = schedule.in + ((seed % 34) - 10);
    const openLoop = selectedIsToday && seed % 6 === 0;
    const punchOutMinutes = schedule.out + ((seed % 26) - 8);
    const status = punchInMinutes > schedule.lateAfter ? "Late" : "On-time";

    return {
      id: `${person.id}-${selectedDateKey}`,
      name: person.name,
      code: person.code,
      kind: person.kind,
      punchIn: formatTime24h(punchInMinutes),
      punchOut: openLoop ? "—" : formatTime24h(punchOutMinutes),
      location: buildLocationLabel(centerName, seed),
      status,
      inImage: buildThumbDataUrl(person.name, "IN", accentColor),
      outImage: openLoop ? null : buildThumbDataUrl(person.name, "OUT", accentColor),
    };
  });

  return sortAttendanceRows(rows);
};

export default function AdminAttendanceOverview() {
  const projectSummaries = useMemo(() => buildProjectSummaries(), []);
  const overallRoleMetrics = useMemo(
    () => buildOverallRoleMetrics(projectSummaries),
    [projectSummaries]
  );

  const [selectedRoleKey, setSelectedRoleKey] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey());

  const selectedRole = useMemo(
    () => ROLE_OPTIONS.find((role) => role.key === selectedRoleKey) || null,
    [selectedRoleKey]
  );

  const selectedProjectSummary = useMemo(
    () =>
      projectSummaries.find((project) => project.project === selectedProject) || null,
    [projectSummaries, selectedProject]
  );

  const selectedCenterEntry = useMemo(
    () =>
      selectedProjectSummary?.centers.find((center) => center.center === selectedCenter) ||
      null,
    [selectedCenter, selectedProjectSummary]
  );

  const centerBatchOptions = useMemo(() => {
    if (!selectedCenterEntry) return [];

    return getBatchOptionsForCenter(
      selectedProjectSummary.project,
      selectedCenterEntry.center,
      selectedCenterEntry.candidates.total
    );
  }, [selectedCenterEntry, selectedProjectSummary]);

  const selectedBatchOption = useMemo(
    () => centerBatchOptions.find((batch) => batch.label === selectedBatch) || null,
    [centerBatchOptions, selectedBatch]
  );

  const requiresBatchStep = selectedRole?.key === "candidates";
  const focusRole =
    selectedRole ||
    ROLE_OPTIONS.find((role) => role.key === DEFAULT_FOCUS_ROLE_KEY) ||
    ROLE_OPTIONS[0];

  const overallPresent = ROLE_OPTIONS.reduce(
    (sum, role) => sum + overallRoleMetrics[role.key].present,
    0
  );
  const overallTotal = ROLE_OPTIONS.reduce(
    (sum, role) => sum + overallRoleMetrics[role.key].total,
    0
  );
  const overallRate = toPercent(overallPresent, overallTotal);

  const projectTrendRows = useMemo(
    () =>
      projectSummaries
        .map((project) => {
          const focusTotals = project.totals[focusRole.key];
          const trendDelta =
            focusTotals.trend[focusTotals.trend.length - 1] - focusTotals.trend[0];

          return {
            project: project.project,
            centerCount: project.centerCount,
            centerNames: project.centerNames,
            present: focusTotals.present,
            total: focusTotals.total,
            rate: focusTotals.rate,
            trend: focusTotals.trend,
            trendDelta,
            staffRate: project.staffRate,
            candidateRate: project.candidateRate,
          };
        })
        .sort((left, right) => right.rate - left.rate),
    [focusRole, projectSummaries]
  );

  const centerTrendRows = useMemo(
    () =>
      ATTENDANCE_OVERVIEW.map((center) => {
        const focusData = center[focusRole.overviewKey];
        const staffPresent =
          center.mobilizers.present +
          center.trainers.present +
          center.placementOfficers.present;
        const staffTotal =
          center.mobilizers.total +
          center.trainers.total +
          center.placementOfficers.total;

        return {
          center: center.center,
          project: center.project,
          present: focusData.present,
          total: focusData.total,
          rate: toPercent(focusData.present, focusData.total),
          trend: focusData.trend,
          trendDelta:
            focusData.trend[focusData.trend.length - 1] - focusData.trend[0],
          staffRate: toPercent(staffPresent, staffTotal),
          candidateRate: toPercent(center.candidates.present, center.candidates.total),
        };
      }).sort((left, right) => right.rate - left.rate),
    [focusRole]
  );

  const bestProject = projectTrendRows[0];
  const bestCenter = centerTrendRows[0];
  const watchProject = projectTrendRows[projectTrendRows.length - 1];
  const watchCenter = centerTrendRows[centerTrendRows.length - 1];

  const selectedRoleTotals =
    selectedRole && selectedCenterEntry ? selectedCenterEntry[selectedRole.overviewKey] : null;

  const selectedDatePresentCount = useMemo(() => {
    if (!selectedRole || !selectedCenterEntry) return 0;

    const datePresence = getPresenceForDate(selectedRoleTotals, selectedDateKey);

    if (!requiresBatchStep || !selectedBatchOption) {
      return datePresence;
    }

    const batchPresence = distributeByBatchSizes(
      datePresence,
      centerBatchOptions.map((batch) => batch.size)
    );
    const batchIndex = centerBatchOptions.findIndex(
      (batch) => batch.label === selectedBatchOption.label
    );

    return batchIndex >= 0 ? batchPresence[batchIndex] : 0;
  }, [
    centerBatchOptions,
    requiresBatchStep,
    selectedBatchOption,
    selectedCenterEntry,
    selectedDateKey,
    selectedRole,
    selectedRoleTotals,
  ]);

  const attendanceRows = useMemo(() => {
    if (!selectedRole || !selectedProjectSummary || !selectedCenterEntry) return [];
    if (requiresBatchStep && !selectedBatchOption) return [];

    if (requiresBatchStep) {
      const roster = buildCandidateRoster({
        projectName: selectedProjectSummary.project,
        centerName: selectedCenterEntry.center,
        batchLabel: selectedBatchOption.label,
        batchSize: selectedBatchOption.size,
      });

      const generatedRows = buildAttendanceRows({
        roster,
        presentCount: selectedDatePresentCount,
        selectedDateKey,
        roleKey: selectedRole.key,
        centerName: selectedCenterEntry.center,
        accentColor: focusRole.stroke,
      });

      const dummyRows = getDummyAttendanceRows({
        roleKey: selectedRole.key,
        projectName: selectedProjectSummary.project,
        centerName: selectedCenterEntry.center,
        batchLabel: selectedBatchOption.label,
        selectedDateKey,
        accentColor: focusRole.stroke,
      });

      return mergeAttendanceRows(generatedRows, dummyRows);
    }

    const roster = buildEmployeeRoster({
      role: selectedRole,
      projectName: selectedProjectSummary.project,
      centerName: selectedCenterEntry.center,
      totalCount: selectedRoleTotals.total,
    });

    const generatedRows = buildAttendanceRows({
      roster,
      presentCount: selectedDatePresentCount,
      selectedDateKey,
      roleKey: selectedRole.key,
      centerName: selectedCenterEntry.center,
      accentColor: focusRole.stroke,
    });

    const dummyRows = getDummyAttendanceRows({
      roleKey: selectedRole.key,
      projectName: selectedProjectSummary.project,
      centerName: selectedCenterEntry.center,
      batchLabel: "",
      selectedDateKey,
      accentColor: focusRole.stroke,
    });

    return mergeAttendanceRows(generatedRows, dummyRows);
  }, [
    focusRole.stroke,
    requiresBatchStep,
    selectedBatchOption,
    selectedCenterEntry,
    selectedDateKey,
    selectedDatePresentCount,
    selectedProjectSummary,
    selectedRole,
    selectedRoleTotals,
  ]);

  const currentStep = (() => {
    if (!selectedRole) return 1;
    if (!selectedProjectSummary) return 2;
    if (!selectedCenterEntry) return 3;
    if (requiresBatchStep && !selectedBatchOption) return 4;
    return requiresBatchStep ? 5 : 4;
  })();

  const handleRoleSelect = (roleKey) => {
    setSelectedRoleKey(roleKey);
    setSelectedProject("");
    setSelectedCenter("");
    setSelectedBatch("");
  };

  const handleProjectSelect = (projectName) => {
    setSelectedProject(projectName);
    setSelectedCenter("");
    setSelectedBatch("");
  };

  const handleCenterSelect = (centerName) => {
    setSelectedCenter(centerName);
    setSelectedBatch("");
  };

  const handleBack = () => {
    if (currentStep === 5) {
      setSelectedBatch("");
      return;
    }

    if (currentStep === 4 && requiresBatchStep) {
      setSelectedCenter("");
      return;
    }

    if (currentStep === 4 && !requiresBatchStep) {
      setSelectedCenter("");
      return;
    }

    if (currentStep === 3) {
      setSelectedProject("");
      setSelectedCenter("");
      return;
    }

    if (currentStep === 2) {
      setSelectedRoleKey("");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] px-3 py-4 text-white md:px-6 md:py-6">
      <div className="mx-auto max-w-[1550px] space-y-6">
        <header className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.98))] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                <ClipboardCheck size={14} />
                Attendance Overview
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Executive metrics stay visible on top, while role, project,
                  center, batch, and date-based attendance drill-down happens
                  below.
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-300">
                  The trendboard remains visible for leadership monitoring, and
                  the guided flow below now supports center selection, candidate
                  batch selection, and a calendar-based attendance table with
                  punch details and proof images.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <HeroMetricCard
                label="Overall Presence"
                value={`${overallRate}%`}
                caption={`${overallPresent}/${overallTotal} tracked staff and candidates present across all centers.`}
                accentClass="text-white"
                panelClass="border-cyan-500/[0.15] bg-cyan-500/10"
                icon={CheckCircle2}
              />
              <HeroMetricCard
                label="Projects"
                value={`${projectSummaries.length}`}
                caption={`Best current ${focusRole.label.toLowerCase()} project: ${bestProject?.project || "—"}.`}
                accentClass={focusRole.accentClass}
                panelClass="border-white/10 bg-white/[0.03]"
                icon={Building2}
              />
              <HeroMetricCard
                label="Centers"
                value={`${ATTENDANCE_OVERVIEW.length}`}
                caption={`Top center for ${focusRole.label.toLowerCase()}: ${bestCenter?.center || "—"}.`}
                accentClass={focusRole.accentClass}
                panelClass="border-white/10 bg-white/[0.03]"
                icon={MapPin}
              />
              <HeroMetricCard
                label={`${focusRole.label} Focus`}
                value={`${overallRoleMetrics[focusRole.key].rate}%`}
                caption={`${overallRoleMetrics[focusRole.key].present}/${overallRoleMetrics[focusRole.key].total} current attendance with a ${overallRoleMetrics[focusRole.key].weeklyAverage} weekly average.`}
                accentClass={focusRole.accentClass}
                panelClass="border-white/10 bg-white/[0.03]"
                icon={focusRole.icon}
              />
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ROLE_OPTIONS.map((role) => {
            const metric = overallRoleMetrics[role.key];
            const Icon = role.icon;

            return (
              <div
                key={role.key}
                className={`rounded-[24px] border p-5 shadow-[0_16px_40px_rgba(2,6,23,0.28)] ${role.cardClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${role.accentClass}`}
                  >
                    <Icon size={20} />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${role.badgeClass}`}>
                    {metric.rate}%
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-lg font-medium text-white">{role.label}</p>
                  <p className={`mt-3 text-4xl font-semibold ${role.accentClass}`}>
                    {metric.present}/{metric.total}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Weekly average {metric.weeklyAverage}
                  </p>
                </div>

                <div className="mt-5">
                  <MiniAreaChart
                    data={metric.trend}
                    stroke={role.stroke}
                    id={`overall-${role.key}`}
                  />
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#0b1220] p-5 shadow-[0_18px_60px_rgba(2,6,23,0.24)]">
          <div className="mb-5 border-b border-white/10 pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  Trendboard
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Project-wise and center-wise trends for {focusRole.label}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  These summaries stay visible at the top so the user can see the
                  bigger attendance picture before drilling into a single history
                  table.
                </p>
              </div>
              <span className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${focusRole.badgeClass}`}>
                Focus: {focusRole.label}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <TrendSpotlightCard
                title="Lead Project"
                name={bestProject?.project || "—"}
                rate={bestProject?.rate || 0}
                coverage={
                  bestProject
                    ? `${bestProject.present}/${bestProject.total} ${focusRole.label.toLowerCase()} present`
                    : "No data available"
                }
                insight={
                  bestProject
                    ? `${bestProject.centerCount} centers tracked with ${bestProject.staffRate}% staff strength and ${bestProject.candidateRate}% candidate coverage.`
                    : "No active project insight."
                }
                trend={bestProject?.trend || [0, 0]}
                stroke={focusRole.stroke}
                id={`spotlight-${focusRole.key}`}
                badgeClass={focusRole.badgeClass}
                accentClass={focusRole.accentClass}
                metricOneLabel="Trend Delta"
                metricOneValue={`${bestProject?.trendDelta >= 0 ? "+" : ""}${bestProject?.trendDelta ?? 0}`}
                metricTwoLabel="Centers"
                metricTwoValue={`${bestProject?.centerCount ?? 0}`}
              />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <TrendMetricTile
                  label="Top Center"
                  value={bestCenter?.center || "—"}
                  caption={
                    bestCenter
                      ? `${bestCenter.rate}% ${focusRole.label.toLowerCase()} attendance in ${bestCenter.project}.`
                      : "No center data available."
                  }
                  accentClass={focusRole.accentClass}
                  badgeClass={focusRole.badgeClass}
                  pill={`${bestCenter?.present ?? 0}/${bestCenter?.total ?? 0}`}
                />
                <TrendMetricTile
                  label="Watch Project"
                  value={watchProject?.project || "—"}
                  caption={
                    watchProject
                      ? `${watchProject.rate}% current coverage. Trend delta ${watchProject.trendDelta >= 0 ? "+" : ""}${watchProject.trendDelta}.`
                      : "No project watchpoint available."
                  }
                  accentClass="text-amber-300"
                  badgeClass="bg-amber-500/10 text-amber-300"
                  pill={`${watchProject?.rate ?? 0}%`}
                />
                <TrendMetricTile
                  label="Watch Center"
                  value={watchCenter?.center || "—"}
                  caption={
                    watchCenter
                      ? `${watchCenter.rate}% ${focusRole.label.toLowerCase()} attendance inside ${watchCenter.project}.`
                      : "No center watchpoint available."
                  }
                  accentClass="text-rose-300"
                  badgeClass="bg-rose-500/10 text-rose-300"
                  pill={`${watchCenter?.rate ?? 0}%`}
                />
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      Project Ladder
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Ranked project cards with coverage, operational context,
                      and 7-day movement.
                    </p>
                  </div>
                  <span className="text-sm text-slate-400">
                    {projectTrendRows.length} project
                    {projectTrendRows.length === 1 ? "" : "s"} tracked
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {projectTrendRows.map((project, index) => (
                    <div
                      key={project.project}
                      className={`rounded-[22px] border p-4 ${
                        index === 0
                          ? "md:col-span-2 border-white/[0.15] bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.12),_transparent_45%),linear-gradient(180deg,_rgba(255,255,255,0.05),_rgba(255,255,255,0.02))]"
                          : "border-white/10 bg-black/[0.14]"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold ${
                              index === 0
                                ? `${focusRole.badgeClass}`
                                : "border border-white/10 bg-white/[0.05] text-slate-300"
                            }`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <div>
                            <p className="text-lg font-medium text-white">
                              {project.project}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              {project.centerCount} center
                              {project.centerCount === 1 ? "" : "s"} tracked
                            </p>
                          </div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${focusRole.badgeClass}`}>
                          {project.rate}%
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <MiniStat label="Coverage" value={`${project.present}/${project.total}`} />
                        <MiniStat
                          label="Trend Delta"
                          value={`${project.trendDelta >= 0 ? "+" : ""}${project.trendDelta}`}
                        />
                        <MiniStat label="Staff Rate" value={`${project.staffRate}%`} />
                        <MiniStat label="Candidate Rate" value={`${project.candidateRate}%`} />
                      </div>

                      <div className="mt-4 rounded-[18px] border border-white/10 bg-black/[0.18] p-3">
                        <MiniAreaChart
                          data={project.trend}
                          stroke={focusRole.stroke}
                          id={`project-${project.project}`}
                          height={index === 0 ? 96 : 72}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.centerNames.map((centerName) => (
                          <span
                            key={`${project.project}-${centerName}`}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300"
                          >
                            {centerName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      Center Signal Wall
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Center cards make it easier to compare signals without
                      scanning a flat table.
                    </p>
                  </div>
                  <span className="text-sm text-slate-400">
                    Sorted by current {focusRole.label.toLowerCase()} attendance
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {centerTrendRows.map((center, index) => (
                    <CenterSignalCard
                      key={`${center.project}-${center.center}`}
                      rank={index + 1}
                      center={center}
                      focusRole={focusRole}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#0b1220] p-5 shadow-[0_18px_60px_rgba(2,6,23,0.24)]">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Guided View
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Role to project to center
                {requiresBatchStep ? " to batch" : ""} to date-based attendance
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Only one step is visible at a time. After role and project, the
                user now selects the center, and candidates additionally require
                a batch before the date-filtered attendance table is shown.
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
            {selectedRole ? (
              <SelectionSummary
                label="Attendance Type"
                value={selectedRole.label}
                onChange={() => {
                  setSelectedRoleKey("");
                  setSelectedProject("");
                  setSelectedCenter("");
                  setSelectedBatch("");
                }}
              />
            ) : null}

            {selectedProjectSummary ? (
              <SelectionSummary
                label="Project"
                value={selectedProjectSummary.project}
                onChange={() => {
                  setSelectedProject("");
                  setSelectedCenter("");
                  setSelectedBatch("");
                }}
              />
            ) : null}

            {selectedCenterEntry ? (
              <SelectionSummary
                label="Center"
                value={selectedCenterEntry.center}
                onChange={() => {
                  setSelectedCenter("");
                  setSelectedBatch("");
                }}
              />
            ) : null}

            {selectedBatchOption ? (
              <SelectionSummary
                label="Batch"
                value={selectedBatchOption.label}
                onChange={() => setSelectedBatch("")}
              />
            ) : null}
          </div>

          <div className="mt-5">
            {currentStep === 1 ? (
              <StepSection
                step="Step 1"
                title="Choose Which Attendance You Want To Track"
                description="Start by selecting the role whose attendance history you want to monitor."
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {ROLE_OPTIONS.map((role) => {
                    const metric = overallRoleMetrics[role.key];
                    const Icon = role.icon;

                    return (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => handleRoleSelect(role.key)}
                        className={`rounded-[24px] border p-5 text-left transition-all hover:-translate-y-0.5 ${role.cardClass}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${role.accentClass}`}
                          >
                            <Icon size={20} />
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${role.badgeClass}`}>
                            {metric.rate}%
                          </span>
                        </div>

                        <div className="mt-5">
                          <p className="text-lg font-medium text-white">{role.label}</p>
                          <p className={`mt-3 text-4xl font-semibold ${role.accentClass}`}>
                            {metric.present}/{metric.total}
                          </p>
                          <p className="mt-2 text-sm text-slate-400">
                            Weekly average {metric.weeklyAverage}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </StepSection>
            ) : null}

            {currentStep === 2 && selectedRole ? (
              <StepSection
                step="Step 2"
                title={`Select The Project For ${selectedRole.label} Attendance`}
                description="Project cards appear only after the role is selected."
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {projectSummaries.map((project) => {
                    const roleTotals = project.totals[selectedRole.key];

                    return (
                      <button
                        key={project.project}
                        type="button"
                        onClick={() => handleProjectSelect(project.project)}
                        className={`rounded-[24px] border p-5 text-left transition-all hover:-translate-y-0.5 ${selectedRole.cardClass}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-medium text-white">
                              {project.project}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              {project.centerCount} center
                              {project.centerCount === 1 ? "" : "s"} tracked
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedRole.badgeClass}`}>
                            {roleTotals.rate}%
                          </span>
                        </div>

                        <div className="mt-5">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                                Coverage
                              </p>
                              <p className="mt-2 text-2xl font-semibold text-white">
                                {roleTotals.present}/{roleTotals.total}
                              </p>
                            </div>
                            <div className="text-right text-sm text-slate-400">
                              {project.centerNames.join(", ")}
                            </div>
                          </div>

                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full rounded-full ${selectedRole.progressClass}`}
                              style={{ width: `${roleTotals.rate}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </StepSection>
            ) : null}

            {currentStep === 3 && selectedRole && selectedProjectSummary ? (
              <StepSection
                step="Step 3"
                title={`Select The Center For ${selectedRole.label} Attendance`}
                description="Centers now appear after the project selection, so attendance can be monitored center-wise before opening the table."
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {selectedProjectSummary.centers.map((center) => {
                    const roleTotals = center[selectedRole.overviewKey];

                    return (
                      <button
                        key={`${selectedProjectSummary.project}-${center.center}`}
                        type="button"
                        onClick={() => handleCenterSelect(center.center)}
                        className={`rounded-[24px] border p-5 text-left transition-all hover:-translate-y-0.5 ${selectedRole.cardClass}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-medium text-white">
                              {center.center}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              {selectedProjectSummary.project}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedRole.badgeClass}`}>
                            {toPercent(roleTotals.present, roleTotals.total)}%
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <MiniStat
                            label="Coverage"
                            value={`${roleTotals.present}/${roleTotals.total}`}
                          />
                          <MiniStat
                            label="7D Average"
                            value={`${average(roleTotals.trend)}`}
                          />
                        </div>

                        <div className="mt-4 rounded-[18px] border border-white/10 bg-black/[0.18] p-3">
                          <MiniAreaChart
                            data={roleTotals.trend}
                            stroke={selectedRole.stroke}
                            id={`step-center-${center.center}`}
                            height={70}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </StepSection>
            ) : null}

            {currentStep === 4 &&
            selectedRole &&
            selectedProjectSummary &&
            selectedCenterEntry &&
            requiresBatchStep ? (
              <StepSection
                step="Step 4"
                title="Select The Batch For Candidate Attendance"
                description="Candidate attendance requires one extra batch step before the date-filtered attendance table is shown."
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {centerBatchOptions.map((batch) => (
                    <button
                      key={`${selectedCenterEntry.center}-${batch.label}`}
                      type="button"
                      onClick={() => setSelectedBatch(batch.label)}
                      className={`rounded-[24px] border p-5 text-left transition-all hover:-translate-y-0.5 ${selectedRole.cardClass}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-medium text-white">
                            {batch.label}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {selectedCenterEntry.center}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedRole.badgeClass}`}>
                          {batch.size} learners
                        </span>
                      </div>

                      <div className="mt-5">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                          Candidate Capacity
                        </p>
                        <p className={`mt-2 text-3xl font-semibold ${selectedRole.accentClass}`}>
                          {batch.size}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </StepSection>
            ) : null}

            {((currentStep === 4 && !requiresBatchStep) ||
              (currentStep === 5 && requiresBatchStep)) &&
            selectedRole &&
            selectedProjectSummary &&
            selectedCenterEntry &&
            (!requiresBatchStep || selectedBatchOption) ? (
              <StepSection
                step={requiresBatchStep ? "Step 5" : "Step 4"}
                title={`${selectedRole.label} Attendance Table`}
                description={`The attendance table is now filtered by date. It uses the same operational fields shown in the attached image: punch in, punch out, location, status, in image, and out image.`}
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard
                    label="Selected Date"
                    value={formatDateFromKey(selectedDateKey)}
                    caption="Use the calendar to move between attendance dates."
                    icon={CalendarDays}
                    accentClass={selectedRole.accentClass}
                  />
                  <SummaryCard
                    label="Present"
                    value={`${selectedDatePresentCount}`}
                    caption={`Out of ${
                      requiresBatchStep && selectedBatchOption
                        ? selectedBatchOption.size
                        : selectedRoleTotals.total
                    } tracked on the selected date.`}
                    icon={CheckCircle2}
                    accentClass={selectedRole.accentClass}
                  />
                  <SummaryCard
                    label="Center"
                    value={selectedCenterEntry.center}
                    caption={selectedProjectSummary.project}
                    icon={MapPin}
                    accentClass={selectedRole.accentClass}
                  />
                  <SummaryCard
                    label={requiresBatchStep ? "Batch" : "Roster"}
                    value={
                      requiresBatchStep && selectedBatchOption
                        ? selectedBatchOption.label
                        : `${selectedRoleTotals.total} employees`
                    }
                    caption={
                      requiresBatchStep && selectedBatchOption
                        ? `${selectedBatchOption.size} students in the selected batch.`
                        : "Employee roster filtered by role, project, center, and date."
                    }
                    icon={requiresBatchStep ? Users : selectedRole.icon}
                    accentClass={selectedRole.accentClass}
                  />
                </div>

                <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        {selectedRole.label} Daily Attendance
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {selectedProjectSummary.project} • {selectedCenterEntry.center}
                        {selectedBatchOption ? ` • ${selectedBatchOption.label}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <label className="text-sm text-slate-400">
                        Attendance Date
                      </label>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/[0.2] px-4 py-2">
                        <CalendarDays size={16} className="text-slate-400" />
                        <input
                          type="date"
                          value={selectedDateKey}
                          onChange={(event) => setSelectedDateKey(event.target.value)}
                          className="bg-transparent text-sm text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-400">
                    Dates within the last {HISTORY_DAYS} days follow the stored
                    trend volumes for the selected scope. Older dates continue
                    using the current center baseline so the table remains
                    explorable, and a few seeded demo history records are mixed
                    in for realistic attendance tracking.
                  </p>

                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-[1300px] w-full text-left text-sm">
                      <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">
                            {requiresBatchStep ? "Student" : "Employee"}
                          </th>
                          <th className="px-4 py-3 font-medium">Punch In</th>
                          <th className="px-4 py-3 font-medium">Punch Out</th>
                          <th className="px-4 py-3 font-medium">Location</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">In Image</th>
                          <th className="px-4 py-3 font-medium">Out Image</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {attendanceRows.map((row) => (
                          <tr
                            key={row.id}
                            className="transition-colors hover:bg-white/[0.03]"
                          >
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-medium text-white">{row.name}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {row.code}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-white">{row.punchIn}</td>
                            <td className="px-4 py-4 text-white">{row.punchOut}</td>
                            <td className="px-4 py-4 text-slate-300">{row.location}</td>
                            <td className="px-4 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getAttendanceStatusMeta(
                                  row.status
                                )}`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {row.inImage ? (
                                <img
                                  src={row.inImage}
                                  alt={`${row.name} in proof`}
                                  className="h-12 w-12 rounded-xl border border-white/10 object-cover"
                                />
                              ) : (
                                <span className="text-sm text-slate-500">—</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {row.outImage ? (
                                <img
                                  src={row.outImage}
                                  alt={`${row.name} out proof`}
                                  className="h-12 w-12 rounded-xl border border-white/10 object-cover"
                                />
                              ) : (
                                <span className="text-sm text-slate-500">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </StepSection>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function HeroMetricCard({
  label,
  value,
  caption,
  accentClass,
  panelClass,
  icon: Icon,
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

function StepSection({ step, title, description, children }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5">
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

function SelectionSummary({ label, value, onChange }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
      <div>
        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
          {label}
        </span>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/[0.06]"
      >
        Change
      </button>
    </div>
  );
}

function SummaryCard({ label, value, caption, icon: Icon, accentClass }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.02] p-5">
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

function TrendSpotlightCard({
  title,
  name,
  rate,
  coverage,
  insight,
  trend,
  stroke,
  id,
  badgeClass,
  accentClass,
  metricOneLabel,
  metricOneValue,
  metricTwoLabel,
  metricTwoValue,
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_42%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.02))] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{name}</h3>
          <p className={`mt-2 text-lg font-medium ${accentClass}`}>{coverage}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            {insight}
          </p>
        </div>
        <span className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
          {rate}%
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[20px] border border-white/10 bg-black/[0.18] p-4">
          <MiniAreaChart data={trend} stroke={stroke} id={id} height={120} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <MiniStat label={metricOneLabel} value={metricOneValue} />
          <MiniStat label={metricTwoLabel} value={metricTwoValue} />
        </div>
      </div>
    </div>
  );
}

function TrendMetricTile({
  label,
  value,
  caption,
  accentClass,
  badgeClass,
  pill,
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {label}
          </p>
          <p className={`mt-3 text-2xl font-semibold ${accentClass}`}>{value}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
          {pill}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{caption}</p>
    </div>
  );
}

function CenterSignalCard({ rank, center, focusRole }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/[0.14] p-4 transition-colors hover:bg-white/[0.03]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-semibold text-slate-200">
            {String(rank).padStart(2, "0")}
          </div>
          <div>
            <p className="text-lg font-medium text-white">{center.center}</p>
            <p className="mt-1 text-sm text-slate-400">{center.project}</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${focusRole.badgeClass}`}>
          {center.rate}%
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Coverage" value={`${center.present}/${center.total}`} />
        <MiniStat
          label="Trend Delta"
          value={`${center.trendDelta >= 0 ? "+" : ""}${center.trendDelta}`}
        />
        <MiniStat label="Staff Rate" value={`${center.staffRate}%`} />
        <MiniStat label="Candidate Rate" value={`${center.candidateRate}%`} />
      </div>

      <div className="mt-4 rounded-[18px] border border-white/10 bg-black/[0.18] p-3">
        <MiniAreaChart
          data={center.trend}
          stroke={focusRole.stroke}
          id={`center-${center.center}`}
          height={72}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/[0.16] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-base font-medium text-white">{value}</p>
    </div>
  );
}

function MiniAreaChart({ data, stroke, id, height = 58 }) {
  const safeData = data.length > 1 ? data : [0, ...data];
  const max = Math.max(...safeData, 1);
  const min = Math.min(...safeData, 0);
  const range = max - min || 1;
  const gradientId = `attendance-trend-${id.replace(/\s+/g, "-")}`;

  const points = safeData
    .map((value, index) => {
      const x = (index / (safeData.length - 1 || 1)) * 100;
      const y = 100 - ((value - min) / range) * 78;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.34" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polygon fill={`url(#${gradientId})`} points={`0,100 ${points} 100,100`} />
    </svg>
  );
}
