import type { AccessRequest } from "./types";

export const PATIENT = {
  name: "Eyethu Njemla",
  initials: "EN",
  nationalId: "••••••••••••",
  dob: "20 September 1969",
  gender: "Female",
  province: "Western Cape",
  bloodGroup: "O+",
  medicalAid: "Discovery Health",
  phone: "••••••••••",
  address: "••••••••••",
};

export const MEDICAL_VISITS = [
  {
    date: "01 May 2026",
    facility: "Netcare Hospital",
    doctor: "Dr. Adams",
    diagnosis: "Routine Checkup",
    pdf: "/documents/routine-checkup-report.pdf",
  },
  {
    date: "14 April 2026",
    facility: "Netcare Hospital",
    doctor: "Dr. Adams",
    diagnosis: "Hypertension",
    pdf: "/documents/hypertension-report.pdf",
  },
  {
    date: "18 January 2024",
    facility: "DR Smith Surgery",
    doctor: "Dr. Smith",
    diagnosis: "Asthma",
    pdf: "/documents/asthma-report.pdf",
  },
  {
    date: "20 July 2020",
    facility: "Tygerberg Hospital",
    doctor: "Dr. Nkewu",
    diagnosis: "Corona Virus",
    pdf: "/documents/covid-report-1.pdf",
  },
];

export const LAB_RESULTS = [
  { test: "Blood Pressure Test", date: "01 May 2026", facility: "Groote Schuur Hospital", result: "128/82 mmHg", status: "Completed" },
  { test: "Cholesterol Screening", date: "22 April 2026", facility: "Netcare Hospital", result: "Normal", status: "Completed" },
  { test: "Blood Glucose", date: "10 April 2026", facility: "Tygerberg Hospital", result: "5.8 mmol/L", status: "Completed" },
];

export const APPOINTMENTS = [
  { date: "14 May 2026", time: "10:00 AM", facility: "Groote Schuur Hospital", doctor: "Dr. Smith", type: "Follow-up consultation", status: "Upcoming" },
  { date: "01 April 2026", time: "09:30 AM", facility: "Tygerberg Hospital", doctor: "Dr. Adams", type: "Routine checkup", status: "Completed" },
  { date: "18 March 2026", time: "14:00 PM", facility: "Netcare Hospital", doctor: "Dr. Williams", type: "Specialist consultation", status: "Completed" },
];

export const PRESCRIPTIONS = [
  { medication: "Amlodipine", dosage: "5 mg", frequency: "Once daily", doctor: "Dr. Adams", duration: "30 days", status: "Active" },
  { medication: "Ventolin Inhaler", dosage: "100 mcg", frequency: "As needed", doctor: "Dr. Smith", duration: "Continuous", status: "Active" },
];

export const SCANS = [
  { type: "Chest X-Ray", facility: "Tygerberg Hospital", date: "10 April 2026", status: "Available" },
  { type: "Ultrasound", facility: "Groote Schuur Hospital", date: "22 February 2026", status: "Available" },
];

export const DEMO_REQUESTS: AccessRequest[] = [
  {
    id: "REQ-1001",
    externalSystem: "Cape Health Connect",
    patientNationalId: "••••••••••••",
    canRead: true,
    canWrite: false,
    status: "PENDING",
    requestedAt: "Today, 14:15",
  },
  {
    id: "REQ-1000",
    externalSystem: "Western Cape Diagnostics",
    patientNationalId: "••••••••••••",
    canRead: true,
    canWrite: true,
    status: "APPROVED",
    requestedAt: "03 Sep 2026, 09:20",
    respondedAt: "03 Sep 2026, 09:42",
  },
];

export function getAccessRequests(): AccessRequest[] {
  const saved = localStorage.getItem("ehr_demo_access_requests");
  if (saved) {
    try {
      return JSON.parse(saved) as AccessRequest[];
    } catch {
      // Reset malformed demo state.
    }
  }
  localStorage.setItem("ehr_demo_access_requests", JSON.stringify(DEMO_REQUESTS));
  return DEMO_REQUESTS;
}

export function saveAccessRequests(requests: AccessRequest[]) {
  localStorage.setItem("ehr_demo_access_requests", JSON.stringify(requests));
}

export function resetDemoState() {
  localStorage.removeItem("ehr_demo_access_requests");
  localStorage.removeItem("ehr_demo_logged_in");
  localStorage.removeItem("ehr_demo_role");
}
