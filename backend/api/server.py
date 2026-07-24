from flask import Flask, request, jsonify
import uuid
import time
import datetime
import json
import os
from flask_cors import CORS

from app.trust import calculate_trust
from app.queries import fetch_all_employees, process_employee

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ---------------- STORAGE ----------------

users = {}
sessions = {}
login_attempts = {}
AUDIT_LOG_FILE = "audit_log.json"

# Pre-seeded demo accounts (for presentations and research demos)
users["admin@vaultview.com"] = {"user_id": 1, "password": "admin123", "role": "admin"}
users["analyst@vaultview.com"] = {"user_id": 2, "password": "analyst123", "role": "user"}

def log_hostile_event(ip, email, trust_score, request_count):
    entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "ip": ip,
        "email": email,
        "trust_score": trust_score,
        "request_count": request_count
    }
    logs = []
    if os.path.exists(AUDIT_LOG_FILE):
        try:
            with open(AUDIT_LOG_FILE, "r") as f:
                logs = json.load(f)
        except:
            pass
    logs.append(entry)
    with open(AUDIT_LOG_FILE, "w") as f:
        json.dump(logs, f, indent=4)

# ---------------- AUTH ----------------

@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.json

    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "user")

    if not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    if email in users:
        return jsonify({"error": "User already exists"}), 400
        
    user_id = len(users) + 1

    users[email] = {
        "user_id": user_id,
        "password": password,
        "role": role
    }

    print(f"[AUTH] Signup success: {email}")

    return jsonify({"message": "Signup successful"})


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = users.get(email)

    if email not in login_attempts:
        # Phase 2: Off-Hours Detection
        now_dt = datetime.datetime.now()
        is_weekend = now_dt.weekday() >= 5
        is_off_hours = now_dt.hour >= 22 or now_dt.hour < 6
        initial_trust = 55 if (is_weekend or is_off_hours) else 70
        login_attempts[email] = {"trust": initial_trust, "fails": 0}

    if not user or user["password"] != password:
        login_attempts[email]["fails"] += 1
        login_attempts[email]["trust"] = max(0, login_attempts[email]["trust"] - 15)

        if login_attempts[email]["fails"] >= 3:
            login_attempts[email]["trust"] = 40

        print(f"[SECURITY] Failed login → {email} trust={login_attempts[email]['trust']}")
        return jsonify({
            "error": "Invalid credentials",
            "trust_score": login_attempts[email]["trust"]
        }), 401

    trust = login_attempts[email]["trust"]

    token = str(uuid.uuid4())
    now = time.time()
    
    # Phase 2: Device & IP Capture
    ip_addr = request.remote_addr or request.headers.get("X-Forwarded-For", "unknown")
    user_agent = request.headers.get("User-Agent", "unknown")

    sessions[token] = {
        "user_id": user["user_id"],
        "email": email,
        "role": user["role"],
        "trust_score": trust,
        "login_time": now,
        "prev_request": now,
        "last_request": now,
        "request_count": 0,
        "failed_attempts": 0,
        "original_ip": ip_addr,
        "original_ua": user_agent,
        "current_ip": ip_addr
    }

    login_attempts[email]["fails"] = 0

    print(f"[AUTH] Login success: {email} (Trust: {trust}, IP: {ip_addr})")

    return jsonify({
        "token": token,
        "role": user["role"]
    })


# ---------------- EMPLOYEES API ----------------

@app.route("/employees", methods=["GET"])
def get_employees():
    auth = request.headers.get("Authorization")

    if not auth:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        token = auth.split(" ")[1]
    except:
        return jsonify({"error": "Invalid token"}), 401

    session = sessions.get(token)

    if not session:
        return jsonify({"error": "Invalid token"}), 401

    # Phase 2: Update Current IP to detect changes
    session["current_ip"] = request.remote_addr or request.headers.get("X-Forwarded-For", "unknown")
    
    # Phase 2: Navigation Pattern
    if session["request_count"] == 0:
        time_since_login = time.time() - session["login_time"]
        if time_since_login < 1.0: 
            session["direct_jump"] = True

    # -------- TRUST ENGINE --------
    now = time.time()
    session["prev_request"] = session.get("last_request", session["login_time"])
    session["last_request"] = now
    session["request_count"] += 1

    current_trust = calculate_trust(session)

    # -------- 3-TIER DECEPTION RESPONSE --------
    raw_data = fetch_all_employees()
    processed_data = []
    
    for emp in raw_data:
        processed_emp = process_employee(emp, current_trust, session.get("current_ip", "unknown"))
        processed_data.append(processed_emp)

    data_mode = processed_data[0]["data_mode"] if processed_data else "REAL"

    # Phase 3: Tarpitting & Honeytokens for SUSPICIOUS tier
    if 45 <= current_trust < 75:
        print(f"[DECEPTION] Tarpitting suspicious user {session['email']} for 2.5s...")
        time.sleep(2.5)
        # Inject Honeytoken
        processed_data.append({
            "emp_id": 9999,
            "name": "Admin Test (Trap)",
            "department": "IT",
            "designation": "Systems Admin",
            "email": "admin.trap@vaultview.com",
            "phone": "0000000000",
            "city": "Nowhere",
            "age": 40,
            "salary": "gAAAAABtrap_salary_token",
            "bank_account": "gAAAAABtrap_bank_token",
            "data_mode": "ENCRYPTED_REAL",
            "trust_score": current_trust
        })

    # Phase 6: Audit log for HOSTILE tier
    if current_trust < 45:
        log_hostile_event(session.get("current_ip", "unknown"), session["email"], current_trust, session["request_count"])

    return jsonify({
        "meta": {
            "trust_score": current_trust,
            "data_mode": data_mode,
            "role": session["role"]
        },
        "employees": processed_data
    })


@app.route("/admin/logs", methods=["GET"])
def get_audit_logs():
    """Phase 6: Admin endpoint to view audit logs."""
    auth = request.headers.get("Authorization")
    if not auth:
        return jsonify({"error": "Unauthorized"}), 401
    try:
        token = auth.split(" ")[1]
    except:
        return jsonify({"error": "Invalid token"}), 401

    session = sessions.get(token)
    if not session or session.get("role") != "admin":
        return jsonify({"error": "Forbidden"}), 403

    logs = []
    if os.path.exists(AUDIT_LOG_FILE):
        try:
            with open(AUDIT_LOG_FILE, "r") as f:
                logs = json.load(f)
        except:
            pass
    return jsonify(logs)


@app.route("/api/trap/<token_id>", methods=["GET", "POST"])
def honeytoken_trap(token_id):
    """
    Phase 3: Honeytoken hit detection. If an attacker tries to access or probe 
    the fake bank_account token they found in the suspicious response, their IP is flagged.
    """
    ip_addr = request.remote_addr or request.headers.get("X-Forwarded-For", "unknown")
    print(f"\n[URGENT SECURITY ALERT] Honeytoken '{token_id}' triggered by IP {ip_addr}!\n")
    
    # In a real system, you'd ban the IP at the firewall level here.
    # For now, we'll zero out any session with this IP.
    for s_token, sess in sessions.items():
        if sess.get("current_ip") == ip_addr:
            sess["trust_score"] = 0
            
    return jsonify({"error": "Resource not found"}), 404


# ---------------- RUN ----------------

@app.route("/auth/logout", methods=["POST"])
def logout():
    auth = request.headers.get("Authorization")
    if auth:
        try:
            token = auth.split(" ")[1]
            sessions.pop(token, None)
        except:
            pass
    return jsonify({"message": "Logged out"}), 200


if __name__ == "__main__":
    app.run(debug=True)