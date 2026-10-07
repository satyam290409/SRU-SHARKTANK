@echo off
title SRU Mini Shark Tank - Server Runner
cd /d "%~dp0"
echo ========================================================
echo   Starting SRU Mini Shark Tank Platform...
echo ========================================================
echo.
echo Launching Backend (Port 3001) and Frontend (Port 5173)...
echo.
npm run dev
pause
