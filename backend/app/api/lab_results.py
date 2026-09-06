"""
Lab Results API.

Patients can only create, view, update, and delete
their own laboratory results.
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
from app.models import LabResult

from app.schemas.lab_result import (
    LabResultCreate,
    LabResultResponse
)


router = APIRouter(
    prefix="/lab-results",
    tags=["Lab Results"]
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
# GET MY LAB RESULTS
# ============================================================

@router.get(
    "/me",
    response_model=List[LabResultResponse]
)
def get_my_lab_results(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    patient = get_current_patient(
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

    return results


# ============================================================
# GET ONE OF MY LAB RESULTS
# ============================================================

@router.get(
    "/{lab_result_id}",
    response_model=LabResultResponse
)
def get_lab_result(

    lab_result_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    patient = get_current_patient(
        current_user,
        db
    )

    result = (
        db.query(LabResult)
        .filter(
            LabResult.id == lab_result_id,
            LabResult.patient_id == patient.id
        )
        .first()
    )

    if not result:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lab result not found"
        )

    return result



