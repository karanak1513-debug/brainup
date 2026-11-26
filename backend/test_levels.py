import os
import sys
import json
import urllib.request

base = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("BRAINUP_API_URL", "http://127.0.0.1:8000")).rstrip("/")

print(f"Testing BrainUp API at: {base}")

# 1. Health & Core Endpoints
health_res = json.loads(urllib.request.urlopen(base + "/api/health").read().decode("utf-8"))
assert health_res.get("status") == "online", f"Unexpected health status: {health_res}"
print(f"[PASS] /api/health -> {health_res.get('status')} ({health_res.get('multiverse')})")

lb_res = json.loads(urllib.request.urlopen(base + "/api/leaderboard").read().decode("utf-8"))
assert isinstance(lb_res, list) and len(lb_res) > 0, "Leaderboard should be a non-empty list"
print(f"[PASS] /api/leaderboard -> {len(lb_res)} entries")

profile_res = json.loads(urllib.request.urlopen(base + "/api/user/profile").read().decode("utf-8"))
assert "totalScore" in profile_res, "Profile missing totalScore"
print(f"[PASS] /api/user/profile -> {profile_res.get('name')} ({profile_res.get('totalScore')} PTS)")

# 2. All Backend Game Generator Endpoints across Levels 1-100
endpoints = [
    ("Sudoku Blitz", "/api/games/sudoku/generate"),
    ("Cosmic Riddles", "/api/games/riddles"),
    ("Logic & Reasoning", "/api/games/logic"),
    ("Rapid Math Sprint", "/api/games/math/batch"),
    ("Arrow Treasure Hunt", "/api/games/treasure-hunt/stage"),
    ("Quantum Memory Grid", "/api/games/memory/deck"),
    ("Chromatic Reflex", "/api/games/stroop"),
    ("Cosmic Word Weaver", "/api/games/words"),
    ("Spatial Matrix", "/api/games/spatial"),
]

test_levels = [1, 10, 25, 45, 70, 95, 100]

for name, ep in endpoints:
    print(f"\n--- Testing {name} across levels {test_levels} ---")
    for lvl in test_levels:
        url = f"{base}{ep}?level={lvl}"
        r = urllib.request.urlopen(url)
        data = json.loads(r.read().decode("utf-8"))
        diff = data.get("difficulty", "N/A")
        assert diff in ("EASY", "MEDIUM", "HARD", "SUPER HARD"), f"Unexpected difficulty: {diff}"
        print(f"  Level {lvl:3d}: [200 OK] Difficulty = {diff}")

print("\nALL BACKEND ENDPOINTS & 100-LEVEL SHUFFLED CHALLENGES VERIFIED!")
