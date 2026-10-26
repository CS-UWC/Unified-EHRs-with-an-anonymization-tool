
"""
Diabetes prediction API.

Research prototype only.
Predictions are not medical diagnoses.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi import status
from pydantic import BaseModel, Field
from typing import Literal

from app.core.dependencies import get_current_user
from app.models.user import User
from app.ai.diabetes.predict import predict_diabetes_risk


router = APIRouter(
    prefix="/ai/diabetes",
    tags=["AI - Diabetes"]
)


# --------------------------------------------------
# 1. Define and validate the request data
# --------------------------------------------------


class DiabetesPredictionInput(BaseModel):
    # Validate the patient's age.
    age: int = Field(ge=1, le=120)

    # Optional values: the trained pipeline imputes missing values.
    bmi: float | None = Field(default=None, ge=5, le=100)
    glucose_mg_dl: float = Field(gt=0, le=1000)
    blood_pressure_mmHg: float | None = Field(default=None, gt=0, le=400)
    insulin_uIU_ml: float | None = Field(default=None, ge=0, le=10000)

    # Match the numeric encoding used by the training dataset.
    family_history_diabetes: Literal[0, 1]
    physical_activity: Literal["Low", "Moderate", "High"]
    smoking_status: Literal["Never", "Former", "Current"]
    hypertension: Literal[0, 1]


# --------------------------------------------------
# 2. Create the prediction endpoint
# --------------------------------------------------


@router.post("/predict")
def predict_diabetes(
    patient: DiabetesPredictionInput,
    current_user: User = Depends(get_current_user),
):
    """
    Return a prototype diabetes risk classification.

    Requires authentication and an authorized practitioner role.
    """

    # Only authorized healthcare practitioners may use this endpoint.
    if current_user.role not in {"DOCTOR"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this prediction service.",
        )

    try:
        result = predict_diabetes_risk(patient.model_dump())

        return {
            "message": (
                "Research prototype result. "
                "This is not a medical diagnosis."
            ),
            **result,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

