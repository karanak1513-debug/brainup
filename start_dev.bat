@echo off
echo ========================================================
echo   Launching BrainUp in Development Mode
echo   Backend: http://127.0.0.1:8000
echo   Frontend: http://localhost:5173
echo ========================================================
cd /d "%~dp0"

start "BrainUp Backend" cmd /k "cd backend && python server.py"
start "BrainUp Frontend" cmd /k "cd frontend && npm run dev"
