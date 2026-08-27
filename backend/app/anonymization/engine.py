"""
Central anonymization engine.

Combines:
- Generalization
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
):
    """
    Anonymize a single EHR record.

    Supported techniques:
        generalization
        suppression
        perturbation
    """

    anonymized = record.copy()

    # ========================================================
    # GENERALIZATION
    # ========================================================

    if "generalization" in techniques:

        if "date_of_birth" in anonymized:

            anonymized["age_group"] = (
                generalize_age(
                    anonymized.get(
                        "date_of_birth"
                    )
                )
            )

            anonymized.pop(
                "date_of_birth",
                None
            )

        if "province" in anonymized:

            anonymized["province"] = (
                generalize_province(
                    anonymized.get(
                        "province"
                    )
                )
            )

    # ========================================================
    # SUPPRESSION
    # ========================================================

    if "suppression" in techniques:

        anonymized = (
            suppress_sensitive_fields(
                anonymized
            )
        )

    # ========================================================
    # PERTURBATION
    # ========================================================

    if "perturbation" in techniques:

        if "glucose" in anonymized:

            anonymized["glucose"] = (
                perturb_numeric(
                    anonymized["glucose"]
                )
            )

    return anonymized


def anonymize_dataset(
    records: list[dict],
    techniques: list[str]
):
    """
    Anonymize an entire dataset.
    """

    return [

        anonymize_record(
            record,
            techniques
        )

        for record in records

    ]