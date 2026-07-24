"""
queries.py — Database queries + deception logic.

Deception model (v2):
  trust >= 60  →  REAL decrypted data     (data_mode = "REAL")
  trust <  60  →  DECOY seeded fake data  (data_mode = "DECOY")

No PARTIAL mode. Binary deception only.
"""
from app.db import get_connection
from app.encryption import decrypt_data as decrypt
from app.fake_data import apply_fake_data


# ---------------------------------------------------------------------------
# Raw DB fetchers
# ---------------------------------------------------------------------------

def _rows_to_dicts(rows: list) -> list[dict]:
    return [
        {
            "emp_id": row[0],
            "name": row[1],
            "department": row[2],
            "designation": row[3],
            "email": row[4],
            "phone": row[5],
            "city": row[6],
            "age": row[7],
            "salary": row[8],        # still encrypted at this point
            "bank_account": row[9],  # still encrypted at this point
        }
        for row in rows
    ]


def fetch_all_employees() -> list[dict]:
    """Fetch every employee. Used by admin role."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT emp_id, name, department, designation, email,
                       phone, city, age, salary, bank_account
                FROM employees
                ORDER BY emp_id;
                """
            )
            rows = cur.fetchall()
    finally:
        conn.close()
    return _rows_to_dicts(rows)


def fetch_employee_by_email(email: str) -> list[dict]:
    """
    Fetch a single employee whose email matches the logged-in user.
    Returns a list (may be empty) so callers can treat it uniformly.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT emp_id, name, department, designation, email,
                       phone, city, age, salary, bank_account
                FROM employees
                WHERE email = %s
                LIMIT 1;
                """,
                (email,),
            )
            rows = cur.fetchall()
    finally:
        conn.close()
    return _rows_to_dicts(rows)


# ---------------------------------------------------------------------------
# Deception layer
# ---------------------------------------------------------------------------

def process_employee(emp: dict, trust_score: int, ip_addr: str) -> dict:
    """
    Apply 3-Tier deception logic to a single employee record.
    TRUSTED (75-100): Decrypts real salary + bank_account
    SUSPICIOUS (45-74): Returns raw ciphertext (looks like valid data but encrypted)
    HOSTILE (0-44): Returns seeded-fake salary + bank_account
    """
    if trust_score >= 75:
        result = {
            **emp,
            "salary": decrypt(emp["salary"]),
            "bank_account": decrypt(emp["bank_account"]),
            "data_mode": "REAL",
            "trust_score": trust_score,
        }
        return result
    elif trust_score >= 45:
        result = {
            **emp,
            # Suspicious users get the encrypted ciphertext instead of plaintext
            "salary": emp["salary"],
            "bank_account": emp["bank_account"],
            "data_mode": "ENCRYPTED_REAL",
            "trust_score": trust_score,
        }
        return result
    else:
        result = apply_fake_data(emp, ip_addr)
        result["trust_score"] = trust_score
        result["data_mode"] = "DECOY"
        return result