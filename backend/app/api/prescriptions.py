from typing import List

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.core.dependencies import get_current_user

from app.models import User
from app.models import Prescription

from app.schemas.prescription import (
    PrescriptionCreate,
    PrescriptionResponse
)


router = APIRouter(

    prefix="/prescriptions",

    tags=["Prescriptions"]

)

@router.post(

    "/",

    response_model=PrescriptionResponse

)
def create_prescription(

    prescription: PrescriptionCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    new_prescription = Prescription(

        patient_id=current_user.id,

        doctor_name=
        prescription.doctor_name,

        medicine_name=
        prescription.medicine_name,

        dosage=
        prescription.dosage,

        frequency=
        prescription.frequency,

        duration=
        prescription.duration,

        instructions=
        prescription.instructions

    )


    db.add(new_prescription)

    db.commit()

    db.refresh(new_prescription)

    return new_prescription

# A patient may have many prescriptions, so we'll return a list.    

@router.get(

    "/me",

    response_model=
    List[PrescriptionResponse]

)
def get_my_prescriptions(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    prescriptions = (

        db.query(Prescription)

        .filter(
            Prescription.patient_id ==
            current_user.id
        )

        .all()

    )


    return prescriptions


@router.get(

    "/{prescription_id}",

    response_model=
    PrescriptionResponse

)
def get_prescription(

    prescription_id:int,

    db: Session = Depends(get_db)

):

    prescription = (

        db.query(Prescription)

        .filter(
            Prescription.id ==
            prescription_id
        )

        .first()

    )


    if not prescription:

        raise HTTPException(

            status_code=404,

            detail="Prescription not found"

        )


    return prescription


@router.put(

    "/{prescription_id}",

    response_model=
    PrescriptionResponse

)
def update_prescription(

    prescription_id:int,

    prescription: PrescriptionCreate,

    db: Session = Depends(get_db)

):

    existing = (

        db.query(Prescription)

        .filter(
            Prescription.id ==
            prescription_id
        )

        .first()

    )


    if not existing:

        raise HTTPException(

            status_code=404,

            detail="Prescription not found"

        )


    existing.doctor_name = (
        prescription.doctor_name
    )

    existing.medicine_name = (
        prescription.medicine_name
    )

    existing.dosage = (
        prescription.dosage
    )

    existing.frequency = (
        prescription.frequency
    )

    existing.duration = (
        prescription.duration
    )

    existing.instructions = (
        prescription.instructions
    )


    db.commit()

    db.refresh(existing)

    return existing


@router.delete(

    "/{prescription_id}"

)
def delete_prescription(

    prescription_id:int,

    db: Session = Depends(get_db)

):

    prescription = (

        db.query(Prescription)

        .filter(
            Prescription.id ==
            prescription_id
        )

        .first()

    )


    if not prescription:

        raise HTTPException(

            status_code=404,

            detail="Prescription not found"

        )


    db.delete(prescription)

    db.commit()


    return {

        "message":
        "Prescription deleted successfully."

    }


