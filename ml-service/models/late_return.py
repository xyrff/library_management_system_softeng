"""
Late-return risk classification logic.

TODO (ML team):
1. Prepare a (synthetic or real) transaction dataset with features:
   memberType, lateReturnHistory, genre, loan duration, day of week borrowed.
2. Label: returned_late (True/False), derived from returnDate vs. dueDate.
3. Train a classifier (RandomForestClassifier or XGBClassifier).
4. Save the trained model with joblib and load it here instead of the placeholder below.
"""

# import joblib
# model = joblib.load("trained_late_return_model.pkl")


def predict_late_return_risk(features: dict) -> str:
    # Placeholder implementation — replace with model.predict_proba(...) once trained.
    # Expected features dict: memberType, lateReturnHistory, genre
    if features.get("lateReturnHistory", 0) >= 3:
        return "high"
    elif features.get("lateReturnHistory", 0) >= 1:
        return "medium"
    return "low"
