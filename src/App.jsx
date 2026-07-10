import "./App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
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
import ClientLayout from "./components/Layout/ClientLayout";
import Loader from "./components/common/Loader";

// ─── All pages — lazy loaded (Vite auto-chunks each) ────────────────────────

// Public
const Home2 = lazy(() => import("./pages/Home2"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ClientLogin = lazy(() => import("./pages/Client/ClientLogin"));
const ClientProtectedRoute = lazy(() => import("./pages/Client/ClientProtectedRoute"));
const ClientDashboard = lazy(() => import("./pages/Client/ClientDashboard"));
const ClientProjects = lazy(() => import("./pages/Client/ClientProjects"));
const ClientPerformance = lazy(() => import("./pages/Client/ClientPerformance"));
const ClientSuccessStory = lazy(() => import("./pages/Client/ClientSuccessStory"));
const ClientReports = lazy(() => import("./pages/Client/ClientReports"));
const ClientLiveFeed = lazy(() => import("./pages/Client/ClientLiveFeed"));
const ClientProjectDetail = lazy(() =>
  import("./pages/Client/ClientProjects").then((module) => ({
    default: module.ClientProjectDetail,
  }))
);

// Mobilizer
const MobilizerDashboard = lazy(() => import("./pages/Mobilizer/MobilizerDashboard"));
const StudentEnrollment = lazy(() => import("./pages/Mobilizer/StudentRnrollment"));
const CommunityHistory = lazy(() => import("./pages/Mobilizer/CommunityHistory"));
const MobilizerAttendance = lazy(() => import("./pages/Mobilizer/MobilizerAttendance"));
const MobilizerProfile = lazy(() => import("./pages/Mobilizer/MobilizerProfile"));
const MobilizerRevenue = lazy(() => import("./pages/Mobilizer/MobilizerRevenue"));

// Shared pages (HR Entitlement + Grievance)
const SalaryDashboard = lazy(() => import("./pages/shared/SalaryDashboard"));
const ReimbursementPortal = lazy(() => import("./pages/shared/ReimbursementPortal"));
const TourApplication = lazy(() => import("./pages/shared/TourApplication"));
const LeaveManagement = lazy(() => import("./pages/shared/LeaveManagement"));
const GrievancePortal = lazy(() => import("./pages/shared/GrievancePortal"));
const SharedAttendancePage = lazy(() => import("./pages/shared/AttendancePage"));

// Trainer
const TrainerDashboard = lazy(() => import("./pages/Trainer/TrainerDashboard"));
const TrainerAttendance = lazy(() => import("./pages/Trainer/TrainerAttendance"));
const TrainerExposureVisits = lazy(() => import("./pages/Trainer/TrainerExposureVisits"));
const TrainerStudyModules = lazy(() => import("./pages/Trainer/TrainerStudyModules"));
const TrainerProfile = lazy(() => import("./pages/Trainer/TrainerProfile"));
const TrainerLab = lazy(() => import("./pages/Trainer/TrainerLab"));
const TrainerLiveFeedHost = lazy(() => import("./pages/Trainer/TrainerLiveFeedHost"));
const TrainerLiveFeedViewer = lazy(() => import("./pages/Trainer/TrainerLiveFeedViewer"));
const TrainerRevenue = lazy(() => import("./pages/Trainer/TrainerRevenue"));
const TeachingManagementSystem = lazy(() => import("./pages/Trainer/TeachingManagementSystem"));

// Placement
const PlacementDashboard = lazy(() => import("./pages/Placement/PlacementDashboard"));
const PlacementCompanyList = lazy(() => import("./pages/Placement/PlacementCompanyList"));
const PlacementDrivesDetails = lazy(() => import("./pages/Placement/PlacementDriveDetails"));
const PlacementDriveStepper = lazy(() => import("./pages/Placement/PlacementDriveStepper"));
const PlacementStudentsList = lazy(() => import("./pages/Placement/PlacementsStudentsList"));
const PlacementStudentDetailsStepper = lazy(() => import("./pages/Placement/PlacementStudentDetailsStepper"));
const PlacementOpeningsDashboard = lazy(() => import("./pages/Placement/PlacementOpeningsDashboard"));
const PlacementRevenue = lazy(() => import("./pages/Placement/PlacementRevenue"));
const PlacementProfile = lazy(() => import("./pages/Placement/PlacementProfile"));

// Admin
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminUserManagement = lazy(() => import("./pages/Admin/AdminUserManagement"));
const AdminAddUserStepper = lazy(() => import("./pages/Admin/AdminAddUserStepper"));
const AdminProjectManagement = lazy(() => import("./pages/Admin/AdminProjectManagement"));
const AdminAddProjectStepper = lazy(() => import("./pages/Admin/AdminAddProjectStepper"));
const AdminCenterManagement = lazy(() => import("./pages/Admin/AdminCenterManagement"));
const AdminReports = lazy(() => import("./pages/Admin/AdminReports"));
const AdminSettings = lazy(() => import("./pages/Admin/AdminSettings"));
const AdminProfile = lazy(() => import("./pages/Admin/AdminProfile"));
const AdminMobilizerList = lazy(() => import("./pages/Admin/AdminMobilizerList"));
const AdminMobilizerDashboard = lazy(() => import("./pages/Admin/AdminMobilizerDashboard"));
const AdminCandidateApprovals = lazy(() => import("./pages/Admin/AdminCandidateApprovals"));
const AdminCommunityEvents = lazy(() => import("./pages/Admin/AdminCommunityEvents"));
const AdminTrainerList = lazy(() => import("./pages/Admin/AdminTrainerList"));
const AdminSalaryApprovals = lazy(() => import("./pages/Admin/AdminSalaryApprovals"));
const AdminReimbursementApprovals = lazy(() => import("./pages/Admin/AdminReimbursementApprovals"));
const AdminProcurement = lazy(() => import("./pages/Admin/AdminProcurement"));
const AdminApprovals = lazy(() => import("./pages/Admin/AdminApprovals"));
const AdminLeaveApprovals = lazy(() => import("./pages/Admin/AdminLeaveApprovals"));
const AdminTourApprovals = lazy(() => import("./pages/Admin/AdminTourApprovals"));
const AdminTrainerDashboard = lazy(() => import("./pages/Admin/AdminTrainerDashboard"));
const AdminExposureVisitApprovals = lazy(() => import("./pages/Admin/AdminExposureVisitApprovals"));
const AdminModuleProgress = lazy(() => import("./pages/Admin/AdminModuleProgress"));
const AdminTrainerLiveFeed = lazy(() => import("./pages/Admin/AdminTrainerLiveFeed"));
const AdminPlacementDriveApprovals = lazy(() => import("./pages/Admin/AdminPlacementDriveApprovals"));
const AdminPlacementTracker = lazy(() => import("./pages/Admin/AdminPlacementTracker"));
const AdminInvoiceManagement = lazy(() => import("./pages/Admin/AdminInvoiceManagement"));
const AdminGrievancePortal = lazy(() => import("./pages/Admin/AdminGrievancePortal"));
const AdminStudentsKitDistribution = lazy(() => import("./pages/Admin/AdminStudentsKitDistribution"));
const AdminStudentInsuranceDetails = lazy(() => import("./pages/Admin/AdminStudentInsuranceDetails"));
const AdminBatchCertification = lazy(() => import("./pages/Admin/AdminBatchCertification"));
const AdminTestimonials = lazy(() => import("./pages/Admin/AdminTestimonials"));
const AdminFeeCollection = lazy(() => import("./pages/Admin/AdminFeeCollection"));

// Super Admin
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdmin/SuperAdminDashboard"));
const SuperAdminEnrollmentMonitor = lazy(() => import("./pages/SuperAdmin/SuperAdminEnrollmentMonitor"));
const SuperAdminTrainingMonitor = lazy(() => import("./pages/SuperAdmin/SuperAdminTrainingMonitor"));
const SuperAdminPlacementMonitor = lazy(() => import("./pages/SuperAdmin/SuperAdminPlacementMonitor"));
const SuperAdminAttendanceMonitor = lazy(() => import("./pages/SuperAdmin/SuperAdminAttendanceMonitor"));
const SuperAdminInvoiceTracking = lazy(() => import("./pages/SuperAdmin/SuperAdminInvoiceTracking"));
const SuperAdminFinanceManagement = lazy(() => import("./pages/SuperAdmin/SuperAdminFinanceManagement"));
const SuperAdminInvoiceApprovals = lazy(() => import("./pages/SuperAdmin/SuperAdminInvoiceApprovals"));
const SuperAdminReimbursementApprovals = lazy(() => import("./pages/SuperAdmin/SuperAdminReimbursementApprovals"));
const SuperAdminUserManagement = lazy(() => import("./pages/SuperAdmin/SuperAdminUserManagement"));
const SuperAdminProjectAssignment = lazy(() => import("./pages/SuperAdmin/SuperAdminProjectAssignment"));
const SuperAdminTrainerAssignment = lazy(() => import("./pages/SuperAdmin/SuperAdminTrainerAssignment"));
const SuperAdminPlacementAssignment = lazy(() => import("./pages/SuperAdmin/SuperAdminPlacementAssignment"));
const SuperAdminMobilizerDetail = lazy(() => import("./pages/SuperAdmin/SuperAdminMobilizerDetail"));
const SuperAdminTrainerDetail = lazy(() => import("./pages/SuperAdmin/SuperAdminTrainerDetail"));
const SuperAdminPlacementOfficerDetail = lazy(() => import("./pages/SuperAdmin/SuperAdminPlacementOfficerDetail"));
const SuperAdminCandidateDetails = lazy(() => import("./pages/SuperAdmin/SuperAdminCandidateDetails"));
const SuperAdminPlacementDrivesPage = lazy(() => import("./pages/SuperAdmin/SuperAdminPlacementDrivesPage"));
const SuperAdminMobilizationPage = lazy(() => import("./pages/SuperAdmin/SuperAdminMobilizationPage"));
const SuperAdminCommunityEngagementDrives = lazy(() => import("./pages/SuperAdmin/SuperAdminCommunityEngagementDrives"));
const SuperAdminTrainingTracking = lazy(() => import("./pages/SuperAdmin/SuperAdminTrainingTracking"));
const SuperAdminExposureVisits = lazy(() => import("./pages/SuperAdmin/SuperAdminExposureVisits"));
const SuperAdminEmployeeManagement = lazy(() => import("./pages/SuperAdmin/SuperAdminEmployeeManagement"));
const SuperAdminGrievancePortal = lazy(() => import("./pages/SuperAdmin/SuperAdminGrievancePortal"));
const SuperAdminLeaveMonitor = lazy(() => import("./pages/SuperAdmin/SuperAdminLeaveMonitor"));
const SuperAdminCreateProjects = lazy(() => import("./pages/SuperAdmin/SuperAdminCreateProjects"));
const SuperAdminProjectDetails = lazy(() => import("./pages/SuperAdmin/SuperAdminProjectDetails"));
const SuperAdminApprovalsHub = lazy(() => import("./pages/SuperAdmin/SuperAdminApprovalsHub"));
const SuperAdminOperationsApprovals = lazy(() => import("./pages/SuperAdmin/SuperAdminOperationsApprovals"));
const SuperAdminTourApprovals = lazy(() => import("./pages/SuperAdmin/SuperAdminTourApprovals"));
const SuperAdminLeaveApprovals = lazy(() => import("./pages/SuperAdmin/SuperAdminLeaveApprovals"));
const SuperAdminSalaryApprovals = lazy(() => import("./pages/SuperAdmin/SuperAdminSalaryApprovals"));
const SuperAdminFeeMonitor = lazy(() => import("./pages/SuperAdmin/SuperAdminFeeMonitor"));
const SuperAdminModuleContent = lazy(() => import("./pages/SuperAdmin/SuperAdminModuleContent"));

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
            <Route path="/client-login" element={<ClientLogin />} />
            <Route path="/live/:sessionId" element={<TrainerLiveFeedViewer />} />
            <Route path="/trainer/live/:sessionId" element={<TrainerLiveFeedViewer />} />

            {/* Client Portal Routes */}
            <Route element={<ClientProtectedRoute />}>
              <Route path="/client" element={<ClientLayout />}>
                <Route index element={<Navigate to="/client/dashboard" replace />} />
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="projects" element={<ClientProjects />} />
                <Route path="projects/:projectId" element={<ClientProjectDetail />} />
                <Route path="performance" element={<ClientPerformance />} />
                <Route path="reports" element={<ClientReports />} />
                <Route path="success-story" element={<ClientSuccessStory />} />
                <Route path="live-feed" element={<ClientLiveFeed />} />
              </Route>
            </Route>

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
              <Route path="revenue" element={<MobilizerRevenue />} />

              {/* HR Entitlement */}
              <Route path="hr/attendance" element={<MobilizerAttendance />} />
              <Route path="hr/leave" element={<LeaveManagement />} />
              <Route path="hr/tour" element={<TourApplication />} />
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
              <Route path="study-modules" element={<TrainerStudyModules />} />
              <Route path="profile" element={<TrainerProfile />} />
              <Route path="labs" element={<TrainerLab />} />
              <Route path="live-feed-host" element={<TrainerLiveFeedHost />} />
              <Route path="revenue" element={<TrainerRevenue />} />
              <Route path="testimonials" element={<AdminTestimonials />} />

              {/* Teaching Management System (separate from HR — uses original attendance) */}
              <Route path="teaching-management" element={<TrainerAttendance />} />

              {/* HR Entitlement (no attendance for Trainer) */}
              <Route path="hr/leave" element={<LeaveManagement />} />
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
              <Route path="placement-drives" element={<PlacementDrivesDetails />} />
              <Route path="placements-list" element={<PlacementStudentsList />} />
              <Route path="job-openings" element={<PlacementOpeningsDashboard />} />
              <Route path="revenue" element={<PlacementRevenue />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="profile" element={<PlacementProfile />} />

              {/* HR Entitlement */}
              <Route path="hr/attendance" element={<SharedAttendancePage />} />
              <Route path="hr/leave" element={<LeaveManagement />} />
              <Route path="hr/tour" element={<TourApplication />} />
              <Route path="hr/salary" element={<SalaryDashboard />} />
              <Route path="hr/reimbursement" element={<ReimbursementPortal />} />

              {/* Grievance */}
              <Route path="grievance" element={<GrievancePortal />} />
            </Route>

            {/* Admin Layout Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />

              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="employee-list" element={<AdminTrainerList />} />
              <Route path="invoices" element={<AdminInvoiceManagement />} />
              <Route
                path="financial-management/salary-approvals"
                element={<AdminSalaryApprovals />}
              />
              <Route
                path="financial-management/invoices-raised"
                element={<AdminInvoiceManagement />}
              />
              <Route
                path="financial-management/procurement"
                element={<AdminProcurement />}
              />
              <Route path="live-feed" element={<AdminTrainerLiveFeed />} />
              <Route path="project-details-reports" element={<AdminProjectManagement />} />
              <Route path="students-kit-distribution" element={<AdminStudentsKitDistribution />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="hr/attendance" element={<SharedAttendancePage employeeId="EMP-0007" eyebrow="Admin Attendance" />} />
              <Route path="hr/leave" element={<LeaveManagement />} />
              <Route path="hr/salary" element={<SalaryDashboard />} />
              <Route path="hr/reimbursement" element={<ReimbursementPortal />} />
              <Route path="approvals" element={<AdminApprovals />} />
              <Route path="approvals/operations" element={<AdminApprovals />} />
              <Route path="approvals/tour" element={<AdminTourApprovals />} />
              <Route path="approvals/leave" element={<AdminLeaveApprovals />} />
              <Route path="approvals/salary" element={<AdminSalaryApprovals />} />
              <Route path="approvals/reimbursements" element={<AdminReimbursementApprovals />} />
              <Route path="leave-approvals" element={<AdminLeaveApprovals />} />

              {/* Legacy admin routes kept for compatibility */}
              <Route path="user-management" element={<AdminUserManagement />} />
              <Route path="user-management/new" element={<AdminAddUserStepper />} />
              <Route path="project-management" element={<AdminProjectManagement />} />
              <Route path="project-management/new" element={<AdminAddProjectStepper />} />
              <Route path="center-management" element={<AdminCenterManagement />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="invoice-management" element={<AdminInvoiceManagement />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="mobilizer-list" element={<AdminMobilizerList />} />
              <Route path="mobilizer-dashboard/:id" element={<AdminMobilizerDashboard />} />
              <Route path="candidate-approvals" element={<AdminCandidateApprovals />} />
              <Route path="community-events" element={<AdminCommunityEvents />} />
              <Route path="trainer-list" element={<AdminTrainerList />} />
              <Route path="trainer-dashboard/:id" element={<AdminTrainerDashboard />} />
              <Route path="exposure-visit-approvals" element={<AdminExposureVisitApprovals />} />
              <Route path="module-progress" element={<AdminModuleProgress />} />
              <Route path="trainer-attendance" element={<SharedAttendancePage employeeId="EMP-0007" eyebrow="Admin Attendance" />} />
              <Route path="trainer-live-feed" element={<AdminTrainerLiveFeed />} />
              <Route path="placement-drive-approvals" element={<AdminPlacementDriveApprovals />} />
              <Route path="placement-tracker" element={<AdminPlacementTracker />} />
              <Route path="grievance-portal" element={<AdminGrievancePortal />} />
              <Route path="fee-collection" element={<AdminFeeCollection />} />
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
              <Route path="salaries" element={<SuperAdminFinanceManagement />} />
              <Route path="finance" element={<SuperAdminFinanceManagement />} />
              <Route path="financial-management" element={<SuperAdminFinanceManagement />} />
              <Route path="invoices" element={<SuperAdminInvoiceApprovals />} />
              <Route path="financial-management/invoices" element={<SuperAdminInvoiceApprovals />} />
              <Route path="reimbursements" element={<SuperAdminReimbursementApprovals />} />
              <Route path="financial-management/reimbursements" element={<SuperAdminReimbursementApprovals />} />
              <Route path="financial-management/insurance" element={<AdminStudentInsuranceDetails />} />

              {/* Individual Detail Dashboards */}
              <Route path="mobilizer/:id" element={<SuperAdminMobilizerDetail />} />
              <Route path="trainer/:id" element={<SuperAdminTrainerDetail />} />
              <Route path="placement-officer/:id" element={<SuperAdminPlacementOfficerDetail />} />

              {/* Access Control */}
              <Route path="user-management" element={<SuperAdminUserManagement />} />
              <Route path="create-projects" element={<SuperAdminCreateProjects />} />
              <Route path="project-assignment" element={<SuperAdminProjectAssignment />} />
              <Route path="trainer-assignment" element={<SuperAdminTrainerAssignment />} />
              <Route path="placement-assignment" element={<SuperAdminPlacementAssignment />} />

              {/* Project Details */}
              <Route path="project-details" element={<SuperAdminProjectDetails />} />
              <Route path="project-details-reports" element={<SuperAdminProjectDetails />} />
              <Route path="candidate-details" element={<SuperAdminCandidateDetails />} />
              <Route path="placement-drives" element={<SuperAdminPlacementDrivesPage />} />
              <Route path="openings-dashboard" element={<PlacementOpeningsDashboard />} />
              <Route path="job-openings" element={<PlacementOpeningsDashboard />} />
              <Route
                path="live-feed"
                element={
                  <AdminTrainerLiveFeed
                    title="Live Feed Viewer"
                    projectTitleSuffix="Live Feed Viewer"
                    emptySubtitle="Select a project to view all live monitoring streams across assigned centers."
                    selectedSubtitle="Real-time monitoring streams visible to Super Admin for the selected project."
                  />
                }
              />
              <Route path="mobilization" element={<SuperAdminMobilizationPage />} />
              <Route path="community-engagement-drives" element={<SuperAdminCommunityEngagementDrives />} />
              <Route path="training-tracking" element={<SuperAdminTrainingTracking />} />
              <Route path="exposure-visits" element={<SuperAdminExposureVisits />} />
              <Route path="student-insurance-details" element={<AdminStudentInsuranceDetails />} />
              <Route path="batch-certification" element={<AdminBatchCertification uploadedBy="Super Admin" />} />
              <Route path="fee-collection" element={<SuperAdminFeeMonitor />} />
              <Route path="module-content" element={<SuperAdminModuleContent />} />

              {/* Approvals */}
              <Route path="approvals" element={<SuperAdminApprovalsHub />} />
              <Route path="approvals/operations" element={<SuperAdminOperationsApprovals />} />
              <Route path="approvals/tour" element={<SuperAdminTourApprovals />} />
              <Route path="approvals/leave" element={<SuperAdminLeaveApprovals />} />
              <Route path="approvals/salary" element={<SuperAdminSalaryApprovals />} />
              <Route path="approvals/invoices" element={<SuperAdminInvoiceApprovals />} />
              <Route path="approvals/reimbursements" element={<SuperAdminReimbursementApprovals />} />

              <Route path="access-target" element={<SuperAdminEmployeeManagement />} />
              <Route path="employee-management" element={<SuperAdminEmployeeManagement />} />
              <Route path="leave-monitor" element={<SuperAdminLeaveMonitor />} />
              <Route path="grievance-tracker" element={<SuperAdminGrievancePortal />} />

              {/* Settings */}
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>
          </Routes>
        </div>
      </Suspense>
      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );
}

export default App;
