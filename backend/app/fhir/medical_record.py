"""
FHIR Medical Record Resource.
"""

from pydantic import BaseModel

from app.fhir.reference import FHIRReference


class FHIRMedicalRecord(BaseModel):

    resourceType: str = "DiagnosticReport"

    id: str | None = None

    status: str = "final"

    conclusion: str

    subject: FHIRReference