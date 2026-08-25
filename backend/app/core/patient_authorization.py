"""
Patient resource-level authorization.

Controls which users and external systems can
access patient EHR data.
"""

from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.patient import Patient

from app.core.patient_permissions import (
    check_external_system_permission
)


# ============================================================
# READ AUTHORIZATION
# ============================================================

def authorize_patient_access(
    national_id: str,
    current_user: User,
    db: Session
):
    """
    Verify that the current user can READ
    the requested patient's EHR.
    """

    patient = (
        db.query(Patient)
        .filter(
            Patient.national_id == national_id
        )
        .first()
    )

    if not patient:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # --------------------------------------------------------
    # ADMIN
    # --------------------------------------------------------

    if current_user.role == "ADMIN":

        return patient

    # --------------------------------------------------------
    # PATIENT
    # --------------------------------------------------------

    if current_user.role == "PATIENT":

        if (
            current_user.patient is None
            or current_user.patient.id != patient.id
        ):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not authorized to "
                    "access this patient's data."
                )
            )

        return patient

    # --------------------------------------------------------
    # DOCTOR
    # --------------------------------------------------------

    if current_user.role == "DOCTOR":

        return patient

    # --------------------------------------------------------
    # EXTERNAL SYSTEM
    # --------------------------------------------------------

    if current_user.role == "EXTERNAL_SYSTEM":

        check_external_system_permission(
            patient=patient,
            external_system=current_user,
            db=db,
            write=False
        )

        return patient

    # --------------------------------------------------------
    # UNKNOWN ROLE
    # --------------------------------------------------------

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient permissions"
    )


# ============================================================
# WRITE AUTHORIZATION
# ============================================================

def authorize_patient_write_access(
    national_id: str,
    current_user: User,
    db: Session
):
    """
    Verify that the current user can WRITE
    to the requested patient's EHR.
    """

    patient = (
        db.query(Patient)
        .filter(
            Patient.national_id == national_id
        )
        .first()
    )

    if not patient:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # --------------------------------------------------------
    # ADMIN
    # --------------------------------------------------------

    if current_user.role == "ADMIN":

        return patient

    # --------------------------------------------------------
    # DOCTOR
    # --------------------------------------------------------

    if current_user.role == "DOCTOR":

        return patient

    # --------------------------------------------------------
    # EXTERNAL SYSTEM
    # --------------------------------------------------------

    if current_user.role == "EXTERNAL_SYSTEM":

        check_external_system_permission(
            patient=patient,
            external_system=current_user,
            db=db,
            write=True
        )

        return patient

    # --------------------------------------------------------
    # PATIENT
    #
    # Patients cannot directly write FHIR resources.
    # --------------------------------------------------------

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient permissions"
    )