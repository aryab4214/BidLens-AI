@echo off
title BidLens AI - Local Development Servers
echo.
echo ============================================================
echo   BIDLENS AI - Starting Full-Stack Local Servers
echo ============================================================
echo.
echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "BidLens Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --port 8000"
timeout /t 3 /nobreak > nul
echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
start "BidLens Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak > nul
echo.
echo ============================================================
echo   Both servers are starting!
echo   Frontend Officer UI: http://localhost:3000
echo   Backend REST API:    http://localhost:8000
echo   API Docs (Swagger):  http://localhost:8000/docs
echo ============================================================
echo.
pause
