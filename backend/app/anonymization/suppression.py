"""
Suppression techniques for research data.

Suppression removes attributes that should not be
included in a research dataset.
"""


SENSITIVE_FIELDS = {
    "national_id",
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "address",
    "emergency_contact_name",
    "emergency_contact_number",
    "medical_aid"
}


def suppress_sensitive_fields(
    record: dict
):
    """
    Remove directly identifying and sensitive fields.
    """

    anonymized = record.copy()

    for field in SENSITIVE_FIELDS:

        anonymized.pop(
            field,
            None
        )

    return anonymized