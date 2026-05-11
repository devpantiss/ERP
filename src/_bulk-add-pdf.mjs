/**
 * bulk-add-pdf-export.mjs
 * Adds ExportPDFButton import + component to all table files.
 * Run: node src/_bulk-add-pdf.mjs
 */
import fs from "fs";
import path from "path";

const SRC = "src";

// [relPath, title, columns[], accessor-fn-body, fileName, accent]
const CONFIGS = [
  // ── Admin (remaining) ──
  ["pages/Admin/AdminCommunityEvents.jsx",
    "Community Events",
    ["Event","Mobilizer","Center","Date","Attendees","Status"],
    "e.title||e.event,e.mobilizer,e.center,e.date,e.attendees,e.status",
    "community_events", "violet"],
  ["pages/Admin/AdminExposureVisitApprovals.jsx",
    "Exposure Visit Approvals",
    ["Visit","Trainer","Center","Date","Students","Status"],
    "v.title||v.visit||v.name,v.trainer,v.center,v.date,v.students,v.status",
    "exposure_visit_approvals", "violet"],
  ["pages/Admin/AdminInvoiceManagement.jsx",
    "Invoice Management",
    ["Invoice","Project","Amount","Date","Status"],
    "i.invoiceNo||i.id,i.project,i.amount,i.date,i.status",
    "invoice_management", "violet"],
  ["pages/Admin/AdminProcurement.jsx",
    "Procurement Requests",
    ["Request ID","Item","Requested By","Center","Amount","Urgency","Status"],
    "p.id||p.requestId,p.name||p.item,p.requestedBy,p.center,p.budget||p.amount,p.urgency,p.status",
    "procurement", "violet"],
  ["pages/Admin/AdminPlacementDriveApprovals.jsx",
    "Placement Drive Approvals",
    ["Drive","Officer","Company","Trade","Date","Candidates","Selected","Status"],
    "d.title,d.officer,d.company,d.trade,d.date,d.candidates,d.selected,d.status",
    "placement_drive_approvals", "violet"],
  ["pages/Admin/AdminApprovals.jsx",
    "Approvals",
    ["Title","Type","Submitted By","Date","Status"],
    "a.title||a.name,a.type,a.submittedBy||a.requestedBy,a.date,a.status",
    "approvals", "violet"],
  ["pages/Admin/AdminModuleProgress.jsx",
    "Module Progress",
    ["Batch","Trainer","Center","Job Role","Completion"],
    "b.batch||b.batchId,b.trainer,b.center,b.trade||b.jobRole,`${b.completion||b.progress||0}%`",
    "module_progress", "violet"],

  // ── Trainer ──
  ["pages/Trainer/TrainerAttendance.jsx",
    "Attendance Record",
    ["Date","Status","Check In","Check Out"],
    "a.date,a.status,a.checkIn||a.inTime||'-',a.checkOut||a.outTime||'-'",
    "trainer_attendance", "emerald"],
  ["pages/Trainer/TrainerExposureVisits.jsx",
    "Exposure Visits",
    ["Title","Location","Date","Students","Status"],
    "v.title||v.name,v.location,v.date,v.students||v.learners,v.status",
    "exposure_visits", "emerald"],
  ["pages/Trainer/TrainerInternalAssessments.jsx",
    "Internal Assessments",
    ["Assessment","Batch","Date","Avg Score","Status"],
    "a.title||a.name,a.batch,a.date,a.avgScore||a.score||a.average,a.status",
    "internal_assessments", "emerald"],
  ["pages/Trainer/TrainerRevenue.jsx",
    "Revenue Report",
    ["Month","Project","Amount","Status"],
    "r.month,r.project,`₹${r.amount}`,r.status",
    "trainer_revenue", "emerald"],
  ["pages/Trainer/TeachingManagementSystem.jsx",
    "Teaching Management",
    ["Date","Batch","Module","Type","Status"],
    "s.date,s.batch||s.batchId,s.module||s.topic,s.type||s.sessionType,s.status",
    "teaching_management", "emerald"],
  ["pages/Trainer/TrainerModuleHistory.jsx",
    "Module History",
    ["Date","Batch","Module","Type","Trainer"],
    "m.date,m.batch,m.module,m.type,m.trainer",
    "module_history", "emerald"],

  // ── Mobilizer ──
  ["pages/Mobilizer/MobilizerAttendance.jsx",
    "Attendance Record",
    ["Date","Status","Check In","Check Out"],
    "a.date,a.status,a.checkIn||a.inTime||'-',a.checkOut||a.outTime||'-'",
    "mobilizer_attendance", "yellow"],
  ["pages/Mobilizer/MobilizerRevenue.jsx",
    "Revenue Report",
    ["Month","Project","Amount","Status"],
    "r.month,r.project,`₹${r.amount}`,r.status",
    "mobilizer_revenue", "yellow"],
  ["pages/Mobilizer/StudentRnrollment.jsx",
    "Student Enrollment",
    ["Name","Course","Center","Phone","Status"],
    "s.name,s.course||s.jobRole||s.trade,s.center,s.phone||s.mobile||'-',s.status",
    "student_enrollment", "yellow"],

  // ── Placement ──
  ["pages/Placement/PlacementCompanyList.jsx",
    "Company Database",
    ["Company","Industry","Location","Openings","Status"],
    "c.name||c.company,c.industry||c.sector,c.location,c.openings||c.vacancies,c.status",
    "company_database", "cyan"],
  ["pages/Placement/PlacementsStudentsList.jsx",
    "Placements List",
    ["Name","Batch","Company","Designation","Salary","Status"],
    "s.name,s.batch,s.company,s.designation||s.role,s.salary||s.ctc,s.status",
    "placements_list", "cyan"],
  ["pages/Placement/PlacementRevenue.jsx",
    "Revenue Report",
    ["Month","Project","Amount","Status"],
    "r.month,r.project,`₹${r.amount}`,r.status",
    "placement_revenue", "cyan"],

  // ── Shared ──
  ["pages/shared/AttendancePage.jsx",
    "Attendance Record",
    ["Date","Status","Check In","Check Out"],
    "a.date,a.status,a.checkIn||a.inTime||'-',a.checkOut||a.outTime||'-'",
    "attendance_report", "violet"],
  ["pages/shared/ReimbursementPortal.jsx",
    "Reimbursement Claims",
    ["Description","Category","Amount","Date","Status"],
    "c.title||c.description,c.category||c.type,`₹${c.amount}`,c.date,c.status",
    "reimbursement_claims", "violet"],

  // ── SuperAdmin ──
  ["pages/SuperAdmin/SuperAdminUserManagement.jsx",
    "User Management",
    ["Name","Role","Project","Status","Joined"],
    "u.name,u.role,u.project||u.center||'-',u.status,u.joinDate||u.joined||'-'",
    "sa_user_management", "red"],
  ["pages/SuperAdmin/SuperAdminEmployeeManagement.jsx",
    "Employee Management",
    ["Name","Role","Project","Center","Status"],
    "e.name,e.role||e.designation,e.project,e.center,e.status",
    "sa_employee_management", "red"],
  ["pages/SuperAdmin/SuperAdminInvoiceTracking.jsx",
    "Invoice Tracking",
    ["Invoice","Project","Amount","Date","Status"],
    "i.invoiceNo||i.id,i.project,`₹${i.amount}`,i.date,i.status",
    "sa_invoice_tracking", "red"],
  ["pages/SuperAdmin/SuperAdminFinanceManagement.jsx",
    "Finance Management",
    ["Name","Role","Project","Amount","Status"],
    "s.name,s.role||s.designation,s.project,`₹${s.salary||s.amount}`,s.status",
    "sa_finance", "red"],
  ["pages/SuperAdmin/SuperAdminInvoiceApprovals.jsx",
    "Invoice Approvals",
    ["Invoice","Project","Amount","Date","Status"],
    "i.invoiceNo||i.id,i.project,`₹${i.amount}`,i.date,i.status",
    "sa_invoice_approvals", "red"],
  ["pages/SuperAdmin/SuperAdminAttendanceMonitor.jsx",
    "Attendance Monitor",
    ["Name","Role","Center","Present","Absent","Rate"],
    "a.name,a.role||a.designation,a.center,a.present||a.presentDays,a.absent||a.absentDays,`${a.rate||a.attendanceRate||0}%`",
    "sa_attendance_monitor", "red"],
  ["pages/SuperAdmin/SuperAdminTrainingMonitor.jsx",
    "Training Monitor",
    ["Trainer","Center","Batch","Module","Progress","Status"],
    "t.trainer||t.name,t.center,t.batch,t.module||t.currentModule,`${t.progress||t.completion||0}%`,t.status",
    "sa_training_monitor", "red"],
  ["pages/SuperAdmin/SuperAdminPlacementMonitor.jsx",
    "Placement Monitor",
    ["Officer","Center","Company","Candidates","Placed","Status"],
    "p.officer||p.name,p.center,p.company,p.candidates||p.totalCandidates,p.placed||p.placedCount,p.status",
    "sa_placement_monitor", "red"],
  ["pages/SuperAdmin/SuperAdminExposureVisits.jsx",
    "Exposure Visits",
    ["Title","Trainer","Center","Date","Students","Status"],
    "v.title||v.name,v.trainer,v.center,v.date,v.students||v.learners,v.status",
    "sa_exposure_visits", "red"],
  ["pages/SuperAdmin/SuperAdminMobilizationPage.jsx",
    "Mobilization",
    ["Mobilizer","Center","Candidates","Events","Status"],
    "m.name||m.mobilizer,m.center,m.candidates||m.candidatesMobilized,m.events||m.eventsCompleted,m.status",
    "sa_mobilization", "red"],
  ["pages/SuperAdmin/SuperAdminPlacementDrivesPage.jsx",
    "Placement Drives",
    ["Drive","Company","Officer","Date","Candidates","Selected","Status"],
    "d.title||d.name,d.company,d.officer,d.date,d.candidates,d.selected||d.selectedCount,d.status",
    "sa_placement_drives", "red"],
  ["pages/SuperAdmin/SuperAdminTrainingTracking.jsx",
    "Training Tracking",
    ["Trainer","Center","Batch","Module","Progress"],
    "t.trainer||t.name,t.center,t.batch,t.currentModule||t.module,`${t.completion||t.progress||0}%`",
    "sa_training_tracking", "red"],
  ["pages/SuperAdmin/SuperAdminCommunityEngagementDrives.jsx",
    "Community Engagement Drives",
    ["Event","Mobilizer","Center","Date","Attendees","Status"],
    "e.title||e.name||e.event,e.mobilizer,e.center,e.date,e.attendees,e.status",
    "sa_community_drives", "red"],
  ["pages/SuperAdmin/SuperAdminEnrollmentMonitor.jsx",
    "Enrollment Monitor",
    ["Name","Center","Course","Batch","Date","Status"],
    "s.name,s.center,s.course||s.trade,s.batch,s.enrollmentDate||s.date,s.status",
    "sa_enrollment_monitor", "red"],
];

const IMPORT_LINE = 'import ExportPDFButton from "../../components/common/ExportPDFButton";';

let ok = 0, skip = 0, fail = 0;

for (const [relPath, title, columns, accessor, fileName, accent] of CONFIGS) {
  const filePath = path.join(SRC, relPath);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  NOT FOUND: ${relPath}`);
    skip++;
    continue;
  }

  let code = fs.readFileSync(filePath, "utf8");

  if (code.includes("ExportPDFButton")) {
    console.log(`⏭  ALREADY HAS: ${relPath}`);
    skip++;
    continue;
  }

  // 1. Add import after last import line
  const lines = code.split("\n");
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) lastImportIdx = i;
  }
  if (lastImportIdx >= 0) {
    lines.splice(lastImportIdx + 1, 0, IMPORT_LINE);
  } else {
    lines.unshift(IMPORT_LINE);
  }

  // 2. Detect the data variable (filtered, or the raw data array)
  let dataVar = "filtered";
  const filteredMatch = code.match(/const\s+(filtered\w*)\s*=\s*useMemo/);
  if (filteredMatch) {
    dataVar = filteredMatch[1];
  } else {
    // Look for the data rendered in the table via .map(
    const tableMapMatch = code.match(/\{(\w+)\.map\(\((\w)\)/);
    if (tableMapMatch) dataVar = tableMapMatch[1];
  }

  // Build the accessor with correct variable letter
  const varLetter = accessor.match(/^(\w)\./)?.[1] || "x";

  // 3. Find the first <h1 or page header and insert the button after it
  // Strategy: find the header area (first <div after return with space-y, or first h1)
  const joinedCode = lines.join("\n");

  // Find first closing </div> after the page title
  const h1Idx = joinedCode.indexOf("<h1");
  if (h1Idx === -1) {
    console.log(`⚠️  NO H1 FOUND: ${relPath}`);
    // Still add import at least
    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    console.log(`   ✅ Import added (button needs manual placement)`);
    ok++;
    continue;
  }

  // Find the parent closing </div> for the header section
  // Insert button component after the header div's closing
  // We'll find the text after </h1> or </p> that's within the header
  // Then add the ExportPDFButton after the header section

  // For safety, let's insert right after the header <div>...</div> block
  // We'll look for the pattern: after the subtitle <p> tag, insert button

  const colsStr = JSON.stringify(columns);
  const buttonJSX = `\n        <ExportPDFButton\n          title="${title}"\n          columns={${colsStr}}\n          data={${dataVar}.map(${varLetter}=>[${accessor}])}\n          fileName="${fileName}"\n          accent="${accent}"\n        />`;

  // Find the first </div> that closes the header section (after h1)
  // We look for the pattern where after the title div closes, we insert
  const afterH1 = joinedCode.substring(h1Idx);
  
  // Find the subtitle p tag and its closing, then the closing </div>
  const closeDivAfterTitle = afterH1.indexOf("</div>");
  if (closeDivAfterTitle === -1) {
    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    console.log(`✅ Import only: ${relPath} (manual button placement needed)`);
    ok++;
    continue;
  }

  // Find the next </div> after the first one (the parent wrapper)
  const secondDiv = afterH1.indexOf("</div>", closeDivAfterTitle + 6);
  if (secondDiv !== -1) {
    const insertPos = h1Idx + secondDiv;
    const finalCode = joinedCode.substring(0, insertPos) + buttonJSX + "\n      " + joinedCode.substring(insertPos);
    fs.writeFileSync(filePath, finalCode, "utf8");
    console.log(`✅ COMPLETE: ${relPath}`);
    ok++;
  } else {
    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    console.log(`✅ Import only: ${relPath}`);
    ok++;
  }
}

console.log(`\n📊 Results: ${ok} processed, ${skip} skipped, ${fail} failed\n`);
