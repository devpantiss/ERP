# ERP Data Layer Integration Status

## Before

Pages imported local arrays such as `EMPLOYEES`, `MOBILIZERS`, `ALL_USERS`, `CENTERS`, `CANDIDATES`, `SA_EMPLOYEES`, and `SA_PROJECTS`. Candidate approvals also read submitted enrollments directly from `localStorage`.

```txt
Page -> inline array / legacy data file / localStorage
```

## After

Migrated pages now consume normalized mock data through stores and selectors.

```txt
Page -> Zustand store -> mock service -> normalized mockDb -> selector/view model
```

## Migrated In This Pass

| Phase | Files | Central Source |
| --- | --- | --- |
| Auth + Employee | `AdminTrainerList.jsx`, `AdminMobilizerList.jsx`, `AdminUserManagement.jsx`, `SuperAdminEmployeeManagement.jsx` | `employeeStore`, `auth/users`, `roles`, `permissions` |
| Project + Center | `AdminCenterManagement.jsx`, `AdminDashboard.jsx`, Admin dashboard sections, `AdminProjectManagement.jsx`, `AdminAddProjectStepper.jsx`, project cards inside `SuperAdminEmployeeManagement.jsx` | `projectStore`, `employeeStore`, `projects`, `centers`, `batches`, `enrollments`, `candidates`, `employees`, `grievances`, `placementDrives` |
| Candidate + Enrollment | `AdminCandidateApprovals.jsx`, `StudentRnrollment.jsx`, `CandidateEnrollmentStepper` role/project step | `candidateStore`, `candidates`, `enrollments`, `batches`, `centers`, `projects` |
| Placement | `PlacementCompanyList.jsx`, `PlacementDriveDetails.jsx`, `PlacementsStudentsList.jsx`, `AdminPlacementTracker.jsx`, `PlacementOpeningsDashboard` sections | `placementStore`, `companies`, `placementDrives`, `candidates`, `enrollments`, `batches`, derived opening analytics |
| Client Portal | `ClientDashboard.jsx`, `ClientProjects.jsx`, `ClientReports.jsx`, `ClientPerformance.jsx`, `ClientLiveFeed.jsx`, `ClientSuccessStory.jsx`, `clientPortalData.js` | `projects`, `fundingAgencies`, `centers`, `batches`, `enrollments`, `candidates`, `placementDrives`, `invoices`, `procurements`, normalized client data adapter |
| Training/Attendance | `AttendancePage.jsx`, `TrainerAttendance.jsx`, `AdminTrainerAttendance.jsx`, `AdminModuleProgress.jsx`, `TrainerInternalAssessments.jsx`, `TeachingManagementSystem.jsx`, `TrainerExposureVisits.jsx`, `ExposureVisitsStepper.jsx`, `TrainerStudyModules.jsx`, `TrainerLab.jsx`, `TrainersModuleHistory.jsx` | `attendanceStore`, `employeeStore`, `assessmentStore`, `exposureVisitStore`, `attendance`, `employees`, `batches`, `centers`, `assessments`, `exposureVisits`, trainer module selectors |
| HR | `LeaveManagement.jsx`, `ReimbursementPortal.jsx`, `TourApplication.jsx`, `SalaryDashboard.jsx`, `AdminSalaryApprovals.jsx`, `GrievancePortal.jsx`, `AdminGrievancePortal.jsx` | `hrStore`, `salaryStore`, `grievanceStore`, `leaveRequests`, `salaries`, `reimbursements`, `tourRequests`, `grievances` |
| SuperAdmin Tracking | `SuperAdminMobilizationPage.jsx`, `SuperAdminPlacementDrivesPage.jsx`, `SuperAdminEnrollmentMonitor.jsx`, `SuperAdminTrainingMonitor.jsx`, `SuperAdminPlacementMonitor.jsx`, `SuperAdminAttendanceMonitor.jsx`, assignment wizards, employee drilldown dashboards, project candidate/training drilldowns, operational control pages, dashboard/create-project/user-management pages | `projectStore`, `employeeStore`, `placementStore`, `projects`, `centers`, `batches`, `candidates`, `attendance`, `placementDrives`, `companies`, `tourRequests`, `exposureVisits` |
| Revenue/Analytics | `AdminReports.jsx`, `ExecutiveConsole.jsx`, `GrantFinancials.jsx`, `TrainerRevenue.jsx`, `MobilizerRevenue.jsx`, `PlacementRevenue.jsx` | `analyticsSelectors`, `revenue`, `invoices`, `procurements`, `salaries`, `reimbursements`, `fundingAgencies`, `placementDrives`, `attendance`, `tourRequests` |

## New Selectors

| File | Purpose |
| --- | --- |
| `src/stores/selectors/employeeSelectors.js` | Converts normalized employee/user/role/project/center records into UI rows |
| `src/stores/selectors/projectSelectors.js` | Converts project and center records into project/center management rows, admin dashboard metrics, and project workspace reports |
| `src/stores/selectors/candidateSelectors.js` | Converts candidate lifecycle records into approval/tracking rows |
| `src/stores/selectors/placementSelectors.js` | Converts company and placement-drive records into placement UI rows |
| `src/stores/selectors/hrSelectors.js` | Converts leave, tour, and reimbursement records into HR entitlement rows |
| `src/stores/selectors/salarySelectors.js` | Converts salary records into compensation dashboards and approval rows |
| `src/stores/selectors/grievanceSelectors.js` | Converts grievance records into employee/admin grievance workflows |
| `src/stores/selectors/invoiceSelectors.js` | Converts normalized invoices into SuperAdmin tracking and approval rows |
| `src/stores/selectors/trainingSelectors.js` | Converts trainer attendance, punch ledgers, and batch module progress from normalized training entities |
| `src/stores/selectors/superAdminSelectors.js` | Converts normalized project, mobilization, and placement records into SuperAdmin drilldown views |
| `src/stores/selectors/analyticsSelectors.js` | Converts normalized finance, revenue, placement, training, and mobilization records into chart-ready analytics and role revenue workflows |

## Legacy Removed From Migrated Pages

- `AdminTrainerList.jsx`: removed `EMPLOYEES` from `adminPortalData.js`
- `AdminMobilizerList.jsx`: removed inline `MOBILIZERS`
- `AdminUserManagement.jsx`: removed inline `ALL_USERS`, static role/status lists
- `SuperAdminEmployeeManagement.jsx`: removed `SA_PROJECTS`, `SA_EMPLOYEES`, `SA_MONTHLY_TARGETS`
- `AdminCenterManagement.jsx`: removed inline `CENTERS`
- `AdminDashboard.jsx` and dashboard sections: removed project ticker cards, role distribution fixtures, recent activity fixtures, and project status tables; derives them from centralized project, employee, candidate, attendance, grievance, and placement records
- `AdminProjectManagement.jsx`: removed `PROJECT_REPORTS` and submitted-enrollment `localStorage` merge; derives portfolio, center, batch, candidate, staff, grievance, and placement workspace data from normalized project hierarchy
- `AdminAddProjectStepper.jsx`: removed static project, center, sector, and status option arrays; creates project records through `projectStore.create()`
- `clientPortalData.js`: removed `PROJECT_REPORTS` as the client source and derives client projects from normalized project/funding-agency records
- `ClientLiveFeed.jsx`: removed `LIVE_FEEDS` dependency and derives center feed rows from normalized client project scope
- `ClientReports.jsx`: removed Admin invoice/procurement fixtures and derives client financial report exports from normalized invoices and procurements
- `ClientDashboard.jsx`, `ClientProjects.jsx`, `ClientPerformance.jsx`, and `ClientSuccessStory.jsx`: now inherit normalized project, center, batch, candidate, placement, and metric data through the shared client adapter
- `AdminCandidateApprovals.jsx`: removed sample candidate array and direct enrollment `localStorage` reads/writes
- `StudentRnrollment.jsx`: removed generated candidate table, static school/center/job-role/batch filters, and submitted-enrollment `localStorage` writes
- `CandidateEnrollmentStepper` Step 1: removed the hardcoded school/center/role catalog and derives enrollment choices from `Project -> School -> Center -> Batch`
- `PlacementCompanyList.jsx`: removed generated company list and uses centralized company registry
- `PlacementDriveDetails.jsx`: removed generated placement drives and updates centralized drive completion data
- `PlacementsStudentsList.jsx`: removed generated candidates/projects/centers/companies and derives placement rows from centralized placement drives
- `AdminPlacementTracker.jsx`: removed generated students and static filter lists; filters now derive from placement/candidate relationships
- `PlacementOpeningsDashboard`: removed generated openings, map density, chart fixtures, and random trends from opening dashboard sections
- `AttendancePage.jsx`: removed attendance `localStorage` bucket and writes to centralized attendance records
- `TrainerAttendance.jsx`: removed trainer attendance `localStorage` persistence and writes punch records to centralized `Attendance` entities
- `AdminTrainerAttendance.jsx`: removed inline `TRAINERS` and `WEEKLY` fixtures; trainer rows and weekly charts derive from centralized employee and attendance records
- `AdminModuleProgress.jsx`: removed inline `MODULES_BY_TRADE` and `BATCHES`; module progress derives from `Batch -> Trainer Employee -> Center`
- `TrainerInternalAssessments.jsx`: removed generated assessment fixtures and derives assessment rows/candidate marks from centralized `Assessment -> Batch -> Enrollment -> Candidate`
- `TeachingManagementSystem.jsx`: removed teaching-session fixtures and `localStorage` attendance persistence; writes teaching attendance to centralized `Attendance`
- `TrainerExposureVisits.jsx`: removed generated exposure visit reports, project lists, industry lists, and trade fixtures; derives rows from `ExposureVisit -> Project -> Batch -> Company`
- `ExposureVisitsStepper.jsx`: removed exposure visit draft `localStorage`, static project lists, and static trade lists; creates centralized exposure visit records
- `TrainerStudyModules.jsx`: removed static LMS hierarchy and generated module factory; derives department, center, role, batch, and module options from assigned trainer batches
- `TrainerLab.jsx`: removed static lab hierarchy, generated module factory, and hardcoded completed batches; derives lab navigation from assigned trainer batches
- `TrainersModuleHistory.jsx`: removed generated module history and stock-image fixture arrays; derives history from assigned trainer batches and module catalog
- `LeaveManagement.jsx`: removed direct `leaveWorkflow` persistence and writes to centralized leave requests
- `ReimbursementPortal.jsx`: removed initial reimbursement array and writes to centralized reimbursements
- `TourApplication.jsx`: removed initial tour array and writes to centralized tour requests
- `SalaryDashboard.jsx`: removed hardcoded salary/incentive records and derives compensation from centralized salaries
- `AdminSalaryApprovals.jsx`: removed `EMPLOYEES` and `SALARY_APPROVALS` imports and uses centralized salaries
- `GrievancePortal.jsx`: removed inline grievance records and shared grievance data import
- `AdminGrievancePortal.jsx`: removed employee/admin grievance data imports and updates centralized grievances
- `SuperAdminMobilizationPage.jsx`: removed `SA_PROJECTS` and generated pending mobilization lists
- `SuperAdminPlacementDrivesPage.jsx`: removed `SA_PROJECTS` and `SA_PLACEMENT_DRIVES`
- `SuperAdminEnrollmentMonitor.jsx`: removed `ALL_USERS`, static KPI arrays, center breakdown fixtures, and mobilizer detail maps
- `SuperAdminTrainingMonitor.jsx`: removed `ALL_USERS`, trainer detail maps, static KPIs, and center completion fixtures
- `SuperAdminPlacementMonitor.jsx`: removed `ALL_USERS`, placement officer detail maps, target fixtures, and static KPIs
- `SuperAdminAttendanceMonitor.jsx`: removed `ALL_USERS`, staff attendance maps, weekly trend fixtures, and static KPIs
- `SuperAdminTrainerAssignment.jsx`: removed `ALL_USERS`, static center list, and static batch list
- `SuperAdminPlacementAssignment.jsx`: removed `ALL_USERS`, static project list, and static center list
- `SuperAdminProjectAssignment.jsx`: removed `ALL_USERS`, static project list, and static center list
- `SuperAdminMobilizerDetail.jsx`: removed `ALL_USERS`, static mobilizer KPIs, activity fixtures, event fixtures, and attendance fixtures
- `SuperAdminTrainerDetail.jsx`: removed `ALL_USERS`, static trainer KPIs, module charts, session split fixtures, and attendance fixtures
- `SuperAdminPlacementOfficerDetail.jsx`: removed `ALL_USERS`, static placement officer KPIs, drive fixtures, sector split fixtures, and monthly placement fixtures
- `SuperAdminCandidateDetails.jsx`: removed `SA_PROJECTS` and derives project, center, batch, candidate, status, and placement filters from the normalized project hierarchy
- `SuperAdminTrainingTracking.jsx`: removed `SA_PROJECTS` and derives training progress, trainer labels, module completion, attendance, and student rows from the normalized project hierarchy
- `SuperAdminExposureVisits.jsx`: removed project, trade, status, visit, and proof-image fixtures; derives visit reports from `ExposureVisit -> Project -> Center -> Batch -> Trainer -> Company`
- `SuperAdminCommunityEngagementDrives.jsx`: removed project, block, type, status, drive, and proof-image fixtures; derives drive reports from `TourRequest -> Employee -> Project -> Center -> Candidate`
- `SuperAdminControlCenter.jsx`: removed static project lifecycle records and derives project health from centralized project, center, batch, and enrollment records
- `SuperAdminUserCredentials.jsx`: removed static role, center, and credential history records and derives provisioning options/history from `Employee -> Role -> Center`
- `SuperAdminDashboard.jsx`: removed `SA_PROJECTS`, `SA_EMPLOYEES`, and `SA_PLACEMENT_DRIVES`; derives portfolio KPIs from normalized project hierarchy, employees, and placement drives
- `SuperAdminCreateProjects.jsx`: removed `SA_PROJECTS` and `ALL_USERS`; derives project rows from `projectStore` and Admin lead options from `employeeStore`
- `SuperAdminUserManagement.jsx`: removed `SA_PROJECTS` and `ALL_USERS`; derives user rows, role tabs, project options, center options, and trainer trades from centralized employees and project hierarchy
- `SuperAdminGlobalTracking.jsx`: removed regional and milestone fixtures; derives node health, regional progress, milestones, and active sessions from projects, centers, batches, employees, companies, attendance, and candidate lifecycle data
- `SuperAdminFinanceManagement.jsx`: removed `EMPLOYEES` and `SALARY_APPROVALS`; derives salary approvals from centralized salary records through `salaryStore` and `selectSalaryRows`
- `SuperAdminInvoiceTracking.jsx`: removed `ALL_INVOICES` and derives tracking/payment rows from centralized finance invoices through `financeStore`
- `SuperAdminInvoiceApprovals.jsx`: removed Admin invoice fixture helpers and derives project/month/category approval queues from centralized finance invoices
- `AdminReports.jsx`: removed static enrollment, placement, training-hour, and sector chart arrays
- `ExecutiveConsole.jsx`: removed static executive KPI, grant-flow, portfolio-distribution, alert, and roadmap arrays
- `GrantFinancials.jsx`: removed static grant KPI, funding-source, disbursement, and transaction arrays
- `TrainerRevenue.jsx`: removed role revenue demo monthly data and invoice arrays; derives earnings from salary, attendance, and exposure-visit records
- `MobilizerRevenue.jsx`: removed commission demo monthly data and invoice arrays; derives earnings from candidate and tour-request records
- `PlacementRevenue.jsx`: removed placement revenue demo monthly data and invoice arrays; derives earnings from placement drives and centralized invoices

## Workflow Impact

- One employee table now feeds trainer, mobilizer, placement officer, admin, and user views.
- User management now derives user names, roles, centers, and projects from `User -> Employee -> Role -> Center -> Project`.
- Center management now derives center metrics from `Center -> Batch -> Enrollment` and `Center -> Employee`.
- Admin dashboard KPIs now derive from `Project -> Center -> Batch -> Enrollment`, `Employee -> Role`, `Attendance`, `Grievance`, and `PlacementDrive`.
- Admin project workspace now derives project reports from `Project -> FundingAgency -> Center -> Batch -> Enrollment -> Candidate -> Employee -> Grievance -> PlacementDrive`.
- Admin project creation now writes through `projectStore -> project.service -> Project`, preserving the future API swap path.
- Client dashboards, project detail, performance, success stories, live feed, and reports now share the same normalized client scope: `FundingAgency -> Project -> Center -> Batch -> Enrollment -> Candidate -> PlacementDrive`.
- Client report invoice/procurement exports now use `Invoice -> Project -> Center` and `Procurement -> Project -> Center` instead of Admin fixture rows.
- Candidate approvals now derive from `Candidate -> Enrollment -> Batch -> Center -> Project`.
- Approval actions update the candidate entity through `candidateStore.update()`.
- Mobilizer enrollment now creates normalized `Candidate` and `Enrollment` records through `candidateStore.createLifecycle()`.
- Enrollment choices now derive from `Project -> School -> Center -> Batch`, and submitted candidates immediately enter the shared lifecycle used by approvals, training, and placement selectors.
- Placement company screens now derive from the single `Company` registry.
- Placement drive completion now updates the single `PlacementDrive` entity.
- Placement candidate sheets now flow through `PlacementDrive -> Candidate -> Enrollment -> Batch -> Center -> Project -> Company`.
- Placement document upload/verification state is isolated as UI workflow state while entity identity and relationships remain centralized.
- Placement openings, map heat, workforce KPIs, company trends, role demand, segment distribution, salary charts, funnel values, and retention views now derive from centralized placement drives and candidate lifecycle data.
- HR entitlement pages now reference employee IDs instead of role-only buckets.
- Attendance punch records now flow through `Attendance` entities.
- Trainer punch-in/out records now flow through `Trainer UI -> attendanceStore -> attendance.service -> Attendance`, with project, center, and batch inferred from the assigned trainer batch.
- Admin trainer attendance now derives from `Employee(role=Trainer) -> Attendance`, and module tracking derives from `Batch -> Trainer Employee -> Center`.
- Internal assessment creation now writes to `assessmentStore`, and marks entry uses candidates from `Batch -> Enrollment -> Candidate`.
- Teaching-management punch records write through the same attendance service with a TMS session key.
- Exposure visit report creation, completion, and documentation upload now write through `exposureVisitStore`, keeping project, center, batch, and company references centralized.
- Trainer LMS, lab, and module-history pages now derive navigation and progress context from `Employee -> Batch -> Project -> Center -> Module Catalog`.
- Salary dashboards and approvals now derive from `Salary -> Employee -> Project -> Center`.
- Grievance user/admin workflows now share the same `Grievance` table and status updates write back through `grievanceStore`.
- SuperAdmin mobilization drilldowns now derive from `Project -> Center -> Batch -> Enrollment -> Candidate`.
- SuperAdmin placement-drive drilldowns now derive from `Project -> PlacementDrive -> Company -> Candidate -> Enrollment -> Batch`.
- SuperAdmin monitor KPIs now derive from normalized employee roles, attendance, candidates, batches, centers, companies, and placement drives.
- SuperAdmin assignment wizards now derive selectable employees from `Employee -> Role` and selectable scopes from `Project -> Center -> Batch`.
- SuperAdmin employee drilldowns now derive role-specific detail from `Employee -> Candidate`, `Employee -> Batch -> ExposureVisit`, and `Employee -> PlacementDrive -> Company -> Candidate`.
- SuperAdmin project drilldowns now share one `Project -> Center -> Batch -> Candidate -> Attendance -> Placement` hierarchy for candidate detail and training tracking.
- SuperAdmin operational pages now share normalized operations records for exposure visits, community mobilization drives, project control health, and credential provisioning.
- SuperAdmin dashboard and access-control pages now share the same project, employee, center, batch, and placement-drive records used by downstream modules.
- SuperAdmin global tracking and salary finance review now share the normalized project, employee, salary, attendance, and lifecycle records used by HR and operations.
- SuperAdmin invoice tracking and approval queues now share the same `Invoice -> Project -> Center -> Admin -> Attendance` records used by the finance mock service.
- Admin report charts now derive from `Enrollment -> Candidate`, `PlacementDrive -> Company -> Candidate`, `Attendance -> Center`, and `Company -> Sector`.
- Executive finance analytics now derive from `Revenue -> Project -> FundingAgency`, `Invoice -> Project -> Center`, `Procurement -> Project -> Center`, `Salary -> Employee`, and placement outcomes.
- Role revenue pages now derive monthly earnings from normalized role workflows instead of role-specific demo ledgers.

## Still Pending

All planned ERP data-layer migration phases are complete.

Build and targeted lint pass after this migration.
