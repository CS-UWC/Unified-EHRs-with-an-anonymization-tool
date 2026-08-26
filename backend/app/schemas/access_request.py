"""
Schemas for external-system access requests.
"""

from datetime import datetime

from pydantic import BaseModel


class AccessRequestCreate(BaseModel):

    national_id: str

    can_read: bool = False

    can_write: bool = False


class AccessRequestResponse(BaseModel):

    id: int

    external_system_id: int

    patient_id: int

    requested_read: bool

    requested_write: bool

    status: str

    created_at: datetime

    responded_at: datetime | None

    class Config:

        from_attributes = True