"""
BrainUp Multiverse - High-Performance Python Backend
Provides game puzzle generation, verification, scoring engine, leaderboards,
and static frontend delivery.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import random
import time
import json
import sys
import uvicorn

# Ensure UTF-8 stdout on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

app = FastAPI(title="BrainUp Multiverse API", version="1.0.0")

# CORS for local Vite dev server and cross-origin calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage with file backup
DATA_FILE = os.path.join(os.path.dirname(__file__), "multiverse_data.json")

DEFAULT_DATA = {
    "users": {
        "explorer_default": {
            "id": "explorer_default",
            "name": "Dr. Nova Vance",
            "email": "nova.vance@multiverse.ai",
            "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=NovaVance&backgroundColor=8b5cf6",
            "rank": "Celestial Polymath",
            "level": 3,
            "totalScore": 850,
            "currentStreak": 4,
            "highestStreak": 9,
            "dimension": "Deep Cosmos Violet",
            "gameStats": {
                "sudoku": {"played": 5, "won": 4, "score": 240},
                "riddles": {"played": 8, "won": 7, "score": 210},
                "logic": {"played": 6, "won": 5, "score": 180},
                "math": {"played": 4, "won": 4, "score": 120},
                "arrow": {"played": 3, "won": 3, "score": 90},
                "memory": {"played": 2, "won": 2, "score": 60}
            }
        }
    },
    "leaderboard": [
        {"rank": 1, "name": "Vesper Hyperion", "title": "Omniversal Oracle", "score": 3840, "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Vesper&backgroundColor=06b6d4", "streak": 18, "dimension": "Cyber Neon"},
        {"rank": 2, "name": "Lyra Chronos", "title": "Singularity Sage", "score": 3210, "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Lyra&backgroundColor=8b5cf6", "streak": 14, "dimension": "Deep Cosmos Violet"},
        {"rank": 3, "name": "Aetherion Vance", "title": "Nebula Grandmaster", "score": 2750, "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Aetherion&backgroundColor=f59e0b", "streak": 12, "dimension": "Solar Flare Orange"},
        {"rank": 4, "name": "Cipher Zero", "title": "Matrix Architect", "score": 2420, "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Cipher&backgroundColor=10b981", "streak": 11, "dimension": "Matrix Emerald"},
        {"rank": 5, "name": "Kaelen Flux", "title": "Quantum Strategist", "score": 1980, "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Kaelen&backgroundColor=ec4899", "streak": 8, "dimension": "Cyber Neon"},
        {"rank": 6, "name": "Dr. Nova Vance", "title": "Celestial Polymath", "score": 850, "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=NovaVance&backgroundColor=8b5cf6", "streak": 4, "dimension": "Deep Cosmos Violet"}
    ]
}

def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_DATA
    return DEFAULT_DATA

def save_data(data):
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving data: {e}")

DATA = load_data()

# ----------------- Models -----------------
class AuthRequest(BaseModel):
    name: str
    email: str
    avatar: Optional[str] = None

class ScoreSubmission(BaseModel):
    userId: str
    gameId: str
    points: int
    streak: int
    timeSeconds: int
    won: bool

class SudokuValidateRequest(BaseModel):
    grid: List[List[int]]
    size: int

class AdminReviewRequest(BaseModel):
    requestId: str
    action: str  # "APPROVE" or "REJECT"
    reviewerEmail: str

class AdminGrantRequest(BaseModel):
    email: str
    actorEmail: str

class AdminRevokeRequest(BaseModel):
    email: str
    actorEmail: str

class AdminUserUpdateRequest(BaseModel):
    userId: str
    name: Optional[str] = None
    totalScore: Optional[int] = None
    highestStreak: Optional[int] = None
    role: Optional[str] = None
    actorEmail: str

class AdminUserDeleteRequest(BaseModel):
    userId: str
    actorEmail: str

class AdminAnnouncementRequest(BaseModel):
    announcement: str
    actorEmail: str

class RequestAccessPayload(BaseModel):
    userId: str
    email: str
    name: str
    reason: Optional[str] = "Requesting clearance to access the Multiverse Admin Panel."

# ----------------- Admin Authorization & Helper Functions -----------------
SUPER_ADMIN_EMAIL = "anushkabhatt96@gmail.com"

def is_super_admin(email: Optional[str]) -> bool:
    if not email:
        return False
    return email.lower().strip() == SUPER_ADMIN_EMAIL.lower().strip()

def is_admin(email: Optional[str]) -> bool:
    if not email:
        return False
    clean = email.lower().strip()
    if clean == SUPER_ADMIN_EMAIL.lower().strip():
        return True
    approved = [a.lower().strip() for a in DATA.get("approvedAdmins", [])]
    return clean in approved

def add_audit_log(actor: str, action: str, details: str):
    if "auditLogs" not in DATA:
        DATA["auditLogs"] = []
    DATA["auditLogs"].insert(0, {
        "id": f"log_{int(time.time()*1000)}",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "actor": actor,
        "action": action,
        "details": details
    })
    DATA["auditLogs"] = DATA["auditLogs"][:100]

def calculate_rank(total_score: int):
    if total_score < 250:
        return "Level 1 - Quantum Novice", 1
    elif total_score < 600:
        return "Level 2 - Astro Apprentice", 2
    elif total_score < 1200:
        return "Level 3 - Celestial Polymath", 3
    elif total_score < 2500:
        return "Level 4 - Nebula Grandmaster", 4
    else:
        return "Level 5 - Multiversal Omniscient", 5

# Ensure admin structure defaults in DATA
if "superAdminEmail" not in DATA:
    DATA["superAdminEmail"] = SUPER_ADMIN_EMAIL
if "approvedAdmins" not in DATA:
    DATA["approvedAdmins"] = [SUPER_ADMIN_EMAIL]
elif SUPER_ADMIN_EMAIL.lower().strip() not in [a.lower().strip() for a in DATA["approvedAdmins"]]:
    DATA["approvedAdmins"].append(SUPER_ADMIN_EMAIL)
if "adminRequests" not in DATA:
    DATA["adminRequests"] = []
if "auditLogs" not in DATA:
    DATA["auditLogs"] = []
if "systemAnnouncement" not in DATA:
    DATA["systemAnnouncement"] = "🌌 Cosmic Singularity Arena is live across all dimensions!"

# ----------------- Endpoints -----------------

@app.get("/api/health")
def health():
    return {
        "status": "online",
        "multiverse": "BrainUp Universe Engine",
        "superAdmin": SUPER_ADMIN_EMAIL,
        "timestamp": time.time()
    }

@app.get("/api/user/profile")
def get_profile(user_id: str = "explorer_default", email: Optional[str] = None):
    users = DATA.get("users", {})
    user = None
    if email:
        for u in users.values():
            if u.get("email", "").lower().strip() == email.lower().strip():
                user = u
                break
    if not user:
        user = users.get(user_id)
    if not user:
        user = DATA["users"].get("explorer_default")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Refresh admin flag and role dynamically
    u_email = user.get("email", "")
    is_super = is_super_admin(u_email)
    user_is_admin = is_super or is_admin(u_email)
    user["isAdmin"] = user_is_admin
    user["isSuperAdmin"] = is_super
    user["role"] = "SUPER_ADMIN" if is_super else ("ADMIN" if user_is_admin else "USER")
    
    # Check request status
    req_status = "NOT_REQUESTED"
    for req in DATA.get("adminRequests", []):
        if req.get("email", "").lower().strip() == u_email.lower().strip():
            req_status = req.get("status", "PENDING")
            break
    user["adminRequestStatus"] = req_status
    user["systemAnnouncement"] = DATA.get("systemAnnouncement", "")
    return user

@app.post("/api/auth/google")
def google_auth(payload: AuthRequest):
    user_email = payload.email.lower().strip()
    user_id = user_email.split("@")[0].replace(".", "_")
    
    is_super = is_super_admin(user_email)
    user_is_admin = is_super or is_admin(user_email)
    role = "SUPER_ADMIN" if is_super else ("ADMIN" if user_is_admin else "USER")

    if user_id not in DATA["users"]:
        avatar = payload.avatar or f"https://api.dicebear.com/7.x/bottts/svg?seed={user_id}&backgroundColor=8b5cf6"
        DATA["users"][user_id] = {
            "id": user_id,
            "name": payload.name,
            "email": payload.email,
            "avatar": avatar,
            "role": role,
            "isAdmin": user_is_admin,
            "isSuperAdmin": is_super,
            "rank": "Omniversal Grand Architect" if is_super else ("Quantum Architect" if user_is_admin else "Level 1 - Quantum Novice"),
            "level": 5 if is_super else 1,
            "totalScore": 5000 if is_super else 100,
            "currentStreak": 10 if is_super else 1,
            "highestStreak": 25 if is_super else 1,
            "dimension": "Deep Cosmos Violet",
            "gameStats": {
                "sudoku": {"played": 0, "won": 0, "score": 0},
                "riddles": {"played": 0, "won": 0, "score": 0},
                "logic": {"played": 0, "won": 0, "score": 0},
                "math": {"played": 0, "won": 0, "score": 0},
                "arrow": {"played": 0, "won": 0, "score": 0},
                "memory": {"played": 0, "won": 0, "score": 0}
            }
        }
        # Add to leaderboard if not present
        DATA["leaderboard"].append({
            "rank": len(DATA["leaderboard"]) + 1,
            "name": payload.name,
            "title": DATA["users"][user_id]["rank"],
            "score": DATA["users"][user_id]["totalScore"],
            "avatar": avatar,
            "streak": DATA["users"][user_id]["highestStreak"],
            "dimension": "Deep Cosmos Violet"
        })
        add_audit_log(payload.email, "USER_REGISTERED", f"Explorer {payload.name} ({payload.email}) logged in with role {role}")
    else:
        # Existing user: refresh role and admin status
        user = DATA["users"][user_id]
        user["name"] = payload.name
        user["role"] = role
        user["isAdmin"] = user_is_admin
        user["isSuperAdmin"] = is_super
        if is_super and user.get("level", 1) < 5:
            user["level"] = 5
            user["rank"] = "Omniversal Grand Architect"
    
    # Refresh request status
    req_status = "NOT_REQUESTED"
    for req in DATA.get("adminRequests", []):
        if req.get("email", "").lower().strip() == user_email:
            req_status = req.get("status", "PENDING")
            break
    DATA["users"][user_id]["adminRequestStatus"] = req_status
    DATA["users"][user_id]["systemAnnouncement"] = DATA.get("systemAnnouncement", "")

    save_data(DATA)
    return DATA["users"][user_id]

@app.post("/api/score/submit")
def submit_score(sub: ScoreSubmission):
    users = DATA.get("users", {})
    user = users.get(sub.userId)
    if not user:
        user = DATA["users"].get("explorer_default")
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    
    # Update score
    user["totalScore"] += sub.points
    if sub.streak > user["highestStreak"]:
        user["highestStreak"] = sub.streak
    user["currentStreak"] = sub.streak if sub.won else 0

    if user.get("role") != "SUPER_ADMIN":
        rank_title, level = calculate_rank(user["totalScore"])
        user["rank"] = rank_title
        user["level"] = level
    else:
        rank_title = user.get("rank", "Omniversal Grand Architect")

    stats = user["gameStats"].get(sub.gameId, {"played": 0, "won": 0, "score": 0})
    stats["played"] += 1
    if sub.won:
        stats["won"] += 1
    stats["score"] += sub.points
    user["gameStats"][sub.gameId] = stats

    # Update leaderboard
    found = False
    for item in DATA["leaderboard"]:
        if item["name"] == user["name"]:
            item["score"] = user["totalScore"]
            item["streak"] = user["highestStreak"]
            item["title"] = user["rank"]
            found = True
            break
    if not found:
        DATA["leaderboard"].append({
            "rank": len(DATA["leaderboard"]) + 1,
            "name": user["name"],
            "title": user["rank"],
            "score": user["totalScore"],
            "avatar": user["avatar"],
            "streak": user["highestStreak"],
            "dimension": user.get("dimension", "Deep Cosmos Violet")
        })

    # Sort leaderboard
    DATA["leaderboard"].sort(key=lambda x: x["score"], reverse=True)
    for i, item in enumerate(DATA["leaderboard"]):
        item["rank"] = i + 1

    save_data(DATA)
    return {"user": user, "leaderboard": DATA["leaderboard"][:10]}

@app.get("/api/leaderboard")
def get_leaderboard():
    return DATA.get("leaderboard", [])

# ----------------- Multiverse Admin Panel Endpoints -----------------

@app.get("/api/admin/overview")
def admin_overview(actor_email: str):
    if not is_admin(actor_email):
        raise HTTPException(status_code=403, detail="Unauthorized: Multiverse Admin clearance required.")
    
    users = DATA.get("users", {})
    total_users = len(users)
    approved_admins = DATA.get("approvedAdmins", [SUPER_ADMIN_EMAIL])
    total_score = sum(u.get("totalScore", 0) for u in users.values())
    
    games_breakdown = {
        "sudoku": {"played": 0, "won": 0, "score": 0},
        "riddles": {"played": 0, "won": 0, "score": 0},
        "logic": {"played": 0, "won": 0, "score": 0},
        "math": {"played": 0, "won": 0, "score": 0},
        "arrow": {"played": 0, "won": 0, "score": 0},
        "memory": {"played": 0, "won": 0, "score": 0}
    }
    for u in users.values():
        stats = u.get("gameStats", {})
        for g_id, g_stat in stats.items():
            if g_id in games_breakdown:
                games_breakdown[g_id]["played"] += g_stat.get("played", 0)
                games_breakdown[g_id]["won"] += g_stat.get("won", 0)
                games_breakdown[g_id]["score"] += g_stat.get("score", 0)
    
    pending_reqs = [r for r in DATA.get("adminRequests", []) if r.get("status") == "PENDING"]
    
    return {
        "superAdminEmail": SUPER_ADMIN_EMAIL,
        "isSuperAdmin": is_super_admin(actor_email),
        "totalUsers": total_users,
        "totalAdmins": len(approved_admins),
        "approvedAdmins": approved_admins,
        "totalMultiverseScore": total_score,
        "pendingRequestsCount": len(pending_reqs),
        "gamesBreakdown": games_breakdown,
        "recentAuditLogs": DATA.get("auditLogs", [])[:30],
        "systemAnnouncement": DATA.get("systemAnnouncement", "")
    }

@app.get("/api/admin/users")
def admin_get_users(actor_email: str):
    if not is_admin(actor_email):
        raise HTTPException(status_code=403, detail="Unauthorized: Admin access required.")
    
    user_list = []
    for u in DATA.get("users", {}).values():
        u_copy = dict(u)
        u_email = u_copy.get("email", "")
        u_copy["isAdmin"] = is_admin(u_email)
        u_copy["isSuperAdmin"] = is_super_admin(u_email)
        u_copy["role"] = "SUPER_ADMIN" if u_copy["isSuperAdmin"] else ("ADMIN" if u_copy["isAdmin"] else "USER")
        user_list.append(u_copy)
    return user_list

@app.post("/api/admin/users/update")
def admin_update_user(req: AdminUserUpdateRequest):
    if not is_admin(req.actorEmail):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    users = DATA.get("users", {})
    user = users.get(req.userId)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if req.name is not None:
        user["name"] = req.name
    if req.totalScore is not None:
        user["totalScore"] = max(0, req.totalScore)
        if user.get("role") != "SUPER_ADMIN":
            rank_title, level = calculate_rank(user["totalScore"])
            user["rank"] = rank_title
            user["level"] = level
    if req.highestStreak is not None:
        user["highestStreak"] = max(0, req.highestStreak)
    
    add_audit_log(req.actorEmail, "USER_UPDATED", f"User {user.get('name')} ({user.get('email')}) updated by {req.actorEmail}")
    save_data(DATA)
    return {"success": True, "user": user}

@app.post("/api/admin/users/delete")
def admin_delete_user(req: AdminUserDeleteRequest):
    if not is_admin(req.actorEmail):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    users = DATA.get("users", {})
    user = users.get(req.userId)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if is_super_admin(user.get("email")):
        raise HTTPException(status_code=400, detail="Cannot delete the Multiverse Super Admin.")
    
    deleted_email = user.get("email")
    del users[req.userId]
    DATA["leaderboard"] = [item for item in DATA.get("leaderboard", []) if item.get("name") != user.get("name")]
    DATA["approvedAdmins"] = [a for a in DATA.get("approvedAdmins", []) if a.lower().strip() != deleted_email.lower().strip()]
    
    add_audit_log(req.actorEmail, "USER_DELETED", f"User {deleted_email} purged by {req.actorEmail}")
    save_data(DATA)
    return {"success": True, "deletedEmail": deleted_email}

@app.get("/api/admin/requests")
def admin_get_requests(actor_email: str):
    if not is_admin(actor_email):
        raise HTTPException(status_code=403, detail="Unauthorized: Admin access required.")
    return {
        "superAdminEmail": SUPER_ADMIN_EMAIL,
        "approvedAdmins": DATA.get("approvedAdmins", [SUPER_ADMIN_EMAIL]),
        "requests": DATA.get("adminRequests", [])
    }

@app.post("/api/admin/requests/review")
def admin_review_request(req: AdminReviewRequest):
    if not is_admin(req.reviewerEmail):
        raise HTTPException(status_code=403, detail="Unauthorized: Only accepted admins can review access requests.")
    
    found = None
    for r in DATA.get("adminRequests", []):
        if r.get("id") == req.requestId:
            found = r
            break
    
    if not found:
        raise HTTPException(status_code=404, detail="Request not found")
    
    action = req.action.upper()
    found["status"] = "APPROVED" if action == "APPROVE" else "REJECTED"
    found["reviewedBy"] = req.reviewerEmail
    found["reviewedAt"] = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
    
    target_email = found.get("email", "").lower().strip()
    if action == "APPROVE":
        if "approvedAdmins" not in DATA:
            DATA["approvedAdmins"] = [SUPER_ADMIN_EMAIL]
        if target_email not in [a.lower().strip() for a in DATA["approvedAdmins"]]:
            DATA["approvedAdmins"].append(target_email)
        
        # Update user record if exists
        for u in DATA.get("users", {}).values():
            if u.get("email", "").lower().strip() == target_email:
                u["role"] = "ADMIN"
                u["isAdmin"] = True
                break
        add_audit_log(req.reviewerEmail, "ACCESS_APPROVED", f"Admin clearance granted to {target_email} by {req.reviewerEmail}")
    else:
        add_audit_log(req.reviewerEmail, "ACCESS_REJECTED", f"Admin request from {target_email} declined by {req.reviewerEmail}")
    
    save_data(DATA)
    return {
        "success": True,
        "status": found["status"],
        "targetEmail": target_email,
        "approvedAdmins": DATA["approvedAdmins"],
        "requests": DATA["adminRequests"]
    }

@app.post("/api/admin/grant")
def admin_grant(req: AdminGrantRequest):
    if not is_admin(req.actorEmail):
        raise HTTPException(status_code=403, detail="Unauthorized: Admin clearance required.")
    
    target_email = req.email.lower().strip()
    if "approvedAdmins" not in DATA:
        DATA["approvedAdmins"] = [SUPER_ADMIN_EMAIL]
    
    if target_email not in [a.lower().strip() for a in DATA["approvedAdmins"]]:
        DATA["approvedAdmins"].append(target_email)
        for u in DATA.get("users", {}).values():
            if u.get("email", "").lower().strip() == target_email:
                u["role"] = "ADMIN"
                u["isAdmin"] = True
                break
        add_audit_log(req.actorEmail, "DIRECT_ADMIN_GRANT", f"Admin privileges directly granted to {target_email} by {req.actorEmail}")
        save_data(DATA)
    return {"success": True, "approvedAdmins": DATA["approvedAdmins"]}

@app.post("/api/admin/revoke")
def admin_revoke(req: AdminRevokeRequest):
    if not is_admin(req.actorEmail):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    target_email = req.email.lower().strip()
    if target_email == SUPER_ADMIN_EMAIL.lower().strip():
        raise HTTPException(status_code=400, detail="Cannot revoke Super Admin privileges from anushkabhatt96@gmail.com")
    
    if "approvedAdmins" in DATA:
        DATA["approvedAdmins"] = [a for a in DATA["approvedAdmins"] if a.lower().strip() != target_email]
        for u in DATA.get("users", {}).values():
            if u.get("email", "").lower().strip() == target_email:
                u["role"] = "USER"
                u["isAdmin"] = False
                break
        add_audit_log(req.actorEmail, "ADMIN_REVOKED", f"Admin privileges revoked from {target_email} by {req.actorEmail}")
        save_data(DATA)
    return {"success": True, "approvedAdmins": DATA.get("approvedAdmins", [])}

@app.post("/api/admin/request-access")
def user_request_access(payload: RequestAccessPayload):
    user_email = payload.email.lower().strip()
    
    if is_admin(user_email):
        return {"status": "APPROVED", "message": "You already hold verified Admin Clearance."}
    
    if "adminRequests" not in DATA:
        DATA["adminRequests"] = []
    
    # Check existing pending request
    for r in DATA["adminRequests"]:
        if r.get("email", "").lower().strip() == user_email and r.get("status") == "PENDING":
            return {
                "status": "PENDING",
                "message": f"Your access request is currently pending review by {SUPER_ADMIN_EMAIL}."
            }
    
    new_req = {
        "id": f"req_{int(time.time()*1000)}",
        "userId": payload.userId,
        "name": payload.name,
        "email": payload.email,
        "reason": payload.reason or "Requesting admin clearance to view the Multiverse Admin Panel.",
        "requestedAt": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "status": "PENDING",
        "reviewedBy": None,
        "reviewedAt": None
    }
    DATA["adminRequests"].insert(0, new_req)
    add_audit_log(payload.email, "ACCESS_REQUESTED", f"Explorer {payload.name} ({payload.email}) requested admin clearance")
    save_data(DATA)
    return {
        "status": "PENDING",
        "requestId": new_req["id"],
        "message": f"Access request sent. Awaiting acceptance from {SUPER_ADMIN_EMAIL}."
    }

@app.post("/api/admin/announcement")
def set_announcement(req: AdminAnnouncementRequest):
    if not is_admin(req.actorEmail):
        raise HTTPException(status_code=403, detail="Unauthorized")
    DATA["systemAnnouncement"] = req.announcement
    add_audit_log(req.actorEmail, "BROADCAST_UPDATED", f"Broadcast updated to: {req.announcement[:60]}")
    save_data(DATA)
    return {"success": True, "systemAnnouncement": DATA["systemAnnouncement"]}

# ----------------- 100-Level Difficulty Shuffler -----------------
def get_level_difficulty(level: int) -> str:
    """Returns shuffled difficulty tier across levels 1 to 100."""
    level = max(1, min(100, level))
    if level <= 10:
        return "MEDIUM" if level in [4, 7, 9] else "EASY"
    elif level <= 30:
        pattern = ["EASY", "MEDIUM", "EASY", "HARD", "MEDIUM"]
        return pattern[(level - 11) % len(pattern)]
    elif level <= 60:
        pattern = ["MEDIUM", "HARD", "MEDIUM", "SUPER HARD", "HARD"]
        return pattern[(level - 31) % len(pattern)]
    elif level <= 85:
        pattern = ["HARD", "MEDIUM", "SUPER HARD", "HARD", "SUPER HARD"]
        return pattern[(level - 61) % len(pattern)]
    else:
        pattern = ["HARD", "SUPER HARD", "SUPER HARD", "SUPER HARD"]
        return pattern[(level - 86) % len(pattern)]

# ================= GAME GENERATORS (LEVELS 1-100) =================

# 1. Sudoku Blitz (Levels 1-100)
@app.get("/api/games/sudoku/generate")
def generate_sudoku(level: int = 1):
    level = max(1, min(100, level))
    difficulty = get_level_difficulty(level)
    
    # Base 4x4 boards
    puzzles_4x4_base = [
        {
            "solution": [
                [1, 2, 3, 4],
                [3, 4, 1, 2],
                [2, 1, 4, 3],
                [4, 3, 2, 1]
            ]
        },
        {
            "solution": [
                [2, 4, 1, 3],
                [3, 1, 4, 2],
                [4, 2, 3, 1],
                [1, 3, 2, 4]
            ]
        },
        {
            "solution": [
                [3, 1, 4, 2],
                [4, 2, 1, 3],
                [1, 3, 2, 4],
                [2, 4, 3, 1]
            ]
        },
        {
            "solution": [
                [4, 3, 2, 1],
                [1, 2, 3, 4],
                [3, 4, 1, 2],
                [2, 1, 4, 3]
            ]
        }
    ]

    base = puzzles_4x4_base[(level - 1) % len(puzzles_4x4_base)]
    sol = base["solution"]
    init = [row[:] for row in sol]

    # Decide blanks based on difficulty
    if difficulty == "EASY":
        blanks = 3 + (level % 2) # 3-4 blanks
        hint = f"Level {level} [EASY]: Fill the missing numbers from 1 to 4. Each quadrant has only 1 blank!"
    elif difficulty == "MEDIUM":
        blanks = 5 + (level % 3) # 5-7 blanks
        hint = f"Level {level} [MEDIUM]: Look for rows and columns that already have 3 out of 4 numbers."
    elif difficulty == "HARD":
        blanks = 8 + (level % 2) # 8-9 blanks
        hint = f"Level {level} [HARD]: High blank density. Use process of elimination across quadrants."
    else: # SUPER HARD
        blanks = 10 + (level % 2) # 10-11 blanks
        hint = f"Level {level} [SUPER HARD]: Minimal clues! Cross-reference multiple quadrants simultaneously."

    # Blank out cells deterministically based on level seed
    rng = random.Random(level * 37 + 101)
    cells = [(r, c) for r in range(4) for c in range(4)]
    rng.shuffle(cells)
    for r, c in cells[:blanks]:
        init[r][c] = 0

    return {
        "level": level,
        "difficulty": difficulty,
        "size": 4,
        "boxWidth": 2,
        "boxHeight": 2,
        "puzzle": init,
        "solution": sol,
        "hint": hint
    }

# 2. Cosmic Riddles (Levels 1-100)
@app.get("/api/games/riddles")
def get_riddles(level: int = 1):
    level = max(1, min(100, level))
    difficulty = get_level_difficulty(level)

    # Master pool of thematic cosmic riddles categorized by difficulty
    riddles_pool = [
        # EASY Tier
        {
            "tier": "EASY",
            "title": "The Solar Titan",
            "question": "I anchor eight celestial wanderers with my fiery gravity. Nuclear fusion in my core transforms hydrogen into helium every second. What am I?",
            "options": ["The Sun", "Jupiter", "Polaris", "Sirius"],
            "answer": "The Sun",
            "hint": "The central G-type main-sequence star of our solar system.",
            "explanation": "The Sun accounts for 99.86% of the mass in our solar system, fusing 600 million tons of hydrogen every second."
        },
        {
            "tier": "EASY",
            "title": "The Nocturnal Reflector",
            "question": "I have no atmosphere and no light of my own, yet I light up the night sky and govern the oceanic tides of Earth. Who am I?",
            "options": ["The Moon", "Venus", "Mars", "Titan"],
            "answer": "The Moon",
            "hint": "Earth's only natural satellite in tidal locking.",
            "explanation": "The Moon reflects sunlight with an albedo of about 0.12 and creates gravitational ocean tides on Earth."
        },
        {
            "tier": "EASY",
            "title": "The Universal Speed Limit",
            "question": "Nothing with mass can outpace me in a vacuum. I race through the cosmic void at approximately 300,000 kilometers per second. What am I?",
            "options": ["Speed of Light", "Solar Wind", "Sound Wave", "Radio Pulse"],
            "answer": "Speed of Light",
            "hint": "Represented by constant 'c' in Einstein's E=mc².",
            "explanation": "The speed of light in vacuum is exactly 299,792,458 m/s, the absolute upper speed limit for causality."
        },
        {
            "tier": "EASY",
            "title": "The Red Planet",
            "question": "Iron oxide covers my dusty plains giving me a crimson hue. I harbor Olympus Mons, the tallest volcano in the solar system. Which planet am I?",
            "options": ["Mars", "Venus", "Mercury", "Jupiter"],
            "answer": "Mars",
            "hint": "Fourth planet from the Sun, named after the Roman god of war.",
            "explanation": "Mars' reddish appearance is caused by iron(III) oxide (rust) on its surface."
        },

        # MEDIUM Tier
        {
            "tier": "MEDIUM",
            "title": "The Singularity Horizon",
            "question": "I have no voice, but I shout of time's end. The faster you rush toward me, the slower your seconds spend. Nothing can escape my gravitational grasp, not even light. What am I?",
            "options": ["A Black Hole", "A Dark Nebula", "A Neutron Star", "A Tachyon Beam"],
            "answer": "A Black Hole",
            "hint": "Einstein's general relativity predicted my boundary known as the 'event horizon'.",
            "explanation": "At the event horizon of a black hole, escape velocity equals the speed of light, and gravitational time dilation approaches infinity."
        },
        {
            "tier": "MEDIUM",
            "title": "The Stellar Tombstone",
            "question": "A city-sized sphere packing the mass of two suns, spinning hundreds of times each second and sweeping radio beams across the galaxy. What am I?",
            "options": ["A Pulsar", "A White Dwarf", "A Red Giant", "A Brown Dwarf"],
            "answer": "A Pulsar",
            "hint": "A magnetized rotating neutron star discovered by Jocelyn Bell Burnell.",
            "explanation": "Pulsars are highly magnetized rotating neutron stars that emit beams of electromagnetic radiation out of their magnetic poles."
        },
        {
            "tier": "MEDIUM",
            "title": "The Ghostly Particle",
            "question": "Trillions of me pass through your fingernail every second without touching a single atom. I have almost zero mass and neutral charge. What am I?",
            "options": ["A Neutrino", "A Positron", "A Quark", "A Gluon"],
            "answer": "A Neutrino",
            "hint": "Emitted copiously in nuclear reactions within stellar cores.",
            "explanation": "Neutrinos interact only via the weak subatomic force and gravity, passing easily through light-years of lead."
        },
        {
            "tier": "MEDIUM",
            "title": "The Invisible Scaffold",
            "question": "I compose 85% of all matter in the universe, emitting no photons, yet keeping galaxies from flying apart. What am I?",
            "options": ["Dark Matter", "Antimatter", "Dark Energy", "Interstellar Dust"],
            "answer": "Dark Matter",
            "hint": "Inferred from the anomalous flat rotation curves of spiral galaxies.",
            "explanation": "Dark matter does not interact with the electromagnetic force, detected purely by its gravitational pull."
        },

        # HARD Tier
        {
            "tier": "HARD",
            "title": "The Quantum Paradox",
            "question": "Look at me and I freeze in place; turn away and I dance in many states. I can be dead and alive simultaneously until observed. Who am I?",
            "options": ["Schrödinger's Cat", "Maxwell's Demon", "Fermi's Paradox", "Laplace's Demon"],
            "answer": "Schrödinger's Cat",
            "hint": "A thought experiment by Erwin Schrödinger criticizing the Copenhagen wave collapse interpretation.",
            "explanation": "Illustrates quantum superposition, where a system occupies all possible states until a measurement occurs."
        },
        {
            "tier": "HARD",
            "title": "The Relativistic Twin",
            "question": "If you travel to Alpha Centauri at 99% the speed of light and return, you age 2 years while decades elapse on Earth. What principle is this?",
            "options": ["Special Relativistic Time Dilation", "Cosmic Inflation", "Quantum Tunneling", "Hawking Evaporation"],
            "answer": "Special Relativistic Time Dilation",
            "hint": "Calculated using the Lorentz factor γ = 1 / √(1 - v²/c²).",
            "explanation": "Moving clocks run slower relative to stationary observers as a direct consequence of the invariance of light speed."
        },
        {
            "tier": "HARD",
            "title": "The Primordial Echo",
            "question": "Permeating every cubic centimeter of deep space at a frigid 2.7 Kelvin, I carry the earliest fossil snapshot of the infant cosmos 380,000 years after creation. What am I?",
            "options": ["Cosmic Microwave Background", "Solar Flare Wave", "Oort Cloud Radiation", "Tachyon Field"],
            "answer": "Cosmic Microwave Background",
            "hint": "Discovered by Arno Penzias and Robert Wilson with the Holmdel Horn Antenna in 1965.",
            "explanation": "The CMB is remnant thermal radiation from the epoch of recombination when photons first decoupled from matter."
        },

        # SUPER HARD Tier
        {
            "tier": "SUPER HARD",
            "title": "The Black Hole Evaporation",
            "question": "Quantum fluctuations near an event horizon cause virtual particle pairs to split, causing black holes to slowly lose mass and radiate away. What is this phenomenon?",
            "options": ["Hawking Radiation", "Unruh Effect", "Casimir Force", "Cherenkov Emission"],
            "answer": "Hawking Radiation",
            "hint": "Theoretical radiation predicted by physicist Stephen Hawking in 1974.",
            "explanation": "Hawking radiation results from quantum field theory in curved spacetime, leading to the eventual thermal evaporation of black holes."
        },
        {
            "tier": "SUPER HARD",
            "title": "The Spooky Action",
            "question": "Measuring the spin of particle A instantly determines the state of particle B light-years away, faster than light can traverse. What quantum phenomenon baffled Einstein?",
            "options": ["Quantum Entanglement", "Wave Function Collapse", "Quantum Decoherence", "Superconducting Quantum Phase"],
            "answer": "Quantum Entanglement",
            "hint": "Einstein famously called this 'spooky action at a distance' in the EPR paradox paper.",
            "explanation": "Entangled pairs share a single non-local quantum state; measuring one instantaneously defines the state of the other regardless of distance."
        },
        {
            "tier": "SUPER HARD",
            "title": "The Holographic Universe",
            "question": "This theoretical principle in string theory posits that all information contained in our 3D spatial universe is encoded on its 2D boundary horizon. What is it?",
            "options": ["The Holographic Principle", "The Anthropic Principle", "The Many-Worlds Interpretation", "The Penrose Tiling Confounder"],
            "answer": "The Holographic Principle",
            "hint": "Derived from black hole thermodynamics by 't Hooft and Leonard Susskind.",
            "explanation": "The holographic principle proposes that the description of a volume of space can be thought of as encoded on a lower-dimensional boundary to the region."
        }
    ]

    # Filter by difficulty matching this level
    matched = [r for r in riddles_pool if r["tier"] == difficulty]
    if not matched:
        matched = riddles_pool

    selected = matched[(level - 1) % len(matched)]
    return {
        "level": level,
        "difficulty": difficulty,
        "id": f"riddle_lvl_{level}",
        "title": f"Level {level} // {selected['title']}",
        "question": selected["question"],
        "options": selected["options"],
        "answer": selected["answer"],
        "hint": f"[{difficulty}] {selected['hint']}",
        "explanation": selected["explanation"]
    }

# 3. Logic & Reasoning (Levels 1-100)
@app.get("/api/games/logic")
def get_logic_puzzles(level: int = 1):
    level = max(1, min(100, level))
    difficulty = get_level_difficulty(level)

    # Procedural generation tailored to level and difficulty
    rng = random.Random(level * 43 + 203)

    if difficulty == "EASY":
        # Simple step progression
        step = rng.choice([2, 3, 4, 5])
        start = rng.randint(2, 10)
        seq = [start + i * step for i in range(5)]
        ans = start + 5 * step
        seq_display = [str(x) for x in seq] + ["?"]
        decoys = [ans - step, ans + step, ans + 2 * step]
        hint = f"Constant addition pattern: examine the step between consecutive numbers (+{step})."
        explanation = f"Every number increases by {step}. {seq[-1]} + {step} = {ans}."
        title = f"Linear Frequency Progression (Lvl {level})"
    elif difficulty == "MEDIUM":
        # Alternating or Fibonacci sequence
        choice_type = level % 2
        if choice_type == 0:
            # Alternating +A, -B
            a = rng.choice([5, 6, 7, 8])
            b = rng.choice([2, 3])
            val = rng.randint(10, 20)
            seq = [val]
            for i in range(5):
                val = val + a if i % 2 == 0 else val - b
                seq.append(val)
            next_step = a if len(seq) % 2 == 1 else -b
            ans = seq[-1] + next_step
            seq_display = [str(x) for x in seq] + ["?"]
            decoys = [ans - 2, ans + 2, ans + 4]
            hint = f"Alternating frequency pattern: observe odd vs even step shifts (+{a} then -{b})."
            explanation = f"The sequence alternates adding {a} and subtracting {b}. Next is {seq[-1]} {next_step:+d} = {ans}."
            title = f"Alternating Flux Matrix (Lvl {level})"
        else:
            # Fibonacci shift
            f1, f2 = rng.randint(1, 4), rng.randint(2, 5)
            seq = [f1, f2]
            for _ in range(4):
                seq.append(seq[-1] + seq[-2])
            ans = seq[-1] + seq[-2]
            seq_display = [str(x) for x in seq] + ["?"]
            decoys = [ans - 1, ans + 2, ans + 5]
            hint = "Each coordinate equals the sum of the two preceding harmonics."
            explanation = f"Fibonacci logic: {seq[-2]} + {seq[-1]} = {ans}."
            title = f"Harmonic Fibonacci Resonance (Lvl {level})"
    elif difficulty == "HARD":
        # Doubling delta sequence: +2, +4, +8, +16, +32...
        start = rng.randint(3, 8)
        delta = rng.choice([2, 3])
        seq = [start]
        curr_delta = delta
        for _ in range(4):
            seq.append(seq[-1] + curr_delta)
            curr_delta *= 2
        ans = seq[-1] + curr_delta
        seq_display = [str(x) for x in seq] + ["?"]
        decoys = [ans - curr_delta // 2, ans + curr_delta // 2, ans + curr_delta]
        hint = "The delta difference between consecutive terms multiplies by 2 on each hop."
        explanation = f"The differences double: next difference is {curr_delta}. {seq[-1]} + {curr_delta} = {ans}."
        title = f"Exponential Singularity Progression (Lvl {level})"
    else: # SUPER HARD
        # Cubic or composite prime jump
        base = rng.randint(2, 4)
        seq = [i**3 + base for i in range(1, 6)]
        ans = 6**3 + base
        seq_display = [str(x) for x in seq] + ["?"]
        decoys = [ans - 15, ans + 15, ans + 30]
        hint = "Third-order quantum polynomials: n³ + offset."
        explanation = f"Formula is n³ + {base}. For n=6: 6³ + {base} = 216 + {base} = {ans}."
        title = f"Cubic Dimension Tensor (Lvl {level})"

    options = list(set([str(ans)] + [str(d) for d in decoys]))
    while len(options) < 4:
        options.append(str(ans + len(options) * 3))
    rng.shuffle(options)

    return {
        "level": level,
        "difficulty": difficulty,
        "id": f"logic_lvl_{level}",
        "title": title,
        "description": f"Identify the missing quantum resonance value in this {difficulty} progression:",
        "sequence": seq_display,
        "options": options,
        "answer": str(ans),
        "hint": hint,
        "explanation": explanation
    }

# 4. Rapid Math Sprint (Levels 1-100)
@app.get("/api/games/math/batch")
def get_math_batch(level: int = 1, count: int = 15):
    level = max(1, min(100, level))
    difficulty = get_level_difficulty(level)
    rng = random.Random(level * 59 + 307)

    problems = []
    for i in range(count):
        if difficulty == "EASY":
            op = rng.choice(["+", "-"])
            a = rng.randint(10, 40)
            b = rng.randint(5, 30)
            if op == "+":
                ans = a + b
                text = f"{a} + {b}"
            else:
                a, b = max(a, b), min(a, b)
                ans = a - b
                text = f"{a} - {b}"
        elif difficulty == "MEDIUM":
            op = rng.choice(["+", "-", "*", "missing"])
            if op == "+":
                a = rng.randint(25, 80)
                b = rng.randint(15, 75)
                ans = a + b
                text = f"{a} + {b}"
            elif op == "-":
                a = rng.randint(50, 140)
                b = rng.randint(12, a - 5)
                ans = a - b
                text = f"{a} - {b}"
            elif op == "*":
                a = rng.randint(5, 12)
                b = rng.randint(3, 9)
                ans = a * b
                text = f"{a} × {b}"
            else:
                a = rng.randint(15, 60)
                ans = rng.randint(10, 40)
                text = f"{a} + [ ? ] = {a + ans}"
        elif difficulty == "HARD":
            op = rng.choice(["*", "missing_mul", "bracket_sub"])
            if op == "*":
                a = rng.randint(7, 16)
                b = rng.randint(6, 14)
                ans = a * b
                text = f"{a} × {b}"
            elif op == "missing_mul":
                a = rng.randint(6, 15)
                ans = rng.randint(4, 12)
                text = f"{a} × [ ? ] = {a * ans}"
            else:
                a = rng.randint(5, 10)
                b = rng.randint(4, 8)
                c = rng.randint(10, 30)
                ans = (a * b) - c
                text = f"({a} × {b}) - {c}"
        else: # SUPER HARD
            op = rng.choice(["bracket_add_mul", "bracket_mul_sub", "triple"])
            a = rng.randint(8, 15)
            b = rng.randint(5, 12)
            c = rng.randint(12, 45)
            if op == "bracket_add_mul":
                ans = (a + b) * 3
                text = f"({a} + {b}) × 3"
            elif op == "bracket_mul_sub":
                ans = (a * b) - c
                text = f"({a} × {b}) - {c}"
            else:
                ans = a * b + c
                text = f"{a} × {b} + {c}"

        # Generate 3 decoys
        decoys = set()
        while len(decoys) < 3:
            diff = rng.choice([-10, -5, -2, -1, 1, 2, 5, 10, 12])
            fake = ans + diff
            if fake > 0 and fake != ans:
                decoys.add(fake)
        choices = list(decoys) + [ans]
        rng.shuffle(choices)

        problems.append({
            "id": f"m_{level}_{i+1}",
            "question": text,
            "answer": ans,
            "choices": choices
        })

    return {
        "level": level,
        "difficulty": difficulty,
        "problems": problems
    }

# 5. Arrow Treasure Hunt (Levels 1-100)
@app.get("/api/games/treasure-hunt/stage")
def get_treasure_hunt(level: int = 1):
    level = max(1, min(100, level))
    difficulty = get_level_difficulty(level)
    rng = random.Random(level * 71 + 409)

    directions = ["UP", "DOWN", "LEFT", "RIGHT"]
    if difficulty == "EASY":
        count = 4 + (level % 2) # 4-5 steps
        speed = 800 # ms
    elif difficulty == "MEDIUM":
        count = 6 + (level % 3) # 6-8 steps
        speed = 650
    elif difficulty == "HARD":
        count = 9 + (level % 3) # 9-11 steps
        speed = 500
    else: # SUPER HARD
        count = 12 + (level % 4) # 12-15 steps
        speed = 400

    seq = [rng.choice(directions) for _ in range(count)]
    return {
        "level": level,
        "difficulty": difficulty,
        "stepCount": count,
        "sequence": seq,
        "flashSpeed": speed,
        "lore": f"Sector {level} [{difficulty}]: Calibrate quantum directional vectors to open Singularity Vault #{level}.",
        "hint": f"The sequence begins with {seq[0]} and ends with {seq[-1]} (Total {count} vectors)."
    }

# 6. Quantum Memory Grid (Levels 1-100)
@app.get("/api/games/memory/deck")
def get_memory_deck(level: int = 1):
    level = max(1, min(100, level))
    difficulty = get_level_difficulty(level)
    rng = random.Random(level * 83 + 511)

    cards_master = [
        {"name": "Pulsar", "symbol": "⚡", "color": "#00F0FF"},
        {"name": "Supernova", "symbol": "💥", "color": "#FF5722"},
        {"name": "Dark Matter", "symbol": "🌀", "color": "#8B5CF6"},
        {"name": "Quasar", "symbol": "🔮", "color": "#EC4899"},
        {"name": "Wormhole", "symbol": "🌌", "color": "#10B981"},
        {"name": "Black Hole", "symbol": "🕳️", "color": "#6366F1"},
        {"name": "Dyson Sphere", "symbol": "☀️", "color": "#F59E0B"},
        {"name": "Nebula", "symbol": "✨", "color": "#14B8A6"}
    ]

    # Decide pair count based on difficulty
    if difficulty == "EASY":
        pair_count = 4 # 8 cards (2x4 or 4x2)
    elif difficulty == "MEDIUM":
        pair_count = 6 # 12 cards (3x4)
    else: # HARD & SUPER HARD
        pair_count = 8 # 16 cards (4x4)

    chosen = cards_master[:pair_count]
    deck = []
    for i, c in enumerate(chosen):
        deck.append({"id": f"{level}_{i}_a", "pairId": i, **c})
        deck.append({"id": f"{level}_{i}_b", "pairId": i, **c})
    rng.shuffle(deck)

    return {
        "level": level,
        "difficulty": difficulty,
        "pairCount": pair_count,
        "deck": deck
    }

# ----------------- Static Frontend Delivery -----------------
possible_dist_dirs = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "dist"))
]
dist_dir = next((d for d in possible_dist_dirs if os.path.exists(d)), None)

if dist_dir and os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(dist_dir, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "ok", "message": "BrainUp backend running. Frontend dist not found."}
else:
    @app.get("/")
    async def root_fallback():
        return {"status": "ok", "message": "BrainUp API is active. Run 'npm run build' in frontend directory to serve the frontend on this port."}

if __name__ == "__main__":
    print("=" * 60)
    print(">> BrainUp Multiverse Engine is powering up on http://localhost:8000")
    print("=" * 60)
    uvicorn.run(app, host="127.0.0.1", port=8000)
