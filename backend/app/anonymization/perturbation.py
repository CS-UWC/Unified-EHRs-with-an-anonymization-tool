"""
Perturbation techniques for anonymisation.

Perturbation modifies numerical values slightly so that
individual values are not preserved exactly while the
overall research usefulness of the data is retained.
"""

import random

from typing import Optional


def perturb_numeric(
    value: Optional[float],
    percentage: float = 0.05
) -> Optional[float]:
    """
    Perturb a numerical value by a small random amount.

    The default perturbation is ±5%.

    Example:

        8.0 -> approximately 7.6 to 8.4
    """

    if value is None:
        return None

    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        return None

    if numeric_value == 0:
        return 0.0

    variation = numeric_value * percentage

    perturbed_value = random.uniform(
        numeric_value - variation,
        numeric_value + variation
    )

    return round(
        perturbed_value,
        2
    )