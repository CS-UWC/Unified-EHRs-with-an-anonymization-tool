"""
Research Data Mart model.

Stores anonymized healthcare information for
secondary research and analytics.

IMPORTANT:
This table must not contain direct patient identifiers.
"""

from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import DateTime

from sqlalchemy.sql import func

from app.core.database import Base


class ResearchData(Base):

    __tablename__ = "research_data"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ========================================================
    # Generalized demographic information
    # ========================================================

    age_group = Column(
        String,
        nullable=True
    )

    gender = Column(
        String,
        nullable=True
    )

    province = Column(
        String,
        nullable=True
    )

    # ========================================================
    # Clinical information
    # ========================================================

    blood_group = Column(
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

    # ========================================================
    # Perturbed numerical information
    # ========================================================

    height = Column(
        Float,
        nullable=True
    )

    weight = Column(
        Float,
        nullable=True
    )

    # ========================================================
    # Research metadata
    # ========================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )