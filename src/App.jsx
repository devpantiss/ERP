import "./App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "react-day-picker/dist/style.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import Loader2 from "./components/common/Loader2";

// ─── Layout shells (eager — always needed for their role section) ────────────
import MobilizerLayout from "./components/Layout/MobilizerLayout";
import TrainerLayout from "./components/Layout/TrainerLayout";
import PlacementLayout from "./components/Layout/PlacementLayout";
import AdminLayout from "./components/Layout/AdminLayout";
import SuperAdminLayout from "./components/Layout/SuperAdminLayout";
import Loader from "./components/common/Loader";

// ─── All pages — lazy loaded (Vite auto-chunks each) ────────────────────────

// Public
const Home2 = lazy(() => import("./pages/Home2"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

// Mobilizer
const MobilizerDashboard = lazy(() => import("./pages/Mobilizer/MobilizerDashboard"));
const StudentEnrollment = lazy(() => import("./pages/Mobilizer/StudentRnrollment"));
const CommunityHistory = lazy(() => import("./pages/Mobilizer/CommunityHistory"));
const MobilizerAttendance = lazy(() => import("./pages/Mobilizer/MobilizerAttendance"));
const MobilizerProfile = lazy(() => import("./pages/Mobilizer/MobilizerProfile"));
const CandidateEnrollmentStepper = lazy(() => import("./components/Mobilizer/CandidateEnrollmentStepper"));
const CommunityDriveStepper = lazy(() => import("./components/Mobilizer/CommunityDriveStepper"));
const MobilizerRevenue = lazy(() => import("./pages/Mobilizer/MobilizerRevenue"));

// Shared pages (HR Entitlement + Grievance)
const SalaryDashboard = lazy(() => import("./pages/shared/SalaryDashboard"));
const ReimbursementPortal = lazy(() => import("./pages/shared/ReimbursementPortal"));
const GrievancePortal = lazy(() => import("./pages/shared/GrievancePortal"));
const SharedAttendancePage = lazy(() => import("./pages/shared/AttendancePage"));

// Trainer
const TrainerDashboard = lazy(() => import("./pages/Trainer/TrainerDashboard"));
const TrainerAttendance = lazy(() => import("./pages/Trainer/TrainerAttendance"));
const TrainerExposureVisits = lazy(() => import("./pages/Trainer/TrainerExposureVisits"));
const TrainerInternalAssessments = lazy(() => import("./pages/Trainer/TrainerInternalAssessments"));
const TrainerStudyModules = lazy(() => import("./pages/Trainer/TrainerStudyModules"));
const TrainerProfile = lazy(() => import("./pages/Trainer/TrainerProfile"));
const TrainerLab = lazy(() => import("./pages/Trainer/TrainerLab"));
const TrainersModuleHistory = lazy(() => import("./pages/Trainer/TrainersModuleHistory"));
const ExposureVisitEnterprisePro = lazy(() => import("./pages/Trainer/ExposureVisitsStepper"));
const TrainerLiveFeedHost = lazy(() => import("./pages/Trainer/TrainerLiveFeedHost"));
const TrainerLiveFeedViewer = lazy(() => import("./pages/Trainer/TrainerLiveFeedViewer"));
const TrainerRevenue = lazy(() => import("./pages/Trainer/TrainerRevenue"));
const TeachingManagementSystem = lazy(() => import("./pages/Trainer/TeachingManagementSystem"));

// Placement
const PlacementDashboard = lazy(() => import("./pages/Placement/PlacementDashboard"));
const PlacementCompanyList = lazy(() => import("./pages/Placement/PlacementCompanyList"));
const PlacementCompanyDatabaseStepper = lazy(() => import("./pages/Placement/PlacementCompanyDatabaseStepper"));
const PlacementDrivesDetails = lazy(() => import("./pages/Placement/PlacementDriveDetails"));
const PlacementDriveStepper = lazy(() => import("./pages/Placement/PlacementDriveStepper"));
const PlacementStudentsList = lazy(() => import("./pages/Placement/PlacementsStudentsList"));
const PlacementStudentDetailsStepper = lazy(() => import("./pages/Placement/PlacementStudentDetailsStepper"));
const PlacementOpeningsDashboard = lazy(() => import("./pages/Placement/PlacementOpeningsDashboard"));
const PlacementRevenue = lazy(() => import("./pages/Placement/PlacementRevenue"));

// Admin
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminUserManagement = lazy(() => import("./pages/Admin/AdminUserManagement"));
const AdminAddUserStepper = lazy(() => import("./pages/Admin/AdminAddUserStepper"));
const AdminProjectManagement = lazy(() => import("./pages/Admin/AdminProjectManagement"));
const AdminAddProjectStepper = lazy(() => import("./pages/Admin/AdminAddProjectStepper"));
const AdminCenterManagement = lazy(() => import("./pages/Admin/AdminCenterManagement"));
const AdminAttendanceOverview = lazy(() => import("./pages/Admin/AdminAttendanceOverview"));
const AdminReports = lazy(() => import("./pages/Admin/AdminReports"));
const AdminSettings = lazy(() => import("./pages/Admin/AdminSettings"));
const AdminProfile = lazy(() => import("./pages/Admin/AdminProfile"));
const AdminMobilizerList = lazy(() => import("./pages/Admin/AdminMobilizerList"));
const AdminMobilizerDashboard = lazy(() => import("./pages/Admin/AdminMobilizerDashboard"));
const AdminCandidateApprovals = lazy(() => import("./pages/Admin/AdminCandidateApprovals"));
const AdminCommunityEvents = lazy(() => import("./pages/Admin/AdminCommunityEvents"));
const AdminTrainerList = lazy(() => import("./pages/Admin/AdminTrainerList"));
const AdminTrainerDashboard = lazy(() => import("./pages/Admin/AdminTrainerDashboard"));
const AdminExposureVisitApprovals = lazy(() => import("./pages/Admin/AdminExposureVisitApprovals"));
const AdminModuleProgress = lazy(() => import("./pages/Admin/AdminModuleProgress"));
const AdminTrainerAttendance = lazy(() => import("./pages/Admin/AdminTrainerAttendance"));
const AdminTrainerLiveFeed = lazy(() => import("./pages/Admin/AdminTrainerLiveFeed"));
const AdminPlacementDriveApprovals = lazy(() => import("./pages/Admin/AdminPlacementDriveApprovals"));
const AdminPlacementTracker = lazy(() => import("./pages/Admin/AdminPlacementTracker"));
const AdminInvoiceManagement = lazy(() => import("./pages/Admin/AdminInvoiceManagement"));

// Super Admin
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdmin/SuperAdminDashboard"));
const SuperAdminEnrollmentMonitor = lazy(() => import("./pages/SuperAdmin/SuperAdminEnrollmentMonitor"));
const SuperAdminTrainingMonitor = lazy(() => import("./pages/SuperAdmin/SuperAdminTrainingMonitor"));
const SuperAdminPlacementMonitor = lazy(() => import("./pages/SuperAdmin/SuperAdminPlacementMonitor"));
const SuperAdminAttendanceMonitor = lazy(() => import("./pages/SuperAdmin/SuperAdminAttendanceMonitor"));
const SuperAdminInvoiceTracking = lazy(() => import("./pages/SuperAdmin/SuperAdminInvoiceTracking"));
const SuperAdminUserManagement = lazy(() => import("./pages/SuperAdmin/SuperAdminUserManagement"));
const SuperAdminProjectAssignment = lazy(() => import("./pages/SuperAdmin/SuperAdminProjectAssignment"));
const SuperAdminTrainerAssignment = lazy(() => import("./pages/SuperAdmin/SuperAdminTrainerAssignment"));
const SuperAdminPlacementAssignment = lazy(() => import("./pages/SuperAdmin/SuperAdminPlacementAssignment"));
const SuperAdminMobilizerDetail = lazy(() => import("./pages/SuperAdmin/SuperAdminMobilizerDetail"));
const SuperAdminTrainerDetail = lazy(() => import("./pages/SuperAdmin/SuperAdminTrainerDetail"));
const SuperAdminPlacementOfficerDetail = lazy(() => import("./pages/SuperAdmin/SuperAdminPlacementOfficerDetail"));

// ─── Suspense fallback ───────────────────────────────────────────────────────
const PageFallback = (
  <div className="fixed inset-0 flex items-center justify-center bg-[#060810] z-[9999]">
    <Loader />
  </div>
);

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Suspense fallback={PageFallback}>
        <div className="page-fade-in">
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home2 />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/live/:sessionId" element={<TrainerLiveFeedViewer />} />
          <Route path="/trainer/live/:sessionId" element={<TrainerLiveFeedViewer />} />

          {/* Mobilizer Layout Routes */}
          <Route path="/mobilizer" element={<MobilizerLayout />}>
            {/* Default page */}
            <Route index element={<MobilizerDashboard />} />

            {/* Explicit pages */}
            <Route path="dashboard" element={<MobilizerDashboard />} />
            <Route path="student-enrollment" element={<StudentEnrollment />} />
            <Route path="community-engagement" element={<CommunityHistory />} />
            <Route path="attendance" element={<MobilizerAttendance />} />
            <Route path="profile" element={<MobilizerProfile />} />
            <Route path="candidate-enrollment" element={<CandidateEnrollmentStepper />} />
            <Route path="create-community-drive" element={<CommunityDriveStepper />} />
            <Route path="revenue" element={<MobilizerRevenue />} />

            {/* HR Entitlement */}
            <Route path="hr/attendance" element={<MobilizerAttendance />} />
            <Route path="hr/salary" element={<SalaryDashboard />} />
            <Route path="hr/reimbursement" element={<ReimbursementPortal />} />

            {/* Grievance */}
            <Route path="grievance" element={<GrievancePortal />} />
          </Route>

          {/* Trainer Layout Routes */}
          <Route path="/trainer" element={<TrainerLayout />}>
            <Route index element={<TrainerDashboard />} />

            <Route path="dashboard" element={<TrainerDashboard />} />
            <Route path="attendance" element={<TrainerAttendance />} />
            <Route path="exposure-visits" element={<TrainerExposureVisits />} />
            <Route path="exposure-visits/new" element={<ExposureVisitEnterprisePro />} />
            <Route path="internal-assessment" element={<TrainerInternalAssessments />} />
            <Route path="study-modules" element={<TrainerStudyModules />} />
            <Route path="profile" element={<TrainerProfile />} />
            <Route path="labs" element={<TrainerLab />} />
            <Route path="module-progress" element={<TrainersModuleHistory />} />
            <Route path="live-feed-host" element={<TrainerLiveFeedHost />} />
            <Route path="revenue" element={<TrainerRevenue />} />

            {/* Teaching Management System (separate from HR — uses original attendance) */}
            <Route path="teaching-management" element={<TrainerAttendance />} />

            {/* HR Entitlement (no attendance for Trainer) */}
            <Route path="hr/salary" element={<SalaryDashboard />} />
            <Route path="hr/reimbursement" element={<ReimbursementPortal />} />

            {/* Grievance */}
            <Route path="grievance" element={<GrievancePortal />} />
          </Route>

          {/* Placement Layout Routes */}
          <Route path="/placement-officer" element={<PlacementLayout />}>
            <Route index element={<PlacementDashboard />} />

            <Route path="dashboard" element={<PlacementDashboard />} />
            <Route path="company-database" element={<PlacementCompanyList />} />
            <Route path="company-database/new" element={<PlacementCompanyDatabaseStepper />} />
            <Route path="placement-drives" element={<PlacementDrivesDetails />} />
            <Route path="placement-drives/new" element={<PlacementDriveStepper />} />
            <Route path="placements-list" element={<PlacementStudentsList />} />
            <Route path="placements-list/new" element={<PlacementStudentDetailsStepper />} />
            <Route path="job-openings" element={<PlacementOpeningsDashboard />} />
            <Route path="job-openings/new" element={<PlacementOpeningsDashboard />} />
            <Route path="revenue" element={<PlacementRevenue />} />

            {/* HR Entitlement */}
            <Route path="hr/attendance" element={<SharedAttendancePage />} />
            <Route path="hr/salary" element={<SalaryDashboard />} />
            <Route path="hr/reimbursement" element={<ReimbursementPortal />} />

            {/* Grievance */}
            <Route path="grievance" element={<GrievancePortal />} />
          </Route>

          {/* Admin Layout Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />

            {/* General */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="user-management" element={<AdminUserManagement />} />
            <Route path="user-management/new" element={<AdminAddUserStepper />} />
            <Route path="project-management" element={<AdminProjectManagement />} />
            <Route path="project-management/new" element={<AdminAddProjectStepper />} />
            <Route path="center-management" element={<AdminCenterManagement />} />
            <Route path="attendance-overview" element={<AdminAttendanceOverview />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="invoice-management" element={<AdminInvoiceManagement />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />

            {/* Mobilizers */}
            <Route path="mobilizer-list" element={<AdminMobilizerList />} />
            <Route path="mobilizer-dashboard/:id" element={<AdminMobilizerDashboard />} />
            <Route path="candidate-approvals" element={<AdminCandidateApprovals />} />
            <Route path="community-events" element={<AdminCommunityEvents />} />

            {/* Trainers */}
            <Route path="trainer-list" element={<AdminTrainerList />} />
            <Route path="trainer-dashboard/:id" element={<AdminTrainerDashboard />} />
            <Route path="exposure-visit-approvals" element={<AdminExposureVisitApprovals />} />
            <Route path="module-progress" element={<AdminModuleProgress />} />
            <Route path="trainer-attendance" element={<AdminTrainerAttendance />} />
            <Route path="trainer-live-feed" element={<AdminTrainerLiveFeed />} />

            {/* Placements */}
            <Route path="placement-drive-approvals" element={<AdminPlacementDriveApprovals />} />
            <Route path="placement-tracker" element={<AdminPlacementTracker />} />
          </Route>

          {/* Super Admin Layout Routes */}
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />

            {/* Monitoring */}
            <Route path="enrollment-monitor" element={<SuperAdminEnrollmentMonitor />} />
            <Route path="training-monitor" element={<SuperAdminTrainingMonitor />} />
            <Route path="placement-monitor" element={<SuperAdminPlacementMonitor />} />
            <Route path="attendance-monitor" element={<SuperAdminAttendanceMonitor />} />
            <Route path="invoice-tracking" element={<SuperAdminInvoiceTracking />} />

            {/* Individual Detail Dashboards */}
            <Route path="mobilizer/:id" element={<SuperAdminMobilizerDetail />} />
            <Route path="trainer/:id" element={<SuperAdminTrainerDetail />} />
            <Route path="placement-officer/:id" element={<SuperAdminPlacementOfficerDetail />} />

            {/* Access Control */}
            <Route path="user-management" element={<SuperAdminUserManagement />} />
            <Route path="project-assignment" element={<SuperAdminProjectAssignment />} />
            <Route path="trainer-assignment" element={<SuperAdminTrainerAssignment />} />
            <Route path="placement-assignment" element={<SuperAdminPlacementAssignment />} />

            {/* Settings */}
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Routes>
        </div>
      </Suspense>
      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );r
}

export default App;
