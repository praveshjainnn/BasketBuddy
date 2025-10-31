@echo off
echo ============================================================
echo   BASKET BUDDY 2.0 - STARTUP HELPER
echo ============================================================
echo.
echo This will help you start both backend and frontend servers.
echo.
echo INSTRUCTIONS:
echo 1. This window will start the BACKEND (Flask API)
echo 2. A new window will open for the FRONTEND (Next.js)
echo 3. Keep BOTH windows open while using the app
echo.
echo ============================================================
echo.
pause

echo Starting Backend Server...
echo.
cd backend
start "Basket Buddy - Backend" cmd /k "python app.py"

echo.
echo Backend started in new window!
echo.
echo Waiting 3 seconds before starting frontend...
timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server...
echo.
cd ..
start "Basket Buddy - Frontend" cmd /k "npm run dev"

echo.
echo ============================================================
echo   BOTH SERVERS STARTING!
echo ============================================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Two new windows have opened:
echo   1. Backend (Flask) - Keep this running
echo   2. Frontend (Next.js) - Keep this running
echo.
echo Once both show "Running" or "Ready":
echo   Open your browser to: http://localhost:3000
echo   Click the "Admin" tab to access the dashboard
echo.
echo To stop: Close both terminal windows or press Ctrl+C
echo ============================================================
echo.
pause
