@echo off
echo ========================================================
echo   Launching BrainUp - The Multiverse of Intelligence
echo ========================================================
cd /d "%~dp0"

echo [1/2] Building frontend assets...
cd frontend
call npm run build
cd ..

echo [2/2] Starting BrainUp Unified Server...
cd backend
python server.py
pause
