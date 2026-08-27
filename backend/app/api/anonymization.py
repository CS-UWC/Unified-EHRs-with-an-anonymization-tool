"""
Anonymization API.

Provides researchers with controlled access to
anonymized healthcare data.

Raw patient-identifiable data is never returned
through these endpoints.
"""

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.dependencies import get_db

from app.core.dependencies import get_current_user

from app.core.authorization import require_role

from app.models.user import User
from app.models.patient import Patient
from app.models.medical_record import MedicalRecord
from app.models.lab_result import LabResult
from app.models.appointment import Appointment
from app.models.prescription import Prescription

from app.anonymization.engine import anonymize_dataset

from app.schemas.anonymization import (
    AnonymizationRequest,
    AnonymizationResponse
)


router = APIRouter(
    prefix="/anonymization",
    tags=["Anonymization"]
)


# ============================================================
# BUILD RESEARCH DATASET
# ============================================================

def build_research_dataset(
    db: Session
):
    """
    Build a dataset from the EHR for research purposes.

    IMPORTANT:
    This function creates a research-oriented representation
    of the data.

    Internal patient IDs are NOT included.
    National IDs are NOT included.
    User IDs are NOT included.
    """

    patients = (
        db.query(Patient)
        .all()
    )

    dataset = []

    for patient in patients:

        # ----------------------------------------------------
        # Patient information
        # ----------------------------------------------------

        base_record = {

            "date_of_birth":
                patient.date_of_birth,

            "gender":
                patient.gender,

            "province":
                patient.province,

            "blood_group":
                patient.blood_group

        }

        # ----------------------------------------------------
        # Medical records
        # ----------------------------------------------------

        medical_records = (

            db.query(MedicalRecord)

            .filter(
                MedicalRecord.patient_id
                == patient.id
            )

            .all()

        )

        # ----------------------------------------------------
        # Lab results
        # ----------------------------------------------------

        lab_results = (

            db.query(LabResult)

            .filter(
                LabResult.patient_id
                == patient.id
            )

            .all()

        )

        # ----------------------------------------------------
        # If medical records exist
        # ----------------------------------------------------

        if medical_records:

            for record in medical_records:

                research_record = base_record.copy()

                research_record.update({

                    "allergies":
                        record.allergies,

                    "current_medications":
                        record.current_medications,

                    "medical_history":
                        record.medical_history,

                    "current_conditions":
                        record.current_conditions,

                    "height":
                        record.height,

                    "weight":
                        record.weight

                })

                dataset.append(
                    research_record
                )

        # ----------------------------------------------------
        # Otherwise create patient-level record
        # ----------------------------------------------------

        else:

            dataset.append(
                base_record
            )

        # ----------------------------------------------------
        # Add laboratory information
        # ----------------------------------------------------

        for lab in lab_results:

            lab_record = base_record.copy()

            lab_record.update({

                "test_name":
                    lab.test_name,

                "result":
                    lab.result,

                "normal_range":
                    lab.normal_range,

                "laboratory_name":
                    lab.laboratory_name,

                "status":
                    lab.status

            })

            # If the result is numeric glucose,
            # expose it separately for perturbation.

            if (
                lab.test_name
                and
                lab.test_name.lower()
                == "glucose"
            ):

                try:

                    lab_record["glucose"] = float(
                        lab.result
                        .split()[0]
                    )

                except (
                    ValueError,
                    AttributeError,
                    IndexError
                ):

                    pass

            dataset.append(
                lab_record
            )

    return dataset


# ============================================================
# ANONYMIZE DATASET
# ============================================================

@router.post(
    "/anonymize",
    response_model=AnonymizationResponse
)
def anonymize_ehr_dataset(

    request: AnonymizationRequest,

    current_user: User = Depends(
        require_role(
            "RESEARCHER",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    # --------------------------------------------------------
    # Validate techniques
    # --------------------------------------------------------

    if not request.techniques:

        raise HTTPException(
            status_code=400,
            detail=(
                "At least one anonymization "
                "technique must be selected."
            )
        )

    # --------------------------------------------------------
    # Build research dataset
    # --------------------------------------------------------

    dataset = build_research_dataset(
        db
    )

    if not dataset:

        return {
            "records": [],
            "record_count": 0,
            "techniques": request.techniques
        }

    # --------------------------------------------------------
    # Apply anonymization
    # --------------------------------------------------------

    anonymized_dataset = anonymize_dataset(

        dataset,

        request.techniques

    )

    # --------------------------------------------------------
    # Return anonymized data
    # --------------------------------------------------------

    return {

        "records":
            anonymized_dataset,

        "record_count":
            len(anonymized_dataset),

        "techniques":
            request.techniques

    }