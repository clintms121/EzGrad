"""
POST /api/recommend

Accepts a degree name, a list of completed course codes, and an optional
credit-hour cap and returns a semester-by-semester course plan.

Request body (JSON)
-------------------
{
  "degree":                  "Accounting, A.A.",   # required
  "completed_courses":       ["ENGL 1113", ...],   # optional, default []
  "max_hours_per_semester":  15                    # optional, default 15
}

Response (JSON)
---------------
See recommend() docstring in backend/app/recommend.py for the full schema.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import importlib.util
import os

# Load backend/app/recommend.py by absolute path to avoid name collision
# (this file is also named recommend.py, so a plain `import recommend`
#  would import itself rather than the algorithm module)
_algo_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), '..', '..', 'app', 'recommend.py'
)
_spec = importlib.util.spec_from_file_location("app_recommend", _algo_path)
_algo = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_algo)
recommend = _algo.recommend

app = Flask(__name__)
CORS(app)


@app.route("/api/recommend", methods=["POST"])
def recommend_courses():
    data = request.get_json(silent=True)

    if not data or "degree" not in data:
        return jsonify({"error": "Request body must be JSON with a 'degree' field."}), 400

    degree = data["degree"]
    completed_courses = data.get("completed_courses", [])
    max_hours = data.get("max_hours_per_semester", 15)

    if not isinstance(degree, str) or not degree.strip():
        return jsonify({"error": "'degree' must be a non-empty string."}), 400

    if not isinstance(completed_courses, list):
        return jsonify({"error": "'completed_courses' must be a list of course code strings."}), 400

    if not all(isinstance(c, str) for c in completed_courses):
        return jsonify({"error": "Every entry in 'completed_courses' must be a string."}), 400

    if not isinstance(max_hours, int) or not (1 <= max_hours <= 30):
        return jsonify({"error": "'max_hours_per_semester' must be an integer between 1 and 30."}), 400

    result = recommend(degree.strip(), completed_courses, max_hours)

    if "error" in result:
        return jsonify(result), 404

    return jsonify(result), 200


if __name__ == "__main__":
    app.run(debug=True, port=5001)
