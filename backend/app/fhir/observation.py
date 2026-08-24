"""
FHIR Observation Resource.
"""

from pydantic import BaseModel

from app.fhir.reference import FHIRReference


class ReferenceRange(BaseModel):

    text: str


class FHIRObservation(BaseModel):

    resourceType: str = "Observation"

    # ID is optional when receiving a new Observation.
    # The database will generate the internal ID.
    id: str | None = None

    status: str

    code: str

    value: str

    subject: FHIRReference

    referenceRange: ReferenceRange | None = None

    laboratory: str | None = None