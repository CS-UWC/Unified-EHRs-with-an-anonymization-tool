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
import { APPOINTMENTS, LAB_RESULTS, PRESCRIPTIONS } from "../demoData";

export default function Dashboard() {
  return (
    <AppShell
      role="PATIENT"
      title="Good afternoon, Eyethu"
      subtitle="Here is your unified healthcare overview."
    >
      <div className="demo-banner">
        <FaShieldAlt />
        <div>
          <strong>Patient-controlled access</strong>
          <span>You decide which external healthcare systems can read or write your health information.</span>
        </div>
        <Link to="/privacy">Manage access <FaArrowRight /></Link>
      </div>

      <section className="hero-card">
        <div>
          <span className="section-label">HEALTH AT A GLANCE</span>
          <h2>Your healthcare, connected.</h2>
          <p>
            Your records from different healthcare providers are brought
            together in one secure patient portal.
          </p>
          <Link className="outline-button" to="/medical-history">
            View medical history <FaArrowRight />
          </Link>
        </div>

        <div className="hero-stat">
          <span>Next appointment</span>
          <strong>14</strong>
          <small>May 2026 • 10:00 AM</small>
        </div>
      </section>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon"><FaFileMedical /></div>
          <div><span>Medical records</span><strong>12</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaCalendarCheck /></div>
          <div><span>Appointments</span><strong>{APPOINTMENTS.length}</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaFileMedical /></div>
          <div><span>Active prescriptions</span><strong>{PRESCRIPTIONS.length}</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaUserMd /></div>
          <div><span>Connected providers</span><strong>4</strong></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="content-card">
          <div className="card-heading">
            <div>
              <span className="section-label">UPCOMING</span>
              <h3>Next appointment</h3>
            </div>
            <Link to="/appointments">View all <FaChevronRight /></Link>
          </div>

          <div className="appointment-highlight">
            <div className="date-block">
              <strong>14</strong>
              <span>MAY</span>
            </div>
            <div className="appointment-info">
              <strong>Follow-up consultation</strong>
              <span>Dr. Smith • Groote Schuur Hospital</span>
              <span>10:00 AM</span>
            </div>
            <span className="status-pill upcoming">Upcoming</span>
          </div>
        </section>

        <section className="content-card">
          <div className="card-heading">
            <div>
              <span className="section-label">RECENT</span>
              <h3>Laboratory results</h3>
            </div>
            <Link to="/lab-results">View all <FaChevronRight /></Link>
          </div>

          <div className="compact-list">
            {LAB_RESULTS.slice(0, 3).map((result) => (
              <div className="list-row" key={`${result.test}-${result.date}`}>
                <div>
                  <strong>{result.test}</strong>
                  <span>{result.facility}</span>
                </div>
                <div className="list-value">
                  <strong>{result.result}</strong>
                  <span>{result.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <span className="section-label">ACCESS CONTROL</span>
            <h3>Privacy & external access</h3>
          </div>
          <Link to="/privacy">Manage permissions <FaArrowRight /></Link>
        </div>

        <div className="access-summary">
          <div className="access-summary-icon"><FaShieldAlt /></div>
          <div>
            <strong>2 healthcare systems connected</strong>
            <span>1 active permission • 1 request awaiting your decision</span>
          </div>
          <Link className="primary-button small-button" to="/privacy">Review requests</Link>
        </div>
      </section>
    </AppShell>
  );
}
