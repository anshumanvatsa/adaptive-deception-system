import os
import sys


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.db import get_connection  # noqa: E402
from app.encryption import encrypt_data  # noqa: E402


def seed_employees():
    employees = [
        {
            "name": "Aarav Mehta",
            "department": "Engineering",
            "designation": "Backend Engineer",
            "email": "aarav.mehta@vaultview.com",
            "phone": "9876543210",
            "city": "Mumbai",
            "age": 29,
            "salary": "85000",
            "bank_account": "1234567890",
        },
        {
            "name": "Isha Sharma",
            "department": "Finance",
            "designation": "Financial Analyst",
            "email": "isha.sharma@vaultview.com",
            "phone": "9123456780",
            "city": "Delhi",
            "age": 31,
            "salary": "92000",
            "bank_account": "2345678901",
        },
        {
            "name": "Rohan Kapoor",
            "department": "HR",
            "designation": "HR Manager",
            "email": "rohan.kapoor@vaultview.com",
            "phone": "9988776655",
            "city": "Bengaluru",
            "age": 35,
            "salary": "78000",
            "bank_account": "3456789012",
        },
        {
            "name": "Neha Verma",
            "department": "Product",
            "designation": "Product Manager",
            "email": "neha.verma@vaultview.com",
            "phone": "9090909090",
            "city": "Pune",
            "age": 30,
            "salary": "99000",
            "bank_account": "4567890123",
        },
        {
            "name": "Vikram Singh",
            "department": "Sales",
            "designation": "Sales Lead",
            "email": "vikram.singh@vaultview.com",
            "phone": "9012345678",
            "city": "Hyderabad",
            "age": 33,
            "salary": "87000",
            "bank_account": "5678901234",
        },
    ]

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("TRUNCATE TABLE employees RESTART IDENTITY;")
                for emp in employees:
                    emp["salary"] = encrypt_data(emp["salary"])
                    emp["bank_account"] = encrypt_data(emp["bank_account"])
                    cur.execute(
                        """
                        INSERT INTO employees
                            (name, department, designation, email, phone, city, age, salary, bank_account)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                        """,
                        (
                            emp["name"],
                            emp["department"],
                            emp["designation"],
                            emp["email"],
                            emp["phone"],
                            emp["city"],
                            emp["age"],
                            emp["salary"],
                            emp["bank_account"],
                        ),
                    )
        print("Employee data inserted successfully.")
    finally:
        conn.close()


if __name__ == "__main__":
    try:
        seed_employees()
    except Exception as exc:
        print(f"Data insertion failed: {exc}")
        raise
