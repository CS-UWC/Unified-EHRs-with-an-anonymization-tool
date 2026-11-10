"""
Schema for registering an external healthcare system.

External systems can represent healthcare organisations
such as hospitals, clinics, laboratories and pharmacies.
"""

from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class ExternalSystemCreate(BaseModel):
    # Name of the healthcare organisation or system.
    organisation_name: str = Field(
        min_length=2,
        max_length=150,
    )

    # Category of the external healthcare provider.
    organisation_type: Literal[
        "PUBLIC_HOSPITAL",
        "PRIVATE_HOSPITAL",
        "CLINIC",
        "LABORATORY",
        "PHARMACY",
        "MEDICAL_PRACTICE",
        "OTHER",
    ]

    # Person responsible for this external-system account.
    contact_first_name: str = Field(
        min_length=2,
        max_length=100,
    )

    contact_last_name: str = Field(
        min_length=2,
        max_length=100,
    )

    # Login email for the external healthcare system.
    email: EmailStr

    # Password used to authenticate the system.
    password: str = Field(
        min_length=8,
        max_length=128,
    )

    # Province in which the organisation operates.
    province: str = Field(
        min_length=2,
        max_length=100,
    )

    # Optional physical address.
    address: str | None = Field(
        default=None,
        max_length=255,
    )