"""
Generalization techniques for research data.

Generalization reduces the precision of identifying
attributes while retaining useful information.
"""


from datetime import date


def generalize_age(
    date_of_birth: date | None
):
    """
    Convert date of birth into an age group.

    Example:
        1998-05-10 -> 20-29
    """

    if date_of_birth is None:
        return None

    today = date.today()

    age = (
        today.year
        - date_of_birth.year
        - (
            (today.month, today.day)
            < (
                date_of_birth.month,
                date_of_birth.day
            )
        )
    )

    lower = (age // 10) * 10
    upper = lower + 9

    return f"{lower}-{upper}"


def generalize_province(
    province: str | None
):
    """
    Keep province at a broad geographic level.

    For the current prototype, South African provinces
    are retained because they are useful for research.

    This function provides a central place to introduce
    broader geographic generalization later.
    """

    if not province:
        return None

    return province