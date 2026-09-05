"""
Generalisation techniques for anonymisation.

Generalisation reduces the precision of identifying
information while retaining useful information for research.
"""

from datetime import date
from typing import Optional


def calculate_age(
    date_of_birth: Optional[date]
) -> Optional[int]:
    """
    Calculate age from date of birth.
    """

    if date_of_birth is None:
        return None

    today = date.today()

    age = today.year - date_of_birth.year

    if (
        today.month,
        today.day
    ) < (
        date_of_birth.month,
        date_of_birth.day
    ):
        age -= 1

    return age


def generalize_age(
    date_of_birth: Optional[date]
) -> Optional[str]:
    """
    Generalise a patient's age into an age group.

    Example:

        23 -> 18-24
        31 -> 25-34
        42 -> 35-44
    """

    age = calculate_age(date_of_birth)

    if age is None:
        return None

    if age < 18:
        return "Under 18"

    if age <= 24:
        return "18-24"

    if age <= 34:
        return "25-34"

    if age <= 44:
        return "35-44"

    if age <= 54:
        return "45-54"

    if age <= 64:
        return "55-64"

    return "65+"


def generalize_province(
    province: Optional[str]
) -> Optional[str]:
    """
    Generalise a province value.

    For the current implementation, province-level
    information is retained because province is an
    important research attribute.

    Unknown or missing values are represented as
    'Unknown'.
    """

    if not province:
        return "Unknown"

    province = province.strip()

    if not province:
        return "Unknown"

    return province