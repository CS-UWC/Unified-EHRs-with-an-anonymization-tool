/**
 * Appointments Page
 *
 * This page allows patients to:
 * - View upcoming appointments
 * - Track appointment dates and times
 * - View assigned healthcare providers
 * - Monitor healthcare facility information
 *
 * This demonstrates centralized appointment
 * management within the Unified EHR system.
 */

const Appointments = () => {

  return (

    /* ===================================================== */
    /* MAIN PAGE CONTAINER                                   */
    /* ===================================================== */

    <div className="appointments-page">

      {/* ===================================================== */}
      {/* PAGE HEADER                                           */}
      {/* ===================================================== */}

      <div className="appointments-header">

        <h1>Appointments</h1>

        <p>
          View and manage your healthcare appointments
          across hospitals, clinics, and specialists.
        </p>

      </div>

      {/* ===================================================== */}
      {/* UPCOMING APPOINTMENTS SECTION                         */}
      {/* ===================================================== */}

      <section className="appointment-card">

        <h2>Upcoming Appointment</h2>

        <div className="appointment-grid">

          <div>
            <strong>Doctor:</strong>
            <p>Dr. Smith</p>
          </div>

          <div>
            <strong>Hospital:</strong>
            <p>Groote Schuur Hospital</p>
          </div>

          <div>
            <strong>Date:</strong>
            <p>14 May 2026</p>
          </div>

          <div>
            <strong>Time:</strong>
            <p>10:00 AM</p>
          </div>

        </div>

      </section>

      {/* ===================================================== */}
      {/* APPOINTMENT HISTORY SECTION                           */}
      {/* ===================================================== */}

      <section className="appointment-card">

        <h2>Appointment History</h2>

        <table>

          <thead>

          <tr>

            <th>Date</th>

            <th>Facility</th>

            <th>Doctor</th>

            <th>Status</th>

          </tr>

          </thead>

          <tbody>

          <tr>

            <td>01 April 2026</td>

            <td>Tygerberg Hospital</td>

            <td>Dr. Adams</td>

            <td>Completed</td>

          </tr>

          <tr>

            <td>18 March 2026</td>

            <td>Netcare Hospital</td>

            <td>Dr. Williams</td>

            <td>Completed</td>

          </tr>

          </tbody>

        </table>

      </section>

    </div>
  );
};

export default Appointments;