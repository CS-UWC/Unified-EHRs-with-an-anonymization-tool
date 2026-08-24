"""
Patient schemas.
"""

from datetime import date

from pydantic import BaseModel


class PatientCreate(BaseModel):

    national_id: str | None = None

    date_of_birth: date | None = None

    gender: str | None = None

    address: str | None = None

    province: str | None = None

    phone_number: str | None = None

    blood_group: str | None = None

    medical_aid: str | None = None

    emergency_contact_name: str | None = None

    emergency_contact_number: str | None = None


class PatientResponse(BaseModel):

    id: int

    user_id: int

    national_id: str | None = None

    date_of_birth: date | None = None

    gender: str | None = None

    address: str | None = None

    province: str | None = None

    phone_number: str | None = None

    blood_group: str | None = None

    medical_aid: str | None = None

    emergency_contact_name: str | None = None

    emergency_contact_number: str | None = None

    class Config:

        from_attributes = True


class PatientUpdate(BaseModel):

    national_id: str | None = None

    date_of_birth: date | None = None

    gender: str | None = None

    address: str | None = None

    province: str | None = None

    phone_number: str | None = None

    blood_group: str | None = None

    medical_aid: str | None = None

    emergency_contact_name: str | None = None

    emergency_contact_number: str | None = None