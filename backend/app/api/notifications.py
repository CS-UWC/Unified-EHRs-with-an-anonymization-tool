
"""
Patient notification API.

Patients can view and mark as read only their own notifications.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.notification import Notification


# Create the router for notification endpoints.
router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get("/")
def get_my_notifications(
    # Get the authenticated user from the access token.
    current_user: User = Depends(get_current_user),

    # Get a database session for this request.
    db: Session = Depends(get_db),
):
    """Return notifications belonging to the logged-in patient."""

    # Only patient accounts can use these endpoints.
    if current_user.role != "PATIENT":
        raise HTTPException(
            status_code=403,
            detail="Only patients can access patient notifications.",
        )

    # Confirm that this user has an associated patient profile.
    patient = current_user.patient

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found.",
        )

    # Query using the authenticated patient's ID, never a supplied patient ID.
    notifications = (
        db.query(Notification)
        .filter(Notification.patient_id == patient.id)
        .order_by(desc(Notification.created_at))
        .all()
    )

    # Return only the fields the patient needs to see.
    return [
        {
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "is_read": notification.is_read,
            "created_at": notification.created_at,
        }
        for notification in notifications
    ]


@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    # Identify which notification the patient wants to mark as read.
    notification_id: int,

    # Authenticate the requesting user.
    current_user: User = Depends(get_current_user),

    # Open a database session.
    db: Session = Depends(get_db),
):
    """Mark one of the logged-in patient's notifications as read."""

    # Restrict this endpoint to patient accounts.
    if current_user.role != "PATIENT":
        raise HTTPException(
            status_code=403,
            detail="Only patients can update patient notifications.",
        )

    # Ensure the authenticated user has a patient profile.
    patient = current_user.patient

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found.",
        )

    # Match both IDs so a patient cannot modify someone else's notification.
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.patient_id == patient.id,
        )
        .first()
    )

    # Return the same not-found response for missing and other patients' records.
    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    # Update the read status and save it.
    notification.is_read = True
    db.commit()
    db.refresh(notification)

    # Confirm the update.
    return {
        "message": "Notification marked as read.",
        "id": notification.id,
        "is_read": notification.is_read,
    }
