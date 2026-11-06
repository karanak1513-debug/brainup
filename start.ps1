# BrainUp PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Launching BrainUp - The Multiverse of Intelligence    " -ForegroundColor Magenta
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Building frontend assets..." -ForegroundColor Yellow
Set-Location "$scriptDir\frontend"
npm run build

Write-Host "Starting BrainUp Unified Server on http://localhost:8000..." -ForegroundColor Green
Set-Location "$scriptDir\backend"
python server.py
