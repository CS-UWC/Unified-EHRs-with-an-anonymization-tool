/**
 * Prescriptions Page
 *
 * This page allows patients to:
 * - View active prescriptions
 * - Monitor medication dosage
 * - Track prescribing healthcare providers
 *
 * This demonstrates centralized pharmaceutical
 * records within the Unified EHR system.
 */

const Prescriptions = () => {

  return (

    <div className="prescriptions-page">

      {/* ===================================================== */}
      {/* PAGE HEADER                                           */}
      {/* ===================================================== */}

      <div className="prescriptions-header">

        <h1>Prescriptions</h1>

        <p>
          View medications prescribed by healthcare
          professionals across South Africa.
        </p>

      </div>

      {/* ===================================================== */}
      {/* PRESCRIPTIONS TABLE                                   */}
      {/* ===================================================== */}

      <section className="medical-card">

        <h2>Current Medications</h2>

        <table>

          <thead>

          <tr>

            <th>Medication</th>

            <th>Dosage</th>

            <th>Doctor</th>

            <th>Duration</th>

          </tr>

          </thead>

          <tbody>

          <tr>

            <td>Amlodipine</td>

            <td>5mg Daily</td>

            <td>Dr. Smith</td>

            <td>30 Days</td>

          </tr>

          <tr>

            <td>Ventolin Inhaler</td>

            <td>As Needed</td>

            <td>Dr. Adams</td>

            <td>Continuous</td>

          </tr>

          </tbody>

        </table>

      </section>

    </div>
  );
};

export default Prescriptions;