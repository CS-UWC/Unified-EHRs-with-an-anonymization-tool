
"""
Diabetes Early-Warning System
Model training and evaluation baseline.

IMPORTANT:
The supplied dataset is AI-generated synthetic data.
Results measure performance on this dataset only.
They do not establish clinical validity.
"""

from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
)
from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_validate,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


# --------------------------------------------------
# 1. Define project paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

DATA_PATH = (
    BASE_DIR
    / "data"
    / "potential_diabetes_prediction_dataset.csv"
)

MODEL_DIR = BASE_DIR / "artifacts"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# 2. Load and validate the dataset
# --------------------------------------------------

df = pd.read_csv(DATA_PATH)

required_columns = [
    "age",
    "bmi",
    "glucose_mg_dl",
    "blood_pressure_mmHg",
    "insulin_uIU_ml",
    "family_history_diabetes",
    "physical_activity",
    "smoking_status",
    "hypertension",
    "diabetes",
]

missing_columns = set(required_columns) - set(df.columns)

if missing_columns:
    raise ValueError(
        f"Missing required columns: {sorted(missing_columns)}"
    )

df = df[required_columns].copy()

# The target must be present and valid.
df = df.dropna(subset=["diabetes"])

if not df["diabetes"].isin([0, 1]).all():
    raise ValueError("The diabetes target must contain only 0 and 1.")

if df["diabetes"].nunique() != 2:
    raise ValueError(
        "Training requires both positive and negative target classes."
    )

print("\nDataset shape:", df.shape)
print("\nTarget distribution:")
print(df["diabetes"].value_counts())
print("\nMissing values:")
print(df.isnull().sum())


# --------------------------------------------------
# 3. Separate features from target
# --------------------------------------------------

X = df.drop(columns=["diabetes"])
y = df["diabetes"].astype(int)

numeric_features = [
    "age",
    "bmi",
    "glucose_mg_dl",
    "blood_pressure_mmHg",
    "insulin_uIU_ml",
]

categorical_features = [
    "family_history_diabetes",
    "physical_activity",
    "smoking_status",
    "hypertension",
]


# --------------------------------------------------
# 4. Define preprocessing
# --------------------------------------------------

numeric_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ]
)

categorical_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        (
            "encoder",
            OneHotEncoder(handle_unknown="ignore"),
        ),
    ]
)

preprocessor = ColumnTransformer(
    transformers=[
        ("numeric", numeric_pipeline, numeric_features),
        (
            "categorical",
            categorical_pipeline,
            categorical_features,
        ),
    ]
)


# --------------------------------------------------
# 5. Split the data
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y,
)

print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))


# --------------------------------------------------
# 6. Define candidate models
# --------------------------------------------------

models = {
    "Logistic Regression": LogisticRegression(
        class_weight="balanced",
        max_iter=2000,
        random_state=42,
    ),
    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        class_weight="balanced",
        min_samples_leaf=2,
        random_state=42,
    ),
}

# Use a fold count supported by the smallest training class.
smallest_class = int(y_train.value_counts().min())
n_splits = min(5, smallest_class)

if n_splits < 2:
    raise ValueError(
        "Too few examples in one class for stratified cross-validation."
    )

cv = StratifiedKFold(
    n_splits=n_splits,
    shuffle=True,
    random_state=42,
)

scoring = {
    "recall": "recall",
    "precision": "precision",
    "f1": "f1",
    "roc_auc": "roc_auc",
}


# --------------------------------------------------
# 7. Compare models using training data only
# --------------------------------------------------

results = {}

for name, classifier in models.items():
    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier),
        ]
    )

    scores = cross_validate(
        pipeline,
        X_train,
        y_train,
        cv=cv,
        scoring=scoring,
        error_score="raise",
    )

    results[name] = {
        "pipeline": pipeline,
        "mean_recall": scores["test_recall"].mean(),
        "mean_precision": scores["test_precision"].mean(),
        "mean_f1": scores["test_f1"].mean(),
        "mean_roc_auc": scores["test_roc_auc"].mean(),
    }

print("\nCross-validation results:")

for name, result in results.items():
    print(f"\n{name}")
    for metric in [
        "mean_recall",
        "mean_precision",
        "mean_f1",
        "mean_roc_auc",
    ]:
        print(f"{metric}: {result[metric]:.3f}")


# --------------------------------------------------
# 8. Select by recall, then refit on training data
# --------------------------------------------------

best_name = max(
    results,
    key=lambda name: (
        results[name]["mean_recall"],
        results[name]["mean_precision"],
    ),
)

best_pipeline = results[best_name]["pipeline"]
best_pipeline.fit(X_train, y_train)

print("\nSelected development model:", best_name)


# --------------------------------------------------
# 9. Evaluate once on the held-out test set
# --------------------------------------------------

predictions = best_pipeline.predict(X_test)
probabilities = best_pipeline.predict_proba(X_test)[:, 1]

print("\nHeld-out test classification report:")
print(
    classification_report(
        y_test,
        predictions,
        labels=[0, 1],
        target_names=["Negative", "Positive"],
        zero_division=0,
    )
)

print("Confusion matrix:")
print(confusion_matrix(y_test, predictions, labels=[0, 1]))

print(
    "Test ROC-AUC:",
    round(roc_auc_score(y_test, probabilities), 3),
)


# --------------------------------------------------
# 10. Save the fitted pipeline and metadata


model_path = MODEL_DIR / "diabetes_pipeline.joblib"

joblib.dump(
    {
        "pipeline": best_pipeline,
        "model_name": best_name,
        "features": list(X.columns),
        "synthetic_data": True,
        "clinical_use_approved": False,
    },
    model_path,
)

print("\nSaved development model to:", model_path)
print("Training pipeline completed.")
