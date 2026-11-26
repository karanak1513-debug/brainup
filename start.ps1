# BrainUp PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Launching BrainUp - The Multiverse of Intelligence    " -ForegroundColor Magenta
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "[1/2] Building frontend assets..." -ForegroundColor Yellow
Set-Location "$scriptDir\frontend"
if (-not (Test-Path "node_modules")) {
    npm install
}
npm run build

Write-Host "[2/2] Starting BrainUp Unified Server on http://localhost:8000..." -ForegroundColor Green
Set-Location "$scriptDir\backend"
if (Test-Path ".venv\Scripts\python.exe") {
    & ".venv\Scripts\python.exe" server.py
} else {
    python server.py
}
