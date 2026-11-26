@echo off
echo ========================================================
echo   Launching BrainUp - The Multiverse of Intelligence
echo ========================================================
cd /d "%~dp0"

echo [1/2] Installing and building frontend assets...
cd frontend
if not exist node_modules call npm install
call npm run build
cd ..

echo [2/2] Starting BrainUp Unified Server on http://localhost:8000...
if exist backend\.venv\Scripts\python.exe (
    cd backend
    .venv\Scripts\python.exe server.py
) else (
    cd backend
    python server.py
)
pause
