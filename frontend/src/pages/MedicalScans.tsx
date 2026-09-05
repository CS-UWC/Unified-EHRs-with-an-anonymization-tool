import { FaDownload, FaFileImage, FaImages } from "react-icons/fa";
import AppShell from "../components/AppShell";
import { SCANS } from "../demoData";

export default function MedicalScans() {
  return (
    <AppShell role="PATIENT" title="Medical Scans" subtitle="Diagnostic images shared with your authorised healthcare providers.">
      <div className="demo-banner">
        <FaImages />
        <div><strong>Secure medical imaging</strong><span>Scans are available only to you and healthcare systems with the required permission.</span></div>
      </div>

      <div className="scan-grid">
        {SCANS.map((scan) => (
          <div className="scan-card" key={`${scan.type}-${scan.date}`}>
            <div className="scan-preview"><FaFileImage /><span>Diagnostic image</span></div>
            <div className="scan-info"><span className="status-pill completed">{scan.status}</span><h3>{scan.type}</h3><p>{scan.facility}</p><span>{scan.date}</span><button className="outline-button"><FaDownload /> View scan</button></div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
