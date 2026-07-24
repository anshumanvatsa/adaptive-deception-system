import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_BgserCuRx5p9@ep-long-sun-am8hr7gx-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require",
)

# Fixed Fernet key (32 url-safe base64-encoded bytes). Do not rotate per run.
FERNET_KEY = b"uOTVZeUP6Q2iyF_0g0QHzzSkzJGNM_86jfQ9eCY4yzE="

# JWT secret for token signing. Override via JWT_SECRET env var in production.
JWT_SECRET = os.getenv("JWT_SECRET", "vaultview-jwt-secret-change-in-prod")
