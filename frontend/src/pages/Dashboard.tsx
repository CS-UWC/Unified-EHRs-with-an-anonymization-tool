import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCalendarCheck,
  FaChevronRight,
  FaFileMedical,
  FaShieldAlt,
  FaUserMd,
} from "react-icons/fa";
import AppShell from "../components/AppShell";
import { apiRequest } from "../services/api";
import { getCurrentUser } from "../services/auth";

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
  facility: string;
  type: string;
  status: string;
}

interface LabResult {
  id: number;
  test_name?: string;
  test?: string;
  date?: string;
  result?: string;
  status?: string;
  facility?: string;
}

interface Prescription {
  id: number;
  medication: string;
  status?: string;
}

interface AccessRequest {
  id: number;
  status: string;
}

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [accessRequests, setAccessRequests] = useState<
    AccessRequest[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          user,
          appointmentData,
          labData,
          prescriptionData,
          accessData,
        ] = await Promise.all([
          getCurrentUser(),
          apiRequest<Appointment[]>("/appointments/me"),
          apiRequest<LabResult[]>("/lab-results/me"),
          apiRequest<Prescription[]>(
            "/prescriptions/me"
          ),
          apiRequest<AccessRequest[]>(
            "/access-requests/"
          ),
        ]);

        setUserName(user.first_name);

        setAppointments(appointmentData);
        setLabResults(labData);
        setPrescriptions(prescriptionData);
        setAccessRequests(accessData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const nextAppointment =
    appointments.find(
      (appointment) =>
        appointment.status.toLowerCase() === "upcoming"
    ) || appointments[0];

  const activePermissions = accessRequests.filter(
    (request) => request.status === "APPROVED"
  );

  const pendingRequests = accessRequests.filter(
    (request) => request.status === "PENDING"
  );

  const formatDate = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return {
        day: "—",
        month: "",
        full: date,
      };
    }

    return {
      day: parsed.getDate().toString(),
      month: parsed
        .toLocaleString("en-US", {
          month: "short",
        })
        .toUpperCase(),
      full: parsed.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  };

  const formatTime = (time: string) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":");

    if (!hours || !minutes) {
      return time;
    }

    const hour = Number(hours);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
  };

  if (loading) {
    return (
      <AppShell
        role="PATIENT"
        title="Dashboard"
        subtitle="Loading your unified healthcare overview."
      >
        <section className="content-card">
          <p>Loading your healthcare information...</p>
        </section>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell
        role="PATIENT"
        title="Dashboard"
        subtitle="Here is your unified healthcare overview."
      >
        <section className="content-card">
          <p>{error}</p>
        </section>
      </AppShell>
    );
  }

  const appointmentDate = nextAppointment
    ? formatDate(nextAppointment.appointment_date)
    : null;

  return (
    <AppShell
      role="PATIENT"
      title={`Good afternoon, ${userName}`}
      subtitle="Here is your unified healthcare overview."
    >
      <div className="demo-banner">
        <FaShieldAlt />

        <div>
          <strong>Patient-controlled access</strong>

          <span>
            You decide which external healthcare systems can
            read or write your health information.
          </span>
        </div>

        <Link to="/privacy">
          Manage access <FaArrowRight />
        </Link>
      </div>

      <section className="hero-card">
        <div>
          <span className="section-label">
            HEALTH AT A GLANCE
          </span>

          <h2>Your healthcare, connected.</h2>

          <p>
            Your records from different healthcare providers
            are brought together in one secure patient portal.
          </p>

          <Link
            className="outline-button"
            to="/medical-history"
          >
            View medical history <FaArrowRight />
          </Link>
        </div>

        <div className="hero-stat">
          <span>Next appointment</span>

          {appointmentDate ? (
            <>
              <strong>{appointmentDate.day}</strong>

              <small>
                {appointmentDate.full} •{" "}
                {formatTime(
                  nextAppointment!.appointment_time
                )}
              </small>
            </>
          ) : (
            <small>No upcoming appointments</small>
          )}
        </div>
      </section>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaFileMedical />
          </div>

          <div>
            <span>Medical records</span>
            <strong>—</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarCheck />
          </div>

          <div>
            <span>Appointments</span>
            <strong>{appointments.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaFileMedical />
          </div>

          <div>
            <span>Active prescriptions</span>

            <strong>
              {
                prescriptions.filter(
                  (item) =>
                    !item.status ||
                    item.status.toLowerCase() ===
                      "active"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaUserMd />
          </div>

          <div>
            <span>Connected providers</span>
            <strong>{activePermissions.length}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="content-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                UPCOMING
              </span>

              <h3>Next appointment</h3>
            </div>

            <Link to="/appointments">
              View all <FaChevronRight />
            </Link>
          </div>

          {nextAppointment && appointmentDate ? (
            <div className="appointment-highlight">
              <div className="date-block">
                <strong>{appointmentDate.day}</strong>
                <span>{appointmentDate.month}</span>
              </div>

              <div className="appointment-info">
                <strong>
                  {nextAppointment.type}
                </strong>

                <span>
                  {nextAppointment.doctor_name} •{" "}
                  {nextAppointment.facility}
                </span>

                <span>
                  {formatTime(
                    nextAppointment.appointment_time
                  )}
                </span>
              </div>

              <span className="status-pill upcoming">
                {nextAppointment.status}
              </span>
            </div>
          ) : (
            <div className="empty-state">
              <FaCalendarCheck />
              <strong>No upcoming appointments</strong>
              <span>
                Your appointments will appear here.
              </span>
            </div>
          )}
        </section>

        <section className="content-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                RECENT
              </span>

              <h3>Laboratory results</h3>
            </div>

            <Link to="/lab-results">
              View all <FaChevronRight />
            </Link>
          </div>

          <div className="compact-list">
            {labResults.slice(0, 3).map((result) => (
              <div
                className="list-row"
                key={result.id}
              >
                <div>
                  <strong>
                    {result.test_name ||
                      result.test ||
                      "Laboratory test"}
                  </strong>

                  <span>
                    {result.facility || "Healthcare provider"}
                  </span>
                </div>

                <div className="list-value">
                  <strong>
                    {result.result || "—"}
                  </strong>

                  <span>
                    {result.date || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {labResults.length === 0 && (
            <div className="empty-state">
              <strong>No laboratory results</strong>
              <span>
                Your recent results will appear here.
              </span>
            </div>
          )}
        </section>
      </div>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <span className="section-label">
              ACCESS CONTROL
            </span>

            <h3>Privacy & external access</h3>
          </div>

          <Link to="/privacy">
            Manage permissions <FaArrowRight />
          </Link>
        </div>

        <div className="access-summary">
          <div className="access-summary-icon">
            <FaShieldAlt />
          </div>

          <div>
            <strong>
              {activePermissions.length} healthcare{" "}
              {activePermissions.length === 1
                ? "system"
                : "systems"}{" "}
              connected
            </strong>

            <span>
              {activePermissions.length} active permission
              {activePermissions.length === 1
                ? ""
                : "s"} • {pendingRequests.length} request
              {pendingRequests.length === 1 ? "" : "s"}{" "}
              awaiting your decision
            </span>
          </div>

          <Link
            className="primary-button small-button"
            to="/privacy"
          >
            Review requests
          </Link>
        </div>
      </section>
    </AppShell>
  );
}