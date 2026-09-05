import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaLock, FaSearch, FaShieldAlt, FaUserMd } from "react-icons/fa";
import AppShell from "../../components/AppShell";
import { getAccessRequests, saveAccessRequests } from "../../demoData";

export default function ExternalPatientSearch() {
  const [nationalId, setNationalId] = useState("");
  const [read, setRead] = useState(true);
  const [write, setWrite] = useState(false);
  const [message, setMessage] = useState("");
  const [requestId, setRequestId] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const requests = getAccessRequests();
    const existing = requests.find(
      (request) =>
        request.patientNationalId === nationalId &&
        request.status === "PENDING"
    );

    if (existing) {
      setMessage("A pending request already exists for this patient.");
      setRequestId(existing.id);
      return;
    }

    const id = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRequest = {
      id,
      externalSystem: "Cape Health Connect",
      patientNationalId: nationalId || "••••••••••••",
      canRead: read,
      canWrite: write,
      status: "PENDING" as const,
      requestedAt: "Just now",
    };

    saveAccessRequests([...requests, newRequest]);
    setRequestId(id);
    setMessage("Access request submitted. The patient must approve it before data can be accessed.");
  };

  return (
    <AppShell role="EXTERNAL_SYSTEM" title="Patient Access" subtitle="Request permission before accessing a patient's health record.">
      <Link className="back-link" to="/external"><FaArrowLeft /> Back to integration dashboard</Link>

      <div className="request-layout">
        <section className="content-card">
          <div className="card-heading"><div><span className="section-label">ACCESS REQUEST</span><h3>Request patient access</h3></div></div>
          <form className="access-form" onSubmit={submit}>
            <label>Patient national ID<input value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="Enter patient's national ID" required /></label>

            <div className="form-help"><FaShieldAlt /> National ID is used only to resolve the patient record. Internal database identifiers are not exposed.</div>

            <div className="permission-selector">
              <span>Requested permissions</span>
              <label className="check-option"><input type="checkbox" checked={read} onChange={(e) => setRead(e.target.checked)} /><span><FaCheck /> Read access</span><small>View authorised clinical information</small></label>
              <label className="check-option"><input type="checkbox" checked={write} onChange={(e) => setWrite(e.target.checked)} /><span><FaCheck /> Write access</span><small>Create or update authorised clinical information</small></label>
            </div>

            <button className="primary-button" type="submit"><FaSearch /> Send access request</button>
          </form>

          {message && <div className="success-message"><FaCheck /><div><strong>{message}</strong>{requestId && <span>Request reference: {requestId}</span>}</div></div>}
        </section>

        <aside className="content-card request-info-card">
          <div className="request-info-icon"><FaUserMd /></div>
          <span className="section-label">PATIENT CONSENT</span>
          <h3>Access is not automatic</h3>
          <p>The external system can request access, but the patient controls whether the request is approved.</p>
          <div className="permission-flow">
            <div><strong>01</strong><span>External system requests access</span></div>
            <div><strong>02</strong><span>Patient reviews permissions</span></div>
            <div><strong>03</strong><span>Patient approves or rejects</span></div>
            <div><strong>04</strong><span>System receives authorised access</span></div>
          </div>
          <div className="security-callout"><FaLock /><div><strong>Permission enforced by the backend</strong><span>Read and write access are controlled independently.</span></div></div>
        </aside>
      </div>
    </AppShell>
  );
}
