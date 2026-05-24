import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

// Import application pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MedicalHistory from "./pages/MedicalHistory";
import Appointments from "./pages/Appointments";
import LabResults from "./pages/LabResults";
import Prescriptions from "./pages/Prescriptions";
import Privacy from "./pages/Privacy";

/**
 * Main Application Component
 *
 * Handles application routing/navigation.
 */
function App() {

  return (

    // Router wrapper
    <BrowserRouter>

      {/* Application Routes */}
      <Routes>

        {/* Login Page Route */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* Dashboard Route */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Medical History Route */}
        <Route
          path="/medical-history"
          element={<MedicalHistory />}
        />

        {/* Appointments Route */}
        <Route
          path="/appointments"
          element={<Appointments />}
        />

        {/* Lab Results Route */}
        <Route
          path="/lab-results"
          element={<LabResults />}
        />

        {/* Prescriptions Route */}
        <Route
          path="/prescriptions"
          element={<Prescriptions />}
        />

        {/* Privacy Route */}
        <Route
          path="/privacy"
          element={<Privacy />}
        />

      </Routes>

    </BrowserRouter>
  );
}

// Export App component
export default App;