import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCheckCircle,
  FaLock,
  FaSearch,
  FaShieldAlt,
  FaUserMd,
} from "react-icons/fa";

import AppShell from "../../components/AppShell";
import { apiRequest } from "../../services/api";

import React from "react";

interface Permission {
  patient_national_id: string;
  can_read: boolean;
  can_write: boolean;
  granted_at: string | null;
}

export default function ExternalDashboard() {
  const [permissions, setPermissions] =
    React.useState<Permission[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    async function loadPermissions() {
      try {
        setLoading(true);

        const data =
          await apiRequest<Permission[]>(
            "/access-requests/mine"
          );

        setPermissions(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load authorised patients."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, []);

  const approved = permissions.filter(
    (permission) =>
      permission.can_read ||
      permission.can_write
  );

  const writePermissions = permissions.filter(
    (permission) =>
      permission.can_write
  );

  return (
    <AppShell
      role="EXTERNAL_SYSTEM"
      title="Healthcare Integration"
      subtitle="Request and manage authorised patient access."
    >
      <div className="external-hero">
        <div>
          <span className="section-label">
            EXTERNAL SYSTEM
          </span>

          <h2>Cape Health Connect</h2>

          <p>
            FHIR-enabled access to the Unified EHR,
            subject to patient-controlled
            permissions.
          </p>
        </div>

        <div className="integration-status">
          <FaCheckCircle />

          <span>
            <strong>Integration active</strong>
            FHIR API ready
          </span>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>

          <div>
            <span>Authorised patients</span>
            <strong>{approved.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaSearch />
          </div>

          <div>
            <span>Patient access</span>
            <strong>
              {approved.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaLock />
          </div>

          <div>
            <span>Write permissions</span>
            <strong>
              {writePermissions.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaShieldAlt />
          </div>

          <div>
            <span>Security status</span>
            <strong className="secure-stat">
              Secure
            </strong>
          </div>
        </div>
      </div>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <span className="section-label">
              PATIENT ACCESS
            </span>

            <h3>Find a patient</h3>
          </div>
        </div>

        <div className="search-card">
          <div className="search-card-icon">
            <FaSearch />
          </div>

          <div>
            <strong>
              Request access using national ID
            </strong>

            <span>
              The patient's national ID is used
              for interoperability. The internal
              EHR patient ID is never exposed.
            </span>
          </div>

          <Link
            className="primary-button"
            to="/external/search"
          >
            Find patient
            <FaArrowRight />
          </Link>
        </div>
      </section>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <span className="section-label">
              AUTHORISED ACCESS
            </span>

            <h3>Connected patients</h3>
          </div>

          <Link to="/external/records">
            View records
            <FaArrowRight />
          </Link>
        </div>

        {loading && (
          <p className="muted-text">
            Loading authorised patients...
          </p>
        )}

        {!loading && error && (
          <p className="muted-text">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          approved.length === 0 && (
            <div className="empty-state">
              <FaLock />

              <strong>
                No authorised patients
              </strong>

              <span>
                Request access to a patient to
                begin.
              </span>
            </div>
          )}

        {!loading &&
          !error &&
          approved.length > 0 && (
            <div className="authorised-list">
              {approved.map((permission) => (
                <div
                  className="authorised-row"
                  key={
                    permission.patient_national_id
                  }
                >
                  <div className="request-icon">
                    <FaUserMd />
                  </div>

                  <div>
                    <strong>
                      Patient record
                    </strong>

                    <span>
                      National ID:{" "}
                      {permission.patient_national_id}
                    </span>
                  </div>

                  <div className="permission-tags">
                    {permission.can_read && (
                      <span className="permission-tag allowed">
                        <FaCheckCircle />
                        Read
                      </span>
                    )}

                    {permission.can_write && (
                      <span className="permission-tag allowed">
                        <FaCheckCircle />
                        Write
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/external/records?nationalId=${encodeURIComponent(
                      permission.patient_national_id
                    )}`}
                    className="table-action"
                  >
                    Open record
                    <FaArrowRight />
                  </Link>
                </div>
              ))}
            </div>
          )}
      </section>
    </AppShell>
  );
}