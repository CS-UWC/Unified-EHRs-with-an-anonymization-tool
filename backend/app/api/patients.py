"""
Patient endpoints.
"""

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.dependencies import get_db

from app.core.dependencies import get_current_user

from app.models.user import User
from app.models.patient import Patient

from app.schemas.patient import PatientResponse
from app.schemas.patient import PatientUpdate


router = APIRouter(

    prefix="/patients",

    tags=["Patients"]

)


@router.get(

    "/me",

    response_model=PatientResponse

)
def get_my_patient_profile(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )

):

    patient = (

        db.query(Patient)

        .filter(

            Patient.user_id == current_user.id

        )

        .first()

    )

    if patient is None:

        raise HTTPException(

            status_code=404,

            detail="Patient profile not found"

        )

    return patient


@router.put(

    "/me",

    response_model=PatientResponse

)
def update_my_patient_profile(

    patient_data: PatientUpdate,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )

):

    patient = (

        db.query(Patient)

        .filter(

            Patient.user_id == current_user.id

        )

        .first()

    )

    if patient is None:

        raise HTTPException(

            status_code=404,

            detail="Patient profile not found"

        )

    update_data = patient_data.model_dump(

        exclude_unset=True

    )

    for field, value in update_data.items():

        setattr(

            patient,

            field,

            value

        )

    try:

        db.commit()

        db.refresh(patient)

    except Exception:

        db.rollback()

        raise HTTPException(

            status_code=500,

            detail="Could not update patient profile"

        )

    return patient