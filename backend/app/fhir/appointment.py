"""
FHIR Appointment Resource.
"""

from typing import List

from pydantic import BaseModel

from app.fhir.reference import FHIRReference


class Participant(BaseModel):

    actor: FHIRReference

    status: str


class FHIRAppointment(BaseModel):

    resourceType: str = "Appointment"

    id: str | None = None

    status: str

    description: str

    participant: List[Participant]

    doctor_name: str | None = None

    appointment_date: str | None = None

    appointment_time: str | None = None