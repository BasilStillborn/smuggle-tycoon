@echo off
title BeamNG Mod Installer
color 0C
echo ========================================
echo   BeamNG Mod Installer
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0Install-BeamNGMods.ps1"

echo.
pause
