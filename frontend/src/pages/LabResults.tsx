/**
 * Laboratory Results Page
 *
 * This page allows patients to:
 * - View laboratory test results
 * - Monitor diagnostic reports
 * - Access healthcare investigations
 *
 * This demonstrates centralized healthcare
 * diagnostics within the Unified EHR system.
 */

const LabResults = () => {

  return (

    <div className="lab-results-page">

      {/* ===================================================== */}
      {/* PAGE HEADER                                           */}
      {/* ===================================================== */}

      <div className="lab-header">

        <h1>Laboratory Results</h1>

        <p>
          Access laboratory investigations and
          diagnostic reports from healthcare providers.
        </p>

      </div>

      {/* ===================================================== */}
      {/* LAB RESULTS TABLE                                     */}
      {/* ===================================================== */}

      <section className="medical-card">

        <h2>Recent Test Results</h2>

        <table>

          <thead>

          <tr>

            <th>Test</th>

            <th>Date</th>

            <th>Facility</th>

            <th>Status</th>

          </tr>

          </thead>

          <tbody>

          <tr>

            <td>Blood Pressure Test</td>

            <td>01 May 2026</td>

            <td>Groote Schuur Hospital</td>

            <td>Completed</td>

          </tr>

          <tr>

            <td>Cholesterol Screening</td>

            <td>22 April 2026</td>

            <td>Netcare Hospital</td>

            <td>Completed</td>

          </tr>

          <tr>

            <td>Chest X-Ray</td>

            <td>10 April 2026</td>

            <td>Tygerberg Hospital</td>

            <td>Completed</td>

          </tr>

          </tbody>

        </table>

      </section>

    </div>
  );
};

export default LabResults;