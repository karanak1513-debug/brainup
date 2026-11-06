# 🌌 BrainUp — The Multiverse of Intelligence

> An interactive 3D Web Application set in a cosmic Multiverse theme featuring dynamic universe color shifts, an interactive Three.js 3D quantum dice hub, and 6 IQ-enhancing mini-games with 100 levels each.

---

## 🚀 Key Highlights & Features

### 1. Multiverse Space Experience & Dynamic Dimensions
- **Fullscreen 3D Galaxy Canvas:** Built with Three.js rendering thousands of deep stars with depth, cosmic dust clouds, mouse parallax drift, and real-time hyperspace warp streak acceleration.
- **Multiverse Dimension Switcher:** Floating top-right dimension selector toggles universe palettes in real time:
  - 🟣 **Deep Cosmos Violet:** Electric Violet (`#8B5CF6`) & Void Indigo (`#070714`)
  - 🔵 **Cyber Neon:** Electric Cyan (`#00F0FF`) & Neon Pink (`#FF007F`)
  - 🟠 **Solar Flare Orange:** Hyper Amber (`#F59E0B`) & Supernova Orange (`#FF5722`)
  - 🟢 **Matrix Emerald:** Matrix Jade (`#10B981`) & Neon Mint (`#34D399`)
  - 🌸 **Quantum Prism:** Quantum Rose (`#EC4899`) & Celestial Indigo (`#6366F1`)
- **Center Hero Screen:** Glowing typography with text shadow and floating drift:
  > *"WELCOME TO THE WORLD OF INTELLIGENCE"*
- **Primary CTA:** Neon-bordered `[ BEGIN TO ACHIEVE ]` triggering the authentication portal.

---

### 2. Authentication & Hyperspace Warp
- **Frosted Glassmorphism Card:** `backdrop-blur-md` floating card with avatar selector.
- **"Continue with Google":** Official Google branding and icon simulating OAuth 2.0 session handshake.
- **Smooth Hyperspace Warp:** Stars stretch into light-speed streaks with synthesized sub-bass audio sweep transitioning into the Game Hub.

---

### 3. The Interactive 3D Cube / Dice
- **Direct Single-Click Dice Launch:** Single-clicking any side on the 3D dice immediately opens and launches that game with an audio warp transition!
- **Free Orbit Drag:** Click/touch and drag in 3D space with inertia, velocity dampening, and momentum.
- **"Roll / Spin Dice" Button:** Physics-based random tumble animation with decelerating tumbling sound effects landing cleanly on a highlighted face.
- **Hover Pointer Detection:** Raycaster dynamically tracks hover states with interactive pointer cues.

---

### 4. 100-Level Shuffled Challenge System (All 6 Games)
Every game now features **Levels 1 to 100** with an engaging, shuffled progression across 4 difficulty tiers:
- 🟢 **EASY:** Accessible puzzles to calibrate neural reflexes.
- 🟡 **MEDIUM:** Moderate complexity requiring multi-step spatial deduction.
- 🔴 **HARD:** Advanced cognitive challenges under time pressure.
- 🟣 **SUPER HARD:** High-stakes quantum singularity puzzles!
- **Level Selector Modal:** Interactive 1-100 sector grid letting players jump to any level or filter by difficulty.
- **Level Progression:** Victory screen features an **`ADVANCE TO LEVEL X+1`** button scaling all the way to Level 100.
- 💡 **Hint System:** Dedicated **"Use Hint (-10 PTS)"** button with contextual puzzle solutions.
- ⏱️ **Live Scoreboard & Timer:** Real-time points, streak multiplier (1x, 2x, 3x, 4x combo), and elapsed/countdown timer.
- ↩️ **Back to Cube:** Seamless return to the 3D hub preserving aggregate session score.

1. **Face 1: Sudoku Blitz (Matrix Logic)**
   - 4x4 Mini grid with real-time green (correct) / red (conflict) error validation.
   - On-screen dial and keyboard input (1-4, Arrow keys, Backspace).
   - Hint fills in an empty/conflicting cell.
2. **Face 2: Cosmic Riddles (Lateral Thinking)**
   - Scientific, astrophysical, and quantum paradox puzzles.
   - Multi-choice deduction with instant feedback and scientific explanations.
3. **Face 3: Logic & Reasoning (Cognitive Matrix)**
   - Sequence progressions (Fibonacci variants, prime deviations, geometric orbital shifts).
   - Visual sequence glyph cards and deduction principles.
4. **Face 4: Rapid Math Sprint (60-Second Speed Sprint)**
   - Rapid arithmetic against the cosmic clock with combo multiplier counters.
   - Hint eliminates 2 impossible decoy options.
5. **Face 5: Arrow Treasure Hunt (Vector Recall & Spatial Maze)**
   - Directional vector memory sequences (↑, ↓, ←, →).
   - Glowing interactive D-pad + keyboard arrow controls.
   - Unlocks the legendary animated Singularity Chest with particle explosion!
6. **Face 6: Quantum Memory Grid (Entanglement Recall)**
   - 4x4 card grid featuring 8 pairs of cosmic entities (Pulsars, Black Holes, Quasars, Dyson Spheres).
   - Flip tracking, matched pairs count, and hint flash.

---

### 5. Dashboard, Score Hub & Social Features
- **User Profile Bar (Top Navigation):**
  - Displays user avatar, current IQ rank title (e.g. *Celestial Polymath*), and live total score.
- **Scoreboard Modal:**
  - Global Multiverse Leaderboard with rankings, dimension affiliations, and user rank.
  - Performance Breakdown displaying win-rates, total points, and highest streaks per game.
- **Invite Friends Feature (`🚀 Invite Friends`):**
  - Unique shareable referral link with one-click quantum clipboard copy.
  - Pre-filled WhatsApp & X (Twitter) challenge shortcuts.
- **Web Audio API Synthesizer:**
  - Zero external MP3 downloads; 100% reliable low-latency audio blips, warp swooshes, dice roll clicks, and harmonic victory chords.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Three.js, Tailwind CSS v4, Lucide-React, Canvas-Confetti, Web Audio API.
- **Backend:** Python 3.12, FastAPI, Uvicorn, Pydantic.
- **Delivery:** FastAPI static mounting serving the complete optimized bundle on `http://127.0.0.1:8000`.

---

## 📁 Project Structure

```
BrainUP/
├── backend/                  # FastAPI Python backend
│   ├── server.py             # API server & game mechanics
│   ├── multiverse_data.json  # In-memory & persisted game state
│   ├── test_levels.py        # Automated test suite (100 levels)
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React 19 + Three.js frontend
│   ├── src/                  # React components & games
│   ├── package.json          # Node dependencies & scripts
│   └── vite.config.js        # Vite build & proxy config
├── start.bat                 # One-click launcher (Build + Serve on :8000)
├── start_dev.bat             # Dev mode launcher (Vite on :5173 + API on :8000)
├── start.ps1                 # PowerShell launcher
└── .gitignore
```

---

## 💻 Running the Application

### Option A: One-Click Launch (Production Mode)
Double-click `start.bat` or in PowerShell run:
```powershell
.\start.ps1
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser!

### Option B: Development Mode (Hot Reloading)
Double-click `start_dev.bat` or run in separate terminals:
```powershell
# Terminal 1: Backend
cd backend
python server.py

# Terminal 2: Frontend
cd frontend
npm run dev
```
Visit **[http://localhost:5173](http://localhost:5173)**.

### Option C: Run Automated Tests
```powershell
cd backend
python test_levels.py
```
