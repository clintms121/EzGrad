from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import os

app = Flask(__name__)
CORS(app)  

# find DB
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "db", "userdata.db")

# grab connection 
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    # format rows 
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/api/login", methods=["POST"])
def login():

    # parse JSON data
    data = request.get_json()
    
    # handle base case 
    if not data or "username" not in data or "password" not in data:
        return jsonify({"success": False, "message": "Missing credentials"}), 400
    
    # set username to the json 
    # encoding password 
    username = data["username"]
    password = hashlib.sha256(data["password"].encode()).hexdigest()
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM userdata WHERE username = ? AND password = ?", (username, password))
    user = cur.fetchone()
    conn.close()
    
    if user:
        return jsonify({"success": True, "message": "Login successful", "username": username})
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    
    if not data or "username" not in data or "password" not in data:
        return jsonify({"success": False, "message": "Missing credentials"}), 400
    
    username = data["username"]
    password = hashlib.sha256(data["password"].encode()).hexdigest()
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Check if user already exists
    cur.execute("SELECT * FROM userdata WHERE username = ?", (username,))
    if cur.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Username already exists"}), 409
    
    # Insert new user
    cur.execute("INSERT INTO userdata (username, password) VALUES (?, ?)", (username, password))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Registration successful"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
