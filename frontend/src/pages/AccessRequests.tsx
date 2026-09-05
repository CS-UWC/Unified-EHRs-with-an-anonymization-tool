import { useState } from "react";
import { FaCheck, FaClock, FaLock, FaTimes, FaUndo, FaUserMd } from "react-icons/fa";
import AppShell from "../components/AppShell";
import { getAccessRequests, saveAccessRequests } from "../demoData";
import type { AccessRequest } from "../types";

export default function AccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>(getAccessRequests());

  const updateRequest = (id: string, status: AccessRequest["status"]) => {
    const updated = requests.map((request) =>
      request.id === id
        ? { ...request, status, respondedAt: "Just now" }
        : request
    );
    setRequests(updated);
    saveAccessRequests(updated);
  };

  const pending = requests.filter((request) => request.status === "PENDING");
  const active = requests.filter((request) => request.status === "APPROVED");

  return (
    <AppShell role="PATIENT" title="Privacy & Access" subtitle="Control which external healthcare systems can access your record.">
      <div className="privacy-hero">
        <div className="privacy-hero-icon"><FaLock /></div>
        <div><span className="section-label">YOUR DATA, YOUR CHOICE</span><h2>Patient-controlled consent</h2><p>External systems cannot access your record unless you grant the requested permission.</p></div>
      </div>

      {pending.length > 0 && (
        <section className="content-card request-section">
          <div className="card-heading"><div><span className="section-label">ACTION REQUIRED</span><h3>Access requests awaiting your decision</h3></div><span className="count-badge">{pending.length}</span></div>
          <div className="request-list">
            {pending.map((request) => (
              <RequestCard key={request.id} request={request} onUpdate={updateRequest} />
            ))}
          </div>
        </section>
      )}

      <section className="content-card request-section">
        <div className="card-heading"><div><span className="section-label">ACTIVE PERMISSIONS</span><h3>Connected healthcare systems</h3></div></div>
        {active.length === 0 ? (
          <div className="empty-state"><FaLock /><strong>No active permissions</strong><span>Approved external systems will appear here.</span></div>
        ) : (
          <div className="request-list">{active.map((request) => <RequestCard key={request.id} request={request} onUpdate={updateRequest} />)}</div>
        )}
      </section>

      <section className="content-card">
        <div className="card-heading"><div><span className="section-label">ACCESS HISTORY</span><h3>Recent decisions</h3></div></div>
        <div className="timeline-list">
          {requests.filter((r) => r.status !== "PENDING").map((request) => (
            <div className="timeline-row" key={`${request.id}-history`}><div className="timeline-dot" /><div><strong>{request.externalSystem}</strong><span>{request.status === "APPROVED" ? "Permission approved" : request.status === "REVOKED" ? "Permission revoked" : "Request rejected"} • {request.respondedAt || request.requestedAt}</span></div></div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function RequestCard({
  request,
  onUpdate,
}: {
  request: AccessRequest;
  onUpdate: (id: string, status: AccessRequest["status"]) => void;
}) {
  const pending = request.status === "PENDING";
  const approved = request.status === "APPROVED";

  return (
    <div className="request-card">
      <div className="request-icon"><FaUserMd /></div>
      <div className="request-main">
        <div className="request-title"><strong>{request.externalSystem}</strong><span>{request.id}</span></div>
        <p>Patient: {request.patientNationalId}</p>
        <div className="permission-tags">
          <span className={request.canRead ? "permission-tag allowed" : "permission-tag"}><FaCheck /> Read</span>
          <span className={request.canWrite ? "permission-tag allowed" : "permission-tag"}><FaCheck /> Write</span>
        </div>
        <span className="request-time"><FaClock /> Requested {request.requestedAt}</span>
      </div>

      <div className="request-actions">
        <span className={`status-pill ${request.status.toLowerCase()}`}>{request.status}</span>
        {pending && <div className="action-buttons"><button className="approve-button" onClick={() => onUpdate(request.id, "APPROVED")}><FaCheck /> Approve</button><button className="reject-button" onClick={() => onUpdate(request.id, "REJECTED")}><FaTimes /> Reject</button></div>}
        {approved && <button className="revoke-button" onClick={() => onUpdate(request.id, "REVOKED")}><FaUndo /> Revoke access</button>}
      </div>
    </div>
  );
}
