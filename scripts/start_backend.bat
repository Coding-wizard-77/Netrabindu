@echo off
title NetraBindu Backend API Control Plane (Port 8000)
echo ==============================================================
echo Starting NetraBindu FastAPI Backend Control Plane...
echo Port: 8000 | WebSocket: ws://localhost:8000/ws/alerts
echo ==============================================================
cd ..
set PYTHONPATH=.
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
