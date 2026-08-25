"""
Patient-controlled external-system permissions.
"""

from datetime import datetime

from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.patient import Patient
from app.models.external_system_permission import (
    ExternalSystemPermission
)


def grant_external_system_permission(
    patient: Patient,
    external_system: User,
    can_read: bool,
    can_write: bool,
    db: Session
):
    """
    Grant an external system permission to access
    a patient's EHR.
    """

    if external_system.role != "EXTERNAL_SYSTEM":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Selected user is not an "
                "external system."
            )
        )

    permission = (
        db.query(
            ExternalSystemPermission
        )
        .filter(
            ExternalSystemPermission.external_system_id
            == external_system.id,
            ExternalSystemPermission.patient_id
            == patient.id
        )
        .first()
    )

    if permission:

        permission.can_read = can_read
        permission.can_write = can_write
        permission.revoked_at = None

    else:

        permission = ExternalSystemPermission(

            external_system_id=external_system.id,

            patient_id=patient.id,

            can_read=can_read,

            can_write=can_write

        )

        db.add(permission)

    db.commit()

    db.refresh(permission)

    return permission


def revoke_external_system_permission(
    patient: Patient,
    external_system_id: int,
    db: Session
):
    """
    Revoke an external system's access to a patient's EHR.
    """

    permission = (
        db.query(
            ExternalSystemPermission
        )
        .filter(
            ExternalSystemPermission.external_system_id
            == external_system_id,

            ExternalSystemPermission.patient_id
            == patient.id,

            ExternalSystemPermission.revoked_at
            .is_(None)
        )
        .first()
    )

    if not permission:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active permission not found."
        )

    permission.can_read = False
    permission.can_write = False
    permission.revoked_at = datetime.utcnow()

    db.commit()

    return permission


def check_external_system_permission(
    patient: Patient,
    external_system: User,
    db: Session,
    write: bool = False
):
    """
    Verify that an external system has active
    patient-granted permission.
    """

    permission = (
        db.query(
            ExternalSystemPermission
        )
        .filter(
            ExternalSystemPermission.external_system_id
            == external_system.id,

            ExternalSystemPermission.patient_id
            == patient.id,

            ExternalSystemPermission.revoked_at
            .is_(None)
        )
        .first()
    )

    if not permission:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Patient has not granted this "
                "external system access."
            )
        )

    if write and not permission.can_write:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Patient has not granted this "
                "external system write permission."
            )
        )

    if not write and not permission.can_read:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Patient has not granted this "
                "external system read permission."
            )
        )

    return permission