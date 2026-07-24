"""
sessions.py — In-memory session store.

Tracks per-user session state for trust scoring.
Sessions are keyed by JWT token string.
"""
import time

# sessions dict: { token_str: { ...session data } }
sessions: dict = {}


def create_session(token: str, user_id: int, role: str, ip: str) -> dict:
    """
    Initialize a new session for a freshly-logged-in user.
    Trust starts at 70 — enough to get real data immediately.
    """
    session = {
        "user_id": user_id,
        "role": role,
        "ip": ip,
        "login_time": time.time(),
        "last_request": time.time(),
        "request_count": 0,
        "failed_attempts": 0,
        "trust_score": 70,
    }
    sessions[token] = session
    print(f"[AUTH] Session created → user_id={user_id} role={role} ip={ip} trust=70")
    return session


def get_session(token: str) -> dict | None:
    """Return session dict or None if token is unknown."""
    return sessions.get(token)


def update_session(token: str, ip: str) -> dict:
    """
    Update request tracking fields for each API call.
    Saves prev_request snapshot so trust engine can compute instantaneous gap.
    """
    session = sessions[token]
    # Save the previous timestamp BEFORE updating — trust engine reads this
    session["prev_request"] = session.get("last_request", session["login_time"])
    session["request_count"] += 1
    session["last_request"] = time.time()
    if ip and ip != session.get("ip"):
        print(f"[SECURITY] IP change detected for user_id={session['user_id']} "
              f"old={session.get('ip')} new={ip}")
    session["ip"] = ip
    return session



def record_failed_attempt(token: str) -> None:
    """Increment failed_attempts counter (e.g., for repeated bad requests)."""
    if token in sessions:
        sessions[token]["failed_attempts"] += 1


def invalidate_session(token: str) -> None:
    """Remove session on logout."""
    sessions.pop(token, None)
