
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardList,
  FaFileMedical,
  FaFlask,
  FaHeartbeat,
  FaHome,
  FaIdCard,
  FaLock,
  FaPrescriptionBottleAlt,
  FaSignOutAlt,
  FaUserMd,
  FaImages,
  FaShieldAlt,
} from "react-icons/fa";

import { getCurrentUser } from "../services/auth";
import type { CurrentUser } from "../services/auth";

interface AppShellProps {
  children: React.ReactNode;
  role: "PATIENT" | "EXTERNAL_SYSTEM";
  title: string;
  subtitle?: string;
}

const patientLinks = [
  { to: "/dashboard", label: "Dashboard", icon: <FaHome /> },
  { to: "/profile", label: "My Profile", icon: <FaIdCard /> },
  { to: "/medical-history", label: "Medical History", icon: <FaFileMedical /> },
  { to: "/appointments", label: "Appointments", icon: <FaCalendarAlt /> },
  { to: "/lab-results", label: "Lab Results", icon: <FaFlask /> },
  { to: "/prescriptions", label: "Prescriptions", icon: <FaPrescriptionBottleAlt /> },
  { to: "/scans", label: "Medical Scans", icon: <FaImages /> },
  { to: "/privacy", label: "Privacy & Access", icon: <FaShieldAlt /> },
];

const externalLinks = [
  { to: "/external", label: "Dashboard", icon: <FaHome /> },
  { to: "/external/search", label: "Patient Access", icon: <FaUserMd /> },
  { to: "/external/records", label: "Authorised Records", icon: <FaClipboardList /> },
];

function getInitials(user: CurrentUser | null): string {
  if (!user) return "?";

  const first = user.first_name?.trim().charAt(0) ?? "";
  const last = user.last_name?.trim().charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "?";
}

export default function AppShell({
  children,
  role,
  title,
  subtitle,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const isExternal = role === "EXTERNAL_SYSTEM";
  const links = isExternal ? externalLinks : patientLinks;

  useEffect(() => {
    let active = true;

    async function loadCurrentUser() {
      try {
        const user = await getCurrentUser();

        if (active) {
          setCurrentUser(user);
        }
      } catch {
        if (active) {
          setCurrentUser(null);
        }
      } finally {
        if (active) {
          setUserLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("ehr_demo_logged_in");
    localStorage.removeItem("ehr_demo_role");
    navigate("/");
  };

  const fullName = currentUser
    ? `${currentUser.first_name} ${currentUser.last_name}`.trim()
    : "";

  const displayName = userLoading
    ? "Loading profile..."
    : fullName || "Account";

  const displayRole = currentUser
    ? currentUser.role.replaceAll("_", " ")
    : isExternal
      ? "External System"
      : "Patient";

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/sa-ehrs-logo.png" alt="SA EHRS" />
          <div className="brand-copy">
            <strong>SA EHRS</strong>
            <span>
              {isExternal
                ? "Healthcare Integration"
                : "Connected Healthcare"}
            </span>
          </div>
        </div>

        <div className="role-pill">
          {isExternal ? <FaUserMd /> : <FaHeartbeat />}
          <span>
            {isExternal
              ? "External Healthcare System"
              : "Patient Portal"}
          </span>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => {
            const active =
              location.pathname === link.to ||
              (link.to !== "/dashboard" &&
                link.to !== "/external" &&
                location.pathname.startsWith(link.to));

            return (
              <Link
                key={link.to}
                to={link.to}
                className={active ? "nav-link active" : "nav-link"}
                title={collapsed ? link.label : undefined}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="security-note">
            <FaLock />
            <div>
              <strong>Secure session</strong>
              <span>Protected healthcare data</span>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            <FaSignOutAlt />
            <span>Sign out</span>
          </button>
        </div>

        <button
          className="collapse-button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <div>
            <div className="eyebrow">
              {isExternal
                ? "INTEROPERABILITY PORTAL"
                : "PATIENT PORTAL"}
            </div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>

          <div className="topbar-user">
            <div className="user-avatar">
              {isExternal && !currentUser
                ? <FaUserMd />
                : getInitials(currentUser)}
            </div>

            <div className="topbar-user-copy">
              <strong>{displayName}</strong>
              <span>{displayRole}</span>
            </div>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
