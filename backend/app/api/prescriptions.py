"""
Prescriptions API.

Patients can only create, view, update, and delete
their own prescriptions.
"""

from typing import List

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.core.dependencies import get_current_user

from app.models import User
from app.models import Patient
from app.models import Prescription

from app.schemas.prescription import (
    PrescriptionCreate,
    PrescriptionResponse
)


router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"]
)


def get_current_patient(
    current_user: User,
    db: Session
) -> Patient:

    patient = (
        db.query(Patient)
        .filter(
            Patient.user_id == current_user.id
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )

    return patient


# ============================================================
# GET MY PRESCRIPTIONS
# ============================================================

@router.get(
    "/me",
    response_model=List[PrescriptionResponse]
)
def get_my_prescriptions(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    patient = get_current_patient(
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

    return prescriptions


# ============================================================
# GET ONE OF MY PRESCRIPTIONS
# ============================================================

@router.get(
    "/{prescription_id}",
    response_model=PrescriptionResponse
)
def get_prescription(

    prescription_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    patient = get_current_patient(
        current_user,
        db
    )

    prescription = (
        db.query(Prescription)
        .filter(
            Prescription.id == prescription_id,
            Prescription.patient_id == patient.id
        )
        .first()
    )

    if not prescription:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )

    return prescription



