"""
Research Data Mart API.

Researchers can request anonymized healthcare datasets.

Important:
- Only RESEARCHER and ADMIN users can access these endpoints.
- Direct patient identifiers are never included in datasets.
- Raw EHR data remains unchanged.
"""

import json

from datetime import datetime

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.dependencies import get_db

from app.core.dependencies import get_current_user
from app.core.authorization import require_role

from app.models.user import User
from app.models.patient import Patient
from app.models.lab_result import LabResult
from app.models.medical_record import MedicalRecord
from app.models.prescription import Prescription
from app.models.appointment import Appointment
from app.models.research_dataset import ResearchDataset

from app.schemas.research import (
    ResearchDatasetCreate,
    ResearchDatasetResponse
)

from app.anonymization.engine import (
    anonymize_dataset
)


router = APIRouter(
    prefix="/research",
    tags=["Research Data Mart"]
)


# ============================================================
# ALLOWED RESEARCH FIELDS
# ============================================================

ALLOWED_RESEARCH_FIELDS = {

    # Patient demographics
    "age",
    "gender",
    "province",

    # Medical information
    "blood_group",
    "allergies",
    "current_medications",
    "medical_history",
    "current_conditions",
    "height",
    "weight",

    # Laboratory information
    "test_name",
    "result",
    "normal_range",
    "lab_status",

    # Prescription information
    "medicine_name",
    "dosage",
    "frequency",
    "duration"

}


# ============================================================
# CREATE DATASET
# ============================================================

@router.post(
    "/datasets",
    response_model=ResearchDatasetResponse
)
def create_research_dataset(

    request: ResearchDatasetCreate,

    current_user: User = Depends(
        require_role(
            "RESEARCHER",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    # --------------------------------------------------------
    # Validate requested fields
    # --------------------------------------------------------

    invalid_fields = [

        field

        for field in request.fields

        if field not in ALLOWED_RESEARCH_FIELDS

    ]

    if invalid_fields:

        raise HTTPException(

            status_code=400,

            detail={
                "message": "Invalid research fields.",
                "invalid_fields": invalid_fields
            }

        )

    # --------------------------------------------------------
    # Validate anonymization techniques
    # --------------------------------------------------------

    allowed_techniques = {
        "generalization",
        "suppression",
        "perturbation"
    }

    invalid_techniques = [

        technique

        for technique in request.techniques

        if technique not in allowed_techniques

    ]

    if invalid_techniques:

        raise HTTPException(

            status_code=400,

            detail={
                "message": (
                    "Invalid anonymization techniques."
                ),
                "invalid_techniques": invalid_techniques
            }

        )

    if not request.techniques:

        raise HTTPException(

            status_code=400,

            detail=(
                "At least one anonymization "
                "technique is required."
            )

        )

    # --------------------------------------------------------
    # Retrieve patients
    # --------------------------------------------------------

    patients = (
        db.query(Patient)
        .all()
    )

    raw_records = []

    # --------------------------------------------------------
    # Build research records
    # --------------------------------------------------------

    for patient in patients:

        # ====================================================
        # Patient-level information
        # ====================================================

        base_record = {

            "date_of_birth":
                patient.date_of_birth,

            "gender":
                patient.gender,

            "province":
                patient.province,

            "blood_group":
                patient.blood_group,

            "allergies":
                None,

            "current_medications":
                None,

            "medical_history":
                None,

            "current_conditions":
                None,

            "height":
                None,

            "weight":
                None

        }

        # ====================================================
        # Medical record
        # ====================================================

        medical_record = (

            db.query(MedicalRecord)

            .filter(
                MedicalRecord.patient_id
                == patient.id
            )

            .order_by(
                MedicalRecord.created_at.desc()
            )

            .first()

        )

        if medical_record:

            base_record["blood_group"] = (
                medical_record.blood_type
            )

            base_record["allergies"] = (
                medical_record.allergies
            )

            base_record["current_medications"] = (
                medical_record.current_medications
            )

            base_record["medical_history"] = (
                medical_record.medical_history
            )

            base_record["current_conditions"] = (
                medical_record.current_conditions
            )

            base_record["height"] = (
                medical_record.height
            )

            base_record["weight"] = (
                medical_record.weight
            )

        # ====================================================
        # Laboratory results
        # ====================================================

        lab_results = (

            db.query(LabResult)

            .filter(
                LabResult.patient_id
                == patient.id
            )

            .all()

        )

        # ----------------------------------------------------
        # Patient without lab results
        # ----------------------------------------------------

        if not lab_results:

            raw_records.append(
                base_record
            )

        # ----------------------------------------------------
        # Patient with lab results
        # ----------------------------------------------------

        for lab in lab_results:

            record = base_record.copy()

            record.update({

                "test_name":
                    lab.test_name,

                "result":
                    lab.result,

                "normal_range":
                    lab.normal_range,

                "lab_status":
                    lab.status

            })

            raw_records.append(
                record
            )

    # ========================================================
    # Apply anonymization
    # ========================================================

    anonymized_records = anonymize_dataset(

        raw_records,

        request.techniques

    )

    # ========================================================
    # Keep only requested fields
    # ========================================================

    final_records = []

    for record in anonymized_records:

        filtered_record = {

            field: record.get(field)

            for field in request.fields

            if field in record

        }

        final_records.append(
            filtered_record
        )

    # ========================================================
    # Store dataset in Data Mart
    # ========================================================

    dataset = ResearchDataset(

        researcher_id=current_user.id,

        dataset_name=request.dataset_name,

        selected_fields=json.dumps(
            request.fields
        ),

        anonymization_techniques=json.dumps(
            request.techniques
        ),

        dataset_json=json.dumps(
            final_records,
            default=str
        )

    )

    db.add(
        dataset
    )

    db.commit()

    db.refresh(
        dataset
    )

    # ========================================================
    # Response
    # ========================================================

    return {

        "id": dataset.id,

        "dataset_name":
            dataset.dataset_name,

        "selected_fields":
            request.fields,

        "anonymization_techniques":
            request.techniques,

        "created_at":
            dataset.created_at

    }


# ============================================================
# LIST DATASETS
# ============================================================

@router.get(
    "/datasets",
    response_model=list[ResearchDatasetResponse]
)
def get_research_datasets(

    current_user: User = Depends(
        require_role(
            "RESEARCHER",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    query = (
        db.query(ResearchDataset)
    )

    # --------------------------------------------------------
    # Researchers see their own datasets.
    # Admin can see all datasets.
    # --------------------------------------------------------

    if current_user.role == "RESEARCHER":

        query = query.filter(

            ResearchDataset.researcher_id
            == current_user.id

        )

    datasets = query.all()

    results = []

    for dataset in datasets:

        results.append({

            "id":
                dataset.id,

            "dataset_name":
                dataset.dataset_name,

            "selected_fields":
                json.loads(
                    dataset.selected_fields
                ),

            "anonymization_techniques":
                json.loads(
                    dataset.anonymization_techniques
                ),

            "created_at":
                dataset.created_at

        })

    return results


# ============================================================
# GET DATASET
# ============================================================

@router.get(
    "/datasets/{dataset_id}"
)
def get_research_dataset(

    dataset_id: int,

    current_user: User = Depends(
        require_role(
            "RESEARCHER",
            "ADMIN"
        )
    ),

    db: Session = Depends(get_db)

):

    dataset = (

        db.query(ResearchDataset)

        .filter(
            ResearchDataset.id
            == dataset_id
        )

        .first()

    )

    if not dataset:

        raise HTTPException(

            status_code=404,

            detail="Research dataset not found."

        )

    # --------------------------------------------------------
    # Researchers may only access their own datasets.
    # --------------------------------------------------------

    if (

        current_user.role == "RESEARCHER"

        and

        dataset.researcher_id
        != current_user.id

    ):

        raise HTTPException(

            status_code=403,

            detail=(
                "You are not authorized "
                "to access this dataset."
            )

        )

    return {

        "id":
            dataset.id,

        "dataset_name":
            dataset.dataset_name,

        "selected_fields":
            json.loads(
                dataset.selected_fields
            ),

        "anonymization_techniques":
            json.loads(
                dataset.anonymization_techniques
            ),

        "data":
            json.loads(
                dataset.dataset_json
            ),

        "created_at":
            dataset.created_at

    }