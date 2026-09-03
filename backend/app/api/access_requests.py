"""
External-system access request API.

External systems request access using the patient's
national ID.

Patients approve or reject those requests.
"""

from datetime import datetime

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.dependencies import get_db

from app.models.user import User
from app.models.patient import Patient

from app.models.access_request import (
    AccessRequest
)

from app.models.external_system_permission import (
    ExternalSystemPermission
)

from app.schemas.access_request import (
    AccessRequestCreate
)

from app.core.dependencies import (
    get_current_user
)


router = APIRouter(
    prefix="/access-requests",
    tags=["Access Requests"]
)


# ============================================================
# EXTERNAL SYSTEM REQUESTS ACCESS
# ============================================================

@router.post("/")
def create_access_request(

    request: AccessRequestCreate,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    # --------------------------------------------------------
    # Only external systems can request external-system access
    # --------------------------------------------------------

    if current_user.role != "EXTERNAL_SYSTEM":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only external systems can "
                "request patient access."
            )
        )

    # --------------------------------------------------------
    # At least one permission must be requested
    # --------------------------------------------------------

    if not request.can_read and not request.can_write:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Request must ask for read "
                "and/or write access."
            )
        )

    # --------------------------------------------------------
    # Find patient using NATIONAL ID
    # --------------------------------------------------------

    patient = (
        db.query(Patient)
        .filter(
            Patient.national_id == request.national_id
        )
        .first()
    )

    if not patient:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found."
        )

    # --------------------------------------------------------
    # Check whether active permission already exists
    # --------------------------------------------------------

    existing_permission = (
        db.query(
            ExternalSystemPermission
        )
        .filter(
            ExternalSystemPermission.external_system_id
            == current_user.id,

            ExternalSystemPermission.patient_id
            == patient.id,

            ExternalSystemPermission.revoked_at
            .is_(None)
        )
        .first()
    )

    if existing_permission:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This external system already "
                "has active permission."
            )
        )

    # --------------------------------------------------------
    # Check for an existing pending request
    # --------------------------------------------------------

    existing_request = (
        db.query(AccessRequest)
        .filter(
            AccessRequest.external_system_id
            == current_user.id,

            AccessRequest.patient_id
            == patient.id,

            AccessRequest.status
            == "PENDING"
        )
        .first()
    )

    if existing_request:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "A pending access request "
                "already exists."
            )
        )

    # --------------------------------------------------------
    # Create request
    # --------------------------------------------------------

    new_request = AccessRequest(

        patient_id=patient.id,

        external_system_id=current_user.id,

        requested_read=request.can_read,

        requested_write=request.can_write,

        status="PENDING"

    )

    db.add(
        new_request
    )

    db.commit()

    db.refresh(
        new_request
    )

    return {
        "message": (
            "Access request sent to patient."
        ),
        "request_id": new_request.id,
        "status": new_request.status
    }


# ============================================================
# PATIENT VIEW PENDING REQUESTS
# ============================================================

@router.get("/")
def get_my_access_requests(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    # --------------------------------------------------------
    # Only patients can view their incoming requests
    # --------------------------------------------------------

    if current_user.role != "PATIENT":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only patients can view "
                "access requests."
            )
        )

    if current_user.patient is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found."
        )

    requests = (
        db.query(AccessRequest)
        .filter(
            AccessRequest.patient_id
            == current_user.patient.id,

            # Do not show revoked permissions
            AccessRequest.status != "REVOKED"
        )
        .order_by(
            AccessRequest.created_at.desc()
        )
        .all()
    )

    return [
        {
            "request_id": request.id,

            "external_system_id":
                request.external_system_id,

            "requested_read":
                request.requested_read,

            "requested_write":
                request.requested_write,

            "status":
                request.status,

            "created_at":
                request.created_at,

            "responded_at":
                request.responded_at
        }

        for request in requests
    ]


# ============================================================
# PATIENT APPROVES REQUEST
# ============================================================

@router.post(
    "/{request_id}/approve"
)
def approve_access_request(

    request_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    # --------------------------------------------------------
    # Only patients can approve requests
    # --------------------------------------------------------

    if current_user.role != "PATIENT":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only patients can approve "
                "access requests."
            )
        )

    if current_user.patient is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found."
        )

    # --------------------------------------------------------
    # Find request
    # --------------------------------------------------------

    request = (
        db.query(AccessRequest)
        .filter(
            AccessRequest.id == request_id,

            AccessRequest.patient_id
            == current_user.patient.id
        )
        .first()
    )

    if not request:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access request not found."
        )

    # --------------------------------------------------------
    # Request must still be pending
    # --------------------------------------------------------

    if request.status != "PENDING":

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This access request has "
                "already been processed."
            )
        )

    # --------------------------------------------------------
    # Create/update permission
    # --------------------------------------------------------

    permission = (
        db.query(
            ExternalSystemPermission
        )
        .filter(
            ExternalSystemPermission.external_system_id
            == request.external_system_id,

            ExternalSystemPermission.patient_id
            == request.patient_id
        )
        .first()
    )

    if permission:

        permission.can_read = (
            request.requested_read
        )

        permission.can_write = (
            request.requested_write
        )

        permission.revoked_at = None

        permission.granted_at = (
            datetime.utcnow()
        )

    else:

        permission = ExternalSystemPermission(

            external_system_id=
                request.external_system_id,

            patient_id=
                request.patient_id,

            can_read=
                request.requested_read,

            can_write=
                request.requested_write

        )

        db.add(
            permission
        )

    # --------------------------------------------------------
    # Mark request approved
    # --------------------------------------------------------

    request.status = "APPROVED"

    request.responded_at = (
        datetime.utcnow()
    )

    db.commit()

    return {
        "message": (
            "Access request approved."
        ),
        "request_id": request.id,
        "can_read": request.requested_read,
        "can_write": request.requested_write
    }


# ============================================================
# PATIENT REJECTS REQUEST
# ============================================================

@router.post(
    "/{request_id}/reject"
)
def reject_access_request(

    request_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    # --------------------------------------------------------
    # Only patients can reject requests
    # --------------------------------------------------------

    if current_user.role != "PATIENT":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only patients can reject "
                "access requests."
            )
        )

    if current_user.patient is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found."
        )

    # --------------------------------------------------------
    # Find request belonging to this patient
    # --------------------------------------------------------

    request = (
        db.query(AccessRequest)
        .filter(
            AccessRequest.id == request_id,

            AccessRequest.patient_id
            == current_user.patient.id
        )
        .first()
    )

    if not request:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access request not found."
        )

    if request.status != "PENDING":

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This access request has "
                "already been processed."
            )
        )

    # --------------------------------------------------------
    # Reject
    # --------------------------------------------------------

    request.status = "REJECTED"

    request.responded_at = (
        datetime.utcnow()
    )

    db.commit()

    return {
        "message": (
            "Access request rejected."
        ),
        "request_id": request.id,
        "status": request.status
    }

# ============================================================
# PATIENT REVOKES APPROVED ACCESS
# ============================================================

@router.delete(
    "/permission/{external_system_id}"
)
def revoke_external_system_access(

    external_system_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    # --------------------------------------------------------
    # Only patients can revoke external-system access
    # --------------------------------------------------------

    if current_user.role != "PATIENT":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only patients can revoke "
                "external-system access."
            )
        )

    # --------------------------------------------------------
    # Patient must have a patient profile
    # --------------------------------------------------------

    if current_user.patient is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found."
        )

    patient = current_user.patient

    # --------------------------------------------------------
    # Find active permission belonging to this patient
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # No active permission
    # --------------------------------------------------------

    if not permission:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "No active permission exists "
                "for this external system."
            )
        )

    # --------------------------------------------------------
    # Revoke permission
    # --------------------------------------------------------

    permission.can_read = False

    permission.can_write = False

    permission.revoked_at = datetime.utcnow()

    # --------------------------------------------------------
    # Mark the corresponding access request as REVOKED
    #
    # We keep the request in the database for audit purposes,
    # but it will no longer appear in GET /access-requests/.
    # --------------------------------------------------------

    access_request = (
        db.query(AccessRequest)
        .filter(

            AccessRequest.patient_id
            == patient.id,

            AccessRequest.external_system_id
            == external_system_id,

            AccessRequest.status
            == "APPROVED"

        )
        .order_by(
            AccessRequest.responded_at.desc()
        )
        .first()
    )

    if access_request:

        access_request.status = "REVOKED"

        access_request.responded_at = (
            datetime.utcnow()
        )

    # --------------------------------------------------------
    # Save changes
    # --------------------------------------------------------

    db.commit()

    db.refresh(permission)

    return {

        "message": (
            "External system access "
            "has been revoked."
        ),

        "external_system_id":
            permission.external_system_id,

        "patient_id":
            permission.patient.national_id,

        "can_read":
            permission.can_read,

        "can_write":
            permission.can_write,

        "revoked_at":
            permission.revoked_at

    }