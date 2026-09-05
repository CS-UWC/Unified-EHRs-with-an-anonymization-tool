import { Link } from "react-router-dom";
import { FaArrowRight, FaCheckCircle, FaLock, FaSearch, FaShieldAlt, FaUserMd } from "react-icons/fa";
import AppShell from "../../components/AppShell";
import { getAccessRequests } from "../../demoData";

export default function ExternalDashboard() {
  const requests = getAccessRequests();
  const approved = requests.filter((r) => r.status === "APPROVED");
  const pending = requests.filter((r) => r.status === "PENDING");

  return (
    <AppShell role="EXTERNAL_SYSTEM" title="Healthcare Integration" subtitle="Request and manage authorised patient access.">
      <div className="external-hero">
        <div><span className="section-label">EXTERNAL SYSTEM</span><h2>Cape Health Connect</h2><p>FHIR-enabled access to the Unified EHR, subject to patient-controlled permissions.</p></div>
        <div className="integration-status"><FaCheckCircle /><span><strong>Integration active</strong>FHIR API ready</span></div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-icon"><FaCheckCircle /></div><div><span>Authorised patients</span><strong>{approved.length}</strong></div></div>
        <div className="stat-card"><div className="stat-icon"><FaSearch /></div><div><span>Pending requests</span><strong>{pending.length}</strong></div></div>
        <div className="stat-card"><div className="stat-icon"><FaLock /></div><div><span>Write permissions</span><strong>{approved.filter((r) => r.canWrite).length}</strong></div></div>
        <div className="stat-card"><div className="stat-icon"><FaShieldAlt /></div><div><span>Security status</span><strong className="secure-stat">Secure</strong></div></div>
      </div>

      <section className="content-card">
        <div className="card-heading"><div><span className="section-label">PATIENT ACCESS</span><h3>Find a patient</h3></div></div>
        <div className="search-card">
          <div className="search-card-icon"><FaSearch /></div>
          <div><strong>Request access using national ID</strong><span>The patient's national ID is used for interoperability. The internal EHR patient ID is never exposed.</span></div>
          <Link className="primary-button" to="/external/search">Find patient <FaArrowRight /></Link>
        </div>
      </section>

      <section className="content-card">
        <div className="card-heading"><div><span className="section-label">AUTHORISED ACCESS</span><h3>Connected patients</h3></div><Link to="/external/records">View records <FaArrowRight /></Link></div>
        {approved.length === 0 ? <div className="empty-state"><FaLock /><strong>No authorised patients</strong><span>Request access to a patient to begin.</span></div> : <div className="authorised-list">{approved.map((r) => <div className="authorised-row" key={r.id}><div className="request-icon"><FaUserMd /></div><div><strong>Patient record</strong><span>National ID: {r.patientNationalId}</span></div><div className="permission-tags"><span className="permission-tag allowed"><FaCheckCircle /> Read</span>{r.canWrite && <span className="permission-tag allowed"><FaCheckCircle /> Write</span>}</div><Link to="/external/records" className="table-action">Open record <FaArrowRight /></Link></div>)}</div>}
      </section>
    </AppShell>
  );
}
