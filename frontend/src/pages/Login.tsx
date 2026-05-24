// Import React hook for state management
import { useState } from "react";

// Import navigation hook
import { useNavigate } from "react-router-dom";

// Import system logo
import logo from "../assets/logo.png";

/**
 * Login Component
 *
 * This component provides:
 * - Login functionality UI
 * - Sign up functionality UI
 * - Responsive healthcare-themed authentication page
 */
const Login = () => {

  /**
   * State used to determine whether the user
   * is currently viewing:
   * - Login form
   * - Sign Up form
   */
  const [isLogin, setIsLogin] = useState(true);
  /**
 * React Router navigation hook
 *
 * Used to move users between pages.
 */
const navigate = useNavigate();

  return (

    // Main authentication page container
    <div className="auth-container">

      {/* Authentication card */}
      <div className="auth-card">

        {/* ===================================================== */}
        {/* SYSTEM LOGO SECTION */}
        {/* ===================================================== */}

        <div className="logo-section">

          {/* System logo */}
          <img
            src={logo}
            alt="SA EHRS Logo"
            className="logo"
          />

          {/* System subtitle */}
          <p className="system-tagline">
            Connected Healthcare Across South Africa
          </p>

        </div>

        {/* ===================================================== */}
        {/* AUTHENTICATION TABS */}
        {/* ===================================================== */}

        <div className="tabs">

          {/* Login Tab Button */}
          <button
            className={isLogin ? "active-tab" : ""}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>

          {/* Sign Up Tab Button */}
          <button
            className={!isLogin ? "active-tab" : ""}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>

        </div>

        {/* ===================================================== */}
        {/* FORM SECTION */}
        {/* ===================================================== */}

        <div className="form-section">

          {/* Show First Name, Last Name, ID/passport number, date of birth, Citezenship, mobile number input ONLY during sign up */}
          {!isLogin && (
            <>

              {/* First Name Input */}
              <input
                type="text"
                placeholder="First Name"
              />

              {/* Last Name Input */}
              <input
                type="text"
                placeholder="Last Name"
              />

              {/* South African ID or Passport Number */}
              <input
                type="text"
                placeholder="ID / Passport Number"
              />

              {/* Date of Birth */}
              <input
                type="date"
                placeholder="Date of Birth"
              />

              {/* Citizenship */}
              <input
                type="text"
                placeholder="Citizenship"
              />

              {/* Mobile Number */}
              <input
                type="tel"
                placeholder="Mobile Number"
              />

  </>
      
          )}

          {/* Email input */}
          <input
            type="text"
            placeholder="ID / Passport Number"
          />

          {/* Password input */}
          <input
            type="password"
            placeholder="Password"
          />

          {/* Submit button */}
          <button
            className="submit-button"

            /*
              When clicked:
              - Login users navigate to dashboard
              - Sign up users also navigate to dashboard
            */

            onClick={() => navigate("/dashboard")}
          >

            {/* Dynamically change button text */}
            {isLogin ? "Login" : "Create Account"}

          </button>

        </div>

      </div>

    </div>
  );
};

// Export component
export default Login;