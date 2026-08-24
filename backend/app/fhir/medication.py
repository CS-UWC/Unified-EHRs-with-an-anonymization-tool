"""
FHIR MedicationRequest Resource.
"""

from pydantic import BaseModel

from app.fhir.reference import FHIRReference


class FHIRMedicationRequest(BaseModel):

    resourceType: str = "MedicationRequest"

    id: str | None = None

    medication: str

    status: str = "active"

    intent: str = "order"

    subject: FHIRReference

    doctor_name: str | None = None

    dosage: str | None = None

    frequency: str | None = None

    duration: str | None = None

    instructions: str | None = None