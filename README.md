# 🛡️ VaultView: Adaptive Deception System

![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue)
![Python](https://img.shields.io/badge/Backend-Flask%20%7C%20Python-green)

VaultView is a behavior-driven cybersecurity platform designed to protect sensitive data through **Adaptive Deception**. Instead of relying solely on binary access control (allow/deny), VaultView continuously scores a user's behavior in real-time. Depending on the user's "Trust Score", the system dynamically alters the reality they see: serving real data to trusted users, deploying tarpits and honeytokens to suspicious users, and feeding entirely fake/decoy data to hostile attackers.

### 🔗 Live Demo
* **Frontend Application:** [https://vaultview-deception.vercel.app](https://vaultview-deception.vercel.app)
* **Backend API (Render):** `https://adaptive-deception-system.onrender.com`

---

## 🎮 How to Test the Demo (Interactive Guide)

Want to see the deception engine in action? Try these scenarios on the live website:

### Scenario A: The Trusted Employee 🟢
1. Go to the [Login Page](https://vaultview-deception.vercel.app).
2. Click the **Admin** demo card to auto-fill the credentials (`admin@vaultview.com`).
3. Click **Sign In**.
4. You will enter the dashboard with a high Trust Score (75-100).
5. **Result:** You are in the **TRUSTED** tier. The data loads instantly, and all employee records are real, decrypted, and accurate.

### Scenario B: The Suspicious Insider 🟡
1. While logged into the dashboard, start acting erratically.
2. **Spam the "Refresh Data" button** multiple times very quickly (like an attacker trying to scrape the database).
3. Watch your Trust Score drop in real-time in the top right corner.
4. Once your score drops between **45 - 74**, you enter the **SUSPICIOUS** tier.
5. **Result:** 
   * **Tarpitting:** Notice that the system artificially slows down. Data now takes ~2.5 seconds to load to frustrate automated scrapers.
   * **Honeytokens Injected:** Look at the data table. A fake trap record (`Admin Test (Trap)`) has been silently injected into the results to catch you if you try to exploit it.

### Scenario C: The Hostile Attacker 🔴
1. Log out, and go back to the Login Page.
2. **Intentionally enter the wrong password** 3 times in a row for the Admin account.
3. On the 4th try, use the correct password (`admin123`) to log in.
4. **Result:** Because of the brute-force attempt, your Trust Score instantly starts below **44**, putting you in the **HOSTILE** tier.
5. **The Deception:** The system *lets you in*, making you think you succeeded. However, **all the data you are looking at is completely fake.** The names, salaries, and bank accounts are dynamically generated decoys. The system is wasting your time while logging your IP address to the backend Audit Log for the security team.

---

## 🧠 How the Engine Works

1. **Initial Trust Assessment:** Upon login, trust is initialized based on the time of day, day of the week (weekend/off-hours lowers initial trust), and previous failed login attempts.
2. **Continuous Behavioral Scoring:** Every API request recalculates trust based on 5 signals:
   * **Navigation Patterns:** Direct jumps to sensitive endpoints.
   * **Device Fingerprinting:** Sudden IP address changes.
   * **Request Velocity:** Rapid-fire requests (scraping) incur heavy penalties, while normal reading pauses grant slight trust regeneration.
   * **Absolute Volume:** High total request counts flag potential data exfiltration.
   * **Authentication Fails:** Brute-force attempts severely penalize the session.
3. **3-Tier Adaptive Response:**
   * **TRUSTED (75–100):** Real decrypted data served instantly.
   * **SUSPICIOUS (45–74):** Tarpitted (2.5s delay) + honeytoken injected + some data encrypted.
   * **HOSTILE (0–44):** Seeded fake data served, IP logged to `audit_log.json`.

---

## 🛠️ Tech Stack

**Frontend:**
* React + Vite
* TailwindCSS for styling
* Lucide React for iconography
* Hosted on **Vercel**

**Backend:**
* Python + Flask
* Real-time Trust Engine middleware
* Fernet encryption (Cryptography) for sensitive data
* Hosted on **Render** (Note: Free tier spins down after 15 minutes of inactivity, which may cause a 50s delay on initial login if the server is asleep).

## 🚀 Local Development Setup

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python scripts/setup_db.py
python scripts/insert_data.py
python run.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
