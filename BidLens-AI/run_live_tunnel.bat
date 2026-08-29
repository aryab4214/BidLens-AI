@echo off
TITLE BidLens AI - Live Public Host Server
echo ======================================================================
echo           BIDLENS AI - LIVE PUBLIC HOST & SHARING LAUNCHER
echo ======================================================================
echo.
echo Starting FastAPI Backend (Port 8000)...
start "BidLens-Backend" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo Starting Next.js Production Frontend (Port 3000)...
start "BidLens-Frontend" cmd /k "cd frontend && npm start"

echo Waiting 3 seconds for frontend initialization...
timeout /t 3 /nobreak >nul

echo.
echo ======================================================================
echo  Generating Live Public HTTPS URL (Accessible worldwide on any device)
echo ======================================================================
echo.
echo Your public link will appear below. Share this link with your friends:
echo.
npx localtunnel --port 3000
pause
