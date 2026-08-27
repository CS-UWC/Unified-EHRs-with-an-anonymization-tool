"""
Research Data Mart schemas.
"""

from pydantic import BaseModel
from typing import List


class ResearchDatasetCreate(BaseModel):

    dataset_name: str

    fields: List[str]

    techniques: List[str]


class ResearchDatasetResponse(BaseModel):

    id: int

    dataset_name: str

    selected_fields: List[str]

    anonymization_techniques: List[str]

    created_at: object

    class Config:

        from_attributes = True