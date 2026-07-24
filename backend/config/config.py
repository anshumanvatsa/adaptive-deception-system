import os
from dotenv import load_dotenv

load_dotenv()

# All secrets MUST be set as environment variables.
# Never hardcode credentials here — use Render / Vercel dashboard.
DATABASE_URL = os.getenv("DATABASE_URL")
FERNET_KEY = os.getenv("FERNET_KEY", "").encode()
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-in-production")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set.")

if not FERNET_KEY:
    raise RuntimeError("FERNET_KEY environment variable is not set.")
