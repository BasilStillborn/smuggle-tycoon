# Open BeamNG Mods Folder
$beamngModsPath = "$env:LOCALAPPDATA\BeamNG\BeamNG.drive\current\mods"

if (Test-Path $beamngModsPath) {
    explorer $beamngModsPath
    Write-Host "Opened: $beamngModsPath" -ForegroundColor Green
} else {
    Write-Host "Mods folder not found at: $beamngModsPath" -ForegroundColor Red
    Write-Host "Launch BeamNG first to create the folder structure." -ForegroundColor Yellow
}
