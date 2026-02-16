import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "react-day-picker/dist/style.css";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";

// Layout
import MobilizerLayout from "./components/Layout/MobilizerLayout";
import StudentEnrollment from "./pages/Mobilizer/StudentRnrollment";
import MobilizerAttendance from "./pages/Mobilizer/MobilizerAttendance";
import MobilizerProfile from "./pages/Mobilizer/MobilizerProfile";
import MobilizerDashboard from "./pages/Mobilizer/MobilizerDashboard";
import CommunityHistory from "./pages/mobilizer/CommunityHistory";
import CandidateEnrollmentStepper from "./components/Mobilizer/CandidateEnrollmentStepper";
import CommunityDriveStepper from "./components/Mobilizer/CommunityDriveStepper";
import TrainerLayout from "./components/Layout/TrainerLayout";
import TrainerDashboard from "./pages/Trainer/TrainerDashboard";
import TrainerAttendance from "./pages/Trainer/TrainerAttendance";
import TrainerExposureVisits from "./pages/Trainer/TrainerExposureVisits";
import TrainerInternalAssessments from "./pages/Trainer/TrainerInternalAssessments";
import TrainerStudyModules from "./pages/Trainer/TrainerStudyModules";
import TrainerProfile from "./pages/Trainer/TrainerProfile";
import TrainerLab from "./pages/Trainer/TrainerLab";


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />

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
        </Route>

        {/* Trainer Layout Routes */}
        <Route path="/trainer" element={<TrainerLayout />}>
          <Route index element={<TrainerDashboard />} />


          <Route path="dashboard" element={<TrainerDashboard />} />
          <Route path="attendance" element={<TrainerAttendance />} />
          <Route path="exposure-visits" element={<TrainerExposureVisits />} />
          <Route path="internal-assessment" element={<TrainerInternalAssessments />} />
          <Route path="study-modules" element={<TrainerStudyModules />} />
          <Route path="profile" element={<TrainerProfile />} />
          <Route path="labs" element={<TrainerLab />} />
          </Route>
      </Routes>
    </Router>
  );
}

export default App;
