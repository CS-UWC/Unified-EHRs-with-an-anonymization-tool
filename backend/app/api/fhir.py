"""
FHIR interoperability API.

External systems identify patients using NATIONAL ID.

Internal patient.id is NEVER exposed as the
external interoperability identifier.
"""
import os
import uuid

from pathlib import Path

from fastapi import File
from fastapi import UploadFile

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.dependencies import get_db

from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.models.prescription import Prescription
from app.models.lab_result import LabResult
from app.models.user import User
from app.models.medical_image import MedicalImage

from app.fhir.patient import FHIRPatient

from app.core.authorization import require_role
from app.core.dependencies import get_current_user

from app.core.patient_authorization import (
    authorize_patient_access,
    authorize_patient_write_access
)


from app.fhir.observation import (
    FHIRObservation
)

from app.fhir.appointment import (
    FHIRAppointment
)

from app.fhir.medical_record import (
    FHIRMedicalRecord
)

from app.fhir.medication import (
    FHIRMedicationRequest
)

from app.fhir.mapper import (
    patient_to_fhir,
    appointment_to_fhir,
    medical_record_to_fhir,
    prescription_to_fhir,
    lab_result_to_fhir,
    build_bundle,
    fhir_to_patient_data,
    extract_patient_national_id,
    fhir_to_appointment_data,
    fhir_to_prescription_data,
    fhir_to_medical_record_data
)

from app.fhir.imaging import (
    FHIRDocumentReference
)

UPLOAD_DIR = Path(
    "uploads/medical_images"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

router = APIRouter(
    prefix="/fhir",
    tags=["FHIR"]
)


# ============================================================
# PATIENT LOOKUP HELPER
# ============================================================

def get_patient_by_national_id(
    national_id: str,
    db: Session
):

    patient = (

        db.query(Patient)

        .filter(
            Patient.national_id == national_id
        )

        .first()

    )

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return patient


# ============================================================
# GET FHIR PATIENT
# ============================================================

@router.get(
    "/patient/{national_id}",
    response_model=FHIRPatient
)
def get_fhir_patient(

    national_id: str,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    patient = authorize_patient_access(
        national_id,
        current_user,
        db
    )

    return patient_to_fhir(
        patient
    )


# ============================================================
# POST FHIR PATIENT
# ============================================================

@router.post(
    "/patient",
    response_model=FHIRPatient
)
def receive_fhir_patient(

    fhir_patient: FHIRPatient,

    current_user: User = Depends(
        require_role(
            "DOCTOR",
            "EXTERNAL_SYSTEM",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    if not fhir_patient.identifier:

        raise HTTPException(
            status_code=400,
            detail=(
                "FHIR Patient must contain "
                "an identifier."
            )
        )

    national_id = (
        fhir_patient.identifier[0].value
    )

    patient = authorize_patient_write_access(
        national_id,
        current_user,
        db
    )

    patient_data = fhir_to_patient_data(
        fhir_patient
    )

    if patient_data["date_of_birth"]:

        patient.date_of_birth = (
            patient_data["date_of_birth"]
        )

    if patient_data["gender"]:

        patient.gender = (
            patient_data["gender"]
        )

    db.commit()

    db.refresh(patient)

    return patient_to_fhir(
        patient
    )


# ============================================================
# GET COMPLETE FHIR BUNDLE
# ============================================================

@router.get(
    "/patient/{national_id}/bundle"
)
def get_patient_bundle(

    national_id: str,

    current_user: User = Depends(
        require_role(
            "PATIENT",
            "DOCTOR",
            "EXTERNAL_SYSTEM",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    patient = authorize_patient_access(
        national_id,
        current_user,
        db
    )

    # ========================================================
    # INTERNAL ID
    #
    # Used ONLY internally to retrieve related records.
    #
    # NEVER returned to external systems.
    # ========================================================

    internal_patient_id = patient.id

    resources = []

    # ========================================================
    # PATIENT
    # ========================================================

    resources.append(
        patient_to_fhir(
            patient
        )
    )

    # ========================================================
    # MEDICAL RECORDS
    # ========================================================

    records = (

        db.query(MedicalRecord)

        .filter(
            MedicalRecord.patient_id
            == internal_patient_id
        )

        .all()

    )

    for record in records:

        resources.append(
            medical_record_to_fhir(
                record
            )
        )

    # ========================================================
    # APPOINTMENTS
    # ========================================================

    appointments = (

        db.query(Appointment)

        .filter(
            Appointment.patient_id
            == internal_patient_id
        )

        .all()

    )

    for appointment in appointments:

        resources.append(
            appointment_to_fhir(
                appointment
            )
        )

    # ========================================================
    # PRESCRIPTIONS
    # ========================================================

    prescriptions = (

        db.query(Prescription)

        .filter(
            Prescription.patient_id
            == internal_patient_id
        )

        .all()

    )

    for prescription in prescriptions:

        resources.append(
            prescription_to_fhir(
                prescription
            )
        )

    # ========================================================
    # OBSERVATIONS
    # ========================================================

    observations = (

        db.query(LabResult)

        .filter(
            LabResult.patient_id
            == internal_patient_id
        )

        .all()

    )

    for observation in observations:

        resources.append(
            lab_result_to_fhir(
                observation
            )
        )

    return build_bundle(
        resources
    )


# ============================================================
# GET OBSERVATIONS
# ============================================================

@router.get(
    "/patient/{national_id}/observations",
    response_model=list[FHIRObservation]
)
def get_patient_observations(

    national_id: str,

    current_user: User = Depends(
        require_role(
            "PATIENT",
            "DOCTOR",
            "EXTERNAL_SYSTEM",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    patient = authorize_patient_access(
        national_id,
        current_user,
        db
    )

    results = (

        db.query(LabResult)

        .filter(
            LabResult.patient_id == patient.id
        )

        .all()

    )

    return [

        lab_result_to_fhir(
            result
        )

        for result in results

    ]


# ============================================================
# POST FHIR OBSERVATION
# ============================================================

@router.post(
    "/observation",
    response_model=FHIRObservation
)
def create_fhir_observation(

    observation: FHIRObservation,

    current_user: User = Depends(
        require_role(
            "DOCTOR",
            "EXTERNAL_SYSTEM",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    # --------------------------------------------------------
    # Validate resource type
    # --------------------------------------------------------

    if observation.resourceType != "Observation":

        raise HTTPException(
            status_code=400,
            detail=(
                "Resource must be an Observation."
            )
        )

    # --------------------------------------------------------
    # Validate patient subject
    # --------------------------------------------------------

    if not observation.subject:

        raise HTTPException(
            status_code=400,
            detail=(
                "Observation must contain "
                "a patient reference."
            )
        )

    # --------------------------------------------------------
    # Extract NATIONAL ID
    # --------------------------------------------------------

    try:

        national_id = extract_patient_national_id(
            observation.subject
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    # --------------------------------------------------------
    # Validate NATIONAL ID
    # --------------------------------------------------------

    if not national_id:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid patient reference. "
                "Use Patient/{national_id}."
            )
        )

    # --------------------------------------------------------
    # Find patient using NATIONAL ID
    #
    # IMPORTANT:
    # The external system supplies the national ID.
    # The internal patient.id is resolved by the backend.
    # --------------------------------------------------------

    patient = authorize_patient_write_access(
        national_id,
        current_user,
        db
    )

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found."
        )

    # --------------------------------------------------------
    # Create internal database record
    #
    # patient.id is INTERNAL ONLY.
    # It is never supplied by the external system.
    # --------------------------------------------------------

    new_result = LabResult(

        patient_id=patient.id,

        test_name=observation.code,

        result=observation.value,

        normal_range=(

            observation.referenceRange.text

            if observation.referenceRange

            else "Not specified"

        ),

        laboratory_name=(

            observation.laboratory

            if observation.laboratory

            else "External Laboratory"

        ),

        status=observation.status

    )

    # --------------------------------------------------------
    # Save to database
    # --------------------------------------------------------

    db.add(
        new_result
    )

    db.commit()

    db.refresh(
        new_result
    )

    # --------------------------------------------------------
    # Return FHIR representation
    # --------------------------------------------------------

    return lab_result_to_fhir(
        new_result
    )


# ============================================================
# GET MEDICAL RECORDS
# ============================================================

@router.get(
    "/patient/{national_id}/medical-records",
    response_model=list[FHIRMedicalRecord]
)
def get_patient_medical_records(

    national_id: str,

    current_user: User = Depends(
        require_role(
            "PATIENT",
            "DOCTOR",
            "EXTERNAL_SYSTEM",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    patient = authorize_patient_access(
        national_id,
        current_user,
        db
    )

    records = (

        db.query(MedicalRecord)

        .filter(
            MedicalRecord.patient_id == patient.id
        )

        .all()

    )

    return [

        medical_record_to_fhir(
            record
        )

        for record in records

    ]


# ============================================================
# POST MEDICAL RECORD
# ============================================================

@router.post(
    "/medical-record",
    response_model=FHIRMedicalRecord
)
def create_fhir_medical_record(

    record: FHIRMedicalRecord,

    current_user: User = Depends(
        require_role(
            "DOCTOR",
            "EXTERNAL_SYSTEM",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    if record.resourceType != "DiagnosticReport":

        raise HTTPException(
            status_code=400,
            detail=(
                "Resource must be a DiagnosticReport."
            )
        )

    try:

        data = fhir_to_medical_record_data(
            record
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    patient = authorize_patient_write_access(
        data["national_id"],
        current_user,
        db
    )

    # --------------------------------------------------------
    # The internal MedicalRecord model does not have a
    # "conclusion" column.
    #
    # We therefore store the incoming FHIR conclusion
    # in medical_history.
    # --------------------------------------------------------

    new_record = MedicalRecord(

        patient_id=patient.id,

        medical_history=data["conclusion"]

    )

    db.add(
        new_record
    )

    db.commit()

    db.refresh(
        new_record
    )

    return medical_record_to_fhir(
        new_record
    )


# ============================================================
# GET APPOINTMENTS
# ============================================================

@router.get(
    "/patient/{national_id}/appointments",
    response_model=list[FHIRAppointment]
)
def get_patient_appointments(

    national_id: str,

    current_user: User = Depends(
        require_role(
            "PATIENT",
            "DOCTOR",
            "EXTERNAL_SYSTEM",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    patient = authorize_patient_access(
        national_id,
        current_user,
        db
    )

    appointments = (

        db.query(Appointment)

        .filter(
            Appointment.patient_id == patient.id
        )

        .all()

    )

    return [

        appointment_to_fhir(
            appointment
        )

        for appointment in appointments

    ]


# ============================================================
# POST APPOINTMENT
# ============================================================

@router.post(
    "/appointment",
    response_model=FHIRAppointment
)
def create_fhir_appointment(

    appointment: FHIRAppointment,

    current_user: User = Depends(
        require_role(
            "DOCTOR",
            "EXTERNAL_SYSTEM",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    if appointment.resourceType != "Appointment":

        raise HTTPException(
            status_code=400,
            detail=(
                "Resource must be an Appointment."
            )
        )

    try:

        data = fhir_to_appointment_data(
            appointment
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    # --------------------------------------------------------
    # Resolve patient using NATIONAL ID and enforce
    # patient-controlled write authorization.
    # --------------------------------------------------------

    patient = authorize_patient_write_access(
        data["national_id"],
        current_user,
        db
    )

    new_appointment = Appointment(

        patient_id=patient.id,

        doctor_name=data["doctor_name"],

        appointment_date=(
            data["appointment_date"]
        ),

        appointment_time=(
            data["appointment_time"]
        ),

        description=data["description"],

        status=data["status"]

    )

    db.add(
        new_appointment
    )

    db.commit()

    db.refresh(
        new_appointment
    )

    return appointment_to_fhir(
        new_appointment
    )


# ============================================================
# GET PRESCRIPTIONS
# ============================================================

@router.get(
    "/patient/{national_id}/prescriptions",
    response_model=list[FHIRMedicationRequest]
)
def get_patient_prescriptions(

    national_id: str,

    current_user: User = Depends(
        require_role(
            "PATIENT",
            "DOCTOR",
            "EXTERNAL_SYSTEM",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    patient = authorize_patient_access(
        national_id,
        current_user,
        db
    )

    prescriptions = (

        db.query(Prescription)

        .filter(
            Prescription.patient_id == patient.id
        )

        .all()

    )

    return [

        prescription_to_fhir(
            prescription
        )

        for prescription in prescriptions

    ]


# ============================================================
# POST PRESCRIPTION
# ============================================================

@router.post(
    "/prescription",
    response_model=FHIRMedicationRequest
)
def create_fhir_prescription(

    prescription: FHIRMedicationRequest,

    current_user: User = Depends(
        require_role(
            "DOCTOR",
            "EXTERNAL_SYSTEM",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    if prescription.resourceType != "MedicationRequest":

        raise HTTPException(
            status_code=400,
            detail=(
                "Resource must be a "
                "MedicationRequest."
            )
        )

    try:

        data = fhir_to_prescription_data(
            prescription
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    # --------------------------------------------------------
    # Resolve patient using NATIONAL ID and enforce
    # patient-controlled write authorization.
    # --------------------------------------------------------

    patient = authorize_patient_write_access(
        data["national_id"],
        current_user,
        db
    )

    new_prescription = Prescription(

        patient_id=patient.id,

        doctor_name=(
            data["doctor_name"]
        ),

        medicine_name=(
            data["medicine_name"]
        ),

        dosage=(
            data["dosage"]
        ),

        frequency=(
            data["frequency"]
        ),

        duration=(
            data["duration"]
        ),

        instructions=(
            data["instructions"]
        )

    )

    db.add(
        new_prescription
    )

    db.commit()

    db.refresh(
        new_prescription
    )

    return prescription_to_fhir(
        new_prescription
    )
#=====================================================================================================
#ENDPOINT TO UPLOAD MEDICAL SCANS (IMAGES) AND RETURN FHIR DOCUMENTREFERENCE RESOURCE
#======================================================================================================
@router.post(
    "/patient/{national_id}/scan",
    response_model=FHIRDocumentReference
)
async def upload_medical_scan(

    national_id: str,

    scan_type: str | None = None,

    description: str | None = None,

    file: UploadFile = File(...),

    current_user: User = Depends(
        require_role(
            "DOCTOR",
            "EXTERNAL_SYSTEM",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    # ========================================================
    # AUTHORIZE PATIENT WRITE ACCESS
    # ========================================================

    patient = authorize_patient_write_access(
        national_id,
        current_user,
        db
    )

    # ========================================================
    # VALIDATE FILE TYPE
    # ========================================================

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/dicom"
    }

    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported image format. "
                "Allowed formats are JPEG, PNG, and DICOM."
            )
        )

    # ========================================================
    # GENERATE SAFE FILE NAME
    # ========================================================

    original_name = (
        file.filename
        or "medical_scan"
    )

    extension = Path(
        original_name
    ).suffix.lower()

    generated_name = (
        f"{uuid.uuid4()}{extension}"
    )

    file_path = (
        UPLOAD_DIR /
        generated_name
    )

    # ========================================================
    # SAVE IMAGE
    # ========================================================

    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            while True:

                chunk = await file.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                buffer.write(chunk)

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Failed to save medical image."
        )

    # ========================================================
    # SAVE DATABASE RECORD
    # ========================================================

    new_image = MedicalImage(

        patient_id=patient.id,

        file_name=original_name,

        file_path=str(
            file_path
        ),

        content_type=file.content_type,

        scan_type=scan_type,

        description=description

    )

    db.add(
        new_image
    )

    db.commit()

    db.refresh(
        new_image
    )

    # ========================================================
    # RETURN FHIR RESOURCE
    # ========================================================

    return FHIRDocumentReference(

        id=str(
            new_image.id
        ),

        subject={
            "reference": (
                f"Patient/{national_id}"
            )
        },

        description=description,

        content=[

            {
                "attachment": {

                    "contentType": (
                        file.content_type
                    ),

                    "url": (
                        f"/uploads/medical_images/"
                        f"{generated_name}"
                    ),

                    "title": original_name

                }

            }

        ]

    )

@router.get(
    "/patient/{national_id}/scans",
    response_model=list[FHIRDocumentReference]
)
def get_patient_scans(

    national_id: str,

    current_user: User = Depends(
        require_role(
            "PATIENT",
            "DOCTOR",
            "EXTERNAL_SYSTEM",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    # ========================================================
    # AUTHORIZE READ ACCESS
    # ========================================================

    patient = authorize_patient_access(
        national_id,
        current_user,
        db
    )

    # ========================================================
    # GET PATIENT SCANS
    # ========================================================

    scans = (
        db.query(MedicalImage)
        .filter(
            MedicalImage.patient_id == patient.id
        )
        .all()
    )

    # ========================================================
    # CONVERT TO FHIR
    # ========================================================

    resources = []

    for scan in scans:

        resources.append(

            FHIRDocumentReference(

                id=str(
                    scan.id
                ),

                subject={
                    "reference":
                        f"Patient/{national_id}"
                },

                description=(
                    scan.description
                ),

                content=[

                    {
                        "attachment": {

                            "contentType":
                                scan.content_type,

                            "url":
                                f"/{scan.file_path}",

                            "title":
                                scan.file_name

                        }
                    }

                ]

            )

        )

    return resources

@router.get(
    "/patient/{national_id}/scans/{scan_id}",
    response_model=FHIRDocumentReference
)
def get_patient_scan(

    national_id: str,

    scan_id: int,

    current_user: User = Depends(
        require_role(
            "PATIENT",
            "DOCTOR",
            "EXTERNAL_SYSTEM",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    patient = authorize_patient_access(
        national_id,
        current_user,
        db
    )

    scan = (
        db.query(MedicalImage)
        .filter(
            MedicalImage.id == scan_id,
            MedicalImage.patient_id == patient.id
        )
        .first()
    )

    if not scan:

        raise HTTPException(
            status_code=404,
            detail="Medical scan not found."
        )

    return FHIRDocumentReference(

        id=str(
            scan.id
        ),

        subject={
            "reference":
                f"Patient/{national_id}"
        },

        description=(
            scan.description
        ),

        content=[

            {
                "attachment": {

                    "contentType":
                        scan.content_type,

                    "url":
                        f"/{scan.file_path}",

                    "title":
                        scan.file_name

                }
            }

        ]

    )