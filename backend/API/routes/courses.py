from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# Load degree courses data
def load_degree_courses():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, '..', '..', 'data', 'degree_courses.json')
    with open(json_path, 'r') as f:
        return json.load(f)

@app.route("/api/courses", methods=["GET"])
def get_courses():
    degree_courses = load_degree_courses()
    return jsonify(degree_courses)

@app.route("/api/degrees", methods=["GET"])
def get_degrees():
    degree_courses = load_degree_courses()
    return jsonify(list(degree_courses.keys()))

if __name__ == "__main__":
    app.run(debug=True, port=5002)