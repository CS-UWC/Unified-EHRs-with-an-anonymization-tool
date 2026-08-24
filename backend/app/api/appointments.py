from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.core.dependencies import get_current_user

from app.models import User
from app.models import Appointment

from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse
)


router = APIRouter(

    prefix="/appointments",

    tags=["Appointments"]

)

@router.post(

    "/",

    response_model=AppointmentResponse

)
def create_appointment(

    appointment: AppointmentCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    new_appointment = Appointment(

        patient_id=current_user.id,

        doctor_name=
        appointment.doctor_name,

        appointment_date=
        appointment.appointment_date,

        appointment_time=
        appointment.appointment_time,

        description = "string"

    )


    db.add(new_appointment)

    db.commit()

    db.refresh(new_appointment)

    return new_appointment

# returning one appointment, it should return a list.
from typing import List


@router.get(

    "/me",

    response_model=
    List[AppointmentResponse]

)
def get_my_appointments(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    appointments = (

        db.query(Appointment)

        .filter(
            Appointment.patient_id ==
            current_user.id
        )

        .all()

    )


    return appointments

@router.get(

    "/{appointment_id}",

    response_model=
    AppointmentResponse

)
def get_appointment(

    appointment_id:int,

    db: Session = Depends(get_db)

):

    appointment = (

        db.query(Appointment)

        .filter(
            Appointment.id ==
            appointment_id
        )

        .first()

    )


    if not appointment:

        raise HTTPException(

            status_code=404,

            detail="Appointment not found"

        )


    return appointment

@router.put(

    "/{appointment_id}",

    response_model=
    AppointmentResponse

)
def update_appointment(

    appointment_id:int,

    appointment: AppointmentCreate,

    db: Session = Depends(get_db)

):

    existing = (

        db.query(Appointment)

        .filter(
            Appointment.id ==
            appointment_id
        )

        .first()

    )


    if not existing:

        raise HTTPException(

            status_code=404,

            detail="Appointment not found"

        )


    existing.doctor_name = (
        appointment.doctor_name
    )

    existing.appointment_date = (
        appointment.appointment_date
    )

    existing.appointment_time = (
        appointment.appointment_time
    )


    db.commit()

    db.refresh(existing)

    return existing

@router.delete(

    "/{appointment_id}"

)
def delete_appointment(

    appointment_id:int,

    db: Session = Depends(get_db)

):

    appointment = (

        db.query(Appointment)

        .filter(
            Appointment.id ==
            appointment_id
        )

        .first()

    )


    if not appointment:

        raise HTTPException(

            status_code=404,

            detail="Appointment not found"

        )


    db.delete(appointment)

    db.commit()


    return {

        "message":
        "Appointment deleted successfully."

    }