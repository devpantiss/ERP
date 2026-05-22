export const LEAVE_STORAGE_KEY = "kovon-hre-leave-requests";

export const LEAVE_POLICIES = [
  { type: "Casual Leave", quota: 12 },
  { type: "Medical Leave", quota: 24 },
  { type: "Emergency Leave", quota: 12 },
];

export const ROLE_LABEL = {
  mobilizer: "Mobilizer",
  trainer: "Trainer",
  "placement-officer": "Placement Officer",
};

export const INITIAL_LEAVES = [
  {
    id: "LV-001",
    role: "mobilizer",
    employee: "Ananya Das",
    type: "Casual Leave",
    from: "2026-05-20",
    to: "2026-05-21",
    days: 2,
    reason: "Family function",
    status: "Pending Admin Review",
    appliedOn: "2026-05-12",
    approver: "Admin Office",
    adminDecision: "",
    superAdminDecision: "",
    decisionNote: "",
  },
  {
    id: "LV-002",
    role: "trainer",
    employee: "Rakesh Pradhan",
    type: "Medical Leave",
    from: "2026-04-08",
    to: "2026-04-08",
    days: 1,
    reason: "Fever and clinic visit",
    status: "Approved",
    appliedOn: "2026-04-07",
    approver: "Super Admin",
    adminDecision: "Approved by Admin after medical note verification.",
    superAdminDecision: "Final approval by Super Admin.",
    decisionNote: "Approved after dual approval.",
  },
  {
    id: "LV-003",
    role: "placement-officer",
    employee: "Meera Sahoo",
    type: "Emergency Leave",
    from: "2026-03-18",
    to: "2026-03-19",
    days: 2,
    reason: "Urgent personal work",
    status: "Rejected",
    appliedOn: "2026-03-14",
    approver: "Super Admin",
    adminDecision: "Approved by Admin with coverage note.",
    superAdminDecision: "Rejected by Super Admin due to placement drive coverage conflict.",
    decisionNote: "Rejected at final approval.",
  },
  {
    id: "LV-004",
    role: "trainer",
    employee: "Priya Mohanty",
    type: "Casual Leave",
    from: "2026-05-28",
    to: "2026-05-29",
    days: 2,
    reason: "Family medical appointment",
    status: "Pending Super Admin Review",
    appliedOn: "2026-05-22",
    approver: "Admin Office",
    adminDecision: "Approved by Admin and forwarded for Super Admin final approval.",
    superAdminDecision: "",
    decisionNote: "Waiting for Super Admin final approval.",
  },
];

export const readLeaveRequests = () => {
  if (typeof window === "undefined") return INITIAL_LEAVES;

  try {
    const stored = localStorage.getItem(LEAVE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const existingIds = new Set(parsed.map((request) => request.id));
      const missingSeedRequests = INITIAL_LEAVES.filter((request) => !existingIds.has(request.id));

      if (missingSeedRequests.length) {
        const merged = [...parsed, ...missingSeedRequests];
        localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }

      return parsed;
    }
    localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(INITIAL_LEAVES));
    return INITIAL_LEAVES;
  } catch {
    return INITIAL_LEAVES;
  }
};

export const writeLeaveRequests = (requests) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(requests));
};

export const getRoleFromPath = (pathname) => pathname.split("/")[1];

export const getLeaveBalances = (requests, role) =>
  LEAVE_POLICIES.map((policy) => {
    const roleLeaves = requests.filter((leave) => leave.role === role && leave.type === policy.type);
    const used = roleLeaves
      .filter((leave) => leave.status === "Approved")
      .reduce((sum, leave) => sum + leave.days, 0);
    const pending = roleLeaves
      .filter((leave) => leave.status === "Pending Admin Review" || leave.status === "Pending Super Admin Review")
      .reduce((sum, leave) => sum + leave.days, 0);

    return {
      ...policy,
      used,
      pending,
      left: Math.max(policy.quota - used - pending, 0),
    };
  });

export const nextLeaveId = (requests) =>
  `LV-${String(requests.length + 1).padStart(3, "0")}`;
