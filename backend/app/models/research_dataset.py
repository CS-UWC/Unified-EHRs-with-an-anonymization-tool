"""
Research Data Mart dataset model.

Stores anonymized datasets generated for researchers.
Raw patient identifiers must never be stored here.
"""

from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey

from sqlalchemy.sql import func

from sqlalchemy.orm import relationship

from app.core.database import Base


class ResearchDataset(Base):

    __tablename__ = "research_datasets"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Researcher who generated the dataset
    researcher_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    dataset_name = Column(
        String,
        nullable=False
    )

    # JSON representation of selected fields
    selected_fields = Column(
        Text,
        nullable=False
    )

    # JSON representation of anonymization techniques
    anonymization_techniques = Column(
        Text,
        nullable=False
    )

    # Anonymized dataset
    dataset_json = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    researcher = relationship(
        "User"
    )