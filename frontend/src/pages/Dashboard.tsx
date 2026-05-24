/**
 * Dashboard Page
 *
 * This page represents the patient dashboard
 * for the Unified Electronic Health Record System.
 *
 * Features:
 * - Sidebar navigation
 * - Health summary cards
 * - Medical records table
 * - Privacy and access management
 */

const Dashboard = () => {

  return (

    /* ===================================================== */
    /* MAIN DASHBOARD LAYOUT                                 */
    /* ===================================================== */

    <div className="dashboard">

      {/* ===================================================== */}
      {/* SIDEBAR NAVIGATION                                   */}
      {/* ===================================================== */}

      <aside className="sidebar">

        {/* Sidebar Heading */}
        <div className="sidebar-header">

          <h2>SA EHRS</h2>

          <p>Unified Healthcare</p>

        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">

          <a href="#">Dashboard</a>

          <a href="/medical-history">
            Medical History
          </a>

          <a href="#">Appointments</a>

          <a href="#">Prescriptions</a>

          <a href="#">Test Results</a>

          <a href="#">Privacy & Access</a>

          <a href="#">Logout</a>

        </nav>

      </aside>

      {/* ===================================================== */}
      {/* MAIN CONTENT AREA                                    */}
      {/* ===================================================== */}

      <main className="main-content">

        {/* ===================================================== */}
        {/* TOP BAR                                              */}
        {/* ===================================================== */}

        <div className="topbar">

          {/* Welcome Message */}
          <div>

            <h1>Welcome Back, Eyethu</h1>

            <p>
              Here is your healthcare overview
            </p>

          </div>

          {/* Patient Profile Circle */}
          <div className="profile-circle">

            E

          </div>

        </div>

        {/* ===================================================== */}
        {/* HEALTH SUMMARY CARDS                                 */}
        {/* ===================================================== */}

        <section className="summary-cards">

          {/* Upcoming Appointment Card */}
          <div className="summary-card">

            <h3>Upcoming Appointment</h3>

            <p>12 May 2026</p>

          </div>

          {/* Current Medication Card */}
          <div className="summary-card">

            <h3>Current Medication</h3>

            <p>2 Active Prescriptions</p>

          </div>

          {/* Last Hospital Visit */}
          <div className="summary-card">

            <h3>Last Visit</h3>

            <p>Groote Schuur Hospital</p>

          </div>

          {/* Medical Alerts */}
          <div className="summary-card">

            <h3>Medical Alerts</h3>

            <p>No Active Alerts</p>

          </div>

        </section>

        {/* ===================================================== */}
        {/* RECENT MEDICAL RECORDS                               */}
        {/* ===================================================== */}

        <section className="records-section">

          {/* Section Heading */}
          <h2>Recent Medical Records</h2>

          {/* Medical Records Table */}
          <table>

            {/* Table Header */}
            <thead>

            <tr>

              <th>Date</th>

              <th>Doctor</th>

              <th>Diagnosis</th>

              <th>Hospital</th>

            </tr>

            </thead>

            {/* Table Body */}
            <tbody>

            <tr>

              <td>01 May 2026</td>

              <td>Dr. Smith</td>

              <td>Hypertension</td>

              <td>Tygerberg Hospital</td>

            </tr>

            <tr>

              <td>15 April 2026</td>

              <td>Dr. Adams</td>

              <td>Routine Checkup</td>

              <td>Netcare</td>

            </tr>

            </tbody>

          </table>

        </section>

        {/* ===================================================== */}
        {/* PRIVACY AND ACCESS SECTION                           */}
        {/* ===================================================== */}

        <section className="privacy-section">

          {/* Section Heading */}
          <h2>Privacy & Access</h2>

          {/* Privacy Information Card */}
          <div className="privacy-card">

            <p>
              ✔ Tygerberg Hospital has authorized access
            </p>

            <p>
              ✔ Dr. Smith has authorized access
            </p>

            <p>
              ✔ Research access is anonymized
            </p>

          </div>

        </section>

      </main>

    </div>
  );
};

// Export dashboard component
export default Dashboard;