@echo off
echo ========================================================
echo   Launching BrainUp in Development Mode
echo   Backend:  http://127.0.0.1:8000
echo   Frontend: http://localhost:5173
echo ========================================================
cd /d "%~dp0"

if exist backend\.venv\Scripts\python.exe (
    start "BrainUp Backend" cmd /k "cd backend && .venv\Scripts\python.exe server.py"
) else (
    start "BrainUp Backend" cmd /k "cd backend && python server.py"
)

start "BrainUp Frontend" cmd /k "cd frontend && set VITE_API_TARGET=http://127.0.0.1:8000 && npm run dev"
