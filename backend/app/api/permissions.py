"""
Patient-controlled permissions for external healthcare systems.

Patients are the only users allowed to grant or revoke
external-system access to their own health records.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.external_system import ExternalSystem
from app.models.external_system_permission import ExternalSystemPermission
from app.schemas.permissions import (
    ExternalSystemPermissionCreate,
    ExternalSystemPermissionResponse,
)


router = APIRouter(
    prefix="/permissions",
    tags=["Permissions"],
)


# ============================================================
# GRANT PERMISSION
# ============================================================

@router.post(
    "/external-system",
    response_model=ExternalSystemPermissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def grant_external_system_permission(
    permission_data: ExternalSystemPermissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Allow the authenticated patient to grant an external
    healthcare system permission to access their records.

    The external system cannot grant permission to itself.
    """

    # --------------------------------------------------------
    # 1. Only patients can grant permissions
    # --------------------------------------------------------

    if current_user.role != "PATIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can grant external-system permissions.",
        )

    # --------------------------------------------------------
    # 2. Make sure the authenticated user has a patient record
    # --------------------------------------------------------

    if current_user.patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient record not found.",
        )

    patient = current_user.patient

    # --------------------------------------------------------
    # 3. Verify that the external system exists
    # --------------------------------------------------------

    external_system = (
        db.query(ExternalSystem)
        .filter(
            ExternalSystem.id == permission_data.external_system_id
        )
        .first()
    )

    if external_system is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="External system not found.",
        )

    # --------------------------------------------------------
    # 4. Prevent duplicate permissions
    # --------------------------------------------------------

    existing_permission = (
        db.query(ExternalSystemPermission)
        .filter(
            ExternalSystemPermission.patient_id == patient.id,
            ExternalSystemPermission.external_system_id
            == permission_data.external_system_id,
        )
        .first()
    )

    if existing_permission:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Permission already exists for this external system.",
        )

    # --------------------------------------------------------
    # 5. Create patient-controlled permission
    # --------------------------------------------------------

    new_permission = ExternalSystemPermission(
        patient_id=patient.id,
        external_system_id=permission_data.external_system_id,
        can_read=permission_data.can_read,
        can_write=permission_data.can_write,
    )

    db.add(new_permission)
    db.commit()
    db.refresh(new_permission)

    return new_permission


# ============================================================
# REVOKE PERMISSION
# ============================================================

@router.post(
    "/external-system/revoke",
    status_code=status.HTTP_204_NO_CONTENT,
)
def revoke_external_system_permission(
    external_system_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Revoke an external healthcare system's access to the
    authenticated patient's records.
    """

    # --------------------------------------------------------
    # 1. Only patients can revoke permissions
    # --------------------------------------------------------

    if current_user.role != "PATIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can revoke external-system permissions.",
        )

    # --------------------------------------------------------
    # 2. Make sure the authenticated user has a patient record
    # --------------------------------------------------------

    if current_user.patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient record not found.",
        )

    patient = current_user.patient

    # --------------------------------------------------------
    # 3. Find permission belonging to THIS patient
    # --------------------------------------------------------

    permission = (
        db.query(ExternalSystemPermission)
        .filter(
            ExternalSystemPermission.patient_id == patient.id,
            ExternalSystemPermission.external_system_id
            == external_system_id,
        )
        .first()
    )

    if permission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No permission exists for this external system.",
        )

    # --------------------------------------------------------
    # 4. Delete the permission
    # --------------------------------------------------------

    db.delete(permission)
    db.commit()

    return None


# ============================================================
# LIST CURRENT EXTERNAL-SYSTEM PERMISSIONS
# ============================================================

@router.get(
    "/external-systems",
    response_model=list[ExternalSystemPermissionResponse],
)
def list_external_system_permissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return all external healthcare systems that currently
    have permission to access the authenticated patient's data.
    """

    # --------------------------------------------------------
    # 1. Only patients can view their permissions
    # --------------------------------------------------------

    if current_user.role != "PATIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can view their external-system permissions.",
        )

    # --------------------------------------------------------
    # 2. Make sure the authenticated user has a patient record
    # --------------------------------------------------------

    if current_user.patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient record not found.",
        )

    patient = current_user.patient

    # --------------------------------------------------------
    # 3. Return permissions belonging ONLY to this patient
    # --------------------------------------------------------

    permissions = (
        db.query(ExternalSystemPermission)
        .filter(
            ExternalSystemPermission.patient_id == patient.id
        )
        .all()
    )

    return permissions