import { useEffect, useState } from "react";
import {
  FaEdit,
  FaLock,
  FaMapMarkerAlt,
  FaPhone,
  FaShieldAlt,
} from "react-icons/fa";
import AppShell from "../components/AppShell";
import {
  getMyPatient,
  updateMyAddress,
} from "../services/patient";
import type { Patient } from "../services/patient";

export default function PatientProfile() {
  const [patient, setPatient] = useState<Patient | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingAddress, setEditingAddress] =
    useState(false);
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPatient() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyPatient();

        setPatient(data);
        setAddress(data.address || "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPatient();
  }, []);

  const handleSaveAddress = async () => {
    try {
      setSaving(true);
      setError("");

      const updated = await updateMyAddress(address);

      setPatient(updated);
      setAddress(updated.address || "");
      setEditingAddress(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your address."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell
        role="PATIENT"
        title="My Profile"
        subtitle="View your personal information and account details."
      >
        <section className="content-card">
          <p>Loading your profile...</p>
        </section>
      </AppShell>
    );
  }

  if (error || !patient) {
    return (
      <AppShell
        role="PATIENT"
        title="My Profile"
        subtitle="View your personal information and account details."
      >
        <section className="content-card">
          <p>
            {error || "Patient profile not found."}
          </p>
        </section>
      </AppShell>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-ZA");
  };

  return (
    <AppShell
      role="PATIENT"
      title="My Profile"
      subtitle="View your personal information and account details."
    >
      <div className="profile-layout">
        <section className="content-card profile-overview">
          <div className="profile-avatar-large">
            P
          </div>

          <h2>Patient</h2>

          <span>Patient</span>

          <div className="profile-status">
            <FaShieldAlt /> Account protected
          </div>
        </section>

        <section className="content-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                PERSONAL INFORMATION
              </span>

              <h3>Patient details</h3>
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <span>National ID</span>
              <strong>{patient.national_id}</strong>
            </div>

            <div className="detail-item">
              <span>Date of birth</span>
              <strong>
                {formatDate(patient.date_of_birth)}
              </strong>
            </div>

            <div className="detail-item">
              <span>Gender</span>
              <strong>
                {patient.gender || "—"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Blood group</span>
              <strong>
                {patient.blood_group || "—"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Province</span>
              <strong>
                {patient.province || "—"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Medical aid</span>
              <strong>
                {patient.medical_aid || "—"}
              </strong>
            </div>
          </div>
        </section>
      </div>

      {error && (
        <section className="content-card">
          <p>{error}</p>
        </section>
      )}

      <section className="content-card">
        <div className="card-heading">
          <div>
            <span className="section-label">
              CONTACT
            </span>

            <h3>Contact information</h3>
          </div>
        </div>

        <div className="details-grid">
          <div className="detail-item with-icon">
            <FaPhone />

            <div>
              <span>Mobile number</span>

              <strong>
                {patient.phone_number || "—"}
              </strong>
            </div>
          </div>

          <div className="detail-item with-icon">
            <FaMapMarkerAlt />

            <div>
              <span>Address</span>

              {editingAddress ? (
                <>
                  <input
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                  />

                  <div>
                    <button
                      className="primary-button small-button"
                      onClick={handleSaveAddress}
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : "Save address"}
                    </button>

                    <button
                      className="outline-button"
                      onClick={() => {
                        setAddress(
                          patient.address || ""
                        );
                        setEditingAddress(false);
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <strong>
                    {patient.address || "—"}
                  </strong>

                  <button
                    className="outline-button"
                    onClick={() =>
                      setEditingAddress(true)
                    }
                  >
                    <FaEdit /> Edit address
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="security-callout">
        <FaLock />

        <div>
          <strong>
            Your identity is protected
          </strong>

        
        </div>
      </div>
    </AppShell>
  );
}