import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { apiRequest } from "../services/api";
import { getMyPatient } from "../services/patient";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

interface FHIRAttachment {
  url?: string;
  title?: string;
  contentType?: string;
}

interface FHIRDocumentReference {
  resourceType?: string;
  id?: string;
  description?: string;
  date?: string;
  content?: Array<{
    attachment?: FHIRAttachment;
  }>;
}

function formatDate(date?: string): string {
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

function getScanUrl(url?: string): string {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function getFileName(url?: string): string {
  if (!url) {
    return "Medical scan";
  }

  const cleanUrl = url.split("?")[0];
  const parts = cleanUrl.split("/");

  return decodeURIComponent(
    parts[parts.length - 1] || "Medical scan"
  );
}

export default function MedicalScans() {
  const [scans, setScans] = useState<
    FHIRDocumentReference[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadScans() {
      try {
        setLoading(true);
        setError("");

        const patient = await getMyPatient();

        const data = await apiRequest<FHIRDocumentReference[]>(
          `/fhir/patient/${encodeURIComponent(
            patient.national_id
          )}/scans`
        );

        setScans(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load your medical scans."
        );
      } finally {
        setLoading(false);
      }
    }

    loadScans();
  }, []);

  return (
    <AppShell
      role="PATIENT"
      title="Medical Scans"
      subtitle="View your medical scans and imaging documents."
    >
      <div className="summary-strip">
        <div>
          <span>Total scans</span>
          <strong>{scans.length}</strong>
        </div>

        <div>
          <span>Latest scan</span>
          <strong>
            {scans.length > 0
              ? formatDate(scans[0].date)
              : "No records"}
          </strong>
        </div>

        <div>
          <span>Record type</span>
          <strong>FHIR DocumentReference</strong>
        </div>
      </div>

      {loading && (
        <section className="content-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                MEDICAL IMAGING
              </span>
              <h3>Loading scans...</h3>
            </div>
          </div>

          <p className="muted-text">
            Retrieving your medical scans.
          </p>
        </section>
      )}

      {!loading && error && (
        <section className="content-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                MEDICAL IMAGING
              </span>
              <h3>Unable to load scans</h3>
            </div>
          </div>

          <p className="muted-text">{error}</p>
        </section>
      )}

      {!loading && !error && (
        <section className="content-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                IMAGING RECORDS
              </span>
              <h3>Your medical scans</h3>
            </div>

            <span className="muted-text">
              {scans.length}{" "}
              {scans.length === 1 ? "scan" : "scans"}
            </span>
          </div>

          {scans.length === 0 ? (
            <p className="muted-text">
              No medical scans are currently available.
            </p>
          ) : (
            <div className="table-wrap">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>File</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {scans.map((scan) => {
                    const attachment =
                      scan.content?.[0]?.attachment;

                    const scanUrl = getScanUrl(
                      attachment?.url
                    );

                    return (
                      <tr key={scan.id}>
                        <td>
                          {formatDate(scan.date)}
                        </td>

                        <td>
                          <strong>
                            {getFileName(
                              attachment?.url
                            )}
                          </strong>
                        </td>

                        <td>
                          {scan.description ||
                            attachment?.title ||
                            "Medical scan"}
                        </td>

                        <td>
                          {attachment?.contentType ||
                            "Unknown"}
                        </td>

                        <td>
                          {scanUrl ? (
                            <a
                              className="table-action"
                              href={scanUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View scan
                            </a>
                          ) : (
                            <span className="muted-text">
                              File unavailable
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}
