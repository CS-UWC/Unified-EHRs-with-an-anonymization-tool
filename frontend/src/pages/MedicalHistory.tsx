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

function formatDate(date: string | null): string {
  if (!date) {
    return "Date unavailable";
  }

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
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function MedicalHistory() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      subtitle="Your unified healthcare records across providers."
    >
      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="summary-strip">
        <div>
          <span>Chronic conditions</span>
          <strong>
            {conditions.length > 0
              ? conditions.join(" • ")
              : "No conditions recorded"}
          </strong>
        </div>

        <div>
          <span>Allergies</span>
          <strong>
            {allergies.length > 0
              ? allergies.join(" • ")
              : "No allergies recorded"}
          </strong>
        </div>

        <div>
          <span>Blood group</span>
          <strong>
            {latestRecord?.blood_type || "Not recorded"}
          </strong>
        </div>
      </div>

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading && (
        <section className="content-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                MEDICAL HISTORY
              </span>
              <h3>Loading records...</h3>
            </div>
          </div>

          <p className="muted-text">
            Retrieving your medical records.
          </p>
        </section>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {!loading && error && (
        <section className="content-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                MEDICAL HISTORY
              </span>
              <h3>Unable to load records</h3>
            </div>
          </div>

          <p className="muted-text">{error}</p>
        </section>
      )}

      {/* =====================================================
          CLINICAL RECORD TIMELINE
      ====================================================== */}

      {!loading && !error && (
        <>
          <section className="content-card">
            <div className="card-heading">
              <div>
                <span className="section-label">
                  CLINICAL TIMELINE
                </span>

                <h3>Medical records</h3>
              </div>

              <span className="muted-text">
                {records.length}{" "}
                {records.length === 1 ? "record" : "records"}
              </span>
            </div>

            {records.length === 0 ? (
              <p className="muted-text">
                No medical records are currently available.
              </p>
            ) : (
              <div className="table-wrap">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Facility</th>
                      <th>Physician</th>
                      <th>Conditions</th>
                      <th>Province</th>
                    </tr>
                  </thead>

                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id}>
                        <td>
                          {formatDate(record.created_at)}
                        </td>

                        <td>
                          {record.hospital_name ||
                            "Not recorded"}
                        </td>

                        <td>
                          {record.primary_physician ||
                            "Not recorded"}
                        </td>

                        <td>
                          <span className="condition-tag">
                            {record.current_conditions ||
                              "No conditions recorded"}
                          </span>
                        </td>

                        <td>
                          {record.province ||
                            "Not recorded"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* =================================================
              CURRENT CONDITIONS
          ================================================== */}

          <div className="dashboard-grid">
            <section className="content-card">
              <div className="card-heading">
                <div>
                  <span className="section-label">
                    CONDITIONS
                  </span>

                  <h3>Current conditions</h3>
                </div>
              </div>

              <div className="condition-list">
                {conditions.length === 0 ? (
                  <div>
                    <strong>No conditions recorded</strong>
                    <span>
                      No current conditions are available.
                    </span>
                  </div>
                ) : (
                  conditions.map((condition, index) => (
                    <div key={`${condition}-${index}`}>
                      <strong>{condition}</strong>
                      <span>Current medical condition</span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* ===============================================
                ALLERGIES
            ================================================ */}

            <section className="content-card">
              <div className="card-heading">
                <div>
                  <span className="section-label">
                    ALLERGIES
                  </span>

                  <h3>Known allergies</h3>
                </div>
              </div>

              <div className="condition-list">
                {allergies.length === 0 ? (
                  <div>
                    <strong>No allergies recorded</strong>
                    <span>
                      No known allergies are available.
                    </span>
                  </div>
                ) : (
                  allergies.map((allergy, index) => (
                    <div key={`${allergy}-${index}`}>
                      <strong>{allergy}</strong>
                      <span>Known allergy</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* =================================================
              ADDITIONAL MEDICAL INFORMATION
          ================================================== */}

          {latestRecord && (
            <section className="content-card">
              <div className="card-heading">
                <div>
                  <span className="section-label">
                    MEDICAL INFORMATION
                  </span>

                  <h3>Additional details</h3>
                </div>
              </div>

              <div className="dashboard-grid">
                <div>
                  <span className="section-label">
                    MEDICAL HISTORY
                  </span>

                  <p>
                    {latestRecord.medical_history ||
                      "No medical history recorded."}
                  </p>
                </div>

                <div>
                  <span className="section-label">
                    CURRENT MEDICATIONS
                  </span>

                  <p>
                    {latestRecord.current_medications ||
                      "No current medications recorded."}
                  </p>
                </div>

                <div>
                  <span className="section-label">
                    HEIGHT
                  </span>

                  <p>
                    {latestRecord.height ||
                      "Not recorded"}
                  </p>
                </div>

                <div>
                  <span className="section-label">
                    WEIGHT
                  </span>

                  <p>
                    {latestRecord.weight ||
                      "Not recorded"}
                  </p>
                </div>

                <div>
                  <span className="section-label">
                    PRIMARY PHYSICIAN
                  </span>

                  <p>
                    {latestRecord.primary_physician ||
                      "Not recorded"}
                  </p>
                </div>

                <div>
                  <span className="section-label">
                    FACILITY
                  </span>

                  <p>
                    {latestRecord.hospital_name ||
                      "Not recorded"}
                  </p>
                </div>

                <div>
                  <span className="section-label">
                    PROVINCE
                  </span>

                  <p>
                    {latestRecord.province ||
                      "Not recorded"}
                  </p>
                </div>

                <div>
                  <span className="section-label">
                    EMERGENCY CONTACT
                  </span>

                  <p>
                    {latestRecord.emergency_contact ||
                      "Not recorded"}
                  </p>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </AppShell>
  );
}
