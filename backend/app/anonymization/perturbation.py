"""
Perturbation techniques for research data.

Perturbation introduces controlled changes to
numeric values while preserving their usefulness
for statistical analysis.
"""

import random


def perturb_numeric(
    value,
    percentage: float = 0.05
):
    """
    Apply controlled random perturbation.

    Example:
        5.2 -> approximately 5.0-5.4

    Non-numeric values are returned unchanged.
    """

    if value is None:
        return None

    try:

        numeric_value = float(value)

    except (
        TypeError,
        ValueError
    ):

        return value

    variation = (
        numeric_value
        * percentage
    )

    return round(
        numeric_value
        + random.uniform(
            -variation,
            variation
        ),
        2
    )