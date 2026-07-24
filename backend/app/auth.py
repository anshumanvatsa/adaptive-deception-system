"""
auth.py — User authentication helpers.
Handles signup, login, and JWT token verification.
"""
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone

from app.db import get_connection
from config.config import JWT_SECRET

TOKEN_EXPIRY_HOURS = 12


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def issue_token(user_id: int, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_token(token: str) -> dict:
    """
    Decode and verify a JWT token.
    Returns payload dict on success.
    Raises jwt.PyJWTError subclass on failure.
    """
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])


# ---------------------------------------------------------------------------
# User management
# ---------------------------------------------------------------------------

def signup_user(email: str, password: str, role: str = "user") -> dict:
    """
    Create a new user. Returns user dict on success.
    Raises ValueError if email already exists.
    """
    if role not in ("admin", "user"):
        role = "user"

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                # Check for duplicate
                cur.execute("SELECT user_id FROM users WHERE email = %s;", (email,))
                if cur.fetchone():
                    raise ValueError(f"Email already registered: {email}")

                cur.execute(
                    """
                    INSERT INTO users (email, password_hash, role)
                    VALUES (%s, %s, %s)
                    RETURNING user_id, email, role, created_at;
                    """,
                    (email, password_hash, role),
                )
                row = cur.fetchone()
                print(f"[AUTH] Signup success → user_id={row[0]} email={row[1]} role={row[2]}")
                return {
                    "user_id": row[0],
                    "email": row[1],
                    "role": row[2],
                    "created_at": str(row[3]),
                }
    finally:
        conn.close()


def login_user(email: str, password: str) -> dict:
    """
    Validate credentials. Returns JWT token + user info on success.
    Raises ValueError on bad credentials.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT user_id, email, password_hash, role FROM users WHERE email = %s;",
                (email,),
            )
            row = cur.fetchone()
    finally:
        conn.close()

    if not row:
        print(f"[AUTH] Login failed — unknown email: {email}")
        raise ValueError("Invalid email or password")

    user_id, db_email, password_hash, role = row

    if not bcrypt.checkpw(password.encode(), password_hash.encode()):
        print(f"[AUTH] Login failed — wrong password for: {email}")
        raise ValueError("Invalid email or password")

    token = issue_token(user_id, db_email, role)
    print(f"[AUTH] Login success → user_id={user_id} role={role}")
    return {
        "token": token,
        "user_id": user_id,
        "email": db_email,
        "role": role,
    }
