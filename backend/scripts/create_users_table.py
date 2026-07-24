"""
create_users_table.py — One-time DB migration.
Run once: python scripts/create_users_table.py
"""
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.db import get_connection  # noqa: E402


def create_users_table() -> None:
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS users (
                        user_id      SERIAL PRIMARY KEY,
                        email        TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        role         TEXT NOT NULL DEFAULT 'user'
                                     CHECK (role IN ('admin', 'user')),
                        created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                    """
                )
        print("[DB] users table created (or already exists).")
    finally:
        conn.close()


if __name__ == "__main__":
    try:
        create_users_table()
    except Exception as exc:
        print(f"[DB] Migration failed: {exc}")
        raise
