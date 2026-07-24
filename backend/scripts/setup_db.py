import os
import sys


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.db import get_connection  # noqa: E402


def create_table():
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS employees (
                        emp_id SERIAL PRIMARY KEY,
                        name TEXT,
                        department TEXT,
                        designation TEXT,
                        email TEXT,
                        phone TEXT,
                        city TEXT,
                        age INT,
                        salary TEXT,
                        bank_account TEXT
                    );
                    """
                )
        print("Database setup completed successfully.")
    finally:
        conn.close()


if __name__ == "__main__":
    try:
        create_table()
    except Exception as exc:
        print(f"Database setup failed: {exc}")
        raise
