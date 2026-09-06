"""
Prescription schemas.
"""

from datetime import datetime

from pydantic import BaseModel


class PrescriptionCreate(BaseModel):

    doctor_name: str

    medicine_name: str

    dosage: str

    frequency: str

    duration: str

    instructions: str


class PrescriptionResponse(BaseModel):

    id: int

    patient_id: int

    doctor_name: str

    medicine_name: str

    dosage: str

    frequency: str

    duration: str

    instructions: str

    created_at: datetime | None = None

    class Config:
        from_attributes = True