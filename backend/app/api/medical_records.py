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
# GET ALL MY MEDICAL RECORDS
# ============================================================

@router.get(
    "/me",
    response_model=list[MedicalRecordResponse]
)
def get_my_records(

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
    # Patient.id is used internally only.
    #
    # The frontend/interoperability layer uses National ID.
    # --------------------------------------------------------

    records = (
        db.query(MedicalRecord)
        .filter(
            MedicalRecord.patient_id == patient.id
        )
        .order_by(
            MedicalRecord.id.desc()
        )
        .all()
    )

    return records

