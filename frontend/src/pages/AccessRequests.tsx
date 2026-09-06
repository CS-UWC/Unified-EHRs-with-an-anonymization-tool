import { useEffect, useState } from "react";
import {
  FaCheck,
  FaClock,
  FaLock,
  FaTimes,
  FaUndo,
  FaUserMd,
} from "react-icons/fa";
import AppShell from "../components/AppShell";
import { apiRequest } from "../services/api";

interface AccessRequest {
  request_id: number;
  external_system_id: number;
  requested_read: boolean;
  requested_write: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";
  created_at: string;
  responded_at: string | null;
}

export default function AccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(
    null
  );

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<AccessRequest[]>(
        "/access-requests/"
      );

      setRequests(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load access requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const approveRequest = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      setError("");

      await apiRequest(
        `/access-requests/${requestId}/approve`,
        {
          method: "POST",
        }
      );

      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to approve access request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const rejectRequest = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      setError("");

      await apiRequest(
        `/access-requests/${requestId}/reject`,
        {
          method: "POST",
        }
      );

      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reject access request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const revokeAccess = async (externalSystemId: number) => {
    try {
      setProcessingId(externalSystemId);
      setError("");

      await apiRequest(
        `/access-requests/permission/${externalSystemId}`,
        {
          method: "DELETE",
        }
      );

      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to revoke access."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const pending = requests.filter(
    (request) => request.status === "PENDING"
  );

  const active = requests.filter(
    (request) => request.status === "APPROVED"
  );

  const history = requests.filter(
    (request) => request.status !== "PENDING"
  );

  const formatDateTime = (value: string | null) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <AppShell
      role="PATIENT"
      title="Privacy & Access"
      subtitle="Control which external healthcare systems can access your record."
    >
      <div className="privacy-hero">
        <div className="privacy-hero-icon">
          <FaLock />
        </div>

        <div>
          <span className="section-label">
            YOUR DATA, YOUR CHOICE
          </span>

          <h2>Patient-controlled consent</h2>

          <p>
            External systems cannot access your record unless
            you grant the requested permission.
          </p>
        </div>
      </div>

      {error && (
        <section className="content-card">
          <p>{error}</p>
        </section>
      )}

      {loading ? (
        <section className="content-card">
          <p>Loading access requests...</p>
        </section>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="content-card request-section">
              <div className="card-heading">
                <div>
                  <span className="section-label">
                    ACTION REQUIRED
                  </span>

                  <h3>
                    Access requests awaiting your decision
                  </h3>
                </div>

                <span className="count-badge">
                  {pending.length}
                </span>
              </div>

              <div className="request-list">
                {pending.map((request) => (
                  <RequestCard
                    key={request.request_id}
                    request={request}
                    processing={
                      processingId === request.request_id
                    }
                    onApprove={approveRequest}
                    onReject={rejectRequest}
                    onRevoke={revokeAccess}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="content-card request-section">
            <div className="card-heading">
              <div>
                <span className="section-label">
                  ACTIVE PERMISSIONS
                </span>

                <h3>Connected healthcare systems</h3>
              </div>
            </div>

            {active.length === 0 ? (
              <div className="empty-state">
                <FaLock />

                <strong>No active permissions</strong>

                <span>
                  Approved external systems will appear here.
                </span>
              </div>
            ) : (
              <div className="request-list">
                {active.map((request) => (
                  <RequestCard
                    key={request.request_id}
                    request={request}
                    processing={
                      processingId ===
                      request.external_system_id
                    }
                    onApprove={approveRequest}
                    onReject={rejectRequest}
                    onRevoke={revokeAccess}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="content-card">
            <div className="card-heading">
              <div>
                <span className="section-label">
                  ACCESS HISTORY
                </span>

                <h3>Recent decisions</h3>
              </div>
            </div>

            <div className="timeline-list">
              {history.length === 0 ? (
                <div className="empty-state">
                  <FaClock />

                  <strong>No access history</strong>

                  <span>
                    Decisions about external-system access
                    will appear here.
                  </span>
                </div>
              ) : (
                history.map((request) => (
                  <div
                    className="timeline-row"
                    key={`${request.request_id}-history`}
                  >
                    <div className="timeline-dot" />

                    <div>
                      <strong>
                        External System #
                        {request.external_system_id}
                      </strong>

                      <span>
                        {request.status === "APPROVED"
                          ? "Permission approved"
                          : request.status === "REJECTED"
                          ? "Request rejected"
                          : "Permission revoked"}

                        {" • "}

                        {formatDateTime(
                          request.responded_at ||
                            request.created_at
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

function RequestCard({
  request,
  processing,
  onApprove,
  onReject,
  onRevoke,
}: {
  request: AccessRequest;
  processing: boolean;
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
  onRevoke: (externalSystemId: number) => void;
}) {
  const pending = request.status === "PENDING";
  const approved = request.status === "APPROVED";

  return (
    <div className="request-card">
      <div className="request-icon">
        <FaUserMd />
      </div>

      <div className="request-main">
        <div className="request-title">
          <strong>
            External System #{request.external_system_id}
          </strong>

          <span>Request #{request.request_id}</span>
        </div>

        <div className="permission-tags">
          <span
            className={
              request.requested_read
                ? "permission-tag allowed"
                : "permission-tag"
            }
          >
            <FaCheck /> Read
          </span>

          <span
            className={
              request.requested_write
                ? "permission-tag allowed"
                : "permission-tag"
            }
          >
            <FaCheck /> Write
          </span>
        </div>

        <span className="request-time">
          <FaClock /> Requested{" "}
          {formatRequestDate(request.created_at)}
        </span>
      </div>

      <div className="request-actions">
        <span
          className={`status-pill ${request.status.toLowerCase()}`}
        >
          {request.status}
        </span>

        {pending && (
          <div className="action-buttons">
            <button
              className="approve-button"
              disabled={processing}
              onClick={() =>
                onApprove(request.request_id)
              }
            >
              <FaCheck />

              {processing ? "Processing..." : "Approve"}
            </button>

            <button
              className="reject-button"
              disabled={processing}
              onClick={() =>
                onReject(request.request_id)
              }
            >
              <FaTimes />

              {processing ? "Processing..." : "Reject"}
            </button>
          </div>
        )}

        {approved && (
          <button
            className="revoke-button"
            disabled={processing}
            onClick={() =>
              onRevoke(request.external_system_id)
            }
          >
            <FaUndo />

            {processing ? "Revoking..." : "Revoke access"}
          </button>
        )}
      </div>
    </div>
  );
}

function formatRequestDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}