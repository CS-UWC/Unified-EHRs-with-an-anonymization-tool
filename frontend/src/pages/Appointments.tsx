import { useEffect, useState } from "react";
import {
  FaCalendarCheck,
  FaClock,
  FaMapMarkerAlt,
  FaUserMd,
} from "react-icons/fa";
import AppShell from "../components/AppShell";
import { apiRequest } from "../services/api";

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
  facility: string;
  type: string;
  status: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest<Appointment[]>(
          "/appointments/me"
        );

        setAppointments(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load appointments."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, []);

  const upcoming = appointments.find(
    (appointment) =>
      appointment.status.toLowerCase() === "upcoming"
  ) || appointments[0];

  const formatDate = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return {
        day: date,
        month: "",
        year: "",
      };
    }

    return {
      day: parsed.getDate().toString(),
      month: parsed
        .toLocaleString("en-US", { month: "short" })
        .toUpperCase(),
      year: parsed.getFullYear().toString(),
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

  const featuredDate = upcoming
    ? formatDate(upcoming.appointment_date)
    : null;

  return (
    <AppShell
      role="PATIENT"
      title="Appointments"
      subtitle="Manage your appointments across healthcare providers."
    >
      {loading && (
        <section className="content-card">
          <p>Loading appointments...</p>
        </section>
      )}

      {error && (
        <section className="content-card">
          <p>{error}</p>
        </section>
      )}

      {!loading && !error && upcoming && featuredDate && (
        <div className="appointment-feature">
          <div className="appointment-feature-icon">
            <FaCalendarCheck />
          </div>

          <div>
            <span className="section-label">
              NEXT APPOINTMENT
            </span>

            <h2>{upcoming.type}</h2>

            <p>
              <FaUserMd /> {upcoming.doctor_name}
              &nbsp; • &nbsp;
              <FaMapMarkerAlt /> {upcoming.facility}
            </p>
          </div>

          <div className="appointment-date">
            <strong>{featuredDate.day}</strong>
            <span>
              {featuredDate.month} {featuredDate.year}
            </span>
            <small>
              {formatTime(upcoming.appointment_time)}
            </small>
          </div>
        </div>
      )}

      {!loading && !error && !upcoming && (
        <div className="content-card">
          <p>No appointments found.</p>
        </div>
      )}

      <section className="content-card">
        <div className="card-heading">
          <div>
            <span className="section-label">
              SCHEDULE
            </span>

            <h3>Appointment history</h3>
          </div>
        </div>

        <div className="appointment-list">
          {!loading &&
            !error &&
            appointments.map((appointment) => {
              const date = formatDate(
                appointment.appointment_date
              );

              return (
                <div
                  className="appointment-row"
                  key={appointment.id}
                >
                  <div className="appointment-date-small">
                    <strong>{date.day}</strong>
                    <span>{date.month}</span>
                  </div>

                  <div className="appointment-row-info">
                    <strong>{appointment.type}</strong>

                    <span>
                      {appointment.doctor_name} •{" "}
                      {appointment.facility}
                    </span>

                    <small>
                      <FaClock />{" "}
                      {formatTime(
                        appointment.appointment_time
                      )}
                    </small>
                  </div>

                  <span
                    className={`status-pill ${appointment.status.toLowerCase()}`}
                  >
                    {appointment.status}
                  </span>
                </div>
              );
            })}

          {!loading && !error && appointments.length === 0 && (
            <div className="empty-state">
              <FaCalendarCheck />
              <strong>No appointments</strong>
              <span>
                Your appointments will appear here.
              </span>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
