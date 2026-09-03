"""
FHIR resource mappers.

External systems identify patients using their national ID.

Internal database IDs are used only internally and are
never exposed as the external interoperability identifier.
"""

from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.prescription import Prescription
from app.models.medical_record import MedicalRecord
from app.models.lab_result import LabResult
from app.models.medical_image import MedicalImage

from app.fhir.reference import (
    FHIRReference,
    FHIRReferenceIdentifier
)

from app.fhir.patient import (
    FHIRPatient,
    HumanName,
    Identifier
)

from app.fhir.appointment import (
    FHIRAppointment,
    Participant
)

from app.fhir.medication import (
    FHIRMedicationRequest
)

from app.fhir.medical_record import (
    FHIRMedicalRecord
)

from app.fhir.observation import (
    FHIRObservation
)

from app.fhir.bundle import (
    FHIRBundle,
    BundleEntry
)

from app.fhir.imaging import (
    FHIRDocumentReference
)

# ============================================================
# CONSTANTS
# ============================================================

NATIONAL_ID_SYSTEM = (
    "https://ehr.example.org/national-id"
)


# ============================================================
# PATIENT REFERENCE
# ============================================================

def patient_reference(
    patient: Patient
) -> FHIRReference:

    if not patient.national_id:

        raise ValueError(
            "Patient does not have a national ID."
        )

    national_id = str(
        patient.national_id
    )

    return FHIRReference(

        reference=(
            f"Patient/{national_id}"
        ),

        identifier=FHIRReferenceIdentifier(

            system=NATIONAL_ID_SYSTEM,

            value=national_id

        )

    )


# ============================================================
# EXTRACT NATIONAL ID
# ============================================================

def extract_patient_national_id(
    reference: FHIRReference
) -> str | None:

    # --------------------------------------------------------
    # Preferred method:
    #
    # Patient/{national_id}
    # --------------------------------------------------------

    if reference.reference:

        if not reference.reference.startswith(
            "Patient/"
        ):
            return None

        national_id = (
            reference.reference.split(
                "/",
                1
            )[1]
        )

        if not national_id:
            return None

        # ----------------------------------------------------
        # If identifier is also supplied, verify it matches.
        # ----------------------------------------------------

        if reference.identifier:

            if (
                reference.identifier.value
                != national_id
            ):

                raise ValueError(
                    "Patient reference and identifier "
                    "do not refer to the same patient."
                )

        return national_id

    # --------------------------------------------------------
    # Fallback:
    #
    # identifier.value
    # --------------------------------------------------------

    if reference.identifier:

        return reference.identifier.value

    return None


# ============================================================
# PATIENT -> FHIR
# ============================================================

def patient_to_fhir(
    patient: Patient
) -> FHIRPatient:

    identifiers = []

    if patient.national_id:

        identifiers.append(

            Identifier(

                system=NATIONAL_ID_SYSTEM,

                value=str(
                    patient.national_id
                )

            )

        )

    return FHIRPatient(

        id=(

            str(
                patient.national_id
            )

            if patient.national_id

            else None

        ),

        identifier=identifiers,

        name=[

            HumanName(

                family=patient.user.last_name,

                given=[
                    patient.user.first_name
                ]

            )

        ],

        gender=patient.gender,

        birthDate=(

            str(
                patient.date_of_birth
            )

            if patient.date_of_birth

            else None

        )

    )


# ============================================================
# FHIR PATIENT -> INTERNAL DATA
# ============================================================

def fhir_to_patient_data(
    fhir_patient: FHIRPatient
):

    national_id = None

    if fhir_patient.identifier:

        national_id = (
            fhir_patient.identifier[0].value
        )

    date_of_birth = None

    if fhir_patient.birthDate:

        from datetime import date

        date_of_birth = date.fromisoformat(
            fhir_patient.birthDate
        )

    first_name = ""

    last_name = ""

    if fhir_patient.name:

        first_name = " ".join(
            fhir_patient.name[0].given
        )

        last_name = (
            fhir_patient.name[0].family
        )

    return {

        "national_id": national_id,

        "date_of_birth": date_of_birth,

        "gender": fhir_patient.gender,

        "first_name": first_name,

        "last_name": last_name

    }


# ============================================================
# APPOINTMENT -> FHIR
# ============================================================

def appointment_to_fhir(
    appointment: Appointment
) -> FHIRAppointment:

    if not appointment.patient:

        raise ValueError(
            "Appointment has no associated patient."
        )

    return FHIRAppointment(

        id=str(
            appointment.id
        ),

        status=(

            appointment.status

            if appointment.status

            else "pending"

        ),

        description=appointment.description,

        doctor_name=appointment.doctor_name,

        appointment_date=(
            appointment.appointment_date
        ),

        appointment_time=(
            appointment.appointment_time
        ),

        participant=[

            Participant(

                actor=patient_reference(
                    appointment.patient
                ),

                status="accepted"

            )

        ]

    )


# ============================================================
# FHIR APPOINTMENT -> INTERNAL DATA
# ============================================================

def fhir_to_appointment_data(
    appointment: FHIRAppointment
):

    national_id = None

    for participant in appointment.participant:

        if participant.actor:

            national_id = (
                extract_patient_national_id(
                    participant.actor
                )
            )

            if national_id:

                break

    if not national_id:

        raise ValueError(
            "Appointment must contain "
            "a valid patient reference."
        )

    return {

        "national_id": national_id,

        "status": appointment.status,

        "description": appointment.description,

        "doctor_name": appointment.doctor_name,

        "appointment_date": (
            appointment.appointment_date
        ),

        "appointment_time": (
            appointment.appointment_time
        )

    }


# ============================================================
# MEDICAL RECORD -> FHIR
# ============================================================

def medical_record_to_fhir(
    record: MedicalRecord
) -> FHIRMedicalRecord:

    if not record.patient:

        raise ValueError(
            "Medical record has no associated patient."
        )

    conclusion_parts = []

    if record.blood_type:

        conclusion_parts.append(
            f"Blood type: {record.blood_type}"
        )

    if record.allergies:

        conclusion_parts.append(
            f"Allergies: {record.allergies}"
        )

    if record.current_medications:

        conclusion_parts.append(
            "Current medications: "
            + record.current_medications
        )

    if record.medical_history:

        conclusion_parts.append(
            "Medical history: "
            + record.medical_history
        )

    if record.current_conditions:

        conclusion_parts.append(
            "Current conditions: "
            + record.current_conditions
        )

    if record.height:

        conclusion_parts.append(
            f"Height: {record.height}"
        )

    if record.weight:

        conclusion_parts.append(
            f"Weight: {record.weight}"
        )

    if record.emergency_contact:

        conclusion_parts.append(
            "Emergency contact: "
            + record.emergency_contact
        )

    if record.primary_physician:

        conclusion_parts.append(
            "Primary physician: "
            + record.primary_physician
        )

    if record.hospital_name:

        conclusion_parts.append(
            f"Hospital: {record.hospital_name}"
        )

    if record.province:

        conclusion_parts.append(
            f"Province: {record.province}"
        )

    conclusion = "\n".join(
        conclusion_parts
    )

    return FHIRMedicalRecord(

        id=str(
            record.id
        ),

        status="final",

        conclusion=conclusion,

        subject=patient_reference(
            record.patient
        )

    )


# ============================================================
# FHIR MEDICAL RECORD -> INTERNAL DATA
# ============================================================

def fhir_to_medical_record_data(
    record: FHIRMedicalRecord
):

    national_id = (
        extract_patient_national_id(
            record.subject
        )
    )

    if not national_id:

        raise ValueError(
            "Medical record must contain "
            "a valid patient reference."
        )

    return {

        "national_id": national_id,

        "status": record.status,

        "conclusion": record.conclusion

    }

#==============================================================
# MEDICAL SCANS -> FHIR DOCUMENT REFERENCE
#==============================================================
def medical_image_to_fhir(
    image: MedicalImage
):
    return FHIRDocumentReference(

        id=str(image.id),

        subject={
            "reference":
                f"Patient/{image.patient.national_id}"
        },

        description=image.description,

        content=[
            {
                "attachment": {

                    "contentType":
                        image.content_type,

                    "url":
                        f"/fhir/patient/"
                        f"{image.patient.national_id}/"
                        f"scans/{image.id}",

                    "title":
                        image.file_name
                }
            }
        ]
    )


# ============================================================
# LAB RESULT -> FHIR OBSERVATION
# ============================================================

def lab_result_to_fhir(
    result: LabResult
) -> FHIRObservation:

    if not result.patient:

        raise ValueError(
            "Lab result has no associated patient."
        )

    return FHIRObservation(

        id=str(
            result.id
        ),

        status=(

            result.status

            if result.status

            else "final"

        ),

        code=result.test_name,

        value=result.result,

        subject=patient_reference(
            result.patient
        ),

        referenceRange=(

            {

                "text": result.normal_range

            }

            if result.normal_range

            else None

        ),

        laboratory=(

            result.laboratory_name

            if result.laboratory_name

            else None

        )

    )


# ============================================================
# PRESCRIPTION -> FHIR
# ============================================================

def prescription_to_fhir(
    prescription: Prescription
) -> FHIRMedicationRequest:

    if not prescription.patient:

        raise ValueError(
            "Prescription has no associated patient."
        )

    return FHIRMedicationRequest(

        id=str(
            prescription.id
        ),

        medication=(
            prescription.medicine_name
        ),

        status="active",

        intent="order",

        doctor_name=(
            prescription.doctor_name
        ),

        dosage=(
            prescription.dosage
        ),

        frequency=(
            prescription.frequency
        ),

        duration=(
            prescription.duration
        ),

        instructions=(
            prescription.instructions
        ),

        subject=patient_reference(
            prescription.patient
        )

    )


# ============================================================
# FHIR PRESCRIPTION -> INTERNAL DATA
# ============================================================

def fhir_to_prescription_data(
    prescription: FHIRMedicationRequest
):

    national_id = (
        extract_patient_national_id(
            prescription.subject
        )
    )

    if not national_id:

        raise ValueError(
            "Prescription must contain "
            "a valid patient reference."
        )

    return {

        "national_id": national_id,

        "medicine_name": (
            prescription.medication
        ),

        "doctor_name": (
            prescription.doctor_name
        ),

        "dosage": (
            prescription.dosage
        ),

        "frequency": (
            prescription.frequency
        ),

        "duration": (
            prescription.duration
        ),

        "instructions": (
            prescription.instructions
        )

    }


# ============================================================
# BUNDLE BUILDER
# ============================================================

def build_bundle(
    resources
) -> FHIRBundle:

    entries = []

    for resource in resources:

        entries.append(

            BundleEntry(

                resource=resource.model_dump(
                    exclude_none=True
                )

            )

        )

    return FHIRBundle(
        entry=entries
    )