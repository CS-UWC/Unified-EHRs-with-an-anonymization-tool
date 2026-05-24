/**
 * Privacy and Access Control Page
 *
 * This page allows patients to:
 * - Manage healthcare provider permissions
 * - Approve healthcare access requests
 * - Revoke access permissions
 * - Monitor healthcare data privacy
 *
 * This demonstrates patient-centered
 * privacy management within the Unified EHR system.
 */

const Privacy = () => {

  return (

    <div className="privacy-page">

      {/* ===================================================== */}
      {/* PAGE HEADER                                           */}
      {/* ===================================================== */}

      <div className="privacy-header">

        <h1>Privacy & Access Control</h1>

        <p>
          Manage healthcare provider access to your
          electronic health records securely.
        </p>

      </div>

      {/* ===================================================== */}
      {/* ACTIVE ACCESS SECTION                                 */}
      {/* ===================================================== */}

      <section className="medical-card">

        <h2>Authorized Healthcare Providers</h2>

        <table>

          <thead>

          <tr>

            <th>Healthcare Provider</th>

            <th>Access Status</th>

            <th>Permission</th>

          </tr>

          </thead>

          <tbody>

          <tr>

            <td>Groote Schuur Hospital</td>

            <td>Granted</td>

            <td>

              <button className="action-button">
                Revoke Access
              </button>

            </td>

          </tr>

          <tr>

            <td>Tygerberg Hospital</td>

            <td>Pending</td>

            <td>

              <button className="action-button">
                Approve Access
              </button>

            </td>

          </tr>

          </tbody>

        </table>

      </section>

    </div>
  );
};

export default Privacy;