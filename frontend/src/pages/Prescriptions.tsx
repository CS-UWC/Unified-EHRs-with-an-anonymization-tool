import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { apiRequest } from "../services/api";

interface Prescription {
  id: number;
  patient_id: number;
  doctor_name: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  created_at: string | null;
}

function formatDate(date: string | null): string {
  if (!date) {
    return "Not recorded";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not recorded";
  }

  return parsedDate.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<
    Prescription[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPrescriptions() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest<Prescription[]>(
          "/prescriptions/me"
        );

        setPrescriptions(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load your prescriptions."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPrescriptions();
  }, []);

  return (
    <AppShell
      role="PATIENT"
      title="Prescriptions"
      subtitle="View your prescribed medications and treatment instructions."
    >
      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="summary-strip">
        <div>
          <span>Total prescriptions</span>
          <strong>{prescriptions.length}</strong>
        </div>

        <div>
          <span>Latest prescription</span>
          <strong>
            {prescriptions.length > 0
              ? formatDate(prescriptions[0].created_at)
              : "No records"}
          </strong>
        </div>

        <div>
          <span>Prescribing doctors</span>
          <strong>
            {
              new Set(
                prescriptions.map(
                  (prescription) =>
                    prescription.doctor_name
                )
              ).size
            }
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
                PRESCRIPTIONS
              </span>

              <h3>Loading prescriptions...</h3>
            </div>
          </div>

          <p className="muted-text">
            Retrieving your medication records.
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
                PRESCRIPTIONS
              </span>

              <h3>Unable to load prescriptions</h3>
            </div>
          </div>

          <p className="muted-text">{error}</p>
        </section>
      )}

      {/* =====================================================
          PRESCRIPTION TABLE
      ====================================================== */}

      {!loading && !error && (
        <section className="content-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                MEDICATIONS
              </span>

              <h3>Your prescriptions</h3>
            </div>

            <span className="muted-text">
              {prescriptions.length}{" "}
              {prescriptions.length === 1
                ? "prescription"
                : "prescriptions"}
            </span>
          </div>

          {prescriptions.length === 0 ? (
            <p className="muted-text">
              No prescriptions are currently available.
            </p>
          ) : (
            <div className="table-wrap">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Doctor</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td>
                        <strong>
                          {prescription.medicine_name}
                        </strong>
                      </td>

                      <td>
                        {prescription.dosage}
                      </td>

                      <td>
                        {prescription.frequency}
                      </td>

                      <td>
                        {prescription.duration}
                      </td>

                      <td>
                        {prescription.doctor_name}
                      </td>

                      <td>
                        {formatDate(
                          prescription.created_at
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* =====================================================
          INSTRUCTIONS
      ====================================================== */}

      {!loading &&
        !error &&
        prescriptions.length > 0 && (
          <section className="content-card">
            <div className="card-heading">
              <div>
                <span className="section-label">
                  TREATMENT INSTRUCTIONS
                </span>

                <h3>Medication instructions</h3>
              </div>
            </div>

            <div className="condition-list">
              {prescriptions.map((prescription) => (
                <div
                  key={`instructions-${prescription.id}`}
                >
                  <strong>
                    {prescription.medicine_name}
                  </strong>

                  <span>
                    {prescription.instructions}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
    </AppShell>
  );
}
