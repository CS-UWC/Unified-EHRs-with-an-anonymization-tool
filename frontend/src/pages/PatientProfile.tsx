import { FaEdit, FaLock, FaMapMarkerAlt, FaPhone, FaShieldAlt } from "react-icons/fa";
import AppShell from "../components/AppShell";
import { PATIENT } from "../demoData";

export default function PatientProfile() {
  return (
    <AppShell role="PATIENT" title="My Profile" subtitle="View your personal information and account details.">
      <div className="profile-layout">
        <section className="content-card profile-overview">
          <div className="profile-avatar-large">EN</div>
          <h2>{PATIENT.name}</h2>
          <span>Patient</span>
          <div className="profile-status"><FaShieldAlt /> Account protected</div>
        </section>

        <section className="content-card">
          <div className="card-heading">
            <div><span className="section-label">PERSONAL INFORMATION</span><h3>Patient details</h3></div>
            <button className="outline-button"><FaEdit /> Edit profile</button>
          </div>

          <div className="details-grid">
            <div className="detail-item"><span>National ID</span><strong>{PATIENT.nationalId}</strong></div>
            <div className="detail-item"><span>Date of birth</span><strong>{PATIENT.dob}</strong></div>
            <div className="detail-item"><span>Gender</span><strong>{PATIENT.gender}</strong></div>
            <div className="detail-item"><span>Blood group</span><strong>{PATIENT.bloodGroup}</strong></div>
            <div className="detail-item"><span>Province</span><strong>{PATIENT.province}</strong></div>
            <div className="detail-item"><span>Medical aid</span><strong>{PATIENT.medicalAid}</strong></div>
          </div>
        </section>
      </div>

      <section className="content-card">
        <div className="card-heading">
          <div><span className="section-label">CONTACT</span><h3>Contact information</h3></div>
        </div>
        <div className="details-grid">
          <div className="detail-item with-icon"><FaPhone /><div><span>Mobile number</span><strong>{PATIENT.phone}</strong></div></div>
          <div className="detail-item with-icon"><FaMapMarkerAlt /><div><span>Address</span><strong>{PATIENT.address}</strong></div></div>
        </div>
      </section>

      <div className="security-callout">
        <FaLock />
        <div><strong>Your identity is protected</strong><span>External healthcare systems use your national ID to resolve your record, while the internal patient database ID is never exposed.</span></div>
      </div>
    </AppShell>
  );
}
