@echo off
title NetraBindu Edge AI Sentinel Worker
echo ==============================================================
echo Starting NetraBindu Edge AI Vision and Detection Worker...
echo Node: edge-sentinel-sg-01
echo ==============================================================
cd /d "%~dp0.."
set PYTHONPATH=%CD%
python -m ai_models.worker
pause
