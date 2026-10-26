
"""
Diabetes prediction service.

Research prototype using a synthetic-data model.
Predictions are not medical diagnoses.
"""

from pathlib import Path

import joblib
import pandas as pd


# --------------------------------------------------
# 1. Locate and load the trained model
# --------------------------------------------------

BACKEND_DIR = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    BACKEND_DIR
    / "ML"
    / "diabetes"
    / "artifacts"
    / "diabetes_pipeline.joblib"
)

saved_model = joblib.load(MODEL_PATH)

pipeline = saved_model["pipeline"]

EXPECTED_FEATURES = saved_model["features"]


# --------------------------------------------------
# 2. Define the prediction function
# --------------------------------------------------

def predict_diabetes_risk(patient_data: dict) -> dict:
    """
    Predict a synthetic-model diabetes classification score.

    patient_data must contain the same features used
    during training.
    """

    # Check that all required features are supplied.
    missing = [
        feature
        for feature in EXPECTED_FEATURES
        if feature not in patient_data
    ]

    if missing:
        raise ValueError(
            f"Missing required features: {missing}"
        )

    # Keep the feature order consistent with training.
    input_data = pd.DataFrame(
        [
            {
                feature: patient_data[feature]
                for feature in EXPECTED_FEATURES
            }
        ]
    )

    # Produce the model's positive-class score.
    score = float(
        pipeline.predict_proba(input_data)[0][1]
    )

    # Temporary development threshold.
    # This is NOT a clinically validated threshold.
    threshold = 0.50

    flagged = score >= threshold

    return {
        "model": saved_model["model_name"],
        "score": round(score, 4),
        "threshold": threshold,
        "prototype_warning": flagged,
        "warning_message": (
            "Further healthcare-professional review may "
            "be appropriate. This prototype result is not "
            "a diagnosis."
            if flagged
            else
            "The model did not trigger a prototype warning. "
            "This does not rule out diabetes."
        ),
        
    }
