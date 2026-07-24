import psycopg2
from psycopg2 import OperationalError
from config.config import DATABASE_URL


def get_connection():
    try:
        return psycopg2.connect(DATABASE_URL)
    except OperationalError as exc:
        raise ConnectionError(f"Database connection failed: {exc}") from exc
