@echo off
title NetraBindu Edge AI Sentinel Worker
echo ==============================================================
echo Starting NetraBindu Edge AI Vision & Detection Worker...
echo Node: edge-sentinel-sg-01
echo ==============================================================
cd ..
set PYTHONPATH=.
python -m ai_models.worker
pause
