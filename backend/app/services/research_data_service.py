"""
Service for automatically creating anonymised research data.

The operational EHR remains the source of truth.

Only anonymised information is written to the
research data mart.
"""

from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.medical_record import MedicalRecord
from app.models.research_data import ResearchData

from app.anonymization.engine import anonymize_record


# ============================================================
# AGE CALCULATION
# ============================================================

def calculate_age(
    date_of_birth: Optional[date]
) -> Optional[int]:
    """
    Calculate a patient's age from their date of birth.
    """

    if not date_of_birth:
        return None

    today = date.today()

    age = (
        today.year
        - date_of_birth.year
    )

    if (
        (today.month, today.day)
        <
        (date_of_birth.month, date_of_birth.day)
    ):
        age -= 1

    return age


# ============================================================
# CREATE RESEARCH DATA FROM MEDICAL RECORD
# ============================================================

def create_research_data(
    db: Session,
    patient: Patient,
    medical_record: MedicalRecord
):
    """
    Create an anonymised research record from a
    clinical MedicalRecord.

    IMPORTANT:
    - Patient identifiers are never copied.
    - The original MedicalRecord is never modified.
    - The research record is anonymised before storage.
    """

    record = {

        # Used by generalisation to create age_group.
        "date_of_birth": (
            patient.date_of_birth
        ),

        "gender": (
            patient.gender
        ),

        "province": (
            medical_record.province
            or getattr(
                patient,
                "province",
                None
            )
        ),

        "disease": (
            medical_record.current_conditions
        ),

        "blood_type": (
            medical_record.blood_type
            or getattr(
                patient,
                "blood_group",
                None
            )
        ),

        "allergies": (
            medical_record.allergies
        ),

        "current_medications": (
            medical_record.current_medications
        ),

        "medical_history": (
            medical_record.medical_history
        ),

        # MedicalRecord currently stores these
        # as String values.
        #
        # Therefore perturbation does not apply
        # to them yet.
        "height": (
            medical_record.height
        ),

        "weight": (
            medical_record.weight
        ),
    }

    # --------------------------------------------------------
    # Run all anonymisation techniques
    # --------------------------------------------------------

    anonymised = anonymize_record(

        record,

        techniques=[
            "generalization",
            "suppression",
            "perturbation"
        ]

    )

    # --------------------------------------------------------
    # Create research record
    #
    # Only fields that exist in ResearchData are copied.
    #
    # No patient_id, national_id, name, email, etc.
    # are stored.
    # --------------------------------------------------------

    research_record = ResearchData(

        age_group=(
            anonymised.get("age_group")
        ),

        gender=(
            anonymised.get("gender")
        ),

        province=(
            anonymised.get("province")
        ),

        disease=(
            anonymised.get("disease")
        ),

        blood_type=(
            anonymised.get("blood_type")
        ),

        allergies=(
            anonymised.get("allergies")
        ),

        current_medications=(
            anonymised.get(
                "current_medications"
            )
        ),

        medical_history=(
            anonymised.get(
                "medical_history"
            )
        ),

        # Height and weight remain NULL for now
        # because MedicalRecord stores them as String.
        height=None,

        weight=None,

        glucose=(
            anonymised.get("glucose")
        )
    )

    db.add(
        research_record
    )

    # Do NOT commit here.
    #
    # The FHIR endpoint should commit the clinical
    # record and research record together.
    db.flush()

    return research_record


# ============================================================
# CREATE RESEARCH DATA FROM OBSERVATION
# ============================================================

def create_research_data_from_observation(
    db: Session,
    patient: Patient,
    test_name: Optional[str],
    result: Optional[str],
    status: Optional[str] = None,
    laboratory_name: Optional[str] = None
):
    """
    Create an anonymised research record from an
    incoming FHIR Observation.

    This is particularly useful for laboratory results
    such as glucose measurements.
    """

    glucose = None

    # --------------------------------------------------------
    # Detect glucose observations.
    #
    # The incoming result is converted to float only when
    # the test is identified as glucose.
    # --------------------------------------------------------

    if test_name:

        test_name_lower = test_name.lower()

        if "glucose" in test_name_lower:

            try:

                glucose = float(result)

            except (
                TypeError,
                ValueError
            ):

                glucose = None

    record = {

        "date_of_birth": (
            patient.date_of_birth
        ),

        "gender": (
            patient.gender
        ),

        "province": (
            getattr(
                patient,
                "province",
                None
            )
        ),

        "disease": None,

        "blood_type": (
            getattr(
                patient,
                "blood_group",
                None
            )
        ),

        "allergies": None,

        "current_medications": None,

        "medical_history": None,

        "glucose": glucose
    }

    # --------------------------------------------------------
    # Anonymise
    # --------------------------------------------------------

    anonymised = anonymize_record(

        record,

        techniques=[
            "generalization",
            "suppression",
            "perturbation"
        ]

    )

    # --------------------------------------------------------
    # Create ResearchData
    # --------------------------------------------------------

    research_record = ResearchData(

        age_group=(
            anonymised.get("age_group")
        ),

        gender=(
            anonymised.get("gender")
        ),

        province=(
            anonymised.get("province")
        ),

        disease=(
            anonymised.get("disease")
        ),

        blood_type=(
            anonymised.get("blood_type")
        ),

        allergies=(
            anonymised.get("allergies")
        ),

        current_medications=(
            anonymised.get(
                "current_medications"
            )
        ),

        medical_history=(
            anonymised.get(
                "medical_history"
            )
        ),

        height=None,

        weight=None,

        glucose=(
            anonymised.get("glucose")
        )
    )

    db.add(
        research_record
    )

    db.flush()

    return research_record


# ============================================================
# CREATE RESEARCH DATA FROM PRESCRIPTION
# ============================================================

def create_research_data_from_prescription(
    db: Session,
    patient: Patient,
    medicine_name: Optional[str],
    dosage: Optional[str],
    frequency: Optional[str],
    duration: Optional[str]
):
    """
    Create an anonymised research record from an
    incoming prescription.

    Prescription-specific fields are represented as
    research medication information because the current
    ResearchData model does not have separate prescription
    columns.
    """

    medication = medicine_name

    if dosage:
        medication = (
            f"{medication or ''} "
            f"{dosage}"
        ).strip()

    if frequency:
        medication = (
            f"{medication or ''} "
            f"{frequency}"
        ).strip()

    if duration:
        medication = (
            f"{medication or ''} "
            f"for {duration}"
        ).strip()

    record = {

        "date_of_birth": (
            patient.date_of_birth
        ),

        "gender": (
            patient.gender
        ),

        "province": (
            getattr(
                patient,
                "province",
                None
            )
        ),

        "disease": None,

        "blood_type": (
            getattr(
                patient,
                "blood_group",
                None
            )
        ),

        "allergies": None,

        "current_medications": medication,

        "medical_history": None
    }

    anonymised = anonymize_record(

        record,

        techniques=[
            "generalization",
            "suppression",
            "perturbation"
        ]

    )

    research_record = ResearchData(

        age_group=(
            anonymised.get("age_group")
        ),

        gender=(
            anonymised.get("gender")
        ),

        province=(
            anonymised.get("province")
        ),

        disease=(
            anonymised.get("disease")
        ),

        blood_type=(
            anonymised.get("blood_type")
        ),

        allergies=(
            anonymised.get("allergies")
        ),

        current_medications=(
            anonymised.get(
                "current_medications"
            )
        ),

        medical_history=(
            anonymised.get(
                "medical_history"
            )
        ),

        height=None,

        weight=None,

        glucose=None
    )

    db.add(
        research_record
    )

    db.flush()

    return research_record

