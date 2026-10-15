
"""
Evaluate warning thresholds for the diabetes model.

The dataset is AI-generated synthetic data.
Results are for software development only and do not
establish clinical validity.
"""

from pathlib import Path

import joblib
import pandas as pd

from sklearn.metrics import (
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split


# --------------------------------------------------
# 1. Set up paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

DATA_PATH = (
    BASE_DIR
    / "data"
    / "potential_diabetes_prediction_dataset.csv"
)

MODEL_PATH = (
    BASE_DIR
    / "artifacts"
    / "diabetes_pipeline.joblib"
)


# --------------------------------------------------
# 2. Load dataset and saved model
# --------------------------------------------------

df = pd.read_csv(DATA_PATH)

df = df.dropna(subset=["diabetes"])

X = df.drop(columns=["diabetes", "patient_id"], errors="ignore")
y = df["diabetes"].astype(int)

saved = joblib.load(MODEL_PATH)
model = saved["pipeline"]

# Recreate the same split used during training.
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y,
)

# The model must already have been trained on X_train.
# Use the saved pipeline to score the held-out test set.
probabilities = model.predict_proba(X_test)[:, 1]


# --------------------------------------------------
# 3. Compare thresholds
# --------------------------------------------------

thresholds = [
    0.10,
    0.15,
    0.20,
    0.25,
    0.30,
    0.35,
    0.40,
    0.45,
    0.50,
    0.55,
    0.60,
    0.65,
    0.70,
    0.75,
    0.80,
]

rows = []

for threshold in thresholds:

    predictions = (
        probabilities >= threshold
    ).astype(int)

    tn, fp, fn, tp = confusion_matrix(
        y_test,
        predictions,
        labels=[0, 1],
    ).ravel()

    rows.append({
        "threshold": threshold,
        "precision": precision_score(
            y_test,
            predictions,
            zero_division=0,
        ),
        "recall": recall_score(
            y_test,
            predictions,
            zero_division=0,
        ),
        "f1": f1_score(
            y_test,
            predictions,
            zero_division=0,
        ),
        "true_positives": tp,
        "false_negatives": fn,
        "false_positives": fp,
        "true_negatives": tn,
    })

results = pd.DataFrame(rows)

print("\nThreshold evaluation")
print(
    results.to_string(
        index=False,
        formatters={
            "threshold": "{:.2f}".format,
            "precision": "{:.3f}".format,
            "recall": "{:.3f}".format,
            "f1": "{:.3f}".format,
        },
    )
)

print(
    "\nHeld-out test ROC-AUC:",
    round(roc_auc_score(y_test, probabilities), 3),
)


