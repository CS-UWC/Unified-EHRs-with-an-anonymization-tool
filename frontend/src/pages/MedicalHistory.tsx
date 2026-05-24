/**
 * Medical History Page
 *
 * This page allows patients to:
 * - View their historical healthcare records
 * - Track diagnoses and treatments
 * - Access prescriptions and laboratory results
 * - View allergies and chronic conditions
 *
 * TypeScript Version
 */

import React from "react";

/* ===================================================== */
/* TYPES                                                  */
/* ===================================================== */

interface MedicalVisit {
  date: string;
  facility: string;
  doctor: string;
  diagnosis: string;
  pdf: string;
}

/* ===================================================== */
/* COMPONENT                                              */
/* ===================================================== */

const MedicalHistory: React.FC = () => {

  /* ===================================================== */
  /* MEDICAL VISITS DATA                                   */
  /* ===================================================== */

  const medicalVisits: MedicalVisit[] = [

    {
      date: "01 May 2026",
      facility: "Netcare Hospital",
      doctor: "Dr. Adams",
      diagnosis: "Routine Checkup",
      pdf: "./documents/routine-checkup-report.pdf",
    },

    {
      date: "14 April 2026",
      facility: "Netcare Hospital",
      doctor: "Dr. Adams",
      diagnosis: "Hypertension",
      pdf: "./documents/hypertension-report.pdf",
    },

    {
      date: "18 January 2024",
      facility: "DR Smith Surgery",
      doctor: "Dr Smith",
      diagnosis: "Asthma",
      pdf: "./documents/asthma-report.pdf",
    },

    {
      date: "20 July 2020",
      facility: "Tygerberg Hospital",
      doctor: "Dr Nkewu",
      diagnosis: "Corona Virus",
      pdf: "./documents/covid-report-1.pdf",
    },

    {
      date: "19 July 2020",
      facility: "Belhar Day Hospital",
      doctor: "Sister Mlonzi",
      diagnosis: "Corona Virus",
      pdf: "./documents/covid-report-2.pdf",
    },

  ];

  /* ===================================================== */
  /* FUNCTION TO OPEN PDF                                  */
  /* ===================================================== */

  const handleViewPDF = (pdfPath: string): void => {

    window.open(pdfPath, "_blank");

  };

  /* ===================================================== */
  /* JSX                                                   */
  /* ===================================================== */

  return (

    <div className="medical-history-page">

      {/* ===================================================== */}
      {/* PAGE HEADER                                           */}
      {/* ===================================================== */}

      <div className="medical-header">

        <h1>Medical History</h1>

        <p>
          View your unified healthcare records from
          hospitals, clinics, laboratories, and specialists
          across South Africa.
        </p>

      </div>

      {/* ===================================================== */}
      {/* PATIENT SUMMARY CARD                                  */}
      {/* ===================================================== */}

      <section className="patient-summary-card">

        <h2>Patient Summary</h2>

        <div className="summary-grid">

          <div>
            <strong>Patient Name:</strong>
            <p>Eyethu Njemla</p>
          </div>

          <div>
            <strong>Date of Birth:</strong>
            <p>20 September 1969</p>
          </div>

          <div>
            <strong>Blood Group:</strong>
            <p>O+</p>
          </div>

          <div>
            <strong>Primary Doctor:</strong>
            <p>Dr. Smith</p>
          </div>

        </div>

      </section>

      {/* ===================================================== */}
      {/* CHRONIC CONDITIONS SECTION                            */}
      {/* ===================================================== */}

      <section className="medical-card">

        <h2>Chronic Conditions</h2>

        <ul>

          <li>Hypertension</li>

          <li>Asthma</li>

        </ul>

      </section>

      {/* ===================================================== */}
      {/* ALLERGIES SECTION                                     */}
      {/* ===================================================== */}

      <section className="medical-card">

        <h2>Allergies</h2>

        <ul>

          <li>Penicillin</li>

          <li>Dust Allergy</li>

        </ul>

      </section>

      {/* ===================================================== */}
      {/* MEDICAL VISITS TABLE                                  */}
      {/* ===================================================== */}

      <section className="medical-card">

        <h2>Medical Visits</h2>

        <table>

          {/* ===================================================== */}
          {/* TABLE HEADER                                          */}
          {/* ===================================================== */}

          <thead>

            <tr>

              <th>Date</th>

              <th>Facility</th>

              <th>Doctor</th>

              <th>Diagnosis</th>

              <th>Medical Report</th>

            </tr>

          </thead>

          {/* ===================================================== */}
          {/* TABLE BODY                                            */}
          {/* ===================================================== */}

          <tbody>

            {medicalVisits.map((visit: MedicalVisit, index: number) => (

              <tr key={index}>

                <td>{visit.date}</td>

                <td>{visit.facility}</td>

                <td>{visit.doctor}</td>

                <td>{visit.diagnosis}</td>

                <td>

                  <button
                    className="view-pdf-btn"
                    onClick={() => handleViewPDF(visit.pdf)}
                  >
                    View PDF
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>

      {/* ===================================================== */}
      {/* PRESCRIPTIONS SECTION                                 */}
      {/* ===================================================== */}

      <section className="medical-card">

        <h2>Current Prescriptions</h2>

        <table>

          <thead>

            <tr>

              <th>Medication</th>

              <th>Dosage</th>

              <th>Doctor</th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td>Amlodipine</td>

              <td>5mg Daily</td>

              <td>Dr. Adams</td>

            </tr>

            <tr>

              <td>Ventolin Inhaler</td>

              <td>As Needed</td>

              <td>Dr. Smith</td>

            </tr>

          </tbody>

        </table>

      </section>

      {/* ===================================================== */}
      {/* LAB RESULTS SECTION                                   */}
      {/* ===================================================== */}

      <section className="medical-card">

        <h2>Recent Lab Results</h2>

        <table>

          <thead>

            <tr>

              <th>Test</th>

              <th>Date</th>

              <th>Status</th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td>Blood Pressure Test</td>

              <td>01 May 2026</td>

              <td>Completed</td>

            </tr>

            <tr>

              <td>Blood Sugar Test</td>

              <td>10 April 2026</td>

              <td>Completed</td>

            </tr>

          </tbody>

        </table>

      </section>

    </div>

  );

};

export default MedicalHistory;