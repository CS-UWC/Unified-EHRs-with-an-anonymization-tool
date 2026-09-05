"""
Central anonymisation engine.

Combines:
- Generalisation
- Suppression
- Perturbation
"""

from app.anonymization.generalization import (
    generalize_age,
    generalize_province
)

from app.anonymization.suppression import (
    suppress_sensitive_fields
)

from app.anonymization.perturbation import (
    perturb_numeric
)


def anonymize_record(
    record: dict,
    techniques: list[str]
) -> dict:
    """
    Anonymise a single record.

    The original record is never modified.
    """

    anonymised = record.copy()

    # --------------------------------------------------------
    # Generalisation
    # --------------------------------------------------------

    if "generalization" in techniques:

        # Convert date of birth into
        # an age group.

        if "date_of_birth" in anonymised:

            anonymised["age_group"] = generalize_age(
                anonymised.get("date_of_birth")
            )

            anonymised.pop(
                "date_of_birth",
                None
            )

        # Generalise province.

        if "province" in anonymised:

            anonymised["province"] = generalize_province(
                anonymised.get("province")
            )

    # --------------------------------------------------------
    # Suppression
    # --------------------------------------------------------

    if "suppression" in techniques:

        anonymised = suppress_sensitive_fields(
            anonymised
        )

    # --------------------------------------------------------
    # Perturbation
    # --------------------------------------------------------

    if "perturbation" in techniques:

        if "glucose" in anonymised:

            anonymised["glucose"] = perturb_numeric(
                anonymised["glucose"]
            )

    return anonymised


def anonymize_dataset(
    records: list[dict],
    techniques: list[str]
) -> list[dict]:
    """
    Anonymise multiple records.
    """

    return [
        anonymize_record(
            record,
            techniques
        )
        for record in records
    ]