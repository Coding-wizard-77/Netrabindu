@echo off
title NetraBindu Complete Platform Launcher
echo ======================================================================
echo Launching NetraBindu 3-Tier Synchronized Platform
echo 1. Backend Control Plane (FastAPI, Port 8000)
echo 2. Frontend Command Center (React, Port 3000)
echo 3. Edge AI Vision Inference Engine (Worker)
echo ======================================================================

start "NetraBindu Backend API" cmd /k "cd /d %~dp0 && call start_backend.bat"
timeout /t 2 /nobreak >nul

start "NetraBindu Frontend UI" cmd /k "cd /d %~dp0 && call start_frontend.bat"
timeout /t 2 /nobreak >nul

start "NetraBindu Edge AI Engine" cmd /k "cd /d %~dp0 && call start_ai_engine.bat"

echo.
echo All 3 tiers have been launched in separate tactical consoles.
echo Open your browser at http://localhost:3000
echo.
pause
