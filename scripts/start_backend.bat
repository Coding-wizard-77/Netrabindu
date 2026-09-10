@echo off
title NetraBindu Backend API Control Plane (Port 8000)
echo ==============================================================
echo Starting NetraBindu FastAPI Backend Control Plane...
echo Port: 8000 - WebSocket: ws://localhost:8000/ws/alerts
echo ==============================================================
cd /d "%~dp0.."
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir backend
pause
