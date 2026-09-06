"""
Medical record schemas.
"""

from datetime import datetime

from pydantic import BaseModel


class MedicalRecordCreate(BaseModel):

    blood_type: str
    allergies: str
    current_medications: str
    medical_history: str
    current_conditions: str
    height: str
    weight: str
    emergency_contact: str
    primary_physician: str
    hospital_name: str
    province: str


class MedicalRecordResponse(BaseModel):

    id: int

    patient_id: int

    blood_type: str | None = None
    allergies: str | None = None
    current_medications: str | None = None
    medical_history: str | None = None
    current_conditions: str | None = None
    height: str | None = None
    weight: str | None = None
    emergency_contact: str | None = None
    primary_physician: str | None = None
    hospital_name: str | None = None
    province: str | None = None

    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True