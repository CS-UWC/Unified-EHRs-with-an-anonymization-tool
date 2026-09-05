import { FaCalendarCheck, FaClock, FaMapMarkerAlt, FaUserMd } from "react-icons/fa";
import AppShell from "../components/AppShell";
import { APPOINTMENTS } from "../demoData";

export default function Appointments() {
  return (
    <AppShell role="PATIENT" title="Appointments" subtitle="Manage your appointments across healthcare providers.">
      <div className="appointment-feature">
        <div className="appointment-feature-icon"><FaCalendarCheck /></div>
        <div><span className="section-label">NEXT APPOINTMENT</span><h2>Follow-up consultation</h2><p><FaUserMd /> Dr. Smith &nbsp; • &nbsp; <FaMapMarkerAlt /> Groote Schuur Hospital</p></div>
        <div className="appointment-date"><strong>14</strong><span>MAY 2026</span><small>10:00 AM</small></div>
      </div>

      <section className="content-card">
        <div className="card-heading"><div><span className="section-label">SCHEDULE</span><h3>Appointment history</h3></div></div>
        <div className="appointment-list">
          {APPOINTMENTS.map((appointment) => (
            <div className="appointment-row" key={`${appointment.date}-${appointment.doctor}`}>
              <div className="appointment-date-small"><strong>{appointment.date.split(" ")[0]}</strong><span>{appointment.date.split(" ")[1]}</span></div>
              <div className="appointment-row-info"><strong>{appointment.type}</strong><span>{appointment.doctor} • {appointment.facility}</span><small><FaClock /> {appointment.time}</small></div>
              <span className={`status-pill ${appointment.status.toLowerCase()}`}>{appointment.status}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
