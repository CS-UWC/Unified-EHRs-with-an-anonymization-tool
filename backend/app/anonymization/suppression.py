"""
Suppression techniques for anonymisation.

Suppression removes information that can directly identify
an individual or unnecessarily increase re-identification risk.
"""


# Fields that must never be stored in the research data mart.
SENSITIVE_FIELDS = {
    "id",
    "patient_id",
    "user_id",
    "national_id",
    "name",
    "first_name",
    "last_name",
    "full_name",
    "email",
    "phone",
    "phone_number",
    "address",
    "emergency_contact",
    "emergency_contact_name",
    "emergency_contact_number",
    "doctor_name",
    "primary_physician",
    "hospital_name",
    "laboratory_name",
}


def suppress_sensitive_fields(
    record: dict
) -> dict:
    """
    Remove direct identifiers from a record.

    Returns a new dictionary and does not modify
    the original record.
    """

    anonymised = record.copy()

    for field in SENSITIVE_FIELDS:
        anonymised.pop(field, None)

    return anonymised