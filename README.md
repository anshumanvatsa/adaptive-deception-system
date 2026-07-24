# adaptive-deception-system

A behavior-driven cybersecurity platform that serves real or AI-generated decoy data based on real-time trust scoring. Features multi-signal behavioral analysis, 3-tier adaptive deception (Trusted/Suspicious/Hostile), IP-seeded fake data, trust-tiered selective encryption, honeytoken traps & audit logging. Built for research.

## Structure

```
adaptive-deception-system/
├── backend/     # Flask API — trust engine, deception logic, Neon DB
└── frontend/    # React + Vite — dashboard, auth, access log UI
```

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
python scripts/setup_db.py
python scripts/insert_data.py
python run.py
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## How It Works

1. User logs in → trust score is initialized based on time-of-day & failed attempts
2. Every `/employees` request recalculates trust from 5 behavioral signals
3. Based on trust tier:
   - **TRUSTED (75–100)**: Real decrypted data served instantly
   - **SUSPICIOUS (45–74)**: Tarpitted (2.5s delay) + honeytoken injected + ciphertext returned
   - **HOSTILE (0–44)**: Seeded fake data served, IP logged to `audit_log.json`
