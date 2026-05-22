@echo off
color 0B
echo ========================================
echo   Installed BeamNG Mods
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0List-InstalledMods.ps1"

echo.
pause
