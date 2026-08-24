"""
FHIR reference models.
"""

from typing import Optional

from pydantic import BaseModel


class FHIRReferenceIdentifier(BaseModel):

    system: str

    value: str


class FHIRReference(BaseModel):

    reference: Optional[str] = None

    identifier: Optional[FHIRReferenceIdentifier] = None