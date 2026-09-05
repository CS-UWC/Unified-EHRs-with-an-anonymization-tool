import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MedicalHistory from "./pages/MedicalHistory";
import Appointments from "./pages/Appointments";
import LabResults from "./pages/LabResults";
import Prescriptions from "./pages/Prescriptions";
import PDFViewer from "./pages/PDFViewer";
import PatientProfile from "./pages/PatientProfile";
import MedicalScans from "./pages/MedicalScans";
import AccessRequests from "./pages/AccessRequests";
import ExternalDashboard from "./pages/external/ExternalDashboard";
import ExternalPatientSearch from "./pages/external/ExternalPatientSearch";
import ExternalPatientRecords from "./pages/external/ExternalPatientRecords";

function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "PATIENT" | "EXTERNAL_SYSTEM";
}) {
  const loggedIn = localStorage.getItem("ehr_demo_logged_in") === "true";
  const currentRole = localStorage.getItem("ehr_demo_role");

  if (!loggedIn) return <Navigate to="/" replace />;

  if (role && currentRole !== role) {
    return (
      <Navigate
        to={currentRole === "EXTERNAL_SYSTEM" ? "/external" : "/dashboard"}
        replace
      />
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="PATIENT">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute role="PATIENT">
              <PatientProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medical-history"
          element={
            <ProtectedRoute role="PATIENT">
              <MedicalHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <ProtectedRoute role="PATIENT">
              <Appointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lab-results"
          element={
            <ProtectedRoute role="PATIENT">
              <LabResults />
            </ProtectedRoute>
          }
        />

        <Route
          path="/prescriptions"
          element={
            <ProtectedRoute role="PATIENT">
              <Prescriptions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scans"
          element={
            <ProtectedRoute role="PATIENT">
              <MedicalScans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/privacy"
          element={
            <ProtectedRoute role="PATIENT">
              <AccessRequests />
            </ProtectedRoute>
          }
        />

        <Route path="/pdf-viewer" element={<PDFViewer />} />

        <Route
          path="/external"
          element={
            <ProtectedRoute role="EXTERNAL_SYSTEM">
              <ExternalDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/external/search"
          element={
            <ProtectedRoute role="EXTERNAL_SYSTEM">
              <ExternalPatientSearch />
            </ProtectedRoute>
          }
        />

        <Route
          path="/external/records"
          element={
            <ProtectedRoute role="EXTERNAL_SYSTEM">
              <ExternalPatientRecords />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
