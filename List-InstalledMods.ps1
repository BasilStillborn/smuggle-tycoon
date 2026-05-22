# List Installed BeamNG Mods
$beamngModsPath = "$env:LOCALAPPDATA\BeamNG\BeamNG.drive\current\mods"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installed BeamNG Mods" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $beamngModsPath)) {
    Write-Host "Mods folder not found: $beamngModsPath" -ForegroundColor Red
    exit 1
}

$mods = Get-ChildItem -Path $beamngModsPath -Filter "*.zip"

if ($mods.Count -eq 0) {
    Write-Host "No ZIP mods installed." -ForegroundColor Yellow
} else {
    $totalSize = ($mods | Measure-Object -Property Length -Sum).Sum
    Write-Host "Found $($mods.Count) mod(s) - Total: $([math]::Round($totalSize / 1MB, 2)) MB" -ForegroundColor Green
    Write-Host ""
    
    foreach ($mod in $mods) {
        $sizeMB = [math]::Round($mod.Length / 1MB, 2)
        $age = ((Get-Date) - $mod.LastWriteTime).Days
        Write-Host "  $($mod.Name)" -ForegroundColor White
        Write-Host "    Size: $sizeMB MB | Age: $age days" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "Location: $beamngModsPath" -ForegroundColor DarkGray
