import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaFileMedical,
  FaLock,
  FaPen,
  FaUpload,
  FaFlask,
  FaPrescriptionBottleAlt,
  FaCalendarCheck,
  FaUserMd,
} from "react-icons/fa";

import AppShell from "../../components/AppShell";
import { apiRequest } from "../../services/api";


// ============================================================
// FHIR TYPES
// ============================================================

interface FHIRBundleEntry {
  resource?: FHIRResource;
}

interface FHIRBundle {
  resourceType?: string;
  type?: string;
  entry?: FHIRBundleEntry[];
}

interface FHIRResource {
  resourceType?: string;
  id?: string;

  identifier?: Array<{
    system?: string;
    value?: string;
  }>;

  name?: Array<{
    text?: string;
    family?: string;
    given?: string[];
  }>;

  gender?: string;
  birthDate?: string;

  subject?: {
    reference?: string;
    identifier?: {
      value?: string;
    };
  };

  code?:
    | string
    | {
        text?: string;
        coding?: Array<{
          display?: string;
        }>;
      };

  value?: string | number;

  conclusion?: string;

  medicationCodeableConcept?: {
    text?: string;
  };

  dosageInstruction?: Array<{
    text?: string;
  }>;

  authoredOn?: string;

  status?: string;

  description?: string;

  content?: Array<{
    attachment?: {
      contentType?: string;
      url?: string;
      title?: string;
    };
  }>;

  appointmentType?: {
    text?: string;
  };

  participant?: Array<{
    actor?: {
      display?: string;
      reference?: string;
    };
  }>;

  start?: string;
  end?: string;

  period?: {
    start?: string;
    end?: string;
  };
}

interface Permission {
  patient_national_id: string;
  can_read: boolean;
  can_write: boolean;
}


// ============================================================
// HELPERS
// ============================================================

function formatDate(date?: string): string {
  if (!date) {
    return "Not recorded";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not recorded";
  }

  return parsed.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCodeText(
  code: FHIRResource["code"]
): string {
  if (!code) {
    return "Not recorded";
  }

  if (typeof code === "string") {
    return code;
  }

  if (code.text) {
    return code.text;
  }

  return (
    code.coding?.find(
      (coding) => coding.display
    )?.display ||
    "Not recorded"
  );
}

function getPatientName(
  patient?: FHIRResource
): string {
  if (!patient?.name?.length) {
    return "Patient";
  }

  const name = patient.name[0];

  if (name.text) {
    return name.text;
  }

  const given =
    name.given?.join(" ") || "";

  const family =
    name.family || "";

  return `${given} ${family}`.trim() || "Patient";
}


// ============================================================
// COMPONENT
// ============================================================

export default function ExternalPatientRecords() {
  const [searchParams] = useSearchParams();

  const nationalId =
    searchParams.get("nationalId") || "";


  // ==========================================================
  // DATA STATE
  // ==========================================================

  const [bundle, setBundle] =
    useState<FHIRBundle | null>(null);

  const [permission, setPermission] =
    useState<Permission | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================================
  // SCAN VIEW STATE
  // ==========================================================

  const [
    openingScanId,
    setOpeningScanId,
  ] = useState<string | null>(null);


  // ==========================================================
  // MEDICAL RECORD FORM
  // ==========================================================

  const [
    medicalRecordText,
    setMedicalRecordText,
  ] = useState("");

  const [
    writingMedicalRecord,
    setWritingMedicalRecord,
  ] = useState(false);

  const [
    medicalRecordMessage,
    setMedicalRecordMessage,
  ] = useState("");

  const [
    medicalRecordError,
    setMedicalRecordError,
  ] = useState("");


  // ==========================================================
  // LAB OBSERVATION FORM
  // ==========================================================

  const [
    observationCode,
    setObservationCode,
  ] = useState("");

  const [
    observationValue,
    setObservationValue,
  ] = useState("");

  const [
    observationStatus,
    setObservationStatus,
  ] = useState("final");

  const [
    observationReferenceRange,
    setObservationReferenceRange,
  ] = useState("");

  const [
    observationLaboratory,
    setObservationLaboratory,
  ] = useState("");

  const [
    creatingObservation,
    setCreatingObservation,
  ] = useState(false);

  const [
    observationMessage,
    setObservationMessage,
  ] = useState("");

  const [
    observationError,
    setObservationError,
  ] = useState("");


  // ==========================================================
  // PRESCRIPTION FORM
  // ==========================================================

  const [
    doctorName,
    setDoctorName,
  ] = useState("");

  const [
    medicineName,
    setMedicineName,
  ] = useState("");

  const [
    dosage,
    setDosage,
  ] = useState("");

  const [
    frequency,
    setFrequency,
  ] = useState("");

  const [
    duration,
    setDuration,
  ] = useState("");

  const [
    prescriptionInstructions,
    setPrescriptionInstructions,
  ] = useState("");

  const [
    creatingPrescription,
    setCreatingPrescription,
  ] = useState(false);

  const [
    prescriptionMessage,
    setPrescriptionMessage,
  ] = useState("");

  const [
    prescriptionError,
    setPrescriptionError,
  ] = useState("");


  // ==========================================================
  // APPOINTMENT FORM
  // ==========================================================

  const [
    appointmentDoctor,
    setAppointmentDoctor,
  ] = useState("");

  const [
    appointmentDate,
    setAppointmentDate,
  ] = useState("");

  const [
    appointmentTime,
    setAppointmentTime,
  ] = useState("");

  const [
    appointmentDescription,
    setAppointmentDescription,
  ] = useState("");

  const [
    appointmentStatus,
    setAppointmentStatus,
  ] = useState("booked");

  const [
    creatingAppointment,
    setCreatingAppointment,
  ] = useState(false);

  const [
    appointmentMessage,
    setAppointmentMessage,
  ] = useState("");

  const [
    appointmentError,
    setAppointmentError,
  ] = useState("");


  // ==========================================================
  // SCAN UPLOAD FORM
  // ==========================================================

  const [
    scanFile,
    setScanFile,
  ] = useState<File | null>(null);

  const [
    scanType,
    setScanType,
  ] = useState("");

  const [
    scanDescription,
    setScanDescription,
  ] = useState("");

  const [
    uploadingScan,
    setUploadingScan,
  ] = useState(false);

  const [
    scanMessage,
    setScanMessage,
  ] = useState("");

  const [
    scanError,
    setScanError,
  ] = useState("");


  // ==========================================================
  // LOAD AUTHORISED PATIENT
  // ==========================================================

  useEffect(() => {
    async function loadRecords() {
      if (!nationalId) {
        setError(
          "No patient National ID was supplied."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const permissions =
          await apiRequest<Permission[]>(
            "/access-requests/mine"
          );

        const currentPermission =
          permissions.find(
            (item) =>
              item.patient_national_id ===
              nationalId
          );

        if (!currentPermission) {
          throw new Error(
            "This patient is not authorised for this external system."
          );
        }

        if (
          !currentPermission.can_read
        ) {
          throw new Error(
            "Read access has not been granted for this patient."
          );
        }

        setPermission(
          currentPermission
        );

        const patientBundle =
          await apiRequest<FHIRBundle>(
            `/fhir/patient/${encodeURIComponent(
              nationalId
            )}/bundle`
          );

        setBundle(
          patientBundle
        );

      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load the patient record."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, [nationalId]);


  // ==========================================================
  // PARSE BUNDLE
  // ==========================================================

  const resources =
    bundle?.entry
      ?.map(
        (entry) =>
          entry.resource
      )
      .filter(
        (
          resource
        ): resource is FHIRResource =>
          Boolean(resource)
      ) || [];


  const patientResource =
    resources.find(
      (resource) =>
        resource.resourceType ===
        "Patient"
    );


  const medicalRecords =
    resources.filter(
      (resource) =>
        resource.resourceType ===
        "DiagnosticReport"
    );


  const observations =
    resources.filter(
      (resource) =>
        resource.resourceType ===
        "Observation"
    );


  const appointments =
    resources.filter(
      (resource) =>
        resource.resourceType ===
        "Appointment"
    );


  const prescriptions =
    resources.filter(
      (resource) =>
        resource.resourceType ===
        "MedicationRequest"
    );


  const scans =
    resources.filter(
      (resource) =>
        resource.resourceType ===
        "DocumentReference"
    );


  // ==========================================================
  // REFRESH BUNDLE
  // ==========================================================

  async function refreshBundle() {
    const updatedBundle =
      await apiRequest<FHIRBundle>(
        `/fhir/patient/${encodeURIComponent(
          nationalId
        )}/bundle`
      );

    setBundle(
      updatedBundle
    );
  }


  // ==========================================================
  // CREATE MEDICAL RECORD
  // ==========================================================

  async function createMedicalRecord() {
    if (!medicalRecordText.trim()) {
      setMedicalRecordError(
        "Please enter the medical record information."
      );

      setMedicalRecordMessage("");

      return;
    }

    try {
      setWritingMedicalRecord(true);

      setMedicalRecordError("");
      setMedicalRecordMessage("");

      await apiRequest(
        "/fhir/medical-record",
        {
          method: "POST",

          body: JSON.stringify({
            resourceType:
              "DiagnosticReport",

            subject: {
              reference:
                `Patient/${nationalId}`,
            },

            conclusion:
              medicalRecordText.trim(),
          }),
        }
      );

      setMedicalRecordMessage(
        "Medical record added successfully."
      );

      setMedicalRecordText("");

      await refreshBundle();

    } catch (err) {
      setMedicalRecordError(
        err instanceof Error
          ? err.message
          : "Could not add the medical record."
      );
    } finally {
      setWritingMedicalRecord(false);
    }
  }


  // ==========================================================
  // CREATE LAB OBSERVATION
  // ==========================================================

  async function createObservation() {
    if (!observationCode.trim()) {
      setObservationError(
        "Please enter the test name."
      );

      return;
    }

    if (!observationValue.trim()) {
      setObservationError(
        "Please enter the observation result."
      );

      return;
    }

    try {
      setCreatingObservation(true);

      setObservationError("");
      setObservationMessage("");

      await apiRequest(
        "/fhir/observation",
        {
          method: "POST",

          body: JSON.stringify({
            resourceType:
              "Observation",

            status:
              observationStatus,

            code:
              observationCode.trim(),

            value:
              observationValue.trim(),

            subject: {
              reference:
                `Patient/${nationalId}`,
            },

            referenceRange: {
              text:
                observationReferenceRange.trim() ||
                "Not specified",
            },

            laboratory:
              observationLaboratory.trim() ||
              "External Laboratory",
          }),
        }
      );

      setObservationMessage(
        "Lab observation added successfully."
      );

      setObservationCode("");
      setObservationValue("");
      setObservationReferenceRange("");
      setObservationLaboratory("");

      await refreshBundle();

    } catch (err) {
      setObservationError(
        err instanceof Error
          ? err.message
          : "Could not add the lab observation."
      );
    } finally {
      setCreatingObservation(false);
    }
  }


  // ==========================================================
  // CREATE PRESCRIPTION
  // ==========================================================

  async function createPrescription() {
    if (!doctorName.trim()) {
      setPrescriptionError(
        "Please enter the doctor's name."
      );

      return;
    }

    if (!medicineName.trim()) {
      setPrescriptionError(
        "Please enter the medicine name."
      );

      return;
    }

    if (!dosage.trim()) {
      setPrescriptionError(
        "Please enter the dosage."
      );

      return;
    }

    if (!frequency.trim()) {
      setPrescriptionError(
        "Please enter the frequency."
      );

      return;
    }

    if (!duration.trim()) {
      setPrescriptionError(
        "Please enter the duration."
      );

      return;
    }

    if (!prescriptionInstructions.trim()) {
      setPrescriptionError(
        "Please enter the instructions."
      );

      return;
    }

    try {
      setCreatingPrescription(true);

      setPrescriptionError("");
      setPrescriptionMessage("");

      await apiRequest(
        "/fhir/prescription",
        {
          method: "POST",

          body: JSON.stringify({
            resourceType:
              "MedicationRequest",

            status:
              "active",

            subject: {
              reference:
                `Patient/${nationalId}`,
            },

            doctor_name:
              doctorName.trim(),

            medicine_name:
              medicineName.trim(),

            dosage:
              dosage.trim(),

            frequency:
              frequency.trim(),

            duration:
              duration.trim(),

            instructions:
              prescriptionInstructions.trim(),
          }),
        }
      );

      setPrescriptionMessage(
        "Prescription added successfully."
      );

      setDoctorName("");
      setMedicineName("");
      setDosage("");
      setFrequency("");
      setDuration("");
      setPrescriptionInstructions("");

      await refreshBundle();

    } catch (err) {
      setPrescriptionError(
        err instanceof Error
          ? err.message
          : "Could not add the prescription."
      );
    } finally {
      setCreatingPrescription(false);
    }
  }


  // ==========================================================
  // CREATE APPOINTMENT
  // ==========================================================

  async function createAppointment() {
    if (!appointmentDoctor.trim()) {
      setAppointmentError(
        "Please enter the doctor's name."
      );

      return;
    }

    if (!appointmentDate) {
      setAppointmentError(
        "Please select an appointment date."
      );

      return;
    }

    if (!appointmentTime) {
      setAppointmentError(
        "Please select an appointment time."
      );

      return;
    }

    try {
      setCreatingAppointment(true);

      setAppointmentError("");
      setAppointmentMessage("");

      await apiRequest(
        "/fhir/appointment",
        {
          method: "POST",

          body: JSON.stringify({
            resourceType:
              "Appointment",

            status:
              appointmentStatus,

            subject: {
              reference:
                `Patient/${nationalId}`,
            },

            doctor_name:
              appointmentDoctor.trim(),

            appointment_date:
              appointmentDate,

            appointment_time:
              appointmentTime,

            description:
              appointmentDescription.trim(),
          }),
        }
      );

      setAppointmentMessage(
        "Appointment added successfully."
      );

      setAppointmentDoctor("");
      setAppointmentDate("");
      setAppointmentTime("");
      setAppointmentDescription("");

      await refreshBundle();

    } catch (err) {
      setAppointmentError(
        err instanceof Error
          ? err.message
          : "Could not add the appointment."
      );
    } finally {
      setCreatingAppointment(false);
    }
  }


  // ==========================================================
  // UPLOAD MEDICAL SCAN
  // ==========================================================

  async function uploadMedicalScan() {
    if (!scanFile) {
      setScanError(
        "Please select a medical scan."
      );

      return;
    }

    try {
      setUploadingScan(true);

      setScanError("");
      setScanMessage("");

      const formData =
        new FormData();

      formData.append(
        "file",
        scanFile
      );

      if (scanType.trim()) {
        formData.append(
          "scan_type",
          scanType.trim()
        );
      }

      if (scanDescription.trim()) {
        formData.append(
          "description",
          scanDescription.trim()
        );
      }

      await apiRequest(
        `/fhir/patient/${encodeURIComponent(
          nationalId
        )}/scan`,
        {
          method: "POST",
          body: formData,
        }
      );

      setScanMessage(
        "Medical scan uploaded successfully."
      );

      setScanFile(null);
      setScanType("");
      setScanDescription("");

      await refreshBundle();

    } catch (err) {
      setScanError(
        err instanceof Error
          ? err.message
          : "Could not upload the medical scan."
      );
    } finally {
      setUploadingScan(false);
    }
  }


  // ==========================================================
  // OPEN AUTHENTICATED SCAN
  // ==========================================================

  async function openAuthenticatedScan(
    scanId: string
  ) {
    const scanWindow =
      window.open(
        "about:blank",
        "_blank"
      );

    if (!scanWindow) {
      window.alert(
        "The browser blocked the scan window. Please allow pop-ups for this application."
      );

      return;
    }

    try {
      setOpeningScanId(
        scanId
      );

      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        scanWindow.close();

        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const baseUrl =
        import.meta.env
          .VITE_API_BASE_URL ||
        "http://127.0.0.1:8000";

      const fileUrl =
        `${baseUrl}/fhir/patient/` +
        `${encodeURIComponent(
          nationalId
        )}` +
        `/scans/${encodeURIComponent(
          scanId
        )}/file`;

      const response =
        await fetch(
          fileUrl,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        scanWindow.close();

        if (
          response.status === 401
        ) {
          throw new Error(
            "Your session has expired. Please sign in again."
          );
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            "You do not have permission to view this scan."
          );
        }

        if (
          response.status === 404
        ) {
          throw new Error(
            "The medical scan could not be found."
          );
        }

        throw new Error(
          `Unable to retrieve the medical scan. Server returned ${response.status}.`
        );
      }

      const blob =
        await response.blob();

      if (!blob.size) {
        scanWindow.close();

        throw new Error(
          "The medical scan returned an empty file."
        );
      }

      const blobUrl =
        URL.createObjectURL(
          blob
        );

      scanWindow.location.href =
        blobUrl;

      window.setTimeout(
        () => {
          URL.revokeObjectURL(
            blobUrl
          );
        },
        5 * 60 * 1000
      );

    } catch (err) {
      try {
        scanWindow.close();
      } catch {
        // Ignore close errors.
      }

      window.alert(
        err instanceof Error
          ? err.message
          : "Unable to open the medical scan."
      );
    } finally {
      setOpeningScanId(
        null
      );
    }
  }


  const patientName =
    getPatientName(
      patientResource
    );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <AppShell
      role="EXTERNAL_SYSTEM"
      title="Authorised Records"
      subtitle="Patient information available under active permissions."
    >

      <Link
        className="back-link"
        to="/external"
      >
        <FaArrowLeft />

        Back to integration dashboard
      </Link>


      {loading && (
        <section className="content-card">

          <div className="card-heading">

            <div>

              <span className="section-label">
                FHIR RECORD
              </span>

              <h3>
                Loading authorised data...
              </h3>

            </div>

          </div>

          <p className="muted-text">
            Retrieving the patient record.
          </p>

        </section>
      )}


      {!loading && error && (
        <section className="content-card locked-state">

          <FaLock />

          <h2>
            Access unavailable
          </h2>

          <p>
            {error}
          </p>

          <Link
            className="primary-button"
            to="/external/search"
          >
            Request access
          </Link>

        </section>
      )}


      {!loading &&
        !error &&
        bundle &&
        permission && (
          <>

            {/* ==================================================
                AUTHORISED RECORD
            ================================================== */}

            <div className="demo-banner">

              <FaCheckCircle />

              <div>

                <strong>
                  Authorised FHIR access
                </strong>

                <span>
                  Data is visible because the
                  patient has granted this external
                  system permission.
                </span>

              </div>

            </div>


            <section className="content-card authorised-record">

              <div className="record-header">

                <div className="request-icon">
                  <FaUserMd />
                </div>

                <div>

                  <span className="section-label">
                    PATIENT RECORD
                  </span>

                  <h2>
                    {patientName}
                  </h2>

                  <span>
                    National ID: {nationalId}
                  </span>

                </div>

                <div className="permission-tags">

                  {permission.can_read && (
                    <span className="permission-tag allowed">

                      <FaCheckCircle />

                      Read

                    </span>
                  )}

                  {permission.can_write && (
                    <span className="permission-tag allowed">

                      <FaPen />

                      Write

                    </span>
                  )}

                </div>

              </div>


              <div className="authorised-data">

                {/* =================================================
                    CLINICAL SUMMARY
                ================================================== */}

                <div className="data-section">

                  <div className="data-section-heading">

                    <FaFileMedical />

                    <h3>
                      Clinical summary
                    </h3>

                  </div>

                  <div className="details-grid">

                    <div className="detail-item">

                      <span>
                        Date of birth
                      </span>

                      <strong>
                        {formatDate(
                          patientResource?.birthDate
                        )}
                      </strong>

                    </div>

                    <div className="detail-item">

                      <span>
                        Gender
                      </span>

                      <strong>
                        {patientResource?.gender ||
                          "Not recorded"}
                      </strong>

                    </div>

                    <div className="detail-item">

                      <span>
                        Medical records
                      </span>

                      <strong>
                        {medicalRecords.length}
                      </strong>

                    </div>

                    <div className="detail-item">

                      <span>
                        Lab observations
                      </span>

                      <strong>
                        {observations.length}
                      </strong>

                    </div>

                    <div className="detail-item">

                      <span>
                        Prescriptions
                      </span>

                      <strong>
                        {prescriptions.length}
                      </strong>

                    </div>

                    <div className="detail-item">

                      <span>
                        Appointments
                      </span>

                      <strong>
                        {appointments.length}
                      </strong>

                    </div>

                    <div className="detail-item">

                      <span>
                        Medical scans
                      </span>

                      <strong>
                        {scans.length}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    EXISTING MEDICAL RECORDS
                ================================================== */}

                <div className="data-section">

                  <div className="data-section-heading">

                    <FaFileMedical />

                    <h3>
                      Medical records
                    </h3>

                  </div>

                  {medicalRecords.length === 0 ? (

                    <p className="muted-text">
                      No medical records available.
                    </p>

                  ) : (

                    <div className="table-wrap">

                      <table className="modern-table">

                        <thead>

                          <tr>

                            <th>
                              Date
                            </th>

                            <th>
                              Type
                            </th>

                            <th>
                              Summary
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {medicalRecords.map(
                            (record) => (

                              <tr
                                key={record.id}
                              >

                                <td>
                                  {formatDate(
                                    record.authoredOn
                                  )}
                                </td>

                                <td>
                                  Diagnostic report
                                </td>

                                <td>
                                  {record.conclusion ||
                                    getCodeText(
                                      record.code
                                    )}
                                </td>

                              </tr>

                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  )}

                </div>


                {/* =================================================
                    EXISTING OBSERVATIONS
                ================================================== */}

                <div className="data-section">

                  <div className="data-section-heading">

                    <FaFlask />

                    <h3>
                      Laboratory observations
                    </h3>

                  </div>

                  {observations.length === 0 ? (

                    <p className="muted-text">
                      No observations available.
                    </p>

                  ) : (

                    <div className="table-wrap">

                      <table className="modern-table">

                        <thead>

                          <tr>

                            <th>
                              Test
                            </th>

                            <th>
                              Result
                            </th>

                            <th>
                              Status
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {observations.map(
                            (observation) => (

                              <tr
                                key={observation.id}
                              >

                                <td>
                                  {getCodeText(
                                    observation.code
                                  )}
                                </td>

                                <td>
                                  {observation.value ??
                                    "Not recorded"}
                                </td>

                                <td>
                                  {observation.status ||
                                    "Not recorded"}
                                </td>

                              </tr>

                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  )}

                </div>


                {/* =================================================
                    EXISTING PRESCRIPTIONS
                ================================================== */}

                <div className="data-section">

                  <div className="data-section-heading">

                    <FaPrescriptionBottleAlt />

                    <h3>
                      Prescriptions
                    </h3>

                  </div>

                  {prescriptions.length === 0 ? (

                    <p className="muted-text">
                      No prescriptions available.
                    </p>

                  ) : (

                    <div className="table-wrap">

                      <table className="modern-table">

                        <thead>

                          <tr>

                            <th>
                              Medication
                            </th>

                            <th>
                              Instructions
                            </th>

                            <th>
                              Date
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {prescriptions.map(
                            (prescription) => (

                              <tr
                                key={prescription.id}
                              >

                                <td>
                                  {
                                    prescription
                                      .medicationCodeableConcept
                                      ?.text ||
                                    "Medication"
                                  }
                                </td>

                                <td>
                                  {
                                    prescription
                                      .dosageInstruction?.[0]
                                      ?.text ||
                                    "Not recorded"
                                  }
                                </td>

                                <td>
                                  {formatDate(
                                    prescription.authoredOn
                                  )}
                                </td>

                              </tr>

                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  )}

                </div>


                {/* =================================================
                    EXISTING APPOINTMENTS
                ================================================== */}

                <div className="data-section">

                  <div className="data-section-heading">

                    <FaCalendarCheck />

                    <h3>
                      Appointments
                    </h3>

                  </div>

                  {appointments.length === 0 ? (

                    <p className="muted-text">
                      No appointments available.
                    </p>

                  ) : (

                    <div className="table-wrap">

                      <table className="modern-table">

                        <thead>

                          <tr>

                            <th>
                              Date
                            </th>

                            <th>
                              Provider
                            </th>

                            <th>
                              Type
                            </th>

                            <th>
                              Status
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {appointments.map(
                            (appointment) => (

                              <tr
                                key={appointment.id}
                              >

                                <td>
                                  {formatDate(
                                    appointment.start
                                  )}
                                </td>

                                <td>
                                  {
                                    appointment
                                      .participant?.[0]
                                      ?.actor
                                      ?.display ||
                                    "Not recorded"
                                  }
                                </td>

                                <td>
                                  {
                                    appointment
                                      .appointmentType
                                      ?.text ||
                                    "Appointment"
                                  }
                                </td>

                                <td>
                                  {appointment.status ||
                                    "Not recorded"}
                                </td>

                              </tr>

                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  )}

                </div>


                {/* =================================================
                    EXISTING MEDICAL SCANS
                ================================================== */}

                <div className="data-section">

                  <div className="data-section-heading">

                    <FaFileMedical />

                    <h3>
                      Medical scans
                    </h3>

                  </div>

                  {scans.length === 0 ? (

                    <p className="muted-text">
                      No medical scans available.
                    </p>

                  ) : (

                    <div className="table-wrap">

                      <table className="modern-table">

                        <thead>

                          <tr>

                            <th>
                              File
                            </th>

                            <th>
                              Type
                            </th>

                            <th>
                              Action
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {scans.map(
                            (scan) => {

                              const attachment =
                                scan
                                  .content?.[0]
                                  ?.attachment;

                              const scanId =
                                scan.id;

                              if (!scanId) {

                                return (
                                  <tr
                                    key={`${nationalId}-${attachment?.title || "scan"}`}
                                  >

                                    <td>
                                      {attachment
                                        ?.title ||
                                        "Medical scan"}
                                    </td>

                                    <td>
                                      {attachment
                                        ?.contentType ||
                                        "Unknown"}
                                    </td>

                                    <td>
                                      <span className="muted-text">
                                        Scan unavailable
                                      </span>
                                    </td>

                                  </tr>
                                );
                              }

                              return (
                                <tr
                                  key={scanId}
                                >

                                  <td>
                                    {attachment
                                      ?.title ||
                                      "Medical scan"}
                                  </td>

                                  <td>
                                    {attachment
                                      ?.contentType ||
                                      "Unknown"}
                                  </td>

                                  <td>

                                    <button
                                      type="button"
                                      className="table-action"
                                      disabled={
                                        openingScanId ===
                                        scanId
                                      }
                                      onClick={() =>
                                        openAuthenticatedScan(
                                          scanId
                                        )
                                      }
                                    >

                                      {openingScanId ===
                                      scanId
                                        ? "Opening..."
                                        : "Open scan"}

                                    </button>

                                  </td>

                                </tr>
                              );
                            }
                          )}

                        </tbody>

                      </table>

                    </div>

                  )}

                </div>

              </div>


              {/* ==================================================
                  WRITE SECTION
              ================================================== */}

              {permission.can_write && (
                <>

                  {/* ================================================
                      ADD MEDICAL RECORD
                  ================================================= */}

                  <section className="content-card">

                    <div className="card-heading">

                      <div>

                        <span className="section-label">
                          WRITE ACCESS
                        </span>

                        <h3>
                          Add medical record
                        </h3>

                      </div>

                    </div>

                    <div className="access-form">

                      <label>

                        Clinical information

                        <textarea
                          value={
                            medicalRecordText
                          }
                          onChange={(event) =>
                            setMedicalRecordText(
                              event.target.value
                            )
                          }
                          placeholder="Enter diagnosis, clinical findings, treatment information, or other medical record details."
                          rows={6}
                        />

                      </label>

                      {medicalRecordError && (
                        <div className="error-message">
                          {medicalRecordError}
                        </div>
                      )}

                      {medicalRecordMessage && (
                        <div className="success-message">

                          <FaCheckCircle />

                          <div>
                            <strong>
                              {
                                medicalRecordMessage
                              }
                            </strong>
                          </div>

                        </div>
                      )}

                      <button
                        type="button"
                        className="primary-button"
                        disabled={
                          writingMedicalRecord
                        }
                        onClick={
                          createMedicalRecord
                        }
                      >

                        <FaPen />

                        {writingMedicalRecord
                          ? "Saving..."
                          : "Add medical record"}

                      </button>

                    </div>

                  </section>


                  {/* ================================================
                      ADD LAB OBSERVATION
                  ================================================= */}

                  <section className="content-card">

                    <div className="card-heading">

                      <div>

                        <span className="section-label">
                          WRITE ACCESS
                        </span>

                        <h3>
                          Add lab observation
                        </h3>

                      </div>

                    </div>

                    <div className="access-form">

                      <label>

                        Test name

                        <input
                          value={
                            observationCode
                          }
                          onChange={(event) =>
                            setObservationCode(
                              event.target.value
                            )
                          }
                          placeholder="e.g. Blood glucose"
                        />

                      </label>


                      <label>

                        Result

                        <input
                          value={
                            observationValue
                          }
                          onChange={(event) =>
                            setObservationValue(
                              event.target.value
                            )
                          }
                          placeholder="e.g. 5.4 mmol/L"
                        />

                      </label>


                      <label>

                        Status

                        <select
                          value={
                            observationStatus
                          }
                          onChange={(event) =>
                            setObservationStatus(
                              event.target.value
                            )
                          }
                        >

                          <option value="final">
                            Final
                          </option>

                          <option value="preliminary">
                            Preliminary
                          </option>

                          <option value="amended">
                            Amended
                          </option>

                        </select>

                      </label>


                      <label>

                        Reference range

                        <input
                          value={
                            observationReferenceRange
                          }
                          onChange={(event) =>
                            setObservationReferenceRange(
                              event.target.value
                            )
                          }
                          placeholder="e.g. 3.9–5.5 mmol/L"
                        />

                      </label>


                      <label>

                        Laboratory

                        <input
                          value={
                            observationLaboratory
                          }
                          onChange={(event) =>
                            setObservationLaboratory(
                              event.target.value
                            )
                          }
                          placeholder="Laboratory name"
                        />

                      </label>


                      {observationError && (
                        <div className="error-message">
                          {observationError}
                        </div>
                      )}


                      {observationMessage && (
                        <div className="success-message">

                          <FaCheckCircle />

                          <div>
                            <strong>
                              {
                                observationMessage
                              }
                            </strong>
                          </div>

                        </div>
                      )}


                      <button
                        type="button"
                        className="primary-button"
                        disabled={
                          creatingObservation
                        }
                        onClick={
                          createObservation
                        }
                      >

                        <FaFlask />

                        {creatingObservation
                          ? "Saving..."
                          : "Add lab observation"}

                      </button>

                    </div>

                  </section>


                  {/* ================================================
                      ADD PRESCRIPTION
                  ================================================= */}

                  <section className="content-card">

                    <div className="card-heading">

                      <div>

                        <span className="section-label">
                          WRITE ACCESS
                        </span>

                        <h3>
                          Add prescription
                        </h3>

                      </div>

                    </div>


                    <div className="access-form">

                      <label>

                        Doctor name

                        <input
                          value={doctorName}
                          onChange={(event) =>
                            setDoctorName(
                              event.target.value
                            )
                          }
                          placeholder="Doctor's name"
                        />

                      </label>


                      <label>

                        Medicine name

                        <input
                          value={medicineName}
                          onChange={(event) =>
                            setMedicineName(
                              event.target.value
                            )
                          }
                          placeholder="Medicine name"
                        />

                      </label>


                      <label>

                        Dosage

                        <input
                          value={dosage}
                          onChange={(event) =>
                            setDosage(
                              event.target.value
                            )
                          }
                          placeholder="e.g. 10 mg"
                        />

                      </label>


                      <label>

                        Frequency

                        <input
                          value={frequency}
                          onChange={(event) =>
                            setFrequency(
                              event.target.value
                            )
                          }
                          placeholder="e.g. Once daily"
                        />

                      </label>


                      <label>

                        Duration

                        <input
                          value={duration}
                          onChange={(event) =>
                            setDuration(
                              event.target.value
                            )
                          }
                          placeholder="e.g. 30 days"
                        />

                      </label>


                      <label>

                        Instructions

                        <textarea
                          value={
                            prescriptionInstructions
                          }
                          onChange={(event) =>
                            setPrescriptionInstructions(
                              event.target.value
                            )
                          }
                          placeholder="Medication instructions"
                          rows={4}
                        />

                      </label>


                      {prescriptionError && (
                        <div className="error-message">
                          {
                            prescriptionError
                          }
                        </div>
                      )}


                      {prescriptionMessage && (
                        <div className="success-message">

                          <FaCheckCircle />

                          <div>
                            <strong>
                              {
                                prescriptionMessage
                              }
                            </strong>
                          </div>

                        </div>
                      )}


                      <button
                        type="button"
                        className="primary-button"
                        disabled={
                          creatingPrescription
                        }
                        onClick={
                          createPrescription
                        }
                      >

                        <FaPrescriptionBottleAlt />

                        {creatingPrescription
                          ? "Saving..."
                          : "Add prescription"}

                      </button>

                    </div>

                  </section>


                  {/* ================================================
                      ADD APPOINTMENT
                  ================================================= */}

                  <section className="content-card">

                    <div className="card-heading">

                      <div>

                        <span className="section-label">
                          WRITE ACCESS
                        </span>

                        <h3>
                          Add appointment
                        </h3>

                      </div>

                    </div>


                    <div className="access-form">

                      <label>

                        Doctor name

                        <input
                          value={
                            appointmentDoctor
                          }
                          onChange={(event) =>
                            setAppointmentDoctor(
                              event.target.value
                            )
                          }
                          placeholder="Doctor's name"
                        />

                      </label>


                      <label>

                        Appointment date

                        <input
                          type="date"
                          value={
                            appointmentDate
                          }
                          onChange={(event) =>
                            setAppointmentDate(
                              event.target.value
                            )
                          }
                        />

                      </label>


                      <label>

                        Appointment time

                        <input
                          type="time"
                          value={
                            appointmentTime
                          }
                          onChange={(event) =>
                            setAppointmentTime(
                              event.target.value
                            )
                          }
                        />

                      </label>


                      <label>

                        Status

                        <select
                          value={
                            appointmentStatus
                          }
                          onChange={(event) =>
                            setAppointmentStatus(
                              event.target.value
                            )
                          }
                        >

                          <option value="booked">
                            Booked
                          </option>

                          <option value="pending">
                            Pending
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>

                        </select>

                      </label>


                      <label>

                        Description

                        <textarea
                          value={
                            appointmentDescription
                          }
                          onChange={(event) =>
                            setAppointmentDescription(
                              event.target.value
                            )
                          }
                          placeholder="Appointment description"
                          rows={4}
                        />

                      </label>


                      {appointmentError && (
                        <div className="error-message">
                          {appointmentError}
                        </div>
                      )}


                      {appointmentMessage && (
                        <div className="success-message">

                          <FaCheckCircle />

                          <div>
                            <strong>
                              {
                                appointmentMessage
                              }
                            </strong>
                          </div>

                        </div>
                      )}


                      <button
                        type="button"
                        className="primary-button"
                        disabled={
                          creatingAppointment
                        }
                        onClick={
                          createAppointment
                        }
                      >

                        <FaCalendarCheck />

                        {creatingAppointment
                          ? "Saving..."
                          : "Add appointment"}

                      </button>

                    </div>

                  </section>


                  {/* ================================================
                      UPLOAD MEDICAL SCAN
                  ================================================= */}

                  <section className="content-card">

                    <div className="card-heading">

                      <div>

                        <span className="section-label">
                          WRITE ACCESS
                        </span>

                        <h3>
                          Upload medical scan
                        </h3>

                      </div>

                    </div>


                    <div className="access-form">

                      <label>

                        Scan file

                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.dcm,image/jpeg,image/png,image/dicom"
                          onChange={(event) =>
                            setScanFile(
                              event.target.files?.[0] ||
                              null
                            )
                          }
                        />

                      </label>


                      <label>

                        Scan type

                        <input
                          value={
                            scanType
                          }
                          onChange={(event) =>
                            setScanType(
                              event.target.value
                            )
                          }
                          placeholder="e.g. CT, MRI, X-ray"
                        />

                      </label>


                      <label>

                        Description

                        <textarea
                          value={
                            scanDescription
                          }
                          onChange={(event) =>
                            setScanDescription(
                              event.target.value
                            )
                          }
                          placeholder="Describe the medical scan"
                          rows={4}
                        />

                      </label>


                      {scanError && (
                        <div className="error-message">
                          {scanError}
                        </div>
                      )}


                      {scanMessage && (
                        <div className="success-message">

                          <FaCheckCircle />

                          <div>
                            <strong>
                              {scanMessage}
                            </strong>
                          </div>

                        </div>
                      )}


                      <button
                        type="button"
                        className="primary-button"
                        disabled={
                          uploadingScan
                        }
                        onClick={
                          uploadMedicalScan
                        }
                      >

                        <FaUpload />

                        {uploadingScan
                          ? "Uploading..."
                          : "Upload medical scan"}

                      </button>

                    </div>

                  </section>

                </>
              )}


              {/* ==================================================
                  SECURITY
              ================================================== */}

              <div className="security-callout">

                <FaLock />

                <div>

                  <strong>
                    Patient-controlled
                    permissions
                  </strong>

                  <span>
                    Read and write permissions are
                    enforced independently by the
                    backend. The external system can
                    only create clinical data or upload
                    scans when the patient has granted
                    write access.
                  </span>

                </div>

              </div>

            </section>

          </>
        )}

    </AppShell>
  );
}