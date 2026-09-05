import { FaPills } from "react-icons/fa";
import AppShell from "../components/AppShell";
import { PRESCRIPTIONS } from "../demoData";

export default function Prescriptions() {
  return (
    <AppShell role="PATIENT" title="Prescriptions" subtitle="Your current medications and prescription history.">
      <div className="medication-grid">
        {PRESCRIPTIONS.map((item) => (
          <div className="medication-card" key={item.medication}>
            <div className="medication-icon"><FaPills /></div>
            <div className="medication-body"><span className="status-pill active">{item.status}</span><h3>{item.medication}</h3><strong>{item.dosage} • {item.frequency}</strong><p>Prescribed by {item.doctor}</p><span>{item.duration}</span></div>
          </div>
        ))}
      </div>

      <section className="content-card">
        <div className="card-heading"><div><span className="section-label">MEDICATION HISTORY</span><h3>Prescription details</h3></div></div>
        <div className="table-wrap"><table className="modern-table"><thead><tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Doctor</th><th>Duration</th></tr></thead><tbody>{PRESCRIPTIONS.map((item) => <tr key={item.medication}><td><strong>{item.medication}</strong></td><td>{item.dosage}</td><td>{item.frequency}</td><td>{item.doctor}</td><td>{item.duration}</td></tr>)}</tbody></table></div>
      </section>
    </AppShell>
  );
}
