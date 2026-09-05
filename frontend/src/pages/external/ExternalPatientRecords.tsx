import { Link } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaFileMedical, FaLock, FaUserMd, FaPen } from "react-icons/fa";
import AppShell from "../../components/AppShell";
import { getAccessRequests } from "../../demoData";

export default function ExternalPatientRecords() {
  const authorised = getAccessRequests().filter((r) => r.status === "APPROVED");

  return (
    <AppShell role="EXTERNAL_SYSTEM" title="Authorised Records" subtitle="Patient information available under active permissions.">
      <Link className="back-link" to="/external"><FaArrowLeft /> Back to integration dashboard</Link>

      {authorised.length === 0 ? (
        <div className="locked-state content-card"><FaLock /><h2>No authorised records</h2><p>The system cannot access patient information until a patient grants permission.</p><Link className="primary-button" to="/external/search">Request access</Link></div>
      ) : (
        <>
          <div className="demo-banner"><FaCheckCircle /><div><strong>Authorised access</strong><span>The following record is visible because the patient has granted permission.</span></div></div>

          {authorised.map((permission) => (
            <section className="content-card authorised-record" key={permission.id}>
              <div className="record-header">
                <div className="request-icon"><FaUserMd /></div>
                <div><span className="section-label">PATIENT RECORD</span><h2>Patient {permission.patientNationalId}</h2><span>Permission {permission.id} • Approved {permission.respondedAt}</span></div>
                <div className="permission-tags"><span className="permission-tag allowed"><FaCheckCircle /> Read</span>{permission.canWrite && <span className="permission-tag allowed"><FaPen /> Write</span>}</div>
              </div>

              <div className="authorised-data">
                <div className="data-section"><div className="data-section-heading"><FaFileMedical /><h3>Clinical summary</h3></div><div className="details-grid"><div className="detail-item"><span>Conditions</span><strong>Hypertension, Asthma</strong></div><div className="detail-item"><span>Blood group</span><strong>O+</strong></div><div className="detail-item"><span>Allergies</span><strong>Penicillin, Dust</strong></div><div className="detail-item"><span>Current medication</span><strong>Amlodipine, Ventolin</strong></div></div></div>
                <div className="data-section"><div className="data-section-heading"><FaFileMedical /><h3>Recent clinical activity</h3></div><div className="table-wrap"><table className="modern-table"><thead><tr><th>Date</th><th>Type</th><th>Provider</th><th>Summary</th></tr></thead><tbody><tr><td>01 May 2026</td><td>Consultation</td><td>Netcare Hospital</td><td>Routine checkup</td></tr><tr><td>10 Apr 2026</td><td>Lab result</td><td>Tygerberg Hospital</td><td>Blood glucose recorded</td></tr></tbody></table></div></div>
              </div>

              <div className="security-callout"><FaLock /><div><strong>Access granted by patient consent</strong><span>Only the permissions approved by the patient are available to this external system.</span></div></div>
            </section>
          ))}
        </>
      )}
    </AppShell>
  );
}
