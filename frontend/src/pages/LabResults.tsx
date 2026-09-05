import { FaCheckCircle, FaFlask } from "react-icons/fa";
import AppShell from "../components/AppShell";
import { LAB_RESULTS } from "../demoData";

export default function LabResults() {
  return (
    <AppShell role="PATIENT" title="Laboratory Results" subtitle="Diagnostic investigations from your connected providers.">
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-icon"><FaFlask /></div><div><span>Total tests</span><strong>{LAB_RESULTS.length}</strong></div></div>
        <div className="stat-card"><div className="stat-icon"><FaCheckCircle /></div><div><span>Completed</span><strong>{LAB_RESULTS.filter((r) => r.status === "Completed").length}</strong></div></div>
      </div>

      <section className="content-card">
        <div className="card-heading"><div><span className="section-label">DIAGNOSTICS</span><h3>Recent test results</h3></div></div>
        <div className="table-wrap">
          <table className="modern-table">
            <thead><tr><th>Test</th><th>Date</th><th>Facility</th><th>Result</th><th>Status</th></tr></thead>
            <tbody>
              {LAB_RESULTS.map((result) => (
                <tr key={`${result.test}-${result.date}`}><td><strong>{result.test}</strong></td><td>{result.date}</td><td>{result.facility}</td><td>{result.result}</td><td><span className="status-pill completed"><FaCheckCircle /> {result.status}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
