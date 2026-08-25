"""
Patient-controlled permissions for external systems.

A patient explicitly grants an external system permission
to read and/or write their EHR data.
"""

from datetime import datetime

from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer

from sqlalchemy.orm import relationship

from app.core.database import Base


class ExternalSystemPermission(Base):

    __tablename__ = "external_system_permissions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # The external system's User record
    external_system_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Internal Patient ID
    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    # Patient controls these permissions
    can_read = Column(
        Boolean,
        nullable=False,
        default=False
    )

    can_write = Column(
        Boolean,
        nullable=False,
        default=False
    )

    # When permission was granted
    granted_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    # NULL = currently active
    revoked_at = Column(
        DateTime,
        nullable=True
    )

    external_system = relationship(
        "User"
    )

    patient = relationship(
        "Patient"
    ) 