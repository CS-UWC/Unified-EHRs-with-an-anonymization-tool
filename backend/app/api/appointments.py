"""
Appointment API.

Patients can only create, view, update, and delete
their own appointments.
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
from app.models import Appointment

from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse
)


router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
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
# GET MY APPOINTMENTS
# ============================================================

@router.get(
    "/me",
    response_model=List[AppointmentResponse]
)
def get_my_appointments(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    patient = get_current_patient(
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

    return appointments


# ============================================================
# GET ONE OF MY APPOINTMENTS
# ============================================================

@router.get(
    "/{appointment_id}",
    response_model=AppointmentResponse
)
def get_appointment(

    appointment_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    patient = get_current_patient(
        current_user,
        db
    )

    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id == appointment_id,
            Appointment.patient_id == patient.id
        )
        .first()
    )

    if not appointment:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )

    return appointment



