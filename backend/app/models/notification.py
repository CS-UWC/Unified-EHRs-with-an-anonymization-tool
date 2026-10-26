
"""
Notification model for patient-facing EHR notifications.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Notification(Base):
    # Database table that stores notifications for patients.
    __tablename__ = "notifications"

    # Unique identifier for each notification.
    id = Column(Integer, primary_key=True, index=True)

    # Link the notification to the patient who should receive it.
    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    # Short heading displayed in the patient's dashboard.
    title = Column(String(150), nullable=False)

    # Full notification message.
    message = Column(Text, nullable=False)

    # Identifies the kind of notification, such as DIABETES_FOLLOW_UP.
    notification_type = Column(
        String(50),
        nullable=False,
        default="GENERAL",
    )

    # False means the patient has not marked the notification as read.
    is_read = Column(Boolean, nullable=False, default=False)

    # Automatically records when the notification is created.
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Connect this notification to its patient.
    patient = relationship(
        "Patient",
        back_populates="notifications",
    )
