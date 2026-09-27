"""Late-return risk prediction using the trained scikit-learn pipeline."""

from pathlib import Path

import joblib
import pandas as pd


MODEL_DIR = Path(__file__).resolve().parent
MODEL = joblib.load(MODEL_DIR / "late_return_model.joblib")
THRESHOLD = float(joblib.load(MODEL_DIR / "late_return_threshold.joblib"))
FEATURE_COLUMNS = [
    "genre",
    "dayOfWeekBorrowed",
    "lateReturnHistory",
    "loanDurationDays",
]


def predict_late_return_risk(features: dict) -> dict:
    """Return the late probability, display label, and tuned binary decision."""
    genre = features.get("genre") or "Unknown"
    row = {
        "genre": str(genre),
        "dayOfWeekBorrowed": int(features["dayOfWeekBorrowed"]),
        "lateReturnHistory": int(features["lateReturnHistory"]),
        "loanDurationDays": int(features["loanDurationDays"]),
    }
    input_frame = pd.DataFrame([row], columns=FEATURE_COLUMNS)

    probabilities = MODEL.predict_proba(input_frame)[0]
    positive_class_index = list(MODEL.classes_).index(1)
    probability = float(probabilities[positive_class_index])

    if probability < 0.35:
        risk_label = "low"
    elif probability <= 0.65:
        risk_label = "medium"
    else:
        risk_label = "high"

    return {
        "riskScore": probability,
        "riskLabel": risk_label,
        "isLateRisk": probability >= THRESHOLD,
    }
