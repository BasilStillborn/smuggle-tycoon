@echo off
title BeamNG Mod Auto-Install Watcher
color 0A
echo ========================================
echo   BeamNG Mod Auto-Install Watcher
echo ========================================
echo.
echo This will watch your Downloads folder and
echo automatically move new ZIP mods to BeamNG.
echo.
echo Keep this window open while you download mods.
echo Press Ctrl+C to stop.
echo.
echo Starting...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0Watch-DownloadsForMods.ps1"

pause
