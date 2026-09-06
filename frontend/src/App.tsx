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
import PatientProfile from "./pages/PatientProfile";
import MedicalScans from "./pages/MedicalScans";
import AccessRequests from "./pages/AccessRequests";
import ExternalDashboard from "./pages/external/ExternalDashboard";
import ExternalPatientSearch from "./pages/external/ExternalPatientSearch";
import ExternalPatientRecords from "./pages/external/ExternalPatientRecords";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  type CurrentUser,
  type UserRole,
} from "./services/auth";

function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: UserRole;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAuthentication() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        localStorage.removeItem("access_token");

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={
          user.role === "EXTERNAL_SYSTEM"
            ? "/external"
            : "/dashboard"
        }
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

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
