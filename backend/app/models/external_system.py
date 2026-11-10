"""
External healthcare system model.

Stores organisation-specific information for authorised
external healthcare providers participating in the
Unified EHR system.
"""

from sqlalchemy import Column, ForeignKey, Integer, String

from sqlalchemy.orm import relationship

from app.core.database import Base


class ExternalSystem(Base):
    # Database table name.
    __tablename__ = "external_systems"

    # Unique identifier for this external healthcare system.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Link this profile to its EXTERNAL_SYSTEM user account.
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
    )

    # Name of the healthcare organisation.
    organisation_name = Column(
        String(150),
        nullable=False,
    )

    # Type of healthcare organisation.
    organisation_type = Column(
        String(50),
        nullable=False,
    )

    # South African province where the organisation operates.
    province = Column(
        String(100),
        nullable=False,
    )

    # Optional physical address.
    address = Column(
        String(255),
        nullable=True,
    )

    # Connect this external-system profile to its user account.
    user = relationship(
        "User",
        back_populates="external_system",
    )