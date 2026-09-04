@echo off
title NetraBindu Frontend Command Center (Port 3000)
echo ==============================================================
echo Starting NetraBindu React Command Center & GIS Platform...
echo URL: http://localhost:3000
echo ==============================================================
cd ../frontend
npm run dev -- --port 3000
pause
