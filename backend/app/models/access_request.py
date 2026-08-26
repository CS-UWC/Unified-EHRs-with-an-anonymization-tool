"""
External-system access requests.

An external system requests access to a patient's EHR.
The patient then approves or rejects the request.
"""

from datetime import datetime

from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String

from sqlalchemy.orm import relationship

from app.core.database import Base


class AccessRequest(Base):

    __tablename__ = "access_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Internal patient ID.
    # Never exposed to external systems.
    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    # User ID representing the external system.
    external_system_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # What the external system is requesting
    requested_read = Column(
        Boolean,
        nullable=False,
        default=False
    )

    requested_write = Column(
        Boolean,
        nullable=False,
        default=False
    )

    # PENDING / APPROVED / REJECTED
    status = Column(
        String,
        nullable=False,
        default="PENDING"
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    responded_at = Column(
        DateTime,
        nullable=True
    )

    patient = relationship(
        "Patient"
    )

    external_system = relationship(
        "User"
    )