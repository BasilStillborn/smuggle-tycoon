# BeamNG Drive Mod Installer Script
# Automatically moves downloaded mods to your BeamNG mods folder

$beamngModsPath = "$env:LOCALAPPDATA\BeamNG\BeamNG.drive\current\mods"
$downloadsPath = "$env:USERPROFILE\Downloads"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BeamNG Drive Mod Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "BeamNG Mods Folder: $beamngModsPath" -ForegroundColor DarkGray
Write-Host "Downloads Folder: $downloadsPath" -ForegroundColor DarkGray
Write-Host ""

$modFiles = Get-ChildItem -Path $downloadsPath -Filter "*.zip" | Where-Object { 
    $_.LastWriteTime -gt (Get-Date).AddDays(-7) 
}

if ($modFiles.Count -eq 0) {
    Write-Host "No recent ZIP files found in Downloads." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual Instructions:" -ForegroundColor White
    Write-Host "1. Download mods from ModLand or other sites" -ForegroundColor White
    Write-Host "2. Place ZIP files in: $beamngModsPath" -ForegroundColor White
    Write-Host "3. Do NOT extract the ZIP files" -ForegroundColor Yellow
    Write-Host "4. Launch BeamNG and activate mods in the Mod Manager" -ForegroundColor White
    exit 0
}

Write-Host "Found $($modFiles.Count) recent ZIP file(s) in Downloads:" -ForegroundColor Green
Write-Host ""

$modsToInstall = @()
foreach ($file in $modFiles) {
    $sizeMB = [math]::Round($file.Length / 1MB, 2)
    Write-Host "  [$($modsToInstall.Count + 1)] $($file.Name) ($sizeMB MB)" -ForegroundColor White
    
    $response = Read-Host "  Install this mod? (Y/n/A=All/Q=Quit)"
    if ($response -eq 'Q' -or $response -eq 'q') {
        Write-Host ""
        Write-Host "Quitting..." -ForegroundColor Yellow
        exit 0
    }
    if ($response -eq 'A' -or $response -eq 'a') {
        $modsToInstall = $modFiles
        break
    }
    if ($response -ne 'N' -and $response -ne 'n') {
        $modsToInstall += $file
    }
}

if ($modsToInstall.Count -eq 0) {
    Write-Host ""
    Write-Host "No mods selected for installation." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Installing $($modsToInstall.Count) mod(s)..." -ForegroundColor Cyan
Write-Host ""

$installedCount = 0
foreach ($mod in $modsToInstall) {
    $destPath = Join-Path $beamngModsPath $mod.Name
    
    if (Test-Path $destPath) {
        $response = Read-Host "  $($mod.Name) already exists. Overwrite? (y/N)"
        if ($response -ne 'Y' -and $response -ne 'y') {
            Write-Host "    Skipped" -ForegroundColor Yellow
            continue
        }
    }
    
    try {
        Move-Item -Path $mod.FullName -Destination $destPath -Force
        Write-Host "  OK: $($mod.Name)" -ForegroundColor Green
        $installedCount++
    }
    catch {
        try {
            Copy-Item -Path $mod.FullName -Destination $destPath -Force
            Write-Host "  COPIED: $($mod.Name) (copy left in Downloads)" -ForegroundColor Yellow
            $installedCount++
        }
        catch {
            Write-Host "  FAILED: $($mod.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "  Installed: $installedCount mod(s)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. Launch BeamNG.drive" -ForegroundColor White
Write-Host "2. Open the in-game Mod Manager" -ForegroundColor White
Write-Host "3. Enable your new mods" -ForegroundColor White
Write-Host ""
Write-Host "Mods Location: $beamngModsPath" -ForegroundColor DarkGray
