import { FaExternalLinkAlt } from "react-icons/fa";
import AppShell from "../components/AppShell";
import { MEDICAL_VISITS } from "../demoData";

export default function MedicalHistory() {
  const handleViewPDF = (pdf: string) => {
    window.open(`/pdf-viewer?file=${encodeURIComponent(pdf)}`, "_blank");
  };

  return (
    <AppShell
      role="PATIENT"
      title="Medical History"
      subtitle="Your unified healthcare records across providers."
    >
      <div className="summary-strip">
        <div><span>Chronic conditions</span><strong>Hypertension • Asthma</strong></div>
        <div><span>Allergies</span><strong>Penicillin • Dust</strong></div>
        <div><span>Blood group</span><strong>O+</strong></div>
      </div>

      <section className="content-card">
        <div className="card-heading">
          <div><span className="section-label">CLINICAL TIMELINE</span><h3>Medical visits</h3></div>
          <span className="muted-text">{MEDICAL_VISITS.length} records</span>
        </div>
        <div className="table-wrap">
          <table className="modern-table">
            <thead><tr><th>Date</th><th>Facility</th><th>Doctor</th><th>Diagnosis</th><th>Report</th></tr></thead>
            <tbody>
              {MEDICAL_VISITS.map((visit) => (
                <tr key={`${visit.date}-${visit.facility}`}>
                  <td>{visit.date}</td><td>{visit.facility}</td><td>{visit.doctor}</td><td><span className="condition-tag">{visit.diagnosis}</span></td>
                  <td><button className="table-action" onClick={() => handleViewPDF(visit.pdf)}>View PDF <FaExternalLinkAlt /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="content-card">
          <div className="card-heading"><div><span className="section-label">CONDITIONS</span><h3>Current conditions</h3></div></div>
          <div className="condition-list"><div><strong>Hypertension</strong><span>Ongoing management</span></div><div><strong>Asthma</strong><span>Controlled</span></div></div>
        </section>
        <section className="content-card">
          <div className="card-heading"><div><span className="section-label">ALLERGIES</span><h3>Known allergies</h3></div></div>
          <div className="condition-list"><div><strong>Penicillin</strong><span>Medication allergy</span></div><div><strong>Dust</strong><span>Environmental allergy</span></div></div>
        </section>
      </div>
    </AppShell>
  );
}
