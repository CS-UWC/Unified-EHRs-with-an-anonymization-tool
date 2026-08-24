"""
FHIR Patient Resource.
"""

from typing import List

from pydantic import BaseModel, Field


class HumanName(BaseModel):

    family: str

    given: List[str]


class Identifier(BaseModel):

    system: str

    value: str


class FHIRPatient(BaseModel):

    resourceType: str = "Patient"

    id: str | None = None

    identifier: List[Identifier] = Field(
        default_factory=list
    )

    name: List[HumanName]

    gender: str | None = None

    birthDate: str | None = None