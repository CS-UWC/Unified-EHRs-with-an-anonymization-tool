import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaFlask,
} from "react-icons/fa";
import AppShell from "../components/AppShell";
import { apiRequest } from "../services/api";

interface LabResult {
  id: number;
  test_name?: string;
  test?: string;
  date?: string;
  result?: string;
  status?: string;
  facility?: string;
}

export default function LabResults() {
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest<LabResult[]>(
          "/lab-results/me"
        );

        setResults(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load laboratory results."
        );
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, []);

  const getTestName = (result: LabResult) =>
    result.test_name ||
    result.test ||
    "Laboratory test";

  const completedCount = results.filter(
    (result) =>
      result.status?.toLowerCase() === "completed"
  ).length;

  return (
    <AppShell
      role="PATIENT"
      title="Laboratory Results"
      subtitle="Diagnostic investigations from your connected providers."
    >
      {loading && (
        <section className="content-card">
          <p>Loading laboratory results...</p>
        </section>
      )}

      {error && (
        <section className="content-card">
          <p>{error}</p>
        </section>
      )}

      {!loading && !error && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FaFlask />
              </div>

              <div>
                <span>Total tests</span>
                <strong>{results.length}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
              </div>
            </div>
          </div>

          <section className="content-card">
            <div className="card-heading">
              <div>
                <span className="section-label">
                  DIAGNOSTICS
                </span>

                <h3>Recent test results</h3>
              </div>
            </div>

            <div className="table-wrap">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Date</th>
                    <th>Facility</th>
                    <th>Result</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td>
                        <strong>
                          {getTestName(result)}
                        </strong>
                      </td>

                      <td>{result.date || "—"}</td>

                      <td>
                        {result.facility || "—"}
                      </td>

                      <td>
                        {result.result || "—"}
                      </td>

                      <td>
                        <span className="status-pill completed">
                          <FaCheckCircle />{" "}
                          {result.status || "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {results.length === 0 && (
              <div className="empty-state">
                <FaFlask />
                <strong>No laboratory results</strong>
                <span>
                  Laboratory results will appear here when
                  they are added to your record.
                </span>
              </div>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}
