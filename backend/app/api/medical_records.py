"""
Medical record endpoints.
"""

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.dependencies import get_db

from app.models import User
from app.models.patient import Patient
from app.models.medical_record import MedicalRecord

from app.schemas.medical_record import (
    MedicalRecordCreate,
    MedicalRecordResponse
)

from app.core.dependencies import get_current_user


router = APIRouter(

    prefix="/medical-records",

    tags=["Medical Records"]

)


# ============================================================
# Create Medical Record
# ============================================================

@router.post(
    "/",
    response_model=MedicalRecordResponse
)
def create_medical_record(

    record: MedicalRecordCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    # Find the patient belonging to
    # the currently authenticated user.

    patient = (

        db.query(Patient)

        .filter(

            Patient.user_id == current_user.id

        )

        .first()

    )

    if not patient:

        raise HTTPException(

            status_code=404,

            detail="Patient profile not found"

        )

    new_record = MedicalRecord(

        patient_id=patient.id,

        blood_type=record.blood_type,

        allergies=record.allergies,

        current_medications=(
            record.current_medications
        ),

        medical_history=(
            record.medical_history
        ),

        current_conditions=(
            record.current_conditions
        ),

        height=record.height,

        weight=record.weight,

        emergency_contact=(
            record.emergency_contact
        ),

        primary_physician=(
            record.primary_physician
        ),

        hospital_name=(
            record.hospital_name
        ),

        province=record.province

    )

    db.add(new_record)

    db.commit()

    db.refresh(new_record)

    return new_record


# ============================================================
# Get My Medical Record
# ============================================================

@router.get(
    "/me",
    response_model=MedicalRecordResponse
)
def get_my_record(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    patient = (

        db.query(Patient)

        .filter(

            Patient.user_id == current_user.id

        )

        .first()

    )

    if not patient:

        raise HTTPException(

            status_code=404,

            detail="Patient profile not found"

        )

    record = (

        db.query(MedicalRecord)

        .filter(

            MedicalRecord.patient_id
            == patient.id

        )

        .first()

    )

    if not record:

        raise HTTPException(

            status_code=404,

            detail="Medical record not found"

        )

    return record


# ============================================================
# Get Medical Record By Patient ID
# ============================================================

@router.get(
    "/{patient_id}",
    response_model=MedicalRecordResponse
)
def get_patient_record(

    patient_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    patient = (

        db.query(Patient)

        .filter(

            Patient.id == patient_id

        )

        .first()

    )

    if not patient:

        raise HTTPException(

            status_code=404,

            detail="Patient not found"

        )

    # Only allow the patient to access
    # their own medical record for now.

    if patient.user_id != current_user.id:

        raise HTTPException(

            status_code=403,

            detail=(
                "You do not have permission "
                "to access this medical record"
            )

        )

    record = (

        db.query(MedicalRecord)

        .filter(

            MedicalRecord.patient_id
            == patient_id

        )

        .first()

    )

    if not record:

        raise HTTPException(

            status_code=404,

            detail="Medical record not found"

        )

    return record

