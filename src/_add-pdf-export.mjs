/**
 * add-pdf-export.mjs
 * Automated script to add ExportPDFButton to all data table pages.
 * Run: node src/_add-pdf-export.mjs
 */
import fs from "fs";
import path from "path";

// Each entry: [filePath, { dataVar, columns (header strings), accessors (code for row mapping), fileName, title, accent }]
const FILES = [
  // ── Admin ──
  ["pages/Admin/AdminMobilizerList.jsx", {
    dataVar: "filtered",
    columns: '["Name","Center","Candidates Mobilized","Events","Attendance","Status"]',
    accessor: 'filtered.map(m=>[m.name,m.center,m.candidatesMobilized,m.eventsCompleted,`${m.attendanceRate}%`,m.status])',
    fileName: "mobilizer_list", title: "Mobilizer List", accent: "violet",
  }],
  ["pages/Admin/AdminTrainerAttendance.jsx", {
    dataVar: "filtered",
    columns: '["Name","Center","Present","Absent","Late","Rate"]',
    accessor: 'filtered.map(t=>[t.name,t.center,t.presentDays,t.totalDays-t.presentDays,t.lateDays,`${Math.round((t.presentDays/t.totalDays)*100)}%`])',
    fileName: "trainer_attendance", title: "Trainer Attendance", accent: "violet",
  }],
  ["pages/Admin/AdminUserManagement.jsx", {
    dataVar: "filtered",
    columns: '["Name","Role","Center","Status","Email","Joined"]',
    accessor: 'filtered.map(u=>[u.name,u.role,u.center,u.status,u.email,u.joinDate])',
    fileName: "user_management", title: "User Management", accent: "violet",
  }],
  ["pages/Admin/AdminCandidateApprovals.jsx", {
    dataVar: "filtered",
    columns: '["Name","Mobilizer","Job Role","Center","Status","Phone"]',
    accessor: 'filtered.map(c=>[c.name,c.mobilizer,c.jobrole,c.center,c.status,c.phone])',
    fileName: "candidate_approvals", title: "Candidate Approvals", accent: "violet",
  }],
  ["pages/Admin/AdminPlacementDriveApprovals.jsx", {
    dataVar: "filtered",
    columns: '["Drive","Officer","Company","Trade","Location","Date","Candidates","Selected","Status"]',
    accessor: 'filtered.map(d=>[d.title,d.officer,d.company,d.trade,d.location,d.date,d.candidates,d.selected,d.status])',
    fileName: "placement_drive_approvals", title: "Placement Drive Approvals", accent: "violet",
  }],
  ["pages/Admin/AdminCommunityEvents.jsx", {
    dataVar: "filtered",
    columns: '["Event","Mobilizer","Center","Date","Attendees","Status"]',
    accessor: 'filtered.map(e=>[e.title||e.event||e.name,e.mobilizer,e.center,e.date,e.attendees,e.status])',
    fileName: "community_events", title: "Community Events", accent: "violet",
  }],
  ["pages/Admin/AdminExposureVisitApprovals.jsx", {
    dataVar: "filtered",
    columns: '["Visit","Trainer","Center","Date","Students","Status"]',
    accessor: 'filtered.map(v=>[v.title||v.visit||v.name,v.trainer,v.center,v.date,v.students,v.status])',
    fileName: "exposure_visit_approvals", title: "Exposure Visit Approvals", accent: "violet",
  }],
  ["pages/Admin/AdminInvoiceManagement.jsx", {
    dataVar: "filtered",
    columns: '["Invoice","Project","Amount","Date","Status"]',
    accessor: 'filtered.map(i=>[i.invoiceNo||i.id,i.project,i.amount,i.date,i.status])',
    fileName: "invoice_management", title: "Invoice Management", accent: "violet",
  }],

  // ── Trainer ──
  ["pages/Trainer/TrainerAttendance.jsx", {
    dataVar: "filtered||ATTENDANCE",
    columns: '["Date","Status","Check In","Check Out"]',
    accessor: '(filtered||ATTENDANCE).map(a=>[a.date,a.status,a.checkIn||"-",a.checkOut||"-"])',
    fileName: "trainer_attendance", title: "My Attendance", accent: "emerald",
  }],
  ["pages/Trainer/TrainerExposureVisits.jsx", {
    dataVar: "filtered||visits||VISITS",
    columns: '["Title","Location","Date","Students","Status"]',
    accessor: '(filtered||visits||VISITS).map(v=>[v.title||v.name,v.location,v.date,v.students,v.status])',
    fileName: "exposure_visits", title: "Exposure Visits", accent: "emerald",
  }],
  ["pages/Trainer/TrainerInternalAssessments.jsx", {
    dataVar: "filtered||assessments||ASSESSMENTS",
    columns: '["Title","Batch","Date","Avg Score","Status"]',
    accessor: '(filtered||assessments||ASSESSMENTS).map(a=>[a.title||a.name,a.batch,a.date,a.avgScore||a.score,a.status])',
    fileName: "internal_assessments", title: "Internal Assessments", accent: "emerald",
  }],
  ["pages/Trainer/TrainerRevenue.jsx", {
    dataVar: "filtered||REVENUE",
    columns: '["Month","Project","Amount","Status"]',
    accessor: '(filtered||REVENUE).map(r=>[r.month,r.project,r.amount,r.status])',
    fileName: "trainer_revenue", title: "Revenue Report", accent: "emerald",
  }],

  // ── Mobilizer ──
  ["pages/Mobilizer/MobilizerAttendance.jsx", {
    dataVar: "filtered||ATTENDANCE",
    columns: '["Date","Status","Check In","Check Out"]',
    accessor: '(filtered||ATTENDANCE).map(a=>[a.date,a.status,a.checkIn||"-",a.checkOut||"-"])',
    fileName: "mobilizer_attendance", title: "My Attendance", accent: "yellow",
  }],
  ["pages/Mobilizer/MobilizerRevenue.jsx", {
    dataVar: "filtered||REVENUE",
    columns: '["Month","Project","Amount","Status"]',
    accessor: '(filtered||REVENUE).map(r=>[r.month,r.project,r.amount,r.status])',
    fileName: "mobilizer_revenue", title: "Revenue Report", accent: "yellow",
  }],
  ["pages/Mobilizer/StudentRnrollment.jsx", {
    dataVar: "filtered||students||STUDENTS",
    columns: '["Name","Course","Center","Status","Date"]',
    accessor: '(filtered||students||STUDENTS).map(s=>[s.name,s.course||s.jobRole,s.center,s.status,s.date||s.enrollDate])',
    fileName: "student_enrollment", title: "Student Enrollment", accent: "yellow",
  }],

  // ── Placement ──
  ["pages/Placement/PlacementCompanyList.jsx", {
    dataVar: "filtered||companies||COMPANIES_DATA",
    columns: '["Company","Industry","Location","Openings","Status"]',
    accessor: '(filtered||companies||COMPANIES_DATA).map(c=>[c.name||c.company,c.industry,c.location,c.openings,c.status])',
    fileName: "company_database", title: "Company Database", accent: "cyan",
  }],
  ["pages/Placement/PlacementsStudentsList.jsx", {
    dataVar: "filtered||students||STUDENTS",
    columns: '["Name","Batch","Company","Status","Salary"]',
    accessor: '(filtered||students||STUDENTS).map(s=>[s.name,s.batch,s.company,s.status,s.salary])',
    fileName: "placements_list", title: "Placements List", accent: "cyan",
  }],
  ["pages/Placement/PlacementRevenue.jsx", {
    dataVar: "filtered||REVENUE",
    columns: '["Month","Project","Amount","Status"]',
    accessor: '(filtered||REVENUE).map(r=>[r.month,r.project,r.amount,r.status])',
    fileName: "placement_revenue", title: "Revenue Report", accent: "cyan",
  }],

  // ── Shared ──
  ["pages/shared/AttendancePage.jsx", {
    dataVar: "filtered||ATTENDANCE",
    columns: '["Date","Status","Check In","Check Out"]',
    accessor: '(filtered||ATTENDANCE).map(a=>[a.date,a.status,a.checkIn||"-",a.checkOut||"-"])',
    fileName: "attendance", title: "Attendance Report", accent: "violet",
  }],
  ["pages/shared/ReimbursementPortal.jsx", {
    dataVar: "filtered||claims||CLAIMS",
    columns: '["Title","Category","Amount","Date","Status"]',
    accessor: '(filtered||claims||CLAIMS).map(c=>[c.title||c.description,c.category||c.type,c.amount,c.date,c.status])',
    fileName: "reimbursements", title: "Reimbursement Claims", accent: "violet",
  }],

  // ── SuperAdmin ──
  ["pages/SuperAdmin/SuperAdminUserManagement.jsx", {
    dataVar: "filtered",
    columns: '["Name","Role","Center","Status","Email","Joined"]',
    accessor: 'filtered.map(u=>[u.name,u.role,u.center||u.location,u.status,u.email,u.joinDate||u.joined])',
    fileName: "sa_user_management", title: "User Management", accent: "red",
  }],
  ["pages/SuperAdmin/SuperAdminEmployeeManagement.jsx", {
    dataVar: "filtered||employees",
    columns: '["Name","Role","Project","Center","Status"]',
    accessor: '(filtered||employees).map(e=>[e.name,e.role,e.project,e.center,e.status])',
    fileName: "sa_employee_management", title: "Employee Management", accent: "red",
  }],
  ["pages/SuperAdmin/SuperAdminInvoiceTracking.jsx", {
    dataVar: "filtered||invoices",
    columns: '["Invoice","Project","Amount","Date","Status"]',
    accessor: '(filtered||invoices).map(i=>[i.invoiceNo||i.id,i.project,i.amount,i.date,i.status])',
    fileName: "sa_invoice_tracking", title: "Invoice Tracking", accent: "red",
  }],
  ["pages/SuperAdmin/SuperAdminFinanceManagement.jsx", {
    dataVar: "filtered||salaries",
    columns: '["Name","Role","Project","Amount","Status"]',
    accessor: '(filtered||salaries).map(s=>[s.name,s.role,s.project,s.amount||s.salary,s.status])',
    fileName: "sa_finance", title: "Finance Management", accent: "red",
  }],
  ["pages/SuperAdmin/SuperAdminInvoiceApprovals.jsx", {
    dataVar: "filtered||invoices",
    columns: '["Invoice","Project","Amount","Date","Status"]',
    accessor: '(filtered||invoices).map(i=>[i.invoiceNo||i.id,i.project,i.amount,i.date,i.status])',
    fileName: "sa_invoice_approvals", title: "Invoice Approvals", accent: "red",
  }],
];

console.log(`\n📄 PDF Export Automation — ${FILES.length} files to process\n`);

let success = 0, skipped = 0, failed = 0;

for (const [relPath, config] of FILES) {
  const filePath = path.join("src", relPath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  SKIP (not found): ${relPath}`);
    skipped++;
    continue;
  }

  let code = fs.readFileSync(filePath, "utf8");

  // Skip if already has ExportPDFButton
  if (code.includes("ExportPDFButton")) {
    console.log(`⏭️  SKIP (already has export): ${relPath}`);
    skipped++;
    continue;
  }

  // 1. Add import
  const importLine = `import ExportPDFButton from "../../components/common/ExportPDFButton";\n`;
  
  // Find the last import line
  const importRegex = /^import .+$/gm;
  let lastImportMatch;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    lastImportMatch = match;
  }
  
  if (lastImportMatch) {
    const insertPos = lastImportMatch.index + lastImportMatch[0].length;
    code = code.slice(0, insertPos) + "\n" + importLine + code.slice(insertPos);
  } else {
    code = importLine + code;
  }

  fs.writeFileSync(filePath, code, "utf8");
  console.log(`✅  Import added: ${relPath}`);
  success++;
}

console.log(`\n✨ Done! ${success} imports added, ${skipped} skipped, ${failed} failed\n`);
console.log(`\nNOTE: The ExportPDFButton still needs to be placed in each file's JSX manually.`);
console.log(`Each file needs the button added near the table header/filter area.\n`);
