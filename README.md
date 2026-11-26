# BrainUp — The Multiverse of Intelligence

> A full-stack interactive 3D cognitive training platform set inside a cosmic multiverse. Built with **React 19**, **Vite**, **Three.js**, **Tailwind CSS v4**, and a **FastAPI** Python backend featuring **10 cognitive arenas**, **1,000 shuffled levels (100 per arena)**, a **3D interactive Quantum Dice hub**, real-time **leaderboards**, and a role-based **Multiverse Admin Panel**.

---

## Live Deployments

- **Frontend (Vercel):** [https://brainup-dusky.vercel.app](https://brainup-dusky.vercel.app)
- **Backend API (Render):** [https://brainup-backend-coxl.onrender.com](https://brainup-backend-coxl.onrender.com)
- **Backend Health Check:** [https://brainup-backend-coxl.onrender.com/api/health](https://brainup-backend-coxl.onrender.com/api/health)
- **GitHub Repository:** [https://github.com/karanak1513-debug/brainup](https://github.com/karanak1513-debug/brainup)

> **Architecture Note:** In production, Vercel serves the compiled React + Vite application (`frontend/dist`) and proxies all `/api/*` and `/health` requests via edge rewrites in [`vercel.json`](./vercel.json) directly to the FastAPI service hosted on Render ([`render.yaml`](./render.yaml)), eliminating localhost dependencies in production.

---

## Key Features

### 1. Interactive 3D Cosmos & Dynamic Dimensions
- **Three.js Galaxy Canvas (`CosmicCanvas.jsx`):** Fullscreen interactive 3D starfield with layered cosmic dust clouds, mouse parallax drift, and hyperspace camera FOV warp transitions when launching arenas.
- **Live Dimension Switcher (`DimensionSwitcher.jsx`):** Dynamically re-themes CSS variables, neon accents, and particle palettes across 5 themes:
  - Deep Cosmos Violet (`cosmos-violet`)
  - Cyber Neon (`cyber-neon`)
  - Solar Flare Orange (`solar-flare`)
  - Matrix Emerald (`matrix-emerald`)
  - Quantum Prism (`quantum-prism`)

### 2. Dual Game Hub: 3D Quantum Dice & Multiverse Arcade
- **Interactive 3D Quantum Dice (`CubeDice.jsx`):** Raycasted, draggable 3D rounded cube with authentic 1–6 dice pips, inertia damping, physics-based roll animations, and single-click game launching.
- **Multiverse Arcade Grid (`ArcadeGrid.jsx`):** Filterable showcase of all 10 arenas across categories (`All`, `Logic`, `Speed`, `Spatial`, `Memory`).

### 3. 10 Cognitive Mind Arenas (100 Levels Each = 1,000 Total Levels)
Every arena supports **Levels 1 to 100** across 4 shuffled difficulty tiers (`EASY`, `MEDIUM`, `HARD`, `SUPER HARD`), interactive level selection (`LevelSelectorModal.jsx`), contextual hints, streak combo multipliers, and Web Audio synthesizer feedback (`soundFX.js`):

| # | Arena | Category | Mechanics & Skills |
| :---: | :--- | :--- | :--- |
| 1 | **Sudoku Blitz** | Logic | 4×4 quantum matrix deduction with real-time row/column/quadrant conflict validation & tactile keypad |
| 2 | **Cosmic Riddles** | Logic | Astrophysics, relativity, and quantum paradox multiple-choice challenges with scientific explanations |
| 3 | **Logic & Reasoning** | Logic | Pattern recognition across mathematical, prime, Fibonacci, and exponential sequences |
| 4 | **Rapid Math Sprint** | Speed | 60-second high-speed arithmetic sprint with urgency timer bar & combo multipliers |
| 5 | **Arrow Treasure Hunt** | Spatial | Sequential directional vector recall (grid & keyboard controls) to unlock vaults |
| 6 | **Quantum Memory Grid** | Memory | 3D CSS card-flipping pair match across Pulsar, Black Hole, Quasar & Nebula cards |
| 7 | **Chromatic Reflex** | Speed | Cognitive Stroop interference challenges testing ink color vs. word meaning inhibition |
| 8 | **Cosmic Word Weaver** | Memory | Anagram synthesis from scrambled astrophysical & quantum terminology |
| 9 | **Spatial Matrix** | Spatial | 3D mental glyph rotation and mirror-decoy elimination |
| 10 | **Quantum Reactor** | Logic | 2048-style isotopic fusion sliding grid building toward the Singularity (`Ω`) |

### 4. Explorer Profiles, Leaderboard, Admin Control Panel & Audio
- **Global Scoreboard & Performance Breakdown (`ScoreboardModal.jsx`):** Ranked global leaderboard with top-3 podium medals plus per-game statistics (`played`, `won`, `score`) across all 10 games.
- **Explorer Authentication & Invite Portal (`AuthModal.jsx`, `InviteModal.jsx`):** Session login flow, avatar picker, and shareable invite links.
- **Role-Based Admin Control Panel (`AdminPanel.jsx`, `AdminRequestModal.jsx`):**
  - Hierarchical clearance (`SUPER_ADMIN`, `ADMIN`, `USER`) with access request review (`Approve` / `Decline`) and direct privilege grants/revokes.
  - Explorer score boosts, user management, live broadcast ticker announcements, 10-arena analytics, and an audit log timeline.
- **Web Audio Synthesizer (`soundFX.js`):** Procedural Web Audio API sound effects (clicks, warp swooshes, dice tumbles, success chimes, error tones) with navbar equalizer indicator.

---

## Tech Stack

- **Frontend:** React 19, Vite 6, Three.js, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React, Canvas Confetti
- **Backend:** Python 3.11+, FastAPI, Uvicorn, Pydantic
- **Persistence:** JSON-backed state store (`backend/multiverse_data.json`, with `/tmp` fallback in ephemeral serverless environments)
- **Deployment:** Vercel (Frontend + Edge API Proxy) & Render (Python FastAPI Web Service)

---

## Project Structure

```text
BrainUP/
├── backend/
│   ├── server.py              # FastAPI backend, game generators, RBAC admin APIs & static fallback
│   ├── multiverse_data.json   # Persisted users, leaderboard, admin requests & audit logs
│   ├── test_levels.py         # Automated verification suite across endpoints and levels 1–100
│   └── requirements.txt       # Python dependencies (fastapi, uvicorn, pydantic)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── games/         # All 10 cognitive arena components
│   │   │   ├── AdminPanel.jsx # RBAC dashboard, approvals, user CRUD, arena analytics & broadcast
│   │   │   ├── ArcadeGrid.jsx # 10-arena category filterable showcase
│   │   │   ├── CubeDice.jsx   # Interactive Three.js 3D Quantum Dice hub
│   │   │   ├── CosmicCanvas.jsx # Fullscreen 3D starfield & hyperspace warp renderer
│   │   │   ├── GameWrapper.jsx  # Unified Cyber HUD with timer, streak, score, hints & level picker
│   │   │   └── ...            # Navbar, LandingHero, Modals (Auth, Scoreboard, Invite, Level, Admin)
│   │   ├── utils/             # Difficulty shuffler (levels.js) & Web Audio synthesizer (soundFX.js)
│   │   ├── App.jsx            # Main view orchestrator & state management
│   │   └── index.css          # Glassmorphism 2.0, cyber HUD frames, 3D card flip & animations
│   ├── package.json           # Frontend scripts & dependencies
│   └── vite.config.js         # Vite + Tailwind v4 configuration & /api dev proxy
├── api/                       # Serverless FastAPI entry mirror
├── render.yaml                # Render Blueprint specification for the Python backend
├── vercel.json                # Vercel build config & production proxy rewrites to Render
├── start.bat                  # Windows unified launcher (build frontend + serve on :8000)
├── start.ps1                  # PowerShell unified launcher (build frontend + serve on :8000)
├── start_dev.bat              # Windows development launcher (FastAPI :8000 + Vite :5173)
└── README.md
```

---

## Prerequisites

- **Node.js** v18+ and **npm**
- **Python** 3.11+ and **pip**

---

## How to Run Locally

### 1. Install Dependencies

**Backend (Python / FastAPI):**
```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# Windows CMD:        .venv\Scripts\activate.bat
# macOS/Linux:        source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

**Frontend (React / Vite):**
```bash
cd frontend
npm install
cd ..
```

---

### 2. Start the Application

#### Option A: Development Mode (Recommended for active coding with Hot Reload)
Run the backend and frontend in two separate terminals:

**Terminal 1 — FastAPI Backend (`http://127.0.0.1:8000`):**
```bash
cd backend
python server.py
```

**Terminal 2 — Vite Dev Server (`http://localhost:5173`):**
*Windows PowerShell:*
```powershell
cd frontend
$env:VITE_API_TARGET="http://127.0.0.1:8000"
npm run dev
```
*macOS / Linux:*
```bash
cd frontend
VITE_API_TARGET=http://127.0.0.1:8000 npm run dev
```
*Windows one-click script:* Double-click `start_dev.bat`.

> Note: If `VITE_API_TARGET` is omitted when running `npm run dev`, Vite proxies `/api` requests directly to the live Render backend (`https://brainup-backend-coxl.onrender.com`).

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

#### Option B: Unified Single-Server Mode (Production Build Served by FastAPI)
Build the frontend bundle (`frontend/dist`) and serve both UI and API from FastAPI on port `8000`:
```bash
cd frontend
npm run build
cd ../backend
python server.py
```
Or simply run `start.bat` (Windows CMD) or `.\start.ps1` (PowerShell).

Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

### 3. Run API & Level Verification Tests
With the backend running locally on port `8000`:
```bash
cd backend
python test_levels.py
```
To test against the live Render deployment directly:
```bash
python backend/test_levels.py https://brainup-backend-coxl.onrender.com
```

---

## Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health`, `/health` | Service health check and status payload |
| `GET` | `/api/user/profile` | Fetch explorer profile, stats, role & announcement |
| `POST` | `/api/auth/google` | Authenticate or register explorer profile |
| `GET` | `/api/leaderboard` | Global sorted explorer leaderboard |
| `POST` | `/api/score/submit` | Submit arena score, streak & update rankings |
| `GET` | `/api/games/sudoku/generate?level=1..100` | Generate 4×4 Sudoku puzzle & solution |
| `GET` | `/api/games/riddles?level=1..100` | Fetch astrophysics / quantum paradox riddle |
| `GET` | `/api/games/logic?level=1..100` | Generate sequence deduction puzzle |
| `GET` | `/api/games/math/batch?level=1..100` | Generate arithmetic problem batch |
| `GET` | `/api/games/treasure-hunt/stage?level=1..100` | Generate directional vector memory sequence |
| `GET` | `/api/games/memory/deck?level=1..100` | Generate shuffled quantum card pair deck |
| `GET` | `/api/games/stroop?level=1..100` | Generate Chromatic Reflex Stroop challenge |
| `GET` | `/api/games/words?level=1..100` | Generate Cosmic Word Weaver anagram |
| `GET` | `/api/games/spatial?level=1..100` | Generate Spatial Matrix rotation target |
| `GET/POST` | `/api/admin/*` | Role-guarded admin overview, approvals, user CRUD, broadcast |
