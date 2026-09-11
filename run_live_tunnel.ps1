# BidLens AI - Live Public Host Server (PowerShell)
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          BIDLENS AI - LIVE PUBLIC HOST & SHARING LAUNCHER            " -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting FastAPI Backend (Port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir\backend'; python -m uvicorn main:app --host 127.0.0.1 --port 8000"

Start-Sleep -Seconds 3

Write-Host "Starting Next.js Frontend (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir\frontend'; npm start"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Generating Live Public HTTPS Link (Accessible worldwide on any browser)" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Share the generated URL below with your friends or panel:" -ForegroundColor White
Write-Host ""

npx localtunnel --port 3000
