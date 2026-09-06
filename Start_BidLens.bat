@echo off
title BidLens AI - Full-Stack Launcher
echo.
echo ============================================================
echo   BIDLENS AI - Launching Full-Stack Platform
echo   Smart India Hackathon 2026 - Team Hexagon (SIH26009)
echo ============================================================
echo.

set "ROOT_DIR=%~dp0"
if exist "%ROOT_DIR%BidLens-AI\backend" (
    set "BACKEND_DIR=%ROOT_DIR%BidLens-AI\backend"
    set "FRONTEND_DIR=%ROOT_DIR%BidLens-AI\frontend"
) else (
    set "BACKEND_DIR=%ROOT_DIR%backend"
    set "FRONTEND_DIR=%ROOT_DIR%frontend"
)

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "BidLens Backend" cmd /k "cd /d %BACKEND_DIR% && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"
timeout /t 3 /nobreak > nul

echo [2/2] Launching Next.js Frontend on http://localhost:3000 ...
start "BidLens Frontend" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ============================================================
echo   Both services are starting!
echo.
echo   * Officer UI:       http://localhost:3000
echo   * Backend REST API: http://127.0.0.1:8000
echo   * Swagger Docs:     http://127.0.0.1:8000/docs
echo   * Edge Health:      http://127.0.0.1:8000/system/health
echo ============================================================
echo.
pause
