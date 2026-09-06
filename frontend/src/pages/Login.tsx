import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaLock,
  FaShieldAlt,
  FaUserMd,
  FaUser,
} from "react-icons/fa";
import logo from "../assets/logo.png";
import { login, getCurrentUser } from "../services/auth";

type LoginRole = "PATIENT" | "EXTERNAL_SYSTEM";

export default function Login() {
  const [role, setRole] = useState<LoginRole>("PATIENT");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login({
        email: identifier,
        password,
      });

      const user = await getCurrentUser();

      localStorage.setItem("ehr_demo_role", user.role);

      if (user.role === "PATIENT") {
        navigate("/dashboard");
      } else if (user.role === "EXTERNAL_SYSTEM") {
        navigate("/external");
      } else {
        setError("This account does not have access to this prototype.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
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
          <span>By Eyethu Njemla • 2026</span>
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
              Email Address
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder={role === "PATIENT" ? "Enter your email address" : "Enter your system email"}
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

          

            <button
              className="primary-button login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <FaArrowRight />}
            </button>

          </form>

        
        </div>
      </div>
    </div>
  );
}
