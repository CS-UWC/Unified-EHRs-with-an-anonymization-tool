"""
Schemas for patient-controlled external-system permissions.
"""

from pydantic import BaseModel, ConfigDict


class ExternalSystemPermissionCreate(BaseModel):
    external_system_id: int
    can_read: bool = False
    can_write: bool = False


class ExternalSystemPermissionResponse(BaseModel):
    id: int
    patient_id: int
    external_system_id: int
    can_read: bool
    can_write: bool

    model_config = ConfigDict(from_attributes=True)