import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaFileMedical,
  FaLock,
  FaPen,
  FaUserMd,
} from "react-icons/fa";

import AppShell from "../../components/AppShell";
import { apiRequest } from "../../services/api";

interface FHIRBundleEntry {
  resource?: FHIRResource;
}

interface FHIRBundle {
  resourceType?: string;
  type?: string;
  entry?: FHIRBundleEntry[];
}

interface FHIRResource {
  resourceType?: string;
  id?: string;

  identifier?: Array<{
    system?: string;
    value?: string;
  }>;

  name?: Array<{
    text?: string;
  }>;

  gender?: string;
  birthDate?: string;

  subject?: {
    reference?: string;
    identifier?: {
      value?: string;
    };
  };

  code?: string | {
    text?: string;
    coding?: Array<{
      display?: string;
    }>;
  };

  value?: string | number;

  conclusion?: string;

  medicationCodeableConcept?: {
    text?: string;
  };

  dosageInstruction?: Array<{
    text?: string;
  }>;

  authoredOn?: string;

  status?: string;

  description?: string;

  content?: Array<{
    attachment?: {
      contentType?: string;
      url?: string;
      title?: string;
    };
  }>;

  appointmentType?: {
    text?: string;
  };

  participant?: Array<{
    actor?: {
      display?: string;
      reference?: string;
    };
  }>;

  start?: string;

  end?: string;

  period?: {
    start?: string;
    end?: string;
  };
}

interface Permission {
  patient_national_id: string;
  can_read: boolean;
  can_write: boolean;
}

function formatDate(date?: string): string {
  if (!date) {
    return "Not recorded";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not recorded";
  }

  return parsed.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCodeText(
  code: FHIRResource["code"]
): string {
  if (!code) {
    return "Not recorded";
  }

  if (typeof code === "string") {
    return code;
  }

  if (code.text) {
    return code.text;
  }

  return (
    code.coding?.find(
      (coding) => coding.display
    )?.display ||
    "Not recorded"
  );
}

function getPatientNationalId(
  resource: FHIRResource
): string {
  if (resource.identifier?.length) {
    return (
      resource.identifier[0].value ||
      "Unknown"
    );
  }

  return "Unknown";
}

export default function ExternalPatientRecords() {
  const [searchParams] = useSearchParams();

  const nationalId =
    searchParams.get("nationalId") || "";

  const [bundle, setBundle] =
    useState<FHIRBundle | null>(null);

  const [permission, setPermission] =
    useState<Permission | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadRecords() {
      if (!nationalId) {
        setError(
          "No patient National ID was supplied."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const permissions =
          await apiRequest<Permission[]>(
            "/access-requests/mine"
          );

        const currentPermission =
          permissions.find(
            (item) =>
              item.patient_national_id ===
              nationalId
          );

        if (!currentPermission) {
          throw new Error(
            "This patient is not authorised for this external system."
          );
        }

        if (!currentPermission.can_read) {
          throw new Error(
            "Read access has not been granted for this patient."
          );
        }

        setPermission(
          currentPermission
        );

        const patientBundle =
          await apiRequest<FHIRBundle>(
            `/fhir/patient/${encodeURIComponent(
              nationalId
            )}/bundle`
          );

        setBundle(patientBundle);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load the patient record."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, [nationalId]);

  const resources =
    bundle?.entry
      ?.map(
        (entry) => entry.resource
      )
      .filter(
        (resource): resource is FHIRResource =>
          Boolean(resource)
      ) || [];

  const patientResource =
    resources.find(
      (resource) =>
        resource.resourceType ===
        "Patient"
    );

  const medicalRecords =
    resources.filter(
      (resource) =>
        resource.resourceType ===
        "DiagnosticReport"
    );

  const observations =
    resources.filter(
      (resource) =>
        resource.resourceType ===
        "Observation"
    );

  const appointments =
    resources.filter(
      (resource) =>
        resource.resourceType ===
        "Appointment"
    );

  const prescriptions =
    resources.filter(
      (resource) =>
        resource.resourceType ===
        "MedicationRequest"
    );

  const scans =
    resources.filter(
      (resource) =>
        resource.resourceType ===
        "DocumentReference"
    );

  const patientName =
    patientResource?.name?.[0]?.text ||
    "Patient";

  return (
    <AppShell
      role="EXTERNAL_SYSTEM"
      title="Authorised Records"
      subtitle="Patient information available under active permissions."
    >
      <Link
        className="back-link"
        to="/external"
      >
        <FaArrowLeft />
        Back to integration dashboard
      </Link>

      {loading && (
        <section className="content-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                FHIR RECORD
              </span>

              <h3>Loading authorised data...</h3>
            </div>
          </div>

          <p className="muted-text">
            Retrieving the patient record.
          </p>
        </section>
      )}

      {!loading && error && (
        <section className="content-card locked-state">
          <FaLock />

          <h2>Access unavailable</h2>

          <p>{error}</p>

          <Link
            className="primary-button"
            to="/external/search"
          >
            Request access
          </Link>
        </section>
      )}

      {!loading &&
        !error &&
        bundle &&
        permission && (
          <>
            <div className="demo-banner">
              <FaCheckCircle />

              <div>
                <strong>
                  Authorised FHIR access
                </strong>

                <span>
                  Data is visible because the
                  patient has granted this external
                  system permission.
                </span>
              </div>
            </div>

            <section className="content-card authorised-record">
              <div className="record-header">
                <div className="request-icon">
                  <FaUserMd />
                </div>

                <div>
                  <span className="section-label">
                    PATIENT RECORD
                  </span>

                  <h2>{patientName}</h2>

                  <span>
                    National ID: {nationalId}
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
                      <FaPen />
                      Write
                    </span>
                  )}
                </div>
              </div>

              {/* ==========================================
                  CLINICAL SUMMARY
              =========================================== */}

              <div className="authorised-data">
                <div className="data-section">
                  <div className="data-section-heading">
                    <FaFileMedical />

                    <h3>
                      Clinical summary
                    </h3>
                  </div>

                  <div className="details-grid">
                    <div className="detail-item">
                      <span>
                        Date of birth
                      </span>

                      <strong>
                        {formatDate(
                          patientResource?.birthDate
                        )}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>
                        Gender
                      </span>

                      <strong>
                        {patientResource?.gender ||
                          "Not recorded"}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>
                        Medical records
                      </span>

                      <strong>
                        {medicalRecords.length}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>
                        Observations
                      </span>

                      <strong>
                        {observations.length}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>
                        Prescriptions
                      </span>

                      <strong>
                        {prescriptions.length}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>
                        Appointments
                      </span>

                      <strong>
                        {appointments.length}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* ========================================
                    MEDICAL RECORDS
                ========================================= */}

                <div className="data-section">
                  <div className="data-section-heading">
                    <FaFileMedical />

                    <h3>
                      Medical records
                    </h3>
                  </div>

                  {medicalRecords.length === 0 ? (
                    <p className="muted-text">
                      No medical records available.
                    </p>
                  ) : (
                    <div className="table-wrap">
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>
                              Date
                            </th>

                            <th>
                              Type
                            </th>

                            <th>
                              Summary
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {medicalRecords.map(
                            (record) => (
                              <tr
                                key={
                                  record.id
                                }
                              >
                                <td>
                                  {formatDate(
                                    record.authoredOn
                                  )}
                                </td>

                                <td>
                                  Diagnostic report
                                </td>

                                <td>
                                  {record.conclusion ||
                                    getCodeText(
                                      record.code
                                    )}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ========================================
                    OBSERVATIONS
                ========================================= */}

                <div className="data-section">
                  <div className="data-section-heading">
                    <FaFileMedical />

                    <h3>
                      Laboratory observations
                    </h3>
                  </div>

                  {observations.length === 0 ? (
                    <p className="muted-text">
                      No observations available.
                    </p>
                  ) : (
                    <div className="table-wrap">
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>
                              Test
                            </th>

                            <th>
                              Result
                            </th>

                            <th>
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {observations.map(
                            (observation) => (
                              <tr
                                key={
                                  observation.id
                                }
                              >
                                <td>
                                  {getCodeText(
                                    observation.code
                                  )}
                                </td>

                                <td>
                                  {observation.value ??
                                    "Not recorded"}
                                </td>

                                <td>
                                  {observation.status ||
                                    "Not recorded"}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ========================================
                    PRESCRIPTIONS
                ========================================= */}

                <div className="data-section">
                  <div className="data-section-heading">
                    <FaFileMedical />

                    <h3>
                      Prescriptions
                    </h3>
                  </div>

                  {prescriptions.length === 0 ? (
                    <p className="muted-text">
                      No prescriptions available.
                    </p>
                  ) : (
                    <div className="table-wrap">
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>
                              Medication
                            </th>

                            <th>
                              Instructions
                            </th>

                            <th>
                              Date
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {prescriptions.map(
                            (prescription) => (
                              <tr
                                key={
                                  prescription.id
                                }
                              >
                                <td>
                                  {prescription
                                    .medicationCodeableConcept
                                    ?.text ||
                                    "Medication"}
                                </td>

                                <td>
                                  {prescription
                                    .dosageInstruction?.[0]
                                    ?.text ||
                                    "Not recorded"}
                                </td>

                                <td>
                                  {formatDate(
                                    prescription.authoredOn
                                  )}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ========================================
                    APPOINTMENTS
                ========================================= */}

                <div className="data-section">
                  <div className="data-section-heading">
                    <FaFileMedical />

                    <h3>
                      Appointments
                    </h3>
                  </div>

                  {appointments.length === 0 ? (
                    <p className="muted-text">
                      No appointments available.
                    </p>
                  ) : (
                    <div className="table-wrap">
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>
                              Date
                            </th>

                            <th>
                              Provider
                            </th>

                            <th>
                              Type
                            </th>

                            <th>
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {appointments.map(
                            (appointment) => (
                              <tr
                                key={
                                  appointment.id
                                }
                              >
                                <td>
                                  {formatDate(
                                    appointment.start
                                  )}
                                </td>

                                <td>
                                  {
                                    appointment
                                      .participant?.[0]
                                      ?.actor
                                      ?.display
                                  }
                                </td>

                                <td>
                                  {appointment
                                    .appointmentType
                                    ?.text ||
                                    "Appointment"}
                                </td>

                                <td>
                                  {appointment.status ||
                                    "Not recorded"}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ========================================
                    SCANS
                ========================================= */}

                <div className="data-section">
                  <div className="data-section-heading">
                    <FaFileMedical />

                    <h3>
                      Medical scans
                    </h3>
                  </div>

                  {scans.length === 0 ? (
                    <p className="muted-text">
                      No medical scans available.
                    </p>
                  ) : (
                    <div className="table-wrap">
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>
                              File
                            </th>

                            <th>
                              Type
                            </th>

                            <th>
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {scans.map(
                            (scan) => {
                              const attachment =
                                scan.content?.[0]
                                  ?.attachment;

                              return (
                                <tr
                                  key={
                                    scan.id
                                  }
                                >
                                  <td>
                                    {attachment
                                      ?.title ||
                                      "Medical scan"}
                                  </td>

                                  <td>
                                    {attachment
                                      ?.contentType ||
                                      "Unknown"}
                                  </td>

                                  <td>
                                    {attachment
                                      ?.url ? (
                                      <a
                                        className="table-action"
                                        href={
                                          attachment.url.startsWith(
                                            "http"
                                          )
                                            ? attachment.url
                                            : `${
                                                import.meta
                                                  .env
                                                  .VITE_API_BASE_URL ||
                                                "http://127.0.0.1:8000"
                                              }${attachment.url}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        Open scan
                                      </a>
                                    ) : (
                                      <span className="muted-text">
                                        Unavailable
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="security-callout">
                <FaLock />

                <div>
                  <strong>
                    Access granted by patient
                    consent
                  </strong>

                  <span>
                    This external system can only
                    retrieve data permitted by the
                    patient's active access
                    permission. Access is enforced
                    by the backend.
                  </span>
                </div>
              </div>
            </section>
          </>
        )}
    </AppShell>
  );
}
