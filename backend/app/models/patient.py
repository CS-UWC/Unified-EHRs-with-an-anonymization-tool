"""
Patient model.
"""

from sqlalchemy import Column
from sqlalchemy import Date
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String

from sqlalchemy.orm import relationship

from app.core.database import Base


class Patient(Base):

    __tablename__ = "patients"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    national_id = Column(
    String,
    unique=True,
    nullable=False,
    index=True
)

    date_of_birth = Column(
        Date,
        nullable=True
    )

    gender = Column(
        String,
        nullable=True
    )

    phone_number = Column(
        String,
        nullable=True
    )

    address = Column(
        String,
        nullable=True
    )

    province = Column(
        String,
        nullable=True
    )

    blood_group = Column(
        String,
        nullable=True
    )

    medical_aid = Column(
        String,
        nullable=True
    )

    emergency_contact_name = Column(
        String,
        nullable=True
    )

    emergency_contact_number = Column(
        String,
        nullable=True
    )

    # ========================================================
    # User relationship
    # ========================================================

    user = relationship(
        "User",
        back_populates="patient"
    )

    # ========================================================
    # Clinical relationships
    # ========================================================

    lab_results = relationship(
        "LabResult",
        back_populates="patient"
    )

    appointments = relationship(
        "Appointment",
        back_populates="patient"
    )

    prescriptions = relationship(
        "Prescription",
        back_populates="patient"
    )

    medical_records = relationship(
        "MedicalRecord",
        back_populates="patient"
    )

    medical_images = relationship(
        "MedicalImage",
        back_populates="patient"
    )