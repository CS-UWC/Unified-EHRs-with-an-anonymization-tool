"""
FHIR DiagnosticReport Resource.
"""

from pydantic import BaseModel

from app.fhir.reference import FHIRReference


class FHIRDiagnosticReport(BaseModel):

    resourceType: str = "DiagnosticReport"

    id: str | None = None

    status: str

    conclusion: str

    subject: FHIRReference