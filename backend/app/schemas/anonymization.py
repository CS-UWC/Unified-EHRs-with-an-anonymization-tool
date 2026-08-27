"""
Anonymization API schemas.
"""

from pydantic import BaseModel
from typing import Literal


class AnonymizationRequest(BaseModel):

    techniques: list[
        Literal[
            "generalization",
            "suppression",
            "perturbation"
        ]
    ]


class AnonymizedRecord(BaseModel):

    data: dict


class AnonymizationResponse(BaseModel):

    records: list[dict]

    record_count: int

    techniques: list[str]