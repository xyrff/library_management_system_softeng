from flask import Flask, request, jsonify
from flask_cors import CORS

from models.recommend import get_recommendations
from models.late_return import predict_late_return_risk

app = Flask(__name__)
CORS(app)


@app.route("/recommend/<member_id>", methods=["GET"])
def recommend(member_id):
    """Returns a ranked list of recommended book IDs for a given member."""
    book_ids = get_recommendations(member_id)
    return jsonify({"memberId": member_id, "bookIds": book_ids})


@app.route("/predict-late-return", methods=["POST"])
def predict_late_return():
    """Returns a late-return risk score given loan/member features."""
    features = request.get_json()
    risk_score = predict_late_return_risk(features)
    return jsonify({"riskScore": risk_score})


@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "ML service is running"})


if __name__ == "__main__":
    app.run(port=5001, debug=True)
