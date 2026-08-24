"""prescription model
"""

from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime

from sqlalchemy.sql import func

from app.core.database import Base

from sqlalchemy.orm import relationship


class Prescription(Base):

    __tablename__ = "prescriptions"


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
        back_populates="prescriptions"
    )


    doctor_name = Column(
        String,
        nullable=False
    )


    medicine_name = Column(
        String,
        nullable=False
    )


    dosage = Column(
        String,
        nullable=False
    )


    frequency = Column(
        String,
        nullable=False
    )


    duration = Column(
        String,
        nullable=False
    )


    instructions = Column(
        String,
        nullable=False
    )


    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )