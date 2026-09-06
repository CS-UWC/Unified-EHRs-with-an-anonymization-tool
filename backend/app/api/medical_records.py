"""
Medical record endpoints.

Patients can only view their own medical records.

Clinical records are created and updated through
authorized healthcare providers / FHIR interoperability
operations.

Patients cannot create, edit, or delete medical records.
"""

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.dependencies import get_db

from app.models import User
from app.models.patient import Patient
from app.models.medical_record import MedicalRecord

from app.schemas.medical_record import MedicalRecordResponse

from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/medical-records",
    tags=["Medical Records"]
)


# ============================================================
# GET MY MEDICAL RECORD
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

    # --------------------------------------------------------
    # Resolve authenticated user to Patient
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Resolve Patient.id internally
    #
    # Patient.id is never exposed to the frontend
    # as an interoperability identifier.
    # --------------------------------------------------------

    record = (
        db.query(MedicalRecord)
        .filter(
            MedicalRecord.patient_id == patient.id
        )
        .first()
    )

    if not record:

        raise HTTPException(
            status_code=404,
            detail="Medical record not found"
        )

    return record

