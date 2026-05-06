/* ═══════════════════════════════════════════════════════════════
   Super Admin — Shared Mock Data
   Hierarchy: Project → Center → Batch → Candidate
   ═══════════════════════════════════════════════════════════════ */

const NAMES = [
  "Sasmita Nayak","Ananya Samal","Monalisa Mohanty","Sneha Swain","Sweta Rout",
  "Priyanka Behera","Suman Das","Deepak Sahu","Rajesh Mohapatra","Bikash Naik",
  "Amit Panda","Suresh Nayak","Tapan Rout","Prakash Majhi","Pooja Patel",
  "Ritika Sahoo","Manisha Jena","Subrat Jena","Hemant Patra","Ranjita Mohanta",
  "Kabita Das","Lopamudra Deo","Dinesh Pradhan","Harsha Nayak","Nihar Ranjan",
  "Pallavi Nayak","Sanjay Das","Rina Pattnaik","Aparna Sethy","Rahul Pradhan",
  "Meera Das","Aditya Sahu","Sneha Mohanty","Sonal Behera","Rakesh Mohanty",
  "Deepak Das","Priya Sahu","Bikash Naik","Suresh Naik","Ritu Mohapatra",
];

const COMPANIES = [
  { name: "Tech Mahindra", sector: "IT" },
  { name: "Jindal Steel", sector: "Manufacturing" },
  { name: "L&T Construction", sector: "Construction" },
  { name: "Vedanta Resources", sector: "Mining" },
  { name: "Tata Motors", sector: "Automotive" },
  { name: "Infosys BPO", sector: "IT/BPO" },
  { name: "Apollo Hospitals", sector: "Healthcare" },
  { name: "ITC Hotels", sector: "Hospitality" },
];

const JOB_ROLES = ["Electrical","Fitter","Solar Technician","Retail Sales","Data Entry","Welder","Safety Officer","Industrial Electrician","Hospitality","General Duty Assistant"];
const STATUSES_CAND = ["Active","Active","Active","Active","Completed","Completed","Dropped"];
const PLACEMENT_ST = ["Placed","Placed","Placed","Not Placed","Not Placed","Pending"];

/* ── seeded random ── */
let _seed = 42;
function srand() { _seed = (_seed * 16807 + 0) % 2147483647; return (_seed & 0x7fffffff) / 0x7fffffff; }
function pick(arr) { return arr[Math.floor(srand() * arr.length)]; }
function randInt(min, max) { return min + Math.floor(srand() * (max - min + 1)); }
function randDate(y, mMin, mMax) {
  const m = randInt(mMin, mMax);
  const d = randInt(1, 28);
  return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

/* ── generate candidates for a batch ── */
function genCandidates(count, centerName, batchLabel, projectName) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const name = NAMES[(i * 7 + batchLabel.charCodeAt(batchLabel.length - 1)) % NAMES.length];
    const status = pick(STATUSES_CAND);
    const placementStatus = status === "Active" ? pick(PLACEMENT_ST) : status === "Completed" ? pick(["Placed","Placed","Not Placed"]) : "N/A";
    const course = pick(JOB_ROLES);
    out.push({
      id: `${centerName.slice(0,3).toUpperCase()}-${batchLabel.replace(/\s/g,"")}-${String(i+1).padStart(3,"0")}`,
      name,
      center: centerName,
      batch: batchLabel,
      project: projectName,
      course,
      enrollmentDate: randDate(2025, 4, 10),
      status,
      placementStatus,
      company: placementStatus === "Placed" ? pick(COMPANIES).name : null,
      salary: placementStatus === "Placed" ? randInt(8, 22) * 1000 : null,
      theoryHours: randInt(40, 180),
      practicalHours: randInt(30, 160),
      totalTheory: 200,
      totalPractical: 180,
      attendance: randInt(65, 99),
      moduleCompletion: randInt(30, 100),
    });
  }
  return out;
}

/* ── build projects ── */
export const SA_PROJECTS = [
  {
    id: "P-001",
    name: "PMKVY 4.0",
    fundingAgency: "NSDC",
    status: "Active",
    startDate: "2025-04-01",
    endDate: "2026-12-31",
    centers: [
      {
        id: "C-ANG",
        name: "Angul",
        fullName: "Pantiss Skill Resort, Angul",
        manager: "Rakesh Swain",
        batches: [
          { id: "B-101", label: "Batch 101", jobRole: "Electrical", trainer: "Aditya Sahu", learners: 42, status: "Active", candidates: [] },
          { id: "B-102", label: "Batch 102", jobRole: "Fitter", trainer: "Aditya Sahu", learners: 38, status: "Active", candidates: [] },
          { id: "B-103", label: "Batch 103", jobRole: "Solar Technician", trainer: "Aditya Sahu", learners: 40, status: "Completed", candidates: [] },
        ],
        mobilization: { mobilized: 160, enrolled: 120, dropoffs: 12 },
        totalModules: 24,
        completedModules: 18,
      },
      {
        id: "C-BLG",
        name: "Bolangir",
        fullName: "Bolangir Satellite Center",
        manager: "Sandhya Mishra",
        batches: [
          { id: "B-201", label: "Batch 201", jobRole: "Retail Sales", trainer: "Sanjay Das", learners: 34, status: "Active", candidates: [] },
          { id: "B-202", label: "Batch 202", jobRole: "Data Entry", trainer: "Sanjay Das", learners: 41, status: "Active", candidates: [] },
        ],
        mobilization: { mobilized: 118, enrolled: 75, dropoffs: 8 },
        totalModules: 20,
        completedModules: 14,
      },
    ],
  },
  {
    id: "P-002",
    name: "CSR - Tata Steel",
    fundingAgency: "Tata Steel Foundation",
    status: "Active",
    startDate: "2025-06-15",
    endDate: "2026-09-30",
    centers: [
      {
        id: "C-JSG",
        name: "Jharsuguda",
        fullName: "Jharsuguda Training Center",
        manager: "Pradip Nanda",
        batches: [
          { id: "B-301", label: "Batch 301", jobRole: "Welder", trainer: "Sneha Mohanty", learners: 39, status: "Active", candidates: [] },
          { id: "B-302", label: "Batch 302", jobRole: "Safety Officer", trainer: "Sneha Mohanty", learners: 44, status: "Active", candidates: [] },
          { id: "B-303", label: "Batch 303", jobRole: "Industrial Electrician", trainer: "Sneha Mohanty", learners: 43, status: "Completed", candidates: [] },
        ],
        mobilization: { mobilized: 140, enrolled: 126, dropoffs: 15 },
        totalModules: 22,
        completedModules: 16,
      },
    ],
  },
  {
    id: "P-003",
    name: "DDUGKY",
    fundingAgency: "MoRD",
    status: "Monitoring",
    startDate: "2025-01-10",
    endDate: "2026-11-20",
    centers: [
      {
        id: "C-KAL",
        name: "Kalahandi",
        fullName: "Kalahandi Center",
        manager: "Harsha Nayak",
        batches: [
          { id: "B-401", label: "Batch 401", jobRole: "Hospitality", trainer: "Deepak Das", learners: 56, status: "Active", candidates: [] },
          { id: "B-402", label: "Batch 402", jobRole: "General Duty Assistant", trainer: "Suresh Naik", learners: 53, status: "Active", candidates: [] },
          { id: "B-403", label: "Batch 403", jobRole: "Retail Sales", trainer: "Rakesh Mohanty", learners: 52, status: "Active", candidates: [] },
        ],
        mobilization: { mobilized: 214, enrolled: 161, dropoffs: 22 },
        totalModules: 26,
        completedModules: 12,
      },
      {
        id: "C-KNJ",
        name: "Keonjhar",
        fullName: "Keonjhar Skill Center",
        manager: "Amit Panda",
        batches: [
          { id: "B-501", label: "Batch 501", jobRole: "Electrical", trainer: "Amit Panda", learners: 35, status: "Active", candidates: [] },
          { id: "B-502", label: "Batch 502", jobRole: "Fitter", trainer: "Ritu Mohapatra", learners: 40, status: "Active", candidates: [] },
        ],
        mobilization: { mobilized: 98, enrolled: 75, dropoffs: 6 },
        totalModules: 20,
        completedModules: 8,
      },
    ],
  },
];

/* Populate candidates */
SA_PROJECTS.forEach((p) => {
  p.centers.forEach((c) => {
    c.batches.forEach((b) => {
      b.candidates = genCandidates(b.learners, c.name, b.label, p.name);
    });
  });
});

/* ── Placement Drives ── */
export const SA_PLACEMENT_DRIVES = [
  { id: "DRV-01", project: "PMKVY 4.0", driveName: "Tech Mahindra Campus Drive", company: "Tech Mahindra", date: "2026-03-15", participated: 42, selected: 18 },
  { id: "DRV-02", project: "PMKVY 4.0", driveName: "Vedanta Recruitment Fair", company: "Vedanta Resources", date: "2026-03-28", participated: 35, selected: 12 },
  { id: "DRV-03", project: "PMKVY 4.0", driveName: "ITC Hospitality Hiring", company: "ITC Hotels", date: "2026-04-05", participated: 28, selected: 15 },
  { id: "DRV-04", project: "CSR - Tata Steel", driveName: "Jindal Steel Mass Hiring", company: "Jindal Steel", date: "2026-03-20", participated: 56, selected: 22 },
  { id: "DRV-05", project: "CSR - Tata Steel", driveName: "L&T Construction Drive", company: "L&T Construction", date: "2026-04-10", participated: 38, selected: 14 },
  { id: "DRV-06", project: "DDUGKY", driveName: "Infosys BPO Walk-in", company: "Infosys BPO", date: "2026-04-01", participated: 64, selected: 28 },
  { id: "DRV-07", project: "DDUGKY", driveName: "Apollo Healthcare Recruitment", company: "Apollo Hospitals", date: "2026-04-12", participated: 48, selected: 20 },
  { id: "DRV-08", project: "DDUGKY", driveName: "Tata Motors Apprentice Drive", company: "Tata Motors", date: "2026-04-18", participated: 40, selected: 16 },
];

/* Generate placed students for each drive */
SA_PLACEMENT_DRIVES.forEach((drv) => {
  const proj = SA_PROJECTS.find((p) => p.name === drv.project);
  if (!proj) return;
  const allCands = proj.centers.flatMap((c) => c.batches.flatMap((b) => b.candidates));
  const students = [];
  for (let i = 0; i < drv.participated; i++) {
    const c = allCands[i % allCands.length];
    students.push({
      id: `${drv.id}-S${String(i + 1).padStart(3, "0")}`,
      name: c.name,
      center: c.center,
      batch: c.batch,
      course: c.course,
      salary: i < drv.selected ? randInt(8, 24) * 1000 : null,
      status: i < drv.selected ? "Selected" : i < drv.selected + 5 ? "Pending" : "Rejected",
    });
  }
  drv.students = students;
});

/* ── Employees ── */
export const SA_EMPLOYEES = [
  { id: "EMP-001", name: "Aditya Sahu", project: "PMKVY 4.0", center: "Angul", role: "Trainer", joinDate: "2024-07-01", status: "Active", phone: "+91 98765 43210", email: "aditya@pantiss.in" },
  { id: "EMP-002", name: "Meera Das", project: "PMKVY 4.0", center: "Angul", role: "Placement Officer", joinDate: "2024-08-15", status: "Active", phone: "+91 98765 43211", email: "meera@pantiss.in" },
  { id: "EMP-003", name: "Nihar Ranjan", project: "PMKVY 4.0", center: "Angul", role: "Mobilizer", joinDate: "2024-09-01", status: "Active", phone: "+91 98765 43212", email: "nihar@pantiss.in" },
  { id: "EMP-004", name: "Sandhya Mishra", project: "PMKVY 4.0", center: "Bolangir", role: "Center Manager", joinDate: "2024-06-10", status: "Active", phone: "+91 98765 43213", email: "sandhya@pantiss.in" },
  { id: "EMP-005", name: "Sanjay Das", project: "PMKVY 4.0", center: "Bolangir", role: "Trainer", joinDate: "2025-01-05", status: "Active", phone: "+91 98765 43214", email: "sanjay@pantiss.in" },
  { id: "EMP-006", name: "Sneha Mohanty", project: "CSR - Tata Steel", center: "Jharsuguda", role: "Trainer", joinDate: "2024-11-20", status: "On Leave", phone: "+91 98765 43215", email: "sneha@pantiss.in" },
  { id: "EMP-007", name: "Rahul Pradhan", project: "CSR - Tata Steel", center: "Jharsuguda", role: "Mobilizer", joinDate: "2024-08-10", status: "Active", phone: "+91 98765 43216", email: "rahul@pantiss.in" },
  { id: "EMP-008", name: "Pradip Nanda", project: "CSR - Tata Steel", center: "Jharsuguda", role: "Center Manager", joinDate: "2024-06-15", status: "Active", phone: "+91 98765 43217", email: "pradip@pantiss.in" },
  { id: "EMP-009", name: "Harsha Nayak", project: "DDUGKY", center: "Kalahandi", role: "Center Manager", joinDate: "2024-07-20", status: "Active", phone: "+91 98765 43218", email: "harsha@pantiss.in" },
  { id: "EMP-010", name: "Bikash Naik", project: "DDUGKY", center: "Kalahandi", role: "Placement Officer", joinDate: "2024-10-15", status: "Active", phone: "+91 98765 43219", email: "bikash@pantiss.in" },
  { id: "EMP-011", name: "Sonal Behera", project: "DDUGKY", center: "Kalahandi", role: "Mobilizer", joinDate: "2025-01-05", status: "Active", phone: "+91 98765 43220", email: "sonal@pantiss.in" },
  { id: "EMP-012", name: "Amit Panda", project: "DDUGKY", center: "Keonjhar", role: "Trainer", joinDate: "2024-07-01", status: "Active", phone: "+91 98765 43221", email: "amit@pantiss.in" },
  { id: "EMP-013", name: "Ritu Mohapatra", project: "DDUGKY", center: "Keonjhar", role: "Trainer", joinDate: "2025-02-01", status: "Active", phone: "+91 98765 43222", email: "ritu@pantiss.in" },
];

/* ── Monthly Targets ── */
export const SA_MONTHLY_TARGETS = [
  { empId: "EMP-001", month: "2026-04", t1: 30, t2: 15 },
  { empId: "EMP-001", month: "2026-03", t1: 28, t2: 12 },
  { empId: "EMP-002", month: "2026-04", t1: 20, t2: 10 },
  { empId: "EMP-003", month: "2026-04", t1: 50, t2: 25 },
  { empId: "EMP-006", month: "2026-04", t1: 25, t2: 10 },
  { empId: "EMP-007", month: "2026-04", t1: 45, t2: 20 },
  { empId: "EMP-010", month: "2026-04", t1: 18, t2: 8 },
  { empId: "EMP-012", month: "2026-04", t1: 32, t2: 16 },
];
