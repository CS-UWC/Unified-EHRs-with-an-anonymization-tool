"""
Lab results model.
"""

from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime

from sqlalchemy.sql import func

from app.core.database import Base

from sqlalchemy.orm import relationship


class LabResult(Base):

    __tablename__ = "lab_results"

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
        back_populates="lab_results"
    )

    test_name = Column(
        String,
        nullable=False
    )

    result = Column(
        String,
        nullable=False
    )

    normal_range = Column(
        String,
        nullable=False
    )

    laboratory_name = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="Completed"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )