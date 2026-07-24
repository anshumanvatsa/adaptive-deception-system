"""
trust.py — Behavior-Driven Trust Engine (v3.0)
"""
import time


def calculate_trust(session: dict) -> int:
    """
    Recalculate trust score based on behavioral signals.
    """
    now = time.time()
    trust = session["trust_score"]
    request_count = session["request_count"]
    reasons = []

    # Phase 2: Navigation Pattern (Direct jump)
    if session.get("direct_jump"):
        trust -= 15
        reasons.append("direct_jump -15")
        session.pop("direct_jump", None)  # Only penalize once

    # Phase 2: Device Fingerprint (IP Change)
    if session.get("original_ip") and session.get("current_ip"):
        if session["original_ip"] != session["current_ip"]:
            trust -= 20
            reasons.append(f"ip_change -20")
            session["original_ip"] = session["current_ip"] # Update to new IP after penalizing

    # Grace period: first 3 requests always get a small bonus (normal login behavior)
    if request_count <= 3:
        trust += 3
        reasons.append(f"grace_period req#{request_count} +3")
        trust = max(0, min(trust, 100))
        session["trust_score"] = trust
        user_id = session.get("user_id", "unknown")
        print(f"[TRUST] user_id={user_id} score={trust} req#{request_count} | {', '.join(reasons)}")
        return trust

    # --- Instantaneous gap: time since the PREVIOUS request ---
    prev = session.get("prev_request", session.get("login_time", now))
    instant_gap = now - prev  # seconds since last request

    if instant_gap < 0.3:
        # Extremely rapid-fire — very suspicious
        trust -= 20
        reasons.append(f"rapid-fire gap={instant_gap:.2f}s -20")
    elif instant_gap < 1.5:
        # Fast but not extreme
        trust -= 8
        reasons.append(f"fast gap={instant_gap:.2f}s -8")
    elif instant_gap > 8.0:
        # No activity for 8+ seconds — calm user resuming work
        trust += 8
        reasons.append(f"calm gap={instant_gap:.2f}s +8")
    elif instant_gap > 3.0:
        # Normal browsing pace
        trust += 4
        reasons.append(f"normal gap={instant_gap:.2f}s +4")
    else:
        # Slightly fast but acceptable
        trust += 1
        reasons.append(f"ok gap={instant_gap:.2f}s +1")

    # --- Absolute volume penalty (prevents patient scraping) ---
    if request_count > 50:
        trust -= 15
        reasons.append(f"very_high_volume req#{request_count} -15")
    elif request_count > 30:
        trust -= 8
        reasons.append(f"high_volume req#{request_count} -8")

    # --- Failed attempts penalty ---
    failed = session.get("failed_attempts", 0)
    if failed > 0:
        penalty = min(failed * 15, 40)
        trust -= penalty
        reasons.append(f"failed_attempts={failed} -{penalty}")

    # --- Clamp and persist ---
    trust = max(0, min(trust, 100))
    session["trust_score"] = trust

    reason_str = ", ".join(reasons) if reasons else "no_change"
    user_id = session.get("user_id", "unknown")
    print(f"[TRUST] user_id={user_id} score={trust} req#{request_count} | {reason_str}")
    return trust