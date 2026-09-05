import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaLock, FaShieldAlt, FaUserMd, FaUser } from "react-icons/fa";
import logo from "../assets/logo.png";

type LoginRole = "PATIENT" | "EXTERNAL_SYSTEM";

export default function Login() {
  const [role, setRole] = useState<LoginRole>("PATIENT");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();

    localStorage.setItem("ehr_demo_logged_in", "true");
    localStorage.setItem("ehr_demo_role", role);

    navigate(role === "PATIENT" ? "/dashboard" : "/external");
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="visual-content">
          <img src={logo} alt="SA EHRS" className="login-logo" />
          <span className="visual-badge">UNIFIED ELECTRONIC HEALTH RECORD</span>
          <h1>Connected healthcare across South Africa.</h1>
          <p>
            One secure platform for patients and authorised healthcare systems
            to access, share and manage health information.
          </p>

          <div className="login-features">
            <div><FaShieldAlt /><span>Patient-controlled access</span></div>
            <div><FaLock /><span>Secure role-based permissions</span></div>
            <div><FaUserMd /><span>FHIR-ready interoperability</span></div>
          </div>
        </div>

        <div className="visual-footer">
          <span>SA EHRS</span>
          <span>Prototype Demonstration • 2026</span>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-card">
          <div className="mobile-logo">
            <img src={logo} alt="SA EHRS" />
          </div>

          <div className="login-heading">
            <span className="section-label">WELCOME</span>
            <h2>Sign in to SA EHRS</h2>
            <p>Select the portal you want to demonstrate.</p>
          </div>

          <div className="role-selector">
            <button
              type="button"
              className={role === "PATIENT" ? "role-option active" : "role-option"}
              onClick={() => setRole("PATIENT")}
            >
              <FaUser />
              <span>
                <strong>Patient</strong>
                <small>Manage my health record</small>
              </span>
            </button>

            <button
              type="button"
              className={role === "EXTERNAL_SYSTEM" ? "role-option active" : "role-option"}
              onClick={() => setRole("EXTERNAL_SYSTEM")}
            >
              <FaUserMd />
              <span>
                <strong>External System</strong>
                <small>Request authorised access</small>
              </span>
            </button>
          </div>

          <form onSubmit={submit} className="login-form">
            <label>
              {role === "PATIENT" ? "ID / Passport Number" : "System Identifier"}
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder={role === "PATIENT" ? "Enter your ID or passport number" : "e.g. Cape Health Connect"}
                required
              />
            </label>

            <label>
              Password
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Enter your password"
                required
              />
            </label>

            <div className="demo-note">
              <FaLock />
              <span>Prototype mode — authentication is simulated for demonstration.</span>
            </div>

            <button className="primary-button login-submit" type="submit">
              Sign in
              <FaArrowRight />
            </button>
          </form>

          <div className="login-footer">
            <span>Protected by SA EHRS security controls</span>
            <span>POPIA-aware prototype</span>
          </div>
        </div>
      </div>
    </div>
  );
}
