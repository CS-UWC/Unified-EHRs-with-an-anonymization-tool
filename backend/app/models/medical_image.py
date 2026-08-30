"""
Medical image model.

Stores metadata for medical scans/images uploaded
to a patient's EHR.
"""

from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.core.database import Base


class MedicalImage(Base):

    __tablename__ = "medical_images"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ========================================================
    # INTERNAL PATIENT RELATIONSHIP
    # ========================================================

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    patient = relationship(
        "Patient",
        back_populates="medical_images"
    )

    # ========================================================
    # FILE INFORMATION
    # ========================================================

    file_name = Column(
        String,
        nullable=False
    )

    file_path = Column(
        String,
        nullable=False
    )

    content_type = Column(
        String,
        nullable=False
    )

    # ========================================================
    # MEDICAL INFORMATION
    # ========================================================

    scan_type = Column(
        String,
        nullable=True
    )

    description = Column(
        String,
        nullable=True
    )

    # ========================================================
    # TIMESTAMP
    # ========================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )