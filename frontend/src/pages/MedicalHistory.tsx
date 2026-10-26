
import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { apiRequest } from "../services/api";

interface MedicalRecord {
  id: number;
  patient_id: number;
  blood_type: string | null;
  allergies: string | null;
  current_medications: string | null;
  medical_history: string | null;
  current_conditions: string | null;
  height: string | null;
  weight: string | null;
  emergency_contact: string | null;
  primary_physician: string | null;
  hospital_name: string | null;
  province: string | null;
  created_at: string | null;
  updated_at: string | null;
}

function displayValue(value: string | null | undefined): string {
  const cleaned = value?.trim();

  if (
    !cleaned ||
    cleaned.toLowerCase() === "string" ||
    cleaned.toLowerCase() === "null" ||
    cleaned.toLowerCase() === "undefined"
  ) {
    return "Not recorded";
  }

  return cleaned;
}

function formatDate(date: string | null): string {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function splitValues(value: string | null): string[] {
  const cleaned = displayValue(value);

  if (cleaned === "Not recorded") return [];

  return cleaned
    .split(",")
    .map((item) => item.trim())
    .filter(
      (item) =>
        item.length > 0 &&
        item.toLowerCase() !== "string"
    );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="medical-detail">
      <span>{label}</span>
      <p>{displayValue(value)}</p>
    </div>
  );
}

export default function MedicalHistory() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRecordId, setExpandedRecordId] =
    useState<number | null>(null);

  useEffect(() => {
    async function loadMedicalHistory() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest<MedicalRecord[]>(
          "/medical-records/me"
        );

        setRecords(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load your medical history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMedicalHistory();
  }, []);

  const latestRecord = records[0] ?? null;

  const conditions = splitValues(
    latestRecord?.current_conditions ?? null
  );

  const allergies = splitValues(
    latestRecord?.allergies ?? null
  );

  return (
    <AppShell
      role="PATIENT"
      title="Medical History"
      subtitle="Your healthcare records in one place."
    >
      {/* Summary cards */}
      <div className="summary-strip">
        <div>
          <span>Medical records</span>
          <strong>{records.length}</strong>
        </div>

        <div>
          <span>Current conditions</span>
          <strong>
            {conditions.length > 0
              ? conditions.join(", ")
              : "None recorded"}
          </strong>
        </div>

        <div>
          <span>Known allergies</span>
          <strong>
            {allergies.length > 0
              ? allergies.join(", ")
              : "None recorded"}
          </strong>
        </div>

        <div>
          <span>Blood group</span>
          <strong>
            {displayValue(latestRecord?.blood_type)}
          </strong>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <section className="content-card">
          <h3>Loading medical records...</h3>
          <p className="muted-text">
            Retrieving your records securely.
          </p>
        </section>
      )}

      {/* Error state */}
      {!loading && error && (
        <section className="content-card">
          <h3>Unable to load records</h3>
          <p className="muted-text">{error}</p>
        </section>
      )}

      {/* Clinical timeline */}
      {!loading && !error && (
        <section className="content-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                CLINICAL TIMELINE
              </span>
              <h3>Medical records</h3>
              <p className="muted-text">
                Select a record to view its full details.
              </p>
            </div>

            <span className="record-count">
              {records.length}{" "}
              {records.length === 1 ? "record" : "records"}
            </span>
          </div>

          {records.length === 0 ? (
            <div className="medical-empty-state">
              <h4>No medical records yet</h4>
              <p>
                Your available healthcare records will appear here
                when they have been added to your profile.
              </p>
            </div>
          ) : (
            <div className="medical-timeline">
              {records.map((record) => {
                const isExpanded =
                  expandedRecordId === record.id;

                return (
                  <article
                    className={`timeline-item ${
                      isExpanded ? "is-expanded" : ""
                    }`}
                    key={record.id}
                  >
                    <button
                      type="button"
                      className="timeline-record-button"
                      aria-expanded={isExpanded}
                      aria-controls={`record-details-${record.id}`}
                      onClick={() =>
                        setExpandedRecordId(
                          isExpanded ? null : record.id
                        )
                      }
                    >
                      <span className="timeline-marker" />

                      <span className="timeline-record-content">
                        <span className="timeline-date">
                          {formatDate(record.created_at)}
                        </span>

                        <strong className="timeline-record-title">
                          Medical record
                        </strong>

                        <span className="timeline-record-summary">
                          {displayValue(
                            record.current_conditions
                          ) === "Not recorded"
                            ? "No condition details recorded"
                            : displayValue(
                                record.current_conditions
                              )}
                        </span>

                        <span className="timeline-record-meta">
                          {displayValue(record.hospital_name)}
                          {" · "}
                          {displayValue(record.primary_physician)}
                        </span>
                      </span>

                      <span className="timeline-expand-label">
                        {isExpanded
                          ? "Hide details"
                          : "View details"}
                        <span aria-hidden="true">
                          {isExpanded ? " −" : " +"}
                        </span>
                      </span>
                    </button>

                    {isExpanded && (
                      <div
                        id={`record-details-${record.id}`}
                        className="record-details-panel"
                      >
                        <div className="record-details-heading">
                          <div>
                            <span className="section-label">
                              RECORD DETAILS
                            </span>
                            <h4>
                              Medical record from{" "}
                              {formatDate(record.created_at)}
                            </h4>
                          </div>
                        </div>

                        <div className="record-details-grid">
                          <Detail
                            label="Medical history"
                            value={record.medical_history}
                          />
                          <Detail
                            label="Current conditions"
                            value={record.current_conditions}
                          />
                          <Detail
                            label="Known allergies"
                            value={record.allergies}
                          />
                          <Detail
                            label="Current medications"
                            value={record.current_medications}
                          />
                          <Detail
                            label="Blood group"
                            value={record.blood_type}
                          />
                          <Detail
                            label="Height"
                            value={record.height}
                          />
                          <Detail
                            label="Weight"
                            value={record.weight}
                          />
                          <Detail
                            label="Healthcare professional"
                            value={record.primary_physician}
                          />
                          <Detail
                            label="Healthcare facility"
                            value={record.hospital_name}
                          />
                          <Detail
                            label="Province"
                            value={record.province}
                          />
                          <Detail
                            label="Emergency contact"
                            value={record.emergency_contact}
                          />
                          <Detail
                            label="Last updated"
                            value={record.updated_at}
                          />
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}
