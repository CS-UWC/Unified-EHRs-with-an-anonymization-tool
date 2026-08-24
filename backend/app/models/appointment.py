"""
Appointment model
"""
from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey

from app.core.database import Base

from sqlalchemy.orm import relationship


class Appointment(Base):

    __tablename__ = "appointments"


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
        back_populates="appointments"
    )


    doctor_name = Column(
        String,
        nullable=False
    )


    appointment_date = Column(
        String,
        nullable=False
    )


    appointment_time = Column(
        String,
        nullable=False
    )

    description = Column(
        String,
        nullable=False
    )
    


    status = Column(
        String,
        default="Pending"
    )