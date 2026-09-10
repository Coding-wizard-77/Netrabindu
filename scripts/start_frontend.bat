@echo off
title NetraBindu Frontend Command Center (Port 3000)
echo ==============================================================
echo Starting NetraBindu React Command Center and GIS Platform...
echo URL: http://localhost:3000
echo ==============================================================
cd /d "%~dp0..\frontend"
npm run dev -- --port 3000
pause
