"""
fake_data.py — Seeded fake data generator for the deception engine.

Key design:
- Seeded via IP hash so the SAME attacker always gets the SAME fake values.
- Uses Faker for realistic-looking fields (salary, bank account, phone).
- NEVER stored in DB — generated purely at response time.
"""
import random
import hashlib
from faker import Faker

# Phase 4: Realistic Indian distributions
_faker = Faker("en_IN")


def _seed_for_ip(ip_addr: str, emp_id: int) -> None:
    """Seed random with a deterministic value based on attacker IP and row ID."""
    h = hashlib.sha256(f"{ip_addr}_{emp_id}".encode()).hexdigest()
    seed = int(h, 16) % (2**32 - 1)
    random.seed(seed)
    Faker.seed(seed)


def generate_fake_salary() -> str:
    """Realistic Indian salary in INR (60k - 120k)."""
    return str(random.randint(60_000, 120_000))


def generate_fake_bank() -> str:
    """Random 12-digit Indian bank account number."""
    return str(random.randint(100_000_000_000, 999_999_999_999))


def generate_fake_phone() -> str:
    """Random Indian-style phone number."""
    return _faker.phone_number()


def apply_fake_data(emp: dict, ip_addr: str) -> dict:
    """
    Return a copy of emp with sensitive fields replaced by seeded-random values.
    Non-sensitive fields are preserved so the employee looks real.
    """
    _seed_for_ip(ip_addr, emp["emp_id"])
    return {
        **emp,
        "salary": generate_fake_salary(),
        "bank_account": generate_fake_bank(),
        "phone": generate_fake_phone(),
        "data_mode": "DECOY",
    }
