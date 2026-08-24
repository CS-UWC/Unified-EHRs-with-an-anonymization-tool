"""
Medical record model.
"""

from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime

from sqlalchemy.sql import func

from app.core.database import Base

from sqlalchemy.orm import relationship


class MedicalRecord(Base):

    __tablename__ = "medical_records"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    patient = relationship(
        "Patient",
        back_populates="medical_records"
    )

    blood_type = Column(
        String,
        nullable=True
    )

    allergies = Column(
        String,
        nullable=True
    )

    current_medications = Column(
        String,
        nullable=True
    )

    medical_history = Column(
        String,
        nullable=True
    )

    current_conditions = Column(
        String,
        nullable=True
    )

    height = Column(
        String,
        nullable=True
    )

    weight = Column(
        String,
        nullable=True
    )

    emergency_contact = Column(
        String,
        nullable=True
    )

    primary_physician = Column(
        String,
        nullable=True
    )

    hospital_name = Column(
        String,
        nullable=True
    )

    province = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )